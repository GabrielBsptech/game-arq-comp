# Game Comp — Arquitetura Computacional

Quiz em HTML, CSS e JavaScript com 16 termos de arquitetura de computadores.

## Como rodar

Abra o `index.html` no navegador. Pronto.

## Níveis

- **Fácil · Quiz**: leia a pista e digite a resposta.
- **Médio · Anagrama**: desembaralhe as letras.
- **Difícil · 5s**: anagrama com 5 segundos por termo.

## Como jogar

- Digite a resposta sem espaços e sem acentos (o jogo ajusta sozinho).
- Você tem 3 tentativas por termo e até 3 dicas.
- "Desistir" revela a resposta.
- "← Anterior" volta para a pergunta anterior.
- Ao final aparecem a pontuação, o ranking e os erros.
- Com 200 pontos você ganha o troféu "Computador Humano" com confetes.

## Arquivos

- `index.html` — telas e estrutura.
- `style.css` — visual.
- `script.js` — lógica e lista de termos.

## Editar os termos

Os termos ficam em `script.js`, no array `terms`. Cada item tem:

- `a`: resposta (maiúscula, sem espaço e sem acento).
- `r`: resumo curto usado nas dicas.
- `n`: nome completo usado no feedback.
- `q`: pista mostrada no modo fácil.

Exemplo:

```js
{a:'CPU', r:'Executa as instruções dos programas.', n:'CPU, a Unidade Central de Processamento', q:'É o cérebro do computador...'}
```


