# Release Guide

## Local Build

```bash
node scripts/build.mjs
node --test test/*.test.mjs
```

## npm Package Check

```bash
npm pack --dry-run
```

## Publish

The package is public:

```bash
npm publish --access public --provenance
```

Recommended long-term publishing method:

- GitHub Actions
- npm Trusted Publishing
- provenance enabled

## Versioning

This package follows Semantic Versioning:

- patch: bug fixes
- minor: backward-compatible features
- major: breaking changes

