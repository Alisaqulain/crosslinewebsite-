import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "navy";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const variants = {
      primary:
        "bg-[var(--brand-red)] text-white shadow-lg shadow-[var(--brand-red)]/25 hover:bg-[var(--brand-red-hover)]",
      secondary:
        "bg-[var(--cricket-green)] text-white shadow-lg shadow-[var(--cricket-green)]/25 hover:bg-[var(--cricket-green-light)]",
      navy: "bg-[var(--navy)] text-white hover:bg-[var(--navy-mid)]",
      outline:
        "border-2 border-[var(--navy)] bg-transparent text-[var(--navy)] hover:bg-[var(--navy)] hover:text-white",
      ghost: "bg-transparent text-[var(--navy)] hover:bg-[var(--bg-alt)]",
      danger: "bg-red-600 text-white hover:bg-red-700",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm rounded-lg",
      md: "px-5 py-2.5 text-sm rounded-xl",
      lg: "px-8 py-3.5 text-base rounded-xl",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
