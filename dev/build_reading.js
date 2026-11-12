const fs = require('fs');
const T = [];
function add(lvl, topic, kind, title, text, qs, vocab) { T.push({ lvl, topic, kind, title, text, qs, vocab }); }
const Q = (type, q, c, ds, why) => ({ type, q, c, ds, why });
const V = (w, pt) => ({ w, pt });

add('B1+','tech','article','Why backups fail when you need them',
`Many companies believe their data is safe because they run a backup every night. However, a backup is only useful if you can restore it. Some teams discover this too late, when a server breaks down and the files turn out to be damaged or incomplete.

There are several common reasons for failure. Sometimes the backup job stops quietly after a software update, and nobody notices because the system does not send an alert. In other cases, the copies are stored in the same room as the original server, so a fire or a flood destroys both. Another problem is that people rarely test their backups, although a simple restore test once a month would show most problems early.

To avoid these surprises, experts suggest a few simple habits. Keep at least one copy in a different location, check the reports every week, and practise restoring a few files on purpose. As a result, the team will know exactly how long a recovery takes and what could go wrong. A backup that has never been tested is just a hope, not a plan.`,
[Q('main','What is the main idea of the text?','A backup is only reliable if it is tested and stored safely.',['Companies should stop making nightly backups.','Software updates are the biggest danger to company data.','Fires and floods are the most common cause of data loss.'],'The text ends: "A backup that has never been tested is just a hope, not a plan."'),
 Q('detail','Why can a fire destroy both the data and its backup?','The copies are kept in the same room as the server.',['The backup software can start a fire.','The backup is deleted after each update.','Nobody checks the weekly reports.'],'The text says the copies are "stored in the same room as the original server".'),
 Q('inference','What does the writer suggest about a backup that has never been tested?','It may not work when the company needs it.',['It is certainly damaged.','It is safer than a tested backup.','It does not need a second location.'],'Only a tested backup is a "plan"; an untested one is "just a hope".'),
 Q('vocab','What does "breaks down" mean in the first paragraph?','stops working',['is moved','is sold','is cleaned'],'A server that "breaks down" leaves files damaged or incomplete, so it stops working.')],
[V('breaks down','quebra / para de funcionar'),V('restore','restaurar'),V('alert','alerta'),V('recovery','recuperação')]);

add('B1+','travel','blog','Eleven hours on the night train',
`Last month I travelled from Vienna to Venice by night train, and I would do it again tomorrow. I was tired of airports, long security lines and tiny seats, so I decided to try something different. The trip took about eleven hours, but I hardly noticed the time.

My small cabin had two beds, a sink and a window that I could open a little. Although it was not luxurious, it was clean and surprisingly comfortable. After dinner I put on my headphones, watched the lights of the small towns go by, and fell asleep earlier than I expected. In the morning, the attendant brought coffee and a croissant, and I woke up to mountains covered in mist.

Of course, there are some disadvantages. Tickets can be expensive if you book late, and delays sometimes happen when the weather is bad. Still, I saved a night in a hotel, and I arrived in the city centre instead of an airport far outside it. If you are not in a hurry, I really recommend giving the night train a chance.`,
[Q('main','What is the main idea of the text?','The writer enjoyed the night train and recommends it.',['Night trains are cheaper than every other kind of transport.','The writer prefers hotels to trains.','Venice is the best city in Europe for tourists.'],'The writer says "I would do it again tomorrow" and "I really recommend giving the night train a chance".'),
 Q('detail','What did the attendant bring in the morning?','Coffee and a croissant.',['Tea and fruit.','A newspaper and juice.','Hot chocolate and bread.'],'The text says: "the attendant brought coffee and a croissant".'),
 Q('inference','What does the writer imply about night trains and hotels?','A night train can replace one night in a hotel.',['Hotels are always more comfortable.','Trains are only for rich travellers.','It is impossible to sleep on a train.'],'The writer says "I saved a night in a hotel" by sleeping on the train.'),
 Q('vocab','What does "in a hurry" mean in the last sentence?','needing to arrive quickly',['feeling very tired','travelling alone','afraid of delays'],'The advice is for people who are "not in a hurry", so the trip is slow, not fast.')],
[V('cabin','cabine'),V('attendant','atendente'),V('delay','atraso'),V('mist','neblina')]);

add('B1+','daily','email','News from the new apartment',
`Hi Carla, I hope you are doing well! I wanted to tell you about the new apartment, because we finally moved in last Saturday. It is smaller than the old one, but the location is much better. I can walk to the metro in five minutes, and there is a bakery just downstairs.

The move itself was stressful. The truck arrived two hours late, and we had to carry the sofa up four floors because the lift was too small. Luckily, my brother turned up with two friends and helped us out. We are still living among boxes, and I cannot find my coffee machine anywhere, which is a real problem on Monday mornings.

Anyway, we are planning a small housewarming party on the 20th, and I would love you to come. You don't need to bring anything, although a plant would be very welcome because the living room looks a bit empty. Let me know if you can make it. Give my love to your family, and talk soon! Bianca`,
[Q('main','What is the main idea of the email?','Bianca tells Carla about her move and invites her to a party.',['Bianca asks Carla to help carry boxes.','Bianca complains about her old apartment.','Bianca wants to sell her sofa.'],'Bianca describes the move and says "I would love you to come" to the housewarming party.'),
 Q('detail','Why did they carry the sofa up four floors?','The lift was too small.',['The lift was broken for a week.','The truck could not park nearby.','Nobody was home to open the door.'],'The text says "because the lift was too small".'),
 Q('inference','What can we infer about the new apartment?','It is in a convenient area.',['It is bigger than the old one.','It is far from public transport.','It already has a lot of decoration.'],'The metro is five minutes away and there is a bakery downstairs, so the location is good.'),
 Q('vocab','What does "turned up" mean in the second paragraph?','arrived',['left','called','refused'],'The brother "turned up with two friends and helped us out", so he arrived.')],
[V('housewarming party','festa de inauguração da casa'),V('lift','elevador'),V('helped out','ajudou'),V('stressful','estressante')]);

add('B1+','security','article','How to spot a phishing message',
`Phishing is one of the oldest tricks used by cybercriminals, and it still works. The attacker sends an email or message that looks like it comes from a bank, a delivery company or even your own boss. The goal is simple: to make you click a link or share a password before you have time to think.

Most phishing messages share some warning signs. They often create a sense of urgency, for example by saying that your account will be closed today. They may contain small spelling mistakes, or a sender address that looks almost right but is slightly different. Although some attacks are very well written, a link that does not match the company's real website is a strong signal that something is wrong.

If you receive a suspicious message, do not reply and do not open any attachment. Instead, go to the official website by typing the address yourself, or call the company. Many organisations also run training sessions in which employees get fake phishing emails, so they can practise spotting them. As a result, people become more careful, and fewer accounts are put at risk.`,
[Q('main','What is the main idea of the text?','Phishing tries to trick people, but there are warning signs and safe ways to react.',['Phishing only affects large banks.','Fake emails are always full of spelling mistakes.','Employees should never use email at work.'],'The text explains the trick, the "warning signs" and what to do with a suspicious message.'),
 Q('detail','What should you do with a suspicious message?','Go to the official website yourself or call the company.',['Reply and ask if it is real.','Open the attachment in a safe folder.','Forward it to all your colleagues.'],'The text says: "go to the official website by typing the address yourself, or call the company".'),
 Q('inference','Why do attackers often create a sense of urgency?','So that people act without thinking carefully.',['Because banks close accounts every day.','To help people read the message faster.','Because urgent emails are cheaper to send.'],'The goal is to make you click "before you have time to think".'),
 Q('vocab','What does "spotting" mean in "practise spotting them"?','noticing',['creating','deleting','printing'],'Employees get fake emails to practise noticing the warning signs.')],
[V('attachment','anexo'),V('sender','remetente'),V('urgency','urgência'),V('warning signs','sinais de alerta')]);

add('B1+','business','news','Small shops embrace instant payments',
`Many small shops in Brazil have changed the way they receive money in recent years. Instead of waiting for card machines or handling cash, owners now accept instant payments through a QR code on the counter. Customers simply scan the code with their phone, and the money reaches the shop account in seconds.

For shop owners, the benefits are clear. Fees are usually lower than card fees, and there is no need to pay for expensive equipment. Moreover, the money is available immediately, which helps with daily costs such as suppliers and electricity. A baker, for example, can buy flour in the morning with the money she earned an hour earlier.

However, the change brings some challenges. Some older customers still prefer cash, and a weak internet connection can slow down a sale. There is also the risk of fake payment screenshots, so staff must check the real balance before handing over the product. Even so, most owners say they would not go back to the old system. If this trend continues, cash may become less and less common in small businesses.`,
[Q('main','What is the main idea of the text?','QR code payments are helping small shops, despite some challenges.',['Cash is now illegal in small shops.','Card machines are cheaper than QR codes.','Customers dislike paying with their phones.'],'The text lists clear benefits and then some "challenges", but owners "would not go back".'),
 Q('detail','Why must staff check the real balance?','Some customers show fake payment screenshots.',['The QR code often fails.','Fees change every day.','The bank asks them to do it.'],'The text mentions "the risk of fake payment screenshots".'),
 Q('inference','What does the text suggest about the future of cash?','It may become less common.',['It will disappear next year.','It will replace QR codes.','Only young people will use it.'],'The last sentence says cash "may become less and less common in small businesses".'),
 Q('vocab','What does "handing over" mean in the third paragraph?','giving to someone',['wrapping carefully','setting a price for','returning to a supplier'],'Staff check the balance before "handing over the product" to the customer.')],
[V('fees','tarifas'),V('supplier','fornecedor'),V('balance','saldo'),V('counter','balcão')]);

add('B1+','culture','story','The street festival',
`Every year, on the last Sunday of June, the whole street where Marta grew up closed to traffic. Neighbours put tables outside, hung colourful flags between the balconies and cooked enough food for an army. As a child, Marta thought it was the best day of the year.

When she moved abroad for work, she missed the festival more than she expected. One June, she decided to organise a small version in her flat in Dublin. She invited coworkers from six different countries and cooked her grandmother's corn cake, even though she had never made it alone. The first one burnt, and the second one fell apart, so she called her mother for advice.

In the end, the third cake was almost perfect. Her guests brought their own dishes, and the evening turned into a mix of languages, music and laughter. Marta realised that the festival was never about the street itself. It was about sharing food and stories with people you care about, and that could happen anywhere in the world.`,
[Q('main','What is the main idea of the story?','Marta recreated a childhood festival abroad and understood its real meaning.',['Marta stopped cooking after burning a cake.','Marta\'s street still closes to traffic every week.','Marta\'s coworkers taught her a new recipe.'],'The story ends: the festival "was about sharing food and stories with people you care about".'),
 Q('detail','What did Marta do when her first cakes failed?','She called her mother for advice.',['She ordered food from a restaurant.','She cancelled the party.','She asked her coworkers to cook.'],'The text says: "she called her mother for advice".'),
 Q('inference','What does the ending suggest?','The meaning of the festival does not depend on the place.',['Cooking is easier alone.','Festivals only work in small streets.','Marta\'s mother should have come to the party.'],'It "could happen anywhere in the world".'),
 Q('vocab','What does "fell apart" mean in the second paragraph?','broke into pieces',['became sweeter','got cold','disappeared quickly'],'The second cake "fell apart", so it was not good, and she needed advice.')],
[V('neighbours','vizinhos'),V('flags','bandeiras'),V('burnt','queimou'),V('laughter','risadas'),V('care about','importar-se com')]);

add('B2','ai','article','Can AI help with code review?',
`Software teams have long relied on code review to catch bugs before they reach production. The process works well, but it is slow, and reviewers who are overloaded tend to skim rather than read carefully. This is where AI assistants are starting to play a role.

Modern tools can scan a change in seconds and point out missing error handling, unclear variable names or code that resembles a known security flaw. Because they never get tired, they are particularly good at the repetitive checks that humans find boring. Several teams report that this frees reviewers to concentrate on design decisions, which is where human judgement matters most.

Nevertheless, these tools have clear limits. They can produce comments that sound confident but are simply wrong, and they often lack knowledge of the business context behind a change. A suggestion that is technically correct may still break a rule that exists for legal reasons. For that reason, most engineers treat the assistant as a first filter rather than a final authority.

The practical lesson is to define in advance what the tool is responsible for. If the team agrees that the assistant handles style and obvious mistakes while people handle architecture and risk, review becomes both faster and more meaningful. Without that agreement, there is a danger that developers will either ignore the tool completely or trust it too much.`,
[Q('main','What is the main idea of the text?','AI assistants can support code review, but humans must still make the key decisions.',['AI tools will soon replace human reviewers.','Code review is no longer necessary.','Developers prefer AI comments to human ones.'],'Engineers treat the assistant "as a first filter rather than a final authority".'),
 Q('detail','According to the text, why are AI tools good at repetitive checks?','They do not get tired.',['They understand business rules.','They have legal knowledge.','They are slower but more careful than people.'],'The text says: "Because they never get tired, they are particularly good at the repetitive checks".'),
 Q('inference','What does the text imply about AI review comments?','They should be checked, because they can be wrong while sounding sure.',['They are usually ignored by experts.','They are always very short.','They never mention security.'],'They "can produce comments that sound confident but are simply wrong".'),
 Q('vocab','What does "skim" mean in "tend to skim rather than read carefully"?','read quickly without much attention',['write again','delete','translate'],'It is contrasted with reading "carefully", so it means reading without attention.')],
[V('reviewer','revisor'),V('overloaded','sobrecarregado'),V('flaw','falha'),V('judgement','julgamento'),V('skim','ler por cima')]);

add('B2','science','news','A gentler way to recycle batteries',
`Researchers working on battery recycling have announced a method that could make it easier to recover valuable metals from old electric-vehicle batteries. Today, most recycling plants shred the batteries and use heat or chemicals to separate the materials, a process that consumes a lot of energy and creates waste. The new approach, which is still at laboratory stage, uses a milder solution to dissolve the metals at lower temperatures.

If it works at industrial scale, the benefits could be considerable. Recovering metals such as lithium and cobalt from used batteries would reduce the need to mine them, and mining is often linked to environmental damage and difficult working conditions. In addition, a more efficient recycling chain could help manufacturers keep prices down as demand for electric cars grows.

That said, scientists are cautious. Results from small experiments do not always carry over to factories, where batteries come in different shapes and chemical compositions. Collecting old batteries and transporting them safely is also a challenge, since damaged cells can catch fire. The research team says that further tests with real, mixed batches are needed before any company can adopt the method.

Even so, the topic is becoming urgent: as the first generation of electric vehicles reaches the end of its life, the question of what to do with old batteries cannot wait.`,
[Q('main','What is the main idea of the text?','A new laboratory method may make battery recycling cleaner, but it needs more testing.',['Factories already use the new method widely.','Mining for metals has come to an end.','Electric cars will become cheaper next year.'],'The method is "still at laboratory stage" and "further tests ... are needed".'),
 Q('detail','What condition does the new method use to dissolve the metals?','Lower temperatures.',['Extreme pressure.','Higher temperatures than today.','Electric shocks.'],'It "uses a milder solution to dissolve the metals at lower temperatures".'),
 Q('inference','What can be inferred about the laboratory results?','They may not be repeated on an industrial scale.',['They have been confirmed in factories.','They are not interesting to companies.','They were published by mistake.'],'"Results from small experiments do not always carry over to factories."'),
 Q('vocab','What does "carry over" mean in "do not always carry over to factories"?','transfer successfully to another situation',['be stored for later','be moved by truck','become more expensive'],'The point is that lab results may not work the same way in factories.')],
[V('shred','triturar'),V('dissolve','dissolver'),V('cautious','cauteloso'),V('batch','lote'),V('mining','mineração')]);

add('B2','business','email','Updated hybrid-work arrangements',
`Dear team, following the feedback survey we ran last month, I would like to share the updated hybrid-work arrangements that will take effect on the first of next month. Thank you to everyone who took the time to respond; your comments were read carefully, and several of them directly shaped the final decision.

From now on, every department will meet in the office on Tuesdays and Thursdays, whereas the remaining days can be worked from home or from the office, as you prefer. The reason for fixed days is that many of you told us it was difficult to schedule workshops and one-to-one meetings when nobody knew who would be on site. Teams will be able to agree on a different pattern, provided that they get their manager's approval and that clients are not affected.

In order to make the office days worthwhile, we are redesigning part of the third floor into collaboration areas, with larger tables and better video equipment for calls with remote colleagues. The desk-booking system will also be simplified, so you will no longer need to reserve a place more than a day ahead.

I realise that no policy suits everybody, and we will review this one after three months. If you have any concerns in the meantime, please speak to your manager or to HR. Best regards, The People Team`,
[Q('main','What is the main idea of the email?','The company announces fixed office days and explains the reasons and next steps.',['The company is closing the office.','Employees must now work from home permanently.','The survey will be repeated every month.'],'The email gives the new schedule, the reasons for it and plans such as a review.'),
 Q('detail','Why were fixed office days introduced?','It was hard to schedule meetings when nobody knew who would be on site.',['The empty office was too expensive.','Managers demanded it.','Clients asked for it.'],'Employees said it was "difficult to schedule workshops and one-to-one meetings".'),
 Q('inference','What does the email suggest about the policy?','It may change after the review.',['It can never be changed.','It was decided without any employee input.','It applies only to managers.'],'"We will review this one after three months", and the survey "shaped the final decision".'),
 Q('vocab','What does "worthwhile" mean in "make the office days worthwhile"?','worth the time and effort',['very cheap','difficult to find','completely new'],'The new spaces aim to make going to the office a useful use of time.')],
[V('survey','pesquisa'),V('on site','no local'),V('approval','aprovação'),V('concerns','preocupações'),V('worthwhile','que vale a pena')]);

add('B2','tech','review','Three months with noise-cancelling headphones',
`After three months of daily use on trains, in open-plan offices and on a couple of long flights, I feel ready to give an honest verdict on these wireless noise-cancelling headphones. The short version is that they are excellent at what matters most, although they are not perfect, and the price will make some people hesitate.

The noise cancellation is the standout feature. Low engine hums and air-conditioning noise practically disappear, while voices are reduced rather than removed completely, which I actually prefer because I can still hear announcements. Sound quality is warm and balanced, and the battery lasted me roughly a full working week with moderate use, much longer than my previous pair.

Comfort is more of a mixed story. The headband is light, but after about three hours the ear cushions begin to feel warm, so I take them off for a few minutes. The case is also bulkier than I would like, which is annoying if you travel with hand luggage only. As for the app, it does the job, but pairing with a second device sometimes takes several attempts.

Would I recommend them? If you spend a lot of time in noisy environments and you can afford the price, yes, without hesitation. If your budget is tight, a cheaper model will give you most of the benefits, so I would wait for a discount.`,
[Q('main','What is the main idea of the review?','It is a positive but balanced review: great noise cancellation, some drawbacks and a high price.',['It is a complaint about poor sound quality.','It is an announcement of a new model.','It is a guide on how to repair headphones.'],'The writer says they are "excellent at what matters most, although they are not perfect".'),
 Q('detail','What does the reviewer say about voices?','They are reduced but still audible.',['They are completely removed.','They become louder.','They can only be heard through the app.'],'"Voices are reduced rather than removed completely."'),
 Q('inference','What does the writer suggest to readers with limited money?','Consider a cheaper model or wait for a sale.',['Avoid noise-cancelling headphones.','Buy the same model second-hand.','Ignore the battery life.'],'"If your budget is tight, a cheaper model ... so I would wait for a discount."'),
 Q('vocab','What does "standout" mean in "the standout feature"?','the most impressive one',['the most confusing one','the cheapest one','the oldest one'],'The noise cancellation is the feature the reviewer praises most.')],
[V('noise cancellation','cancelamento de ruído'),V('bulky','volumoso'),V('drawback','desvantagem'),V('hesitate','hesitar'),V('hand luggage','bagagem de mão')]);

add('B2','travel','blog','A month of remote work in Lisbon',
`When I first considered working remotely from Lisbon for a month, I imagined long lunches by the river and sunset walks after work. The reality turned out to be a little more complicated, but also more rewarding.

The first challenge was the apartment. The listing claimed to have a fast connection, yet video calls kept freezing in the evening. I ended up buying a local SIM card as a backup and, eventually, moving to a co-working space near the old tram line. It cost more than I had planned, but a stable connection and a proper desk made me far more productive. It also helped me meet other freelancers.

The city itself is hilly, so I got used to walking everywhere and carried comfortable shoes in my bag. Whereas tourists crowd the famous viewpoints in the afternoon, I discovered that early mornings are quiet, and the small cafés serve excellent coffee before the first meeting. Learning a few phrases in Portuguese made a difference too; people were visibly happier when I tried, even when my pronunciation was terrible.

My advice for anyone considering the same: test the internet before you book, schedule your calls around the time difference, and leave one free day each week to simply explore. Working abroad is not a permanent holiday, but with a little planning it can feel like one.`,
[Q('main','What is the main idea of the text?','Working remotely from Lisbon required adjustments, but planning made it rewarding.',['Lisbon is too expensive for remote workers.','Tourists make working in Lisbon impossible.','The writer decided to move to Lisbon permanently.'],'The reality was "more complicated, but also more rewarding", and the end gives planning advice.'),
 Q('detail','Why did the writer move to a co-working space?','The apartment\'s connection was unreliable in the evening.',['The apartment was too far from the river.','The landlord raised the rent.','The writer wanted to avoid tourists.'],'"Video calls kept freezing in the evening."'),
 Q('inference','What does the writer imply about speaking Portuguese?','Even imperfect efforts were appreciated by locals.',['Locals only reply in English.','Portuguese is easy to learn.','It is required to use co-working spaces.'],'People "were visibly happier when I tried, even when my pronunciation was terrible".'),
 Q('vocab','What does "ended up" mean in "I ended up buying a local SIM card"?','finally did, often without planning to',['stopped completely','started early','refused to'],'The writer did not plan it first; the SIM card was a result of the connection problem.')],
[V('listing','anúncio'),V('freelancer','profissional autônomo'),V('hilly','com muitas ladeiras'),V('viewpoint','mirante'),V('time difference','fuso horário')]);

add('B2','security','news','Passkeys: the end of the password?',
`Passwords have protected our online accounts for decades, yet they remain one of the weakest links in security. People reuse them, choose predictable ones and hand them over to fake websites without realising. In response, major technology companies are promoting passkeys, a login method designed to remove the password from the equation.

A passkey works by creating a pair of cryptographic keys when you register. One key stays on your device, while the other is stored by the website. When you log in, your device proves that it holds the private key, usually after you confirm your identity with a fingerprint, a face scan or a PIN. Since the secret never travels across the internet, there is nothing for an attacker to intercept, and a fake site cannot trick you into typing it.

Despite these advantages, adoption is far from complete. Not every service supports passkeys yet, and users are sometimes confused about what happens if they lose their phone. Most providers solve this by syncing passkeys through an account, but that means the account itself must be well protected. Companies also need to keep old password options for a while, which can leave a door open for attackers.

Experts therefore describe passkeys as an important step rather than a magic solution. In the meantime, using a password manager and turning on two-step verification remain sensible habits.`,
[Q('main','What is the main idea of the text?','Passkeys offer a safer alternative to passwords, but they are not yet fully adopted.',['Passwords are now banned by most websites.','Passkeys are less secure than passwords.','Only phones can use biometric login.'],'Experts call passkeys "an important step rather than a magic solution".'),
 Q('detail','Where does the private key stay?','On the user\'s device.',['On the website\'s server.','In an email message.','Only in a password manager.'],'"One key stays on your device, while the other is stored by the website."'),
 Q('inference','Why might keeping old password options be a problem?','Attackers may still target them.',['They make passkeys slower.','They cost users money.','They delete the passkeys.'],'They "can leave a door open for attackers".'),
 Q('vocab','What does "intercept" mean in "nothing for an attacker to intercept"?','catch something on its way',['improve','encrypt twice','delete permanently'],'The secret never travels across the internet, so an attacker cannot catch it in transit.')],
[V('passkey','chave de acesso (passkey)'),V('adoption','adoção'),V('fingerprint','impressão digital'),V('weak link','elo fraco'),V('sync','sincronizar')]);

add('B2+','ai','article','Why chatbots make things up',
`Anyone who has used a chatbot for long enough has seen it state something false with total confidence: an invented reference, a wrong date or a function that does not exist in any programming library. These errors are commonly called hallucinations, and they are not occasional glitches that engineers forgot to fix. They follow from the way language models work.

A language model is trained to predict which words are likely to come next, based on patterns found in huge collections of text. It does not look facts up in a database; instead, it generates a plausible continuation. Where the training data was rich and consistent, the output tends to be accurate. Where the data was thin, contradictory or absent, the model still produces fluent text, because fluency is what it was optimised for, and it has no built-in sense of when it does not know.

Researchers are tackling the problem from several directions. One approach lets the model retrieve documents from a trusted source and base its answer on them, which narrows the room for invention. No method is foolproof, and each adds cost or complexity, so the trade-offs have to be weighed case by case.

For users, the practical consequence is that fluency should never be mistaken for reliability. Checking important claims against primary sources remains essential, especially in medicine, law or engineering. Treating the model as a capable but fallible assistant, rather than an oracle, is the most realistic way to benefit from it while limiting the risk.`,
[Q('main','What is the main idea of the text?','Hallucinations come from how language models work, so outputs should be verified.',['Hallucinations are rare bugs that engineers will soon eliminate.','Language models store facts in a database.','Chatbots refuse to answer questions in specialised fields.'],'Hallucinations "follow from the way language models work" and "fluency should never be mistaken for reliability".'),
 Q('detail','What does one approach allow the model to do to reduce errors?','Retrieve documents from a trusted source.',['Skip fluent writing.','Work without any training data.','Copy answers from other chatbots.'],'"One approach lets the model retrieve documents from a trusted source."'),
 Q('inference','What does the text suggest about a fluent answer?','It does not prove that the answer is correct.',['It usually means the data was thin.','It is always based on a database.','It is less useful than a hesitant answer.'],'The model produces fluent text even when data is absent, so fluency is not reliability.'),
 Q('vocab','What does "foolproof" mean in "Neither method is foolproof"?','impossible to fail',['quick to apply','expensive to maintain','easy to explain'],'The text adds that each method has costs and limits, so neither is guaranteed to work.')],
[V('hallucination','alucinação'),V('fluency','fluência'),V('fallible','falível'),V('retrieve','recuperar'),V('trade-off','compromisso (troca)')]);

add('B2+','business','story','The startup that grew too fast',
`When the founders of a small logistics startup won their first large contract, they treated it as proof that their model worked. Within months they had doubled their staff, rented a bigger warehouse and promised delivery times that, in hindsight, were too ambitious. Everyone was working flat out, and the mood was euphoric.

The cracks appeared gradually. New employees were hired faster than they could be trained, so errors in packing and routing multiplied. Customers who had been delighted with the early service began to complain, and each complaint required time that nobody had to spare. Meanwhile, the monthly costs had risen sharply, whereas payments from the big client arrived ninety days after each delivery, which left the company permanently short of cash.

The turning point came when the founders, instead of hiring still more people, paused to examine where the process was breaking. They discovered that a handful of manual steps, which had worked at small volume, created most of the delays. By automating those steps and renegotiating the payment terms with their main client, they stabilised operations, although they had to let a number of recent hires go.

The company survived and eventually grew again, but at a slower, more deliberate pace. The real danger was the assumption that what works at one size will work unchanged at another. Growth, they learned, is not simply a matter of doing more of the same; it often demands that you rebuild how you work while the business is still running.`,
[Q('main','What is the main idea of the story?','A startup grew too quickly, hit operational and cash problems and had to change how it worked.',['A startup failed because it lost its main client.','A startup succeeded because it hired as many people as possible.','A startup refused a large contract to stay small.'],'The founders learned that growth "often demands that you rebuild how you work".'),
 Q('detail','Why was the company short of cash?','Costs rose sharply while the big client paid ninety days after delivery.',['Customers refused to pay.','The warehouse was sold.','The founders spent heavily on advertising.'],'Costs "had risen sharply", whereas payments "arrived ninety days after each delivery".'),
 Q('inference','What does the story suggest about the founders\' view of growth?','Growth may require changing processes, not only adding capacity.',['Growth should always be as fast as possible.','Large clients are always a mistake.','Automation should be avoided.'],'They say "what works at one size" may not work "at another".'),
 Q('vocab','What does "flat out" mean in "working flat out"?','as hard or as fast as possible',['without being paid','in a very calm way','on the ground floor'],'It describes the intense effort of everyone in the company.')],
[V('hindsight','retrospectiva'),V('warehouse','armazém'),V('turning point','ponto de virada'),V('let go','demitir'),V('short of cash','sem dinheiro em caixa')]);

add('B2+','tech','article','The hidden costs of the cloud',
`Moving to the cloud was supposed to make infrastructure cheaper and simpler, and in many cases it has. Yet a growing number of organisations are discovering that their monthly bill is difficult to explain, let alone control. Resources are easy to create with a few lines of configuration, and precisely because they are so easy to create, they are just as easy to forget.

The typical culprits are unspectacular. Test environments that were never switched off, storage volumes left behind after a server was deleted, and virtual machines far larger than the workload requires can quietly add up. In isolation each item looks trivial, but together they can represent a significant share of the total spend.

To address this, many companies have adopted a discipline that combines engineering, finance and management, often called FinOps. Its core idea is visibility: every resource should be tagged with the team and the project that own it, so costs can be traced to a decision rather than to an anonymous line on an invoice. Once ownership is clear, teams can set budgets, receive alerts when spending drifts, and schedule non-essential systems to shut down at night or on weekends.

Nevertheless, cutting costs is not an end in itself. A system that is trimmed too aggressively may lose the capacity it needs during a traffic peak, and an outage can cost far more than the savings. The aim, therefore, is not the lowest possible bill but a conscious balance between performance, resilience and price, supported by data rather than by guesswork.`,
[Q('main','What is the main idea of the text?','Cloud costs can grow unnoticed, and companies manage them through visibility, ownership and balance.',['Cloud computing is always more expensive than on-site servers.','FinOps means firing engineers to reduce costs.','Test environments are the only cause of high bills.'],'The text describes forgotten resources, then FinOps, and ends with "a conscious balance".'),
 Q('detail','According to the text, what is the core idea of FinOps?','Visibility of who owns each resource.',['Switching off every server.','Moving back to physical servers.','Buying larger virtual machines.'],'"Its core idea is visibility: every resource should be tagged with the team and the project that own it."'),
 Q('inference','What does the text suggest about the lowest possible bill?','It is not necessarily the best goal.',['It is the main aim of FinOps.','It is impossible to reach.','It always improves performance.'],'"The aim, therefore, is not the lowest possible bill but a conscious balance."'),
 Q('vocab','What does "drifts" mean in "alerts when spending drifts"?','gradually moves away from the expected level',['stops completely','is shared between teams','is deleted'],'Alerts help teams notice when spending slowly goes beyond the budget.')],
[V('bill','fatura'),V('workload','carga de trabalho'),V('tagged','etiquetado'),V('outage','indisponibilidade'),V('resilience','resiliência')]);

add('B2+','culture','article','Small talk across cultures',
`Small talk may seem trivial, but it carries a surprising amount of cultural information. In some countries, a stranger in a queue who comments on the weather or asks about your weekend is simply being sociable, and silence can feel awkward or even unfriendly. In others, the same remark may be received with suspicion, because conversation is expected to have a clear purpose.

These differences often cause misunderstandings in international workplaces. A manager from a culture that values informal chat before business may interpret a colleague's direct, brief emails as cold. Conversely, the colleague, who regards efficiency as a form of respect, may find the long introductions a waste of time. Neither is being rude; each is following unwritten rules that they learned so early that they no longer notice them.

Questions are another minefield. Asking "How are you?" is a greeting in some places and a genuine enquiry in others, so a detailed answer can surprise the person who asked. Likewise, topics regarded as safe, such as family, salary or religion, vary widely from one society to the next, and what counts as polite curiosity in one setting may feel intrusive in another.

Because these habits are invisible, the best strategy is not to memorise rules for every country but to observe before judging. Listening to how others open and close conversations, and adjusting accordingly, usually works better than assuming that your own style is the natural one. Curiosity, rather than certainty, makes cross-cultural communication far smoother.`,
[Q('main','What is the main idea of the text?','Small talk follows unwritten cultural rules, so observing others helps avoid misunderstandings.',['Small talk is friendly everywhere in the same way.','Direct emails are always rude.','People should avoid talking to colleagues from other countries.'],'The text recommends "to observe before judging" because of invisible habits.'),
 Q('detail','Why might a colleague find long introductions a waste of time?','They regard efficiency as a form of respect.',['They dislike their manager.','They do not speak the language.','They receive too many emails.'],'The colleague "regards efficiency as a form of respect".'),
 Q('inference','What does the writer imply about the people in these misunderstandings?','They are usually unaware of the rules they follow.',['They are being deliberately rude.','They have never worked abroad.','They should memorise the rules of every country.'],'They follow rules "they learned so early that they no longer notice them".'),
 Q('vocab','What does "minefield" mean in "Questions are another minefield"?','a situation full of hidden risks',['a place for outdoor games','a very quiet area','a type of formal meeting'],'The next sentences show how easily a simple question can be misunderstood.')],
[V('awkward','constrangedor'),V('sociable','sociável'),V('enquiry','pergunta / consulta'),V('intrusive','invasivo'),V('unwritten','não escrito')]);

add('B2+','science','news','Why cities stay hot after sunset',
`Anyone who has walked from a park into a dense city centre on a summer afternoon has felt it: the air seems several degrees hotter among the buildings. This is known as the urban heat island effect, and it occurs because materials such as asphalt, concrete and dark roofing absorb sunlight during the day and release it slowly in the evening, so cities cool down far less at night than the surrounding countryside.

The consequences go beyond discomfort. Higher night-time temperatures make it harder for the body to recover from daytime heat, which is particularly risky for older people and those with heart or breathing problems. Furthermore, demand for air conditioning rises, increasing electricity use and, in many regions, the emissions that come with it. Ironically, the machines that cool the inside of a building push warm air out into the street.

Urban planners have a range of responses. Planting trees and creating green corridors provide shade and release moisture, a natural form of cooling. Light-coloured or reflective roofs send a larger share of sunlight back into the sky, and some cities are experimenting with pavements made of materials that stay cooler. None of these measures is a complete solution, and their effect depends on local climate, available space and cost.

What researchers emphasise is that planning decisions made today will shape cities for decades. A street designed without shade is difficult and expensive to fix later. As summers become hotter in many places, heat is increasingly being treated as a design problem rather than merely a weather condition.`,
[Q('main','What is the main idea of the text?','Cities get hotter than nearby areas, and design choices can reduce the problem.',['Air conditioning is the best solution to urban heat.','Countryside areas stay hotter than cities at night.','Trees are useless against heat.'],'The text explains the heat island effect and then planning responses such as trees and reflective roofs.'),
 Q('detail','Why do cities cool down less at night?','Materials like asphalt and concrete release stored heat slowly.',['Trees block the wind.','Air conditioners are switched off.','Cities have fewer people at night.'],'These materials "absorb sunlight during the day and release it slowly in the evening".'),
 Q('inference','What does the text suggest about air conditioning?','It can make the outdoor heat problem worse.',['It is the cheapest way to cool a city.','It reduces electricity use.','It is unnecessary in hot regions.'],'"The machines that cool the inside of a building push warm air out into the street."'),
 Q('vocab','What does "emphasise" mean in "What researchers emphasise"?','stress as important',['forget','deny','reduce'],'Researchers stress that today\'s planning decisions will shape cities for decades.')],
[V('asphalt','asfalto'),V('shade','sombra'),V('reflective','refletivo'),V('emissions','emissões'),V('pavement','calçada')]);

add('B2+','daily','blog','What I learned from silencing my phone',
`A few months ago I noticed that I was picking up my phone roughly every time my attention dipped, which was every few minutes. I was simply filling tiny gaps in the day, such as waiting for the kettle, with a scroll through notifications. The habit seemed harmless until I realised how little I could remember from the hours I had supposedly spent reading.

So I ran a modest experiment. I switched off every notification except calls and messages from family, moved social media apps off my home screen, and decided that the phone would stay in another room during meals and the first hour after waking up. I didn't delete anything, partly because I need these tools for work, and partly because I suspected that a drastic ban would not last.

The first week was uncomfortable. I kept reaching for a phone that wasn't there, and boredom, which I had been avoiding for years, turned up with surprising force. By the third week, though, I noticed that I finished books again, that conversations felt less interrupted and that my mornings were calmer. Ideas also came to me while doing ordinary things like washing up, something I had almost forgotten was possible.

I don't claim this is a universal cure, and some days I fail. Nevertheless, the experience taught me that attention is not infinite and that my devices were designed, quite deliberately, to compete for it. Deciding when to be reachable, rather than being reachable by default, has given me back something I hadn't realised I'd lost.`,
[Q('main','What is the main idea of the text?','The writer reduced phone distractions and found their attention and calm improved.',['The writer deleted every app and quit their job.','The writer proves that everyone should stop using phones.','The writer started writing a book about phones.'],'After the experiment, "I finished books again" and "my mornings were calmer".'),
 Q('detail','What did the writer decide about the phone during meals?','It stayed in another room.',['It was switched off for a whole day.','It was used only for music.','It was handed to a family member.'],'The phone "would stay in another room during meals".'),
 Q('inference','What does the writer suggest about the design of the apps?','They are intended to capture as much attention as possible.',['They are designed to help people sleep.','They are designed for work only.','They are not very effective.'],'Devices "were designed, quite deliberately, to compete for" attention.'),
 Q('vocab','What does "washing up" mean in the third paragraph?','cleaning the dishes after a meal',['taking a shower','doing the laundry','cleaning the floor'],'It is given as an "ordinary thing" at home, and in British English means cleaning dishes.')],
[V('notification','notificação'),V('scroll','rolar a tela'),V('drastic','drástico'),V('boredom','tédio'),V('by default','por padrão')]);

const out = T.map((t, i) => ({
  id: 'rd-' + String(i + 1).padStart(2, '0'), lvl: t.lvl, topic: t.topic, kind: t.kind, title: t.title, text: t.text,
  qs: t.qs.map((q, j) => {
    const ans = (i + j) % 4;
    const opts = q.ds.slice(); opts.splice(ans, 0, q.c);
    return { q: q.q, opts, ans, why: q.why, type: q.type };
  }),
  vocab: t.vocab
}));
fs.mkdirSync('C:/Projetos/FluentPath/content', { recursive: true });
fs.writeFileSync('C:/Projetos/FluentPath/content/reading.json', JSON.stringify(out, null, 1), 'utf8');

// validate
const d = JSON.parse(fs.readFileSync('C:/Projetos/FluentPath/content/reading.json', 'utf8'));
const rng = { 'B1+': [150, 190], 'B2': [190, 230], 'B2+': [220, 260] };
const types = ['main', 'detail', 'inference', 'vocab'];
let bad = 0; const ids = new Set(); const cnt = { 'B1+': 0, 'B2': 0, 'B2+': 0 }; const ac = [0, 0, 0, 0];
if (d.length !== 18) { console.log('count', d.length); bad++; }
for (const t of d) {
  ids.add(t.id); cnt[t.lvl]++;
  const w = t.text.split(/\s+/).filter(Boolean).length; const p = t.text.split('\n\n').length;
  const r = rng[t.lvl];
  if (w < r[0] || w > r[1] || p < 3 || p > 4) { console.log('WORDS', t.id, t.lvl, w, 'paras', p); bad++; }
  if (t.qs.length !== 4) { console.log('qs', t.id); bad++; }
  t.qs.forEach((q, j) => { ac[q.ans]++; if (q.opts.length !== 4 || q.ans < 0 || q.ans > 3 || q.type !== types[j]) { console.log('Q', t.id, j); bad++; } if (new Set(q.opts).size !== 4) { console.log('dup', t.id, j); bad++; } });
  if (t.vocab.length < 3 || t.vocab.length > 5) { console.log('vocab', t.id); bad++; }
}
console.log('ids', ids.size, JSON.stringify(cnt), 'ans', ac, 'bad', bad);
