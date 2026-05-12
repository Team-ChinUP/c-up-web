"use client"

import Image from "next/image";

export default function MotionBox(){
    return (
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
        <span className="absolute max-w-400 bottom-40 left-1/2 -translate-x-1/2 px-24 py-12 border-gradient-surface rounded-30 bg-gradient-surface text-text text-16 shadow-[0_12px_30px_rgba(0,0,0,0.45)]">
          기적같은 하루에 내가 필요해? my son?
        </span>
      </div>
    );
}