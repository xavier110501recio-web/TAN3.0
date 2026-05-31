export function Typing() {
  return (
    <div className="mt-6 flex items-center gap-2">
      {[0, 1, 2].map((i) => (
        <span key={i} className="h-1 w-1 rounded-full bg-sauce-gold animate-typing-bounce" style={{ animationDelay: `${i * 120}ms` }} />
      ))}
    </div>
  );
}
