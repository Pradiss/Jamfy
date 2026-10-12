import * as Sentry from "@sentry/node";

// Safe to import even with no DSN set — the SDK just no-ops, so this is
// ready to go the moment SENTRY_DSN is added to the environment (no other
// code change needed). Must be imported before anything else so Sentry can
// instrument modules as they load.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV ?? "development",
  tracesSampleRate: 0.1,
});
