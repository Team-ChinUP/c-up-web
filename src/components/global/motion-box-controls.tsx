"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useId, useState } from "react";
import Icon from "./icon";

const VOLUME_STORAGE_KEY = "c-up:voice-volume";
const DEFAULT_VOLUME = 0.5;

type MotionBoxControlsProps = {
  audioVolume: number;
  isCaptionVisible: boolean;
  onAudioVolumeChange: (volume: number) => void;
  onCaptionVisibleChange: (isVisible: boolean) => void;
};

const clampVolume = (volume: number) => Math.min(1, Math.max(0, volume));

const readSavedVolume = () => {
  const savedVolume = window.localStorage.getItem(VOLUME_STORAGE_KEY);

  if (savedVolume === null) {
    return DEFAULT_VOLUME;
  }

  const parsedVolume = Number(savedVolume);

  if (!Number.isFinite(parsedVolume)) {
    return DEFAULT_VOLUME;
  }

  return clampVolume(parsedVolume);
};

export default function MotionBoxControls({
  audioVolume,
  isCaptionVisible,
  onAudioVolumeChange,
  onCaptionVisibleChange,
}: MotionBoxControlsProps) {
  const router = useRouter();
  const volumeControlId = useId();
  const [isVolumeOpen, setVolumeOpen] = useState(false);

  useEffect(() => {
    onAudioVolumeChange(readSavedVolume());
  }, [onAudioVolumeChange]);

  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextVolume = clampVolume(Number(event.target.value) / 100);

    window.localStorage.setItem(VOLUME_STORAGE_KEY, String(nextVolume));
    onAudioVolumeChange(nextVolume);
  };

  const updateVolume = (volume: number) => {
    const nextVolume = clampVolume(volume);

    window.localStorage.setItem(VOLUME_STORAGE_KEY, String(nextVolume));
    onAudioVolumeChange(nextVolume);
  };

  return (
    <div className="flex flex-row w-full justify-between">
      <button
        type="button"
        aria-label="이전 화면으로 돌아가기"
        onClick={() => router.back()}
        className="cursor-pointer"
      >
        <Icon width={24} height={24} name="quit" alt="이전" />
      </button>
      <span className="flex flex-row gap-16">
        <span className="relative flex items-center">
          <button
            type="button"
            aria-label="음성 소리 조절"
            aria-expanded={isVolumeOpen}
            aria-controls={volumeControlId}
            onClick={() => setVolumeOpen((current) => !current)}
            className="cursor-pointer"
          >
            <Icon width={24} height={24} name="speaker" alt="음량" />
          </button>
          {isVolumeOpen && (
            <span
              id={volumeControlId}
              className="absolute right-[-10px] bottom-36 flex h-156 w-52 flex-col items-center justify-between px-10 py-12 rounded-8 bg-background/90 border border-line shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
            >
              <button
                type="button"
                aria-label="음성 소리 키우기"
                onClick={() => updateVolume(audioVolume + 0.1)}
                className="h-24 w-24 rounded-full text-text text-20 leading-none"
              >
                +
              </button>
              <span className="relative flex h-82 w-24 items-center justify-center">
                <input
                  type="range"
                  aria-label="음성 소리"
                  min={0}
                  max={100}
                  step={1}
                  value={Math.round(audioVolume * 100)}
                  onChange={handleVolumeChange}
                  className="absolute w-82 origin-center -rotate-90 accent-placeholder"
                />
              </span>
              <button
                type="button"
                aria-label="음성 소리 줄이기"
                onClick={() => updateVolume(audioVolume - 0.1)}
                className="h-24 w-24 rounded-full text-text text-20 leading-none"
              >
                -
              </button>
            </span>
          )}
        </span>
        <button
          type="button"
          aria-label={
            isCaptionVisible ? "캐릭터 말 표시 끄기" : "캐릭터 말 표시 켜기"
          }
          aria-pressed={!isCaptionVisible}
          onClick={() => onCaptionVisibleChange(!isCaptionVisible)}
          className={`cursor-pointer ${isCaptionVisible ? "" : "opacity-45"}`}
        >
          <Icon width={24} height={24} name="subtitle" alt="자막" />
        </button>
      </span>
    </div>
  );
}
