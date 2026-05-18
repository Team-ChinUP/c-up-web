export default async function SendTextAction(
  prevState: unknown,
  formData: FormData,
) {
  return {
    state: true,
    message: "테스트",
  };
}
