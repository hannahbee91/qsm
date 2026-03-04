export interface PasswordValidationResult {
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  isValid: boolean;
}

export function validatePasswordRequirements(password: string): PasswordValidationResult {
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return {
    hasMinLength,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    isValid: hasMinLength && hasUpperCase && hasLowerCase && hasNumber
  };
}
