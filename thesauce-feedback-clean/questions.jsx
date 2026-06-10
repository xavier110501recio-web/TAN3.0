// questions.jsx — TheSauce feedback: typed-answer model + text input
// Exports to window: QUESTIONS, renderQuestionText, TextAnswer

const QUESTIONS = [
  {
    key: "overall_rating",
    topic: "OVERALL",
    q: "How did TheSauce feel to use?",
    subtext: "First impression, in your own words.",
    minH: 96,
    placeholder:
      "e.g. Honestly? Smoother than I expected — kind of addictive once I got going, though day one felt slow…",
  },
  {
    key: "what_worked",
    topic: "WHAT WORKED",
    q: "What actually worked for you?",
    subtext: "The parts that made you want to come back.",
    minH: 130,
    placeholder:
      "e.g. The daily missions gave me something concrete to do. Seeing my streak climb kept me honest…",
  },
  {
    key: "what_frustrated",
    topic: "WHAT'S OFF",
    q: "What felt off or frustrated you?",
    subtext: "Be honest. This is the most important question.",
    minH: 130,
    placeholder:
      "e.g. A couple missions felt generic, and there were moments I wasn't sure what to do next…",
  },
  {
    key: "felt_personalized",
    topic: "MADE FOR YOU",
    q: "Did the missions feel specific to YOUR situation?",
    subtext: "Or did they feel like they'd work for anyone?",
    minH: 110,
    placeholder:
      "e.g. Mostly — the tone fit me, but I kept wishing they were tied to my actual business…",
  },
  {
    key: "would_return",
    topic: "STICKING WITH IT",
    q: "Could you see yourself using this consistently?",
    subtext: "If not daily — when, and what would have to be true?",
    minH: 120,
    placeholder:
      "e.g. Yeah, most mornings — as long as it keeps adapting to where I'm at. Or: probably not, because…",
  },
  {
    key: "would_pay_reason",
    topic: "WORTH PAYING",
    q: "What's the one thing that would make you pay $19/month for this?",
    subtext: "If nothing would — say that. Honesty helps more.",
    minH: 130,
    placeholder:
      "e.g. If the missions felt built around my exact situation. Or: nothing would, because I'd just use ChatGPT.",
  },
  {
    key: "anything_else",
    topic: "ANYTHING ELSE",
    q: "Anything else we should know?",
    subtext: "Optional. But this is where the best feedback usually lives.",
    minH: 120,
    placeholder: "Say whatever's on your mind — half-formed thoughts welcome.",
  },
];

// Turn the literal word YOUR into a gold accent.
function renderQuestionText(text) {
  const parts = text.split(/(\bYOUR\b)/);
  return parts.map((part, i) =>
    part === "YOUR" ? (
      <span key={i} className="ts-you">
        your
      </span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}

// Open text answer — auto-growing textarea with a guiding placeholder.
function TextAnswer({ value, onChange, placeholder, minH = 120, onEnter }) {
  const ref = React.useRef(null);

  // auto-grow
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.max(minH, el.scrollHeight) + "px";
  }, [value, minH]);

  React.useEffect(() => {
    if (ref.current) ref.current.focus();
  }, []);

  return (
    <div className="anim-fadeup">
      <textarea
        ref={ref}
        className="ts-textarea"
        data-gramm="false"
        data-gramm_editor="false"
        data-enable-grammarly="false"
        spellCheck="false"
        style={{ minHeight: minH }}
        placeholder={placeholder}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            onEnter && onEnter();
          }
        }}
      />
    </div>
  );
}

Object.assign(window, { QUESTIONS, renderQuestionText, TextAnswer });
