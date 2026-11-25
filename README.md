# InvSync

InvSync is an office stock and inventory workflow app with:

- a Vite + React frontend in `ui/`
- a Spring Boot backend in the repository root

## Local structure

- `ui/`: frontend for dashboard, setup, purchase, inventory, suppliers, and reports
- `src/`: Spring Boot backend API

## Vercel deployment

Vercel should be connected to the `ui` directory as the project root.

Required frontend environment variable:

```env
VITE_API_URL=https://your-backend-url/api
```

`ui/vercel.json` already includes SPA rewrites for client-side routing.

## Backend deployment

The backend is a Spring Boot application and should be deployed separately from Vercel unless you migrate it to a Vercel-supported backend runtime.

After deployment, point `VITE_API_URL` to that backend base URL.
