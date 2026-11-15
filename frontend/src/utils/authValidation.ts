const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-zA-Z0-9._-]{3,50}$/;

export function validateAdminUsername(username: string): string | null {
  const normalized = username.trim();
  if (!normalized) {
    return "Username wajib diisi.";
  }
  if (!USERNAME_PATTERN.test(normalized)) {
    return "Username harus 3–50 karakter (huruf, angka, '.', '_', '-').";
  }
  return null;
}

export function validateAdminEmail(email: string): string | null {
  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    return "Email wajib diisi.";
  }
  if (!EMAIL_PATTERN.test(normalized)) {
    return "Format email tidak valid.";
  }
  return null;
}

export function validateLoginIdentifier(identifier: string): string | null {
  const normalized = identifier.trim();
  if (!normalized) {
    return "Email atau username wajib diisi.";
  }
  if (normalized.includes("@")) {
    if (!EMAIL_PATTERN.test(normalized.toLowerCase())) {
      return "Format email tidak valid.";
    }
    return null;
  }
  if (!USERNAME_PATTERN.test(normalized)) {
    return "Username harus 3–50 karakter (huruf, angka, '.', '_', '-') atau masukkan email yang valid.";
  }
  return null;
}

export function validateStrongPassword(password: string): string | null {
  if (!password) {
    return "Password wajib diisi.";
  }
  if (password.length < 8 || password.length > 72) {
    return "Password harus 8–72 karakter.";
  }
  if (/\s/.test(password)) {
    return "Password tidak boleh mengandung spasi.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password harus mengandung minimal 1 huruf besar.";
  }
  if (!/[a-z]/.test(password)) {
    return "Password harus mengandung minimal 1 huruf kecil.";
  }
  if (!/[0-9]/.test(password)) {
    return "Password harus mengandung minimal 1 angka.";
  }
  if (!/[^a-zA-Z0-9\s]/.test(password)) {
    return "Password harus mengandung minimal 1 karakter spesial.";
  }
  return null;
}

export const validateRegisterPassword = validateStrongPassword;

export function validateLoginPassword(password: string): string | null {
  if (!password) {
    return "Password wajib diisi.";
  }
  return null;
}
