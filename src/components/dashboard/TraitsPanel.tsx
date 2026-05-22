const traits = [
  { name: "Aggression", value: 82 },
  { name: "Patience", value: 68 },
  { name: "Adaptability", value: 78 },
  { name: "Resilience", value: 70 },
  { name: "Creativity", value: 62 },
  { name: "Loyalty", value: 55 },
  { name: "Deception", value: 72 },
  { name: "Precision", value: 75 },
];

const traitPositions = [
  "left-[112px] top-0 text-center",
  "right-1 top-10 text-right",
  "right-0 top-[92px] text-right",
  "right-8 bottom-6 text-right",
  "left-[105px] bottom-0 text-center",
  "left-8 bottom-6",
  "left-0 top-[92px]",
  "left-4 top-10",
];

export function TraitsPanel() {
  return (
    <section className="arena-panel p-4">
      <h3 className="font-tech text-xs uppercase">Traits Overview</h3>
      <div className="mt-3 grid place-items-center">
        <div className="relative h-[210px] w-[250px] max-w-full">
          <svg viewBox="0 0 250 210" className="h-full w-full">
            <polygon
              points="125,18 180,42 216,96 194,158 125,190 56,158 34,96 70,42"
              fill="rgba(123,37,255,.24)"
              stroke="#8531ff"
            />
            <polygon
              points="125,44 164,58 186,96 174,142 125,164 76,142 64,96 86,58"
              fill="rgba(141,41,255,.34)"
              stroke="#b13fff"
              strokeWidth="2"
            />
            {[0, 1, 2].map((i) => (
              <polygon
                key={i}
                points="125,18 180,42 216,96 194,158 125,190 56,158 34,96 70,42"
                fill="none"
                stroke="rgba(255,255,255,.12)"
                transform={`translate(${i * 0.3} ${i * 0.3}) scale(${1 - i * 0.18})`}
                style={{ transformOrigin: "125px 104px" }}
              />
            ))}
          </svg>
          {traits.map((trait, i) => (
            <div key={trait.name} className={`absolute text-[10px] text-white/70 ${traitPositions[i]}`}>
              <div>{trait.name}</div>
              <strong className="font-tech text-[#c896ff]">{trait.value}</strong>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex justify-center gap-8 text-xs text-white/58">
        <span className="flex items-center gap-2">
          <span className="h-px w-6 bg-[#a833ff]" /> This Agent
        </span>
        <span className="flex items-center gap-2">
          <span className="h-px w-6 border-t border-dashed border-white/40" /> Average
        </span>
      </div>
    </section>
  );
}
