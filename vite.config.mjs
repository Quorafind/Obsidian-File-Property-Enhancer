import path from 'path';
import {defineConfig} from 'vite';
import {svelte} from '@sveltejs/vite-plugin-svelte';
import autoPreprocess from 'svelte-preprocess';
import builtins from 'builtin-modules';

export default defineConfig((variable) => {
	const prod = (variable.mode === 'production');
	console.log(variable.mode, prod);
	return {
		plugins: [
			svelte({
				preprocess: autoPreprocess()
			})
		],
		watch: !prod,
		build: {
			sourcemap: prod ? false : 'inline',
			minify: prod ? "terser" : false,
			terserOptions: {
				compress: {
					defaults: false,
					drop_console: prod,
				},
				mangle: {
					eval: true,
					module: true,
					toplevel: true,
					safari10: true,
					properties: false
				},
				output: {
					comments: false,
					ecma: '2020'
				}
			},
			// Use Vite lib mode https://vitejs.dev/guide/build.html#library-mode
			commonjsOptions: {
				ignoreTryCatch: false,
			},
			lib: {
				entry: path.resolve(__dirname, './src/filePropertyEnhancerIndex.ts'),
				formats: ['cjs'],
			},
			css: {},
			rollupOptions: {
				output: {
					// Overwrite default Vite output fileName
					entryFileNames: 'main.js',
					assetFileNames: 'styles.css',
				},
				external: ['obsidian',
					'electron',
					"codemirror",
					"@codemirror/autocomplete",
					"@codemirror/closebrackets",
					"@codemirror/collab",
					"@codemirror/commands",
					"@codemirror/comment",
					"@codemirror/fold",
					"@codemirror/gutter",
					"@codemirror/highlight",
					"@codemirror/history",
					"@codemirror/language",
					"@codemirror/lint",
					"@codemirror/matchbrackets",
					"@codemirror/panel",
					"@codemirror/rangeset",
					"@codemirror/rectangular-selection",
					"@codemirror/search",
					"@codemirror/state",
					"@codemirror/stream-parser",
					"@codemirror/text",
					"@codemirror/tooltip",
					"@codemirror/view",
					"@lezer/common",
					"@lezer/lr",
					"@lezer/highlight",
					...builtins,
				],
			},
			// Use root as the output dir
			emptyOutDir: false,
			outDir: '.',
		},
	}
});
