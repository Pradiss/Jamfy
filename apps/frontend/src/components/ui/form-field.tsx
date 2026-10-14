import type { InputHTMLAttributes } from "react";

// 16px is the line iOS Safari uses to decide whether to auto-zoom on focus
// — anything smaller (this used to be 15px) triggers an unwanted zoom the
// instant someone taps into any field on the site.
export const inputClass =
  "rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-base outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15 ";

type FormFieldProps = {
  label: string;
} & InputHTMLAttributes<HTMLInputElement>;

export function FormField({ label, ...inputProps }: FormFieldProps) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-zinc-700 ">
        {label}
      </span>
      <input {...inputProps} className={inputClass} />
    </label>
  );
}
