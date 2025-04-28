import { cn } from "@/utils";
import {
  forwardRef,
  useRef,
  useCallback,
  useLayoutEffect,
  useMemo,
} from "react";
import { textInputStyles } from "./text-input-styles";

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  value: string;
  labelClassName?: string;
  maxLengthClassName?: string;
  allowLineBreaks?: boolean;
  onEnter?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export const TextInput = forwardRef<HTMLTextAreaElement, Props>(
  (
    {
      label,
      value,
      maxLength,
      onChange,
      className,
      labelClassName,
      maxLengthClassName,
      rows = 1,
      allowLineBreaks = false,
      onEnter,
      ...props
    },
    ref
  ) => {
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

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        let newValue = e.target.value;

        if (!allowLineBreaks) {
          newValue = newValue.replace(/\r?\n/g, " ");
        }

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
      const textarea = textareaRef.current;
      if (!textarea) return;

      // "auto" required for height to shrink
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }, [value]);

    const isDirty = useMemo(() => {
      return !!value.length;
    }, [value]);

    const styles = useMemo(() => {
      return {
        container: cn(
          textInputStyles.container.base,
          textInputStyles.container.pseudo.before,
          textInputStyles.container.pseudo.after,
          textInputStyles.container.states.focus,
          isDirty && textInputStyles.container.states.dirty,
          className
        ),
        label: cn(
          textInputStyles.label.base,
          isDirty && textInputStyles.label.dirty,
          labelClassName
        ),
        maxLength: cn(
          textInputStyles.maxLength.base,
          isDirty && textInputStyles.maxLength.dirty,
          maxLengthClassName
        ),
      };
    }, [className, isDirty, labelClassName, maxLengthClassName]);

    return (
      <div className={styles.container}>
        <textarea
          ref={setRefs}
          id="question"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={textInputStyles.input}
          maxLength={maxLength}
          rows={rows}
          {...props}
        />
        <label htmlFor="question" className={styles.label}>
          {label}
        </label>
        <div className={styles.maxLength}>
          {value.length}/{maxLength}
        </div>
      </div>
    );
  }
);

TextInput.displayName = "TextInput";
