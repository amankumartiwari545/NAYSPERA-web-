"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Info } from "lucide-react";
import { useApp } from "@/app/providers";

export default function ResetPasswordPage() {
  const { requestPasswordReset } = useApp();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    setError("");
    const result = requestPasswordReset(email);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSent(true);
  };

  return (
    <>
      <Link href="/login" className="auth-back">
        <ArrowLeft size={14} /> Back to sign in
      </Link>

      <div className="auth-card__head">
        <h2>Reset your password</h2>
        <p>Enter the email tied to your NAYSPERA account and we will outline the next step.</p>
      </div>

      {sent ? (
        <>
          <p className="form-note" role="status">
            <CheckCircle2 size={15} />
            <span>
              Reset requested for <strong>{email}</strong>. This local build does not send
              email, so no link will arrive — sign in again with any password of 6 or more
              characters.
            </span>
          </p>
          <Link
            href="/login"
            className="btn btn--primary btn--block"
            style={{ marginTop: 18 }}
          >
            Return to sign in
          </Link>
        </>
      ) : (
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

          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}

          <button type="submit" className="btn btn--primary btn--block">
            Send reset instructions
          </button>
        </form>
      )}

      <p className="auth-demo">
        <Info size={14} />
        <span>
          Email delivery requires a connected backend. Until then password resets are
          acknowledged on screen only.
        </span>
      </p>
    </>
  );
}
