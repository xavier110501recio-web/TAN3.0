// feedback.jsx — TheSauce feedback experience: Intro · QuestionFlow · Completion
// Exports to window: IntroScreen, QuestionFlow, CompletionScreen

// ───────────────────────────────────────────────────────────────
// SCREEN A — Intro
// ───────────────────────────────────────────────────────────────
function IntroScreen({ onStart }) {
  return (
    <div className="ts-scroll" style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "32px 30px",
        }}
      >
        <div className="anim-fadeup" style={{ animationDelay: "40ms" }}>
          <CoachAvatar size={48} />
        </div>
        <div className="ts-eyebrow anim-fadeup" style={{ marginTop: 22, animationDelay: "120ms" }}>
          Beta Feedback
        </div>
        <h1
          className="anim-fadeup"
          style={{
            fontFamily: "var(--serif)",
            fontWeight: 700,
            fontSize: 32,
            lineHeight: 1.1,
            color: "var(--sauce-cream)",
            margin: "14px 0 0",
            maxWidth: 280,
            letterSpacing: "0.01em",
            animationDelay: "180ms",
          }}
        >
          Help us build<br />something real.
        </h1>
        <p
          className="ts-subtext anim-fadeup"
          style={{ fontSize: 15, maxWidth: 320, margin: "16px 0 0", animationDelay: "240ms" }}
        >
          7 questions, answered in your own words. A few honest minutes — and your
          answers directly shape the next version of TheSauce.
        </p>
        <div className="ts-dots anim-fadeup" style={{ marginTop: 28, animationDelay: "300ms" }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <span key={i} className={i === 0 ? "on" : ""} />
          ))}
        </div>
      </div>
      <div style={{ padding: "0 24px 30px" }}>
        <button className="ts-btn ts-btn-gold anim-fadeup" style={{ animationDelay: "360ms" }} onClick={onStart}>
          Start <Arrow size={15} color="#1a1408" />
        </button>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
// Coach header (shared inside the flow)
// ───────────────────────────────────────────────────────────────
function CoachHeader() {
  return (
    <div className="ts-coachrow">
      <CoachAvatar size={32} glow={false} />
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <span className="ts-coachname">The Coach</span>
        <span className="ts-coachstatus" style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "var(--sauce-success)",
              boxShadow: "0 0 5px rgba(74,124,89,0.9)",
            }}
          />
          Listening
        </span>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
// SCREEN B — Typed question flow
// ───────────────────────────────────────────────────────────────
function QuestionFlow({ onComplete }) {
  const total = QUESTIONS.length;
  const [step, setStep] = React.useState(0);
  const [dir, setDir] = React.useState("right");
  const [answers, setAnswers] = React.useState(() =>
    QUESTIONS.reduce((acc, q) => ({ ...acc, [q.key]: "" }), {})
  );
  const scrollRef = React.useRef(null);

  const q = QUESTIONS[step];
  const value = answers[q.key];
  const last = step === total - 1;

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [step]);

  const set = (v) => setAnswers((a) => ({ ...a, [q.key]: v }));

  const goNext = () => {
    if (last) {
      submit();
    } else {
      setDir("right");
      setStep((s) => s + 1);
    }
  };
  const goBack = () => {
    if (step > 0) {
      setDir("left");
      setStep((s) => s - 1);
    }
  };

  const submit = () => {
    const t = (k) => (answers[k] || "").trim();
    onComplete({
      submitted: true,
      submitted_at: new Date().toISOString(),
      overall_rating: t("overall_rating") || null,
      what_worked: t("what_worked") || null,
      what_frustrated: t("what_frustrated") || null,
      felt_personalized: t("felt_personalized") || null,
      would_return: t("would_return") || null,
      would_pay_reason: t("would_pay_reason"),
      anything_else: t("anything_else") || null,
    });
  };

  const progressPct = ((step + 1) / total) * 100;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative", zIndex: 1 }}>
      {/* progress bar */}
      <div className="ts-progress">
        <div className="ts-progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      {/* fixed top: back + coach */}
      <div style={{ padding: "16px 24px 4px", flex: "none" }}>
        <div style={{ height: 24, marginBottom: 8 }}>
          {step > 0 && (
            <button className="ts-back" onClick={goBack}>
              <Arrow size={13} dir="left" /> Back
            </button>
          )}
        </div>
        <CoachHeader />
      </div>

      {/* scrolling question body */}
      <div className="ts-scroll" ref={scrollRef} style={{ padding: "0 24px" }}>
        <div key={step} className={dir === "left" ? "anim-left" : "anim-right"} style={{ paddingTop: 18, paddingBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
            <span className="ts-eyebrow">{q.topic}</span>
            <span className="ts-qcount">
              {String(step + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
          </div>
          <h2 className="ts-question" style={{ margin: 0 }}>
            {renderQuestionText(q.q)}
          </h2>
          {q.subtext && (
            <p className="ts-subtext" style={{ margin: "10px 0 0" }}>
              {q.subtext}
            </p>
          )}
          <div style={{ marginTop: 20 }}>
            <TextAnswer
              key={step}
              value={value}
              onChange={set}
              placeholder={q.placeholder}
              minH={q.minH}
              onEnter={goNext}
            />
          </div>
        </div>
      </div>

      {/* footer */}
      <div style={{ padding: "10px 24px 30px", flex: "none" }}>
        <button className="ts-btn ts-btn-gold" onClick={goNext}>
          {last ? "Submit feedback" : "Next"} <Arrow size={15} color="#1a1408" />
        </button>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────
// SCREEN C — Completion
// ───────────────────────────────────────────────────────────────
function Confetti() {
  const pieces = React.useMemo(() => {
    const colors = ["var(--sauce-gold)", "var(--sauce-gold-bright)", "var(--sauce-cream)"];
    return Array.from({ length: 12 }).map((_, i) => {
      const angle = Math.PI * (0.15 + 0.7 * (i / 11));
      const dist = 120 + Math.random() * 120;
      const dx = Math.cos(angle) * dist * (i % 2 === 0 ? -1 : 1);
      const dy = -(80 + Math.random() * 180);
      return {
        dx: `${dx}px`,
        dy: `${dy}px`,
        rot: `${(Math.random() * 540 - 270).toFixed(0)}deg`,
        color: colors[i % colors.length],
        delay: `${Math.random() * 120}ms`,
        w: 5 + Math.round(Math.random() * 4),
      };
    });
  }, []);
  return (
    <div className="ts-confetti">
      {pieces.map((p, i) => (
        <span
          key={i}
          style={{
            "--dx": p.dx,
            "--dy": p.dy,
            "--rot": p.rot,
            background: p.color,
            width: p.w,
            height: p.w,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

function CompletionScreen({ onBack }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative", zIndex: 1 }}>
      <Confetti />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "32px 30px",
        }}
      >
        <div className="anim-fadeup" style={{ animationDelay: "60ms" }}>
          <CoachAvatar size={64} />
        </div>
        <h1
          className="anim-fadeup"
          style={{
            fontFamily: "var(--serif)",
            fontWeight: 700,
            fontSize: 32,
            lineHeight: 1.12,
            color: "var(--sauce-cream)",
            margin: "22px 0 0",
            animationDelay: "160ms",
          }}
        >
          Thank you.
        </h1>
        <p
          className="ts-subtext anim-fadeup"
          style={{ fontSize: 15, maxWidth: 320, margin: "14px 0 0", animationDelay: "230ms" }}
        >
          Every answer you gave is going directly into the next version. You helped
          build this.
        </p>
        <div className="ts-eyebrow anim-fadeup" style={{ marginTop: 26, fontSize: 11, animationDelay: "300ms" }}>
          ✦ Feedback Received
        </div>
      </div>
      <div style={{ padding: "0 24px 30px" }}>
        <button className="ts-btn ts-btn-ghost anim-fadeup" style={{ animationDelay: "380ms" }} type="button">
          Back to home <Arrow size={15} color="var(--sauce-cream)" />
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { IntroScreen, QuestionFlow, CompletionScreen });
