"use server"

export default async function SignInAction(
  prevState: unknown,
  formData: FormData,
) {
  return {
    state: true,
    message: "테스트",
  };
}
