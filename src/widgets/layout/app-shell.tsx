'use client';

import { useCallback } from "react";
import { signOut } from "next-auth/react";
import { Sidebar } from "@/widgets/sidebar/sidebar";
import { Header } from "@/widgets/header/header";

interface AppShellProps {
  children: React.ReactNode;
  userName?: string;
  userEmail?: string;
}

/**
 * Shell de aplicación con sidebar fijo y header simple (mantiene el diseño original).
 */
export function AppShell({ children, userName, userEmail }: AppShellProps) {
  const handleLogout = useCallback(() => {
    signOut({ callbackUrl: "/login" });
  }, []);

  return (
    <div className="min-h-screen flex flex-row">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <Header userName={userName} userEmail={userEmail} onLogout={handleLogout} />
        <main className="flex-1 py-6 px-4">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
