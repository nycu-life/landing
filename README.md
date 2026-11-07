# sv

NYCU LIFE 官網的 Ghost 原生主題與切換流程見 [docs/ghost-theme.md](docs/ghost-theme.md)。
`theme/` 產生公開網站 HTML；SvelteKit 保留許願池。未啟用 `PUBLIC_SITE_ENGINE=ghost`
時，原本的 SvelteKit 官網仍可運作，供分階段部署與回復。

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
pnpm dlx sv@0.12.5 create --template minimal --types ts --add prettier eslint vitest="usages:unit,component" playwright tailwindcss="plugins:typography" sveltekit-adapter="adapter:auto" devtools-json paraglide="languageTags:zh-tw, en+demo:yes" storybook mcp="ide:other+setup:remote" --install pnpm ./
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
