import { useState, useRef } from "react";
import LoginForm from "../components/LoginForm";
import AUIcon from "../../public/icons/AUIcon";
import Lottie from "lottie-react";
import logoAnimation from "../assets/logo-animation.json";
import { useNavigate } from "react-router";
import { login } from "../auth";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useTranslation } from "react-i18next";

export default function Login() {
  const { t } = useTranslation();
  const [shouldPlay, setShouldPlay] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const lottieRef = useRef();
  const navigate = useNavigate();

  const startAnimation = (emailValue, passwordValue) => {
    setEmail(emailValue);
    setPassword(passwordValue);
    setShouldPlay(true);

    setTimeout(() => {
      lottieRef.current.play();
    }, 0);
  };

  const handleAnimationComplete = async () => {
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      alert( t(`login.failed`) + err.message);
      setShouldPlay(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center relative h-screen overflow-hidden">
      <Lottie
        lottieRef={lottieRef}
        animationData={logoAnimation}
        autoplay={false}
        loop={false}
        initialSegment={[0, 90]}
        onComplete={handleAnimationComplete}
        style={{ width: 600 }}
      />

      <AnimatePresence>
        {!shouldPlay && (
          <motion.div
            key="login-form"
            className="p-8"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <LoginForm onLoginClick={startAnimation} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!shouldPlay && (
          <motion.div
            key="au-icon"
            className="flex flex-col mt-20 items-center"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs text-(--primary)">{t(`login.inCollaborationWith`)}</p>
            <AUIcon color="--primary" size={150} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
