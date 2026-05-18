"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter()
  return (
    <header className="sticky top-0 z-50 flex flex-row items-center justify-between px-160 h-60 bg-gradient-surface border-b-gradient-surface">
      <Image
        className="w-64 h-30 cursor-pointer"
        alt="logo"
        draggable={false}
        src={require("@/assets/c-up-logo.png")}
        onClick={() => router.push("/")}
      />
      <Link
        href={"/sign-in"}
        className="bg-surface px-16 py-10 rounded-8 transition-opacity active:opacity-70 text-text font-pretendard-semibold text-16 cursor-pointer"
      >
        로그인
      </Link>
    </header>
  );
}
