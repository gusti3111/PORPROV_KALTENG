import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  ArrowLeft,
  UserPlus,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import {
  validateAdminEmail,
  validateAdminUsername,
  validateRegisterPassword,
} from "@/utils/authValidation";

export default function AdminRegisterPage() {
  const navigate = useNavigate();
  const { register, token, user, isLoading, error, clearError } = useAuthStore();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (token && user) {
      navigate("/admin", { replace: true });
    }
  }, [token, user, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();

    const usernameErr = validateAdminUsername(trimmedUsername);
    if (usernameErr) {
      setLocalError(usernameErr);
      return;
    }

    const emailErr = validateAdminEmail(trimmedEmail);
    if (emailErr) {
      setLocalError(emailErr);
      return;
    }

    const passwordErr = validateRegisterPassword(password);
    if (passwordErr) {
      setLocalError(passwordErr);
      return;
    }

    try {
      await register(trimmedUsername, trimmedEmail, password);
      navigate("/admin", { replace: true });
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
            <UserPlus className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Registrasi Admin PORPROV
            </h1>
            <p className="text-sm text-muted-foreground">
              Buat akun panitia untuk mengelola jadwal, hasil, dan bagan
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

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
                  placeholder="contoh: panitia_kobar"
                  className="w-full rounded-lg border border-border bg-background pl-10 pr-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                3–50 karakter (huruf, angka, titik, underscore, atau strip).
              </p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                Email
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
                  placeholder="panitia@porprov.kalteng.go.id"
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
                  autoComplete="new-password"
                  maxLength={72}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? "Mendaftarkan..." : "Daftar & Masuk"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-border text-center text-sm text-muted-foreground">
            Sudah punya akun admin?{" "}
            <Link to="/admin/login" className="font-semibold text-primary hover:underline">
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
