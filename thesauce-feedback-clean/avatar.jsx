// avatar.jsx — coach avatar, nav icons, small glyphs for TheSauce
// Exports to window: CoachAvatar, NavIcon, Arrow, CheckMark

// Coach presence — a gold-ringed monogram avatar (placeholder for the coach's portrait).
function CoachAvatar({ size = 48, glow = true }) {
  const ring = Math.max(1.5, size * 0.035);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        padding: ring,
        background: "linear-gradient(150deg, var(--sauce-gold-bright), var(--sauce-gold-dim))",
        flex: "none",
        boxShadow: glow ? "0 0 0 1px rgba(0,0,0,0.4), 0 8px 24px rgba(200,164,90,0.22)" : "none",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background:
            "radial-gradient(120% 120% at 30% 25%, #20180c, #0c0a06 70%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(60% 50% at 50% 18%, rgba(232,196,122,0.28), transparent 70%)",
          }}
        />
        <span
          style={{
            fontFamily: "var(--serif)",
            fontWeight: 700,
            fontSize: size * 0.5,
            lineHeight: 1,
            color: "var(--sauce-gold-bright)",
            position: "relative",
            marginTop: size * 0.02,
            textShadow: "0 1px 6px rgba(200,164,90,0.4)",
          }}
        >
          S
        </span>
      </div>
    </div>
  );
}

function Arrow({ size = 14, color = "currentColor", dir = "right" }) {
  const rot = { right: 0, left: 180, up: -90, down: 90 }[dir] || 0;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      style={{ transform: `rotate(${rot}deg)`, flex: "none" }}
    >
      <path
        d="M3 8h9M8.5 4l4 4-4 4"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckMark({ size = 11, color = "#1a1408" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <path
        d="M2.5 6.2l2.4 2.4L9.5 3.8"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Bottom-nav line icons (simple single-stroke glyphs)
function NavIcon({ name, size = 22 }) {
  const p = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  switch (name) {
    case "today":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.4v2.2M12 19.4v2.2M2.4 12h2.2M19.4 12h2.2M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6" />
        </svg>
      );
    case "missions":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="8.4" />
          <circle cx="12" cy="12" r="3.4" />
          <circle cx="12" cy="12" r="0.4" fill="currentColor" />
        </svg>
      );
    case "map":
      return (
        <svg {...p}>
          <path d="M9 4.2L4 6v13.8l5-1.8 6 2 5-1.8V4.4l-5 1.8-6-2z" />
          <path d="M9 4.2v14M15 6.2v14" />
        </svg>
      );
    case "community":
      return (
        <svg {...p}>
          <circle cx="9" cy="9.2" r="3" />
          <path d="M3.8 19c0-3 2.4-5 5.2-5s5.2 2 5.2 5" />
          <path d="M16 7.4a2.8 2.8 0 010 5.4M16.8 19c0-2.4-1-4.2-2.4-5" />
        </svg>
      );
    case "profile":
      return (
        <svg {...p}>
          <circle cx="12" cy="8.4" r="3.6" />
          <path d="M5.4 19.6c0-3.4 2.9-6 6.6-6s6.6 2.6 6.6 6" />
        </svg>
      );
    case "feedback":
      return (
        <svg {...p}>
          <path d="M4 5.4h16v10.2H10.6L6 19.2v-3.6H4z" />
        </svg>
      );
    case "feedback-done":
      return (
        <svg {...p}>
          <path d="M4 5.4h16v10.2H10.6L6 19.2v-3.6H4z" />
          <path d="M8.6 10.2l2 2 3.8-3.8" />
        </svg>
      );
    default:
      return <svg {...p} />;
  }
}

Object.assign(window, { CoachAvatar, Arrow, CheckMark, NavIcon });
