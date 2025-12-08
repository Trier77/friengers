import { useState } from "react";
import { useNavigate } from "react-router"; // <-- for navigation
import { login, register } from "../auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // <-- hook for navigation

  const handleLogin = async () => {
    try {
      const user = await login(email, password); // assuming login returns user or throws error
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
    <div className="gap-5">
      <input
        className="border p-2"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border p-2"
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="gap-5 flex justify-center">
        <button type="button" onClick={handleLogin}>
          Login
        </button>
        <button type="button" onClick={handleRegister}>
          Register
        </button>
      </div>
    </div>
  );
}
