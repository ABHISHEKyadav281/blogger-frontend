import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/header";
import ToastContainer from "../components/ui/Toast.tsx";

export const Layout: React.FC = () => {
  const location = useLocation();
  const showHeaderRoutes = ["/", "/home"];
  const shouldShowHeader = showHeaderRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col">
      {shouldShowHeader && <Header />}

      <main className={`flex-grow w-full ${shouldShowHeader ? 'py-8' : ''}`}>
        <Outlet /> 
      </main>

      <ToastContainer />
    </div>
  );
};
