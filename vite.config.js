import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// Where the /api proxy forwards to. Defaults to the deployed backend so the
// preview can exercise it same-origin (no CORS, cookies work via
// cookieDomainRewrite). Set BACKEND_PROXY_TARGET=http://localhost:8080 to test
// a locally-running backend instead (requires the backend's secrets/DB).
const BACKEND_PROXY_TARGET =
	process.env.BACKEND_PROXY_TARGET || 'https://penguinmod-backend.vercel.app';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		proxy: {
			// Any request the frontend makes to /api/* is forwarded server-side to
			// the backend. The browser only ever talks to localhost, so this avoids
			// cross-origin CORS and lets auth cookies work. To route frontend API
			// calls through here, set PUBLIC_API_URL=/api in .env (see .env.template).
			'/api': {
				target: BACKEND_PROXY_TARGET,
				changeOrigin: true,
				secure: true,
				cookieDomainRewrite: '',
				configure: (proxy) => {
					proxy.on('error', (err) => {
						console.log('[v0] proxy error:', err.message);
					});
					proxy.on('proxyReq', (_proxyReq, req) => {
						console.log('[v0] proxy ->', req.method, req.url, '=>', BACKEND_PROXY_TARGET);
					});
				}
			}
		}
	}
});
