"use client";

import { PasswordValidationResult } from "@/lib/password-utils";

interface PasswordRequirementsProps {
  validation: PasswordValidationResult;
  show: boolean;
}

export function PasswordRequirements({ validation, show }: PasswordRequirementsProps) {
  if (!show) return null;

  return (
    <div className="mt-2 text-sm text-left" style={{ color: "var(--color-text-muted)" }}>
      <p className="mb-1 font-medium text-[var(--color-text)]">Password must contain:</p>
      <ul className="space-y-1 ml-1">
        <li className={`flex items-center gap-2 ${validation.hasMinLength ? 'text-[var(--color-success)]' : ''}`}>
          <span className="w-4 h-4 inline-flex items-center justify-center">
            {validation.hasMinLength ? '✓' : '○'}
          </span>
          At least 8 characters
        </li>
        <li className={`flex items-center gap-2 ${validation.hasUpperCase ? 'text-[var(--color-success)]' : ''}`}>
          <span className="w-4 h-4 inline-flex items-center justify-center">
            {validation.hasUpperCase ? '✓' : '○'}
          </span>
          At least one uppercase letter
        </li>
        <li className={`flex items-center gap-2 ${validation.hasLowerCase ? 'text-[var(--color-success)]' : ''}`}>
          <span className="w-4 h-4 inline-flex items-center justify-center">
            {validation.hasLowerCase ? '✓' : '○'}
          </span>
          At least one lowercase letter
        </li>
        <li className={`flex items-center gap-2 ${validation.hasNumber ? 'text-[var(--color-success)]' : ''}`}>
          <span className="w-4 h-4 inline-flex items-center justify-center">
            {validation.hasNumber ? '✓' : '○'}
          </span>
          At least one number
        </li>
      </ul>
    </div>
  );
}
