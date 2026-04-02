"use client";

import React, { useState } from "react";

type ChatMessage = {
  sender: "user" | "bot";
  text: string;
};

export type ChatResponse = {
  reply: string;
  mode: "support" | "dev";
};


export default function SupportComp() {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: "bot", text: "Hi, how can I help you?" },
  ]);
  const [loading, setLoading] = useState<boolean>(false);




  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();

    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
       const response = await fetch(`/api/agent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage }),
    });

      const data = await response.json().catch(() => null);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text:
            data.reply ||
            data.message ||
            "Message sent successfully, but no reply was returned.",
        },
      ]);
    } catch (error) {
      console.error("Webhook error:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Failed to send message to webhook.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.chatBox}>
        <div style={styles.messages}>
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                ...styles.message,
                alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                backgroundColor: msg.sender === "user" ? "#4f46e5" : "#e5e7eb",
                color: msg.sender === "user" ? "#fff" : "#111",
              }}
            >
              {msg.text}
            </div>
          ))}

          {loading && (
            <div style={{ ...styles.message, }}>
              Sending...
            </div>
          )}
        </div>

        <div style={styles.inputArea}>
          <input
            type="text"
            value={input}
            placeholder="Type your message..."
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setInput(e.target.value)
            }
            onKeyDown={handleKeyDown}
            style={styles.input}
          />
          <button onClick={sendMessage} style={styles.button}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  chatBox: {
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    padding: "16px",
    fontSize: "18px",
    fontWeight: "bold",
    borderBottom: "1px solid #e5e7eb",
  },
  messages: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "16px",
    overflowY: "auto",
  },
  message: {
    maxWidth: "75%",
    padding: "10px 14px",
    borderRadius: "12px",
    fontSize: "14px",
  },
  inputArea: {
    display: "flex",
    padding: "12px",
    borderTop: "1px solid #e5e7eb",
    gap: "8px",
  },
  input: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    outline: "none",
  },
  button: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "10px",
    background: "#4f46e5",
    color: "#fff",
    cursor: "pointer",
  },
};