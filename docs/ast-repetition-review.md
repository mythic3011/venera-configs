# AST repetition review

Run a source scan and optionally compare source lines with a tracked commit:

```sh
node scripts/audit/ast-repetition.js
node scripts/audit/ast-repetition.js --base=898953e --json=/tmp/venera-ast-repetition.json
```

The scanner parses JavaScript with the repository's declared `@babel/core`
parser, independent of Babel project transforms. It scans `plugins`, `support`,
and `scripts`, excluding tests, support test fixtures, generated files,
dependencies, and the scanner. It reports parse failures. Exact function matches
ignore locations and comments but preserve identifiers, operators, and literal
values. Functions need at least eight AST nodes; exact statement runs are
consecutive groups of three with at least twelve AST nodes. Cross-file strings
need five occurrences across four files; same-file strings need three
occurrences; regexes need occurrences in two files. The console output is
bounded; `--json` preserves every match and source location. `--base` obtains
physical and nonblank JavaScript line counts from the named Git tree.

## Final scan

The integrated tree parsed 123 source files with no errors and contains 13 exact
function groups, 48 repeated three-statement windows, 39 cross-file string
groups, 82 same-file string groups, and 12 repeated regex groups. The window
count includes overlaps, so the 48 matches are grouped by owner below rather
than treated as 48 independent changes.

The tracked `898953e` tree contains 33,944 physical source lines (31,546
nonblank) across the scanned roots. The current tree contains 33,093 (30,704
nonblank): **851 fewer physical lines and 842 fewer nonblank lines**. Plugin
sources account for 1,052 fewer lines, while shared support and build code add
201 lines for extracted helpers, translation loading, and the build pipeline.
The tracked tree had 118 source files; the current scan has 123, including the
new shared modules.

## Exact function matches

| Repeated group | Review |
|---|---|
| `plugins/kavita` and `plugins/komga`: `baseUrl` | Keep each service setting and default at its plugin boundary; both already use shared URL normalization. |
| `plugins/copy_manga` and `plugins/hot_manga`: `datedComicParser`, `rankedComicParser`, author-map callback | Keep the small plugin-facing parser getters and callback; parsing and request logic now live in shared Copy-like helpers, while the plugin settings and endpoints remain distinct. |
| `plugins/goda` and `plugins/mh18`: `baseUrl`, `onThumbnailLoad` | Keep the adapters because each plugin has its own domain setting and Venera callback. Both use shared MH-like URL/header helpers. |
| `plugins/kavita` and `plugins/komga`: `getJson` | Keep the named wrappers used throughout each plugin; both delegate to shared self-hosted JSON code. |
| `plugins/kavita`: author/library `map` callbacks | These normalize different API collections to the same `{id, name}` shape. They are tiny local projections with no worthwhile helper extraction. |
| `support/ehentai/features/comic.js`: two anchor callbacks | Each selects an anchor from a separate download response; a helper would add more code than it removes. |
| `support/ehentai/parsers/gallery-list-parser.js`: three date-row predicates | The same date predicate runs over three different page layouts; extracting this one-line callback would not reduce the file. |
| `plugins/ccc`, `plugins/jm`, `plugins/wnacg`: `onClickTag` | These are small, required per-plugin callbacks implementing the same Venera event shape. |
| `scripts/build/discover-plugins.js` and `write-build-manifest.js`: sort callbacks | Both sort config rows by ID. A shared comparator would add a helper/import for one-line callbacks. |
| `plugins/nhentai/src/features/comic.js`: page-thumbnail callbacks | The same projection is used for the primary and fallback page responses; it is too small to warrant another helper. |

## Repeated statement windows

The remaining windows cluster around a few owners. Fourteen overlapping
windows are in ManhuaGui's LZ-style decoder: the 8-bit and 16-bit reads share a
bit accumulator but have different widths and dictionary actions. Keep those
paths explicit unless decoder-specific regression tests support a safe
extraction. Copy/Hot Manga request, chapter, favorite, retry, and version logic
was moved into shared Copy-like helpers; the remaining matches are small parser
and author-map adapters. Hitomi now shares sort-option, result-mapping, and
paging logic between category and search while keeping their caches separate.
Manhuaren's comic and chapter comment hooks share `_parseComments` while
retaining different URL, response validation, and error behavior. Picacg now
shares list mapping, explore loading, and login checks. JM GET/POST share
status, authentication, decode, and error handling. JComic shares list loading
for explore, category, and search. The build pipeline also shares
child-process execution, and `check-generated` checks artifact contents in one
pass.

The other windows are short endpoint-specific response branches, plugin
callbacks, or the similar route and web-source path functions, whose contracts
remain separate. The scanner's complete occurrence list remains in the JSON
output for future review.

## Literal and regex review

The same-file raw-string scan identified practical repetitions in request
headers and login/error paths. ManhuaGui now builds common browser headers once
and uses one cookie-key constant; MangaDex shares JSON request/error handling;
Picacg shares login and list-response helpers. These reduce local copies while
keeping request-specific headers, endpoint fields, and retry behavior at their
owners.

The remaining string groups map to existing contracts: `User-Agent`, content
types, `XMLHttpRequest`, and `X-Requested-With` are HTTP fields; `data-src` and
selectors such as `.chapter-list` describe source HTML; `singlePageWithMultiPart`,
`multiPartPage`, and `multiPageComicList` are Venera loader types; `node:path`
and `node:child_process` are module specifiers; storage keys such as
`komga_libraries`, `kavita_authors`, and `refreshToken` belong to their plugin
data namespaces; UI strings are setting or tag labels; and status prefixes and
site-specific error messages belong to their request behavior. These repeated
values do not share one semantic owner, so the scan does not turn them into a
global constants list.

Repeated URL regexes cover trailing slashes, schemes, digits, whitespace, and
namespaces in different routing and parsing contracts. They remain with their
current URL and parser owners. Repository navigation and the build stages are
documented in [repository-layout.md](repository-layout.md).
