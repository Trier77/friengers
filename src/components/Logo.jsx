import { NavLink } from "react-router";
import logo from "../assets/logo-samlet.svg";

export default function Logo() {
  return (
    <div className="text-6xl flex justify-center my-4">
      <NavLink to="/">
        <img className="h-10" src={logo} alt="Friengers logo" />
      </NavLink>
    </div>
  );
}
