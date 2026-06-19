"use client";

import { useAuthStore } from "@/store/auth.store";
import { useEffect } from "react";

export default function AuthInitializer() {
  const setLoggedIn = useAuthStore((state) => state.setLoggedIn);
  const setLoggedOut = useAuthStore((state) => state.setLoggedOut);

  useEffect(() => {
    let isMounted = true;

    const syncAuthState = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          cache: "no-store",
        });

        if (!isMounted) {
          return;
        }

        if (response.ok) {
          setLoggedIn();
        } else {
          setLoggedOut();
        }
      } catch {
        if (isMounted) {
          setLoggedOut();
        }
      }
    };

    void syncAuthState();

    return () => {
      isMounted = false;
    };
  }, [setLoggedIn, setLoggedOut]);

  return null;
}
