import { Navigate, useLocation } from "react-router";

export default function AppRoute({ children, user }) {
  const location = useLocation();

  if (!user) {
    // Gem nuværende location så vi kan redirecte tilbage efter login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Bruger er logget ind - vis app
  return children;
}