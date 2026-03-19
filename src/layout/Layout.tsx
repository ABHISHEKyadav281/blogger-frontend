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
      <Header showTopNav={shouldShowHeader} />

      <main className={`flex-grow w-full ${shouldShowHeader ? 'py-8' : ''} pb-20 md:pb-0`}>
        <Outlet /> 
      </main>

      <ToastContainer />
    </div>
  );
};
