"use server";

export default async function SignUpAction(
  prevState: unknown,
  formData: FormData,
) {
  return {
    state: true,
    message: "테스트",
  };
}
