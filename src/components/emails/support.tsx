import * as React from "react";

interface EmailTemplateProps {
  firstName: string;
  tradeId: string;
  merchantName: string;
  tradeAmount: string;
  tradeCurrency: string;
  tradeStatus: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  firstName,
  tradeId,
  merchantName,
  tradeAmount,
  tradeCurrency,
  tradeStatus,
}) => (
  <div style={{ fontFamily: "Arial, sans-serif", lineHeight: "1.6", color: "#333" }}>
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px", border: "1px solid #ddd", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
      <h1 style={{ color: "#4CAF50", textAlign: "center" }}>Trade Request Accepted</h1>
      <p>Hi {firstName},</p>
      <p>
        Great news! Your trade request has been accepted by <strong>{merchantName}</strong>.
        Below are the details of your trade:
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
        </tbody>
      </table>
      <p>
        Please proceed to complete the trade as soon as possible. If you have any questions or concerns, feel free to contact support.
      </p>
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <a
          href="https://your-platform.com/trades"
          style={{
            display: "inline-block",
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "5px",
          }}
        >
          View Trade
        </a>
      </div>
      <p style={{ marginTop: "20px", fontSize: "12px", color: "#777" }}>
        If you did not initiate this trade request, please contact support immediately.
      </p>
    </div>
  </div>
);