import { NavLink } from "react-router";

export default function Logo() {
  return (
    <div className="text-6xl flex justify-center my-4">
      <NavLink to="/">
        <img
          className="h-10"
          src="img/logo-samlet.svg"
          alt="Friengers logo"
        />
      </NavLink>
    </div>
  );
}
