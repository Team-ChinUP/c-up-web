"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import Icon from "./icon";
import Input from "./input";
import SendTextAction from "@/action/auth/send-text.action";

type MotionBoxProps = {
  main?: {};
};

export default function MotionBox({ main }: MotionBoxProps) {
  const [text, setText] = useState(
    !main ? "기적같은 하루에 내가 필요해? my son?" : "",
  );
  const [showSubtitle, setShowSubtitle] = useState(true);
  const [useMic, setUseMic] = useState(true);
  const [state, action, isPending] = useActionState(SendTextAction, null)

  return (
    <div className="flex flex-col w-full gap-12">
      <div className="w-full h-528 relative">
        <Image
          className="w-full h-full rounded-8"
          alt="배경"
          src={require("@/assets/chat-background.png")}
          draggable={false}
        />
        <Image
          className="absolute w-708 h-full bottom-0 left-1/2 -translate-x-1/2"
          alt="차드"
          src={require("@/assets/basic/CUP_basic_1.png")}
          draggable={false}
        />
        {text && (
          <span className="absolute max-w-400 bottom-40 left-1/2 -translate-x-1/2 px-24 py-12 border-gradient-surface rounded-30 bg-gradient-surface text-text text-16 shadow-[0_12px_30px_rgba(0,0,0,0.45)]">
            {text}
          </span>
        )}
      </div>
      {main && (
        <div className="flex flex-col items-center">
          <div className="flex flex-row w-full justify-between">
            <Icon
              className="cursor-pointer"
              width={24}
              height={24}
              name="quit"
            />
            <span className="flex flex-row gap-16">
              <Icon
                className="cursor-pointer"
                width={24}
                height={24}
                name="speaker"
              />
              <Icon
                className="cursor-pointer"
                width={24}
                height={24}
                name="subtitle"
              />
            </span>
          </div>
          <div className="flex flex-col gap-12 items-center">
            {useMic ? (
              <button className="border-gradient-surface p-18 rounded-36 cursor-pointer">
                <Icon width={36} height={36} name="mic" />
              </button>
            ) : (
              <form className="flex flex-row gap-8" action={action}>
                <input
                  className="w-56 h-56 pointer-events-none select-none"
                  name="roomId"
                  defaultValue={1}
                  readOnly
                  tabIndex={-1}
                  aria-hidden="true"
                />
                <Input
                  name="text"
                  showLabel={false}
                  placeholder="하고싶은 말을 입력해주세요."
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
