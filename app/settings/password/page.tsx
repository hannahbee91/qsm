"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { validatePasswordRequirements, PasswordValidationResult } from "@/lib/password-utils";
import { PasswordRequirements } from "@/components/PasswordRequirements";
import { useModal } from "@/app/components/ModalProvider";

function ChangePasswordForm() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidationResult>(validatePasswordRequirements(""));
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const { showAlert } = useModal();

  useEffect(() => {
    setPasswordValidation(validatePasswordRequirements(newPassword));
  }, [newPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    if (!passwordValidation.isValid) {
      setStatus("error");
      setMessage("Please ensure your new password meets all requirements.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus("error");
      setMessage("New passwords do not match.");
      return;
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to change password.");
      }

      setStatus("success");
      
      // Clear form
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      showAlert("Success", data.message || "Password changed successfully.", () => {
        router.back();
      });
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center mt-4" style={{ minHeight: '60vh' }}>
      <div className="rainbow-border card" style={{ maxWidth: '400px', width: '100%', padding: '2rem' }}>
        <h2 className="mb-6">Change Password</h2>

        <form onSubmit={handleSubmit} className="w-full">
          {status === "error" && (
            <div className="mb-4 text-center p-2 rounded" style={{ backgroundColor: "rgba(255, 107, 107, 0.1)", color: "var(--color-error)", border: "1px solid var(--color-error)" }}>
              {message}
            </div>
          )}
          
          <div className="form-group" style={{ textAlign: "left" }}>
            <label className="form-label">Current Password</label>
            <input 
              autoFocus
              type="password" 
              className="form-input" 
              value={oldPassword} 
              onChange={e => setOldPassword(e.target.value)} 
              required 
              disabled={status === "loading"}
            />
          </div>

          <div className="form-group" style={{ textAlign: "left" }}>
            <label className="form-label">New Password</label>
            <input 
              type="password" 
              className="form-input" 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              required 
              disabled={status === "loading"}
            />
            <PasswordRequirements validation={passwordValidation} show={newPassword.length > 0} />
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

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={status === "loading" || !passwordValidation.isValid || newPassword !== confirmPassword}>
            {status === "loading" ? "Changing..." : "Change Password"}
          </button>
          
          <button 
            type="button" 
            className="btn mt-4" 
            style={{ width: '100%', backgroundColor: "transparent", color: "var(--color-text)", border: "1px solid var(--color-border)" }} 
            onClick={() => router.back()}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ChangePasswordPage() {
  return (
    <ChangePasswordForm />
  );
}
