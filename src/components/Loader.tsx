"use client";
import { useEffect } from "react";

export default function GlobalLoader({ isLoading }: { isLoading: boolean }) {
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="loader-overlay">
      <svg viewBox="0 0 200 200" width="120" height="120">
        <g id="arrows">
          <path
            d="M100 20 A80 80 0 0 1 180 100"
            fill="none"
            stroke="#0A4C7D"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <polygon points="170,85 190,100 170,115" fill="#0A4C7D" />

          <path
            d="M100 180 A80 80 0 0 1 20 100"
            fill="none"
            stroke="#F4B400"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <polygon points="30,85 10,100 30,115" fill="#F4B400" />
        </g>

        <text
          x="100"
          y="115"
          textAnchor="middle"
          fontSize="60"
          fontWeight="bold"
          fill="#F4B400"
        >
          ₿
        </text>
      </svg>

      <style jsx>{`
        .loader-overlay {
          position: fixed;
          inset: 0;
          background: rgba(255, 255, 255, 0.85);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          backdrop-filter: blur(4px);
        }

        #arrows {
          transform-box: fill-box;
          transform-origin: center;
          animation: spin 1.6s cubic-bezier(.4,0,.2,1) infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        text {
            filter: drop-shadow(0 0 6px rgba(244,180,0,0.6));
        }
      
      `}</style>
    </div>
  );
}