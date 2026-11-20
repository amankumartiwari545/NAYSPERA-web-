"use client";

import Link from "next/link";
import {
  AtSign,
  BellOff,
  CheckCheck,
  Heart,
  MessageCircle,
  Repeat2,
  UserPlus,
} from "lucide-react";
import { useApp } from "@/app/providers";
import { notificationsFor } from "@/lib/selectors";
import { timeAgo } from "@/lib/utils";
import AuthGate from "@/components/auth/AuthGate";
import Avatar from "@/components/ui/Avatar";

const ICONS = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  mention: AtSign,
  repost: Repeat2,
};

const COPY = {
  like: "liked your creation",
  comment: "commented on your creation",
  follow: "started following you",
  mention: "mentioned you in a comment",
  repost: "reposted your creation",
};

function NotificationsContent() {
  const { database, viewerId, markAllRead, markRead } = useApp();
  const items = notificationsFor(database, viewerId);
  const unread = items.filter((item) => !item.is_read).length;

  return (
    <>
      <header className="page-head">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-sub">
            {unread > 0
              ? `${unread} unread update${unread === 1 ? "" : "s"} from the community.`
              : "You are all caught up."}
          </p>
        </div>
        <div className="page-head__actions">
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={markAllRead}
            disabled={unread === 0}
          >
            <CheckCheck size={14} /> Mark all read
          </button>
        </div>
      </header>

      {items.length === 0 ? (
        <div className="empty">
          <span className="empty__icon">
            <BellOff size={19} />
          </span>
          <h3>No notifications yet</h3>
          <p>
            Likes, comments, reposts and new followers will appear here as your work
            reaches the community.
          </p>
          <Link href="/explore" className="btn btn--primary btn--sm">
            Explore creations
          </Link>
        </div>
      ) : (
        items.map((item) => {
          const Icon = ICONS[item.type] || Heart;
          const href = item.type === "follow"
            ? `/profile/${item.sender?.username || ""}`
            : item.post
            ? `/post/${item.post.id}`
            : "/explore";
          return (
            <Link
              key={item.id}
              href={href}
              className={`notif ${item.is_read ? "" : "is-unread"}`}
              onClick={() => markRead(item.id)}
            >
              <span className="notif__icon">
                <Icon size={15} />
              </span>
              <Avatar
                src={item.sender?.avatar_url}
                name={item.sender?.full_name || "Member"}
                size="sm"
              />
              <span className="notif__body">
                <span className="notif__text">
                  <strong>{item.sender?.full_name || "Someone"}</strong>{" "}
                  {COPY[item.type] || "interacted with your work"}
                  {item.post ? ` — ${item.post.title}` : ""}.
                </span>
                <span className="notif__meta">
                  <span>{timeAgo(item.created_at)}</span>
                  <span>·</span>
                  <span>@{item.sender?.username || "creator"}</span>
                </span>
              </span>
              {item.is_read ? null : <span className="notif__dot" />}
            </Link>
          );
        })
      )}
    </>
  );
}

export default function NotificationsPage() {
  return (
    <AuthGate>
      <NotificationsContent />
    </AuthGate>
  );
}
