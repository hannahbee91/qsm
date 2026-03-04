"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SignInContent() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"EMAIL" | "OPTIONS">("EMAIL");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStep("OPTIONS");
  };

  const handleMagicLink = async () => {
    setLoading(true);
    await signIn("nodemailer", { email, callbackUrl });
    setLoading(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn("credentials", { email, password, callbackUrl });
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center text-center mt-4" style={{ minHeight: '60vh' }}>
      <div className="rainbow-border card" style={{ maxWidth: '400px', width: '100%', padding: '2rem' }}>
        <h2 className="mb-4">Sign In</h2>
        
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

            <div style={{ position: "relative", textAlign: "center", margin: "1rem 0" }}>
              <hr style={{ border: "0", borderTop: "1px solid var(--color-border)" }} />
              <span style={{ position: "absolute", top: "-10px", background: "var(--color-surface)", padding: "0 10px", color: "var(--color-text-muted)", fontSize: "0.9rem", left: "50%", transform: "translateX(-50%)" }}>
                OR
              </span>
            </div>

            <button onClick={handleMagicLink} className="btn btn-outline mt-2" style={{ width: '100%' }} disabled={loading}>
              {loading ? "Sending..." : "Send Magic Link"}
            </button>
            
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
