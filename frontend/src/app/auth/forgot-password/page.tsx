"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "../../../../components/ui/Button";

export default function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Password reset requested");
    setEmailSent(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Link
          href="/auth/login"
          className="text-sm text-muted-foreground hover:text-black flex items-center space-x-1"
        >
          <svg
            className="w-4 h-4 rotate-180"
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
          <span>Back to Login</span>
        </Link>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-black">Forgot password?</h1>
        <p className="text-sm text-muted-foreground">
          No worries, we'll send you reset instructions.
        </p>
      </div>

      {!emailSent ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@company.com"
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <Button type="submit" className="w-full py-6 text-lg">
            Reset Password
          </Button>
        </form>
      ) : (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
          <p className="text-green-800 font-medium">Check your email!</p>
          <p className="text-green-600 text-sm mt-1">
            We sent a password reset link to your inbox.
          </p>
          <Button
            variant="ghost"
            onClick={() => setEmailSent(false)}
            className="mt-4 text-sm"
          >
            Didn't get the email? Try again
          </Button>
        </div>
      )}
    </div>
  );
}
