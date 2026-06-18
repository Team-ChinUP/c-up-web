"use client";

import Input from "@/components/global/input";
import Button from "@/components/global/button";
import { useActionState, useEffect } from "react";
import SignInAction from "@/action/auth/sign-in.action";
import { useRouter } from "next/navigation";
import { showError, showSuccess } from "@/utils/toast";
import { useAuthStore } from "@/store/auth.store";

type SignInFormProps = {
  errorMessage?: string;
};

export default function SignInForm({ errorMessage }: SignInFormProps) {
  const router = useRouter();
  const setLoggedIn = useAuthStore((state) => state.setLoggedIn);
  const [state, action, isPending] = useActionState(SignInAction, null);

  useEffect(() => {
    if (errorMessage) {
      showError(errorMessage);
    }
  }, [errorMessage]);

  useEffect(() => {
    if (state) {
      if (state.state) {
        setLoggedIn();
        showSuccess(state.message);
        router.push("/start");
      } else {
        showError(state.message);
      }
    }
  }, [router, setLoggedIn, state]);

  return (
    <form action={action} className="flex flex-col gap-32">
      <div className="flex flex-col gap-24">
        <Input
          label="이메일"
          name="email"
          placeholder="이메일을 입력해주세요."
        />
        <Input
          label="비밀번호"
          name="password"
          type="password"
          placeholder="비밀번호를 입력해주세요."
        />
      </div>
      <hr className="hr-gradient-surface" />
      <Button type="submit" disabled={isPending}>
        로그인
      </Button>
    </form>
  );
}
