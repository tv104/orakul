import { cn } from "@/utils";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "cursor-pointer uppercase transition-opacity shadow-2xl transition-colors duration-short",
  {
    variants: {
      variant: {
        contained: "bg-neutral-100 text-gray-500",
        outlined: "bg-transparent text-gray-100 border border-gray-300",
      },
      size: {
        medium: "px-5 py-2 font-medium text-sm rounded-md",
        large: "px-6 py-3 font-medium text-lg rounded",
      },
      state: {
        default: "",
        disabled: "opacity-70 cursor-not-allowed",
      },
    },
    compoundVariants: [
      {
        variant: "contained",
        state: "default",
        className: "hover:bg-white active:bg-neutral-200 hover:text-gray-600",
      },
      {
        variant: "outlined",
        state: "default",
        className:
          "bg-transparent hover:bg-neutral-200/10 active:bg-transparent hover:text-white",
      },
    ],
    defaultVariants: {
      variant: "contained",
      size: "medium",
      state: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = ({
  children,
  className,
  disabled,
  size,
  variant,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(
        buttonVariants({
          variant,
          size,
          state: disabled ? "disabled" : "default",
        }),
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
