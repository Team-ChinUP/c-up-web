"use client"

type ButtonProps = Omit<
  React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >,
  "className"
>;

export default function Button(props: ButtonProps) {
  return (
    <button
      className="min-w-360 px-24 py-16 border-gradient-surface rounded-30 font-pretendard-semibold text-text transition-opacity text-18 active:opacity-70 cursor-pointer"
      {...props}
    />
  );
}