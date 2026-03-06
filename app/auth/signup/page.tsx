"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { validatePasswordRequirements, PasswordValidationResult } from "@/lib/password-utils";
import { PasswordRequirements } from "@/components/PasswordRequirements";

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [age, setAge] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [isOver18, setIsOver18] = useState(false);
  const [contactEmail, setContactEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [instagram, setInstagram] = useState("");
  const [discord, setDiscord] = useState("");

  const [passwordValidation, setPasswordValidation] = useState<PasswordValidationResult>(validatePasswordRequirements(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        body: JSON.stringify({ 
          name, 
          email, 
          password,
          age,
          pronouns,
          isOver18,
          contactEmail,
          phoneNumber,
          instagram,
          discord
        }),
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
            <label className="form-label">Email Address *</label>
            <input 
              type="email" 
              className="form-input" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              disabled={loading}
            />
          </div>

          <div className="responsive-grid-half">
            <div className="form-group" style={{ textAlign: "left" }}>
              <label className="form-label">Age *</label>
              <input 
                type="number" 
                className="form-input" 
                value={age} 
                onChange={e => setAge(e.target.value)} 
                required 
                disabled={loading}
              />
            </div>
            <div className="form-group" style={{ textAlign: "left" }}>
              <label className="form-label">Pronouns</label>
              <input 
                type="text" 
                className="form-input" 
                value={pronouns} 
                onChange={e => setPronouns(e.target.value)} 
                placeholder="e.g. they/them"
                disabled={loading}
              />
            </div>
          </div>

          <div className="mt-4 mb-2 text-left">
            <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Contact Info *</h3>
            <p className="form-label" style={{ marginBottom: "0.5rem" }}>Please provide at least one method of contact for matches.</p>
          </div>
          
          <div className="responsive-grid-half">
            <div className="form-group" style={{ textAlign: "left" }}>
              <label className="form-label">Contact Email</label>
              <input 
                type="email" 
                className="form-input" 
                value={contactEmail} 
                onChange={e => setContactEmail(e.target.value)} 
                disabled={loading}
              />
            </div>
            <div className="form-group" style={{ textAlign: "left" }}>
              <label className="form-label">Phone Number</label>
              <input 
                type="tel" 
                className="form-input" 
                value={phoneNumber} 
                onChange={e => setPhoneNumber(e.target.value)} 
                disabled={loading}
              />
            </div>
            <div className="form-group" style={{ textAlign: "left" }}>
              <label className="form-label">Instagram</label>
              <input 
                type="text" 
                className="form-input" 
                value={instagram} 
                onChange={e => setInstagram(e.target.value)} 
                disabled={loading}
              />
            </div>
            <div className="form-group" style={{ textAlign: "left" }}>
              <label className="form-label">Discord</label>
              <input 
                type="text" 
                className="form-input" 
                value={discord} 
                onChange={e => setDiscord(e.target.value)} 
                disabled={loading}
              />
            </div>
          </div>

          <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', textAlign: 'left', marginBottom: '1rem' }}>
            <label className="flex items-center gap-2" style={{ cursor: 'pointer', fontSize: '0.9rem' }}>
              <input 
                type="checkbox" 
                checked={isOver18} 
                onChange={e => setIsOver18(e.target.checked)}
                required
                style={{ width: '16px', height: '16px', accentColor: '#A66CFF' }}
              />
              I confirm that I am at least 18 years of age.
            </label>
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

export default function SignUpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpContent />
    </Suspense>
  );
}
