import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-[var(--text)] placeholder:text-slate-400",
        "focus:border-[var(--navy-light)] focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/15 transition-colors",
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
        "w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-[var(--text)] placeholder:text-slate-400 resize-none",
        "focus:border-[var(--navy-light)] focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/15 transition-colors",
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
    <label htmlFor={htmlFor} className={cn("mb-1.5 block text-sm font-semibold text-[var(--navy)]", className)}>
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
        "w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-[var(--text)]",
        "focus:border-[var(--navy-light)] focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/15",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
