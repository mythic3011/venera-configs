# Temporary Venera JavaScript Comic Sources

This directory is **experimental / non-canonical**. Scripts are single-file sources
for the legacy `ComicSource` JavaScript import interface in Venera-Next. They
are deliberately **not** discovered by `plugins/*/plugin.config.json`, bundled
into `dist/plugins`, or published into `.generated/build-manifest.json`.

## Importable JSON Catalog

Use [`index.json`](index.json) to import the full temporary catalog with
a Venera build that supports source repository JSON arrays. For review before
this PR merges, open the JSON file on the branch and click **Raw**. After merge,
the permanent raw URL is:

```text
https://raw.githubusercontent.com/mythic3011/venera-configs/main/experiments/legacy-comic-sources/index.json
```

The JSON contains a relative `fileName`, so the app resolves the script from
the **final raw JSON response URL**. Don't import a GitHub HTML `blob` URL.

The table in [`INDEX.md`](INDEX.md) and the JSON list are **both generated**
from [`catalog.sources.json`](catalog.sources.json), with a static identity
cross-check against the actual JS source. Edit the allowlist and script;
then regenerate both outputs. Do **not** hand-edit `INDEX.md` or `index.json`.

```bash
npm run build:legacy-index
npm run check:legacy-index
node --test tests/catalog-index.test.js tests/lanraragi.temporary.test.js
```

The temporary catalog is intentionally isolated from the root
[canonical index](../../index.json) and existing `lanraragi` plugin.
See the full [Index Build Guide](../../docs/index-build.md).

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

### v0.1.1 compatibility and safety changes

The temporary source is now **ES2018/QuickJS-friendly**: it initializes its
metadata, settings and callbacks in a `constructor()` instead of class field
initializers. Authentication headers use a **synchronous UTF-8/Base64 encoder**
implemented in plain JS. Venera's `Convert.encodeUtf8` and
`Convert.encodeBase64` may call the asynchronous host bridge and must not be
used to supply headers from synchronous `onThumbnailLoad`.

Other guardrails:
- Fixed archive ID format and immutable image-key identity (`lrr-page:<arcid>:<path>`).
- Exact same-base validation for absolute LANraragi page URLs, otherwise
  anchored relative `./api/archives/{id}/page&path=...` or
  `.../page?path=...` formats. Foreign hosts, mismatched archive IDs,
  encoded traversal, unsafe filenames and arbitrary trailing query parameters
  fail closed. No remote page URL is forwarded directly to the loader.
- All metadata requests use a bounded JSON response, status-specific errors,
  fixed order/pagination and a configurable HTTPS/explicit trusted-LAN HTTP
  base. Empty extracted pages are reported as pending/empty, **not** retried
  endlessly. `/files?force=false` does not force archive re-extraction.
- Auth is optional; use a dedicated revocable LANraragi API Key for testing.
  Image requests include their own Authorization headers because Venera's
  thumbnail path does not inherit body-image headers.
- Tags avoid JS prototype-pollution names; malformed search totals and
  nonnumeric cursors are rejected.

**Compatibility note:** a LANraragi server version that changes its page URL
response shape may require an adapter update. This version is tested against
the published API examples with mocked responses, **not a live LANraragi server**.

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

### CI / troubleshooting

- [Experimental JS Sources](../../.github/workflows/legacy-source-ci.yml):
  source syntax, 18 mocked LANraragi tests, index drift and artifact upload.
- [JSON Catalog Integrity](../../.github/workflows/catalog-index.yml):
  verifies both generated catalogs and index metadata independently of
  unrelated canonical plugin failures.
- A successful Mock Host test is **not** a real app or NAS integration test.
  A missing source in the UI may mean the app build does not support legacy
  JavaScript imports. A 401/403 usually means server authentication/authorization;
  an empty page set may mean LANraragi extraction is unfinished.
- If HTTP URL validation succeeds but LAN access is denied by the app, do
  **not** disable host SSRF protections to make this experiment work.
