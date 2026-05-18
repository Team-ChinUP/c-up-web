import SignInForm from "@/components/auth/sign-in-form";
import AuthShell from "@/components/auth/auth-shell";

export default function Home() {
  return (
    <AuthShell title="로그인" ctaHref="/sign-up" ctaText="회원가입">
      <SignInForm />
    </AuthShell>
  );
}
