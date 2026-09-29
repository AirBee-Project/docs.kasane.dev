// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import lucode from 'lucode-starlight';

export default defineConfig({
	site: 'https://docs.kasane.dev',
	integrations: [
		starlight({
			title: 'Kasane-docs',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/AirBee-Project/docs.kasane.dev' }],
			editLink: {
				baseUrl: 'https://github.com/AirBee-Project/docs.kasane.dev/edit/main/',
			},
			lastUpdated: true,
			sidebar: [
				{
					label: 'テスターの方へ',
					slug: 'index',
				},
				{
					label: 'ガイド',
					items: [{ autogenerate: { directory: 'guides' } }],
				},
				{
					label: 'リファレンス',
					items: [{ autogenerate: { directory: 'reference' } }],
				},
			],
			customCss: ['@fontsource-variable/noto-sans-jp', './src/styles/custom.css'],
			plugins: [lucode()],
		}),
	],
});
