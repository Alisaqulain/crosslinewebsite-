import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-xl border border-white/10 bg-[#0b1219] px-4 py-3 text-white placeholder:text-slate-500",
        "focus:border-[#F7931E]/50 focus:outline-none focus:ring-2 focus:ring-[#F7931E]/20 transition-colors",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-xl border border-white/10 bg-[#0b1219] px-4 py-3 text-white placeholder:text-slate-500 resize-none",
        "focus:border-[#F7931E]/50 focus:outline-none focus:ring-2 focus:ring-[#F7931E]/20 transition-colors",
        className
      )}
      {...props}
    />
  )
);

Textarea.displayName = "Textarea";

export function Label({
  children,
  htmlFor,
  className,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <label htmlFor={htmlFor} className={cn("mb-1.5 block text-sm font-medium text-slate-300", className)}>
      {children}
    </label>
  );
}

export function Select({
  children,
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-xl border border-white/10 bg-[#0b1219] px-4 py-3 text-white",
        "focus:border-[#F7931E]/50 focus:outline-none focus:ring-2 focus:ring-[#F7931E]/20",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
