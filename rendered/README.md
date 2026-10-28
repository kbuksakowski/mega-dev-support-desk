# Rendered kb

The page as the desk sees it: `kb/incidents/4471-split` from `src/routes/kb/incidents/4471-split/+page.svx`.

- `4471-split.png` — full-page render.
- `site/` — static build of the whole kb (SvelteKit + mdsvex, `runbook` layout). Open `site/kb/incidents/4471-split.html` through any static server (asset paths are absolute), e.g. `python3 -m http.server -d rendered/site`.

Built 2026-10-28. The export ships no build setup; it was rebuilt with `@sveltejs/kit` 2, `svelte` 5, `mdsvex` 0.12, `#lib` → `src/lib`.
