import SignUpForm from "@/components/auth/sign-up-form";
import AuthShell from "@/components/auth/auth-shell";

export default function Home() {
  return (
    <AuthShell title="회원가입" ctaHref="/sign-in" ctaText="로그인">
      <SignUpForm />
    </AuthShell>
  );
}
