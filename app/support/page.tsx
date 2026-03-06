"use client";

import { useState } from "react";

export default function SupportPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send message");
      }

      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err: any) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  };

  return (
    <div className="flex flex-col items-center mt-4" style={{ minHeight: '60vh' }}>
      <div className="rainbow-border card" style={{ maxWidth: '500px', width: '100%', padding: '2rem' }}>
        <h1 className="mb-4 text-center">Contact Support</h1>
        
        <p className="mb-4 text-center">
          Have an issue or a question? Send us a message and we'll get back to you as soon as possible.
        </p>

        {status === "success" ? (
          <div className="text-center" style={{ color: "var(--color-success)", padding: "2rem 0" }}>
            <h2 className="mb-2">Message Sent!</h2>
            <p>Thank you for reaching out. We will review your message shortly.</p>
            <button 
              className="btn btn-primary mt-4" 
              onClick={() => setStatus("idle")}
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {status === "error" && <div className="mb-4 text-center" style={{ color: "var(--color-error)" }}>{errorMsg}</div>}
            
            <div className="form-group" style={{ textAlign: "left" }}>
              <label className="form-label">Name</label>
              <input 
                type="text" 
                className="form-input" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                disabled={status === "loading"}
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
                disabled={status === "loading"}
              />
            </div>

            <div className="form-group" style={{ textAlign: "left" }}>
              <label className="form-label">Message</label>
              <textarea 
                className="form-input" 
                value={message} 
                onChange={e => setMessage(e.target.value)} 
                required 
                disabled={status === "loading"}
                rows={5}
                style={{ resize: "vertical" }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={status === "loading"}>
              {status === "loading" ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
