// The editor login bridge is a dynamic, client-only utility page. It must not be
// prerendered (it reads the ?external=... query param and the live session at
// runtime) and produces no meaningful SSR output.
export const prerender = false;
export const ssr = false;
