import type { EmotionStreamResponseDto } from "@/api/chat.types";
import type { MouthShape } from "@/utils/mouth-shape";
import { create } from "zustand";

export type AssistantResponsePhase =
  | "idle"
  | "waiting-audio"
  | "speaking"
  | "completed"
  | "error";

export type CurrentVisemeTiming = {
  viseme: MouthShape;
  startMs: number;
  endMs: number;
  currentMs: number;
};

type ChatState = {
  isConnected: boolean;
  isRoomJoined: boolean;
  isRecording: boolean;
  isSpeaking: boolean;
  responsePhase: AssistantResponsePhase;
  currentMouthShape: MouthShape;
  currentVisemeTiming: CurrentVisemeTiming | null;
  streamingMessage: string;
  emotion: EmotionStreamResponseDto | null;
  setConnected: (isConnected: boolean) => void;
  setRoomJoined: (isRoomJoined: boolean) => void;
  setRecording: (isRecording: boolean) => void;
  setSpeaking: (isSpeaking: boolean) => void;
  setResponsePhase: (responsePhase: AssistantResponsePhase) => void;
  setCurrentMouthShape: (currentMouthShape: MouthShape) => void;
  setCurrentVisemeTiming: (
    currentVisemeTiming: CurrentVisemeTiming | null,
  ) => void;
  setStreamingMessage: (streamingMessage: string) => void;
  setEmotion: (emotion: EmotionStreamResponseDto | null) => void;
  resetResponse: () => void;
};

export const useChatStore = create<ChatState>((set) => ({
  isConnected: false,
  isRoomJoined: false,
  isRecording: false,
  isSpeaking: false,
  responsePhase: "idle",
  currentMouthShape: 0,
  currentVisemeTiming: null,
  streamingMessage: "",
  emotion: null,
  setConnected: (isConnected) => set({ isConnected }),
  setRoomJoined: (isRoomJoined) => set({ isRoomJoined }),
  setRecording: (isRecording) => set({ isRecording }),
  setSpeaking: (isSpeaking) => set({ isSpeaking }),
  setResponsePhase: (responsePhase) => set({ responsePhase }),
  setCurrentMouthShape: (currentMouthShape) => set({ currentMouthShape }),
  setCurrentVisemeTiming: (currentVisemeTiming) =>
    set({ currentVisemeTiming }),
  setStreamingMessage: (streamingMessage) => set({ streamingMessage }),
  setEmotion: (emotion) => set({ emotion }),
  resetResponse: () =>
    set({
      streamingMessage: "",
      emotion: null,
      responsePhase: "idle",
      currentMouthShape: 0,
      currentVisemeTiming: null,
    }),
}));
