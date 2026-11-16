# Estrutura do projeto

## Código-fonte (edite aqui)
- `src/*.js` + `src/style.css`: o app. O `build.js` concatena na ordem: `engine, engine2, rules, store, speech_ai, ui_core, runner, flows, pages1, pages2, tutor_smart, wprompts, engage, sync, lookup, main`.
  - `engine.js`: utilidades, estado inicial, domínio/FSRS, habilidades, requisitos B2, nivelamento.
  - `engine2.js`: geração de exercícios, plano da sessão, análise de texto, caderno de erros.
  - `store.js`: persistência, XP, streak, conquistas, usuário demo.
- `content/*.json`: 10 arquivos consolidados por categoria (`words`, `phrasals`, `grammar`, `natural`, `connectors`, `listening`, `reading`, `speaking`, `roleplay`, `diagnostic`).

## Saídas geradas (não edite; `node build.js` recria)
- `dist/FluentPath.html`: arquivo único.
- `app/index.html`: cópia usada pelo launcher do Windows (`tools/server.ps1`).
- `site/`: versão instalável (PWA).
As três cópias são intencionais. Para economizar espaço, apague-as e rode `node build.js`.

## Dados e ferramentas
- `data/`: seu progresso e backups (não versionado). `runtime/`: perfil do Edge do launcher, **guarda o progresso salvo no navegador**; não apague.
- `dev/`: testes e simulações (`npm test` na raiz). `docs/`: documentação.
