Tabuleiro de Arquitetura Computacional
=====================================

Resumo
------
Pequeno jogo/quiz em HTML, CSS e JavaScript que apresenta 16 termos de arquitetura computacional. Cada rodada mostra uma pista; o jogador deve digitar o termo exatamente como aparece no "tabuleiro" (sem espaços e sem acentos). Há 3 tentativas por termo e até 3 dicas disponíveis.

Como rodar (rápido)
-------------------
1. Abra o arquivo `index.html` no seu navegador (duplo clique ou arraste para o navegador).
2. Se preferir um servidor local (recomendado para desenvolvimento):

   - Com Python instalado: `python -m http.server 8000` e abra `http://localhost:8000`.
   - Ou use a extensão Live Server do VSCode.

Como jogar
------------
- Clique em "Começar".
- Leia a pista e digite a resposta no campo invisível (cada letra aparece nos quadradinhos).
- A resposta deve ser enviada sem acentos, sem espaços e em maiúsculas (o jogo faz a normalização automaticamente).
- Você tem 3 tentativas por termo. Use "Dica" até 3 vezes (cada dica custa pontos). "Desistir" revela a resposta.
- Ao final, você vê a pontuação, ranking e os termos que errou.

Onde estão os dados do jogo
--------------------------
- `script.js` contém a lista de termos na variável `terms` (vetor de objetos). Cada objeto tem:
  - `a`: resposta usada no tabuleiro (sem espaços/sem acento, em maiúsculas)
  - `r`: resumo curto (usado no guia)
  - `n`: nome legível (usado no feedback)
  - `q`: pista / pergunta exibida ao jogador

Exemplo de entrada em `script.js`:

  {a:'CPU', r:'Executa as instruções dos programas...', n:'CPU, a Unidade Central de Processamento', q:'É o “cérebro” do computador...'}

Personalizar / editar
---------------------
- Para adicionar, remover ou alterar termos, edite `script.js` no array `terms`.
- Se quiser aceitar espaços ou caracteres diferentes, ajuste a função `clean()` em `script.js` (ela normaliza a entrada removendo acentos e caracteres não alfabéticos).
- Estilização: altere `style.css` para modificar cores, tamanhos e layout.
- Comportamento do jogo (pontos, número de tentativas, dicas) está em `script.js` nas funções `check()`, `hint()` e constantes iniciais.

Estrutura dos arquivos
---------------------
- index.html — interface e marcação
- style.css — estilos
- script.js — lógica do jogo e dados (termos)

Dicas rápidas para desenvolvimento
----------------------------------
- Abra o console do navegador (F12) para ver erros e mensagens durante o desenvolvimento.
- Use Live Server ou `python -m http.server` para evitar problemas de CORS/recursos quando editar localmente.

Contribuição
-----------
Pull requests e melhorias são bem-vindas. Para mudanças rápidas, modificar o array `terms` já altera o conteúdo do jogo.

Licença
-------
Sem licença explícita — use como preferir (se for publicar, adicione uma licença adequada).

Bom jogo!
