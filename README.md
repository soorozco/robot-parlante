# Robot Parlante

Pequeña aplicación web estática donde un robot rosa **habla en voz alta** lo que tú escribes. Los ojos parpadean, las antenas brillan y la boca se anima al ritmo de la locución.

## Demo

👉 [soorozco.github.io/robot-parlante](https://soorozco.github.io/robot-parlante)

## Cómo funciona

- HTML + CSS + JavaScript puro, sin dependencias.
- Usa la **Web Speech API** del navegador (`speechSynthesis`) para leer el texto en voz alta.
- Animaciones CSS para los ojos, antenas y la boca tipo ecualizador.

## Probarlo localmente

Sirve la carpeta con cualquier servidor estático, por ejemplo:

```bash
python3 -m http.server 5500
```

y abre <http://localhost:5500>.

## Compatibilidad

- Funciona en Chrome, Edge y Safari de escritorio.
- En iOS la voz se activa al primer toque del botón.

## Licencia

Uso personal.
