# Ecko Marketing Pulse

Minimal Next.js foundation for the Ecko Marketing Pulse Evaluation.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tap In links

Set `TAP_IN_TOKEN_SECRET` to a long, random value in production. It signs the
time-limited links in results emails so opening a link cannot expose or change a
subscriber record. If it is not set, the app uses `SITE_ACCESS_SECRET` when one
is available.

## Production build

```bash
npm run build
```
