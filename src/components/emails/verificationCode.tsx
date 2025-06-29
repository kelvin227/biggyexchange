import * as React from "react";

interface VerificationEmailProps {
  firstName: string;
  code: string;
}

export const VerificationEmail: React.FC<Readonly<VerificationEmailProps>> = ({
  firstName,
  code,
}) => (
  <div style={{ fontFamily: "Arial, sans-serif", lineHeight: "1.6", color: "#333" }}>
    <div style={{
      maxWidth: "500px",
      margin: "0 auto",
      padding: "24px",
      border: "1px solid #e5e7eb",
      borderRadius: "10px",
      backgroundColor: "#f9f9f9"
    }}>
      <h2 style={{ color: "#2563eb", textAlign: "center" }}>Verify Your Email Address</h2>
      <p>Hi {firstName},</p>
      <p>
        Thank you for signing up! Please use the verification code to verify your email address:
      </p>
      <div style={{
        textAlign: "center",
        margin: "32px 0"
      }}>
        <span style={{
          display: "inline-block",
          background: "#2563eb",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "2rem",
          letterSpacing: "0.3em",
          padding: "16px 32px",
          borderRadius: "8px"
        }}>
          {code}
        </span>
      </div>
      <p>
        If you did not request this code, you can safely ignore this email.
      </p>
      <p style={{ marginTop: "32px", fontSize: "12px", color: "#888" }}>
        Need help? Contact our support team.
      </p>
    </div>
  </div>
);