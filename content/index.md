# wisconsin

<div class="badges">
    <img src="https://img.shields.io/badge/Obsidian-compatible-7C3AED?logo=obsidian" alt="Obsidian Badge" height="20">
    <img src="https://img.shields.io/github/actions/workflow/status/twangodev/wisconsin/build-and-deploy.yaml" alt="GitHub Actions Workflow Status" height="20">
    <img src="https://img.shields.io/github/license/twangodev/wisconsin" alt="GitHub License" height="20">
</div>

<p>
    A <a href="https://quartz.jzhao.xyz">Quartz</a>-powered static site tuned for organizing and presenting course materials.
</p>

> [!NOTE]
> **Disclaimer**: This is a personal project and is not affiliated with, endorsed by, or officially connected to the University of Wisconsin-Madison or the University of Wisconsin System.

## Content

I'm [James](https://twango.dev), and this is just a place for me to organize my notes during my time at the [University of Wisconsin-Madison](https://wisc.edu). Here's a complete log of all the courses I've taken during my time as a student:

![[course-log]]

## A Technical Glance

This repository contains the framework and configuration for generating a static documentation site deployed
at [wisconsin.twango.dev](https://wisconsin.twango.dev).

The setup is **Obsidian-compatible**, allowing you to edit notes locally in Obsidian while maintaining version control
through Git and automated deployments for web access. This creates a seamless workflow for note-taking, version control,
and sharing.

> [!TIP]
> This setup excels for CS students - keep notes and code together in one repository. Works seamlessly with AI assistants (Claude Code, Cursor, Windsurf) that benefit from having full project context.

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
- **Multi-threaded Parsing**: Dynamically uses all available CPU cores for faster build times

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## Use as Template

Want to create your own notes site? Here's how to get started:

### Clone the Repository

```bash
git clone https://github.com/twangodev/wisconsin.git
cd wisconsin
```

### Clear Existing Content

Remove all existing course content and submodules:

```bash
# Deinitialize and remove all submodules in content/
git submodule deinit -f content/
git rm -rf content/*
rm -rf .git/modules/content/

# Clean up any remaining submodule references
git config --remove-section submodule.content 2>/dev/null || true
```

### Create Your Content

Set up your own content structure:

```bash
mkdir -p content
echo "# My Notes" > content/index.md
```

At this point, you can open the `content/` folder in Obsidian as a vault and start creating your notes!

### Sync

Set up your remote repository and push your changes:

```bash
git remote add origin <your-repo-url>
git push -u origin main
```

There you go! You now have a personal notes site framework ready to be customized and filled with your own content.

### Scaling

This project was designed to scale to contain content for multiple courses or semesters. You should consider using Git submodules to keep content organized and access controlled

```bash
git submodule add https://github.com/<username>/<term><year>-<coursecode>.git content/some-identifier
```

Benefits of this approach:
- **Privacy**: Keep sensitive course materials in private repositories
- **Modularity**: Each course can be managed independently with its own commit history
- **Selective Sharing**: Share only specific courses by making individual submodules public
- **Performance**: Clone only the content you need instead of the entire repository
- **Collaboration**: Different people can maintain different course repositories

### Deployment

Quartz generates static files in `public/` that can be deployed anywhere:

```bash
npm run build
```

**Hosting Options**: [GitHub Pages](https://pages.github.com/), [Cloudflare Pages](https://pages.cloudflare.com/), [Netlify](https://www.netlify.com/), [Vercel](https://vercel.com/), [AWS S3](https://aws.amazon.com/s3/)/[Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/), the [CSL](https://csl.cs.wisc.edu/) or any static file server.

**Access Control**: Since Quartz outputs static HTML, implement authentication at the infrastructure level:
- [Cloudflare Zero Trust](https://www.cloudflare.com/zero-trust/), [Authentik](https://goauthentik.io/), or [Pangolin](https://digpangolin.com/) for identity-based access
- Basic Auth via web server configuration
- Edge functions for custom authorization logic

This approach keeps your site fast while protecting sensitive course materials.

### Customize (Optional)

Update `quartz.config.ts` to change:
- Site title and description
- Author information
- Base URL for deployment
- Theme and styling options
