# Botão

Ação em Arial Nova Condensed Bold sobre navy sólido (`action`/`action-ink`), cantos `radius-sm`.

- **Primário** `.am-btn` — uma por tela ou slide: a decisão que se espera.
- **Secundário** `.am-btn .am-btn-secondary` — contorno `line-strong`, para alternativas.
- **Texto** `.am-btn .am-btn-text` — links de apoio; o sublinhado vira laranja (`accent`) no hover, único uso do laranja aqui.
- Rótulos são verbos no infinitivo ("Aprovar plano"), nunca "Clique aqui".
- Nunca botão laranja: o laranja é detalhe, não ação (2.4:1 sobre branco).
- Foco visível: anel de 2px em `focus`.

O consumidor fornece o `<button>` e o rótulo; o estilo vem de `tokens/tokens.css` + `components/am-components.css`.
