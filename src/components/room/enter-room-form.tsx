"use client";

import EnterRoomAction from "@/action/room/enter-room.action";
import { showError } from "@/utils/toast";
import { useEffect } from "react";

type EnterRoomFormProps = {
  errorMessage?: string;
};

export default function EnterRoomForm({ errorMessage }: EnterRoomFormProps) {
  useEffect(() => {
    if (errorMessage) {
      showError(errorMessage);
    }
  }, [errorMessage]);

  return (
    <form action={EnterRoomAction}>
      <button
        type="submit"
        className="w-360 px-24 py-16 border-gradient-surface rounded-30 font-pretendard-semibold text-text transition-opacity text-18 active:opacity-70 cursor-pointer select-none"
      >
        대화하기
      </button>
    </form>
  );
}
