import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter
      basename={import.meta.env.DEV ? "/" : "/post-app-with-firebase/"}
    >
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
