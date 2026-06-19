"use client";

import AuthInitializer from "@/components/auth/auth-initializer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <>
      <AuthInitializer />
      {children}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        limit={3}
      />
    </>
  );
}
