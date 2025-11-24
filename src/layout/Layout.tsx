import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/header";

export const Layout: React.FC = () => {
  return (
    <div className="app-container">
      <Header />

      <main style={{ minHeight: "70vh" }}>
        <Outlet /> 
      </main>

    </div>
  );
};
