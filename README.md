# Jo Starkie 🌸

My little corner of the internet: dark, pink & a little kawaii. 日本が大好き ♡

**[thestarkie.com](https://thestarkie.com)** · React + TypeScript + Vite

## はじめよう · Get started

Use Node.js LTS (22.12+):

```powershell
cd repo
npm ci
npm start
```

Visit **<http://localhost:3000>**.

## Make it mine 🎀

- **Content:** `repo\public\resumeData.json`
- **Images:** `repo\public\images`
- **Colours & layout:** `repo\src\styles.css`

For CV requests, set `VITE_CV_REQUEST_EMAIL` in `repo\.env.local`
and as a GitHub Actions repository variable. This public address opens an email
draft; the site never sends or stores requests.

## Check & ship ✨

Run from `repo`:

```powershell
npm run lint
npm test
npm run build
```

`npm run preview` previews the build at <http://localhost:4173>.
GitHub Actions checks every PR and deploys `repo\dist` after checks pass on `master`.
Once this workflow is merged, set **Settings → Pages → Source** to **GitHub Actions**,
then run **Portfolio checks and deployment** from the Actions tab for the first deployment.
Keep the custom domain and HTTPS settings unchanged.

---

With thanks to [Tim Baker](https://github.com/tbakerx/react-resume-template)
and [Styleshout](https://www.styleshout.com/). Original MIT licence: [`repo\LICENSE`](repo/LICENSE).
