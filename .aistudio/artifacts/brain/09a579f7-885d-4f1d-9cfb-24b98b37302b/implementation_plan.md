# Plan de Simplificación de UI y Mejoras Visuales del Juego

Este plan detalla los pasos para limpiar completamente la interfaz externa, dejando el minijuego como el único foco visual en un marco arcade limpio, además de corregir los aspectos estéticos de los personajes y sus bocadillos de diálogo en el Nivel 3.

---

## 1. Diagnóstico y Objetivos

### A. Elementos a Eliminar (Limpieza de la UI externa)
- **Barra de celebración inferior**: Remover la sección de *"¡Sorpresa descubierta!..."* con los botones redundantes de *"Más Confeti"* y *"Volver a Jugar"*.
- **Selector inferior de personajes**: Remover la fila inferior *"Personajes del juego"* con las tarjetas/pills de selección.
- **Tarjetas informativas de controles**: Eliminar los 3 paneles inferiores (*"🎮 Teclado"*, *"🦘 Salto"*, *"📱 Celular & Móvil"*).
- **Pie de página (Footer)**: Eliminar la barra inferior de enlaces (*"Ver código autónomo"*, *"Copiar código HTML"*).
- **Modales innecesarios**: Limpiar los diálogos modales secundarios para que la aplicación sea directa y sin distracciones.

### B. Enfoque Visual del Juego (Marco Arcade Centrado)
- Mantener una cabecera minimalista y discreta con solo el título del juego, el botón de sonido (**🔊/🔇**) y el botón de reinicio (**↺**), más la descarga del archivo único.
- El contenedor del Canvas ocupará el centro de la pantalla con bordes redondeados limpios, sombra sutil y controles táctiles flotantes perfectamente integrados para pantallas móviles.

### C. Mejoras Visuales en el Nivel 3 (Personajes y Diálogos)
1. **Orientación del personaje derecho**:
   - Actualmente mira a la derecha (hacia afuera).
   - Se invertirá horizontalmente (`scale(-1, 1)`) para que **mire hacia la izquierda** (hacia el cofre y hacia el jugador).
2. **Globos para ambos personajes**:
   - Agregar globos flotantes animados con cuerda elástica y brillos tanto al personaje de la izquierda como al personaje de la derecha, enmarcando simétricamente el cofre del tesoro.
3. **Bocadillos de diálogo (Speech Bubbles)**:
   - Corregir el cálculo del tamaño de la nube/bocadillo:
     - Medición dinámica de texto (`ctx.measureText`).
     - Aumento de padding lateral (mínimo 12px a cada lado) y vertical (mínimo 6px arriba y abajo).
     - Centrado vertical exacto con `textBaseline = 'middle'`.
     - Ajuste del radio de redondeo y cola apuntadora hacia la cabeza de cada monstruo.

---

## 2. Modificaciones Técnicas en el Código

### 1. `src/game/sprites.ts`
- Actualizar `drawMonsterNPC`:
  - Parámetro de orientación `facing: 'left' | 'right'`. Si es `'left'`, aplicar inversión horizontal al cuerpo del monstruo sin distorsionar el texto del bocadillo.
  - Soporte de globos decorativos en ambos lados (`holdsBalloons: boolean`, habilitado para el NPC 1 y el NPC 2 con paletas de colores festivas complementarias).
  - Rediseñar la función de dibujo del bocadillo de diálogo:
    - Anchura automática calculada: `width = textMetrics.width + 24px`.
    - Altura adecuada: `26px`.
    - Centrado preciso del texto con `ctx.textAlign = 'center'` y `ctx.textBaseline = 'middle'`.
    - Cola triangular centrada sobre el personaje.

### 2. `src/App.tsx`
- **Nivel 3**:
  - En la llamada de renderizado a los dos NPCs:
    - NPC izquierdo: mira a la derecha (`facing: 'right'`), con globos rosados/amarillos y texto *"¡Sorpresa!"*.
    - NPC derecho: mira a la izquierda (`facing: 'left'`), con globos celestes/violetas y texto *"¡Feliz Cumple!"*.
- **Estructura JSX**:
  - Eliminar el bloque de celebración inferior `{isVictoryCelebration && ...}`.
  - Eliminar el contenedor de personajes `Character Roster Overview`.
  - Eliminar la rejilla de tarjetas de instrucciones de teclado/móvil.
  - Eliminar el pie de página (`footer`).
  - Simplificar la cabecera para que sea discreta y minimalista, conservando los controles esenciales (`Sonido`, `Reiniciar`, `Descargar index.html`).
  - Mantener centrada la pantalla del juego con los botones táctiles flotantes.

### 3. `standalone_index.html` y `public/minijuego.html`
- Replicar exactamente la misma limpieza visual y mejoras de los NPCs en las versiones autónomas del archivo HTML único:
  - Ambos NPCs con globos.
  - NPC derecho mirando a la izquierda.
  - Nubes de diálogo con padding amplio y texto centrado.
  - Eliminación de las secciones sobrantes debajo del canvas.

---

## 3. Plan de Verificación

1. **Compilación y Linters**:
   - Ejecutar `compile_applet` y `lint_applet` para asegurar 0 errores de TypeScript y empaquetado.
2. **Pruebas visuales del Nivel 1 y Nivel 2**:
   - Verificar que los controles táctiles flotantes y de teclado sigan respondiendo a la perfección.
   - Cruzar la puerta del Nivel 1 y las 3 plataformas del Nivel 2.
3. **Pruebas visuales del Nivel 3**:
   - Al tocar el cofre, comprobar que los dos personajes aparecen a los lados.
   - Verificar que el personaje derecho mira hacia el cofre (a la izquierda).
   - Verificar que ambos personajes tienen globos flotantes festivos.
   - Comprobar que los textos *"¡Sorpresa!"* y *"¡Feliz Cumple!"* quedan holgadamente contenidos dentro de sus respectivas nubes de diálogo sin desbordarse ni cortarse.
