"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function SetupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create admin");
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

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="mb-4 text-center" style={{ color: "var(--color-error)" }}>{error}</div>}
      
      <div className="form-group">
        <label className="form-label">Full Name</label>
        <input 
          type="text" 
          className="form-input" 
          value={name} 
          onChange={e => setName(e.target.value)} 
          required 
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Admin Email</label>
        <input 
          type="email" 
          className="form-input" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Password</label>
        <input 
          type="password" 
          className="form-input" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
          disabled={loading}
        />
      </div>

      <button type="submit" className="btn btn-primary mt-2" style={{ width: "100%" }} disabled={loading}>
        {loading ? "Creating..." : "Create Admin Account"}
      </button>
    </form>
  );
}
