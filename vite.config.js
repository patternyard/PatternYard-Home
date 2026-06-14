import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');

	// Where the /api dev proxy forwards to. Defaults to the deployed backend so
	// the frontend can exercise the real API same-origin (no CORS, cookies work).
	// Set BACKEND_PROXY_TARGET=http://localhost:8080 to test a locally-running
	// backend instead (that needs the backend's own secrets/DB to boot).
	const backendTarget = env.BACKEND_PROXY_TARGET || 'https://penguinmod-backend.vercel.app';

	return {
		plugins: [sveltekit()],
		server: {
			// Bind on all interfaces so the v0 preview proxy can reach the dev server.
			host: true,
			// Vite 6 rejects requests whose Host header isn't localhost (HTTP 403
			// "Blocked request. This host is not allowed."). The v0 preview serves
			// the dev server through a *.vusercontent.net proxy host, so allow it.
			// Set VITE_ALLOWED_HOSTS (comma-separated) to override locally.
			allowedHosts: env.VITE_ALLOWED_HOSTS
				? env.VITE_ALLOWED_HOSTS.split(',').map((h) => h.trim())
				: ['.vusercontent.net', '.v0.dev', 'localhost'],
			proxy: {
				// Forward /api/* to the backend server-side. Because the browser
				// only ever talks to the dev origin, there is no CORS and cookies
				// round-trip normally (cookieDomainRewrite strips the backend host).
				'/api': {
					target: backendTarget,
					changeOrigin: true,
					cookieDomainRewrite: '',
					configure: (proxy) => {
						proxy.on('proxyReq', (_proxyReq, req) => {
							console.log('[v0] proxy ->', backendTarget + req.url);
						});
					}
				}
			}
		}
	};
});
