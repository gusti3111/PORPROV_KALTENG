import { useState, useEffect, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Lock,
  User,
  Mail,
  KeyRound,
  ArrowLeft,
  ShieldCheck,
  X,
} from "lucide-react";
import { getAPIErrorMessage } from "@/api/client";
import { useAuthStore } from "@/stores/authStore";
import {
  validateAdminEmail,
  validateAdminUsername,
  validateLoginPassword,
  validateStrongPassword,
} from "@/utils/authValidation";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    login,
    forgotPassword,
    resetPassword,
    token,
    user,
    isLoading,
    error,
    clearError,
  } = useAuthStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [loginSuccessNote, setLoginSuccessNote] = useState<string | null>(null);

  // Forgot Password 2-step modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotInfo, setForgotInfo] = useState<string | null>(null);

  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ||
    "/admin";

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (token && user) {
      navigate(from, { replace: true });
    }
  }, [token, user, navigate, from]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setLoginSuccessNote(null);
    clearError();

    const trimmedUsername = username.trim();
    const usernameErr = validateAdminUsername(trimmedUsername);
    if (usernameErr) {
      setLocalError(usernameErr);
      return;
    }

    const passwordErr = validateLoginPassword(password);
    if (passwordErr) {
      setLocalError(passwordErr);
      return;
    }

    try {
      await login(trimmedUsername, password);
      navigate(from, { replace: true });
    } catch {
      // Error message already stored in useAuthStore
    }
  };

  const openForgotModal = () => {
    setShowForgotModal(true);
    setForgotStep(1);
    setForgotEmail("");
    setResetToken("");
    setNewPassword("");
    setForgotError(null);
    setForgotInfo(null);
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotError(null);
    setForgotInfo(null);
  };

  const handleForgotStep1 = async (e: FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotInfo(null);

    const trimmedEmail = forgotEmail.trim().toLowerCase();
    const emailErr = validateAdminEmail(trimmedEmail);
    if (emailErr) {
      setForgotError(emailErr);
      return;
    }

    setForgotLoading(true);
    try {
      const data = await forgotPassword(trimmedEmail);
      if (data.reset_token) {
        setResetToken(data.reset_token);
        setForgotInfo(
          data.message ||
            "Token reset password berhasil dibuat (mode dev) dan otomatis diisikan di bawah.",
        );
      } else {
        setForgotInfo(
          data.message ||
            "Jika email terdaftar, token reset telah dikirim ke email Anda. Silakan masukkan token tersebut.",
        );
      }
      setForgotStep(2);
    } catch (err) {
      setForgotError(getAPIErrorMessage(err));
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotStep2 = async (e: FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotInfo(null);

    const trimmedToken = resetToken.trim();
    if (!trimmedToken) {
      setForgotError("Token reset wajib diisi.");
      return;
    }

    const pwErr = validateStrongPassword(newPassword);
    if (pwErr) {
      setForgotError(pwErr);
      return;
    }

    setForgotLoading(true);
    try {
      const data = await resetPassword(trimmedToken, newPassword);
      closeForgotModal();
      setLoginSuccessNote(
        data.message || "Password berhasil direset. Silakan login dengan password baru Anda.",
      );
    } catch (err) {
      setForgotError(getAPIErrorMessage(err));
    } finally {
      setForgotLoading(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Beranda
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="h-11 w-11 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Login Admin PORPROV
            </h1>
            <p className="text-sm text-muted-foreground">
              PORPROV XIII Kalteng 2026 • Panel Panitia
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6 sm:p-8">
          {loginSuccessNote && (
            <div className="mb-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
              {loginSuccessNote}
            </div>
          )}

          {displayError && (
            <div className="mb-5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-foreground mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="h-4 w-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  maxLength={50}
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full rounded-lg border border-border bg-background pl-10 pr-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                  Password
                </label>
                <button
                  type="button"
                  onClick={openForgotModal}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Lupa Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="h-4 w-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  maxLength={72}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full rounded-lg border border-border bg-background pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? "Memproses..." : "Masuk ke Panel Admin"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-border text-center text-sm text-muted-foreground">
            Belum punya akun admin?{" "}
            <Link to="/admin/register" className="font-semibold text-primary hover:underline">
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </div>

      {showForgotModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="forgot-password-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 id="forgot-password-title" className="text-lg font-bold text-foreground">
                  {forgotStep === 1 ? "Lupa Password (Langkah 1/2)" : "Reset Password (Langkah 2/2)"}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {forgotStep === 1
                    ? "Masukkan email akun admin Anda untuk meminta token reset."
                    : "Masukkan token reset dan password baru Anda."}
                </p>
              </div>
              <button
                type="button"
                onClick={closeForgotModal}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Tutup"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {forgotInfo && (
              <div className="mb-4 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3.5 py-2.5 text-xs text-sky-700 dark:text-sky-300">
                {forgotInfo}
              </div>
            )}

            {forgotError && (
              <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
                {forgotError}
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleForgotStep1} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="forgot-email" className="block text-sm font-medium text-foreground mb-1.5">
                    Email Terdaftar
                  </label>
                  <div className="relative">
                    <Mail className="h-4 w-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="forgot-email"
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="panitia@porprov.kalteng.go.id"
                      className="w-full rounded-lg border border-border bg-background pl-10 pr-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeForgotModal}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                  >
                    {forgotLoading ? "Mengirim..." : "Minta Token Reset"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleForgotStep2} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="reset-token" className="block text-sm font-medium text-foreground mb-1.5">
                    Token Reset
                  </label>
                  <div className="relative">
                    <KeyRound className="h-4 w-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="reset-token"
                      type="text"
                      required
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      placeholder="Tempel token dari email"
                      className="w-full rounded-lg border border-border bg-background pl-10 pr-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-foreground mb-1.5">
                    Password Baru
                  </label>
                  <div className="relative">
                    <Lock className="h-4 w-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      autoComplete="new-password"
                      maxLength={72}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 8 karakter kuat"
                      className="w-full rounded-lg border border-border bg-background pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showNewPassword ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    8–72 karakter: wajib huruf besar, huruf kecil, angka, karakter spesial, tanpa spasi.
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep(1);
                      setForgotError(null);
                    }}
                    className="text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    ← Kembali ke Langkah 1
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={closeForgotModal}
                      className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                    >
                      {forgotLoading ? "Menyimpan..." : "Simpan Password"}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
