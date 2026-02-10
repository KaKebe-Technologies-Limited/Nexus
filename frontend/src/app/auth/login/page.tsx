"use client";

import { AuthForm } from "../../../../components/auth/AuthForm";
import Link from "next/link";

export default function LoginPage() {
  const handleLogin = async (data: any) => {
    // Backend dev will implement this
    console.log("Login data:", data);
  };

  const handleSocialLogin = (provider: "google" | "apple") => {
    // Backend dev will implement this
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
          Don't have an account?{" "}
          <Link href="/auth/register" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>

      {/* Login Form */}
      <AuthForm
        mode="login"
        onSubmit={handleLogin}
        onSocialLogin={handleSocialLogin}
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
