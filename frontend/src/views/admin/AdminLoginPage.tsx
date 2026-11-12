import { useState, useEffect, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, ArrowLeft, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { validateAdminEmail, validateLoginPassword } from "@/utils/authValidation";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, token, user, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || "/admin";

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
    clearError();

    const trimmedEmail = email.trim().toLowerCase();
    const emailErr = validateAdminEmail(trimmedEmail);
    if (emailErr) {
      setLocalError(emailErr);
      return;
    }

    const passwordErr = validateLoginPassword(password);
    if (passwordErr) {
      setLocalError(passwordErr);
      return;
    }

    try {
      await login(trimmedEmail, password);
      navigate(from, { replace: true });
    } catch {
      // Error message already stored in useAuthStore
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
          {displayError && (
            <div className="mb-5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                Email Panitia
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  maxLength={120}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@porprov.kalteng.go.id"
                  className="w-full rounded-lg border border-border bg-background pl-10 pr-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
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
    </div>
  );
}
