# Jo Starkie's portfolio

A responsive React and TypeScript portfolio, built with Vite. Keeps the original
dark-and-pink identity without the legacy jQuery, particle engine, animation
packages or external font requests.

## Local development

Install a current Node.js LTS release (Node 22.12 or newer), then:

```powershell
cd repo
npm ci
npm start
```

Open **http://localhost:3000**. React changes use Fast Refresh; changes to files
under `public`, including `resumeData.json`, reload the page automatically.
The CV is at **http://localhost:3000/#/cv**.

## Content

- Edit `repo\public\resumeData.json` for the profile, experience, skills, projects
  and social links. The application validates this data and displays a retryable
  error if it cannot load. Keep URLs absolute (`https://...`).
- Work descriptions support an introductory sentence followed by `•`-separated
  bullets, which render as proper lists. The latest role starts expanded; other
  roles can be opened individually.
- Put images in `repo\public\images` (projects in `portfolio`). Optional
  `imageWebp` fields enable optimised WebP assets with the original as fallback.
  Supply a matching WebP when replacing an image, or remove that optional field.
- `repo\public\favicon.svg` is the scalable JS monogram. The matching
  `favicon.ico` contains 16, 32, 48 and 64-pixel versions; `public\icons` supplies
  the 180-pixel Apple touch icon and 192/512-pixel manifest icons. Keep these
  variants in sync when changing the mark.
- The displayed CV is `repo\src\Jo Starkie - CV 2026.pdf`. Replace that file to
  update the preview and download together. Its asset and page are loaded only
  when the CV route is opened. `main.cvDownload` is retained as legacy metadata;
  it does not control the embedded CV.
- Skills are displayed as tags, not subjective percentage bars. Existing
  `level` values remain in the data for backwards compatibility.

The app loads no third-party scripts or analytics by default. Navigation,
disclosures, layouts and hover effects use browser features and CSS, including
keyboard focus states and reduced-motion support. Colours and spacing live in
`repo\src\styles.css`; components use typed data from `repo\src\data\resume.ts`.

## Quality checks

Run commands from `repo`:

```powershell
npm run lint
npm test
npm run build
npm run preview
```

The production build includes strict TypeScript checking. Tests cover real
content validation, loading/error/retry states, section routing, the mobile menu
and the CV preview/download. GitHub Actions runs lint, tests and a build on pull
requests and pushes to `master`. Production preview runs at **http://localhost:4173**.

## Publishing

```powershell
npm run deploy
```

This builds the site and publishes **`repo\dist`** to the `gh-pages` branch.
Keep GitHub Pages configured to serve that branch's root. The custom domain
`thestarkie.com` is preserved by `repo\public\CNAME`.

Relative asset URLs and hash routing support both the custom domain and GitHub
Pages, including repository subpaths, without server rewrite rules.

## Origins

Originally based on [Tim Baker's React resume template](https://github.com/tbakerx/react-resume-template)
and the Ceevee design by [Styleshout](https://www.styleshout.com/).
The original MIT licence is retained in `repo\LICENSE`.
