# Auditoria do Fluent Path (02/10/2026)

Tudo abaixo foi medido com scripts em `dev/` (audit_content, audit_freq, bench_*). Nada é estimativa de olho.

## Análise de frases (a parte mais frágil, melhorada nesta auditoria)
| Medição | Antes | Depois | Observação |
|---|---|---|---|
| 46 frases de treino (erros de brasileiros) | 41% | 93% | regras escritas olhando essas frases |
| 35 frases "holdout" | 14% | 89% | **contaminado**: ajustei regras depois de ver as perdidas |
| 30 frases inéditas (1ª rodada, antes do último ajuste) | — | **83%** | única medida honesta de generalização |
| Falsos alarmes em 70 frases corretas | 0 | 0 | |
| Falsos alarmes em 1432 frases do próprio conteúdo | 2 | 0 | |
| LanguageTool (online) nos mesmos conjuntos | 43–57% | — | combinado com as regras: 97–98% |

Leitura honesta: erro típico de brasileiro com padrão conhecido, o app pega ~80%+. Erro fora desses padrões (escolha de palavra, estilo, coerência) ele **não** pega; para isso use o botão de IA (chave Anthropic) ou LanguageTool. Regras em `src/rules.js`.

## Volume e diversidade de conteúdo
- 1.500 palavras (1.200 novas em 02/10, escritas por IA e ainda sem revisão humana), ~24 min de áudio: **áudio e volume ainda abaixo do necessário para B2 real** (~4.000–5.000 palavras recebidas, centenas de horas de input). O app é bom como método e rotina, não substitui input em massa (podcasts, séries, leitura).
- Frequência das palavras cai com o nível (mediana menor em B2), o que é o esperado, mas a cobertura de B1+ e C1 em gramática é fina (2 e 1 tópicos).
- Dicionário online (Wiktionary/Datamuse) cobre a lacuna de vocabulário sob demanda.

## Áudio
- Voz = Web Speech do navegador (TTS/STT). Qualidade depende das vozes instaladas no Windows; **sem gravação humana nem sotaques reais**. Avaliação de pronúncia é limitada ao reconhecimento do navegador (não é fonética tipo ELSA).

## Alinhamento com escolas e plataformas
| Referência | Situação |
|---|---|
| CEFR / Cambridge / British Council | Níveis e porta B2 com evidência: alinhado em estrutura; conteúdo ainda não validado contra EVP/EGP |
| Anki / FSRS | Repetição espaçada do tipo SM-2 com estabilidade: conceito alinhado, não é FSRS treinado |
| Duolingo / Babbel / Busuu | Missões, XP, trilha: sim. Falta volume e variedade de exercícios |
| ELSA | Pronúncia por fonética: não tem |
| Aulas com professor / conversa real | Roleplay e IA opcional ajudam, não substituem conversa humana |

## Prioridades recomendadas
1. Volume: ampliar para 1.500+ palavras e 3–4 h de áudio (precisa de autorização para baixar bases abertas).
2. Conversa real semanal (tutor/troca de idiomas) para cobrir fala e pronúncia.
3. Input diário externo (podcast/série com legenda) 30 min/dia.
4. Ativar IA para correção de textos livres.
5. Fase Android/Drive (adiada por decisão sua).
