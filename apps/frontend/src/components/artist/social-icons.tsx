type IconProps = { className?: string };

export function InstagramIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14 21v-7.5h2.5l.5-3H14V8.2c0-.9.3-1.5 1.6-1.5H17V4.1C16.7 4 15.8 4 14.8 4 12.6 4 11 5.3 11 7.8v2.7H8.5v3H11V21" />
    </svg>
  );
}

export function YoutubeIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="2.5" y="6" width="19" height="12" rx="3.5" />
      <path d="M10.5 9.5v5l4.3-2.5-4.3-2.5Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SpotifyIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      className={className}
    >
      <circle cx="12" cy="12" r="9.25" />
      <path d="M7 10.2c3.2-1 7-.7 9.7 1" />
      <path d="M7.4 13c2.6-.8 5.7-.5 8 .9" />
      <path d="M7.8 15.6c2-.6 4.5-.4 6.3.7" />
    </svg>
  );
}

export function TiktokIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14 3.5v11.2a3.3 3.3 0 1 1-2.6-3.23" />
      <path d="M14 3.5c.5 2.3 2.1 3.9 4.2 4.3" />
    </svg>
  );
}

export function WhatsappIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.5a9.4 9.4 0 0 0-8.06 14.2L2.5 21.5l4.94-1.4A9.4 9.4 0 1 0 12 2.5Zm0 1.8a7.6 7.6 0 1 1 0 15.2 7.5 7.5 0 0 1-3.87-1.07l-.28-.16-2.77.79.8-2.7-.18-.3A7.6 7.6 0 0 1 12 4.3Zm-2.25 3.3c-.2 0-.5.07-.77.37-.26.3-1 1-1 2.4 0 1.4 1.02 2.77 1.17 2.96.14.2 2 3.15 4.98 4.3 2.48.94 2.98.75 3.52.7.54-.05 1.72-.7 1.97-1.38.24-.68.24-1.26.17-1.38-.07-.12-.26-.2-.55-.34-.28-.14-1.72-.85-1.99-.95-.26-.1-.46-.14-.65.15-.2.28-.75.94-.92 1.14-.17.19-.34.22-.62.08-.28-.15-1.19-.44-2.27-1.4-.84-.75-1.4-1.67-1.57-1.96-.16-.28-.02-.44.13-.58.13-.13.28-.34.42-.5.14-.18.19-.3.28-.5.1-.2.05-.37-.02-.51-.07-.14-.65-1.58-.9-2.15-.23-.55-.47-.48-.65-.49h-.55Z" />
    </svg>
  );
}

export function PhoneIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6.6 10.8c1.2 2.4 3.2 4.4 5.6 5.6l1.9-1.9c.24-.24.6-.32.9-.2 1 .35 2.1.55 3.2.55.5 0 .9.4.9.9V19c0 .5-.4.9-.9.9C10.7 19.9 4.1 13.3 4.1 5.7c0-.5.4-.9.9-.9h3.2c.5 0 .9.4.9.9 0 1.1.2 2.2.55 3.2.12.3.04.66-.2.9L6.6 10.8Z" />
    </svg>
  );
}
