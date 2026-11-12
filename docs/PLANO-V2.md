# Fluent Path v2 — plano para ficar grande, ir pro Android e não perder progresso

## 1. O que limita a versão atual

| Limite | Por quê |
|---|---|
| Dados só no navegador do PC | Estão no `localStorage`: limpar o navegador apaga tudo, e o celular não vê nada. |
| Dicionário pequeno (180 + 100) | Conteúdo fixo dentro do HTML. |
| Análise de texto rasa | 45 regras. Não entende significado. |
| Pronúncia = estimativa | O navegador só devolve a transcrição, não a qualidade do som. |
| Chaves de API no navegador | Aceitável para uso pessoal, ruim para crescer. |

## 2. Arquitetura recomendada

Manter o app atual como cliente (ele já funciona e foi testado) e envolver com três camadas:

```
 Android (Capacitor)  ┐
 PWA no navegador     ┼─►  Cliente local-first (IndexedDB + service worker, funciona offline)
                      ┘            │  sincroniza quando há internet
                                   ▼
                    Backend leve (Supabase: login + banco + funções)
                       │        │            │             │
                       ▼        ▼            ▼             ▼
                    Claude   Azure Speech  LanguageTool  Dicionários
                  (feedback)  (pronúncia)   (gramática)   (com cache)
```

Por que um backend: guardar as chaves fora do app, sincronizar celular e PC e fazer cache de consultas.

## 3. Feedback conforme a SUA fala, frases e erros

**Fala (o maior salto):**
1. **Transcrição** (Android: reconhecimento nativo ou Azure).
2. **Avaliação de pronúncia por fonema** (Azure Pronunciation Assessment: nota de precisão, fluência, entonação e completude por palavra e por fonema). Esse é o único jeito de realmente "ouvir" o som. A IA de texto só vê a transcrição.
3. **Métricas de fluência:** palavras por minuto, pausas longas, "uh/um", repetições e travadas.
4. **IA (Claude)** recebe transcrição + métricas e devolve JSON validado: erros com trecho, versão mais natural, 3 "upgrades" (conector, collocation, phrasal verb).
5. **Treino dos seus sons fracos:** se você erra sempre /θ/ (think), /ɹ/, o "-ed" final ou /ɪ/ vs /iː/ (ship/sheep), o app cria pares mínimos e frases de shadowing só com esses sons.

**Texto e erros (Error Memory 2.0):**
- Todo texto/fala passa por **LanguageTool** (gramática) + **IA** (naturalidade e nível) e os erros caem em uma taxonomia ligada ao mapa de gramática.
- Detector de **interferência do português** (falsos cognatos, "I have 10 years", preposições).
- **Exercícios feitos com as SUAS frases:** "corrija esta frase" e lacunas geradas a partir do que você escreveu, entrando na revisão espaçada.
- Painel "o que mudou": erros que sumiram, erros persistentes, novos padrões.

**Dicionário amplo (consulta online com cache offline):**
- Toque em qualquer palavra de qualquer texto → cartão → "adicionar à revisão".
- Camadas: núcleo curado (3–5 mil palavras) + [Wiktionary](https://www.wiktionary.org) (definições, IPA, áudio), Datamuse (sinônimos e palavras que costumam vir juntas), [Tatoeba](https://tatoeba.org/en/downloads) (milhões de frases de exemplo com tradução para português) + IA para tradução e nível CEFR.
- Licenças: Tatoeba é CC BY 2.0 FR (exige atribuição); o áudio tem licenças variadas, então use só o que for CC. Wiktionary é CC BY-SA. Confirmar antes de publicar para terceiros.

## 4. Android sem perder progresso

| Opção | Prós | Contras | Veredito |
|---|---|---|---|
| **PWA** (instalar pelo Chrome) | Custo zero, mesmo código, offline | Notificações e sincronização em segundo plano limitadas | Fase 1 |
| **Capacitor** (APK) | Mesmo código web, [plugins de reconhecimento de voz nativos, até on-device](https://capawesome.io/plugins/speech-recognition/), notificações locais (lembrete de sequência) | Precisa de build Android | **Recomendado** |
| Nativo (Kotlin/Flutter) | Máxima qualidade | Reescrever tudo | Só se virar produto grande |

**Não perder avanços (em camadas):**
1. **Local-first:** troca `localStorage` por IndexedDB (maior, mais seguro) e service worker para funcionar offline.
2. **Conta + sincronização** (e-mail ou Google): cada resposta vira um evento único; os conceitos se mesclam pelo registro mais recente. PC e Android convergem.
3. **Backup automático diário** (arquivo JSON no armazenamento da nuvem) + botão exportar que já existe.
4. **Migração:** você exporta hoje e importa na v2. Nada se perde.
5. Reinstalar o app ou trocar de celular = fazer login.

## 5. Custo e privacidade (estimativas; confirme nas páginas oficiais)

- [Supabase](https://makerkit.dev/blog/saas/supabase-pricing): plano grátis com 500 MB de banco, 50 mil usuários, mas **pausa após 1 semana sem uso** (plano pago ~US$25/mês evita).
- [Azure Speech](https://azure.microsoft.com/en-us/pricing/details/speech/): ~5 h/mês grátis de transcrição; a avaliação de pronúncia custa cerca de [US$0,30/h a mais em tempo real](https://learn.microsoft.com/en-in/answers/questions/5608069/pricing-and-usage-of-pronunciation-assessment-feat). Com 10 min/dia, fica perto do grátis.
- Claude (modelo pequeno): centavos por dia de uso pessoal.
- LanguageTool: API pública com limite, ou servidor próprio (~US$5/mês).
- **Meta realista para uso pessoal: R$ 0 a R$ 50/mês.**
- **Privacidade (LGPD):** voz e textos são dados pessoais. Padrão proposto: **não guardar áudio**, só transcrição e notas; apagar tudo a pedido; cada usuário só enxerga os próprios dados.

## 6. Fases

| Fase | Entrega | Resultado |
|---|---|---|
| 1 | PWA instalável no Android + IndexedDB + offline + toque-na-palavra com dicionários e Tatoeba (com cache) | Já usa no celular; dicionário amplo |
| 2 | Login + sincronização + backup + proxy seguro para IA | PC e Android juntos, sem perder nada |
| 3 | Pipeline de fala: Azure (fonemas, fluência) + feedback Claude + treino de sons fracos | Feedback real da sua voz |
| 4 | Error Memory 2.0: LanguageTool + IA + exercícios das suas frases + interferência do português | Plano que ataca seus erros reais |
| 5 | APK Capacitor + lembretes + atalhos | App "de verdade" no celular |

## 7. Decisões que dependem de você

1. **Só para você ou outras pessoas também?** (muda login, custos e licenças.)
2. **Aceita criar contas** no Supabase e no Azure e me passar as chaves por um canal seguro? (eu não crio contas nem digito senhas por você.)
3. **Android:** instalar o APK direto no seu celular (grátis) ou publicar na Play Store (US$25 uma vez)?
4. **Pasta do projeto:** escolher uma pasta no seu computador para o projeto crescer (hoje está numa pasta temporária da sessão).
