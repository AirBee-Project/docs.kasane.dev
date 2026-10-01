// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';
import lucode from 'lucode-starlight';
import starlightTypeDoc, { typeDocSidebarGroup } from 'starlight-typedoc';

export default defineConfig({
	site: 'https://docs.kasane.dev',
	integrations: [
		mermaid(),
		starlight({
			title: 'Kasane Docs',
			description: '時空間IDデータベース Kasane のドキュメント',
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
				{ label: 'クイックスタート', slug: 'quickstart' },
				{ label: 'チュートリアル', items: [{ autogenerate: { directory: 'tutorial' } }] },
				{ label: 'ガイド', items: [{ autogenerate: { directory: 'guide' } }] },
				{ label: '背景知識', items: [{ autogenerate: { directory: 'concepts' } }] },
				{ label: 'リファレンス', items: [{ autogenerate: { directory: 'docs' } }] },
				typeDocSidebarGroup,
			],
			customCss: ['@fontsource-variable/noto-sans-jp', './src/styles/custom.css'],
			plugins: [
				lucode(),
				starlightTypeDoc({
					entryPoints: ['node_modules/@airbee-project/kasane-client/dist/index.d.ts'],
					tsconfig: './tsconfig.typedoc.json',
					output: 'api',
					sidebar: { label: 'API リファレンス', collapsed: true },
					typeDoc: {
						excludeInternal: true,
						excludePrivate: true,
						disableSources: true,
						lang: 'ja',
						parametersFormat: 'table',
					},
				}),
			],
		}),
	],
});
