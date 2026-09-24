import { containerClass } from "@/lib/ui";

export function Footer() {
  return (
    <footer className="border-t border-black/5 px-6 py-8 dark:border-white/10">
      <div
        className={`${containerClass} text-center text-[13px] text-zinc-400 dark:text-zinc-600`}
      >
        Jamfy — conectando artistas e contratantes.
      </div>
    </footer>
  );
}
