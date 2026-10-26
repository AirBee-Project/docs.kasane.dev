// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';
import lucode from 'lucode-starlight';
import starlightTypeDoc from 'starlight-typedoc';
import { readdirSync } from 'node:fs';

// 旧 URL（TypeScript の各ページを clients/typescript/ の下へ移す前）から新しい URL へのリダイレクト。
// API リファレンスは starlight-typedoc が生成するので、生成後に一覧を読む。
/** @returns {import('astro').AstroIntegration} */
function legacyRedirects() {
	return {
		name: 'legacy-redirects',
		hooks: {
			'astro:config:setup': ({ updateConfig }) => {
				const docs = new URL('./src/content/docs/', import.meta.url);
				/** @type {Record<string, string>} */
				const redirects = {
					'/quickstart': '/clients/typescript/#クイックスタート',
					'/clients/typescript/quickstart': '/clients/typescript/#クイックスタート',
					'/guide/install': '/clients/typescript/guide/environment/',
					'/clients/typescript/guide/install': '/clients/typescript/guide/environment/',
					'/docs/usage': '/clients/typescript/reference/usage/',
					'/docs/query': '/clients/typescript/reference/query/',
					'/docs/faq': '/clients/typescript/reference/faq/',
					'/docs/plateau': '/tools/plateau/',
					'/tutorial/5-danger': '/tutorial/4-merge/',
				};
				for (const dir of ['guide', 'api']) {
					const files = readdirSync(new URL(`clients/typescript/${dir}/`, docs), { recursive: true, encoding: 'utf8' });
					for (const file of files) {
						const m = file.match(/^(.*?)(?:index)?\.mdx?$/);
						if (!m) continue;
						const slug = m[1].replace(/\/$/, '').toLowerCase();
						const from = slug ? `/${dir}/${slug}` : `/${dir}`;
						redirects[from] = `/clients/typescript${from}/`;
					}
				}
				updateConfig({ redirects });
			},
		},
	};
}

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
				{ label: 'Kasane とは', slug: 'index' },
				{ label: '背景知識', collapsed: true, items: [{ autogenerate: { directory: 'concepts' } }] },
				{ label: 'チュートリアル', collapsed: true, items: [{ autogenerate: { directory: 'tutorial' } }] },
				{
					label: 'クライアント API',
					collapsed: true,
					items: [
						{
							label: 'TypeScript',
							collapsed: true,
							items: [
								{ label: '概要', slug: 'clients/typescript' },
								{ label: 'ガイド', collapsed: true, items: [{ autogenerate: { directory: 'clients/typescript/guide' } }] },
								{ label: 'リファレンス', collapsed: true, items: [{ autogenerate: { directory: 'clients/typescript/reference' } }] },
								{
									label: 'API リファレンス',
									collapsed: true,
									items: [
										{ label: '概要', slug: 'clients/typescript/api/readme' },
										{ label: 'クラス', collapsed: true, items: [{ autogenerate: { directory: 'clients/typescript/api/classes' } }] },
										{ label: '関数', collapsed: true, items: [{ autogenerate: { directory: 'clients/typescript/api/functions' } }] },
										{ label: 'インターフェース', collapsed: true, items: [{ autogenerate: { directory: 'clients/typescript/api/interfaces' } }] },
										{ label: '型エイリアス', collapsed: true, items: [{ autogenerate: { directory: 'clients/typescript/api/type-aliases' } }] },
										{ label: '変数', collapsed: true, items: [{ autogenerate: { directory: 'clients/typescript/api/variables' } }] },
									],
								},
							],
						},
					],
				},
				{ label: 'ツール', collapsed: true, items: [{ autogenerate: { directory: 'tools' } }] },
				{ label: 'よくある質問', slug: 'faq' },
			],
			components: {
				Sidebar: './src/components/sidebar/Sidebar.astro',
			},
			customCss: ['@fontsource-variable/noto-sans-jp', './src/styles/custom.css'],
			plugins: [
				lucode({ warnOverrides: false }),
				starlightTypeDoc({
					entryPoints: ['node_modules/@airbee-project/kasane-client/dist/index.d.ts'],
					tsconfig: './tsconfig.typedoc.json',
					output: 'clients/typescript/api',
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
		legacyRedirects(),
	],
});
