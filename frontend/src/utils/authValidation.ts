const NAME_PATTERN = /^[a-zA-Z\s.'-]+$/;
const EMAIL_PATTERN = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

export function containsUnsafeSqlOrScriptChars(value: string): boolean {
  return (
    /['";<>]/.test(value) ||
    value.includes("--") ||
    value.includes("/*") ||
    value.includes("*/") ||
    // eslint-disable-next-line no-control-regex
    /[\x00-\x1f\x7f]/.test(value)
  );
}

export function validateAdminName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length < 3 || trimmed.length > 80) {
    return "Nama lengkap harus 3 hingga 80 karakter.";
  }
  if (!NAME_PATTERN.test(trimmed)) {
    return "Nama hanya boleh mengandung huruf, spasi, titik, tanda hubung, dan apostrof.";
  }
  return null;
}

export function validateAdminEmail(email: string): string | null {
  const normalized = email.trim().toLowerCase();
  if (!normalized || normalized.length > 120) {
    return "Email wajib diisi (maksimal 120 karakter).";
  }
  if (containsUnsafeSqlOrScriptChars(normalized)) {
    return "Email mengandung karakter yang tidak diizinkan.";
  }
  if (!EMAIL_PATTERN.test(normalized)) {
    return "Format email tidak valid.";
  }
  return null;
}

export interface PasswordStrengthResult {
  isValid: boolean;
  score: number;
  label: string;
  barColor: string;
  checks: {
    minLength: boolean;
    hasUpper: boolean;
    hasLower: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
    noSpace: boolean;
  };
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const checks = {
    minLength: password.length >= 8 && password.length <= 72,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(password),
    noSpace: password.length > 0 && !/\s/.test(password),
  };

  const criteriaMet = [
    checks.minLength,
    checks.hasUpper,
    checks.hasLower,
    checks.hasNumber,
    checks.hasSpecial,
  ].filter(Boolean).length;

  const isValid =
    checks.minLength &&
    checks.hasUpper &&
    checks.hasLower &&
    checks.hasNumber &&
    checks.hasSpecial &&
    checks.noSpace;

  let label = "Sangat Lemah";
  let barColor = "bg-destructive";
  if (criteriaMet === 2) {
    label = "Lemah";
    barColor = "bg-orange-500";
  } else if (criteriaMet === 3) {
    label = "Sedang";
    barColor = "bg-amber-500";
  } else if (criteriaMet === 4) {
    label = "Kuat";
    barColor = "bg-lime-500";
  } else if (criteriaMet === 5 && checks.noSpace) {
    label = "Sangat Kuat";
    barColor = "bg-emerald-500";
  }

  return {
    isValid,
    score: criteriaMet,
    label,
    barColor,
    checks,
  };
}

export function validateLoginPassword(password: string): string | null {
  if (!password) {
    return "Password wajib diisi.";
  }
  if (password.length > 72) {
    return "Password maksimal 72 karakter.";
  }
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x1f\x7f]/.test(password)) {
    return "Password mengandung karakter yang tidak valid.";
  }
  return null;
}
