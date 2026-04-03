"use client";

import { useCallback, useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/ui/dialog";
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

    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        closeMobileNavigation();
      }
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
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

        <Dialog
          open={isMobileNavigationOpen}
          onOpenChange={setIsMobileNavigationOpen}
        >
          <DialogContent
            showCloseButton={false}
            className="left-0 top-0 h-full max-h-screen w-[min(20rem,calc(100vw-3rem))] max-w-none translate-x-0 translate-y-0 gap-0 overflow-hidden rounded-none border-0 p-0 shadow-xl data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left"
          >
            <DialogTitle className="sr-only">Navegación principal</DialogTitle>
            <DialogDescription className="sr-only">
              Menú principal para navegar por las secciones de la aplicación.
            </DialogDescription>
            <Sidebar
              onNavigate={closeMobileNavigation}
              onClose={closeMobileNavigation}
              showCloseButton
              className="h-full w-full shadow-none"
            />
          </DialogContent>
        </Dialog>
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
