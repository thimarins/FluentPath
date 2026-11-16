# Política de Privacidade — Fluent Path

O **Fluent Path** é um tutor pessoal de inglês que funciona localmente no navegador do usuário.

## 1. Dados armazenados localmente
- Seu progresso de estudos (palavras, gramática, sessões, erros e preferências) é salvo localmente no seu computador (`localStorage` e, no modo launcher Windows, em `data/progress.json`).
- Caso você opte por informar uma chave de API da Anthropic nas configurações, ela fica armazenada apenas no seu navegador local e nunca é enviada para servidores de terceiros além da própria API da Anthropic quando você solicita uma correção com IA.

## 2. Uso do Google Drive (`drive.appdata`)
- A sincronização com o Google Drive é **opcional** e iniciada apenas quando você conecta sua conta Google.
- O aplicativo solicita exclusivamente o escopo `https://www.googleapis.com/auth/drive.appdata`, que dá acesso apenas a uma pasta oculta e privada do próprio aplicativo no seu Google Drive.
- O Fluent Path **não** lê, modifica nem acessa outros arquivos do seu Google Drive, e não envia seus dados para nenhum servidor intermediário.

## 3. Exclusão de dados
- Você pode desconectar a sincronização ou apagar seu progresso local a qualquer momento em **Settings** dentro do aplicativo, ou revogar o acesso nas permissões da sua Conta Google.
