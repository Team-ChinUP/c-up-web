"use client";

import Input from "@/components/global/input";
import Button from "@/components/global/button";
import { useActionState, useEffect } from "react";
import SignInAction from "@/action/auth/sign-in.action";
import { useRouter } from "next/navigation";

export default function SignInForm() {
  const router = useRouter();
  const [state, action, isPending] = useActionState(SignInAction, null);

  useEffect(() => {
    if (state) {
      if (state.state) {
        router.push("/start");
      }
    }
  }, [state]);

  return (
    <form action={action} className="flex flex-col gap-32">
      <div className="flex flex-col gap-24">
        <Input
          label="아이디"
          name="userId"
          placeholder="아이디를 입력해주세요."
        />
        <Input
          label="비밀번호"
          name="password"
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
