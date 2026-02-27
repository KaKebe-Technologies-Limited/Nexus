"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    setError("");
    try {
      const tokens = await apiClient("/auth/login/", {
        method: "POST",
        body: JSON.stringify(data),
      });
      useAuthStore.getState().setTokens(tokens.access, tokens.refresh);

      const user = await apiClient("/auth/me/");
      useAuthStore.getState().setUser(user);

      router.push("/dashboard");
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: "google" | "apple") => {
    // TODO: implement social login
    console.log("Social login:", provider);
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex justify-end">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-black flex items-center space-x-1"
        >
          <span>Back to website</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>

      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-black">
          Log in to your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Login Form */}
      <AuthForm
        mode="login"
        onSubmit={handleLogin}
        onSocialLogin={handleSocialLogin}
        isLoading={isLoading}
      />

      {/* Forgot Password Link */}
      <div className="text-center">
        <Link
          href="/auth/forgot-password"
          className="text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
        >
          Forgot your password?
        </Link>
      </div>
    </div>
  );
}
