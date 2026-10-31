# Building Venera JSON Indexes

The JSON indexes and their machine-generated catalog READMEs are **generated artifacts**, not manually curated URL lists. The app's source-repository importer expects a UTF-8 JSON **array**, not the object-shaped build manifest.

## Two independent catalog channels

| | Canonical | Experimental |
| --- | --- | --- |
| Authoring | `plugins/*/plugin.config.json`, plugin source, release authority | `experiments/legacy-comic-sources/catalog.sources.json` + standalone JS |
| Generated JSON | repository root `index.json` | `experiments/legacy-comic-sources/index.json` |
| Generated README | `CATALOG.md` lists all canonical sources | `experiments/legacy-comic-sources/INDEX.md` |
| Build command | `npm run pipeline:build` or `npm run build:index` after manifest update | `npm run build:legacy-index` |
| Check command | `npm run check:index-json` | `npm run check:legacy-index` |
| Distribution | Canonical `@main` CDN artifact URL from release authority | Relative `fileName`, resolved from raw JSON response |
| v2 Loader | Loader must enforce package metadata/integrity and permissions | Not supported; Legacy JS Import only |

A canonical entry is a direct projection of `.generated/build-manifest.json#publicIndex`:

```json
[
  {
    "name": "Example Source",
    "fileName": "example.js",
    "key": "example_source",
    "version": "1.2.3",
    "url": "https://cdn.jsdelivr.net/gh/mythic3011/venera-configs@main/dist/plugins/example.js"
  }
]
```

This is a **schema example**, not a real entry. The generated actual JSON contains all canonical plugin entries. If both `url` and `fileName` exist, Venera prefers a nonempty `url`.

Experimental entries deliberately contain only `name`, `key`, `version`, `fileName` and `description`:

```json
[
  {
    "name": "LANraragi (Temporary)",
    "key": "lanraragi_temporary",
    "version": "0.1.0",
    "fileName": "lanraragi_temporary.js",
    "description": "Read-only LANraragi source for authorized, user-configured self-hosted instances; experimental legacy JS only."
  }
]
```

The experimental `fileName` is resolved **relative to the final successful raw JSON response URL**. Do not use a GitHub `blob` HTML URL, nor paste a local path into a remote catalog.

## Reproduction from a fresh checkout

```bash
node --version # intended: Node 22
npm ci

# Source/config changed: regenerate canonical artifacts and JSON index
npm run pipeline:build

# Experiment JS or its allowlist changed: regenerate JSON and INDEX.md
npm run build:legacy-index

# Verification (non-mutating, fails on drift)
npm run check:manifest
npm run check-generated
npm run check:catalogs
node --test tests/catalog-index.test.js tests/lanraragi.temporary.test.js

# Existing broader compatibility + security suite
npm run pipeline:ci
```

The `generate` step updates the canonical manifest/checksums, then writes the root JSON index. `sync-manifest` also refreshes it. Both `--check` modes compare **exact UTF-8 bytes**, ensuring deterministic content and catching a stale README or index.

The experimental generator:
1. Reads the explicit `catalog.sources.json` allowlist (no repository-wide auto-discovery).
2. Validates source name/key/version/min app version, path basename, duplicate identities and `experimental` status.
3. Reads the matching standalone JS and checks its declared source identity fields without executing the script.
4. Writes the Venera-compatible JSON array **and** a human-readable `INDEX.md` table.
5. Under `--check`, fails instead of rewriting files when either generated output differs.

To add another experimental source, put the independent source in the same experiment directory, use a unique stable key, add a reviewed allowlist entry, then run the builder and add mock-runtime tests. Do not mix experimental sources into `plugins/*` or overwrite a released key.

## Verification and publish boundary

- [JSON Catalog Integrity](../.github/workflows/catalog-index.yml) compares both committed index artifacts to their real sources, checks the canonical manifest, runs negative catalog contract tests and uploads review-only artifacts.
- [Experimental JS Sources](../.github/workflows/legacy-source-ci.yml) independently checks source syntax, index drift and mocked LANraragi behavior, then uploads a short-lived review bundle.
- The existing [CI](../.github/workflows/ci.yml) is still authoritative for broader plugin/runtime behavior. A green focused workflow is **not** an exemption from a failing full CI.
- [CDN purge](../.github/workflows/purge_cdn.yml) runs only after a change reaches `main`; it is not a release step for PRs. New root `index.json` is included in canonical CDN path detection.

**No PR workflow auto-commits generated files or pushes to production**. The reviewer must inspect identity/version changes and compare manifests and checksum evidence before merge. Neither index carries secrets or comic bytes.

## Troubleshooting

| Symptom | Likely cause | Remedy |
| --- | --- | --- |
| `index.json drift` | Plugin metadata updated without rebuilding root index | `npm run build:index` after canonical manifest regeneration |
| Experimental `index.json` / `INDEX.md` stale | JS or allowlist changed | `npm run build:legacy-index` |
| `Catalog/script key/version mismatch` | Source header differs from allowlist | Update both intentionally; never silently rename a released key |
| GitHub HTML instead of JSON | Imported a `blob/` URL | Click **Raw** and use the raw response URL |
| Legacy catalog imports but pages fail | Runtime LAN permission, API key, server route or extraction failure | Test Venera version and LANraragi API; do not weaken global SSRF policy |
| Main CI fails while focused index CI passes | Unrelated canonical runtime test or artifact mismatch | Fix separately; do not mark full CI as successful |

## Security rules

Index generation does **not** verify runtime site behavior, account credentials, network grant safety or media preservation. Importing third-party JS is an execution decision. Use trusted repositories, require runtime capability checks, and never commit private LAN API tokens. API Key fields in the temporary legacy source should be treated as non-vault configuration, not protected secret storage.

For immutable image snapshots, backup and offline recovery, see the independent [Venera preservation RFC](https://github.com/mythic3011/venera-next/pull/7).
