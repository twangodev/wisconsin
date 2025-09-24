# wisconsin

A [Quartz](https://quartz.jzhao.xyz)-powered static site for organizing and presenting course materials from the
University of Wisconsin-Madison.

## Overview

This repository contains the framework and configuration for generating a static documentation site deployed
at [wisconsin.twango.dev](https://wisconsin.twango.dev).

The setup is **Obsidian-compatible**, allowing you to edit notes locally in Obsidian while maintaining version control
through Git and automated deployments for web access. This creates a seamless workflow for note-taking, version control,
and sharing.

> [!WARNING]
> **Academic Compliance**: All course materials remain in private submodules to comply with academic policies. This
> public repository contains only the site framework—no assignments, solutions, or proprietary content are exposed. The
> deployed site is access-controlled to protect course content.

## Framework Customizations

This Quartz instance has been enhanced with several custom features tailored for students and course content management:

### Content Organization
- **Automatic Tagging System**: Intelligently generates tags from directory structure (course codes, terms, subjects)
- **Scope-Based Tag Application**: Course tags apply globally while term/subject tags target immediate content only
- **Smart Title Extraction**: Automatically uses H1 headings as page titles with special handling for README files

### Enhanced Display
- **Centered Math Equations**: KaTeX display equations are automatically centered for better readability
- **Consistent Image Layout**: Article images display at 60% width with balanced margins
- **Improved Frontmatter Processing**: Intelligent title fallback system (filename → H1 → default)

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```
