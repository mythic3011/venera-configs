# venera-configs

Configuration file repository for venera

## Create a new configuration

1. Download `_template_.js`, `_venera_.js`, put them in the same directory
2. Rename `_template_.js` to `your_config_name.js`
3. Edit `your_config_name.js` to your needs.
   - The `_template_.js` file contains comments to help you with that.
   - The `_venera_.js` is used for code completion in your IDE.

## Maintaining metadata

**Do NOT manually edit CDN URLs in source files or index.json.**

Source and config code should not hardcode full public URLs. Keep authority as components (CDN origin + provider path + repository + release ref) and let builders compose the final public URL.

All source metadata (name, key, version, url) is auto-generated from the class definitions:

```bash
# Update index.json from all source files
node scripts/sync-index.js

# Verify index.json is up to date
node scripts/sync-index.js --check
```

When you:

- Add a new source file, add its entry to `index.json` (only `fileName` is required; others are filled by sync)
- Update `name`, `key`, or `version` in any source class, run `node scripts/sync-index.js`
- Keep `description` in `index.json` for optional source-specific notes (not auto-replaced)

CDN URLs are built automatically from release authority components and the generated artifact output path:

```
https://cdn.jsdelivr.net/gh/mythic3011/venera-configs@main/dist/plugins/{fileName}
```

## Compatibility surface and rename policy

- Public `id/key` is a compatibility surface.
- Public artifact filename (for example `ehentai.js`) is a compatibility surface.
- Do not rename or remove a public id/key or artifact filename without one of:
  - an alias path
  - a deprecation path
  - an approved breaking-change note

## Generated source files

`dist/plugins/*.js` artifacts are generated from `plugins/*/src` using `plugins/*/plugin.config.json`.
For example, `dist/plugins/ehentai.js` is generated from `plugins/ehentai/src`.
Generated artifacts are automatically:

1. Transpiled from modern ES syntax to ES2018-compatible syntax (for flutter_qjs compatibility)
2. Kept parser-friendly for Venera `ComicSourceParser`:
   - the file must start with `class <Source> extends ComicSource`
   - do not prepend `_venera_.js` runtime definitions
   - do not one-line minify output

To rebuild after editing source files:

```bash
node scripts/build-source.js <plugin-id|all>
node scripts/sync-index.js --check
node --test
```

Do not hand-edit generated files under `dist/plugins`; commit generated outputs with source changes.

`i18n/ehentai.json` is retained as legacy compatibility content and is not the canonical authoring source.

## Source compatibility rules

Venera runs comic sources through `flutter_qjs`, not Node or Chrome V8. Source files should avoid relying on runtime support for modern syntax:

- Initialize fields inside `constructor()` with `this.name = ...`; do not use class field initializers.
- Do not rely on optional chaining, nullish coalescing, `.at()`, `replaceAll()`, or `matchAll()` in root source files.
- Keep generated files parser-friendly: the first bytes of the file must be the source class declaration, `class <Source> extends ComicSource`.

## CI checks

Pull requests run the same checks locally expected for contributors:

```bash
node scripts/build-source.js all
node scripts/sync-index.js --check
node --test
```

## Request pattern audit

To inspect request-helper migration opportunities across source files:

```bash
node scripts/audit-request-patterns.js
```
