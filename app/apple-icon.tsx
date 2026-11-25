import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#C3F584",
          borderRadius: 42,
        }}
      >
        <svg
          width="112"
          height="112"
          viewBox="0 0 20 20"
          fill="none"
        >
          <rect
            x="3"
            y="4.5"
            width="14"
            height="11"
            rx="2.5"
            stroke="#111111"
            strokeWidth="1.8"
          />
          <path
            d="M4.5 6.8L10 10.8L15.5 6.8"
            stroke="#111111"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
