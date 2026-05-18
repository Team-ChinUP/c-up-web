import Image, { type ImageProps } from "next/image";

type IconName = "quit" | "speaker" | "subtitle" | "mic" | "send";

type IconProps = Omit<ImageProps, "src" | "alt"> & {
  name: IconName;
  alt?: string;
};

const iconSrcMap: Record<IconName, ImageProps["src"]> = {
  quit: require("@/assets/icon/quit.svg"),
  speaker: require("@/assets/icon/speaker.svg"),
  subtitle: require("@/assets/icon/subtitle.svg"),
  mic: require("@/assets/icon/mic.svg"),
  send: require("@/assets/icon/send.svg"),
};

export default function Icon({ name, alt, draggable = false, ...props }: IconProps) {
  return (
    <Image
      src={iconSrcMap[name]}
      alt={alt ?? name}
      draggable={draggable}
      {...props}
    />
  );
}
