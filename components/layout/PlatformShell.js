"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import RightSidebar from "./RightSidebar";
import CreatePostModal from "@/components/feed/CreatePostModal";

export default function PlatformShell({ children }) {
  const [composerOpen, setComposerOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar onCompose={() => setComposerOpen(true)} />
      <div className="main-area">
        <MobileNav onCompose={() => setComposerOpen(true)} />
        <div className="main-grid">
          <main className="page-main">{children}</main>
          <RightSidebar />
        </div>
      </div>
      <CreatePostModal open={composerOpen} onClose={() => setComposerOpen(false)} />
    </div>
  );
}
