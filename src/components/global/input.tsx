type InputProps = {
  showLabel?: boolean;
  label?: string;
} & Omit<
    React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >,
    "className"
  >;

export default function Input({ 
    showLabel = true, 
    label = "라벨", 
    placeholder = "placeholder",
    ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-8">
      {showLabel && <label className="text-16 text-text font-pretendard-semibold">{label}</label>}
      <input
        className="w-360 px-24 py-16 border-gradient-surface rounded-30 text-text text-16 cursor-pointer placeholder-placeholder"
        placeholder={placeholder}
        {...props}
      />
    </div>
  );
}
