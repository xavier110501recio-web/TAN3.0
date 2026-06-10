// app.jsx - TheSauce feedback-only shell.
// Mounts the feedback experience inside the iOS frame.

const FB_KEY = "thesauce_feedback";
function loadFeedback() {
  try {
    const raw = localStorage.getItem(FB_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

function BottomNav({ submitted, onTab }) {
  return (
    <nav className="ts-nav">
      <button
        className={"ts-tab ts-tab-special active" + (submitted ? " ts-tab-done" : "")}
        onClick={onTab}
      >
        {!submitted && <span className="ts-tab-dot" />}
        <NavIcon name={submitted ? "feedback-done" : "feedback"} />
        <span className="ts-tab-label">{submitted ? "Done" : "Feedback"}</span>
      </button>
    </nav>
  );
}

function App() {
  const [feedback, setFeedback] = React.useState(loadFeedback);
  const [phase, setPhase] = React.useState("intro");

  const submitted = !!(feedback && feedback.submitted);

  const handleComplete = (data) => {
    try {
      localStorage.setItem(FB_KEY, JSON.stringify(data));
    } catch (e) {}
    setFeedback(data);
    setPhase("complete");
  };

  const showFeedbackHome = () => {
    setPhase("intro");
  };

  const restartFeedback = () => {
    setPhase("intro");
  };

  const content =
    phase === "flow" ? (
      <QuestionFlow onComplete={handleComplete} />
    ) : phase === "complete" ? (
      <CompletionScreen onBack={restartFeedback} />
    ) : (
      <IntroScreen onStart={() => setPhase("flow")} />
    );

  const navVisible = phase !== "flow";

  return (
    <div className="tsapp">
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          zIndex: 1,
        }}
      >
        {content}
      </div>
      {navVisible && <BottomNav submitted={submitted} onTab={showFeedbackHome} />}
    </div>
  );
}

function Root() {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0d0d0f",
        padding: 24,
        boxSizing: "border-box",
      }}
    >
      <IOSDevice dark>
        <App />
      </IOSDevice>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
