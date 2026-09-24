import type { InputHTMLAttributes } from "react";

export const inputClass =
  "rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-[15px] outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15 dark:border-white/15 dark:bg-white/5 dark:focus:ring-accent/20";

type FormFieldProps = {
  label: string;
} & InputHTMLAttributes<HTMLInputElement>;

export function FormField({ label, ...inputProps }: FormFieldProps) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </span>
      <input {...inputProps} className={inputClass} />
    </label>
  );
}
