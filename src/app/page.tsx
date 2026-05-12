import LinkButton from "@/components/link-button";
import MotionBox from "@/components/motion-box";

export default function Home() {
  return (
    <div className="flex flex-col gap-32 items-center">
      <MotionBox/>
      <LinkButton href={"/sign-in"}>대화하기</LinkButton>
    </div>
  );
}
