import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/header";
import ToastContainer from "../components/ui/Toast.tsx";

export const Layout: React.FC = () => {
  const location = useLocation();
  const hideHeaderRoutes = ["/createPost", "/create"];
  const shouldHideHeader = hideHeaderRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col">
      {!shouldHideHeader && <Header />}

      <main className="flex-grow w-full py-8">
        <Outlet /> 
      </main>

      <ToastContainer />
    </div>
  );
};
