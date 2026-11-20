"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Menu, Plus, Search, X } from "lucide-react";
import { useApp } from "@/app/providers";
import { unreadCount } from "@/lib/selectors";
import Avatar from "@/components/ui/Avatar";
import { NAV_ITEMS, isNavActive } from "./Sidebar";

export default function MobileNav({ onCompose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { database, profile, session } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const unread = database && session ? unreadCount(database, session.profileId) : 0;

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (menuOpen) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previous;
      };
    }
    return undefined;
  }, [menuOpen]);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  const submitSearch = (event) => {
    event.preventDefault();
    const term = query.trim();
    setSearchOpen(false);
    router.push(term ? `/explore?q=${encodeURIComponent(term)}` : "/explore");
  };

  return (
    <div className="mobile-topbar">
      <div className="mobile-topbar__row">
        <Link href="/explore" className="mobile-topbar__brand" aria-label="NAYSPERA AI">
          <em>NAYSPERA</em> AI
        </Link>

        <button
          type="button"
          className="icon-btn"
          onClick={() => setSearchOpen((open) => !open)}
          aria-label="Search"
          aria-expanded={searchOpen}
        >
          {searchOpen ? <X size={19} /> : <Search size={19} />}
        </button>

        <button
          type="button"
          className="icon-btn"
          onClick={onCompose}
          aria-label="New creation"
        >
          <Plus size={19} />
        </button>

        <Link
          href="/notifications"
          className="icon-btn"
          style={{ position: "relative" }}
          aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        >
          <Bell size={19} />
          {unread > 0 ? (
            <span className="mobile-topbar__badge">{unread > 9 ? "9+" : unread}</span>
          ) : null}
        </Link>

        <button
          type="button"
          className="icon-btn"
          onClick={() => setMenuOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
        >
          <Menu size={20} />
        </button>
      </div>

      {searchOpen ? (
        <form className="mobile-search" onSubmit={submitSearch}>
          <div className="searchbar">
            <Search size={17} />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search creators, posts, tags…"
              aria-label="Search NAYSPERA"
            />
            <button type="submit" className="btn btn--primary btn--sm">
              Go
            </button>
          </div>
        </form>
      ) : null}

      {menuOpen ? (
        <div className="drawer">
          <div
            className="drawer__backdrop"
            onClick={() => setMenuOpen(false)}
            role="presentation"
          />
          <div className="drawer__panel">
            <div className="brand" style={{ padding: "0 4px 18px" }}>
              <span className="brand__name">
                <em>NAYSPERA</em> AI
              </span>
              <span className="brand__tagline">AI Powered Creator System</span>
            </div>

            <nav className="sidebar__nav" aria-label="Navigation">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`nav-item ${isNavActive(pathname, href) ? "is-active" : ""}`}
                >
                  <Icon size={18} strokeWidth={1.9} />
                  <span className="label">{label}</span>
                  {href === "/notifications" && unread > 0 ? (
                    <span className="nav-item__badge">{unread > 9 ? "9+" : unread}</span>
                  ) : null}
                </Link>
              ))}
            </nav>

            <div style={{ marginTop: 18 }}>
              <button
                type="button"
                className="btn btn--primary btn--block"
                onClick={() => {
                  setMenuOpen(false);
                  onCompose();
                }}
              >
                <Plus size={16} />
                New creation
              </button>
            </div>

            <div className="sidebar__footer" style={{ marginTop: 20 }}>
              {session && profile ? (
                <Link href="/profile" className="sidebar__account">
                  <Avatar src={profile.avatar_url} name={profile.full_name} size="sm" />
                  <span className="account-text">
                    <span className="account-name">{profile.full_name}</span>
                    <span className="account-meta">@{profile.username}</span>
                  </span>
                </Link>
              ) : (
                <Link href="/login" className="btn btn--ghost btn--block">
                  Sign in to NAYSPERA
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
