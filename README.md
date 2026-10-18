# UI Components Playground

> **A comprehensive React component library with interactive playground, multiple design themes, and real-time customization capabilities**

## 🚀 **Live Demo**

[UI-Components](https://ui-components-5218c2.gitlab.io)

[![Next.js](https://img.shields.io/badge/Next.js-Framework-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-Library-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Language-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Styling-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Monaco Editor](https://img.shields.io/badge/Monaco_Editor-Library-007ACC?style=flat-square&logo=visualstudiocode&logoColor=white)](https://microsoft.github.io/monaco-editor/)
[![Playwright](https://img.shields.io/badge/Playwright-Testing-green?style=flat-square&logo=playwright)](https://playwright.dev/)



---

## 🎯 Project Overview

This project was developed as a comprehensive solution for **UI component management and showcase**, serving three primary objectives:

1. **📦 Component Library**: Centralized storage for frequently used and custom UI components
2. **💼 Portfolio Showcase**: Professional demonstration of frontend development skills for CV/portfolio
3. **🎓 Learning Platform**: Consolidation and application of knowledge gained during internship experience

The application features an **interactive playground** where users can experiment with components, customize properties in real-time, and explore multiple design themes. The project evolved through user feedback during development, resulting in a robust, production-ready component library.

---

## ✨ Key Features

### 🎨 **Multi-Theme Design System**
- **6 Distinct Themes**: Minimal, Modern, Gradient, Rounded, Dark, and Neon
- **Light/Dark Mode Support**: Each theme includes both light and dark variants
- **Consistent Design Language**: Unified color palettes, typography, and spacing across all themes
- **Real-time Theme Switching**: Instant preview of components in different themes

### 🧩 **Interactive Component Playground**
- **Live Component Rendering**: Real-time preview of components with instant updates
- **Property Customization**: Dynamic prop editing with type-safe interfaces
- **Code Generation**: Automatic TypeScript code generation for customized components
- **Multiple Examples**: Pre-built component variations and use cases
- **Responsive Design**: Optimized for both desktop and mobile experiences

### 🧪 **Playground Page**
- **Multi-panel workflow**: Toggle & resize Search, Examples, Props, and Code panels
- **Live preview**: Render components instantly as you tweak props
- **Type-aware prop editing**: Specialized editors for complex props (functions/components) plus primitives
- **Code inspection & export**: Monaco-powered code viewer with copy-to-clipboard and download
- **Shareable links**: Deep-link to a component/example via URL params (`component`, `example`)

---

## 📚 Component Library (ingested from your projects)

The `/library` route lists components imported from the source code of other projects. Nothing in it is hand-registered; the import script extracts it:

```bash
# Scan files or directories (.tsx/.jsx; tests, stories and node_modules are skipped)
pnpm library:import ../my-cv/app/components --category actions

# Options
#   --project <name>    defaults to the source git repo's directory name
#   --category <name>   category for the imported entries (a local vault note may override it)
#   --tag <tag>         extra tag (repeatable)
#   --vault <dir>       link Obsidian notes whose frontmatter names the component (local only)
#   --dry-run           print what would change, write nothing
```

- For each exported React component it records: name, JSDoc description, props (resolved from the file's own interfaces/type aliases, with defaults from destructuring), package and local imports, the full file source, and provenance (repo, path, commit).
- Entries are written to `data/library/entries/<project>--<name>.json`, and `data/library/index.json` is regenerated from them. Running the import again on the same sources updates entries in place. Unchanged entries keep their timestamps.
- **Vault notes (local only):** a note is linked when its frontmatter has `component: Name` (or `components: [A, B]`). Optional `project:` restricts the match to one project, `category:` sets the entry's category, and `tags:` are merged in. Only the note's title, tags and first paragraph are read, and they go to `data/library/local/overlay.json`, which is gitignored. `pnpm dev` merges that overlay into `/library` when it exists (restart dev after creating it). `pnpm build` and the public site never include it, so committed entries and the Pages site hold code-derived data only.
- **Lazy detail data:** `data/library/index.json` holds light rows (no source, no prop contracts). The detail view loads `data/library/entries/<id>.json` on demand, one chunk per entry.

### Promoting a library entry into the playground

A library entry becomes a playground component through the existing request flow: promotion creates a `new_component` request pre-filled from the entry (source, props contract, provenance), which is validated, reviewed on `/requests`, and published with `pnpm publish:request <id> --apply`.

```bash
pnpm library:promote my-cv--basebutton   # CLI
# MCP tool: promote_library_entry { id }
# pnpm dev: "Promote to playground" on /library?id=<id>
```

Promoted components land in `components/display-components/library/<project>/<Name>/` with the library id as registry id. An entry cannot be promoted twice: not while a request for it is open, not once it is published, and not again for a source whose request was rejected (change the source and re-import first). The button only writes in `pnpm dev`, through a dev-only route (`app/api/library/promote/route.dev.ts`) that the static build does not include; the public site shows the CLI command instead.

---

## 🎨 Component Categories

### **Form Components**
- **Input Fields**: Text, email, password, number inputs with validation states
- **Sliders**: Range input controls with customizable styling
- **Switches**: Toggle controls with smooth animations
- **Textareas**: Multi-line text inputs with resize options
- **Toggles**: Button-style toggle controls

### **Layout Components**
- **Cards**: Flexible container components with headers and content
- **Buttons**: Multiple variants (primary, secondary, outline, ghost)

---

## 🔮 Future Enhancements

- **AI-Powered Styling**: Automated component customization
- **Component Marketplace**: Community-driven component sharing
- **Advanced Theming**: CSS-in-JS integration and dynamic theming
- **Accessibility Improvements**: Enhanced screen reader support

---

## 🤖 Automated Code Documentation

This project uses an automated code documentation workflow powered by **n8n**:

### Overview
An n8n workflow runs on an Oracle VM that automatically analyzes code changes on every push to the repository. The workflow:
- **Triggers on Push**: Automatically runs when code is pushed to the repository
- **Code Analysis**: Scans the codebase for uncommented code sections
- **Comment Generation**: Automatically generates helpful comments based on the code logic
- **Oracle VM Deployment**: Runs reliably on a dedicated Oracle virtual machine

### Benefits
- 📝 **Consistent Documentation**: Ensures code remains well-documented without manual effort
- 🔄 **Automated Process**: No need to remember to add comments manually
- 🎯 **Quality Assurance**: Helps maintain code quality standards across the project
- ⚡ **Zero Overhead**: Runs in the background without impacting development workflow

This automation helps maintain high code quality and documentation standards throughout the project lifecycle.

---

## 🤝 **Contributing**

This is a personal portfolio project, but suggestions and feedback are welcome!

---

## 📄 **License**

This project is for portfolio purposes. All rights reserved.

---

**Contact**: [LinkedIn](https://www.linkedin.com/in/miguel-louren%C3%A7o-395335355/) | [GitLab](https://gitlab.com/miguel-lourenco-main) | [Email](mailto:migasoulou@gmail.com)

**Built with ❤️ by Miguel Lourenço**
