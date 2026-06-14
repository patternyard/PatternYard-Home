import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
        // TODO: sveltekit PLEASE stop failing builds just because you couldnt find a url, missing urls literally dont matter to us at all
        adapter: adapter({
            runtime: 'nodejs22.x'
        }),
        prerender: {
            handleHttpError: "warn"
        }
    },
    compilerOptions: {
        runes: true,
    }
};

export default config;
