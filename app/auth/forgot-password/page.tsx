"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit request.");
      }

      setStatus("success");
      setMessage(data.message || "If an account exists, a reset link has been sent.");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center mt-4" style={{ minHeight: '60vh' }}>
      <div className="rainbow-border card" style={{ maxWidth: '400px', width: '100%', padding: '2rem' }}>
        <h2 className="mb-4">Reset Password</h2>
        <p className="mb-6 text-sm" style={{ color: "var(--color-text-muted)" }}>
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {status === "success" ? (
          <div className="mb-6">
            <div className="mb-4 text-center p-3 rounded" style={{ backgroundColor: "rgba(107, 203, 119, 0.1)", color: "var(--color-success)", border: "1px solid var(--color-success)" }}>
              {message}
            </div>
            <Link href="/auth/signin" className="btn btn-primary" style={{ width: '100%', display: 'inline-block' }}>
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {status === "error" && (
              <div className="mb-4 text-center p-2 rounded" style={{ backgroundColor: "rgba(255, 107, 107, 0.1)", color: "var(--color-error)", border: "1px solid var(--color-error)" }}>
                {message}
              </div>
            )}
            
            <div className="form-group" style={{ textAlign: "left" }}>
              <label className="form-label">Email Address</label>
              <input 
                autoFocus
                type="email" 
                className="form-input" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                disabled={status === "loading"}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={status === "loading"}>
              {status === "loading" ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <div className="mt-6" style={{ fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
          Remembered your password? <Link href="/auth/signin" style={{ color: "var(--color-honey-dark)", textDecoration: "underline" }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
}
