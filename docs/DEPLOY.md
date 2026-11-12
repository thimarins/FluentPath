# Fluent Path no Windows + Android, com o progresso sincronizado

Resultado: um app que você instala no Windows (janela própria, ícone no menu Iniciar) e no Android (ícone na tela inicial), funciona offline, e **seu progresso se sincroniza pelo seu próprio Google Drive**. Custo: R$ 0.

Você faz três coisas, uma vez (≈ 15 minutos): **A)** colocar a pasta `site` online, **B)** criar um "client ID" do Google, **C)** instalar nos dois aparelhos.

---

## A) Colocar o app online (grátis, GitHub Pages)

Precisa de HTTPS: sem isso o Google não deixa conectar ao Drive e o Android não instala o app.

1. Crie uma conta em **github.com** (se não tiver) e um repositório novo, por exemplo `fluent-path` (público).
2. **Add file → Upload files** e envie **o conteúdo** da pasta `site` (`index.html`, `manifest.webmanifest`, `sw.js`, `icon-192.png`, `icon-512.png`).
3. **Settings → Pages → Branch: main / (root) → Save.**
4. Em 1–2 minutos o endereço aparece: `https://SEU-USUARIO.github.io/fluent-path/`.

> O repositório público expõe só o app (que não tem dados seus). Seu progresso fica no seu Drive, nunca no GitHub.

## B) Criar o client ID do Google (gratuito)

1. Abra **console.cloud.google.com** e crie um projeto (nome: Fluent Path).
2. **APIs e serviços → Biblioteca →** ative a **Google Drive API**.
3. **Tela de consentimento OAuth →** tipo **Externo** → nome do app → seu e-mail. Em **Escopos**, adicione `.../auth/drive.appdata`. Em **Usuários de teste**, adicione o seu Gmail.
4. **Credenciais → Criar credenciais → ID do cliente OAuth → Aplicativo da Web.**
5. Em **Origens JavaScript autorizadas** coloque só a origem: `https://SEU-USUARIO.github.io` (sem `/fluent-path`).
6. Copie o **ID do cliente** (termina em `.apps.googleusercontent.com`). Ele não é segredo.

Observações:
- O escopo `drive.appdata` é o mais restrito: o app só enxerga uma pasta escondida criada por ele mesmo, nunca seus outros arquivos.
- Enquanto o app estiver em modo "Teste", o Google mostra "app não verificado": clique em **Avançado → Continuar**. É o seu próprio app. (Se quiser tirar esse aviso, publique a tela de consentimento; confirme as regras atuais no console.)

## C) Instalar e conectar

**Windows (Edge ou Chrome):** abra o endereço → menu ⋯ → **Aplicativos → Instalar este site como um aplicativo** (Chrome: ícone de instalar na barra de endereço). Ele abre em janela própria.

**Android (Chrome):** abra o endereço → menu ⋮ → **Instalar app** (ou "Adicionar à tela inicial").

**Conectar o Drive (em cada aparelho):**
1. No app, **Settings → Sync with Google Drive** → cole o client ID → **Connect & sync** → escolha sua conta Google e permita.
2. No **segundo aparelho**, na tela inicial use **"I already use Fluent Path: restore from Google Drive"**, cole o mesmo client ID e entre. Seu progresso aparece e você cai direto na Home.

## Como funciona no dia a dia

- Toque no ícone de **nuvem** (barra superior) para sincronizar. O Google exige **um toque por sessão** para liberar o acesso; depois disso o app sincroniza sozinho ao terminar cada sessão de estudo.
- **Nada é sobrescrito:** os dois aparelhos se **mesclam**. Você pode estudar no Android offline e no PC, depois sincronizar. Resultados que cada um conquistou se somam; para o mesmo item vale o mais recente. XP e dias de estudo usam o maior valor (nunca perdem, no pior caso contam um pouco menos).
- **Backups:** a cada dia o app guarda uma cópia do que estava no Drive (as 7 últimas). **Settings → Restore backup** volta a qualquer uma.
- A chave de IA (se você usar) **nunca** vai para o Drive: cole em cada aparelho.
- O usuário demo nunca sincroniza.

## Já usei o arquivo FluentPath.html antes?

Aquele progresso está salvo "dentro daquele arquivo" (outro endereço para o navegador), então **não vem sozinho**. Faça assim: no arquivo antigo, **Settings → Export my data**; no app instalado, **Settings → Import data**. Depois conecte o Drive.

## Se não quiser usar o Google Cloud

Funciona o caminho manual: **Settings → Export my data** (salve o arquivo no Drive) e, no outro aparelho, **Import data** escolhendo o arquivo do Drive. Não é automático, mas também não precisa de conta de desenvolvedor.

## Atualizar o app depois

Substitua os arquivos da pasta `site` no repositório. O app instalado se atualiza sozinho na próxima abertura (com internet).

## Para o desenvolvedor

`node build.js` gera `dist/FluentPath.html` (arquivo único) e `site/` (versão instalável). Para já embutir o client ID, crie `config.json` com `{"googleClientId": "SEU_ID"}` antes de rodar o build. Testes: `node test.js`, `node test4.js`, `node test6.js` (sincronização entre dois aparelhos com um Drive simulado).
