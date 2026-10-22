# Plan de Rediseño Móvil Vertical, Protagonista Leslie y Mejoras Audiovisuales

Este plan detalla la reestructuración completa de la experiencia para adaptarse a la pantalla vertical de dispositivos móviles inspirada en una consola retro portátil, asignando a **Pink Monster** como la protagonista oficial (**Leslie**), liberando el área de juego de botones invasivos y añadiendo voces chiptune 8-bits y un mensaje personalizado ampliado.

---

## 1. Mockup Visual de la Nueva Experiencia

A continuación se muestra el concepto visual demo generado para la vista vertical:

![Demo de Consola Portátil Retro](/src/assets/images/mobile_retro_layout_1792700962992.jpg)

*Estructura: Pantalla de juego en la parte superior totalmente despejada, y botonera arcade dedicada en la parte inferior con D-Pad a la izquierda y botón de salto a la derecha.*

---

## 2. Puntos Clave del Rediseño

### A. Estructura Vertical y Reubicación de Controles (Cero Obstrucción)
- **Eliminación de la barra superior**: Se suprime la cabecera anterior tachada en la captura del usuario. En su lugar, el juego ocupará de forma limpia la parte superior con un marco arcade estilizado.
- **Botonera inferior dedicada (Handheld / Gamepad)**:
  - Los botones táctiles ya no flotarán sobre el suelo ni sobre el jugador.
  - Se crea una zona de control inferior separada del canvas:
    - **Lado izquierdo**: Controles direccionales pixel art (**◀** y **▶**) con relieve retro, textura táctil y feedback visual de pulsación.
    - **Lado derecho**: Botón de acción grande circular/retro (**▲ SALTO**) en tono verde esmeralda arcade.
    - **Barra de servicio discreta**: Botón miniatura de sonido (**🔊/🔇**), reinicio (**↺**) y descarga del archivo único, ubicados entre la pantalla y la botonera.
  - Funciona de forma totalmente responsiva en móviles verticales y en computadoras de escritorio.

### B. Protagonista Oficial: Pink Monster (Leslie)
- **Leslie es la protagonista**: El personaje jugable principal queda configurado por defecto como **Pink Monster** (monstruo rosa con orejitas y pancita blanca).
- **NPCs del Nivel 3**: Los dos amigos que le preparan la fiesta sorpresa y saltan al abrir el cofre serán **Dude Monster** (azul) y **Owlet Monster** (lechuza encapuchada), ambos con gorros cónicos de cumpleaños y globos festivos flotantes.

### C. Tipografía Pixel Art en el Nivel 1 (Tutorial)
- Sustituir la tipografía estándar por la fuente retro `'Press Start 2P', monospace` en los textos dentro del canvas:
  - Nivel 1: *"Usa Flechas o D-Pad para moverte y ESPACIO o SALTO para saltar"*.
  - Indicador de puerta y consejos en estilo arcade con sombra pixelada.

### D. Sonido de Voces Pixel Art 8-Bits (Estilo Animal Crossing / Celeste)
- Añadir a `SoundEngine` un sintetizador procedural de fonemas / balbuceos (*speech chirps*):
  - Ráfagas micro-moduladas de ondas cuadradas/triangulares con fluctuaciones aleatorias de tono armónico, recreando la clásica voz chiptune cuando los personajes saltan y cuando se revela el mensaje final.
  - Se reproduce automáticamente en el Nivel 3 al destapar el cofre, como grito de alegría y sorpresa de sus amigos.

### E. Mensaje de Cumpleaños Personalizado Ampliado
- Rediseñar el banner/pergamino final de celebración dentro de la pantalla para que sea más amplio, con borde dorado pixel art y fondo elegante semitransparente:
  - **Título**: `"🎉 ¡FELIZ CUMPLEAÑOS LESLIE! 🎂"`
  - **Cuerpo del mensaje**:
    > *"Leslie, otro nivel desbloqueado en esta aventura que es tu vida, te deseo lo mejor gracias por ser tan buena amiga, nunca cambies tu forma de ser."*
  - **Nota especial**:
    > *"Nota: cupón válido para hacerle una garra del tigre al goldo <3"*
  - Con lluvia de confeti continua y destellos dorados del cofre.

---

## 3. Plan de Implementación en Archivos

1. **`src/game/audio.ts`**:
   - Implementar `playCharacterVoiceChatter()` con algoritmo de fonemas retro (burbujas tonales moduladas tipo Celeste/Animalese).
2. **`src/App.tsx`**:
   - Ajustar el contenedor general a formato vertical (`flex-col`, `max-w-md` o vertical fluido centrado).
   - Mover los botones táctiles fuera del canvas a un panel inferior tipo mando de consola con diseño pixel art (D-Pad izquierda, botón Salto derecha).
   - Fijar `selectedCharacter = 'pink'` y NPCs = `'dude'` y `'owlet'`.
   - Renderizar el tutorial con fuente pixel `'Press Start 2P'`.
   - Implementar la tarjeta amplia con el mensaje especial para Leslie.
3. **`standalone_index.html` y `public/minijuego.html`**:
   - Sincronizar la misma estructura vertical de consola portátil, los sonidos de voz retro y el mensaje de Leslie en la versión de archivo único descargable.
4. **Verificación**:
   - Compilación con `compile_applet` y validación tipográfica con `lint_applet`.
