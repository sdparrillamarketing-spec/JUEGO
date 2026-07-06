# SD · Juego de Premios Imprexpo

Juego de una sola oportunidad para el stand de SD Soluciones Digitales.
El participante elige 1 de 9 casillas y el servidor determina el premio
de forma aleatoria y ponderada, evitando que la misma persona (por
correo o teléfono) juegue más de una vez.

## Estructura del proyecto

```
imprexpo-game/
├── server.js          # Backend Express (lógica del juego, API)
├── config.js          # Premios y probabilidades (edítalo libremente)
├── package.json
├── data/
│   └── participantes.json   # Se genera solo, guarda el historial de jugadas
└── public/
    ├── index.html      # Frontend del juego
    └── assets/logo.jpg
```

## Cómo cambiar los premios o las probabilidades

Abre `config.js`. Cada premio tiene un `weight` (peso). No necesitas que
sumen 100, el sistema los normaliza automáticamente. También puedes
ajustar `noPrizeWeight` para controlar qué tan seguido no cae premio.

## Probar en tu computadora

Requisitos: tener Node.js 18 o superior instalado.

```bash
npm install
npm start
```

Abre http://localhost:3000 en tu navegador.

## Subir el proyecto a GitHub

1. Crea un repositorio nuevo y vacío en https://github.com/new
   (por ejemplo, llamado `sd-imprexpo-game`). No marques la opción de
   agregar README, .gitignore ni licencia (ya vienen incluidos aquí).

2. En tu terminal, dentro de esta carpeta del proyecto, ejecuta:

   ```bash
   git init
   git add .
   git commit -m "Juego de premios Imprexpo - SD Soluciones Digitales"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/sd-imprexpo-game.git
   git push -u origin main
   ```

   Sustituye `TU_USUARIO` por tu usuario de GitHub. Si te pide
   autenticación, GitHub ya no acepta contraseña normal: usa un
   "Personal Access Token" (Settings → Developer settings → Personal
   access tokens) como contraseña, o usa GitHub Desktop si prefieres
   una interfaz gráfica.

## Desplegar en Render.com

1. Entra a https://render.com y crea una cuenta (puedes usar tu cuenta
   de GitHub para entrar directo).

2. En el Dashboard, haz clic en **New +** → **Web Service**.

3. Conecta tu cuenta de GitHub y selecciona el repositorio
   `sd-imprexpo-game` que acabas de subir.

4. Configura el servicio así:
   - **Name**: sd-imprexpo-game (o el nombre que prefieras)
   - **Region**: la más cercana a México (Oregon suele ser la más rápida para MX)
   - **Branch**: main
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (suficiente para un evento de stand)

5. En la sección **Environment Variables**, agrega (opcional, recomendado):
   - `ADMIN_KEY` = una clave secreta que tú inventes (ej. `sd2026imprexpo`)
     Esto te permite consultar el historial de jugadas de forma segura en:
     `https://tu-app.onrender.com/admin/exportar?clave=sd2026imprexpo`

6. Haz clic en **Create Web Service**. Render instalará dependencias y
   desplegará el proyecto automáticamente. En unos minutos tendrás una
   URL pública tipo `https://sd-imprexpo-game.onrender.com` lista para
   usarse en el stand (puedes ponerla en un QR o abrirla en una tablet).

7. Cada vez que hagas `git push` a la rama `main`, Render vuelve a
   desplegar automáticamente la versión más reciente.

## Nota importante sobre los datos en el plan gratuito de Render

El plan gratuito de Render usa disco efímero: si el servicio se
reinicia o se vuelve a desplegar, el archivo `data/participantes.json`
se borra. Para un evento de 1 a 3 días esto normalmente no es
problema, pero si quieres conservar el historial de forma permanente,
te recomiendo:

- Descargar el archivo desde `/admin/exportar?clave=TU_CLAVE` al
  finalizar cada día del evento, o
- Migrar el almacenamiento a una base de datos (por ejemplo, un
  servicio de Render Postgres, que también tiene capa gratuita).

## Reglas del juego ya implementadas

- Cada participante (identificado por correo o teléfono) solo puede
  jugar una vez; si lo intenta de nuevo, el servidor lo rechaza.
- El premio se decide en el servidor, nunca en el navegador, para que
  no se pueda manipular desde el celular del participante.
- Los premios están distribuidos por probabilidad (ver `config.js`),
  no fijos en una casilla — cada partida es independiente y aleatoria.
