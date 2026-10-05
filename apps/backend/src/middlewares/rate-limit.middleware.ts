import rateLimit from "express-rate-limit";

const message = {
  message: "Muitas tentativas. Tente novamente em alguns minutos.",
};

// Login is the classic brute-force target — tight window, few attempts.
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message,
});

// Registration/forgot-password are cheap to spam (fake accounts, email
// bombing) but legitimate retries are rare, so the limit is looser than
// login but still well below anything a real user would hit.
export const accountRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message,
});

// Reports are low-frequency by nature for a genuine user — this mostly
// guards against someone scripting mass-reports to harass another account.
export const denunciaRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message,
});
