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

CDN URLs are built automatically from the filename:
```
https://cdn.jsdelivr.net/gh/venera-app/venera-configs@main/{fileName}
```