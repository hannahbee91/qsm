"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { validatePasswordRequirements, PasswordValidationResult } from "@/lib/password-utils";
import { PasswordRequirements } from "@/components/PasswordRequirements";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidationResult>(validatePasswordRequirements(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setPasswordValidation(validatePasswordRequirements(password));
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!passwordValidation.isValid) {
      setError("Please ensure your password meets all requirements.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to register");
      }

      // Automatically sign them in
      const signInRes = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (signInRes?.error) {
        throw new Error(signInRes.error);
      }

      router.push("/registrant");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center mt-4" style={{ minHeight: '60vh' }}>
      <div className="rainbow-border card" style={{ maxWidth: '400px', width: '100%', padding: '2rem' }}>
        <h2 className="mb-4">Create Account</h2>
        
        <form onSubmit={handleSubmit}>
          {error && <div className="mb-4 text-center" style={{ color: "var(--color-error)" }}>{error}</div>}
          
          <div className="form-group" style={{ textAlign: "left" }}>
            <label className="form-label">Full Name</label>
            <input 
              autoFocus
              type="text" 
              className="form-input" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
              disabled={loading}
            />
          </div>

          <div className="form-group" style={{ textAlign: "left" }}>
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              disabled={loading}
            />
          </div>

          <div className="form-group" style={{ textAlign: "left" }}>
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              disabled={loading}
            />
            <PasswordRequirements validation={passwordValidation} show={password.length > 0} />
          </div>

          <div className="form-group" style={{ textAlign: "left" }}>
            <label className="form-label">Confirm Password</label>
            <input 
              type="password" 
              className="form-input" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              required 
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading || !passwordValidation.isValid || password !== confirmPassword}>
            {loading ? "Registering..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-4" style={{ fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
          Already have an account? <Link href="/auth/signin" style={{ color: "var(--color-honey-dark)", textDecoration: "underline" }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
}
