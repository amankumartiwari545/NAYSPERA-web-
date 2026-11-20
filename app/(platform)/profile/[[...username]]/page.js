"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { UserX } from "lucide-react";
import { useApp } from "@/app/providers";
import AuthGate from "@/components/auth/AuthGate";
import ProfileView from "@/components/profile/ProfileView";

export default function ProfilePage() {
  const params = useParams();
  const { ready, profile, database } = useApp();
  const segments = params?.username;
  const username = Array.isArray(segments) ? segments[0] : segments;

  if (!username) {
    return (
      <AuthGate>{profile ? <ProfileView profile={profile} /> : null}</AuthGate>
    );
  }

  if (!ready || !database) {
    return (
      <>
        <div className="skeleton" style={{ height: 142, borderRadius: 18 }} />
        <div className="skeleton" style={{ width: 240, height: 20, marginTop: 24 }} />
        <div className="skeleton" style={{ width: "70%", height: 12, marginTop: 12 }} />
      </>
    );
  }

  const creator = database.profiles.find(
    (item) => item.username.toLowerCase() === String(username).toLowerCase()
  );

  if (!creator) {
    return (
      <div className="empty">
        <span className="empty__icon">
          <UserX size={19} />
        </span>
        <h3>Creator not found</h3>
        <p>No profile matches @{username}. The account may have been renamed.</p>
        <Link href="/discover" className="btn btn--primary btn--sm">
          Discover creators
        </Link>
      </div>
    );
  }

  return <ProfileView profile={creator} />;
}
