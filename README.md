# AI-BOM Toolkit

A toolkit and visualizer for **AI Bill of Materials** (AI-BOM). Pipe any CycloneDX AI-BOM JSON into the `aibom` CLI and get an interactive constellation graph.

[![npm](https://img.shields.io/npm/v/aibom)](https://www.npmjs.com/package/aibom)
[![license](https://img.shields.io/npm/l/aibom)](packages/aibom/LICENSE)
[![codecov](https://img.shields.io/codecov/c/gh/lirantal/aibom/main)](https://codecov.io/gh/lirantal/aibom)
[![CI](https://img.shields.io/github/actions/workflow/status/lirantal/aibom/ci.yml?branch=main&label=CI&logo=github)](https://github.com/lirantal/aibom/actions/workflows/ci.yml?query=branch%3Amain)
[![Known Vulnerabilities](https://snyk.io/test/github/lirantal/aibom/badge.svg)](https://snyk.io/test/github/lirantal/aibom)
[![Security Responsible Disclosure](https://img.shields.io/badge/Security-Responsible%20Disclosure-yellow)](packages/aibom/SECURITY.md)

TL;DR how to use AI-BOM:

```sh
snyk aibom --experimental --json | npx aibom --view
```

_What it does: Snyk generates a CycloneDX AI-BOM as JSON, which is piped into the `aibom` CLI. The `--view` flag opens an interactive HTML visualization of your AI bill of materials in the browser._

<img width="1280" height="1280" alt="screenshot-rocks Large" src="https://github.com/user-attachments/assets/82f356c3-b41c-4aec-8d41-613b1e4d0bbd" />

## Why AI-BOM

AI-powered systems are increasingly widespread, but understanding what's inside those models, including their components, data sources, dependencies, and risks—remains difficult. The **AIBOM CLI** helps developers by:

- **Transparency**: Instantly visualize the full "system composition" of your AI applications: AI models, datasets, libraries, and supply chain dependencies.
- **Debugging & Operations**: Find complex model dependencies to speed up troubleshooting and locate source-code usage of AI components in your AI/ML projects.
- **Adoption with Existing Tools**: Seamlessly integrate with tools like Snyk to generate and visualize AI-BOMs—no vendor lock-in, just pipe your JSON in.

The CLI turns complex JSON reports into an interactive constellation graph—making architectural risk, component drift, and dependency relationships easily explorable for all engineers involved in building, deploying, or reviewing AI-enabled software.

## Demo

Watch a demo of the AIBOM CLI together with the Snyk CLI that generates the AIBOM payload:

https://github.com/user-attachments/assets/54e02fd8-bca8-49ea-ac78-23752bfbaa58

## Deployed Version

The AI-BOM web visualizer is deployed live here for public use: [https://aibom.vercel.app](https://aibom.vercel.app)

## Quickstart for AI BOM Toolkit

To visualize your AI-BOM in your own local environment, pipe a valid CycloneDX JSON data to the `aibom` npm CLI utility as follows:

```sh
cat data.json | npx aibom --view
```

You can use the Snyk CLI (free) with the _aibom_ command to create an AI-BOM and pipe it to the `aibom` npm package:

```sh
snyk aibom --experimental --json | npx aibom --view
```

Instead of `--view`, you can use the `--serve` flag to tell the `aibom` npm package to spin-up a local webserver and serve the HTML file:

```sh
npx aibom --serve --port 8081
```

