import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const variants = {
      primary:
        "bg-gradient-to-r from-[#ED1C24] via-[#F7931E] to-[#FBB03B] text-white shadow-lg shadow-[#ED1C24]/25 hover:shadow-[#ED1C24]/40 hover:brightness-110",
      secondary:
        "bg-[#39B54A] text-white shadow-lg shadow-[#39B54A]/25 hover:bg-[#2ea03d]",
      outline:
        "border border-white/20 bg-transparent text-white hover:bg-white/5",
      ghost: "bg-transparent text-white/80 hover:bg-white/5 hover:text-white",
      danger: "bg-red-600/90 text-white hover:bg-red-600",
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
