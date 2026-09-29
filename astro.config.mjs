// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';
import lucode from 'lucode-starlight';

export default defineConfig({
	site: 'https://docs.kasane.dev',
	integrations: [
		mermaid(),
		starlight({
			title: 'Kasane Docs',
			description: '時空間IDデータベース Kasane の外部検証の案内',
			defaultLocale: 'root',
			locales: {
				root: { label: '日本語', lang: 'ja' },
			},
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/AirBee-Project/docs.kasane.dev' }],
			editLink: {
				baseUrl: 'https://github.com/AirBee-Project/docs.kasane.dev/edit/main/',
			},
			lastUpdated: true,
			sidebar: [
				{ label: 'はじめに', slug: 'index' },
				{ label: 'チュートリアル', items: [{ autogenerate: { directory: 'tutorial' } }] },
				{ label: '自分のデータを使う', slug: 'explore' },
				{ label: '資料', items: [{ autogenerate: { directory: 'docs' } }] },
			],
			customCss: ['@fontsource-variable/noto-sans-jp', './src/styles/custom.css'],
			plugins: [lucode()],
		}),
	],
});
