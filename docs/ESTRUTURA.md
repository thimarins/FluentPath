# Estrutura do projeto

## Código-fonte (edite aqui)
- `src/*.js` + `src/style.css`: o app. O `build.js` concatena na ordem: `engine, engine2, rules, store, speech_ai, ui_core, runner, flows, pages1, pages2, tutor_smart, wprompts, engage, sync, lookup, main`.
  - `engine.js`: utilidades, estado inicial, domínio/FSRS, habilidades, requisitos B2, nivelamento.
  - `engine2.js`: geração de exercícios, plano da sessão, análise de texto, caderno de erros.
  - `store.js`: persistência, XP, streak, conquistas, usuário demo.
- `content/*.json`: conteúdo. Os prefixos são lidos pelo `build.js`:
  - `words_a/b/c/d1..d7`: vocabulário. `phrasals`, `natural`, `connectors`, `diagnostic`, `speaking`.
  - `grammar.json` + `grammar_new*.json`: tópicos novos de gramática (somam à lista).
  - `grammar_x*.json`: **exercícios extras** que se somam a tópicos existentes (não são arquivos órfãos).
  - `listening.json`, `listening_b.json`, `listening_x*.json`; `reading.json`, `reading_x*.json`; `roleplay.json`, `roleplay_x*.json`.

## Saídas geradas (não edite; `node build.js` recria)
- `dist/FluentPath.html`: arquivo único.
- `app/index.html`: cópia usada pelo launcher do Windows (`tools/server.ps1`).
- `site/`: versão instalável (PWA).
As três cópias são intencionais. Para economizar espaço, apague-as e rode `node build.js`.

## Dados e ferramentas
- `data/`: seu progresso e backups (não versionado). `runtime/`: perfil do Edge do launcher, **guarda o progresso salvo no navegador**; não apague.
- `dev/`: testes e simulações (`npm test` na raiz). `docs/`: documentação.
