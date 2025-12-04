YACHAY - Proyecto de ejemplo (frontend + backend)

Estructura:
- frontend/
    - index.html        → Sube esto a tu hosting actual
    - js/main.js        → En la misma ruta que indica el index.html

- backend-vercel/
    - package.json      → Para el proyecto en Vercel
    - api/diagnose.js   → Función serverless para llamar a OpenRouter

Uso con Vercel (resumen):
1. Ve a https://vercel.com y crea una cuenta.
2. Haz clic en "Add New" → "Project".
3. Usa la opción "Deploy from your computer" y selecciona la carpeta backend-vercel.
4. En Settings → Environment Variables crea:
   - KEY: OPENROUTER_KEY
   - VALUE: tu API key de https://openrouter.ai
5. Vercel te dará una URL del proyecto, por ejemplo:
   https://yachay-backend.vercel.app
6. Tu endpoint será:
   https://yachay-backend.vercel.app/api/diagnose
7. En frontend/js/main.js reemplaza:
   const BACKEND_URL = "https://TU-PROYECTO.vercel.app/api/diagnose";
   por la URL real de tu proyecto.