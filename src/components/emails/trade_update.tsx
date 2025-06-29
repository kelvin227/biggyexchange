import * as React from "react";

interface TradeUpdateEmailProps {
  firstName: string;
  coin: string;
  amount: string;
  tradeId: string;
}

export function TradeUpdateEmail({ firstName, coin, amount, tradeId }: TradeUpdateEmailProps) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", color: "#222", background: "#f9f9f9", padding: "32px" }}>
      <div style={{ background: "#fff", borderRadius: "8px", maxWidth: "480px", margin: "0 auto", padding: "32px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <h2 style={{ color: "#0e7490" }}>Merchant Has Sent Your {coin}</h2>
        <p>Hi <strong>{firstName}</strong>,</p>
        <p>
          Good news! The merchant has sent you <strong>{amount} {coin}</strong> for your trade request (ID: <strong>{tradeId}</strong>).
        </p>
        <p>
          Please check your wallet and confirm if you have received the coin. If you have received it, kindly log in to your account and confirm the transaction to complete the trade.
        </p>
        <p>
          If you have not received the coin or have any issues, please contact support or open a dispute from your dashboard.
        </p>
        <div style={{ margin: "32px 0" }}>
          <a
            href="https://app.sociootc.com/user_dashboard"
            style={{
              background: "#0e7490",
              color: "#fff",
              padding: "12px 32px",
              borderRadius: "6px",
              textDecoration: "none",
              fontWeight: "bold",
              display: "inline-block"
            }}
          >
            Go to Dashboard
          </a>
        </div>
        <p style={{ fontSize: "13px", color: "#888" }}>
          Thank you for using SocioOTC.<br />
          The SocioOTC Team
        </p>
      </div>
    </div>
  );
}

export default TradeUpdateEmail;