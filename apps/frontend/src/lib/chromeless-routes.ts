// Routes that render their own full-bleed layout (no site header, footer or
// mobile tab bar) — currently just the login/signup split-screen.
const CHROMELESS_ROUTES = ["/login", "/cadastro"];

export function isChromelessRoute(pathname: string) {
  return CHROMELESS_ROUTES.includes(pathname);
}

// The messages section manages its own viewport-height chat panel — the
// marketing footer below it would both waste space and break the "no page
// scroll, only the thread scrolls" layout.
export function isFooterlessRoute(pathname: string) {
  return isChromelessRoute(pathname) || pathname.startsWith("/conversas");
}
