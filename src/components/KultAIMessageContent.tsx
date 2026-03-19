import { Fragment } from "react";

interface KultAIMessageContentProps {
  text: string;
}

const renderInline = (text: string) =>
  text.split(/(\*\*.*?\*\*)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-[hsl(278_100%_90%)]">
          {part.slice(2, -2)}
        </strong>
      );
    }

    return <Fragment key={index}>{part}</Fragment>;
  });

const isMarkdownTableSeparator = (line: string) =>
  /^\|?(?:\s*:?-{3,}:?\s*\|)+\s*:?-{3,}:?\s*\|?$/.test(line.trim());

const isMarkdownTable = (lines: string[]) =>
  lines.length >= 2
  && lines.every((line) => line.trim().startsWith("|") && line.trim().endsWith("|"))
  && isMarkdownTableSeparator(lines[1]);

const parseTableRow = (line: string) =>
  line
    .trim()
    .slice(1, -1)
    .split("|")
    .map((cell) => cell.trim());

const isUnorderedList = (lines: string[]) => lines.every((line) => /^[-*]\s+/.test(line));

const isOrderedList = (lines: string[]) => lines.every((line) => /^\d+\.\s+/.test(line));

const renderParagraphs = (lines: string[]) =>
  lines.map((line, index) => (
    <p key={index} className={index === 0 ? "" : "mt-2"}>
      {renderInline(line)}
    </p>
  ));

export default function KultAIMessageContent({ text }: KultAIMessageContentProps) {
  const blocks = text
    .trim()
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <div className="space-y-3 break-words">
      {blocks.map((block, blockIndex) => {
        const lines = block.split("\n").map((line) => line.trimEnd()).filter(Boolean);

        if (isMarkdownTable(lines)) {
          const [headerLine, , ...rowLines] = lines;
          const headers = parseTableRow(headerLine);
          const rows = rowLines.map(parseTableRow);

          return (
            <div key={blockIndex} className="overflow-x-auto rounded-xl border border-[hsl(278_100%_70%/0.16)]">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-[hsl(278_100%_70%/0.08)] text-[hsl(278_100%_90%)]">
                  <tr>
                    {headers.map((header, headerIndex) => (
                      <th key={headerIndex} className="px-3 py-2 font-semibold">
                        {renderInline(header)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-t border-[hsl(278_100%_70%/0.1)]">
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="px-3 py-2 align-top text-foreground/90">
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        if (isUnorderedList(lines)) {
          return (
            <ul key={blockIndex} className="space-y-2 pl-5">
              {lines.map((line, lineIndex) => (
                <li key={lineIndex} className="list-disc marker:text-[hsl(278_100%_82%)]">
                  {renderInline(line.replace(/^[-*]\s+/, ""))}
                </li>
              ))}
            </ul>
          );
        }

        if (isOrderedList(lines)) {
          return (
            <ol key={blockIndex} className="space-y-2 pl-5">
              {lines.map((line, lineIndex) => (
                <li key={lineIndex} className="list-decimal marker:text-[hsl(278_100%_82%)]">
                  {renderInline(line.replace(/^\d+\.\s+/, ""))}
                </li>
              ))}
            </ol>
          );
        }

        return (
          <div key={blockIndex} className="space-y-2">
            {renderParagraphs(lines)}
          </div>
        );
      })}
    </div>
  );
}
