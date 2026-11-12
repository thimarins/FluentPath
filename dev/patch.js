const fs=require('fs');let s=fs.readFileSync('build_reading.js','utf8');
function r(a,b){ if(!s.includes(a)){console.log('MISSING',a.slice(0,40));return;} s=s.replace(a,b);}
r("A colleague reads the proposed changes, asks questions and suggests improvements. ","");
r("Even so, the study shows how much room there is for improvement in a field that will only become more important. As the first generation of electric vehicles reaches the end of its life, the question of what to do with old batteries is becoming urgent.","Even so, the topic is becoming urgent: as the first generation of electric vehicles reaches the end of its life, the question of what to do with old batteries cannot wait.");
r(" Finding a good routine took me about a week, and it changed the whole experience.","");
r("other freelancers, which stopped me from feeling isolated.","other freelancers.");
r(", particularly for services that have not made the switch.",".");
r("Another teaches the model to express uncertainty or to decline to answer. Neither method is foolproof","No method is foolproof");
r("especially in fields such as medicine, law or engineering, where a plausible mistake can be expensive","especially in medicine, law or engineering");
r("Looking back, the founders say that the contract was never the real danger. The danger","The real danger");
r(", a decision they later described as the hardest of their careers.",".");
r("Data transfer between regions is another frequent surprise, since it is rarely considered during the design phase. ","");
r("Data transfer is the only cause of high bills.","Test environments are the only cause of high bills.");
r(", whereas a neighbourhood built with open space and ventilation in mind tends to be more comfortable and more energy-efficient.",".");
r("V('ventilation','ventilação')","V('emissions','emissões')");
r("which, if I am honest, was every few minutes. I wasn't expecting anything important. I was","which was every few minutes. I was");
fs.writeFileSync('build_reading.js',s);
