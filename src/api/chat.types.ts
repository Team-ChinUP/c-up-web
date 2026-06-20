export type VoiceFeatures = {
  pitch: number;
  energy: number;
  speed: number;
};

export type JoinRoomRequestDto = {
  roomId: number;
};

export type AudioChunkRequestDto = {
  roomId: number;
  chunkBase64: string;
  sequence: number;
  mimeType?: string;
  voiceFeatures: VoiceFeatures;
};

export type AudioEndRequestDto = {
  roomId: number;
};

export type TextMessageRequestDto = {
  roomId: number;
  text: string;
};

export type JoinRoomResponseDto = {
  roomId: number;
};

export type AudioChunkAcceptedResponseDto = {
  roomId: number;
  sequence: number;
  bufferedChunkCount: number;
};

export type AudioMergedResponseDto = {
  roomId: number;
  chunkCount: number;
  totalBytes: number;
  mergedAudioBase64: string;
  mimeType: string;
};

export type EmotionStreamResponseDto = {
  roomId: number;
  happy: number;
  angry: number;
};

export type TTSViseme = 0 | 1 | 2 | 3 | 4 | 5;

export type TTSWordTimestamp = {
  word: string;
  startMs: number;
  endMs: number;
};

export type TTSPhonemeTimestamp = {
  text: string;
  phoneme: string;
  startMs: number;
  endMs: number;
};

export type TTSVisemeTimestamp = {
  text: string;
  viseme: TTSViseme;
  startMs: number;
  endMs: number;
};

export type TTSAudioAlignment = {
  text: string;
  durationMs: number;
  words: TTSWordTimestamp[];
  phonemes: TTSPhonemeTimestamp[];
  visemes: TTSVisemeTimestamp[];
  source: "estimated";
};

export type AITextChunkResponseDto = {
  roomId: number;
  text: string;
  isComplete: boolean;
};

export type AIAudioChunkResponseDto = {
  roomId: number;
  sequence: number;
  chunkBase64: string;
  isComplete: boolean;
  alignment?: TTSAudioAlignment;
};

export type ChatErrorResponseDto = {
  message: string;
};

export type ServerToClientEvents = {
  "chat:room:joined": (payload: JoinRoomResponseDto) => void;
  "chat:audio:chunk:accepted": (payload: AudioChunkAcceptedResponseDto) => void;
  "chat:audio:merged": (payload: AudioMergedResponseDto) => void;
  "chat:emotion:stream": (payload: EmotionStreamResponseDto) => void;
  "chat:ai:text:chunk": (payload: AITextChunkResponseDto) => void;
  "chat:ai:audio:chunk": (payload: AIAudioChunkResponseDto) => void;
  "chat:error": (payload: ChatErrorResponseDto) => void;
};

export type ClientToServerEvents = {
  "chat:room:join": (payload: JoinRoomRequestDto) => void;
  "chat:audio:chunk": (payload: AudioChunkRequestDto) => void;
  "chat:audio:end": (payload: AudioEndRequestDto) => void;
  "chat:text:send": (payload: TextMessageRequestDto) => void;
};
