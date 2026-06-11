"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import apiClient from "@/lib/api-client";

type Status = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("No verification token found. Please check your email link.");
      return;
    }

    apiClient
      .get(`/auth/verify-email?token=${token}`)
      .then(() => {
        setStatus("success");
        setMessage("Your email has been verified!");
        // Redirect to dashboard after 3 seconds
        setTimeout(() => router.push("/dashboard"), 3000);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(
          err?.response?.data?.detail ||
            "This link is invalid or has expired. Please request a new one."
        );
      });
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8fafc" }}>
      <div className="card" style={{ maxWidth: 440, width: "100%", margin: "0 auto", padding: "48px 40px", textAlign: "center" }}>
        {/* Logo */}
        <div style={{ marginBottom: 32 }}>
          <span className="t-subheading grad-text" style={{ fontWeight: 700 }}>PulseIQ</span>
        </div>

        {status === "loading" && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <h1 className="t-subheading" style={{ marginBottom: 8 }}>Verifying your email…</h1>
            <p className="t-small" style={{ color: "#94a3b8" }}>Please wait a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h1 className="t-subheading" style={{ marginBottom: 8 }}>Email verified!</h1>
            <p className="t-body" style={{ color: "#475569", marginBottom: 24 }}>{message}</p>
            <p className="t-small" style={{ color: "#94a3b8" }}>Redirecting you to your dashboard…</p>
          </>
        )}

        {status === "error" && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
            <h1 className="t-subheading" style={{ marginBottom: 8 }}>Verification failed</h1>
            <p className="t-body" style={{ color: "#475569", marginBottom: 32 }}>{message}</p>
            <Link href="/dashboard" className="btn btn-primary" style={{ display: "inline-block" }}>
              Go to dashboard
            </Link>
          </>
        )}
      </div>
    </div>
  );
}