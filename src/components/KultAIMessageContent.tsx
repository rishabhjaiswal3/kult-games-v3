import { Fragment, ReactNode } from "react";

const renderInline = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={`${part}-${index}`} className="font-semibold text-white">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={`${part}-${index}`}>{part}</Fragment>
    ),
  );
};

const isTableBlock = (lines: string[]) =>
  lines.length >= 2 &&
  lines.every((line) => line.trim().startsWith("|")) &&
  /^\|?[\s:-]+\|[\s|:-]*$/.test(lines[1].trim());

const renderTable = (lines: string[], key: string) => {
  const [headerLine, , ...bodyLines] = lines;
  const headers = headerLine
    .split("|")
    .map((cell) => cell.trim())
    .filter(Boolean);
  const rows = bodyLines
    .map((line) =>
      line
        .split("|")
        .map((cell) => cell.trim())
        .filter(Boolean),
    )
    .filter((row) => row.length > 0);

  return (
    <div key={key} className="overflow-x-auto rounded-xl border border-white/10 bg-black/10">
      <table className="min-w-full border-collapse text-left text-[12px]">
        <thead>
          <tr className="border-b border-white/10 bg-white/5">
            {headers.map((header, index) => (
              <th key={`${header}-${index}`} className="px-3 py-2 font-semibold text-[hsl(278_100%_82%)]">
                {renderInline(header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`${key}-row-${rowIndex}`} className="border-b border-white/5 last:border-b-0">
              {row.map((cell, cellIndex) => (
                <td key={`${key}-cell-${rowIndex}-${cellIndex}`} className="px-3 py-2 align-top text-foreground/90">
                  {renderInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const renderList = (lines: string[], key: string, ordered: boolean) => {
  const Tag = ordered ? "ol" : "ul";
  const itemClassName = ordered ? "ml-4 list-decimal space-y-1.5" : "ml-4 list-disc space-y-1.5";

  return (
    <Tag key={key} className={itemClassName}>
      {lines.map((line, index) => {
        const content = ordered ? line.replace(/^\d+\.\s+/, "") : line.replace(/^- /, "");
        return <li key={`${key}-${index}`}>{renderInline(content)}</li>;
      })}
    </Tag>
  );
};

const renderParagraphBlock = (lines: string[], key: string) => {
  const content: ReactNode[] = [];

  lines.forEach((line, index) => {
    if (line.startsWith("### ")) {
      content.push(
        <h4 key={`${key}-${index}`} className="text-sm font-semibold text-[hsl(278_100%_82%)]">
          {renderInline(line.slice(4))}
        </h4>,
      );
      return;
    }

    if (line.startsWith("## ")) {
      content.push(
        <h3 key={`${key}-${index}`} className="text-sm font-semibold uppercase tracking-[0.14em] text-[hsl(278_100%_82%)]">
          {renderInline(line.slice(3))}
        </h3>,
      );
      return;
    }

    content.push(
      <p key={`${key}-${index}`} className="leading-relaxed text-foreground/92">
        {renderInline(line)}
      </p>,
    );
  });

  return (
    <div key={key} className="space-y-2">
      {content}
    </div>
  );
};

const KultAIMessageContent = ({ text }: { text: string }) => {
  const blocks = text
    .trim()
    .split(/\n\s*\n/)
    .map((block) => block.split("\n").map((line) => line.trimEnd()))
    .filter((lines) => lines.some((line) => line.trim().length > 0));

  if (blocks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {blocks.map((lines, index) => {
        const key = `${index}-${lines[0]}`;

        if (isTableBlock(lines)) {
          return renderTable(lines, key);
        }

        if (lines.every((line) => /^- /.test(line))) {
          return renderList(lines, key, false);
        }

        if (lines.every((line) => /^\d+\.\s+/.test(line))) {
          return renderList(lines, key, true);
        }

        return renderParagraphBlock(lines, key);
      })}
    </div>
  );
};

export default KultAIMessageContent;
