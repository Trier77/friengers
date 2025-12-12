import { Navigate } from "react-router";

export default function PublicRoute({ user, children }) {
  if (user) {
    // Hvis logget ind → redirect til landingpage
    return <Navigate to="/" replace />;
  }
  return children;
}
