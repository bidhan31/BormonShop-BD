"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/AuthContext";
import GoogleButton from "@/components/GoogleButton";

// ─── Step 2 modal — shown after Google OAuth succeeds ───────────────────────

interface Step2Props {
  googleToken: string;
  profile: { name: string; email: string; picture: string };
  onCancel: () => void;
}

function GoogleStep2({ googleToken, profile, onCancel }: Step2Props) {
  const router = useRouter();
  const { googleRegister } = useAuth();
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await googleRegister(googleToken, mobileNumber, password);
      router.push("/dashboard/user");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm bg-secondary border border-border rounded-2xl p-7 shadow-2xl animate-fadeIn">
        {/* Google account preview */}
        <div className="flex items-center gap-3 mb-6 p-3 bg-primary rounded-xl border border-border">
          {profile.picture && (
            <Image
              src={profile.picture}
              alt={profile.name}
              width={40}
              height={40}
              className="rounded-full"
            />
          )}
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-ink truncate">{profile.name}</p>
            <p className="text-xs text-muted truncate">{profile.email}</p>
          </div>
          <span className="ml-auto text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-full shrink-0">
            Google
          </span>
        </div>

        <h2 className="font-display text-xl font-semibold text-ink mb-1">One last step</h2>
        <p className="text-muted text-sm mb-6">Set your phone number and a password to complete your account.</p>

        {error && (
          <div className="bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="mobileNumber" className="block text-sm text-ink mb-1.5">
              Mobile Number
            </label>
            <input
              id="mobileNumber"
              type="tel"
              required
              placeholder="01XXXXXXXXX"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="w-full bg-primary border border-border rounded-lg px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm text-ink mb-1.5">
              Password
            </label>
            <input
              id="newPassword"
              type="password"
              required
              minLength={6}
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-primary border border-border rounded-lg px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-accent"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-gold w-full disabled:opacity-50"
          >
            {isSubmitting ? "Creating account..." : "Complete Sign Up"}
          </button>
        </form>

        <button
          type="button"
          onClick={onCancel}
          className="w-full text-center text-muted text-sm mt-4 hover:text-ink transition-colors"
        >
          Use a different account
        </button>
      </div>
    </div>
  );
}

// ─── Main register page ──────────────────────────────────────────────────────

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, googleLogin } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", password: "", mobileNumber: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Step 2 state — set when Google OAuth succeeds but no account exists yet
  const [googleStep2, setGoogleStep2] = useState<{
    token: string;
    profile: { name: string; email: string; picture: string };
  } | null>(null);

  // If redirected from /login after Google said "no account found", auto-show Step 2
  useEffect(() => {
    const googleParam = searchParams.get("google");
    const token = searchParams.get("token");
    const name = searchParams.get("name");
    const email = searchParams.get("email");
    const picture = searchParams.get("picture");

    if (googleParam === "1" && token && name && email) {
      setGoogleStep2({ token, profile: { name, email, picture: picture ?? "" } });
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await register(form.name, form.email, form.password, form.mobileNumber);
      router.push("/dashboard/user");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (token: string) => {
    setError("");
    setIsGoogleLoading(true);
    try {
      const result = await googleLogin(token);
      if (result.needsRegistration) {
        // No account yet → show the Step 2 completion modal
        setGoogleStep2({ token, profile: result.profile! });
      } else {
        // Already registered — go to dashboard
        router.push("/dashboard/user");
      }
    } catch (err: any) {
      setError(err.message || "Google sign-in failed");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <>
      {/* Step 2 overlay */}
      {googleStep2 && (
        <GoogleStep2
          googleToken={googleStep2.token}
          profile={googleStep2.profile}
          onCancel={() => setGoogleStep2(null)}
        />
      )}

      <main className="min-h-[80vh] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl font-semibold text-ink text-center mb-2">Create your account</h1>
          <p className="text-muted text-sm text-center mb-8">Join BormonShop BD for faster checkout</p>

          {error && (
            <div className="bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          {/* Google sign-up */}
          <GoogleButton
            label={isGoogleLoading ? "Connecting..." : "Sign up with Google"}
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google sign-up was cancelled or failed.")}
            disabled={isGoogleLoading || isSubmitting}
          />

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted text-xs">or sign up with email</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm text-ink mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm text-ink mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label htmlFor="mobileNumber" className="block text-sm text-ink mb-1.5">
                Mobile Number
              </label>
              <input
                id="mobileNumber"
                name="mobileNumber"
                type="tel"
                placeholder="01XXXXXXXXX"
                value={form.mobileNumber}
                onChange={handleChange}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-ink mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={handleChange}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-accent"
              />
            </div>

            <button type="submit" disabled={isSubmitting || isGoogleLoading} className="btn-gold w-full disabled:opacity-50">
              {isSubmitting ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="text-muted text-sm text-center mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-accent hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterContent />
    </Suspense>
  );
}
