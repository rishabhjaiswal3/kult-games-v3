import { useCallback, useMemo, useState, type ChangeEvent, type InputHTMLAttributes } from "react";

type UseNumericInputOptions = {
  /** Minimum allowed value after blur / commit. */
  min?: number;
  /** When true, only whole numbers are accepted while typing. */
  integer?: boolean;
};

/**
 * Mobile-friendly numeric input: lets the user clear the field while editing,
 * then clamps to `min` on blur or when `commit()` is called before submit.
 */
export function useNumericInput(initial: number, options: UseNumericInputOptions = {}) {
  const min = options.min ?? 1;
  const integer = options.integer ?? true;

  const [draft, setDraft] = useState(String(initial));
  const [value, setValue] = useState(initial);

  const normalize = useCallback(
    (raw: string): number => {
      const parsed = integer ? Number.parseInt(raw, 10) : Number.parseFloat(raw);
      if (!raw.trim() || !Number.isFinite(parsed)) return min;
      const next = integer ? Math.floor(parsed) : parsed;
      return Math.max(min, next);
    },
    [integer, min],
  );

  const commit = useCallback((): number => {
    const next = normalize(draft);
    setValue(next);
    setDraft(String(next));
    return next;
  }, [draft, normalize]);

  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value;
      const pattern = integer ? /^\d*$/ : /^\d*\.?\d*$/;
      if (pattern.test(next)) setDraft(next);
    },
    [integer],
  );

  const onBlur = useCallback(() => {
    commit();
  }, [commit]);

  const resolved = useMemo(() => {
    const parsed = integer ? Number.parseInt(draft, 10) : Number.parseFloat(draft);
    if (draft.trim() && Number.isFinite(parsed)) {
      const next = integer ? Math.floor(parsed) : parsed;
      return Math.max(min, next);
    }
    return value;
  }, [draft, integer, min, value]);

  const inputProps: Pick<
    InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "onBlur" | "inputMode" | "type" | "autoComplete"
  > = {
    type: "text",
    inputMode: integer ? "numeric" : "decimal",
    autoComplete: "off",
    value: draft,
    onChange,
    onBlur,
  };

  return {
    /** Last committed numeric value. */
    value,
    /** Best-effort numeric value while typing (falls back to committed value). */
    resolved,
    /** Raw string shown in the input. */
    draft,
    commit,
    inputProps,
    setValue: (next: number) => {
      const clamped = Math.max(min, next);
      setValue(clamped);
      setDraft(String(clamped));
    },
  };
}
