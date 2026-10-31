# Venera Source Catalog & Build Configs

[![CI](https://github.com/mythic3011/venera-configs/actions/workflows/ci.yml/badge.svg)](https://github.com/mythic3011/venera-configs/actions/workflows/ci.yml)
[![JSON Catalog](https://github.com/mythic3011/venera-configs/actions/workflows/catalog-index.yml/badge.svg)](https://github.com/mythic3011/venera-configs/actions/workflows/catalog-index.yml)
[![Experimental Sources](https://github.com/mythic3011/venera-configs/actions/workflows/legacy-source-ci.yml/badge.svg)](https://github.com/mythic3011/venera-configs/actions/workflows/legacy-source-ci.yml)

> [!IMPORTANT]
> This repository owns **plugin configs, source code, generated artifacts and catalog metadata**.
> It is not the Venera app loader, a trusted credential vault, or a backup service.
> The app loader must verify artifact integrity before executing downloaded JS.
> A JSON index alone does not provide integrity or sandbox guarantees.

## Install / choose an index

Two **separate, Venera-compatible JSON arrays**:

| Channel | Index | Purpose | Source of truth |
| --- | --- | --- | --- |
| Canonical | [index.json](index.json) | Official plugin catalog, including LANraragi, Komga and Kavita | `.generated/build-manifest.json#publicIndex` from `plugins/*/plugin.config.json` |
| Experimental | [experiments/legacy-comic-sources/index.json](experiments/legacy-comic-sources/index.json) | Temporary legacy JS imports (currently read-only LANraragi) | Reviewed `catalog.sources.json` allowlist and JS source |

Browse the automatically generated [canonical source table](CATALOG.md) (31 sources) or [experimental table](experiments/legacy-comic-sources/INDEX.md).

**Canonical JSON index URL (after merge to main):**

```text
https://raw.githubusercontent.com/mythic3011/venera-configs/main/index.json
```

**Experimental JSON index URL (after merge to main):**

```text
https://raw.githubusercontent.com/mythic3011/venera-configs/main/experiments/legacy-comic-sources/index.json
```

Before merge, open the corresponding [PR branch files](https://github.com/mythic3011/venera-configs/pull/1/files) and click **Raw**. Don't paste a GitHub `blob/` HTML URL into the application.

In a compatible Venera version, add the **raw JSON URL** as a source repository; alternatively import an individual raw JS file. Relative `fileName` entries are resolved against the final successful index response URL.

Canonical `lanraragi` and experimental `lanraragi_temporary` are separate source identities. The experimental script is **not** installed through the new V2 package loader and is **not** a replacement for the existing canonical source. Read its [setup/limitations guide](experiments/legacy-comic-sources/README.md).

## Repository layout

| Path | Role | Edit manually? |
| --- | --- | --- |
| `plugins/*/plugin.config.json` | Canonical identity, version and module order | Yes |
| `plugins/*/src/`, `shared/` | Canonical plugin code and shared helpers | Yes |
| `scripts/config/release-authority.json` | Canonical CDN URL authority | Review required |
| `.generated/build-manifest.json` | Generated metadata, checksums and `publicIndex` | No |
| `dist/plugins/*.js` | Generated standalone runtime artifacts | No |
| **`index.json`** | Generated canonical Venera JSON catalog | No |
| `CATALOG.md` | Generated README listing canonical plugins | No |
| `experiments/legacy-comic-sources/*.js` | Isolated test-only legacy JS source | Yes |
| `experiments/legacy-comic-sources/catalog.sources.json` | Experimental allowlist | Yes |
| `experiments/legacy-comic-sources/index.json` | Generated experiment JSON catalog | No |
| `experiments/legacy-comic-sources/INDEX.md` | Generated experiment catalog README | No |
| `tests/` and `.github/workflows/` | Contract tests / CI | Yes |

The root index is a **projection** of the canonical build manifest, not a second metadata authority. The experiment is not discovered as a plugin or published into the canonical manifest, `dist/`, or the jsDelivr release channel.

## Build and verify

Use Node.js 22 and the committed lockfile:

```bash
npm ci
npm run pipeline:build     # Canonical plugins + manifest + index.json
npm run build:legacy-index # Temporary index.json + generated INDEX.md
npm run check:catalogs     # Both JSON indexes and generated README
npm run check:manifest     # Canonical manifest consistency
npm run check-generated    # Artifact SHA-256, class-first and publicIndex
npm run pipeline:ci        # All existing runtime/security checks
```

Focused commands:

```bash
npm run build:index       # Also regenerates CATALOG.md
npm run check:index-json  # Validates index.json and CATALOG.md
npm run build:legacy-index
npm run check:legacy-index
node --test tests/catalog-index.test.js tests/lanraragi.temporary.test.js
```

`npm run sync-manifest` also refreshes the root `index.json`. Generated indexes, URLs, checksums and plugin artifacts must **not** be hand edited. Commit regenerated outputs alongside the corresponding source/config changes.

For the official Venera JSON-array schema, exact dependency ordering, auto-generation review workflow, release authority, failure diagnosis and development steps, see the **[Index Build Guide](docs/index-build.md)**.

## GitHub Actions

| Workflow | Triggers | Checks / output |
| --- | --- | --- |
| [CI](.github/workflows/ci.yml) | PR, main push, manual | Full existing plugin build and runtime verification |
| [JSON Catalog Integrity](.github/workflows/catalog-index.yml) | Relevant PR/push, manual | Manifest, both JSON indexes, generated README and catalog tests |
| [Experimental JS Sources](.github/workflows/legacy-source-ci.yml) | Relevant experiment PR/push, manual | Source syntax, mocked LANraragi/Venera tests, importable review artifacts |
| [Auto-generate Venera JSON catalogs](.github/workflows/index-autogen.yml) | Main push / manual on main | Rebuilds JSON + generated READMEs; opens/updates review PR **only if drift is detected** |
| [Purge jsDelivr CDN](.github/workflows/purge_cdn.yml) | Main push, manual | Purges changed canonical CDN paths |

PR validation workflows are read-only. The separate main-only auto-generation job can push **only four generated catalog outputs** to an automation branch and request review; it never commits directly to main. GitHub Actions must allow bot-created PRs, and GitHub-token-created PRs may not start new CI workflows automatically, so reviewers must independently verify generated output before merge. No workflow grants private-network access or stores user credentials. Focused green checks do **not** override failures in the full existing CI.

## Compatibility and security

Canonical generated JS must be ES2018-compatible and parser-friendly: `class <Source> extends ComicSource` appears first. The concat bundler supports `shared/...` and relative `.js` imports but not bare or default imports. Avoid untransformed runtime `?.`, `??`, `.at()`, `replaceAll()` and `matchAll()` in root sources.

- **Identity:** preserve published `key`, version semantics and artifact path; changing a key can disconnect existing library positions and updates.
- **Network:** JS URL validation is **not** SSRF protection. Private LAN/Tailscale/loopback access requires explicit host-level authorization, DNS/redirect checks and bounded requests.
- **Secrets:** never put API keys, cookies or private tokens in Git, URLs or generated JSON. Temporary legacy Source Settings are not a secure vault.
- **Content preservation:** a comic source or cached image is not an immutable snapshot, cloud backup or source-deletion guarantee. See [the separate Venera preservation RFC](https://github.com/mythic3011/venera-next/pull/7).

## Contributing

For canonical source changes, edit plugin config/source, run the canonical build, commit all updated generated artifacts/indexes, and supply tests. For experimental source changes, edit the JS file and `catalog.sources.json`, regenerate the experimental index and `INDEX.md`, and include mock-runtime tests. State explicitly what was not tested against the real app/server.

## License

[PolyForm Noncommercial License 1.0.0](LICENSE): personal/non-commercial use only. Business/commercial use is **not licensed** under these repository terms. The `LICENSE` file is authoritative.

---

## 繁體中文・香港使用指引

呢個 Repo 有兩條獨立路線：

- **正式 Sources**：用根目錄 [`index.json`](index.json) 匯入。內容由 Plugin Config → Build Manifest → JSON Index 自動生成。
- **臨時測試 Sources**：用 [實驗版 `index.json`](experiments/legacy-comic-sources/index.json)，只適用於仍然支援 Legacy JavaScript Comic Source 嘅 Venera。`lanraragi_temporary` 唔會覆蓋原有 `lanraragi`。

修改正式 Source 後執行 `npm run pipeline:build`；修改實驗 Source／Allowlist 後執行 `npm run build:legacy-index`；提交前執行 `npm run check:catalogs`，需要全套驗證就執行 `npm run pipeline:ci`。包括 `INDEX.md` 喺內嘅生成檔都唔應該直接改。

**唔好將 API Key 寫入 Git。** JS Source 自己檢查 URL 唔等於有 SSRF 防禦，私網連接權限仍然應該由 Host Runtime 管理。Temporary Source 只支援 Remote Reading，未提供 Snapshot 或 Google Drive Backup。
