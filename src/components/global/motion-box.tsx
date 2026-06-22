"use client";

import Image from "next/image";
import type { StaticImageData } from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import Icon from "./icon";
import Input from "./input";
import MotionBoxControls from "./motion-box-controls";
import type { EmotionStreamResponseDto } from "@/api/chat.types";
import chatBackground from "@/assets/chat-background.png";
import angryTalk0 from "@/assets/assistant-video-call-zero/angry-talk/angry_talk_0.png";
import angryTalk01 from "@/assets/assistant-video-call-zero/angry-talk/angry_talk_0_1.png";
import angryTalk1 from "@/assets/assistant-video-call-zero/angry-talk/angry_talk_1.png";
import angryTalk12 from "@/assets/assistant-video-call-zero/angry-talk/angry_talk_1_2.png";
import angryTalk2 from "@/assets/assistant-video-call-zero/angry-talk/angry_talk_2.png";
import angryTalk23 from "@/assets/assistant-video-call-zero/angry-talk/angry_talk_2_3.png";
import angryTalk3 from "@/assets/assistant-video-call-zero/angry-talk/angry_talk_3.png";
import angryTalk34 from "@/assets/assistant-video-call-zero/angry-talk/angry_talk_3_4.png";
import angryTalk4 from "@/assets/assistant-video-call-zero/angry-talk/angry_talk_4.png";
import angryTalk45 from "@/assets/assistant-video-call-zero/angry-talk/angry_talk_4_5.png";
import angryTalk5 from "@/assets/assistant-video-call-zero/angry-talk/angry_talk_5.png";
import blink01 from "@/assets/assistant-video-call-zero/blink/blink_01.png";
import blink0102 from "@/assets/assistant-video-call-zero/blink/blink_01_02.png";
import blink02 from "@/assets/assistant-video-call-zero/blink/blink_02.png";
import blink0203 from "@/assets/assistant-video-call-zero/blink/blink_02_03.png";
import blink03 from "@/assets/assistant-video-call-zero/blink/blink_03.png";
import defaultTalk0 from "@/assets/assistant-video-call-zero/default-talk/default_talk_0.png";
import defaultTalk01 from "@/assets/assistant-video-call-zero/default-talk/default_talk_0_1.png";
import defaultTalk1 from "@/assets/assistant-video-call-zero/default-talk/default_talk_1.png";
import defaultTalk12 from "@/assets/assistant-video-call-zero/default-talk/default_talk_1_2.png";
import defaultTalk2 from "@/assets/assistant-video-call-zero/default-talk/default_talk_2.png";
import defaultTalk23 from "@/assets/assistant-video-call-zero/default-talk/default_talk_2_3.png";
import defaultTalk3 from "@/assets/assistant-video-call-zero/default-talk/default_talk_3.png";
import defaultTalk34 from "@/assets/assistant-video-call-zero/default-talk/default_talk_3_4.png";
import defaultTalk4 from "@/assets/assistant-video-call-zero/default-talk/default_talk_4.png";
import defaultTalk45 from "@/assets/assistant-video-call-zero/default-talk/default_talk_4_5.png";
import defaultTalk5 from "@/assets/assistant-video-call-zero/default-talk/default_talk_5.png";
import defaultStanding01 from "@/assets/assistant-video-call-zero/default-standing/default_standing_01.png";
import defaultStanding0102 from "@/assets/assistant-video-call-zero/default-standing/default_standing_01_02.png";
import defaultStanding02 from "@/assets/assistant-video-call-zero/default-standing/default_standing_02.png";
import defaultStanding0203 from "@/assets/assistant-video-call-zero/default-standing/default_standing_02_03.png";
import defaultStanding03 from "@/assets/assistant-video-call-zero/default-standing/default_standing_03.png";
import defaultStanding030304 from "@/assets/assistant-video-call-zero/default-standing/default_standing_03_03_04.png";
import defaultStanding0304 from "@/assets/assistant-video-call-zero/default-standing/default_standing_03_04.png";
import defaultStanding04 from "@/assets/assistant-video-call-zero/default-standing/default_standing_04.png";
import defaultStanding0405 from "@/assets/assistant-video-call-zero/default-standing/default_standing_04_05.png";
import defaultStanding05 from "@/assets/assistant-video-call-zero/default-standing/default_standing_05.png";
import defaultStanding0506 from "@/assets/assistant-video-call-zero/default-standing/default_standing_05_06.png";
import defaultStanding06 from "@/assets/assistant-video-call-zero/default-standing/default_standing_06.png";
import defaultStanding060101 from "@/assets/assistant-video-call-zero/default-standing/default_standing_06_01.png";
import happyTalk0 from "@/assets/assistant-video-call-zero/happy-talk/happy_talk_0.png";
import happyTalk01 from "@/assets/assistant-video-call-zero/happy-talk/happy_talk_0_1.png";
import happyTalk1 from "@/assets/assistant-video-call-zero/happy-talk/happy_talk_1.png";
import happyTalk12 from "@/assets/assistant-video-call-zero/happy-talk/happy_talk_1_2.png";
import happyTalk2 from "@/assets/assistant-video-call-zero/happy-talk/happy_talk_2.png";
import happyTalk23 from "@/assets/assistant-video-call-zero/happy-talk/happy_talk_2_3.png";
import happyTalk3 from "@/assets/assistant-video-call-zero/happy-talk/happy_talk_3.png";
import happyTalk34 from "@/assets/assistant-video-call-zero/happy-talk/happy_talk_3_4.png";
import happyTalk4 from "@/assets/assistant-video-call-zero/happy-talk/happy_talk_4.png";
import happyTalk45 from "@/assets/assistant-video-call-zero/happy-talk/happy_talk_4_5.png";
import happyTalk5 from "@/assets/assistant-video-call-zero/happy-talk/happy_talk_5.png";
import worry01 from "@/assets/assistant-video-call-zero/worry/worry_01.png";
import worry0102 from "@/assets/assistant-video-call-zero/worry/worry_01_02.png";
import worry02 from "@/assets/assistant-video-call-zero/worry/worry_02.png";
import worry0203 from "@/assets/assistant-video-call-zero/worry/worry_02_03.png";
import worry03 from "@/assets/assistant-video-call-zero/worry/worry_03.png";
import worry0304 from "@/assets/assistant-video-call-zero/worry/worry_03_04.png";
import worry04 from "@/assets/assistant-video-call-zero/worry/worry_04.png";
import worry0405 from "@/assets/assistant-video-call-zero/worry/worry_04_05.png";
import worry05 from "@/assets/assistant-video-call-zero/worry/worry_05.png";
import worry0506 from "@/assets/assistant-video-call-zero/worry/worry_05_06.png";
import worry06 from "@/assets/assistant-video-call-zero/worry/worry_06.png";
import worry0607 from "@/assets/assistant-video-call-zero/worry/worry_06_07.png";
import worry07 from "@/assets/assistant-video-call-zero/worry/worry_07.png";
import worry0708 from "@/assets/assistant-video-call-zero/worry/worry_07_08.png";
import worry08 from "@/assets/assistant-video-call-zero/worry/worry_08.png";
import worry0801 from "@/assets/assistant-video-call-zero/worry/worry_08_01.png";
import type {
  AssistantResponsePhase,
  CurrentVisemeTiming,
} from "@/store/chat.store";
import type { MouthShape } from "@/utils/mouth-shape";

type MotionBoxProps = {
  main?: object;
  displayText?: string;
  emotion?: EmotionStreamResponseDto | null;
  responsePhase?: AssistantResponsePhase;
  isRecording?: boolean;
  isVoiceActive?: boolean;
  isSpeaking?: boolean;
  mouthShape?: MouthShape;
  visemeTiming?: CurrentVisemeTiming | null;
  audioVolume?: number;
  onMicClick?: () => void;
  onAudioVolumeChange?: (volume: number) => void;
  onVoiceSendClick?: () => void;
  onTextSend?: (text: string) => void;
};

type TalkTransitionKey = "0-1" | "1-2" | "2-3" | "3-4" | "4-5";

type TalkFrameSet = {
  base: readonly StaticImageData[];
  transitions: Record<TalkTransitionKey, StaticImageData>;
};

const defaultTalkFrameSet: TalkFrameSet = {
  base: [
    defaultTalk0,
    defaultTalk1,
    defaultTalk2,
    defaultTalk3,
    defaultTalk4,
    defaultTalk5,
  ],
  transitions: {
    "0-1": defaultTalk01,
    "1-2": defaultTalk12,
    "2-3": defaultTalk23,
    "3-4": defaultTalk34,
    "4-5": defaultTalk45,
  },
};

const defaultStandingFrames = [
  defaultStanding01,
  defaultStanding0102,
  defaultStanding02,
  defaultStanding0203,
  defaultStanding02,
  defaultStanding0102,
  defaultStanding01,
  defaultStanding0102,
  defaultStanding02,
  defaultStanding0203,
  defaultStanding02,
  defaultStanding0102,
  defaultStanding01,
  defaultStanding0102,
  defaultStanding02,
  defaultStanding0203,
  defaultStanding02,
  defaultStanding0102,
  defaultStanding01,
  defaultStanding0102,
  defaultStanding02,
  defaultStanding0203,
  defaultStanding02,
  defaultStanding0102,
  defaultStanding01,
  defaultStanding0102,
  defaultStanding02,
  defaultStanding0203,
  defaultStanding02,
  defaultStanding0102,
  defaultStanding01,
  defaultStanding0102,
  defaultStanding02,
  defaultStanding0203,
  defaultStanding02,
  defaultStanding0102,
  defaultStanding01,
  defaultStanding0102,
  defaultStanding02,
  defaultStanding0203,
  defaultStanding03,
  defaultStanding030304,
  defaultStanding0304,
  defaultStanding04,
  defaultStanding0405,
  defaultStanding05,
  defaultStanding0506,
  defaultStanding06,
  defaultStanding060101,
];

const happyTalkFrameSet: TalkFrameSet = {
  base: [
    happyTalk0,
    happyTalk1,
    happyTalk2,
    happyTalk3,
    happyTalk4,
    happyTalk5,
  ],
  transitions: {
    "0-1": happyTalk01,
    "1-2": happyTalk12,
    "2-3": happyTalk23,
    "3-4": happyTalk34,
    "4-5": happyTalk45,
  },
};

const angryTalkFrameSet: TalkFrameSet = {
  base: [
    angryTalk0,
    angryTalk1,
    angryTalk2,
    angryTalk3,
    angryTalk4,
    angryTalk5,
  ],
  transitions: {
    "0-1": angryTalk01,
    "1-2": angryTalk12,
    "2-3": angryTalk23,
    "3-4": angryTalk34,
    "4-5": angryTalk45,
  },
};

const worryFrames = [
  worry01,
  worry0102,
  worry02,
  worry0203,
  worry03,
  worry0304,
  worry04,
  worry0405,
  worry05,
  worry0506,
  worry06,
  worry0607,
  worry07,
  worry0708,
  worry08,
  worry0801,
];

const getDominantEmotion = (emotion?: EmotionStreamResponseDto | null) => {
  if (!emotion) {
    return "basic";
  }

  const entries = [
    ["happy", emotion.happy],
    ["angry", emotion.angry],
  ] as const;
  const dominant = entries.reduce((previous, current) =>
    current[1] > previous[1] ? current : previous,
  );

  return dominant[0];
};

const getTransitionKeyForTarget = (target: MouthShape): TalkTransitionKey => {
  if (target === 0 || target === 1) {
    return "0-1";
  }

  return `${target - 1}-${target}` as TalkTransitionKey;
};

const shouldShowTransitionFrame = (
  visemeTiming?: CurrentVisemeTiming | null,
) => {
  if (!visemeTiming) {
    return false;
  }

  const durationMs = Math.max(0, visemeTiming.endMs - visemeTiming.startMs);
  const elapsedMs = Math.max(0, visemeTiming.currentMs - visemeTiming.startMs);

  return durationMs > 0 && elapsedMs < durationMs / 2;
};

export default function MotionBox({
  main,
  displayText,
  emotion,
  responsePhase = "idle",
  isRecording = false,
  isVoiceActive = false,
  isSpeaking = false,
  mouthShape = 0,
  visemeTiming = null,
  audioVolume = 0.5,
  onMicClick,
  onAudioVolumeChange,
  onVoiceSendClick,
  onTextSend,
}: MotionBoxProps) {
  const [text] = useState(
    !main ? "기적같은 하루에 내가 필요해? my son?" : "",
  );
  const [useMic, setUseMic] = useState(true);
  const [message, setMessage] = useState("");
  const [frameIndex, setFrameIndex] = useState(0);
  const [isCaptionVisible, setCaptionVisible] = useState(true);
  const [exitingCaptionText, setExitingCaptionText] = useState<string | null>(
    null,
  );
  const [dismissedCaptionText, setDismissedCaptionText] = useState<
    string | null
  >(null);

  const handleTextSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onTextSend?.(message);
    setMessage("");
  };

  const visibleText = isCaptionVisible ? displayText ?? text : "";
  const captionText =
    visibleText &&
    !(
      responsePhase === "completed" &&
      visibleText === dismissedCaptionText
    )
      ? visibleText
      : "";
  const isCaptionExiting =
    Boolean(captionText) && captionText === exitingCaptionText;
  const dominantEmotion = getDominantEmotion(emotion);
  const hasRevealedSpeechText = Boolean(displayText && displayText.length > 0);
  const isTalking =
    responsePhase === "speaking" && isSpeaking && hasRevealedSpeechText;
  const talkFrameSet =
    dominantEmotion === "angry"
      ? angryTalkFrameSet
      : dominantEmotion === "happy"
        ? happyTalkFrameSet
        : defaultTalkFrameSet;
  const transitionKey = getTransitionKeyForTarget(mouthShape);
  const showTransitionFrame =
    isTalking && shouldShowTransitionFrame(visemeTiming);
  const animationFrames = useMemo(() => {
    if (isRecording) {
      return isVoiceActive ? worryFrames : defaultStandingFrames;
    }

    if (responsePhase === "waiting-audio") {
      return worryFrames;
    }

    return defaultStandingFrames;
  }, [isRecording, isVoiceActive, responsePhase]);
  const frameDuration =
    isRecording && !isVoiceActive
      ? 160
      : isRecording || responsePhase === "waiting-audio"
      ? 120
      : isTalking
        ? 70
        : 70;
  const characterImage = isTalking
    ? showTransitionFrame
      ? talkFrameSet.transitions[transitionKey]
      : talkFrameSet.base[mouthShape]
    : animationFrames[frameIndex % animationFrames.length];

  useEffect(() => {
    if (animationFrames.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setFrameIndex((current) => (current + 1) % animationFrames.length);
    }, frameDuration);

    return () => window.clearInterval(timer);
  }, [animationFrames.length, frameDuration]);

  useEffect(() => {
    if (
      !isCaptionVisible ||
      !captionText ||
      isCaptionExiting ||
      responsePhase !== "completed"
    ) {
      return;
    }

    const exitTimer = window.setTimeout(() => {
      setExitingCaptionText(captionText);
    }, 500);
    const clearTimer = window.setTimeout(() => {
      setDismissedCaptionText(captionText);
      setExitingCaptionText(null);
    }, 760);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(clearTimer);
    };
  }, [captionText, isCaptionExiting, isCaptionVisible, responsePhase]);

  return (
    <div className="flex flex-col w-full gap-12">
      <div className="w-full h-528 relative">
        <Image
          className="w-full h-full rounded-8"
          alt="배경"
          src={chatBackground}
          draggable={false}
        />
        <Image
          className="absolute w-708 h-full bottom-0 left-1/2 -translate-x-1/2 [image-rendering:pixelated]"
          alt="차드"
          src={characterImage}
          sizes="280px"
          data-mouth-shape={isTalking ? mouthShape : undefined}
          data-talk-transition={showTransitionFrame ? "true" : undefined}
          data-talk-transition-key={
            isTalking && showTransitionFrame ? transitionKey : undefined
          }
          data-viseme-start-ms={visemeTiming?.startMs}
          data-viseme-end-ms={visemeTiming?.endMs}
          draggable={false}
        />
        {captionText && (
          <span
            className={`absolute max-w-400 bottom-40 left-1/2 px-24 py-12 border-gradient-surface rounded-30 bg-gradient-surface text-text text-16 shadow-[0_12px_30px_rgba(0,0,0,0.45)] ${
              isCaptionExiting
                ? "motion-box-caption-exit"
                : "motion-box-caption-enter"
            }`}
          >
            {captionText}
          </span>
        )}
      </div>
      {main && (
        <div className="flex flex-col items-center">
          <MotionBoxControls
            audioVolume={audioVolume}
            isCaptionVisible={isCaptionVisible}
            onAudioVolumeChange={onAudioVolumeChange ?? (() => undefined)}
            onCaptionVisibleChange={setCaptionVisible}
          />
          <div className="flex flex-col gap-12 items-center">
            {useMic ? (
              <div className="flex flex-row gap-8">
                <button
                  type="button"
                  aria-label={isRecording ? "마이크 끄기" : "마이크 켜기"}
                  onClick={onMicClick}
                  className="relative border-gradient-surface p-18 rounded-36 cursor-pointer"
                >
                  {isRecording && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-[-3px] rounded-full border-2 border-placeholder/25 border-t-text animate-spin"
                    />
                  )}
                  <Icon width={36} height={36} name="mic" />
                  {isRecording && (
                    <span className="sr-only">녹음 중</span>
                  )}
                </button>
                {isRecording && (
                  <button
                    type="button"
                    aria-label="음성 전송"
                    onClick={onVoiceSendClick}
                    className="border-gradient-surface p-18 rounded-36 cursor-pointer"
                  >
                    <Icon width={24} height={24} name="send" alt="send" />
                  </button>
                )}
              </div>
            ) : (
              <form className="flex flex-row gap-8" onSubmit={handleTextSubmit}>
                <Input
                  name="text"
                  showLabel={false}
                  placeholder="하고싶은 말을 입력해주세요."
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                />
                <button
                  type="submit"
                  className="border-gradient-surface p-18 rounded-36 cursor-pointer"
                >
                  <Icon width={24} height={24} name="send" alt="send" />
                </button>
              </form>
            )}
            <p
              onClick={() => setUseMic((v) => !v)}
              className="text-placeholder underline text-16 cursor-pointer"
            >
              {useMic ? "말하는 것이 부담스러우신가요?" : "말해보실래요?"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
