import Lottie from "lottie-react";
import logoAnimation from "@/assets/logo-animation.json";

export default function LogoAnimation() {
  return (
    <div className="w-40 h-40">
      <Lottie animationData={logoAnimation} loop autoplay />
    </div>
  );
}
