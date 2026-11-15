import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, KeyRound, Lock } from "lucide-react";
import { getAPIErrorMessage } from "@/api/client";
import { useAuthStore } from "@/stores/authStore";
import { validateStrongPassword } from "@/utils/authValidation";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const resetPassword = useAuthStore((s) => s.resetPassword);

  const [token, setToken] = useState(searchParams.get("token") || "");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const trimmedToken = token.trim();
    if (!trimmedToken) {
      setError("Token reset wajib diisi.");
      return;
    }

    const pwErr = validateStrongPassword(newPassword);
    if (pwErr) {
      setError(pwErr);
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPassword(trimmedToken, newPassword);
      setSuccessMsg(
        res.message || "Password berhasil direset. Mengalihkan ke halaman login...",
      );
      setTimeout(() => {
        navigate("/admin/login", { replace: true });
      }, 1500);
    } catch (err) {
      setError(getAPIErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          to="/admin/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Login
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="h-11 w-11 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center text-primary">
            <KeyRound className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Reset Password
            </h1>
            <p className="text-sm text-muted-foreground">
              PORPROV XIII Kalteng 2026 • Pemulihan Akun
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6 sm:p-8">
          {successMsg && (
            <div className="mb-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
              {successMsg}
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Masukkan token reset password"
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
                  type={showPassword ? "text" : "password"}
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
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                8–72 karakter: wajib huruf besar, huruf kecil, angka, karakter spesial, tanpa spasi.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? "Memproses..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
