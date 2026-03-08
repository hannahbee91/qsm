"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { checkEmailExists } from "../actions";

function SignInContent() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"EMAIL" | "OPTIONS">("EMAIL");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const [errorMsg, setErrorMsg] = useState<string | null>(searchParams.get("error") ? "Authentication failed. Please check your credentials." : null);
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setErrorMsg(null);
    
    setLoading(true);
    try {
      const exists = await checkEmailExists(email);
      if (!exists) {
        router.push(`/auth/signup?email=${encodeURIComponent(email)}`);
        return;
      }
      setStep("OPTIONS");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    const res = await signIn("credentials", { email, password, callbackUrl, redirect: false });
    if (res?.error) {
      setErrorMsg("Incorrect password. Please try again.");
    } else if (res?.ok) {
      window.location.href = res?.url || callbackUrl;
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center text-center mt-4" style={{ minHeight: '60vh' }}>
      <div className="rainbow-border card" style={{ maxWidth: '400px', width: '100%', padding: '2rem' }}>
        <h2 className="mb-4">Sign In</h2>
        
        {errorMsg && (
          <div className="mb-4 text-center p-2 rounded" style={{ color: "var(--color-error)", backgroundColor: "rgba(255,75,75,0.1)", border: "1px solid var(--color-error)" }}>
            {errorMsg}
          </div>
        )}

        {step === "EMAIL" && (
          <form onSubmit={handleEmailSubmit}>
            <div className="form-group" style={{ textAlign: "left" }}>
              <label className="form-label">Email Address</label>
              <input 
                autoFocus
                type="email" 
                className="form-input" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Continue
            </button>
          </form>
        )}

        {step === "OPTIONS" && (
          <div>
            <p className="mb-4 text-muted">Signing in as <strong>{email}</strong></p>
            
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group" style={{ textAlign: "left" }}>
                <label className="form-label">Password</label>
                <input 
                  autoFocus
                  type="password" 
                  className="form-input" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                />
              </div>
              <button type="submit" className="btn btn-primary mb-4" style={{ width: '100%' }} disabled={loading}>
                {loading ? "Signing in..." : "Sign in with Password"}
              </button>
            </form>

            <button onClick={() => setStep("EMAIL")} className="btn mt-4" style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", background: 'none', border: 'none', cursor: 'pointer' }}>
              &larr; Use a different email
            </button>
          </div>
        )}
        
        {step === "EMAIL" && (
          <div className="mt-4" style={{ fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
            Don't have an account? <Link href="/auth/signup" style={{ color: "var(--color-honey-dark)", textDecoration: "underline" }}>Sign Up</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}
