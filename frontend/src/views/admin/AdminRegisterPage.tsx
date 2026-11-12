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
  Check,
  X,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import {
  evaluatePasswordStrength,
  validateAdminEmail,
  validateAdminName,
} from "@/utils/authValidation";

export default function AdminRegisterPage() {
  const navigate = useNavigate();
  const { register, token, user, isLoading, error, clearError } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const strength = evaluatePasswordStrength(password);

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

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    const nameErr = validateAdminName(trimmedName);
    if (nameErr) {
      setLocalError(nameErr);
      return;
    }

    const emailErr = validateAdminEmail(trimmedEmail);
    if (emailErr) {
      setLocalError(emailErr);
      return;
    }

    if (!strength.isValid) {
      setLocalError(
        "Password belum memenuhi kriteria Strong Password (minimal 8 karakter, huruf besar, huruf kecil, angka, karakter spesial, tanpa spasi).",
      );
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Konfirmasi password tidak cocok.");
      return;
    }

    try {
      await register(trimmedName, trimmedEmail, password);
      navigate("/admin", { replace: true });
    } catch {
      // Error message already stored in useAuthStore
    }
  };

  const displayError = localError || error;

  const strengthItems = [
    { label: "Minimal 8 karakter (maks. 72)", met: strength.checks.minLength },
    { label: "Huruf besar (A-Z)", met: strength.checks.hasUpper },
    { label: "Huruf kecil (a-z)", met: strength.checks.hasLower },
    { label: "Angka (0-9)", met: strength.checks.hasNumber },
    { label: "Karakter spesial (!@#$%^&*...)", met: strength.checks.hasSpecial },
    { label: "Tanpa spasi", met: strength.checks.noSpace },
  ];

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
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="h-4 w-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  maxLength={80}
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full rounded-lg border border-border bg-background pl-10 pr-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                3–80 karakter, hanya huruf, spasi, titik, tanda hubung, atau apostrof.
              </p>
            </div>

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
                  placeholder="Buat password yang kuat"
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

              {password.length > 0 && (
                <div className="mt-2.5 space-y-2 rounded-lg border border-border bg-muted/20 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Kekuatan Password:</span>
                    <span className="font-semibold text-foreground">{strength.label}</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 rounded-full transition-colors ${
                          strength.score >= level ? strength.barColor : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1">
                    {strengthItems.map((item) => (
                      <li
                        key={item.label}
                        className={`flex items-center gap-1.5 text-[11px] ${
                          item.met ? "text-emerald-600 font-medium" : "text-muted-foreground"
                        }`}
                      >
                        {item.met ? (
                          <Check className="h-3 w-3 shrink-0" />
                        ) : (
                          <X className="h-3 w-3 shrink-0" />
                        )}
                        <span>{item.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1.5">
                Konfirmasi Password
              </label>
              <div className="relative">
                <Lock className="h-4 w-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  maxLength={72}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password"
                  className="w-full rounded-lg border border-border bg-background pl-10 pr-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </div>
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
