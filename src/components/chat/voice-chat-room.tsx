"use client";

import type {
  AIAudioChunkResponseDto,
  AITextChunkResponseDto,
  ChatErrorResponseDto,
  ClientToServerEvents,
  EmotionStreamResponseDto,
  ServerToClientEvents,
  TTSAudioAlignment,
  VoiceFeatures,
} from "@/api/chat.types";
import MotionBox from "@/components/global/motion-box";
import { type CurrentVisemeTiming, useChatStore } from "@/store/chat.store";
import {
  getMouthShapeFromChar,
  getPunctuationHoldMs,
  type MouthShape,
} from "@/utils/mouth-shape";
import { showError, showInfo, showSuccess } from "@/utils/toast";
import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

type ChatSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

type QueuedAudioChunk = {
  chunkBase64: string;
  alignment?: TTSAudioAlignment;
};

type PendingInitialAudioChunk = {
  data: Blob;
  mimeType: string;
};

type VoiceChatRoomProps = {
  roomId: number;
  accessToken: string;
  socketUrl: string;
};

const SILENCE_THRESHOLD = 0.025;
const SILENCE_END_MS = 3000;
const CHUNK_INTERVAL_MS = 1000;
const RECORDER_RESTART_DELAY_MS = 20;
const TEXT_REVEAL_CHARS_PER_SECOND = 18;
const TEXT_TAIL_FLUSH_CHARS_PER_SECOND = 40;
const TEXT_REVEAL_TICK_MS = 33;
const FALLBACK_SPEECH_DELAY_MS = 4000;
const DEFAULT_AUDIO_VOLUME = 0.5;
const RECORDER_MIME_TYPE_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
];

const getSupportedRecorderMimeType = () => {
  return (
    RECORDER_MIME_TYPE_CANDIDATES.find((mimeType) =>
      MediaRecorder.isTypeSupported(mimeType),
    ) ?? ""
  );
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("음성 chunk 변환에 실패했습니다."));
        return;
      }

      const [, base64] = reader.result.split(",");
      resolve(base64 ?? "");
    };
    reader.onerror = () => reject(new Error("음성 chunk를 읽을 수 없습니다."));
    reader.readAsDataURL(blob);
  });
};

const base64ToBlob = (base64: string, type: string) => {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type });
};

const getEnergy = (analyser: AnalyserNode, buffer: Uint8Array<ArrayBuffer>) => {
  analyser.getByteTimeDomainData(buffer);

  let sum = 0;
  for (const value of buffer) {
    const normalized = (value - 128) / 128;
    sum += normalized * normalized;
  }

  return Math.sqrt(sum / buffer.length);
};

const getVoiceFeatures = (energy: number): VoiceFeatures => ({
  pitch: 0.5,
  energy: Number(Math.min(1, energy * 4).toFixed(2)),
  speed: 1,
});

export default function VoiceChatRoom({
  roomId,
  accessToken,
  socketUrl,
}: VoiceChatRoomProps) {
  const socketRef = useRef<ChatSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const analyserBufferRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const silenceStartedAtRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const sequenceRef = useRef(0);
  const hasSentChunkRef = useRef(false);
  const hasDetectedVoiceRef = useRef(false);
  const isEndingRef = useRef(false);
  const hasEndedCurrentUtteranceRef = useRef(false);
  const isManualFlushRef = useRef(false);
  const shouldFinishAfterFlushRef = useRef(false);
  const flushTimeoutRef = useRef<number | null>(null);
  const recorderRestartTimeoutRef = useRef<number | null>(null);
  const activeRecorderSessionRef = useRef(0);
  const pendingInitialAudioChunkRef =
    useRef<PendingInitialAudioChunk | null>(null);
  const audioQueueRef = useRef<Map<number, QueuedAudioChunk>>(new Map());
  const nextAudioSequenceRef = useRef(0);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingAudioRef = useRef(false);
  const serverAudioCompletedRef = useRef(false);
  const receivedServerAudioRef = useRef(false);
  const fallbackSpeechTimerRef = useRef<number | null>(null);
  const pendingTextRef = useRef("");
  const revealedTextLengthRef = useRef(0);
  const textStreamCompletedRef = useRef(false);
  const pendingEmotionRef = useRef<EmotionStreamResponseDto | null>(null);
  const textRevealTimerRef = useRef<number | null>(null);
  const currentRevealChunkStartLengthRef = useRef(0);
  const currentRevealChunkStartedAtRef = useRef(0);
  const canRevealResponseRef = useRef(false);
  const responseSessionRef = useRef(0);
  const punctuationHoldUntilRef = useRef<number | null>(null);
  const audioVolumeRef = useRef(DEFAULT_AUDIO_VOLUME);
  const [audioVolume, setAudioVolume] = useState(DEFAULT_AUDIO_VOLUME);
  const [isVoiceActive, setVoiceActive] = useState(false);

  const {
    isRecording,
    isSpeaking,
    responsePhase,
    currentMouthShape,
    currentVisemeTiming,
    streamingMessage,
    emotion,
    resetResponse,
    setConnected,
    setEmotion,
    setRecording,
    setResponsePhase,
    setRoomJoined,
    setSpeaking,
    setCurrentMouthShape,
    setCurrentVisemeTiming,
    setStreamingMessage,
  } = useChatStore();

  const stopTextReveal = useCallback(() => {
    if (textRevealTimerRef.current !== null) {
      window.clearInterval(textRevealTimerRef.current);
      textRevealTimerRef.current = null;
    }
  }, []);

  const handleAudioVolumeChange = useCallback((volume: number) => {
    const nextVolume = Math.min(1, Math.max(0, volume));

    audioVolumeRef.current = nextVolume;
    setAudioVolume(nextVolume);

    if (audioElementRef.current) {
      audioElementRef.current.volume = nextVolume;
    }
  }, []);

  const resetResponseBuffers = useCallback(() => {
    responseSessionRef.current += 1;
    canRevealResponseRef.current = false;
    punctuationHoldUntilRef.current = null;
    stopTextReveal();
    pendingTextRef.current = "";
    revealedTextLengthRef.current = 0;
    textStreamCompletedRef.current = false;
    pendingEmotionRef.current = null;
    currentRevealChunkStartLengthRef.current = 0;
    currentRevealChunkStartedAtRef.current = 0;
    setCurrentMouthShape(0);
    setCurrentVisemeTiming(null);
    setStreamingMessage("");
    setEmotion(null);
  }, [
    setCurrentMouthShape,
    setCurrentVisemeTiming,
    setEmotion,
    setStreamingMessage,
    stopTextReveal,
  ]);

  const revealTextToLength = useCallback(
    (targetLength: number) => {
      if (!canRevealResponseRef.current) {
        return;
      }

      const nextLength = Math.min(
        pendingTextRef.current.length,
        Math.max(revealedTextLengthRef.current, targetLength),
      );

      if (nextLength === revealedTextLengthRef.current) {
        return;
      }

      const now = Date.now();

      if (
        punctuationHoldUntilRef.current !== null &&
        now < punctuationHoldUntilRef.current
      ) {
        setCurrentMouthShape(0);
        return;
      }

      punctuationHoldUntilRef.current = null;

      let revealedLength = revealedTextLengthRef.current;
      let mouthShape: MouthShape = 0;

      while (revealedLength < nextLength) {
        const nextChar = pendingTextRef.current.charAt(revealedLength);
        const holdMs = getPunctuationHoldMs(nextChar);

        revealedLength += 1;
        mouthShape = getMouthShapeFromChar(nextChar);

        if (holdMs > 0) {
          punctuationHoldUntilRef.current = now + holdMs;
          break;
        }
      }

      revealedTextLengthRef.current = revealedLength;
      setCurrentMouthShape(mouthShape);
      setStreamingMessage(pendingTextRef.current.slice(0, revealedLength));
    },
    [setCurrentMouthShape, setStreamingMessage],
  );

  const applyPendingEmotion = useCallback(() => {
    if (pendingEmotionRef.current) {
      setEmotion(pendingEmotionRef.current);
    }
  }, [setEmotion]);

  const getActiveVisemeTiming = useCallback(
    (
      alignment: TTSAudioAlignment | undefined,
      currentTimeMs: number,
    ): CurrentVisemeTiming | null => {
      if (!alignment?.visemes.length) {
        return null;
      }

      const activeViseme = alignment.visemes.find(
        (viseme) =>
          currentTimeMs >= viseme.startMs && currentTimeMs < viseme.endMs,
      );
      const resolvedViseme = activeViseme ?? alignment.visemes.at(-1);

      if (!resolvedViseme) {
        return null;
      }

      return {
        viseme: resolvedViseme.viseme,
        startMs: resolvedViseme.startMs,
        endMs: resolvedViseme.endMs,
        currentMs: currentTimeMs,
      };
    },
    [],
  );

  const startAudioTextReveal = useCallback(
    (
      audioElement: HTMLAudioElement,
      alignment?: TTSAudioAlignment,
    ) => {
      stopTextReveal();
      currentRevealChunkStartLengthRef.current = revealedTextLengthRef.current;
      currentRevealChunkStartedAtRef.current = Date.now();

      textRevealTimerRef.current = window.setInterval(() => {
        const elapsedSeconds = Math.max(
          0,
          (Date.now() - currentRevealChunkStartedAtRef.current) / 1000,
        );
        const duration =
          Number.isFinite(audioElement.duration) && audioElement.duration > 0
            ? audioElement.duration
            : elapsedSeconds;
        const revealBudget = Math.max(
          1,
          Math.floor(duration * TEXT_REVEAL_CHARS_PER_SECOND),
        );
        const playbackRatio =
          Number.isFinite(audioElement.duration) && audioElement.duration > 0
            ? Math.min(1, audioElement.currentTime / audioElement.duration)
            : 1;
        const elapsedBudget = Math.floor(
          elapsedSeconds * TEXT_REVEAL_CHARS_PER_SECOND,
        );
        const targetLength =
          currentRevealChunkStartLengthRef.current +
          Math.max(Math.floor(revealBudget * playbackRatio), elapsedBudget);

        revealTextToLength(targetLength);

        const activeVisemeTiming = getActiveVisemeTiming(
          alignment,
          audioElement.currentTime * 1000,
        );

        if (activeVisemeTiming !== null) {
          setCurrentMouthShape(activeVisemeTiming.viseme);
          setCurrentVisemeTiming(activeVisemeTiming);
        } else {
          setCurrentVisemeTiming(null);
        }
      }, TEXT_REVEAL_TICK_MS);
    },
    [
      getActiveVisemeTiming,
      revealTextToLength,
      setCurrentMouthShape,
      setCurrentVisemeTiming,
      stopTextReveal,
    ],
  );

  const flushRemainingText = useCallback(
    (onDone?: () => void) => {
      stopTextReveal();

      if (revealedTextLengthRef.current >= pendingTextRef.current.length) {
        onDone?.();
        return;
      }

      textRevealTimerRef.current = window.setInterval(() => {
        const nextLength =
          revealedTextLengthRef.current +
          Math.max(1, Math.ceil(TEXT_TAIL_FLUSH_CHARS_PER_SECOND / 30));
        revealTextToLength(nextLength);

        if (revealedTextLengthRef.current >= pendingTextRef.current.length) {
          stopTextReveal();
          onDone?.();
        }
      }, TEXT_REVEAL_TICK_MS);
    },
    [revealTextToLength, stopTextReveal],
  );

  const stopCurrentAudio = useCallback(() => {
    responseSessionRef.current += 1;
    canRevealResponseRef.current = false;
    punctuationHoldUntilRef.current = null;
    stopTextReveal();

    if (fallbackSpeechTimerRef.current !== null) {
      window.clearTimeout(fallbackSpeechTimerRef.current);
      fallbackSpeechTimerRef.current = null;
    }

    window.speechSynthesis.cancel();

    const audioElement = audioElementRef.current;
    if (audioElement) {
      audioElement.pause();
      audioElement.src = "";
    }

    audioQueueRef.current.clear();
    nextAudioSequenceRef.current = 0;
    isPlayingAudioRef.current = false;
    serverAudioCompletedRef.current = false;
    receivedServerAudioRef.current = false;
    setCurrentMouthShape(0);
    setCurrentVisemeTiming(null);
    setSpeaking(false);
  }, [
    setCurrentMouthShape,
    setCurrentVisemeTiming,
    setSpeaking,
    stopTextReveal,
  ]);

  const playNextAudioChunk = useCallback(() => {
    if (isPlayingAudioRef.current) {
      return;
    }

    const sequence = nextAudioSequenceRef.current;
    const queuedAudioChunk = audioQueueRef.current.get(sequence);

    if (!queuedAudioChunk) {
      if (serverAudioCompletedRef.current && audioQueueRef.current.size === 0) {
        flushRemainingText(() => {
          canRevealResponseRef.current = false;
          setCurrentMouthShape(0);
          setCurrentVisemeTiming(null);
          setSpeaking(false);
          setResponsePhase("completed");
        });
      }
      return;
    }

    audioQueueRef.current.delete(sequence);
    nextAudioSequenceRef.current = sequence + 1;

    const audioElement = audioElementRef.current ?? new Audio();
    const responseSession = responseSessionRef.current;
    audioElementRef.current = audioElement;
    audioElement.volume = audioVolumeRef.current;
    audioElement.src = URL.createObjectURL(
      base64ToBlob(queuedAudioChunk.chunkBase64, "audio/mpeg"),
    );
    isPlayingAudioRef.current = true;

    const handleEnded = () => {
      audioElement.removeEventListener("ended", handleEnded);
      stopTextReveal();
      URL.revokeObjectURL(audioElement.src);

      if (responseSession !== responseSessionRef.current) {
        return;
      }

      isPlayingAudioRef.current = false;
      setCurrentMouthShape(0);
      setCurrentVisemeTiming(null);
      playNextAudioChunk();
    };

    audioElement.addEventListener("ended", handleEnded);
    void audioElement
      .play()
      .then(() => {
        if (responseSession !== responseSessionRef.current) {
          return;
        }

        canRevealResponseRef.current = true;
        applyPendingEmotion();
        setSpeaking(true);
        setResponsePhase("speaking");
        startAudioTextReveal(audioElement, queuedAudioChunk.alignment);
      })
      .catch(() => {
        audioElement.removeEventListener("ended", handleEnded);
        stopTextReveal();
        canRevealResponseRef.current = false;
        isPlayingAudioRef.current = false;
        setCurrentVisemeTiming(null);
        setSpeaking(false);
        setResponsePhase("error");
        showError("TTS 재생에 실패했습니다.");
      });
  }, [
    applyPendingEmotion,
    flushRemainingText,
    setCurrentMouthShape,
    setCurrentVisemeTiming,
    setResponsePhase,
    setSpeaking,
    startAudioTextReveal,
    stopTextReveal,
  ]);

  const playFallbackSpeech = useCallback(
    (text: string) => {
      const speechText = text.trim();

      if (!speechText || receivedServerAudioRef.current) {
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.lang = "ko-KR";
      utterance.volume = audioVolumeRef.current;
      const responseSession = responseSessionRef.current;
      utterance.onstart = () => {
        if (responseSession !== responseSessionRef.current) {
          return;
        }

        canRevealResponseRef.current = true;
        applyPendingEmotion();
        setSpeaking(true);
        setResponsePhase("speaking");
        stopTextReveal();
        textRevealTimerRef.current = window.setInterval(() => {
          revealTextToLength(
            revealedTextLengthRef.current +
              Math.max(1, Math.ceil(TEXT_REVEAL_CHARS_PER_SECOND / 30)),
          );
        }, TEXT_REVEAL_TICK_MS);
      };
      utterance.onend = () => {
        if (responseSession !== responseSessionRef.current) {
          return;
        }

        flushRemainingText(() => {
          canRevealResponseRef.current = false;
          setCurrentMouthShape(0);
          setCurrentVisemeTiming(null);
          setSpeaking(false);
          setResponsePhase("completed");
        });
      };
      utterance.onerror = () => {
        if (responseSession !== responseSessionRef.current) {
          return;
        }

        canRevealResponseRef.current = false;
        stopTextReveal();
        setCurrentMouthShape(0);
        setCurrentVisemeTiming(null);
        setSpeaking(false);
        setResponsePhase("error");
      };
      window.speechSynthesis.speak(utterance);
    },
    [
      applyPendingEmotion,
      flushRemainingText,
      revealTextToLength,
      setCurrentMouthShape,
      setCurrentVisemeTiming,
      setResponsePhase,
      setSpeaking,
      stopTextReveal,
    ],
  );

  const startMediaRecorder = (stream: MediaStream) => {
    const recorderMimeType = getSupportedRecorderMimeType();
    const recorder = recorderMimeType
      ? new MediaRecorder(stream, { mimeType: recorderMimeType })
      : new MediaRecorder(stream);
    const recorderSession = activeRecorderSessionRef.current + 1;

    activeRecorderSessionRef.current = recorderSession;
    mediaRecorderRef.current = recorder;
    pendingInitialAudioChunkRef.current = null;

    const emitAudioChunk = (
      chunkBase64: string,
      mimeType: string,
      energy: number,
    ) => {
      const sequence = sequenceRef.current;
      sequenceRef.current += 1;
      hasSentChunkRef.current = true;

      socketRef.current?.emit("chat:audio:chunk", {
        roomId,
        sequence,
        chunkBase64,
        mimeType,
        voiceFeatures: getVoiceFeatures(energy),
      });
    };

    recorder.ondataavailable = (event) => {
      if (
        recorderSession !== activeRecorderSessionRef.current ||
        !event.data.size ||
        !socketRef.current?.connected
      ) {
        return;
      }

      const energy =
        analyserRef.current && analyserBufferRef.current
          ? getEnergy(analyserRef.current, analyserBufferRef.current)
          : 0;
      const chunkMimeType =
        recorder.mimeType || recorderMimeType || event.data.type || "audio/webm";
      setVoiceActive(energy >= SILENCE_THRESHOLD);

      if (
        energy < SILENCE_THRESHOLD &&
        !hasSentChunkRef.current &&
        !isManualFlushRef.current
      ) {
        pendingInitialAudioChunkRef.current ??= {
          data: event.data,
          mimeType: chunkMimeType,
        };
        return;
      }

      if (energy >= SILENCE_THRESHOLD) {
        hasDetectedVoiceRef.current = true;
      }

      if (hasEndedCurrentUtteranceRef.current) {
        if (energy < SILENCE_THRESHOLD) {
          setVoiceActive(false);
          return;
        }

        stopCurrentAudio();
        resetResponse();
        resetResponseBuffers();
        hasEndedCurrentUtteranceRef.current = false;
        hasSentChunkRef.current = false;
        pendingInitialAudioChunkRef.current = null;
        hasDetectedVoiceRef.current = true;
        sequenceRef.current = 0;
      }

      void blobToBase64(event.data)
        .then(async (chunkBase64) => {
          if (
            !chunkBase64 ||
            recorderSession !== activeRecorderSessionRef.current
          ) {
            return;
          }

          const pendingInitialAudioChunk = pendingInitialAudioChunkRef.current;
          pendingInitialAudioChunkRef.current = null;

          if (pendingInitialAudioChunk && !hasSentChunkRef.current) {
            const initialChunkBase64 = await blobToBase64(
              pendingInitialAudioChunk.data,
            );

            if (
              initialChunkBase64 &&
              recorderSession === activeRecorderSessionRef.current
            ) {
              emitAudioChunk(
                initialChunkBase64,
                pendingInitialAudioChunk.mimeType,
                0,
              );
            }
          }

          emitAudioChunk(chunkBase64, chunkMimeType, energy);
          isManualFlushRef.current = false;

          if (shouldFinishAfterFlushRef.current) {
            finishCurrentUtterance(true);
          }
        })
        .catch(() => showError("음성 전송에 실패했습니다."));
    };

    recorder.onerror = () => showError("녹음에 실패했습니다.");
    recorder.start(CHUNK_INTERVAL_MS);
  };

  const restartMediaRecorderForNextUtterance = () => {
    const stream = mediaStreamRef.current;
    const recorder = mediaRecorderRef.current;

    if (!stream || !stream.active) {
      return;
    }

    if (recorderRestartTimeoutRef.current !== null) {
      window.clearTimeout(recorderRestartTimeoutRef.current);
      recorderRestartTimeoutRef.current = null;
    }

    activeRecorderSessionRef.current += 1;
    pendingInitialAudioChunkRef.current = null;
    mediaRecorderRef.current = null;
    setRecording(false);

    if (recorder && recorder.state !== "inactive") {
      recorder.ondataavailable = null;
      recorder.onerror = null;
      recorder.stop();
    }

    recorderRestartTimeoutRef.current = window.setTimeout(() => {
      recorderRestartTimeoutRef.current = null;

      if (!mediaStreamRef.current || !mediaStreamRef.current.active) {
        return;
      }

      startMediaRecorder(mediaStreamRef.current);
      setRecording(true);
    }, RECORDER_RESTART_DELAY_MS);
  };

  const finishCurrentUtterance = useCallback(
    (showToast: boolean) => {
      if (!hasDetectedVoiceRef.current && analyserRef.current && analyserBufferRef.current) {
        const energy = getEnergy(analyserRef.current, analyserBufferRef.current);
        hasDetectedVoiceRef.current = energy >= SILENCE_THRESHOLD;
      }

      if (isEndingRef.current || !hasSentChunkRef.current || hasEndedCurrentUtteranceRef.current) {
        const recorder = mediaRecorderRef.current;

        if (
          showToast &&
          recorder &&
          recorder.state === "recording" &&
          hasDetectedVoiceRef.current &&
          !hasSentChunkRef.current &&
          !hasEndedCurrentUtteranceRef.current
        ) {
          isManualFlushRef.current = true;
          shouldFinishAfterFlushRef.current = true;
          recorder.requestData();

          if (flushTimeoutRef.current !== null) {
            window.clearTimeout(flushTimeoutRef.current);
          }

          flushTimeoutRef.current = window.setTimeout(() => {
            if (shouldFinishAfterFlushRef.current && !hasSentChunkRef.current) {
              shouldFinishAfterFlushRef.current = false;
              isManualFlushRef.current = false;
              showError("전송할 음성이 없습니다.");
            }
          }, 1200);
          return;
        }

        if (showToast && !hasSentChunkRef.current) {
          showError("전송할 음성이 없습니다.");
        }
        return;
      }

      isEndingRef.current = true;
      socketRef.current?.emit("chat:audio:end", { roomId });
      resetResponseBuffers();
      setResponsePhase("waiting-audio");
      hasSentChunkRef.current = false;
      pendingInitialAudioChunkRef.current = null;
      hasDetectedVoiceRef.current = false;
      hasEndedCurrentUtteranceRef.current = true;
      setVoiceActive(false);
      shouldFinishAfterFlushRef.current = false;
      isManualFlushRef.current = false;
      sequenceRef.current = 0;
      silenceStartedAtRef.current = null;
      restartMediaRecorderForNextUtterance();

      if (showToast) {
        showInfo("음성 전송을 완료했습니다.");
      }

      isEndingRef.current = false;
    },
    [resetResponseBuffers, roomId, setResponsePhase],
  );

  const turnOffMicrophone = useCallback(() => {
    if (isEndingRef.current) {
      return;
    }

    isEndingRef.current = true;

    if (hasSentChunkRef.current && !hasEndedCurrentUtteranceRef.current) {
      socketRef.current?.emit("chat:audio:end", { roomId });
      resetResponseBuffers();
      setResponsePhase("waiting-audio");
      showInfo("음성 전송을 완료했습니다.");
    }

    const recorder = mediaRecorderRef.current;
    const wasRecording = Boolean(recorder && recorder.state !== "inactive");

    if (!wasRecording && !mediaStreamRef.current) {
      isEndingRef.current = false;
      return;
    }

    if (recorder && wasRecording) {
      recorder.stop();
    }

    if (silenceTimerRef.current !== null) {
      window.clearInterval(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (recorderRestartTimeoutRef.current !== null) {
      window.clearTimeout(recorderRestartTimeoutRef.current);
      recorderRestartTimeoutRef.current = null;
    }

    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    mediaRecorderRef.current = null;
    pendingInitialAudioChunkRef.current = null;
    activeRecorderSessionRef.current += 1;
    void audioContextRef.current?.close();
    audioContextRef.current = null;
    analyserRef.current = null;
    analyserBufferRef.current = null;
    silenceStartedAtRef.current = null;
    hasSentChunkRef.current = false;
    hasDetectedVoiceRef.current = false;
    setVoiceActive(false);
    hasEndedCurrentUtteranceRef.current = false;
    shouldFinishAfterFlushRef.current = false;
    isManualFlushRef.current = false;
    sequenceRef.current = 0;
    setRecording(false);

    isEndingRef.current = false;
  }, [resetResponseBuffers, roomId, setRecording, setResponsePhase]);

  const startSilenceDetection = useCallback(() => {
    if (!analyserRef.current || !analyserBufferRef.current) {
      return;
    }

    silenceTimerRef.current = window.setInterval(() => {
      const analyser = analyserRef.current;
      const buffer = analyserBufferRef.current;

      if (!analyser || !buffer) {
        return;
      }

      const energy = getEnergy(analyser, buffer);

      if (energy < SILENCE_THRESHOLD && hasSentChunkRef.current && !hasEndedCurrentUtteranceRef.current) {
        setVoiceActive(false);
        silenceStartedAtRef.current ??= Date.now();

        if (Date.now() - silenceStartedAtRef.current >= SILENCE_END_MS) {
          finishCurrentUtterance(true);
        }
      } else if (energy >= SILENCE_THRESHOLD) {
        setVoiceActive(true);
        hasDetectedVoiceRef.current = true;
        silenceStartedAtRef.current = null;
      }
    }, 250);
  }, [finishCurrentUtterance]);

  const startRecording = useCallback(async () => {
    if (!socketRef.current?.connected) {
      showError("소켓 연결에 실패했습니다.");
      return;
    }

    try {
      stopCurrentAudio();
      resetResponse();
      resetResponseBuffers();
      if (recorderRestartTimeoutRef.current !== null) {
        window.clearTimeout(recorderRestartTimeoutRef.current);
        recorderRestartTimeoutRef.current = null;
      }
      sequenceRef.current = 0;
      hasSentChunkRef.current = false;
      pendingInitialAudioChunkRef.current = null;
      setVoiceActive(false);
      hasDetectedVoiceRef.current = false;
      hasEndedCurrentUtteranceRef.current = false;
      isEndingRef.current = false;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);

      mediaStreamRef.current = stream;
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      analyserBufferRef.current = new Uint8Array(analyser.fftSize);

      startMediaRecorder(stream);
      setRecording(true);
      startSilenceDetection();
    } catch (error) {
      setRecording(false);
      showError(
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "마이크 권한이 거부되었습니다."
          : "녹음에 실패했습니다.",
      );
    }
  }, [
    resetResponse,
    resetResponseBuffers,
    roomId,
    setRecording,
    startSilenceDetection,
    stopCurrentAudio,
  ]);

  const handleMicClick = useCallback(() => {
    if (isRecording) {
      turnOffMicrophone();
      return;
    }

    void startRecording();
  }, [isRecording, startRecording, turnOffMicrophone]);

  const handleTextSend = useCallback(
    (text: string) => {
      const trimmedText = text.trim();

      if (!trimmedText) {
        showError("메시지를 입력해주세요.");
        return;
      }

      if (!socketRef.current?.connected) {
        showError("소켓 연결에 실패했습니다.");
        return;
      }

      stopCurrentAudio();
      resetResponse();
      resetResponseBuffers();
      setResponsePhase("waiting-audio");
      socketRef.current.emit("chat:text:send", {
        roomId,
        text: trimmedText,
      });
    },
    [resetResponse, resetResponseBuffers, roomId, setResponsePhase, stopCurrentAudio],
  );

  useEffect(() => {
    const socket: ChatSocket = io(socketUrl, {
      auth: {
        token: accessToken,
      },
      reconnection: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("chat:room:join", { roomId });
    });
    socket.on("connect_error", () => showError("소켓 연결에 실패했습니다."));
    socket.on("disconnect", (reason) => {
      canRevealResponseRef.current = false;
      punctuationHoldUntilRef.current = null;
      responseSessionRef.current += 1;
      stopTextReveal();
      setConnected(false);
      setRoomJoined(false);
      setCurrentMouthShape(0);
      setCurrentVisemeTiming(null);
      setResponsePhase("idle");

      if (reason !== "io client disconnect") {
        showError("소켓 연결이 끊겼습니다.");
      }
    });
    socket.on("chat:room:joined", () => {
      setRoomJoined(true);
      showSuccess("Room에 입장했습니다.");
    });
    socket.on("chat:audio:chunk:accepted", () => undefined);
    socket.on("chat:audio:merged", () => {
      setResponsePhase("waiting-audio");
    });
    socket.on("chat:emotion:stream", (payload: EmotionStreamResponseDto) => {
      pendingEmotionRef.current = payload;

      if (useChatStore.getState().responsePhase === "speaking") {
        setEmotion(payload);
      }
    });
    socket.on("chat:ai:text:chunk", (payload: AITextChunkResponseDto) => {
      if (payload.isComplete) {
        textStreamCompletedRef.current = true;
        fallbackSpeechTimerRef.current = window.setTimeout(() => {
          playFallbackSpeech(pendingTextRef.current);
        }, FALLBACK_SPEECH_DELAY_MS);
        return;
      }

      pendingTextRef.current = `${pendingTextRef.current}${payload.text}`;
    });
    socket.on("chat:ai:audio:chunk", (payload: AIAudioChunkResponseDto) => {
      if (payload.chunkBase64) {
        receivedServerAudioRef.current = true;
        setResponsePhase("waiting-audio");

        if (fallbackSpeechTimerRef.current !== null) {
          window.clearTimeout(fallbackSpeechTimerRef.current);
          fallbackSpeechTimerRef.current = null;
        }

        audioQueueRef.current.set(payload.sequence, {
          chunkBase64: payload.chunkBase64,
          alignment: payload.alignment,
        });
        playNextAudioChunk();
      }

      if (payload.isComplete) {
        serverAudioCompletedRef.current = true;
        playNextAudioChunk();
      }
    });
    socket.on("chat:error", (payload: ChatErrorResponseDto) => {
      canRevealResponseRef.current = false;
      punctuationHoldUntilRef.current = null;
      responseSessionRef.current += 1;
      stopTextReveal();
      setCurrentMouthShape(0);
      setCurrentVisemeTiming(null);
      setSpeaking(false);
      setResponsePhase("error");
      showError(payload.message || "응답 생성에 실패했습니다.");
    });

    return () => {
      turnOffMicrophone();
      stopCurrentAudio();
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
      setRoomJoined(false);
      setCurrentMouthShape(0);
      setCurrentVisemeTiming(null);
    };
  }, [
    accessToken,
    applyPendingEmotion,
    playFallbackSpeech,
    playNextAudioChunk,
    roomId,
    setConnected,
    setCurrentMouthShape,
    setCurrentVisemeTiming,
    setEmotion,
    setResponsePhase,
    setRoomJoined,
    setSpeaking,
    setStreamingMessage,
    socketUrl,
    stopCurrentAudio,
    stopTextReveal,
    turnOffMicrophone,
  ]);

  return (
    <MotionBox
      main={{}}
      displayText={streamingMessage}
      emotion={emotion}
      responsePhase={responsePhase}
      isRecording={isRecording}
      isVoiceActive={isVoiceActive}
      isSpeaking={isSpeaking}
      mouthShape={currentMouthShape}
      visemeTiming={currentVisemeTiming}
      audioVolume={audioVolume}
      onMicClick={handleMicClick}
      onAudioVolumeChange={handleAudioVolumeChange}
      onTextSend={handleTextSend}
    />
  );
}
