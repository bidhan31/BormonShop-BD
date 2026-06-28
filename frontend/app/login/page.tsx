"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import GoogleButton from "@/components/GoogleButton";

export default function LoginPage() {
  const router = useRouter();
  const { login, googleLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login(email, password);
      router.push("/dashboard/user");
    } catch (err: any) {
      setError(err.message || "Login failed");
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
        // No account found — send to register page with a hint
        const params = new URLSearchParams({
          google: "1",
          name: result.profile?.name ?? "",
          email: result.profile?.email ?? "",
          picture: result.profile?.picture ?? "",
          token,
        });
        router.push(`/register?${params.toString()}`);
      } else {
        router.push("/dashboard/user");
      }
    } catch (err: any) {
      setError(err.message || "Google sign-in failed");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-semibold text-ink text-center mb-2">Welcome back</h1>
        <p className="text-muted text-sm text-center mb-8">Log in to your BormonShop BD account</p>

        {error && (
          <div className="bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {/* Google sign-in */}
        <GoogleButton
          label={isGoogleLoading ? "Signing in..." : "Sign in with Google"}
          onSuccess={handleGoogleSuccess}
          onError={() => setError("Google sign-in was cancelled or failed.")}
          disabled={isGoogleLoading || isSubmitting}
        />

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-muted text-xs">or continue with email</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-ink mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-ink mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-ink focus:outline-none focus:border-accent"
            />
          </div>

          <button type="submit" disabled={isSubmitting || isGoogleLoading} className="btn-gold w-full disabled:opacity-50">
            {isSubmitting ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="text-muted text-sm text-center mt-6">
          Don't have an account?{" "}
          <Link href="/register" className="text-accent hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
