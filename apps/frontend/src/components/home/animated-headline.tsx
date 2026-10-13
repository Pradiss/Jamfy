type HeadlineLine = {
  words: string[];
  accent?: boolean;
};

// Reveals the headline word by word on mount — each word slides up from
// behind its own line, staggered left to right, line by line.
export function AnimatedHeadline({
  lines,
  className = "",
}: {
  lines: HeadlineLine[];
  className?: string;
}) {
  const lineStartIndex = lines.reduce<number[]>((offsets, _line, i) => {
    offsets.push(i === 0 ? 0 : offsets[i - 1] + lines[i - 1].words.length);
    return offsets;
  }, []);

  return (
    <h1
      className={`text-balance text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl ${className}`}
    >
      {lines.map((line, lineIndex) => (
        <span key={lineIndex} className="block overflow-hidden pb-1">
          {line.words.map((word, wordInLineIndex) => {
            const delay =
              (lineStartIndex[lineIndex] + wordInLineIndex) * 70;

            return (
              <span
                key={wordInLineIndex}
                className="inline-block overflow-hidden align-bottom"
              >
                <span
                  className={`hero-word inline-block ${line.accent ? "text-accent" : ""}`}
                  style={{ animationDelay: `${delay}ms` }}
                >
                  {word}
                  {wordInLineIndex < line.words.length - 1 ? " " : ""}
                </span>
              </span>
            );
          })}
        </span>
      ))}
    </h1>
  );
}
