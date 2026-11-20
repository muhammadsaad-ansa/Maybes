# MYBASE PRO - Personal Backend Management Platform

MYBASE PRO is a professional, Supabase-inspired personal backend management platform featuring a dark mode dashboard, database schema visualizer, table editor with CRUD operations, SQL query runner with AI assistance, user authentication manager, storage bucket explorer, auto-generated REST API manager, and project settings.

## Features

1. **Dashboard**: Live database telemetry, total tables, row count, storage usage, and system health status.
2. **Database Schema**: Relational table inspector, column definitions, and table creation workflow.
3. **Table Editor**: Live data browser, pagination, filtering, record insertion, and JSON view.
4. **SQL Editor**: PostgreSQL query execution simulator, sample presets, query history, and Gemini AI SQL query generator.
5. **Authentication**: User accounts management, auth provider status, role assignment, and user status toggling.
6. **Storage**: Bucket management, file upload simulation, public URL copying, and file deletion.
7. **API Manager**: Auto-generated REST endpoints documentation, cURL snippet generator with API key injection, and Swagger UI.
8. **Project Settings**: Project configuration, secure API keys manager, and direct connection string viewer.

---

## Installation & Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/lumajang/mybase-pro.git
   cd mybase-pro
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` in your browser.

---

## Production Build & GitHub Pages Publication

To publish MYBASE PRO to GitHub Pages (`https://<username>.github.io/mybase-pro/`):

1. Configure `vite.config.ts` with base path (already set to relative `base: './'` for seamless GitHub Pages hosting).
2. Build the production bundle:
   ```bash
   npm run build
   ```
   This generates the optimized static files inside the `dist/` directory.

3. Deploy to GitHub Pages:
   - You can use the `gh-pages` npm package:
     ```bash
     npm install -D gh-pages
     ```
     Add deployment script to `package.json`:
     ```json
     "deploy": "gh-pages -d dist"
     ```
     Run:
     ```bash
     npm run deploy
     ```
   - Alternatively, push the repository to GitHub and enable GitHub Pages in your repository settings, pointing to the `dist/` or `gh-pages` branch.

---

## Files to Upload to GitHub Repository (`mybase-pro`)

When uploading your project to GitHub, include the following files and directories:

- `/src/` (All component files, styles, types, and mock data)
- `/public/` (Static assets if any)
- `index.html` (HTML entry point)
- `package.json` (Project dependencies and scripts)
- `tsconfig.json` (TypeScript configuration)
- `vite.config.ts` (Vite build configuration with `base: './'`)
- `.env.example` (Environment variables template)
- `.gitignore` (Git ignore rules)
- `README.md` (Project documentation)

---

## License & Author

Created by **Lumajang Saad** · MYBASE PRO Enterprise Edition.
