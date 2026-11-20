"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import { useApp } from "@/app/providers";

function SignupForm() {
  const { signUp } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const nextParam = searchParams.get("next");
  const next = nextParam && nextParam.startsWith("/") ? nextParam : "/explore";

  const update = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = (event) => {
    event.preventDefault();
    setError("");
    const result = signUp({
      email: form.email,
      password: form.password,
      fullName: form.fullName,
      username: form.username,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(next);
  };

  return (
    <>
      <Link href="/explore" className="auth-back">
        <ArrowLeft size={14} /> Back to explore
      </Link>

      <div className="auth-card__head">
        <h2>Create your account</h2>
        <p>Join the community, publish your first concept and follow the creators you like.</p>
      </div>

      <form className="auth-form" onSubmit={submit}>
        <div className="form-grid">
          <label className="field">
            <span className="field__label">Full name</span>
            <input
              className="input"
              value={form.fullName}
              onChange={update("fullName")}
              placeholder="Alex Rivera"
              autoComplete="name"
              required
            />
          </label>
          <label className="field">
            <span className="field__label">Username</span>
            <input
              className="input"
              value={form.username}
              onChange={update("username")}
              placeholder="alexrivera"
              autoComplete="username"
              minLength={3}
              maxLength={24}
              required
            />
          </label>
        </div>

        <label className="field">
          <span className="field__label">Email</span>
          <input
            className="input"
            type="email"
            value={form.email}
            onChange={update("email")}
            placeholder="you@studio.com"
            autoComplete="email"
            required
          />
        </label>

        <label className="field">
          <span className="field__label">Password</span>
          <input
            className="input"
            type="password"
            value={form.password}
            onChange={update("password")}
            placeholder="At least 6 characters"
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>

        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}

        <button type="submit" className="btn btn--primary btn--block">
          Create account
        </button>
      </form>

      <p className="auth-alt">
        Already have an account? <Link href="/login">Sign in</Link>
      </p>

      <p className="auth-demo">
        <Info size={14} />
        <span>
          Accounts in this build are local to this browser. No verification email is sent,
          and your profile is ready immediately.
        </span>
      </p>
    </>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
