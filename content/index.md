# wisconsin

A [Quartz](https://quartz.jzhao.xyz)-powered static site for organizing and presenting course materials from the
University of Wisconsin-Madison.

## Content

I'm [James](https://twango.dev), and this is just a place  for me to organize my notes during my time at the [University of Wisconsin-Madison](https://wisc.edu). Here's a complete log of all the courses I've taken during my time as a student:

### Fall 2025

- [[sp25-music113/README|MUSIC 113]] - MUSIC IN PERFORMANCE
- [[fa25-cs540/README|COMPSCI 540]] - INTRODUCTION TO ARTIFICIAL INTELLIGENCE
- [[fa25-nutrisci132/README|NUTRISCI 132]] - NUTRITION TODAY
- [[fa25-anthro105/README|ANTHRO 105]] - PRINCIPLES OF BIOLOGICAL ANTHROPOLOGY
- [[fa25-cs354/README|COMPSCI 354]] - MACHINE ORGANIZATION AND PROGRAMMING
- [[fa25-cs502/README|COMPSCI/CURRIC 502]] - THEORY AND PRACTICE IN COMPUTER SCIENCE EDUCATION

### Spring 2025

- [[sp25-music113/README|MUSIC 113]] - MUSIC IN PERFORMANCE
- COMPSCI/ECE 252 - INTRODUCTION TO COMPUTER ENGINEERING
- [[sp25-cs400/README|COMPSCI 400]] - PROGRAMMING III
- ECON 101 - PRINCIPLES OF MICROECONOMICS
- COMPSCI/MATH 240 - INTRODUCTION TO DISCRETE MATHEMATICS
- ENGL 175 - LITERATURE AND THE OTHER DISCIPLINES

### Fall 2024

- [[fa24-cs300/README|COMPSCI 300]] - PROGRAMMING II
- ASTRON 236 - THE HISTORY OF MATTER IN THE UNIVERSE
- COMPSCI 402 - INTRODUCING COMPUTER SCIENCE TO K-12 STUDENTS
- [[fa24-asianam160/README|ASIAN AM 160]] - ASIAN AMERICAN HISTORY: MOVEMENT AND DISLOCATION
- MATH 340 - ELEMENTARY MATRIX AND LINEAR ALGEBRA

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
