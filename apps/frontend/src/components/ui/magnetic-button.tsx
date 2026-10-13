"use client";

import type { MouseEvent, ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

type MagneticButtonProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  // "solid": accent fill — for buttons on a plain/neutral background (the
  // header CTA). "inverse": accent-foreground fill — for buttons that sit
  // on top of an accent-colored panel, so they still read against it.
  variant?: "solid" | "inverse";
  size?: "default" | "compact";
  disabled?: boolean;
  className?: string;
};

// A small magnetic pull toward the cursor — capped so it stays subtle
// instead of the button chasing the pointer across the screen.
function applyMagnetic(event: MouseEvent<HTMLElement>) {
  const el = event.currentTarget;
  const rect = el.getBoundingClientRect();
  const x = event.clientX - rect.left - rect.width / 2;
  const y = event.clientY - rect.top - rect.height / 2;
  el.style.setProperty("--mx", `${x * 0.12}px`);
  el.style.setProperty("--my", `${y * 0.3}px`);
}

function resetMagnetic(event: MouseEvent<HTMLElement>) {
  event.currentTarget.style.setProperty("--mx", "0px");
  event.currentTarget.style.setProperty("--my", "0px");
}

function Face({ children }: { children: ReactNode }) {
  return (
    <span className="mb-face">
      <span className="mb-fill" aria-hidden="true" />
      <span className="mb-chip" aria-hidden="true">
        <span className="mb-icon-1">
          <ArrowRight />
        </span>
        <span className="mb-icon-2">
          <Check />
        </span>
      </span>
      <span className="mb-label">
        <span className="mb-roll">
          <span className="mb-l1">{children}</span>
          <span className="mb-l2" aria-hidden="true">
            {children}
          </span>
        </span>
      </span>
    </span>
  );
}

export function MagneticButton({
  children,
  href,
  onClick,
  type = "button",
  variant = "solid",
  size = "default",
  disabled,
  className = "",
}: MagneticButtonProps) {
  const classes = `mb ${variant === "inverse" ? "mb-inverse" : "mb-solid"} ${
    size === "compact" ? "mb-compact" : ""
  } ${className}`.trim();

  if (href) {
    return (
      <Link
        href={href}
        onMouseMove={applyMagnetic}
        onMouseLeave={resetMagnetic}
        className={classes}
      >
        <Face>{children}</Face>
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={applyMagnetic}
      onMouseLeave={resetMagnetic}
      className={classes}
    >
      <Face>{children}</Face>
    </button>
  );
}
