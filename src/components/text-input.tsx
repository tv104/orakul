import { cn } from "@/utils";
import {
  useState,
  forwardRef,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react";

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  value: string;
  allowLineBreaks?: boolean;
  onEnter?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

// Group styles by component part
const styles = {
  container: {
    base: "mb-4 relative group",
    pseudo: {
      before:
        "before:absolute before:h-[2px] before:w-full before:bg-indigo-100 hover:before:bg-indigo-200 before:bottom-0 before:left-0 before:right-0 before:transition-transform before:ease-out before:duration-400",
      after:
        "after:absolute after:h-[2px] after:w-full after:bg-indigo-100 hover:after:bg-indigo-200 after:top-0 after:left-0 after:right-0 after:transition-transform after:ease-out after:duration-400",
    },
    states: {
      focus:
        "focus-within:before:translate-y-[3px] focus-within:after:translate-y-[-3px] focus-within:before:bg-indigo-200 focus-within:after:bg-indigo-200",
      dirty:
        "before:translate-y-[3px] after:translate-y-[-3px] before:bg-indigo-200 after:bg-indigo-200",
    },
  },
  input:
    "w-full max-h-[50vh] p-2 py-4 rounded border-none outline-none text-2xl text-shadow-md overflow-auto resize-none",
  label: {
    base: "absolute pointer-events-none top-5 left-2 text-indigo-100 text-shadow-md mix-blend-luminosity font-medium uppercase transition-position duration-400 ease-out group-focus-within:-top-7",
    dirty: "-top-7 pointer-events-auto",
  },
  maxLength: {
    base: "text-xs absolute bottom-[-20px] right-0 group-focus-within:translate-y-[3px] text-indigo-100 opacity-0 group-focus-within:opacity-100 transition-all duration-400 ease-out",
    dirty: "translate-y-[3px] opacity-100",
  },
};

export const TextInput = forwardRef<HTMLTextAreaElement, Props>(
  (
    {
      label,
      value,
      maxLength,
      onChange,
      className,
      rows = 1,
      allowLineBreaks = false,
      onEnter,
      ...props
    },
    ref
  ) => {
    const [isDirty, setIsDirty] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    // Combine the forwarded ref with our local ref
    const setRefs = (element: HTMLTextAreaElement | null) => {
      textareaRef.current = element;
      if (typeof ref === "function") {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    };

    const adjustHeight = useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      // "auto" required for height to shrink
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }, []);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        let newValue = e.target.value;

        if (!allowLineBreaks) {
          newValue = newValue.replace(/\r?\n/g, " ");
        }

        setIsDirty(!!newValue.length);

        onChange?.({
          ...e,
          target: { ...e.target, value: newValue },
        } as React.ChangeEvent<HTMLTextAreaElement>);
      },
      [allowLineBreaks, onChange]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter") {
          if (!allowLineBreaks) e.preventDefault();
          onEnter?.(e);
        }
      },
      [allowLineBreaks, onEnter]
    );

    useLayoutEffect(() => {
      adjustHeight();
    }, [adjustHeight, value]);

    return (
      <div
        className={cn(
          styles.container.base,
          styles.container.pseudo.before,
          styles.container.pseudo.after,
          styles.container.states.focus,
          isDirty && styles.container.states.dirty,
          className
        )}
      >
        <textarea
          ref={setRefs}
          id="question"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={styles.input}
          maxLength={maxLength}
          rows={rows}
          {...props}
        />
        <label
          htmlFor="question"
          className={cn(styles.label.base, isDirty && styles.label.dirty)}
        >
          {label}
        </label>
        <div
          className={cn(
            styles.maxLength.base,
            isDirty && styles.maxLength.dirty
          )}
        >
          {value.length}/{maxLength}
        </div>
      </div>
    );
  }
);

TextInput.displayName = "TextInput";
