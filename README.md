# SD · Tragamonedas de Premios Imprexpo

Máquina tragamonedas de una sola jugada para el stand de SD Soluciones
Digitales. El participante presiona "Girar" y el servidor determina el
premio de forma aleatoria y ponderada; los carretes solo animan hacia
el resultado que el servidor ya decidió (el premio nunca se calcula en
el navegador, para que no se pueda manipular desde el celular/tablet
del participante).

## Estructura del proyecto

```
imprexpo-slot/
├── server.js          # Backend Express (lógica del juego, API)
├── config.js          # Premios y probabilidades (edítalo libremente)
├── package.json
├── data/
│   └── participantes.json   # Se genera solo, guarda el historial de jugadas
└── public/
    ├── index.html      # Frontend de la tragamonedas
    └── assets/logo.jpg
```

## Cómo cambiar los premios, íconos o probabilidades

Abre `config.js`. Cada premio tiene un `weight` (peso), un `icon`
(emoji que se muestra en el carrete) y un `label`. Los pesos no
necesitan sumar 100, se normalizan solos. Ajusta `noPrizeWeight` para
controlar qué tan seguido no cae premio.

Probabilidades actuales:

| Premio | Peso |
|---|---|
| Power bank | 30 |
| Bocinas bluetooth | 30 |
| Smart watch | 15 |
| Mochila para laptop | 10 |
| Sin premio | 15 |

## Probar en tu computadora

Requisitos: Node.js 18 o superior.

```bash
npm install
npm start
```

Abre http://localhost:3000 en tu navegador.

## Subir el proyecto a GitHub

1. Crea un repositorio nuevo y vacío en https://github.com/new
   (por ejemplo, `sd-imprexpo-tragamonedas`). No marques la opción de
   agregar README, .gitignore ni licencia (ya vienen incluidos aquí).

2. En tu terminal, dentro de esta carpeta del proyecto:

   ```bash
   git init
   git add .
   git commit -m "Tragamonedas de premios Imprexpo - SD Soluciones Digitales"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/sd-imprexpo-tragamonedas.git
   git push -u origin main
   ```

   Sustituye `TU_USUARIO` por tu usuario de GitHub. Si te pide
   autenticación, usa un "Personal Access Token" como contraseña
   (Settings → Developer settings → Personal access tokens), o usa
   GitHub Desktop si prefieres interfaz gráfica.

## Desplegar en Render.com

1. Entra a https://render.com y crea una cuenta (puedes entrar con tu
   cuenta de GitHub).

2. En el Dashboard: **New +** → **Web Service**.

3. Conecta tu cuenta de GitHub y selecciona el repositorio
   `sd-imprexpo-tragamonedas`.

4. Configura el servicio:
   - **Name**: sd-imprexpo-tragamonedas (o el que prefieras)
   - **Region**: la más cercana a México (Oregon suele ser la más rápida)
   - **Branch**: main
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

5. En **Environment Variables**, agrega (opcional, recomendado):
   - `ADMIN_KEY` = una clave secreta (ej. `sd2026imprexpo`), para
     consultar el historial de jugadas en:
     `https://tu-app.onrender.com/admin/exportar?clave=sd2026imprexpo`

6. Haz clic en **Create Web Service**. En unos minutos tendrás una URL
   pública tipo `https://sd-imprexpo-tragamonedas.onrender.com` lista
   para el stand (puedes ponerla en un QR o abrirla en una tablet).

7. Cada `git push` a `main` vuelve a desplegar automáticamente.

## Nota sobre los datos en el plan gratuito de Render

El disco es efímero: si el servicio se reinicia o se redeploya, el
archivo `data/participantes.json` se borra. Para un evento corto esto
normalmente no es problema; si quieres conservar el historial, exporta
el archivo con `/admin/exportar?clave=TU_CLAVE` al final de cada día,
o migra el almacenamiento a una base de datos (por ejemplo, Render
Postgres, que también tiene capa gratuita).

## Reglas del juego ya implementadas

- Cada participante (identificado por correo o teléfono) solo puede
  jugar una vez.
- El premio se decide en el servidor, nunca en el navegador.
- Los tres carretes siempre se detienen mostrando el resultado que el
  servidor ya calculó — no hay combinaciones "falsas" ni casi-ganan
  artificiales.
- Los premios están distribuidos por probabilidad (ver `config.js`),
  no fijos — cada jugada es independiente y aleatoria.
