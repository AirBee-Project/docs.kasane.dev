// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightImageZoom from 'starlight-image-zoom';

export default defineConfig({
	integrations: [
		starlight({
			title: 'Kasane-docs',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/AirBee-Project/kasane-docs.airbee.jp' }],
			editLink: {
				baseUrl: 'https://github.com/AirBee-Project/kasane-docs.airbee.jp/edit/master/',
			},
			lastUpdated: true,
			sidebar: [
				{
					label: 'はじめに',
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
			plugins: [starlightImageZoom()],
		}),
	],
});
