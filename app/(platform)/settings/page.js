"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ImagePlus, LogOut, Palette, RotateCcw, ShieldCheck } from "lucide-react";
import { useApp } from "@/app/providers";
import { fileToDataUrl } from "@/lib/image";
import AuthGate from "@/components/auth/AuthGate";
import Avatar from "@/components/ui/Avatar";

function SettingsContent() {
  const {
    profile,
    session,
    updateProfile,
    signOut,
    resetDemoData,
    database,
  } = useApp();
  const [form, setForm] = useState({
    full_name: profile?.full_name || "",
    username: profile?.username || "",
    bio: profile?.bio || "",
  });
  const [avatar, setAvatar] = useState(profile?.avatar_url || "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name,
        username: profile.username,
        bio: profile.bio || "",
      });
      setAvatar(profile.avatar_url || "");
    }
  }, [profile]);

  const update = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const pickAvatar = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const dataUrl = await fileToDataUrl(file, 400, 0.85);
      setAvatar(dataUrl);
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const save = (event) => {
    event.preventDefault();
    setError("");
    const result = updateProfile({ ...form, avatar_url: avatar });
    if (!result.ok) setError(result.error || "Could not save your profile.");
  };

  return (
    <>
      <header className="page-head">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-sub">Manage your creator identity and workspace.</p>
        </div>
      </header>

      <form className="settings-card" onSubmit={save}>
        <div className="settings-card__head">
          <h2>Creator profile</h2>
          <p>This is how you appear across feeds, comments and notifications.</p>
        </div>

        <div className="avatar-editor">
          <Avatar src={avatar} name={form.full_name || "Creator"} size="lg" ring />
          <div>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
            >
              <ImagePlus size={14} /> {busy ? "Preparing…" : "Change avatar"}
            </button>
            <p className="field__hint">Square images look best. Resized locally.</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={pickAvatar}
              tabIndex={-1}
            />
          </div>
        </div>

        <div className="form-grid">
          <label className="field">
            <span className="field__label">Full name</span>
            <input
              className="input"
              value={form.full_name}
              onChange={update("full_name")}
              maxLength={60}
              required
            />
          </label>
          <label className="field">
            <span className="field__label">Username</span>
            <input
              className="input"
              value={form.username}
              onChange={update("username")}
              maxLength={24}
              required
            />
            <span className="field__hint">Your profile lives at /profile/{form.username || "you"}</span>
          </label>
        </div>

        <label className="field" style={{ marginTop: 14 }}>
          <span className="field__label">Bio</span>
          <textarea
            className="textarea"
            value={form.bio}
            onChange={update("bio")}
            maxLength={200}
            placeholder="What do you make?"
            style={{ minHeight: 88 }}
          />
          <span className="field__hint">{form.bio.length}/200 characters</span>
        </label>

        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="form-actions">
          <button type="submit" className="btn btn--primary btn--sm">
            Save changes
          </button>
        </div>
      </form>

      <section className="settings-card">
        <div className="settings-card__head">
          <h2>Account</h2>
          <p>Local accounts are stored on this device while no backend is connected.</p>
        </div>
        <div className="settings-row">
          <div>
            <p className="settings-row__label">Signed in as</p>
            <p className="settings-row__sub">{session?.email || "No email on session"}</p>
          </div>
          <span className="tag tag--neutral">
            <ShieldCheck size={12} /> Local session
          </span>
        </div>
        <div className="settings-row">
          <div>
            <p className="settings-row__label">Sign out</p>
            <p className="settings-row__sub">
              You will keep browsing as a guest and can sign back in any time.
            </p>
          </div>
          <button type="button" className="btn btn--ghost btn--sm" onClick={signOut}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </section>

      <section className="settings-card">
        <div className="settings-card__head">
          <h2>Workspace data</h2>
          <p>
            Creations, likes, follows and notifications live in this browser&apos;s local
            storage.
          </p>
        </div>
        <div className="settings-row">
          <div>
            <p className="settings-row__label">
              {database?.posts.length || 0} creations · {database?.profiles.length || 0}{" "}
              profiles
            </p>
            <p className="settings-row__sub">Restoring the sample set removes your changes.</p>
          </div>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => {
              if (window.confirm("Restore the sample community data? Your changes will be lost.")) {
                resetDemoData();
              }
            }}
          >
            <RotateCcw size={14} /> Restore samples
          </button>
        </div>
      </section>

      <section className="settings-card">
        <div className="settings-card__head">
          <h2>AI connection</h2>
          <p>Studio calls a server route so your key never reaches the browser.</p>
        </div>
        <div className="settings-row">
          <div>
            <p className="settings-row__label">Generation endpoint</p>
            <p className="settings-row__sub">
              Set OPENAI_API_KEY in .env.local, then restart the dev server.
            </p>
          </div>
          <span className="tag tag--neutral">
            <Palette size={12} /> OpenAI-compatible
          </span>
        </div>
        <div className="settings-row">
          <div>
            <p className="settings-row__label">Test the studio</p>
            <p className="settings-row__sub">
              The studio reports an honest status when no key is configured.
            </p>
          </div>
          <Link href="/studio" className="btn btn--ghost btn--sm">
            Open studio
          </Link>
        </div>
      </section>
    </>
  );
}

export default function SettingsPage() {
  return (
    <AuthGate>
      <SettingsContent />
    </AuthGate>
  );
}
