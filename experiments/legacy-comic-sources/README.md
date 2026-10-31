# Temporary Venera JavaScript Comic Sources

This directory is **experimental / non-canonical**. Scripts are single-file sources
for the legacy `ComicSource` JavaScript import interface in Venera-Next. They
are deliberately **not** discovered by `plugins/*/plugin.config.json`, bundled
into `dist/plugins`, or published into `.generated/build-manifest.json`.

## LANraragi Temporary

File: [`lanraragi_temporary.js`](lanraragi_temporary.js).

**There is already a canonical `lanraragi` plugin** in
[`plugins/lanraragi/`](../../plugins/lanraragi/), alongside `komga` and
`kavita`. The temporary version uses **a distinct source key**
`lanraragi_temporary` so it can be compared without changing saved entries,
identities, updates, or settings belonging to the canonical source. Prefer the
existing canonical plugin for ordinary usage.

### Install / Configure

1. Open the JS file via GitHub's **Raw** view, copy/download the complete
   script, and use the legacy Venera-Next **Add Comic Source / Import JavaScript**
   flow. This depends on an app build that still exposes the legacy JS import
   interface and supports `minAppVersion: 1.16.0`; the future V2 plugin loader
   does not automatically run loose JS sources.
2. In the new Source settings, configure `server` as the base URL of *your*
   LANraragi service, e.g. `https://nas.example.com` or a reverse-proxy prefix.
   `http://192.168.50.2:3000` requires explicitly switching
   **Allow plain HTTP (trusted LAN only)** on.
3. For a server requiring an API key, supply `api_key` (LANraragi uses
   `Authorization: Bearer base64(key)`). **Legacy settings are not a secure
   credential vault.** Prefer a dedicated/revocable API key, TLS, and avoid
   transferring credentials over a public/untrusted network. Do not include
   keys in a script commit, Issue, log, source URL, or screenshot.
4. Search a work, open its details, and open the unchaptered archive. The
   adapter treats each LANraragi archive as a work and keeps source page order
   from `/api/archives/{id}/files`.

The temporary source is **read-only** and supports search pagination, metadata,
tags, cover images, ordered pages and optional authentication headers.
Image keys carry stable archive/path identifiers rather than authenticated
URLs. Returned page entries are parsed and reconstructed under the configured
server base instead of forwarding arbitrary remote origins.

### Known limitations and threat boundaries

- There is **no comic preservation**, immutable snapshot, backup, cloud sync,
  download guarantee, DRM workaround, or automatic archive replication.
  Ordinary image caching is not a source-deletion recovery guarantee. See
  [the separate design PR](https://github.com/mythic3011/venera-next/pull/7).
- Extracting archives may be asynchronous on LANraragi; an empty
  `/files` response currently reports "no extracted pages" without polling.
- API keys stored via legacy Source Settings should be considered recoverable
  from app data. Redirect validation, DNS rebinding protection, response size
  limits and private-network authorization **must be enforced by the host**.
  The script's base URL/path checks are not an SSRF/security boundary.
- Do not bypass v2's public-only PluginProxy policy or grant arbitrary LAN
  access to third-party JS. This prototype only runs in a legacy runtime
  where the user has independently approved the server.
- LANraragi may change API shapes or IDs across versions. This source has not
  been verified against a live server or the Flutter application UI.

### Test

```bash
node --test tests/lanraragi.temporary.test.js
```

Mocked Venera and LANraragi responses are used; these tests do **not**
perform LAN access, credential-vault checks, or app integration tests.
