import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/header";
import ToastContainer from "../components/ui/Toast.tsx";

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow w-full py-8">
        <Outlet /> 
      </main>

      <ToastContainer />
    </div>
  );
};
