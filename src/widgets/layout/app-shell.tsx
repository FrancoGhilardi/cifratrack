"use client";

import { useCallback, useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { Sidebar } from "@/widgets/sidebar/sidebar";
import { Header } from "@/widgets/header/header";
import { Toaster } from "sonner";

interface AppShellProps {
  children: React.ReactNode;
  userName?: string;
  userEmail?: string;
}

/**
 * Shell de aplicacion responsive con sidebar fija en desktop y drawer en mobile.
 */
export function AppShell({ children, userName, userEmail }: AppShellProps) {
  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false);

  const closeMobileNavigation = useCallback(() => {
    setIsMobileNavigationOpen(false);
  }, []);

  const openMobileNavigation = useCallback(() => {
    setIsMobileNavigationOpen(true);
  }, []);

  const handleLogout = useCallback(() => {
    signOut({ callbackUrl: "/login" });
  }, []);

  useEffect(() => {
    if (!isMobileNavigationOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobileNavigation();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMobileNavigation, isMobileNavigationOpen]);

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="flex min-h-screen">
          <Sidebar className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:shrink-0" />
          <div className="flex min-h-screen min-w-0 flex-1 flex-col">
            <Header
              userName={userName}
              userEmail={userEmail}
              onLogout={handleLogout}
              onOpenNavigation={openMobileNavigation}
              showNavigationTrigger
            />
            <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
              <div className="mx-auto w-full max-w-7xl">{children}</div>
            </main>
          </div>
        </div>

        {isMobileNavigationOpen && (
          <div
            className="fixed inset-0 z-40 lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Navegacion principal"
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/50"
              aria-label="Cerrar navegacion"
              onClick={closeMobileNavigation}
            />
            <Sidebar
              onNavigate={closeMobileNavigation}
              onClose={closeMobileNavigation}
              showCloseButton
              className="relative z-10 h-full w-[min(20rem,calc(100vw-3rem))] shadow-xl"
            />
          </div>
        )}
      </div>

      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{ className: "rounded-lg border shadow-lg" }}
      />
    </>
  );
}
