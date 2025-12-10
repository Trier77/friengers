import LoginForm from "../components/LoginForm";
import LoginLogo from "../../public/icons/LoginLogo";
import AUIcon from "../../public/icons/AUIcon";

export default function Login() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 ">
      <div className="flex flex-col items-center justify-center mb-6 flex-1">
        <div className="flex justify-center mb-8">
          <LoginLogo />
        </div>

        <div className=" p-8 rounded w-full max-w-md">
          <LoginForm />
        </div>
      </div>
      <div className="flex flex-col mb-10 mt-auto  items-center">
        <p className="text-xs text-(--primary) ">I samarbejde med</p>
        <AUIcon />
      </div>
    </div>
  );
}
