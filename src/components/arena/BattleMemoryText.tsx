import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type BattleMemoryTextProps = {
  content: string;
  /** Wrapper class, for the calling card's spacing. */
  className?: string;
  /** Extra paragraph classes where a card uses a different type scale. */
  textClassName?: string;
};

/**
 * Battle narrations run anywhere from one line to a full paragraph, which used to
 * stretch the memory cards to wildly different heights. Show two lines and let the
 * player open the rest.
 */
export function BattleMemoryText({ content, className, textClassName }: BattleMemoryTextProps) {
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  // Measure rather than count characters: the same narration fits two lines in a
  // wide card and four in a narrow one.
  useEffect(() => {
    const element = textRef.current;
    if (!element || expanded) return;

    const measure = () => setIsClamped(element.scrollHeight > element.clientHeight + 1);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [content, expanded]);

  return (
    <div className={className}>
      <p
        ref={textRef}
        className={cn("font-mono text-[11px] italic leading-relaxed text-white/65", !expanded && "line-clamp-2", textClassName)}
      >
        {content}
      </p>
      {isClamped ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-1.5 font-tech text-[9px] font-semibold uppercase tracking-wider text-accent transition-colors hover:text-white"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      ) : null}
    </div>
  );
}
