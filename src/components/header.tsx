"use client";

import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <div className="flex flex-row items-center justify-between px-160 py-16 bg-gradient-surface border-b-gradient-surface ">
      <Image className="w-64 h-30" alt="logo" src={require("@/assets/c-up-logo.png")} />
      <Link href={"/sign-in"} className="bg-surface px-16 py-10 rounded-8 transition-opacity active:opacity-70 text-text font-pretendard-semibold text-16 cursor-pointer">로그인</Link>
    </div>
  );
}
