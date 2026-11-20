"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useApp } from "@/app/providers";

export default function AuthGate({ children }) {
  const { ready, session } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !session) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/explore")}`);
    }
  }, [pathname, ready, router, session]);

  if (!ready || !session) {
    return (
      <div className="empty" style={{ padding: "64px 24px" }}>
        <Loader2 size={22} className="spinner spinner--light" />
        <p>Checking your session…</p>
      </div>
    );
  }

  return children;
}
