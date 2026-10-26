# 🚀 Como colocar o site do casamento no ar

> **Vai usar Render + Neon + seu domínio?** Siga o arquivo `COMECE_AQUI_RENDER_NEON_DOMINIO.md`. Ele é mais novo e substitui a seção 3 deste guia.

Guia passo a passo para publicar o site da Ana & do Igor com domínio próprio (`.com.br`), HTTPS e backend funcionando.

---

## 0. Entenda as peças

```
SITE/
├── index.html, styles.css, app.js, admin.html   ← FRONTEND (site que os convidados veem)
├── assets/                                      ← fotos, presentes, matilha
└── backend/                                     ← API em Python (RSVP, presentes, mural)
    ├── main.py, models.py, schemas.py, database.py, seed.py, notifier.py
    ├── gifts_seed.json   ← catálogo de presentes (mesmos IDs do app.js)
    ├── requirements.txt, schema.sql
    └── .env.example      ← modelo das configurações secretas
```

- **Frontend**: arquivos estáticos. Pode ficar em qualquer hospedagem de site.
- **Backend**: programa Python que precisa ficar **rodando** num servidor, com um **banco de dados** que não se apague.

> ⚠️ **Sem o backend**, o site abre normalmente, mas confirmações, recados e presentes **não são salvos**: cada convidado vê só o que ele mesmo fez. Para um casamento de verdade, publique o backend.

**Não envie para o servidor:** `venv/`, `__pycache__/`, `*.pyc`, `wedding.db` e `.env` (o `.gitignore` já ignora esses arquivos).

---

## 1. Teste no seu computador primeiro (Windows)

Abra o **PowerShell** na pasta `SITE\backend`:

```powershell
# 1. Apague o banco antigo (não tem dados reais e a estrutura mudou)
del wedding.db

# 2. Ative o ambiente virtual e instale as dependências
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# 3. Crie o arquivo de configurações
copy .env.example .env
#    -> abra o .env no Bloco de Notas e defina ADMIN_TOKEN (uma senha grande)
#    -> para testar local, deixe ALLOWED_ORIGINS=http://localhost:8080 e ENABLE_DOCS=true

# 4. Rode a API
uvicorn main:app --reload
```

Abra outro PowerShell na pasta `SITE` (onde está o `index.html`):

```powershell
python -m http.server 8080
```

Acesse **http://localhost:8080** e teste:
- [ ] Confirmar presença com "João Pedro Almeida" (com e sem acento)
- [ ] Deixar um recado no mural e recarregar a página (o recado continua lá?)
- [ ] Abrir um presente e ver o QR Code / Copia e Cola
- [ ] Clicar em "Já fiz o Pix" e ver o presente virar "Aguardando Pix"
- [ ] Abrir **http://localhost:8080/admin.html**, entrar com o ADMIN_TOKEN e clicar em "Caiu ✔"
- [ ] Ver a documentação automática da API em **http://localhost:8000/docs**

---

## 2. Registrar o domínio `.com.br`

1. Acesse [registro.br](https://registro.br) e pesquise o nome (ex.: `igoreana.com.br`).
2. Crie a conta com CPF e pague a anuidade (confira o valor atual no site).
3. O painel DNS será configurado no passo 3 ou 4, conforme a opção escolhida.

---

## 3. OPÇÃO A (recomendada, sem servidor para cuidar)
### Frontend na Netlify + Backend no Render + Banco PostgreSQL

### 3.1 Banco de dados (PostgreSQL)
Crie um banco PostgreSQL gratuito/barato. O próprio **Render** oferece (menu *New → PostgreSQL*); **Neon** e **Supabase** também servem. Copie a **"External/Connection URL"**, algo como:
```
postgresql://usuario:senha@host:5432/casamento
```
> Por que não SQLite? No Render/Railway o disco é apagado a cada deploy ou reinício, e **as confirmações sumiriam**.

### 3.2 Backend no Render
1. Suba a pasta `SITE` para um repositório **privado** no GitHub (o `.gitignore` já impede o envio do `.env` e do banco).
2. No [Render](https://render.com): *New → Web Service*, conecte o repositório.
3. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Em **Environment**, cadastre as variáveis do `.env.example`:
   - `DATABASE_URL` = URL do PostgreSQL do passo 3.1
   - `ALLOWED_ORIGINS` = `https://igoreana.com.br,https://www.igoreana.com.br`
   - `ADMIN_TOKEN` = uma senha com **pelo menos 20 caracteres** (menor que isso o painel fica desligado)
   - `PIX_KEY` = `+5561991760206`
   - `SMTP_USER` / `SMTP_PASS` para receber avisos por e-mail (no Gmail use uma **senha de app**)
5. Depois do deploy, anote a URL (ex.: `https://api-casamento.onrender.com`) e teste `https://api-casamento.onrender.com/api/health`.

> 💤 No plano gratuito do Render o serviço "dorme" sem uso, e a primeira visita pode demorar para responder. Para o mês do casamento vale considerar o plano pago mais barato (confira os preços atuais).

### 3.3 Apontar o site para a API
No `app.js`, troque a linha do `API_BASE_URL`:
```javascript
API_BASE_URL: (['localhost', '127.0.0.1', ''].includes(location.hostname))
  ? 'http://localhost:8000/api'
  : 'https://api-casamento.onrender.com/api',   // ← sua URL do Render + /api
```
Faça o mesmo na linha `const API = ...` do `admin.html`.

### 3.4 Frontend na Netlify
1. Acesse [app.netlify.com/drop](https://app.netlify.com/drop).
2. **Arraste a pasta `SITE`** (sem a pasta `backend`, porque não precisa dela lá).
3. Em *Domain management → Add a domain*, digite `igoreana.com.br`. A Netlify mostra quais registros DNS criar.
4. No **Registro.br** → *Meus domínios → DNS → Editar zona*, crie os registros que a Netlify indicou (normalmente um `A`/`ALIAS` para a raiz e um `CNAME` `www`).
5. O HTTPS é ativado automaticamente em alguns minutos/horas.
6. 🔒 O arquivo `_headers` (já incluído) ativa os cabeçalhos de segurança na Netlify. **Troque** `https://api-casamento.onrender.com` dentro dele pela URL real do seu backend, senão o site não consegue falar com a API.
7. **Não** arraste para a Netlify os arquivos `.md` (relatórios): eles ficariam públicos. Envie só `index.html`, `admin.html`, `admin.js`, `app.js`, `styles.css`, `_headers` e a pasta `assets`.

*(Vercel e Cloudflare Pages funcionam do mesmo jeito.)*

---

## 4. OPÇÃO B: tudo num servidor VPS (Ubuntu 24.04)
Mais controle e sem "sono", mas você cuida de atualizações e backup.

### 4.1 Preparar o servidor
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install python3-venv nginx certbot python3-certbot-nginx git -y
sudo mkdir -p /var/www/casamento && sudo chown $USER /var/www/casamento
# envie a pasta SITE para /var/www/casamento (git clone, scp ou WinSCP)
```

### 4.2 Backend
```bash
cd /var/www/casamento/backend
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
cp .env.example .env && nano .env       # preencha ADMIN_TOKEN, ALLOWED_ORIGINS etc.
sudo chown -R www-data:www-data /var/www/casamento/backend
sudo chmod 600 /var/www/casamento/backend/.env
```
No VPS o disco é fixo, então **SQLite funciona bem** (deixe `DATABASE_URL=sqlite:///./wedding.db`).

Crie o serviço `/etc/systemd/system/casamento-api.service`:
```ini
[Unit]
Description=API Casamento Ana & Igor
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/casamento/backend
EnvironmentFile=/var/www/casamento/backend/.env
ExecStart=/var/www/casamento/backend/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 --workers 2
Restart=always

[Install]
WantedBy=multi-user.target
```
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now casamento-api
sudo systemctl status casamento-api      # deve mostrar "active (running)"
```

### 4.3 Nginx (versão segura)
Primeiro, crie a "zona" de limite de requisições em `/etc/nginx/conf.d/limites.conf`:
```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=5r/s;
```

Depois, `/etc/nginx/sites-available/igoreana.com.br`:
```nginx
server {
    server_name igoreana.com.br www.igoreana.com.br;
    root /var/www/casamento;
    index index.html;

    # 🔒 NUNCA servir o backend, o banco ou o .env (o guia antigo deixava baixar o wedding.db!)
    location ^~ /backend/ { deny all; return 404; }
    location ~ /\.(?!well-known) { deny all; return 404; }   # bloqueia .env, .git... (libera o certificado HTTPS)
    location ~* \.(db|py|pyc|env|sql|md)$ { deny all; return 404; }

    # 🔒 Cabeçalhos de segurança (mesmos do arquivo _headers)
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com; img-src 'self' data: https://api.qrserver.com https://images.unsplash.com; media-src 'self'; frame-src https://maps.google.com https://www.google.com https://open.spotify.com; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000" always;
    client_max_body_size 64k;   # a API só recebe textos pequenos

    location / {
        try_files $uri $uri/ =404;
    }

    # Cache das imagens por 30 dias
    location /assets/ {
        expires 30d;
    }

    # API
    location /api/ {
        limit_req zone=api burst=20 nodelay;   # freio extra contra robôs
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/igoreana.com.br /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d igoreana.com.br -d www.igoreana.com.br     # HTTPS grátis
```
Nesta opção o `app.js` **não precisa de alteração**: publicado, ele usa `/api` automaticamente.

### 4.4 DNS no Registro.br (VPS)
| Tipo | Nome | Valor |
|---|---|---|
| A | (vazio/@) | IP do seu VPS |
| CNAME | www | igoreana.com.br. |

### 4.5 Backup diário do banco (VPS)
```bash
sudo crontab -e
# adicione a linha:
0 3 * * * cp /var/www/casamento/backend/wedding.db /var/backups/wedding-$(date +\%F).db
```

---

## 5. Usando o painel dos noivos

- Acesse `https://igoreana.com.br/admin.html` (a página não aparece no Google: tem `noindex`).
- Digite o `ADMIN_TOKEN`.
- Quando chegar o aviso "🎁 Presente informado", confira o extrato do banco e clique em **Caiu ✔** ou **Não caiu**.
- Para esconder um recado indevido (troque o número 7 pelo id do recado):
  ```bash
  curl -X POST -H "X-Admin-Token: SUA_SENHA" https://igoreana.com.br/api/admin/messages/7/hide
  ```
- A documentação automática `/docs` fica **desligada** em produção (ela mostra o mapa da API). Para usar no seu PC, coloque `ENABLE_DOCS=true` no `.env` local.

---

## 6. Checklist final antes de divulgar 📋

- [x] Endereço do Port Vittoria conferido
- [ ] Texto "Como nos conhecemos" escrito
- [ ] Lista de convidados completa em `backend/seed.py`
- [ ] `assets/musica.mp3` adicionada
- [ ] `ADMIN_TOKEN` com 20+ caracteres, definido e guardado (nunca mande por WhatsApp em grupo)
- [ ] `ENABLE_DOCS` desligado em produção
- [ ] `_headers` (Netlify) com a URL real da API em `connect-src`
- [ ] Repositório do GitHub **privado**
- [ ] Pix de teste de R$ 1 feito com sucesso (nome do recebedor conferido)
- [ ] Site aberto no celular (Android e iPhone) e no computador
- [ ] Link compartilhado no WhatsApp mostrando a prévia com foto
- [ ] HTTPS ativo (cadeado no navegador)
- [ ] Backup do banco configurado (VPS) ou PostgreSQL gerenciado (Render)

🐾 Boa festa!

---

## 7. Configurações novas (versão Ana Beatriz & Igor)

Tudo fica no começo do arquivo `app.js`, no bloco `CONFIG`:

| Campo | O que colocar |
|---|---|
| `SPOTIFY_PLAYLIST_URL` | Link da playlist (Spotify → ••• → Compartilhar → Copiar link). Vazio = botão escondido |
| `CARD_PAYMENT_URL` | Link de pagamento do Mercado Pago (Seu negócio → Link de pagamento → valor livre). Ex.: `https://link.mercadopago.com.br/anaeigor`. Vazio = o botão abre o WhatsApp dos noivos pedindo o link |
| `PIX_KEY` / `PIX_KEY_DISPLAY` | Chave Pix |
| `WHATSAPP_CONTATO` | WhatsApp que aparece no rodapé |

**Lista de convidados por convite:** em `backend/seed.py`, cada linha de `CONVITES` é um convite. Quem está na mesma linha confirma junto (casal/família):
```python
CONVITES = [
    ["Carolina Vinhal"],
    ["Tio Fernando Silva", "Tia Maria Augusta"],
]
```
Depois de editar, reinicie o backend (no Render: *Manual Deploy*). O banco é atualizado sozinho, inclusive se ele já existia (o backend adiciona as colunas novas).

### 7.1 Avisos por e-mail (Gmail)
1. Na conta Google que vai **enviar** os avisos, ative a verificação em duas etapas.
2. Acesse **myaccount.google.com/apppasswords** e crie uma "senha de app".
3. No Render (Environment), preencha: `SMTP_USER` (o Gmail), `SMTP_PASS` (a senha de app) e `COUPLE_EMAIL` (e-mails dos noivos, separados por vírgula).

### 7.2 Avisos por WhatsApp (grátis, CallMeBot)
Cada noivo faz isso no próprio celular:
1. Salve o contato do CallMeBot e mande a mensagem de ativação que aparece em **callmebot.com** (seção WhatsApp). O número e o texto exato estão lá e podem mudar.
2. Você recebe uma **apikey** por WhatsApp.
3. No Render, preencha `CALLMEBOT_TARGETS` com `5561999999999:APIKEY` (dois noivos: separe por vírgula).

> O CallMeBot é um serviço gratuito de terceiros, sem garantia. Por isso **tudo também fica salvo no banco** e aparece no painel `admin.html`, mesmo se o aviso falhar.

### 7.3 Livro de recados em PDF (depois do casamento)
1. Abra `admin.html`, entre com a senha e clique em **📖 Livro de recados (PDF)**.
2. A página junta os recados do mural, as mensagens dos presentes e a lista de quem confirmou, no visual do casamento.
3. Clique em **Salvar como PDF** e, na janela de impressão, escolha "Salvar como PDF" (marque "Gráficos de fundo").

Há um exemplo pronto em `exemplo_livro_de_recados.pdf` (com mensagens fictícias, só para ver o visual).
