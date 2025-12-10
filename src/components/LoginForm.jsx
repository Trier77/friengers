import { useState } from "react";
import { NavLink, useNavigate } from "react-router"; 
import { login, register } from "../auth";
import ArrowLogin from "../../public/icons/ArrowLogin";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
    const [error, setError] = useState("");
  const navigate = useNavigate(); 

  const handleLogin = async () => {
    try {
      const user = await login(email, password); 
      if (user) {
        // Redirect to home screen
        navigate("/home");
      }
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  };

  const handleRegister = async () => {
    try {
      await register(email, password);
      alert("Registration successful! You can now log in.");
    } catch (error) {
      alert("Registration failed: " + error.message);
    }
  };

  return (
    <div className="gap-5 flex flex-col items-center">
      <div>
        <h1 className="flex justify-center mb-2 uppercase text-(--secondary)" >Log in med dit AU-Login</h1>
        <input
          className="p-2 rounded-2xl border-(--secondary) border-2 text-(--secondary) w-12/12 mb-3  focus:border-(--secondary)  focus:ring-2 focus:ring-blue-300 focus:outline-none"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="p-2 rounded-2xl border-(--secondary) border-2 text-(--secondary) w-12/12 mb-3  focus:border-(--secondary)  focus:ring-2 focus:ring-blue-300 focus:outline-none"
          type="password"
          placeholder="Adgangskode"
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="gap-5 flex justify-start mb-2">
          <label className="flex items-center gap-2 text-(--secondary)">
            <input
  type="checkbox"
  className="
    appearance-none h-4 w-4 border border-(--secondary) rounded-sm relative ml-4
    checked:bg-[var(--secondary)]
    checked:border-[var(--secondary)]
    focus:ring-2 focus:ring-[var(--secondary)]
    
    before:content-[''] before:absolute before:inset-0
    checked:before:content-['✕'] checked:before:flex checked:before:items-center checked:before:justify-center
    checked:before:text-white checked:before:text-sm
  "
/>

            <span className="text-sm" >Forbliv logget ind</span>
          </label>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleLogin}
            className="bg-(--secondary) text-white font-bold px-4 py-1.5 rounded-2xl mt-4 uppercase"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
