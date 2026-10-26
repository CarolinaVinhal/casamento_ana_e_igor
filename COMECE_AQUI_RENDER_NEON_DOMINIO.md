# Colocar o site no ar: GitHub + Neon + Render + seu domínio

Siga na ordem. Tempo total: uns 40 minutos (mais a espera do DNS).

```
Convidado ──► www.SEUDOMINIO.com.br  (Render Static Site: o site)
                     │
                     └──► api-casamento-ana-e-igor.onrender.com  (Render Web Service: a API em Python)
                                   │
                                   └──► Neon (banco PostgreSQL grátis, não apaga)
```

---

## Por que deu "Failed" no Render?

O serviço `casamento_ana_e_igor` foi criado como **Node**, mas o backend é **Python**. Por isso o Render tentou rodar `yarn start` e o deploy falhou com "Exited with status 1".
Além disso, o commit no GitHub (`60abcff`) é uma versão antiga.

**Solução:** apagar esse serviço e deixar o arquivo `render.yaml` criar os serviços certos (passo 3).

---

## Passo 1 — Atualizar o GitHub com esta versão

1. Descompacte o zip. Dentro dele está a pasta `SITE`.
2. No GitHub, abra o repositório **CarolinaVinhal/casamento_ana_e_igor**.
3. Apague os arquivos antigos e envie **o conteúdo de dentro da pasta `SITE`** (não a pasta em si). O `render.yaml` precisa ficar na raiz do repositório, ao lado do `index.html`. A pasta `backend` fica como pasta.
   - Pelo site do GitHub: **Add file → Upload files**, arraste tudo e clique em **Commit changes**.
   - Pelo GitHub Desktop: copie os arquivos para a pasta do repositório, faça **Commit** e depois **Push**.
4. Confira que o `.env` **não** foi enviado (o `.gitignore` já bloqueia).

A raiz do repositório deve ficar assim:

```
render.yaml   index.html   app.js   api-config.js   styles.css   admin.html ...
assets/       backend/
```

## Passo 2 — Banco de dados no Neon

1. Crie uma conta em **neon.tech** entrando com o GitHub.
2. Clique em **Create project**:
   - Nome: `casamento`
   - Postgres: versão mais nova
   - Região: **AWS São Paulo (sa-east-1)**, se aparecer. Se não aparecer, escolha **US East (Ohio)**, que fica perto do Render.
3. No painel do projeto, clique em **Connect** e copie a **connection string**. Ela é parecida com:
   `postgresql://neondb_owner:SENHA@ep-xxxx.sa-east-1.aws.neon.tech/neondb?sslmode=require`
4. Guarde essa string: ela é a senha do banco e não deve ser publicada. Se copiar com `psql '...'` na frente, tudo bem, o site limpa sozinho.

## Passo 3 — Render: apagar o serviço errado e criar pelo Blueprint

1. No serviço **casamento_ana_e_igor** (Node), vá em **Settings → Delete Web Service**.
2. Clique em **New → Blueprint** e escolha o repositório `casamento_ana_e_igor` (branch `main`). O Render lê o `render.yaml` e mostra **2 serviços**:
   - `casamento-ana-e-igor-site`: o site
   - `api-casamento-ana-e-igor`: a API
3. O Render pede o valor de duas variáveis:
   - `DATABASE_URL`: cole a string do Neon.
   - `ALLOWED_ORIGINS`: os endereços que podem usar a API, separados por vírgula e sem espaço:
     ```
     https://SEUDOMINIO.com.br,https://www.SEUDOMINIO.com.br,https://casamento-ana-e-igor-site.onrender.com
     ```
4. Clique em **Apply** e espere os dois ficarem **Live** (verde).
5. **Confira o endereço da API.** Abra o serviço `api-casamento-ana-e-igor` e veja a URL no topo.
   - Se for `https://api-casamento-ana-e-igor.onrender.com`, não precisa mudar nada.
   - Se o Render tiver colocado letras no fim (ex.: `...-x7k2.onrender.com`), abra `api-config.js` no GitHub, troque a linha `RENDER_API` pela URL certa com `/api` no fim e faça commit. O site se atualiza sozinho.
6. **Testes:**
   - Abra `https://api-casamento-ana-e-igor.onrender.com/api/health`. Tem que aparecer `"status": "online"`. Na primeira vez, pode demorar uns 50 segundos.
   - Abra `https://casamento-ana-e-igor-site.onrender.com`. O site tem que abrir. Digite "Carolina Mar" na confirmação e o seu nome deve aparecer.
7. **Senha do painel:** no serviço da API, abra **Environment** e copie o `ADMIN_TOKEN` gerado. É a senha do `admin.html`.

> O plano grátis "dorme" a API depois de 15 minutos sem uso. A primeira confirmação depois disso pode levar até cerca de 50 segundos. O site em si **não dorme**: é estático e abre na hora. Se a API demorar, o site guarda o envio e tenta de novo sozinho.

## Passo 4 — Ligar o seu domínio ao site

1. No Render, abra **casamento-ana-e-igor-site → Settings → Custom Domains → Add Custom Domain**.
2. Adicione `SEUDOMINIO.com.br` e depois `www.SEUDOMINIO.com.br`. O Render mostra os registros DNS a criar.
3. Onde você comprou o domínio, entre no **DNS** (no Registro.br: domínio → **DNS → Editar zona**) e crie os registros:

| Tipo | Nome | Valor |
|---|---|---|
| A | (vazio / @) | o IP que o Render mostrar (normalmente `216.24.57.1`) |
| CNAME | www | `casamento-ana-e-igor-site.onrender.com` |

   - Apague registros A ou CNAME antigos com o mesmo nome (os de "parking" do registrador).
   - No Registro.br, a zona só aparece se o domínio estiver usando os servidores DNS do próprio Registro.br.
4. Volte ao Render e clique em **Verify**. O DNS pode levar de minutos a algumas horas. O certificado HTTPS (cadeado) é criado sozinho.
5. Confirme que o `ALLOWED_ORIGINS` da API tem o domínio exatamente como é usado: com `https://` e sem barra no final.

## Passo 5 — Avisos por e-mail e WhatsApp (opcional)

No serviço da API, em **Environment**, adicione as variáveis da seção 7 do `GUIA_HOSPEDAGEM_E_SERVIDORES.md`:

- `COUPLE_EMAIL`
- `SMTP_USER`
- `SMTP_PASS`
- `CALLMEBOT_TARGETS`

## Checklist final

- [ ] `/api/health` abre
- [ ] Site abre no seu domínio, com cadeado
- [ ] Confirmar presença com um nome da lista funciona e aparece no `admin.html`
- [ ] Mural: enviar recado e ver a resposta da matilha
- [ ] Presente: QR Code do Pix aparece com o valor certo
- [ ] Link do Mercado Pago colado em `CARD_PAYMENT_URL` (app.js), quando existir
- [ ] Esconder pelo painel os recados de teste e cancelar os presentes de teste antes de divulgar
