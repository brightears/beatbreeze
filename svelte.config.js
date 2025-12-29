import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			out: 'build',
			precompress: true
		}),
		alias: {
			$components: 'src/lib/components',
			$audio: 'src/lib/audio',
			$server: 'src/lib/server',
			$types: 'src/lib/types',
			$stores: 'src/lib/stores',
			$utils: 'src/lib/utils'
		}
	}
};

export default config;
