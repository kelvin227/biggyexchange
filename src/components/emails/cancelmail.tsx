import * as React from "react";

interface CancelMailProps {
  firstName: string;
  tradeId: string;
  merchantName: string;
  tradeAmount: string;
  tradeCurrency: string;
  tradeStatus: string;
  cancelReason?: string;
}

export const CancelMailTemplate: React.FC<Readonly<CancelMailProps>> = ({
  firstName,
  tradeId,
  merchantName,
  tradeAmount,
  tradeCurrency,
  tradeStatus,
  cancelReason,
}) => (
  <div style={{ fontFamily: "Arial, sans-serif", lineHeight: "1.6", color: "#333" }}>
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px", border: "1px solid #ddd", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
      <h1 style={{ color: "#F44336", textAlign: "center" }}>Trade Cancelled</h1>
      <p>Hi {firstName},</p>
      <p>
        We regret to inform you that your trade request with <strong>{merchantName}</strong> has been <strong>cancelled</strong>.
      </p>
      <table style={{ width: "100%", borderCollapse: "collapse", margin: "20px 0" }}>
        <tbody>
          <tr>
            <td style={{ padding: "8px", border: "1px solid #ddd" }}>Trade ID:</td>
            <td style={{ padding: "8px", border: "1px solid #ddd" }}>{tradeId}</td>
          </tr>
          <tr>
            <td style={{ padding: "8px", border: "1px solid #ddd" }}>Merchant Name:</td>
            <td style={{ padding: "8px", border: "1px solid #ddd" }}>{merchantName}</td>
          </tr>
          <tr>
            <td style={{ padding: "8px", border: "1px solid #ddd" }}>Amount:</td>
            <td style={{ padding: "8px", border: "1px solid #ddd" }}>
              {tradeAmount} {tradeCurrency}
            </td>
          </tr>
          <tr>
            <td style={{ padding: "8px", border: "1px solid #ddd" }}>Status:</td>
            <td style={{ padding: "8px", border: "1px solid #ddd" }}>{tradeStatus}</td>
          </tr>
          {cancelReason && (
            <tr>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>Reason:</td>
              <td style={{ padding: "8px", border: "1px solid #ddd" }}>{cancelReason}</td>
            </tr>
          )}
        </tbody>
      </table>
      <p>
        If you have any questions or believe this was a mistake, please contact our support team for assistance.
      </p>
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <a
          href="https://your-platform.com/support"
          style={{
            display: "inline-block",
            padding: "10px 20px",
            backgroundColor: "#F44336",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "5px",
          }}
        >
          Contact Support
        </a>
      </div>
      <p style={{ marginTop: "20px", fontSize: "12px", color: "#777" }}>
        If you did not initiate this trade request, please contact support immediately.
      </p>
    </div>
  </div>
);