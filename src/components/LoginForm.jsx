import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function LoginForm({ onLoginClick }) {
  const {t} = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (onLoginClick) onLoginClick(email, password);
  };

  return (
    <div className="gap-5 flex flex-col items-center">
      <div>
        <h1 className="flex justify-center mb-2 uppercase text-(--secondary)">
          {t("au-login")}
        </h1>

        <input
          className="p-2 rounded-2xl border-(--secondary) border-2 text-(--secondary) w-full mb-3 focus:border-(--secondary) focus:ring-2 focus:ring-blue-300 focus:outline-none"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="p-2 rounded-2xl border-(--secondary) border-2 text-(--secondary) w-full mb-3 focus:border-(--secondary) focus:ring-2 focus:ring-blue-300 focus:outline-none"
          type="password"
          placeholder={t("password")}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="gap-5 flex justify-start mb-2">
          <label className="flex items-center gap-2 text-(--secondary)">
            <input
              type="checkbox"
              className="appearance-none h-4 w-4 border border-(--secondary) rounded-sm relative ml-4
                         checked:bg-(--secondary) checked:border-(--secondary)
                         focus:ring-2 focus:ring(--secondary)
                         before:content-[''] before:absolute before:inset-0
                         checked:before:content-['✕'] checked:before:flex
                         checked:before:items-center checked:before:justify-center
                         checked:before:text-white checked:before:text-sm"
            />
            <span className="text-sm">{t("stay-logged")}</span>
          </label>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleLogin}
            className="bg-(--secondary) text-white font-bold px-4 py-1.5 rounded-2xl mt-4 uppercase"
          >
            {t("login")}
          </button>
        </div>
      </div>
    </div>
  );
}
