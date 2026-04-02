"use client";
export default function GlobalLoader() {

  return (
    <div className="loader-overlay">
      <svg viewBox="0 0 200 200" width="120" height="120">
        <g className="arrows">
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
          background: rgba(255, 255, 255, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          pointer-events: all;
        }

        .arrows {
          transform-box: fill-box;
          transform-origin: center;
          animation: spin 1.4s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}