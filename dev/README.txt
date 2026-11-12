Testes automaticos do Fluent Path (precisam de Node.js).
  cd dev && npm install
  node test.js    fluxos completos (todas as telas, sessoes, nivelamento)
  node test4.js   recarregar a pagina / persistencia
  node test6.js   sincronizacao entre dois aparelhos (Drive simulado)
  node test7.js   modo launcher do Windows (inicie antes: powershell -File ..	oolsserver.ps1 -NoBrowser)

Atalho na raiz: npm test (build + test.js + test4.js + test6.js).
