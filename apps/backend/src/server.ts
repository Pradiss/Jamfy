import "dotenv/config";

// Pinned regardless of host/platform — the hiring-request date math (and
// the agenda it drives) assumes the process runs in Brazil's timezone when
// parsing timezone-less datetime strings. Most cloud hosts default to UTC,
// which would silently shift every stored event time by 3h.
process.env.TZ = "America/Sao_Paulo";

import { app } from "./app.js";

const PORT = Number(process.env.PORT) || 3002;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
