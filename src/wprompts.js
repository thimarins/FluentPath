/* Temas do Writing lab: vários por tipo + desafios extras (o app sorteia e evita repetir). */
const WR_POOL = {
  Email: [
    'Write an email to a colleague explaining a delay in a project.',
    'Write an email to your manager asking for a day off next week.',
    'Write an email to a client confirming the details of a meeting.',
    'Write an email to a supplier complaining about a late delivery.',
    'Write an email to your team announcing a change in the schedule.',
    'Write an email to a recruiter saying you are interested in a job.',
    'Write an email asking a colleague for help with a difficult task.',
    'Write an email to apologize for a mistake you made at work.',
    'Write an email to IT support reporting a problem with your computer.',
    'Write an email to a hotel asking about prices and availability.',
    'Write an email thanking someone for an interview.',
    'Write an email to a new colleague welcoming them to the team.'
  ],
  Message: [
    'Write a short message to a friend inviting them to a trip.',
    'Write a message to a friend who just got a new job.',
    'Write a message to cancel dinner plans and suggest another day.',
    'Write a message to a neighbor about a noisy party.',
    'Write a message to your teacher explaining why you missed a class.',
    'Write a message to a friend recommending a movie or series.',
    'Write a message asking a colleague to cover your shift.',
    'Write a message to a friend who is going through a hard time.',
    'Write a message to a family member about holiday plans.',
    'Write a message to a landlord about a broken heater.',
    'Write a message to a friend asking for advice about a gift.',
    'Write a message to your team group chat about a deadline.'
  ],
  Opinion: [
    'Do you think AI will make IT jobs better or worse? Explain.',
    'Is it better to live in a big city or in a small town? Why?',
    'Should students be allowed to use AI tools to do homework?',
    'Is working from home better than working in an office?',
    'Do you think social media does more harm than good?',
    'Should public transport be free for everyone?',
    'Is it important to learn a second language? Explain your view.',
    'Do you think people spend too much time on their phones?',
    'Should companies offer a four-day work week?',
    'Is it better to save money or enjoy it while you are young?',
    'Do online courses replace traditional universities?',
    'Should people be required to vote?'
  ],
  Story: [
    'Tell a short story about a day when everything went wrong.',
    'Tell a story about a trip that did not go as planned.',
    'Tell a story about meeting someone who changed your life.',
    'Tell a story about the best surprise you ever received.',
    'Tell a story that begins with: "The lights went out and..."',
    'Tell a story about a time you were very nervous.',
    'Tell a story about getting lost in a place you did not know.',
    'Tell a story about a mistake you learned from.',
    'Tell a story about an unusual day at work or school.',
    'Tell a story about a gift that meant a lot to you.',
    'Tell a story about a childhood memory you still remember well.',
    'Tell a story that ends with: "...and I never saw it again."'
  ],
  Professional: [
    'Reply to a customer who is angry about a service outage.',
    'Write a report summarizing a security incident for management.',
    'Explain a technical problem to a person who is not technical.',
    'Write a short proposal to buy new equipment for your team.',
    'Write a message declining a meeting and suggesting an alternative.',
    'Write feedback for a colleague after a presentation.',
    'Write a project update for your manager: what is done, what is late.',
    'Reply to a customer asking for a refund.',
    'Write a short introduction of yourself for a new client.',
    'Write a message asking a vendor to improve the terms of a contract.',
    'Describe the main risks of a project and how to reduce them.',
    'Write a handover note for a colleague who will cover your work.'
  ]
};
CHALLENGES.push(
  { id: 'ch9', lvl: 'B2', prompt: 'Describe a problem at work and explain how you would solve it.', req: ['in order to', 'as a result', 'otherwise'], min: 5, secs: 100 },
  { id: 'ch10', lvl: 'B1+', prompt: 'Compare two places you have lived or visited.', req: ['whereas', 'both', 'however'], min: 4, secs: 90 },
  { id: 'ch11', lvl: 'B2', prompt: 'Explain the advantages and disadvantages of studying online.', req: ['on the one hand', 'on the other hand', 'overall'], min: 5, secs: 110 },
  { id: 'ch12', lvl: 'B2+', prompt: 'Argue for or against making passwords obsolete.', req: ['nevertheless', 'provided that', 'consequently'], min: 6, secs: 120 },
  { id: 'ch13', lvl: 'B1+', prompt: 'Describe a person you admire and say why.', req: ['because', 'who', 'for example'], min: 4, secs: 90 },
  { id: 'ch14', lvl: 'B2', prompt: 'Describe a decision you regret and what you learned from it.', req: ['if I had', 'although', 'as a result'], min: 5, secs: 100 },
  { id: 'ch15', lvl: 'B2', prompt: 'Explain how technology has changed the way people shop.', req: ['whereas', 'due to', 'moreover'], min: 5, secs: 100 },
  { id: 'ch16', lvl: 'B1+', prompt: 'Describe your ideal weekend and explain your choices.', req: ['so', 'after', 'but'], min: 4, secs: 90 },
  { id: 'ch17', lvl: 'B2+', prompt: 'Should companies be responsible for their employees\' mental health? Defend a position.', req: ['furthermore', 'whereas', 'in conclusion'], min: 6, secs: 120 },
  { id: 'ch18', lvl: 'B2', prompt: 'Write about a change you would like to make in your city.', req: ['would', 'so that', 'however'], min: 5, secs: 100 },
  { id: 'ch19', lvl: 'B1+', prompt: 'Explain how you prepare for an important event.', req: ['first', 'before', 'finally'], min: 4, secs: 90 },
  { id: 'ch20', lvl: 'B2', prompt: 'Explain why backups are important, using a real or imagined example.', req: ['for instance', 'unless', 'therefore'], min: 5, secs: 100 },
  { id: 'ch21', lvl: 'B2+', prompt: 'Discuss whether tourism helps or harms local communities.', req: ['nevertheless', 'while', 'as a consequence'], min: 6, secs: 120 },
  { id: 'ch22', lvl: 'B1+', prompt: 'Describe a meal that has a special meaning for you.', req: ['when', 'because', 'also'], min: 4, secs: 90 },
  { id: 'ch23', lvl: 'B2', prompt: 'Explain what makes a good leader.', req: ['in addition', 'whereas', 'as a result'], min: 5, secs: 100 },
  { id: 'ch24', lvl: 'B2', prompt: 'Tell your manager why a project needs more time, and propose a new plan.', req: ['due to', 'in order to', 'provided that'], min: 5, secs: 110 }
);
function wrPick(type) {
  const a = WR_POOL[type] || []; if (!a.length) return '';
  let p; for (let i = 0; i < 8; i++) { p = a[Math.floor(Math.random() * a.length)]; if (p !== WR.prompt) break; } return p;
}
function wrChallenges(fresh) {
  if (fresh || !WR.chal) {
    const seen = (S && S.seenEx) || {};
    WR.chal = CHALLENGES.map(c => ({ c, k: (seen[c.id] || 0) + Math.random() * 3 * DAY })).sort((a, b) => a.k - b.k).slice(0, 5).map(x => x.c);
  }
  return WR.chal;
}
