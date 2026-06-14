
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```bash
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const AI_GATEWAY_API_KEY: string;
	export const BLOB_READ_WRITE_TOKEN: string;
	export const KV_URL: string;
	export const KV_REST_API_READ_ONLY_TOKEN: string;
	export const KV_REST_API_TOKEN: string;
	export const KV_REST_API_URL: string;
	export const REDIS_URL: string;
	export const MONGODB_URI: string;
	export const VERCEL_WEB_ANALYTICS_ID: string;
	export const VERCEL_OIDC_TOKEN: string;
	export const V0_RUNTIME_URL: string;
	export const V0_CALLBACK_URL: string;
	export const V0_CODE_SERVER_CALLBACK_URL: string;
	export const V0_CODE_SERVER_CALLBACK_TOKEN: string;
	export const npm_command: string;
	export const npm_config_userconfig: string;
	export const npm_config_cache: string;
	export const NODE: string;
	export const NODE_EXTRA_CA_CERTS: string;
	export const COLOR: string;
	export const npm_config_local_prefix: string;
	export const npm_config_globalconfig: string;
	export const EDITOR: string;
	export const PWD: string;
	export const npm_config_init_module: string;
	export const _: string;
	export const NPM_CONFIG_CAFILE: string;
	export const HOME: string;
	export const GIT_SSL_CAINFO: string;
	export const npm_package_version: string;
	export const CARGO_HTTP_CAINFO: string;
	export const DEV_PORT: string;
	export const INIT_CWD: string;
	export const npm_lifecycle_script: string;
	export const npm_config_npm_version: string;
	export const npm_package_name: string;
	export const npm_config_prefix: string;
	export const CURL_CA_BUNDLE: string;
	export const npm_lifecycle_event: string;
	export const SHLVL: string;
	export const npm_config_user_agent: string;
	export const npm_execpath: string;
	export const SSL_CERT_FILE: string;
	export const PIP_CERT: string;
	export const REQUESTS_CA_BUNDLE: string;
	export const npm_package_json: string;
	export const NODE_USE_SYSTEM_CA: string;
	export const AWS_CA_BUNDLE: string;
	export const npm_config_noproxy: string;
	export const PATH: string;
	export const npm_config_node_gyp: string;
	export const npm_config_global_prefix: string;
	export const GRPC_DEFAULT_SSL_ROOTS_FILE_PATH: string;
	export const npm_node_execpath: string;
	export const npm_config_engine_strict: string;
	export const OLDPWD: string;
	export const NODE_ENV: string;
}

/**
 * Similar to [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	export const PUBLIC_API_URL: string;
	export const PUBLIC_STUDIO_URL: string;
	export const PUBLIC_MAX_UPLOAD_SIZE: string;
	export const PUBLIC_CAPTCHA_ENABLED: string;
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * This module cannot be imported into client-side code.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		AI_GATEWAY_API_KEY: string;
		BLOB_READ_WRITE_TOKEN: string;
		KV_URL: string;
		KV_REST_API_READ_ONLY_TOKEN: string;
		KV_REST_API_TOKEN: string;
		KV_REST_API_URL: string;
		REDIS_URL: string;
		MONGODB_URI: string;
		VERCEL_WEB_ANALYTICS_ID: string;
		VERCEL_OIDC_TOKEN: string;
		V0_RUNTIME_URL: string;
		V0_CALLBACK_URL: string;
		V0_CODE_SERVER_CALLBACK_URL: string;
		V0_CODE_SERVER_CALLBACK_TOKEN: string;
		npm_command: string;
		npm_config_userconfig: string;
		npm_config_cache: string;
		NODE: string;
		NODE_EXTRA_CA_CERTS: string;
		COLOR: string;
		npm_config_local_prefix: string;
		npm_config_globalconfig: string;
		EDITOR: string;
		PWD: string;
		npm_config_init_module: string;
		_: string;
		NPM_CONFIG_CAFILE: string;
		HOME: string;
		GIT_SSL_CAINFO: string;
		npm_package_version: string;
		CARGO_HTTP_CAINFO: string;
		DEV_PORT: string;
		INIT_CWD: string;
		npm_lifecycle_script: string;
		npm_config_npm_version: string;
		npm_package_name: string;
		npm_config_prefix: string;
		CURL_CA_BUNDLE: string;
		npm_lifecycle_event: string;
		SHLVL: string;
		npm_config_user_agent: string;
		npm_execpath: string;
		SSL_CERT_FILE: string;
		PIP_CERT: string;
		REQUESTS_CA_BUNDLE: string;
		npm_package_json: string;
		NODE_USE_SYSTEM_CA: string;
		AWS_CA_BUNDLE: string;
		npm_config_noproxy: string;
		PATH: string;
		npm_config_node_gyp: string;
		npm_config_global_prefix: string;
		GRPC_DEFAULT_SSL_ROOTS_FILE_PATH: string;
		npm_node_execpath: string;
		npm_config_engine_strict: string;
		OLDPWD: string;
		NODE_ENV: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		PUBLIC_API_URL: string;
		PUBLIC_STUDIO_URL: string;
		PUBLIC_MAX_UPLOAD_SIZE: string;
		PUBLIC_CAPTCHA_ENABLED: string;
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
