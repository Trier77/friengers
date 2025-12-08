import LoginForm from "../components/LoginForm";

export default function Login() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Welcome to Friengers
        </h2>
        <LoginForm />
      </div>
    </div>
  );
}
