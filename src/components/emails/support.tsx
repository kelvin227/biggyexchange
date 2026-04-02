import * as React from "react";

interface EmailTemplateProps {
  firstName: string;
  issueNumber: string;
  issueType: string;
  theme?: "dark" | "light";
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  firstName,
  issueNumber,
  issueType,
  theme = "dark",
}) => {
  const isDark = theme === "dark";

  const colors = {
    background: isDark ? "#0b0b0c" : "#f6f8fb",
    card: isDark ? "#121316" : "#ffffff",
    border: isDark ? "#1f2937" : "#e5e7eb",
    textPrimary: isDark ? "#f9fafb" : "#111827",
    textSecondary: isDark ? "#9ca3af" : "#4b5563",
    gold: "#d4af37",
    midgold: "#c9a531",
    darkgold: "#6d521b",
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        backgroundColor: colors.background,
        padding: "30px 15px",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          backgroundColor: colors.card,
          border: `1px solid ${colors.border}`,
          borderRadius: "14px",
          overflow: "hidden",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            padding: "24px",
            textAlign: "center",
            background: `linear-gradient(135deg, ${colors.gold}, ${colors.midgold}, ${colors.darkgold})`,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "22px",
              color: "#ffffff",
              letterSpacing: "0.5px",
            }}
          >
            Biggy Exchange Support
          </h1>
        </div>

        {/* BODY */}
        <div style={{ padding: "32px 24px", color: colors.textPrimary }}>
          <p style={{ marginTop: 0 }}>Hi {firstName},</p>

          <p style={{ color: colors.textSecondary }}>
            We’ve successfully received your support request. Our team is
            reviewing your issue and will get back to you within{" "}
            <strong style={{ color: colors.gold }}>
              2–5 business working days
            </strong>.
          </p>

          {/* ISSUE BOX */}
          <div
            style={{
              margin: "28px 0",
              padding: "18px",
              borderRadius: "10px",
              backgroundColor: isDark ? "#0f172a" : "#f9fafb",
              border: `1px solid ${colors.border}`,
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td
                    style={{
                      padding: "10px 0",
                      fontWeight: "bold",
                      width: "140px",
                      color: colors.textSecondary,
                    }}
                  >
                    Issue Number:
                  </td>
                  <td
                    style={{
                      padding: "10px 0",
                      color: colors.gold,
                      fontWeight: "bold",
                    }}
                  >
                    {issueNumber}
                  </td>
                </tr>

                <tr>
                  <td
                    style={{
                      padding: "10px 0",
                      fontWeight: "bold",
                      color: colors.textSecondary,
                    }}
                  >
                    Issue Type:
                  </td>
                  <td
                    style={{
                      padding: "10px 0",
                      color: colors.textPrimary,
                    }}
                  >
                    {issueType}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p style={{ color: colors.textSecondary }}>
            Please keep your issue number safe. It will help us track and resolve
            your request faster if you need to follow up.
          </p>

          <p style={{ color: colors.textSecondary }}>
            Thank you for your patience while we work on resolving your issue.
          </p>

          <p style={{ marginBottom: 0 }}>
            Regards,
            <br />
            <strong style={{ color: colors.textPrimary }}>
              Biggy Exchange Support Team
            </strong>
          </p>
        </div>

        {/* FOOTER */}
        <div
          style={{
            borderTop: `1px solid ${colors.border}`,
            padding: "16px 24px",
            fontSize: "12px",
            color: colors.textSecondary,
            textAlign: "center",
          }}
        >
          This is an automated email confirming we received your support request.
          Please do not reply to this email.
        </div>
      </div>
    </div>
  );
};