"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Bookmark,
  Compass,
  MoreHorizontal,
  Plus,
  Settings,
  Sparkles,
  Telescope,
  User,
  Users,
} from "lucide-react";
import { useApp } from "@/app/providers";
import { unreadCount } from "@/lib/selectors";
import Avatar from "@/components/ui/Avatar";

export const NAV_ITEMS = [
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/following", label: "Following", icon: Users },
  { href: "/discover", label: "Discover", icon: Telescope },
  { href: "/studio", label: "AI Studio", icon: Sparkles },
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function isNavActive(pathname, href) {
  if (href === "/explore") {
    return pathname === "/explore" || pathname.startsWith("/post/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar({ onCompose }) {
  const pathname = usePathname();
  const { database, profile, session } = useApp();
  const unread = database && session ? unreadCount(database, session.profileId) : 0;

  return (
    <aside className="sidebar">
      <Link href="/explore" className="brand" aria-label="NAYSPERA AI home">
        <span className="brand__name">
          <em>NAYSPERA</em> AI
        </span>
        <span className="brand__tagline">AI Powered Creator System</span>
      </Link>

      <nav className="sidebar__nav" aria-label="Primary navigation">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isNavActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={`nav-item ${active ? "is-active" : ""}`}
              aria-current={active ? "page" : undefined}
              title={label}
            >
              <Icon size={18} strokeWidth={1.9} />
              <span className="label">{label}</span>
              {href === "/notifications" && unread > 0 ? (
                <span className="nav-item__badge">{unread > 9 ? "9+" : unread}</span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar__cta">
        <button
          type="button"
          className="btn btn--primary btn--block"
          onClick={onCompose}
          title="New creation"
        >
          <Plus size={16} strokeWidth={2.4} />
          <span className="btn__label">New creation</span>
        </button>
      </div>

      <div className="sidebar__footer">
        {session && profile ? (
          <Link href="/profile" className="sidebar__account">
            <Avatar src={profile.avatar_url} name={profile.full_name} size="sm" ring />
            <span className="account-text">
              <span className="account-name">{profile.full_name}</span>
              <span className="account-meta">@{profile.username}</span>
            </span>
            <MoreHorizontal size={15} className="rail-icon" />
          </Link>
        ) : (
          <Link href="/login" className="sidebar__account" title="Sign in">
            <Avatar name="Guest" size="sm" />
            <span className="account-text">
              <span className="account-name">Guest session</span>
              <span className="account-meta">Sign in to interact</span>
            </span>
          </Link>
        )}
      </div>
    </aside>
  );
}
