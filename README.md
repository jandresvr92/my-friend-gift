# Plataformas Cumpleaños 2D

Minijuego de plataformas para jugar en el navegador. **Pink Monster** es la protagonista; Dude y Owlet te esperan en el nivel 3.

## Cómo jugar

- **Mover:** A / D o flechas.
- **Saltar:** Espacio, W o flecha arriba.
- **Reiniciar nivel:** R.
- En el celular usa los botones en pantalla.

Objetivo:

1. Tutorial: llega a la puerta.
2. Desafío: salta las plataformas sin caer al foso.
3. Fiesta: toca el cofre con tus amigos.

## Cómo correrlo en local

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## Cómo compartir el enlace

El juego es un sitio estático. No hace falta descargar un HTML.

```bash
npm run build
```

Publica la carpeta `dist/`. Lo más simple:

1. `git init` y sube el repo a GitHub.
2. En el repositorio: **Settings → Pages**.
3. Fuente: GitHub Actions, o la rama `gh-pages` con el contenido de `dist/`.

La URL queda así: `https://TU_USUARIO.github.io/my-friend-gift/`

Sin GitHub: arrastra `dist/` a [Cloudflare Pages](https://pages.cloudflare.com/).

El build usa rutas relativas (`base: './'`), así los sprites de `public/assets/aistudio/` funcionan en un subdirectorio de GitHub Pages.
