"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import { useApp } from "@/app/providers";

function LoginForm() {
  const { signIn } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const nextParam = searchParams.get("next");
  const next = nextParam && nextParam.startsWith("/") ? nextParam : "/explore";

  const submit = (event) => {
    event.preventDefault();
    setError("");
    const result = signIn({ email, password });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(next);
  };

  return (
    <>
      <Link href="/explore" className="auth-back">
        <ArrowLeft size={14} /> Continue exploring as a guest
      </Link>

      <div className="auth-card__head">
        <h2>Welcome back</h2>
        <p>Sign in to publish work, follow creators and keep your saved collection.</p>
      </div>

      <form className="auth-form" onSubmit={submit}>
        <label className="field">
          <span className="field__label">Email</span>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
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
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 6 characters"
            autoComplete="current-password"
            minLength={6}
            required
          />
        </label>

        <div className="auth-row">
          <span>Keep your creations in one place.</span>
          <Link href="/reset-password">Forgot password?</Link>
        </div>

        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}

        <button type="submit" className="btn btn--primary btn--block">
          Sign in
        </button>
      </form>

      <p className="auth-alt">
        New to NAYSPERA? <Link href="/signup">Create an account</Link>
      </p>

      <p className="auth-demo">
        <Info size={14} />
        <span>
          This build stores the community in your browser, so no email is sent. Use any
          valid email with a password of 6 or more characters.
        </span>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
