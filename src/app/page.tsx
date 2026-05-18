import LinkButton from "@/components/global/link-button";
import MotionBox from "@/components/global/motion-box";

export default function Home() {
  return (
    <div className="flex flex-col gap-32 items-center">
      <MotionBox/>
      <LinkButton href={"/sign-in"}>대화하기</LinkButton>
    </div>
  );
}
