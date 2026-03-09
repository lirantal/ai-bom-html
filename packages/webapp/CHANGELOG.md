# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed

- **Search: contiguous substring match** — Component search now requires the query to appear as a contiguous substring in the component name, label, or type (case-insensitive). Previously, search used a subsequence match (every character of the query appearing in order with any characters in between), which could match unrelated components (e.g. "deep" matching "FLUX.1-dev-ControlNet-Union-Pro" or "embedding-data/sentence-compression"). Now "deep" only matches when the literal substring "deep" appears (e.g. "deepseek-reasoner"). See `src/lib/fuzzy-match.ts` and `docs/feature/search.md`.
