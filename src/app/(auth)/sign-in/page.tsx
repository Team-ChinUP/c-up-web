import SignInForm from "@/components/auth/sign-in-form";
import AuthShell from "@/components/auth/auth-shell";

type SignInPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function Home({ searchParams }: SignInPageProps) {
  const params = await searchParams;

  return (
    <AuthShell title="로그인" ctaHref="/sign-up" ctaText="회원가입">
      <SignInForm errorMessage={params?.error} />
    </AuthShell>
  );
}
