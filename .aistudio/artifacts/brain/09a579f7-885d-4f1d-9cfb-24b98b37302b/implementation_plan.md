# Plan de Implementación: Rediseño Visual de Escenarios y Mando según Imagen de Referencia

Adaptar fielmente el diseño de los escenarios del juego y la interfaz del mando basándose en la imagen de referencia compartida (`image_a6c7915f.png`), incluyendo el paisaje nocturno con siluetas de montañas y bosque de pinos, suelo de hierba pixel art con rocas y flores, el portal dorado de luz en el Nivel 3, y la botonera morada con corazones y botón verde de salto.

---

## 1. Rediseño de Escenarios Pixel Art (Fondo, Suelo y Plataformas)

- **Cielo Nocturno con Degradado y Estrellas**:
  - Degradado atmosférico de azul noche profundo a violeta y resplandor crepuscular en el horizonte (`#0d0221` → `#2e1065` → `#581c87`).
  - Estrellas pixeladas titilantes (cruces y puntos) y una estrella fugaz animada cruzando el firmamento periódicamente.
- **Capas de Montañas y Siluetas de Bosque**:
  - Capa lejana de cordilleras montañosas en violeta oscuro/índigo (`#240046`).
  - Capa media de montañas con aristas de luz pixel art (`#3c096c` / `#5a189a`).
  - Línea de bosque de pinos en silueta sobre el horizonte antes del suelo.
- **Suelo y Bloques de Tierra Pixel Art**:
  - Reemplazar las plataformas planas por bloques de tierra detallados:
    - Borde superior de césped verde brillante (`#22c55e`, `#16a34a`) con briznas irregulares y pequeñas flores violetas y amarillas esparcidas.
    - Bloques de tierra/roca subterránea con textura de piedra pixel art orgánica (`#451a03`, `#78350f`).
- **Nivel 2 (Desafío del Foso)**:
  - Mismo entorno de montañas nocturnas, con plataformas de piedra suspendidas sobre el foso abisal con niebla/humo rojizo en el fondo.

---

## 2. Portal Dorado de Luz en el Nivel 3 (Sustitución del cofre)

- **Portal de Luz Mágico**:
  - Diseñar un arco/portal dorado brillante en el centro del Nivel 3 con columnas doradas y un haz ascendente de luz cálida radiante (`#fef08a`, `#facc15`).
  - Partículas de destellos dorados (estrellas/cruces brillantes) flotando continuamente dentro del rayo de luz.
- **Activación del Clímax**:
  - Cuando Leslie entra en el portal de luz:
    - Se reproducen las voces expresivas de felicitaciones de Dude y Owlet.
    - Dude Monster (izquierda con gorrito y globo amarillo) y Owlet Monster (derecha con gorrito y globo morado) celebran con sus bocadillos `"¡Sorpresa!"` y `"¡Feliz Cumple!"`.
    - La tarjeta de felicitación para Leslie se despliega en la parte superior con el cupón para *"la garra del tigre al goldo <3"*.

---

## 3. Rediseño del Mando de Juego (Gamepad) según la Referencia

- **Cabecera Superior**:
  - Indicador LED verde brillante + tipografía pixel `RETRO BOY 2D`.
  - Grupo de botones de nivel `L1`, `L2`, `L3` con el nivel activo resaltado en morado vibrante (`#8b5cf6`).
  - Botón de sonido con icono verde cian y botón de reinicio circular.
- **Panel Inferior de Controles (3 Cajas)**:
  - **Izquierda**: Caja morada oscura con dos botones cuadrados redondeados (`#6b21a8`) con flechas blancas en cruz pixeladas y la etiqueta inferior `◀ MOVER ▶`.
  - **Centro**: Caja con marco morado conteniendo 3 corazones pixel art morados (`♥ ♥ ♥`) sobre el nombre `LESLIE` en tipografía pixel con destellos.
  - **Derecha**: Botón arcade verde esmeralda resplandeciente con la flecha `▲`, el texto en negrita `SALTO` y el indicador `— [SPACE] —`.
- **Barra de Pie de Página (3 Módulos)**:
  - Módulo 1: `? Controles: Flechas + Espacio`
  - Módulo 2: `🎁 Tip: Explora y diviértete ¡Tú puedes con todo!`
  - Módulo 3: `📥 Descargar index.html`

---

## 4. Archivos a Modificar

1. `src/game/scenery.ts` (Nuevo) o `src/game/sprites.ts`: Dibujo de montañas, cielo estrellado, estrella fugaz, bosque de pinos, bloques de tierra pixel art con césped y el portal dorado de luz.
2. `src/App.tsx`: Integración del nuevo motor de escenarios, portal dorado en Nivel 3, actualización del layout y la botonera con los corazones y colores morado/verde exactos.
3. `standalone_index.html` y `public/minijuego.html`: Sincronización completa del nuevo diseño visual para su descarga y juego independiente.

---

## Verificación

- Comparar visualmente con `image_a6c7915f.png`: cielo nocturno, montañas, pinos, césped, portal dorado, corazones pixel y botones.
- Verificar que las colisiones en las plataformas de césped y la entrada al portal dorado funcionen con total fluidez.
- Probar los controles táctiles del mando morado/verde y la versión autónoma descargable.
- Ejecutar `compile_applet` y `lint_applet`.
