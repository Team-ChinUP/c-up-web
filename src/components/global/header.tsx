"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { showError, showSuccess } from "@/utils/toast";
import { useAuthStore } from "@/store/auth.store";
import { getApiErrorMessage } from "@/api/error";
import type { ApiResponse } from "@/api/types";

export default function Header() {
  const router = useRouter();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const setLoggedOut = useAuthStore((state) => state.setLoggedOut);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        cache: "no-store",
      });
      const result = (await response.json()) as ApiResponse<null>;

      if (!response.ok) {
        showError(getApiErrorMessage(result, undefined, "로그아웃에 실패했습니다."));
        return;
      }

      setLoggedOut();
      showSuccess(result.message || "로그아웃되었습니다.");
      router.push("/sign-in");
    } catch (error) {
      showError(getApiErrorMessage(undefined, error, "로그아웃에 실패했습니다."));
    }
  };

  return (
    <header className="sticky top-0 z-50 flex flex-row items-center justify-between px-160 h-60 bg-gradient-surface border-b-gradient-surface">
      <Image
        className="w-64 h-30 cursor-pointer"
        alt="logo"
        draggable={false}
        src={require("@/assets/c-up-logo.png")}
        onClick={() => router.push("/")}
      />
      {isLoggedIn ? (
        <button
          type="button"
          onClick={handleLogout}
          className="bg-surface px-16 py-10 rounded-8 transition-opacity active:opacity-70 text-text font-pretendard-semibold text-16 cursor-pointer"
        >
          로그아웃
        </button>
      ) : (
        <Link
          href={"/sign-in"}
          className="bg-surface px-16 py-10 rounded-8 transition-opacity active:opacity-70 text-text font-pretendard-semibold text-16 cursor-pointer"
        >
          로그인
        </Link>
      )}
    </header>
  );
}
