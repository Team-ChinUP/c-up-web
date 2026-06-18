"use client";

import Input from "@/components/global/input";
import Button from "@/components/global/button";
import { useActionState, useEffect } from "react";
import SignUpAction from "@/action/auth/sign-up.action";
import { useRouter } from "next/navigation";
import { showError, showSuccess } from "@/utils/toast";

export default function SignUpForm() {
  const router = useRouter();
  const [state, action, isPending] = useActionState(SignUpAction, null);

  useEffect(() => {
    if (state) {
      if (state.state) {
        showSuccess(state.message);
        router.push("sign-in");
      } else {
        showError(state.message);
      }
    }
  }, [router, state]);

  return (
    <form action={action} className="flex flex-col gap-32">
      <div className="flex flex-col gap-24">
        <Input
          label="이메일"
          name="email"
          placeholder="이메일을 입력해주세요."
        />
        <Input label="이름" name="name" placeholder="이름을 입력해주세요." />
        <Input
          label="성별"
          name="gender"
          placeholder="성별을 입력해주세요. (남자 OR 여자)"
        />
        <Input
          label="비밀번호"
          name="password"
          type="password"
          placeholder="비밀번호를 입력해주세요."
        />
        <Input
          label="비밀번호 확인"
          name="passwordConfirm"
          type="password"
          placeholder="비밀번호를 한번 더 입력해주세요."
        />
      </div>
      <hr className="hr-gradient-surface" />
      <Button type="submit" disabled={isPending}>회원가입</Button>
    </form>
  );
}
