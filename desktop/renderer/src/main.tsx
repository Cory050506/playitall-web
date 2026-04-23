import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import "@/app/globals.css";
import { Providers } from "@/components/providers";
import { DesktopApp } from "./DesktopApp";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HashRouter>
      <Providers>
        <DesktopApp />
      </Providers>
    </HashRouter>
  </React.StrictMode>
);
