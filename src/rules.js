/* ============================================================
   FLUENT PATH — REGRAS EXTRAS DE ERRO (padrões gerais, não frases decoradas)
   Foco: erros típicos de brasileiros. Cada regra tem [regex, forma melhor, por quê, categoria].
   Medido com dev/bench_sentences.js e dev/bench_holdout.js (inclui varredura de falsos alarmes).
   ============================================================ */
(function () {
  const SINCE_OBJ = '(\\d{4}|january|february|march|april|may|june|july|august|september|october|november|december|monday|tuesday|wednesday|thursday|friday|saturday|sunday|last \\w+|yesterday)';
  const NUMW = '(a|an|one|two|three|four|five|six|seven|eight|nine|ten|twenty|several|\\d+)';
  const OBJP = '(me|him|her|us|them)';
  const OBJQ = '(me|him|us|them|her(?= (the|a|an|how|what|why|that|where|when|which|if)\\b))';
  const S3 = '(has|goes|does|makes|takes|gets|works|speaks|knows|lives|likes|wants|needs|thinks|says|sees|comes|gives|uses|plays|runs)';
  const IRR = '(went|saw|ate|took|came|made|wrote|gave|got|knew|said|had|bought|forgot|found|spoke|met|left|ran|brought|thought|told|heard|felt|lost|drove|flew|sat|stood|began|broke|chose|drank|sent|paid|sold)';
  const MORE = '(tall|short|long|old|young|high|low|large|strong|weak|slow|quick|clean|dirty|rich|poor|late|early|near|warm|hot|fresh|safe|wide|deep|thick|thin|heavy|smart|rude|cute|fast|cheap|easy|nice|big|small)';
  const R = [
    // preposições e verbos que não aceitam a estrutura do português
    [new RegExp('\\bexplain(ed|s|ing)? ' + OBJQ + '\\b', 'i'), 'explain to + person', 'Explain something TO someone: "explained the rules to us".', 'preposition'],
    [new RegExp('\\bsuggest(ed|s|ing)? ' + OBJP + ' to\\b', 'i'), 'suggest (that) … / suggest + -ing', '"Suggest" does not take "someone to do": "suggested that I change…".', 'gerund-infinitive'],
    [new RegExp('\\b(said|says|say) ' + OBJQ + '\\b(?! (hello|hi|goodbye|sorry|thanks))', 'i'), 'told me', 'Use "tell" with a person: "told me she was busy". "Say" does not take a person as object.', 'reported-speech'],
    [/\b(told|tells|tell) that\b/i, 'told me that', '"Tell" needs a person: "told me that…".', 'reported-speech'],
    [/\b(asked|ask|wondered) (me |him |her |us |them )?(where|what|when|why|how|who|which) (did|do|does|is|are|was|were|can|could|will|would) (i|you|he|she|we|they|it|my|your|his|her|the|this)\b/i, 'asked where I lived', 'In reported questions the word order is normal (no inversion): "asked what my name was".', 'reported-speech'],
    [/\binterested (on|about|with|for)\b/i, 'interested in', 'Preposition: interested IN.', 'preposition'],
    [/\b(am|is|are|was|were|be|'m|'s) (very |really |so )?(good|bad|excellent|terrible|great|brilliant) in (math|maths|english|sports?|cooking|singing|drawing|science|physics|chemistry|history|languages|\w+ing)\b/i, 'good at', 'Preposition: good AT.', 'preposition'],
    [/\bafraid from\b/i, 'afraid of', 'Preposition: afraid OF.', 'preposition'],
    [/\barriv(e|ed|es|ing) to (the|a|my|his|her|our|their|school|work|home|brazil|paris)\b/i, 'arrive at / in', 'Arrive AT a place (hotel, station) or IN a city/country.', 'preposition'],
    [/\bprefer (\w+ ){1,3}than\b/i, 'prefer X to Y', 'Say "prefer tea TO coffee" (or "would rather … than").', 'preposition'],
    [/\b(on|in) (the )?next (monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i, 'next Friday', 'No preposition before "next Friday".', 'preposition'],
    // concordância e auxiliares
    [/\b(did|didn't|didn’t|doesn't|don't|does not|did not|do not)\s+(?!need\b|feed\b|speed\b|seed\b|bleed\b|breed\b|proceed\b|succeed\b|exceed\b|heed\b|weed\b|embed\b|shed\b)(\w+)ed\b/i, 'base verb after did/didn\'t/don\'t', 'After did/does/do the verb stays in the base form.', 'agreement'],
    [new RegExp('\\b(did|didn\'t|didn’t|did not|doesn\'t|does not|don\'t|do not)\\s+' + IRR + '\\b', 'i'), 'base verb after did/didn\'t', 'After did/didn\'t the verb is in the base form: "didn\'t go", "didn\'t see".', 'agreement'],
    [new RegExp('\\b(can|could|should|must|will|would|might|may) ' + S3 + '\\b', 'i'), 'modal + base verb', 'After a modal verb use the base form (no -s).', 'modals'],
    [new RegExp('\\b(does|doesn\'t|did|didn\'t|do|don\'t|does not|did not|do not) ' + S3 + '\\b', 'i'), 'base verb after does/did', 'After does/did the verb is in the base form (no -s).', 'agreement'],
    [/\b(my|his|her|our|your|the|this|that) (?!staff|people|police|team|family|children|men|women|parents|data|news)(\w+[^s\s]) (don't|do not)\b/i, "doesn't", 'A singular subject needs "doesn\'t": "My sister doesn\'t speak French".', 'agreement'],
    [/\bthere (is|was) (many|several|few|two|three|four|five|six|ten|both)\b/i, 'there are / were', 'Use "there are" with plural nouns.', 'agreement'],
    [/\bthere (are|were) much\b/i, 'there is much / there are many', 'Use "many" with countable plurals.', 'agreement'],
    [/\b(everyone|everybody|someone|somebody|nobody|each (?!of\b)\w+|every (one|student|person|employee|child|member|user)) (have|are|were|don't|do)\b/i, 'has / is / was / doesn\'t', '"Everyone", "each" and "every" are singular.', 'agreement'],
    [/\b(they|we|you) was\b/i, 'were', 'Use "were" with they/we/you.', 'agreement'],
    // tempos
    [new RegExp('\\bsince ' + NUMW + ' (\\w+ )?(years?|months?|weeks?|days?|hours?|minutes?)\\b(?! ago)', 'i'), 'for + period of time', 'Use "for" with a period (for five years); "since" needs a starting point.', 'present-perfect'],
    [new RegExp('\\b(live|lives|work|works|study|studies|stay|stays|know|knows|play|plays) (\\w+ ){0,3}since ' + SINCE_OBJ + '\\b', 'i'), "I've lived / I've worked … since", 'With "since" use the present perfect: "I\'ve worked here since March".', 'present-perfect'],
    [new RegExp('\\b(am|is|are) (living|working|studying|waiting|staying|learning) (\\w+ ){0,3}since ' + SINCE_OBJ + '\\b', 'i'), "I've been working … since", 'With "since" use the present perfect continuous.', 'present-perfect'],
    [/\b(have|has|'ve) (\w+ed|lost|seen|done|gone|made|taken|written|eaten|met|bought|read|heard|found|given|had|been|come|left)\b[^.?!]{0,40}(?<!since )\b(yesterday|last (night|week|month|year|summer|weekend)|\d+ (days|weeks|months|years) ago|in (19|20)\d\d)\b/i, 'past simple', 'With a finished time (yesterday, last week, ago) use the past simple, not the present perfect.', 'present-perfect'],
    // condicionais e orações subordinadas
    [/\bif (I|he|she|we|they|it) would\b/i, 'if + past simple', 'No "would" in the if-clause.', 'conditional'],
    [/\bif (I|you|he|she|we|they|it) (knew|had|were|was|could|did|went|came|saw|got|made|took) [^,.!?]{0,60},\s*(then )?(I|you|he|she|we|they|it)?\s?(will|'ll)\b/i, 'if + past, would', 'Second conditional: if + past simple, would + verb.', 'conditional'],
    [/(^|[.!?]\s+)(when|as soon as|before|after|until|once) (I|you|he|she|we|they|it|\w+) will\b/i, 'when + present simple', 'After when/as soon as/before use the present, not will.', 'conditional'],
    [/\bwish(ed)? I (will|would)\b/i, 'I wish I had / could', 'After "I wish" use the past: "I wish I had more time".', 'conditional'],
    // vocabulário, coletivos e adjetivos
    [/\b(has|have|had) (\d+|one|two|three|four|five|six|seven|eight|nine|ten|twenty|thirty|forty|fifty) (years?) old\b/i, 'is … years old', 'Age uses BE, not HAVE: "He is 30 years old".', 'literal'],
    [/\b(childrens|peoples|mans|womans|mens|womens|foots|tooths|mouses)\b/i, 'irregular plural', 'Irregular plural: children, people, men, women, feet, teeth, mice.', 'plural'],
    [/\b(homeworks|furnitures|equipments|knowledges|luggages|feedbacks|researchs)\b/i, 'uncountable noun', 'This noun is uncountable: no plural -s ("a lot of homework").', 'uncountable'],
    [/\b(live|lives|work|works|study|studies|stay|stays|know|knows) (\w+ ){0,3}since (i|he|she|we|they|you) (was|were|am|got|started|moved|came|arrived)\b/i, "I've lived … since", 'With "since" use the present perfect: "I\'ve lived here since I was born".', 'present-perfect'],
    [/\bfor to (buy|get|go|make|see|do|take|find|learn|help|have|eat|visit)\b/i, 'to + verb', 'Purpose: use "to buy" or "in order to buy", not "for to".', 'gerund-infinitive'],
    [/\b(an?|many|several|few) (advice|information|equipment|furniture|knowledge|homework|luggage|baggage|feedback|progress|evidence)\b(?! (update|report|bar|meeting|review|check|chart|tracker|note))/i, 'uncountable noun', 'These nouns are uncountable: no "a/an" and no plural ("a piece of advice").', 'uncountable'],
    [new RegExp('\\bmore ' + MORE + '(?![\\w-])', 'i'), '-er form', 'Short adjectives take -er: taller, faster, cheaper (not "more tall").', 'comparatives'],
    [/\b(speak|speaks|spoke|play|plays|played|work|works|worked|sing|sings|sang|swim|swims|drive|drives|write|writes|cook|cooks|dance|dances|run|runs) (\w+ )?(very |really |so )good\b/i, 'very well', 'Adverb of "good" is "well": "speaks English very well".', 'adverb'],
    [/\b(the|this|that) (movie|film|lesson|class|lecture|book|story|trip|job|meeting|day|party|show|game|speech) (was|is|were|are) (really |very |so |too )?(bored|tired|interested|excited|confused|annoyed|surprised|embarrassed|frightened)\b/i, '-ing adjective', 'Things are boring/tiring/interesting; people are bored/tired/interested.', 'adjective'],
    [/\b(am|is|are|was|were|'m) (very |so |really |quite )?interesting (in|about)\b/i, 'interested in', 'People are "interested in"; things are "interesting".', 'adjective'],
    [/\bwould like that (you|he|she|they|we|I)\b/i, 'would like you to + verb', 'Say "I would like you to help me".', 'gerund-infinitive'],
    [/(^|[.!?]\s+)(always|never) (I|we|you|they|he|she) \w+/i, 'I always … / Never do I …', 'Adverbs of frequency go before the verb: "I always drink coffee".', 'word-order'],
    [/\b(which|who|whom|that) (I|we|you|they|he|she) (work|worked|works|talk|talked|speak|spoke|live|lived|wait|waited|listen|listened|look|looked|depend|depended) (for|with|to|in|at|on) (it|him|her|them)\b/i, 'remove the extra pronoun', 'Do not repeat the object: "the company I work for", "the man I spoke with".', 'relative-clauses'],
    [/[^;.]\s*,\s+however\s+(?!,)(we|I|they|he|she|it|the|this|that|there)\b/i, '; however,', 'Before "however" starting a new clause use a semicolon or a period, and put a comma after it.', 'connectors']
  ];
  R.forEach(r => ERROR_RULES.push(r));
  // a regra antiga "did + -ed" marcava "didn't need": troca pela versão com exceções
  const i = ERROR_RULES.findIndex(r => r[1] && String(r[1]).startsWith('base verb after did/didn') && r[0].source.includes("(\\w+)ed") && !r[0].source.includes('need'));
  if (i >= 0) ERROR_RULES.splice(i, 1);
})();
