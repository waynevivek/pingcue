import { ImageResponse } from "next/og";

export const alt = "PingCue — Automated Invoice Reminders for Freelancers";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background: "linear-gradient(180deg, #5BC2FF 0%, #84D6FF 55%, #C7F584 100%)",
          padding: "48px",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        {/* Crisp white app window */}
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: "#FFFFFF",
            borderRadius: 36,
            border: "2px solid rgba(17, 17, 17, 0.08)",
            boxShadow: "0 24px 60px rgba(15, 23, 42, 0.16)",
            padding: "46px 56px",
          }}
        >
          {/* Top brand & pricing strip */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: "#C3F584",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="28" height="28" viewBox="0 0 20 20" fill="none">
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
              <span
                style={{
                  fontSize: 30,
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  color: "#111111",
                }}
              >
                PingCue
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                borderRadius: 9999,
                background: "#111111",
                color: "#FFFFFF",
                padding: "10px 22px",
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              $19 one-time · No subscription
            </div>
          </div>

          {/* Main editorial headline */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
              maxWidth: 960,
            }}
          >
            <div
              style={{
                fontSize: 64,
                fontWeight: 700,
                lineHeight: 1.06,
                letterSpacing: "-0.04em",
                color: "#111111",
              }}
            >
              Stop awkwardly chasing unpaid invoices.
            </div>
            <div
              style={{
                fontSize: 26,
                lineHeight: 1.45,
                color: "#52525B",
              }}
            >
              Automated escalating email reminders &amp; 1-click WhatsApp nudges
              for freelancers who send payment links.
            </div>
          </div>

          {/* Escalation pill strip */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              paddingTop: 18,
              borderTop: "1px solid rgba(17, 17, 17, 0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 9999,
                  background: "#DCFCE7",
                  border: "1px solid #BBF7D0",
                  color: "#14532D",
                  padding: "8px 18px",
                  fontSize: 20,
                  fontWeight: 600,
                }}
              >
                -3d Friendly
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 9999,
                  background: "#FEF08A",
                  border: "1px solid #FDE047",
                  color: "#713F12",
                  padding: "8px 18px",
                  fontSize: 20,
                  fontWeight: 600,
                }}
              >
                +7d Firm
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 9999,
                  background: "#FFE4E6",
                  border: "1px solid #FECDD3",
                  color: "#9F1239",
                  padding: "8px 18px",
                  fontSize: 20,
                  fontWeight: 600,
                }}
              >
                +30d Final notice
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                borderRadius: 9999,
                background: "#F4F4F5",
                color: "#111111",
                padding: "8px 18px",
                fontSize: 19,
                fontWeight: 600,
              }}
            >
              USD · EUR · GBP · INR
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
