import { cn } from "@/utils";
import { useState, forwardRef } from "react";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  value: string;
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
    "w-full p-2 py-4 rounded border-none outline-none text-2xl text-shadow-md",
  label: {
    base: "absolute pointer-events-none top-0 bottom-0 left-2 text-indigo-100 text-shadow-md mix-blend-luminosity font-medium uppercase transition-transform duration-400 ease-out group-focus-within:translate-y-[-56px] inline-flex items-center",
    dirty: "translate-y-[-56px] pointer-events-auto",
  },
  maxLength: {
    base: "text-xs absolute bottom-[-20px] right-0 group-focus-within:translate-y-[3px] text-indigo-100 opacity-0 group-focus-within:opacity-100 transition-all duration-400 ease-out",
    dirty: "translate-y-[3px] opacity-100",
  },
};

export const TextInput = forwardRef<HTMLInputElement, Props>(
  ({ label, value, maxLength, onChange, className, ...props }, ref) => {
    const [isDirty, setIsDirty] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsDirty(!!e.target.value.length);
      onChange?.(e);
    };

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
        <input
          ref={ref}
          type="text"
          id="question"
          value={value}
          onChange={handleChange}
          className={styles.input}
          maxLength={maxLength}
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
