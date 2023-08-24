import { defineConfig } from 'vite';

export default defineConfig({
	root: './',
	base: '/',
	server: {
		watch: {
			usePolling: true,
		},
		host: true,
		strictPort: true,
		port: 3001
	},
	build: {
		rollupOptions: {
			input: {
				app: './index.html'
			}
		}
	}
});
