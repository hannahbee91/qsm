"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { validatePasswordRequirements, PasswordValidationResult } from "@/lib/password-utils";
import { PasswordRequirements } from "@/components/PasswordRequirements";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidationResult>(validatePasswordRequirements(""));
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    setPasswordValidation(validatePasswordRequirements(password));
  }, [password]);

  if (!token) {
    return (
      <div className="text-center p-4">
        <div className="mb-4 text-center p-3 rounded" style={{ backgroundColor: "rgba(255, 107, 107, 0.1)", color: "var(--color-error)", border: "1px solid var(--color-error)" }}>
          Invalid or missing reset token.
        </div>
        <Link href="/auth/forgot-password" className="btn btn-primary">
          Request a new link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    if (!passwordValidation.isValid) {
      setStatus("error");
      setMessage("Please ensure your password meets all requirements.");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password.");
      }

      setStatus("success");
      setMessage(data.message || "Your password has been reset successfully.");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  };

  if (status === "success") {
    return (
      <div className="text-center p-4 w-full">
        <div className="mb-6 mx-auto text-center p-4 rounded" style={{ backgroundColor: "rgba(107, 203, 119, 0.1)", color: "var(--color-success)", border: "1px solid var(--color-success)" }}>
          <h3 className="text-lg font-bold mb-2">Success!</h3>
          <p>{message}</p>
        </div>
        <Link href="/auth/signin" className="btn btn-primary inline-block">
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {status === "error" && (
        <div className="mb-4 text-center p-2 rounded" style={{ backgroundColor: "rgba(255, 107, 107, 0.1)", color: "var(--color-error)", border: "1px solid var(--color-error)" }}>
          {message}
        </div>
      )}
      
      <div className="form-group" style={{ textAlign: "left" }}>
        <label className="form-label">New Password</label>
        <input 
          autoFocus
          type="password" 
          className="form-input" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
          disabled={status === "loading"}
        />
        <PasswordRequirements validation={passwordValidation} show={password.length > 0} />
      </div>

      <div className="form-group" style={{ textAlign: "left" }}>
        <label className="form-label">Confirm New Password</label>
        <input 
          type="password" 
          className="form-input" 
          value={confirmPassword} 
          onChange={e => setConfirmPassword(e.target.value)} 
          required 
          disabled={status === "loading"}
        />
      </div>

      <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={status === "loading" || !passwordValidation.isValid || password !== confirmPassword}>
        {status === "loading" ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center mt-4" style={{ minHeight: '60vh' }}>
      <div className="rainbow-border card" style={{ maxWidth: '400px', width: '100%', padding: '2rem' }}>
        <h2 className="mb-6">Create New Password</h2>
        <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
