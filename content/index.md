# wisconsin

<div class="badges">
    <img src="https://img.shields.io/badge/Obsidian-compatible-7C3AED?logo=obsidian" alt="Obsidian Badge" height="20">
    <img src="https://img.shields.io/github/actions/workflow/status/twangodev/wisconsin/build-and-deploy.yaml" alt="GitHub Actions Workflow Status" height="20">
    <img src="https://img.shields.io/github/license/twangodev/wisconsin" alt="GitHub License" height="20">
</div>

<p>
    A <a href="https://quartz.jzhao.xyz">Quartz</a>-powered static site tuned for organizing and presenting course materials.
</p>

## Content

I'm [James](https://twango.dev), and this is just a place  for me to organize my notes during my time at the [University of Wisconsin-Madison](https://wisc.edu). Here's a complete log of all the courses I've taken during my time as a student:

![[course-log]]

## A Technical Glance

This repository contains the framework and configuration for generating a static documentation site deployed
at [wisconsin.twango.dev](https://wisconsin.twango.dev).

The setup is **Obsidian-compatible**, allowing you to edit notes locally in Obsidian while maintaining version control
through Git and automated deployments for web access. This creates a seamless workflow for note-taking, version control,
and sharing.

> [!WARNING]
> **Academic Compliance**: All course materials remain in private submodules to comply with academic policies. This
> public repository contains only the site framework—no assignments, solutions, or proprietary content are exposed. The
> deployed site is access-controlled to protect course content.

### Bonus Features

This Quartz instance has been enhanced with several custom features tailored for students and course content management:

- **Automatic Tagging System**: Intelligently generates tags from directory structure (course codes, terms, subjects)
- **Scope-Based Tag Application**: Course tags apply globally while term/subject tags target immediate content only
- **Smart Title Extraction**: Automatically uses H1 headings as page titles with special handling for README files
- **Centered Math Equations**: KaTeX display equations are automatically centered for better readability
- **Consistent Image Layout**: Article images display at 60% width with balanced margins
- **Improved Frontmatter Processing**: Intelligent title fallback system

### Quick Start

#### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```
