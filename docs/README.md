# Fluent Path — tutor de inglês em um único arquivo HTML

Abra `dist/FluentPath.html` no Chrome ou Edge (duplo clique). Não precisa de servidor, instalação nem conta.
Seu progresso fica salvo no próprio navegador (localStorage), neste computador.

## O que ele faz

O app responde sempre à mesma pergunta: **"qual a melhor atividade para este usuário agora?"**

| Área | Como funciona |
|---|---|
| Onboarding + nivelamento | Perguntas sobre objetivo, tempo e interesses. Depois, teste **adaptativo** de 16–24 questões (sobe/desce a dificuldade), mais amostra de escrita e de fala. Resultado por habilidade (CEFR), pontos fortes e fracos. |
| Sessão diária inteligente | Montada sozinha a partir de erros, curva de esquecimento, nível, objetivo e tempo (5–30 min). Blocos: warm-up, vocabulário, listening, gramática, speaking, correção de erros, mini desafio. |
| Motor de domínio | Cada palavra/tópico tem domínio, confiança, estágio (New/Learning/Familiar/Mastered/Forgotten), tempo médio, dicas usadas, probabilidade de esquecer e próxima revisão. |
| Degraus de aprendizagem | Reconhecer (teto 40%) → lembrar no contexto (62%) → produzir digitando (85%) → usar livremente (100%). Acertar só múltipla escolha **nunca** domina um conteúdo. |
| Dificuldade | Mira 80–85% de acerto: acima disso sobe; abaixo, revisa e reduz. Escolhe itens um pouco acima da zona de conforto. |
| Revisão espaçada | Intervalos que crescem com acertos sem dica e encolhem com erros. Aparece em "Reviews due". |
| Caderno de erros | Erros de exercícios, escrita e fala viram padrões ("literal translation", "preposições"…) e voltam na hora certa. Após um erro, entra um exemplo parecido logo em seguida. |
| Vocabulário | 180 palavras B1–B2+ (TI, negócios, viagem, vida diária) com tradução, IPA, exemplos, collocations, erro comum e família de palavras. Dicionário pessoal. Palavra do dia. |
| Phrasal verbs | 100, organizados por verbo, com contrastes. |
| Gramática | Mapa A1→C1 com pré-requisitos, status (dominado/aprendendo/fraco/bloqueado) e laboratório por tópico (explicação, exemplos, comparação, erros comuns, prática, mini teste). 26 tópicos, ~196 exercícios. |
| Conectores, Soar natural | 60 exercícios de conectores. 50 pares "compreensível vs. natural". Treinador de tradução (nota de naturalidade), construtor de frases. |
| Speaking, Listening, Writing, Reading | Fala com reconhecimento de voz do navegador; áudio por síntese de voz (0.75×–1.25×, sotaque US/GB); transcrição só depois de responder; análise de texto (nível, gramática, vocabulário, naturalidade, conectores). Roleplay com objetivos ocultos. |
| Roadmap | Progresso por **domínio demonstrado**, fases B1→B2+, "Por que ainda não sou B2?", portão B2 (requisitos + todas as habilidades + teste B2) e simulados CEFR com relatório. |
| Progresso | Gráficos, mapa de calor, vocabulário ativo × passivo, relatório semanal automático. |
| Extras | Tutor offline (responde com seus dados), Ctrl+K, conquistas, tema claro/escuro, exportar/importar dados, usuário demo. |

## Como o app te faz evoluir (e como foi verificado)

- **Ensina antes de testar:** todo item novo começa com um cartão (significado, exemplo, erro comum). Só depois vem o exercício. Errar algo que você acabou de conhecer não vira "erro guardado".
- **Nível honesto:** o nível exibido só sobe com evidência (B2 exige 60% dos requisitos B2 dominados). Simulei um aluno de nível B1+ por 60 dias: antes o app o chamava de B2 no dia 5; agora ele continua B1+ até demonstrar domínio. Com 20 min/dia ele chega ao B2 perto do dia 60.
- **Conteúdo novo sempre chega:** a fila de revisão tem teto diário e nunca bloqueia o conteúdo novo. Antes o aluno simulado via só 16 palavras em 60 dias.
- **Plano que se adapta:** mais vocabulário quando ele é o gargalo; menos gramática quando ela já está forte; Reading a cada ~3 dias; Writing a cada ~4 dias; recua um degrau quando você erra muito.
- **Motivação:** missões do dia (+XP e bônus), nível com nome e barra de XP, trilha com 10 estações até o B2, confete e contador de XP ao fim da sessão, sons opcionais (Settings ou ícone no exercício), aviso claro quando está no modo demo.
- **Conteúdo:** 300 palavras, 100 phrasal verbs, 26 tópicos de gramática, 40 listenings, 18 textos de leitura (toque em qualquer palavra para ver no dicionário), 36 prompts de fala, 12 roleplays. Tudo auditado por revisores independentes.
- **Simulação:** `node dev/sim.js 60 10` reproduz o aluno simulado e imprime acerto, conteúdo usado, evolução do nível e requisitos B2.

## IA opcional

Sem chave, tudo funciona offline com análise heurística. Em **Settings** você pode colocar uma chave da API da Anthropic para:
feedback de escrita/fala mais profundo, tutor conversacional, roleplay com IA e preenchimento automático do dicionário pessoal.
A chave fica só neste navegador e as chamadas vão direto para a Anthropic. Todas as respostas da IA são validadas por schema.
O estado (domínio, revisão, XP, streak, nível) é sempre calculado pelo app, nunca pela IA.

## Limites conhecidos (honestos)

- Voz: reconhecimento e síntese dependem do navegador (Chrome/Edge). A "pronúncia" é uma estimativa por palavras reconhecidas, não uma análise fonética real.
- Os dados ficam em um navegador/computador. Use **Settings → Export** para backup ou para trocar de máquina.
- A análise offline de texto é heurística: 45 regras para erros típicos de brasileiros, contagem de conectores, vocabulário B2 e tamanho das frases. Ela **não entende significado** e perde erros sutis em textos complexos; o nível que ela estima nunca passa de B2+. Para uma checagem mais profunda há o botão **Deep grammar check (online)**, que usa o LanguageTool (envia o texto para languagetool.org só quando você clica), e a **revisão por IA** com chave da Anthropic (a mais completa, ainda não testada com chave real).
- Dicionário: 180 palavras + 100 phrasal verbs **curados** (com exemplos, IPA, erros comuns e exercícios). Para qualquer outra palavra do inglês há a busca online na página Vocabulary (ou Ctrl+K): definições e exemplos do Wiktionary, frequência, sinônimos e combinações do Datamuse e tradução automática para português (MyMemory), com cache local. Um botão adiciona a palavra à sua revisão. A tradução automática pode errar o sentido; as palavras curadas são mais confiáveis.
- Áudio: voz sintética do navegador, sem gravações humanas. A qualidade depende das vozes instaladas no seu sistema.
- O conteúdo foi gerado por IA e revisado por auditorias independentes (gabaritos, níveis, traduções), mas vale uma leitura de um falante nativo.

## Para editar ou ampliar o conteúdo

Fonte em `src/` e `content/`. Depois de editar, rode `node build.js` para gerar `dist/FluentPath.html`.
Arquivos de conteúdo: `words_a/b.json`, `phrasals.json`, `grammar.json`, `natural.json`, `connectors.json`, `listening.json`, `speaking.json`, `roleplay.json`, `diagnostic.json`.
Testes automatizados: `node test.js` (fluxos completos num navegador simulado), `node test4.js` (recarregar a página, persistência).
