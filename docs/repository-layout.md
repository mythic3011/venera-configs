# Repository layout and build flow

Start with `plugins/<id>/plugin.config.json` for a plugin. It names its source
files, their order, shared runtime domains, metadata, and output artifact.

| Responsibility | Edit here | Output / consumer |
| --- | --- | --- |
| Plugin behavior | `plugins/<id>/src/` | `dist/plugins/<artifact>.js` |
| Plugin metadata and module order | `plugins/<id>/plugin.config.json` | Public index and build manifest |
| Shared requests, parsers, security, plugin features | `support/<domain>/index.js` and its modules | Inlined into plugin artifacts |
| Shared locale labels | `support/i18n/tags.json` | Plugin `translation` objects |
| Repository and CDN authority | `scripts/config/release-authority.json` | Generated release URLs |
| Full build orchestration | `scripts/build/pipeline.js` | Validation, build, tests, audits |
| Bundle implementation | `scripts/build/bundle-plugin.js` | Standalone source before compatibility transforms |
| Compatibility and final artifact layout | `scripts/build/compat-transform.js`, `final-minify.js` | ES2018, class-first artifacts |
| Generated metadata | `.generated/build-manifest.json`, `index.json` | Integrity hashes and public catalog |
| Tests and runtime simulation | `tests/`, `scripts/runtime/` | Local verification |

`dist/`, `.generated/`, and the root `index.json` are generated. Make source
changes first, then regenerate them. Root `_venera_.js` describes the host API;
`_template_.js` is a source template. Root legacy plugins and `i18n/ehentai.json`
are compatibility content, not the shared implementation directory.

## Follow one plugin

```text
plugins/lanraragi/plugin.config.json
  -> plugins/lanraragi/src/index.js
  -> support/<domain>/index.js
  -> bundle -> compatibility transform -> class-first output
  -> dist/plugins/lanraragi.js
  -> .generated/build-manifest.json + index.json
```

Run `npm run build:plugin -- lanraragi` for one plugin, or `npm run pipeline:ci`
for the complete validation flow. The pipeline entrypoint prints each stage and
stops on the first failure. It does not commit, push, or publish.

## Shared code boundaries

Keep shared behavior in its existing domain: request encoding in `support/http`,
response parsing in `support/parser`, and service-family behavior in
`support/plugin/features`. Plugin imports use domain indexes; implementations
inside support may import their own modules. No runtime package loader is needed:
the bundler follows imports and embeds the required code and JSON.

Preserve separate protocol values when their semantics differ. Share repeated
request flows, maps, and error contracts when they have one owner; do not add a
cross-repository constant for every matching string.
