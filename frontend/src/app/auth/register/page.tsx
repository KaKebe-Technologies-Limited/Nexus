"use client";

import { AuthForm } from "../../../../components/auth/AuthForm";
import Link from "next/link";

export default function RegisterPage() {
  const handleRegister = async (data: any) => {
    // Backend dev will implement this
    console.log("Register data:", data);
  };

  const handleSocialLogin = (provider: "google" | "apple") => {
    // Backend dev will implement this
    console.log("Social login:", provider);
  };

  return (
    <div className="space-y-6">
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

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-black">Create an account</h1>
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>

      <AuthForm
        mode="register"
        onSubmit={handleRegister}
        onSocialLogin={handleSocialLogin}
      />
    </div>
  );
}
