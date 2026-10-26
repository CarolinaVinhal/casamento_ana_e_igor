# 🐾 Revisão do Site de Casamento Ana & Igor

Este relatório explica o que foi revisado, o que mudou, as falhas que encontrei e o que ainda falta você fazer.

---

## 1. Resumo do que foi feito

| Pedido | Status |
|---|---|
| Corrigir imagens de presentes que não batiam com a descrição | ✅ **Todas** as imagens agora são locais (pasta `assets/presentes`) e conferidas uma a uma |
| Pelo menos 15 presentes novos acima de R$ 150 | ✅ **33 novos** (eletrodomésticos, cozinha, passeios, ajuda com viagem) + **4 secretos** da matilha |
| Easter eggs com cães e utensílios de cães | ✅ 7 easter eggs (lista na seção 4) |
| Trocar o Pix para 61991760206 | ✅ Site e backend (formato correto `+5561991760206`) |
| Dá para confirmar o pagamento pelo banco? | ✅ Resposta completa na seção 5 |
| Apontar falhas e melhorias | ✅ Seção 6 |
| Relatório de como subir o site | ✅ Arquivo `GUIA_HOSPEDAGEM_E_SERVIDORES.md` (reescrito) |

---

## 2. Imagens de presentes corrigidas

As imagens antigas vinham de links do Unsplash. Alguns não mostravam o que o título dizia, e todos dependiam de um site externo que pode mudar ou sair do ar. Agora todos os presentes usam as suas imagens da pasta "Mais imagens", redimensionadas para carregar rápido.

| # | Presente | Imagem nova |
|---|---|---|
| 1 | Salão para o Noivo | Placa "BARBER" |
| 2 | 6 Meses de Ração para a Matilha | Scottish Terrier com saco de ração |
| 3 | Terapia para Noivazila | Mulher meditando (descrição ajustada) |
| 4 | Antiácidos para Tio Fernando | Cartela de comprimidos |
| 5 | Ajuda para Ana ser Esposa Troféu | Noiva no spa com máscara facial (foto gratuita do Unsplash) |
| 6 | Lua de Mel com Leões-Marinhos | Leões-marinhos na praia. A descrição falava em "mergulho", o que não combinava com a foto. Agora é "passeio para ver os leões-marinhos", e o mergulho virou um presente próprio |
| 7 | Panela de Ferro Esmaltado | Panela vermelha esmaltada. O nome era "Jogo de Panelas de Cerâmica" e foi ajustado à foto |
| 8 | Airfryer | Airfryer com batatas |
| 9 | Cafeteira Espresso | Máquina de espresso |
| 10 | Ajuda nas Passagens Aéreas | Avião no céu |
| 11 | Adega Climatizada | Adega de vinhos |
| 12 | Kit de Taças de Cristal | Taças de vinho |
| 13 | Robô Aspirador | Robô aspirador com menina e cachorrinho (Unsplash) |
| 14 | Jogo de Cama 600 Fios | Quarto com cama de madeira |
| 15 | Aparelho de Jantar | Pratos de cerâmica com talheres dourados |
| 16 | Protetor Auricular pro Igor | Cachorro enrolado no edredom (combina com a piada) |
| 17 | Vinho Especial | Taça e garrafa de vinho |
| 18 | Kit de Churrasco | Jogo de facas |
| 19 | Liquidificador | Liquidificador com frutas (Unsplash) |
| 20 | Caixa de Som Bluetooth | Caixa de som portátil com luzes (Unsplash). O título dizia "Provedora" e virou "Potente" |

> 💡 Essas 4 fotos vêm direto do Unsplash (licença gratuita). Se preferir tê-las na pasta, baixe e salve em `assets/presentes/`.

**3ª revisão:** o presente "Aulas de Yoga pro Igor Ficar Flexível" virou **"Estoque de Ração Premium pra Matilha" (R$ 250)**. As imagens quebradas (SVGs antigos dos cachorros e o fundo de doodles) foram trocadas por figurinhas de cachorros fofos, e o fundo da seção "Nossa História" virou uma estampa de cachorrinhos.

---

## 3. Presentes novos (todos acima de R$ 150)

**Eletrodomésticos e cozinha:** Batedeira Planetária (R$ 1.200), Lava-Louças (R$ 2.500, aceita cotas), Panela de Ferro Fundido (R$ 390), Frigideira Grill Dupla (R$ 180), Jogo de Frigideiras (R$ 290), Utensílios de Madeira (R$ 160), Cafeteira Italiana + Café (R$ 190), Xícaras de Porcelana (R$ 240), Jogo de Chá (R$ 280), Kit de Coquetelaria (R$ 220), Potes de Vidro (R$ 170), Kit Mesa Posta (R$ 330).

**Passeios e lua de mel (aceitam cotas, e o convidado escolhe o valor):** Batismo de Mergulho (R$ 900), Passeio de Veleiro (R$ 750), Aula de Surfe (R$ 400), Stand-Up Paddle (R$ 250), Kitesurf (R$ 600), Jantar Pé na Areia (R$ 800), Jantar à Beira-Mar (R$ 650), Hospedagem no Caribe (R$ 1.500), Passeio de Barco pelas Ilhas (R$ 700), Spa no Mar Morto (R$ 700), Barco no Lago (R$ 300), Yoga na Praia (R$ 200), Degustação de Vinhos (R$ 450), Aula de Drinks (R$ 350), Aula de Vela (R$ 500), Pôr do Sol (R$ 350), Restaurante Especial (R$ 400), Open Bar (R$ 300).

**Zoeiras e mimos:** Café da Manhã a Dois (R$ 180), Chás Calmantes pra Noiva (R$ 160), Estoque de Ração Premium pra Matilha (R$ 250).

**Novidades da lista:**
- **Filtro por tipo** (Casa, Cozinha, Lua de Mel, Zoeiras), além do filtro por preço.
- **Presentes "Aceita cotas":** várias pessoas podem contribuir e o item nunca aparece como "esgotado".
- **Contador** de presentes encontrados, e a busca ignora acentos ("cafe" encontra "Café").

---

## 4. Easter eggs da matilha 🐶

| Como encontrar | O que acontece |
|---|---|
| Esperar uns segundos ou chegar na Lista de Presentes | Um cachorro **espia** do canto da tela. Clicando nele aparece uma mensagem |
| **5 petiscos 🦴** escondidos (História, banner de viagem, RSVP, filtros dos presentes, rodapé) | Contador no canto. Achando todos, aparece o prêmio "Melhor Amigo(a) Oficial" + desfile da matilha |
| Digitar **"auau"** em qualquer lugar da página | **Desfile** de cachorrinhos correndo pela tela (sorteados entre 35 figurinhas) |
| Clicar **5 vezes** no logo "Ana & Igor" | "Território demarcado!", com o cachorrinho fazendo xixi (bem escondido, como combinado) |
| Buscar **"matilha"** nos presentes | Aparecem **4 presentes secretos** (caminha, brinquedos, pote de petiscos, happy hour) |
| Rolar até o rodapé | Um **Beagle** passa passeando na coleira |
| Mural de recados | Cada cão da matilha (Bela, Nina, Costela, Paçoca, Lua) agora responde com **a própria figurinha** |
| Extras | Botão de patinha para voltar ao topo, coração pet no rodapé e mensagem secreta no console do navegador |

---

## 5. Pix: dá para confirmar automaticamente se o pagamento caiu?

### Resposta curta
**Com a chave Pix pessoal (celular), não.** O QR Code que o site gera é um **Pix estático**, ou seja, um "boleto" de valor fixo que qualquer banco lê. Só que o seu banco não avisa o site quando o dinheiro entra, e nenhum banco de pessoa física oferece isso para chave pessoal.

### O que foi feito agora (funciona hoje, de graça)
1. O QR Code e o Copia e Cola usam **a chave nova no formato certo** (`+5561991760206`). Celular no Pix **precisa** do +55, senão alguns bancos recusam.
2. Cada presente leva um **identificador** (`PRESENTE21`, por exemplo) que aparece no comprovante de alguns bancos.
3. Quando o convidado clica em "Já fiz o Pix", o presente fica **"Aguardando Pix"** e **não** é marcado como dado na hora (antes era, mesmo sem ninguém ter pago).
4. Vocês recebem um aviso por e-mail/WhatsApp, conferem o extrato e clicam em **"Caiu ✔"** no painel `admin.html`. Aí o presente vira "Já presenteado". Se não caiu, "Não caiu" libera o presente de novo.
5. O QR Code agora é gerado **no próprio navegador**. Antes o código Pix era enviado a um site externo (qrserver.com), que fica só como reserva.

### Para ter confirmação 100% automática (opcional)
É preciso usar um **intermediador de pagamento com API de Pix**. Ele gera um **Pix dinâmico** para cada presente e avisa o site por **webhook** quando o dinheiro cai. Opções que aceitam conta de pessoa física:

| Serviço | Como funciona |
|---|---|
| **Mercado Pago** | Cria o pagamento Pix pela API e recebe a notificação por webhook quando é aprovado. ([documentação](https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-configuration/integrate-with-pix), [webhooks](https://www.mercadopago.com.br/blog/webhooks-notificacoes-pagamento-tempo-real)) |
| **Asaas** | Gera cobrança com QR Code dinâmico e envia eventos de pagamento por webhook. ([Pix](https://docs.asaas.com/docs/cobrancas-via-pix), [webhooks](https://docs.asaas.com/docs/webhook-para-cobrancas)) |

**Prós e contras:**
- ✅ O presente fica "Já presenteado" sozinho, sem conferir extrato.
- ❌ Esses serviços **cobram taxa por Pix recebido** (confira no site de cada um, porque muda com frequência).
- ❌ O dinheiro cai na conta do intermediador, não direto no seu banco, e depois precisa ser transferido.
- ❌ Dá mais trabalho: criar conta, pegar a chave da API, criar a rota de webhook no backend e testar.

**Minha recomendação:** para uma lista de casamento, o fluxo atual (Pix direto + conferência no painel) costuma ser suficiente e não tem taxa. Se preferir o automático, a integração com o Mercado Pago é o caminho mais comum, e posso implementar depois.

> ⚠️ **Confira o nome do recebedor:** quando o convidado ler o QR Code, o banco mostra o nome do titular da chave 61991760206. Se o celular estiver no nome de só um de vocês, avise no convite ("o Pix vai aparecer no nome de Fulana") para ninguém desconfiar.

---

## 6. Falhas encontradas e o que foi feito

### 🔴 Graves (segurança / dinheiro / dados)

| # | Falha | Correção |
|---|---|---|
| 1 | **"Já fiz o Pix" marcava o presente como dado sem ninguém pagar.** Qualquer pessoa podia "esgotar" a lista | Agora fica "Aguardando Pix" até vocês confirmarem no painel |
| 2 | **Lista de convidados pública:** `/api/guests` devolvia nomes (e telefones) de todos. O `app.js` também tinha a lista escrita no código | Rota movida para `/api/admin/guests` com senha, e a lista foi **removida do `app.js`** (2ª revisão). A validação acontece só no servidor |
| 3 | **Mural vulnerável a XSS:** um recado com código HTML/JS seria executado no navegador de todos os convidados | Todo texto de usuário agora é "escapado" (testado com `<img onerror=...>`) |
| 4 | **Banco de dados exposto no Nginx do guia:** o site era servido a partir da pasta que contém `backend/`, então `seusite.com.br/backend/wedding.db` baixava o banco inteiro | Nova configuração bloqueia `/backend`, `.env`, `.db` e `.py` |
| 5 | **CORS `*` com credenciais:** combinação inválida e insegura | Só os domínios em `ALLOWED_ORIGINS` podem usar a API |
| 6 | **Validação de nome fraca no backend:** `ilike('%nome%')` fazia "ana a" confirmar o primeiro convidado com "ana" no nome | Busca exata por palavras, ignorando acentos |
| 7 | **Valor do presente vinha do navegador:** dava para "pagar" R$ 1 por uma batedeira | O valor de itens fixos vem do banco de dados |
| 8 | **SQLite no Railway/Render perde os dados:** o disco desses serviços é apagado a cada deploy/reinício | Guia agora recomenda PostgreSQL (ou VPS com disco fixo) |
| 9 | Serviço do VPS rodando como `root` | Guia usa usuário próprio (`www-data`) e arquivo `.env` |

### 🟠 Funcionamento

| # | Falha | Correção |
|---|---|---|
| 10 | **Menu no celular não abria** (o botão existia, mas não tinha código) | Menu mobile funcionando |
| 11 | **Confirmações e recados sumiam ao recarregar:** o site nunca carregava dados do backend e o mural nem enviava para a API | Site carrega presentes/recados da API e salva RSVP, recados e presentes |
| 12 | Catálogos diferentes: `app.js` com 20 presentes e `seed.py` com 50 (30 eram "Presente Mimo #N" com a mesma foto). Os IDs não batiam | Uma lista só: `gifts_seed.json` gerado a partir do `app.js`, mesmos IDs |
| 13 | `API_BASE_URL = 'http://localhost:8000'` fixo: no site publicado **nada** funcionaria | Detecta sozinho: local usa localhost, publicado usa `/api` |
| 14 | "João" (com acento) ≠ "joao": o convidado com acento no nome não conseguia confirmar | Nomes normalizados sem acento |
| 15 | Música com `autoplay`: os navegadores bloqueiam, e o botão mostrava "Pausar" com a música parada | Começa em "Tocar"; o estado segue o áudio real |
| 16 | Player com logo/cor do **Spotify**, mas tocava um MP3 do Pixabay (uso indevido da marca, e o link externo pode quebrar) | Virou "Nossa Trilha Sonora" com ícone de música. Salve a música em `assets/musica.mp3` |
| 17 | A cada presente comprado, a grade adicionava listeners duplicados (bugs ao filtrar) | Um único listener (delegação de eventos) |
| 18 | Mapa com um link de embed "montado à mão" (IDs possivelmente inválidos) | Embed por busca + botões **Google Maps** e **Waze** |
| 19 | Botão "PayPal" usava a chave Pix como e-mail do PayPal: nunca funcionaria | Escondido. Aparece só se `PAYPAL_EMAIL` for preenchido no `app.js` |
| 20 | "Copiar Chave PIX" copiava o código inteiro, não a chave | Dois botões: "Copiar código Pix" e "Copiar chave (celular)" |
| 21 | Modal de pagamento sem botão de fechar | Botão ✕ em todos os modais + tecla **ESC** |
| 22 | Selo "Pagamento Seguro HTTPS" sem garantia real (localmente nem é HTTPS) | Removido |
| 23 | CSS inválido (`border-top: 1px stroke`) | Corrigido para `solid` |
| 24 | Imagens do casal/trajes pesadas; algumas imagens enviadas tinham até 4 MB | Todas redimensionadas (a pasta `assets` inteira tem ~7 MB para ~100 imagens) |
| 25 | Trajes com faixa preta embaixo e cortados no modal | Faixa removida e imagem exibida inteira |
| 26 | Data sem ano ("14 de Novembro") | "14 de Novembro de 2026" + **contagem regressiva** |
| 27 | SQL do guia antigo (seção 3.1) com sintaxe inválida (`INTEGER NOT NULL FOREIGN KEY REFERENCES`) | `schema.sql` corrigido |
| 28 | Notificação por e-mail travava a resposta do site | Enviada em segundo plano (`BackgroundTasks`) |
| 29 | `datetime.utcnow()` e `sqlalchemy.ext.declarative`, que estão obsoletos | Atualizados |
| 30 | Pasta `venv`, `.pyc` e `wedding.db` misturados com o código | `.gitignore` criado (não envie esses arquivos para o servidor) |

### 🟡 Melhorias de experiência adicionadas
- Prévia bonita ao compartilhar o link no WhatsApp (tags `og:`) e ícone 🐾 na aba.
- Acessibilidade: foco visível no teclado, textos alternativos nas fotos, galeria navegável por teclado, respeito a "reduzir animações".
- Aviso rápido (toast) em vez de `alert()` do navegador.
- Limite de caracteres nos formulários (front e backend).
- Painel dos noivos (`admin.html`): confirmados, Pix a conferir, total recebido e botões Caiu / Não caiu.
- Possibilidade de esconder recados indevidos (`/api/admin/messages/{id}/hide`).

---

## 6.1 🔒 Segunda revisão de segurança (brechas que ainda existiam)

Revisei de novo as minhas próprias correções e encontrei estes pontos, todos já corrigidos:

| # | Brecha que ainda existia | Correção |
|---|---|---|
| S1 | **A lista de convidados continuava no `app.js`** (usada quando o backend estava fora do ar). Qualquer um via os nomes pelo "Exibir código-fonte" | Lista removida do site. Sem backend, o RSVP mostra "sistema fora do ar" em vez de validar localmente |
| S2 | **Alguém podia "travar" a lista inteira** clicando em "Já fiz o Pix" em todos os presentes, sem pagar | A reserva "Aguardando Pix" **expira em 48h** (`PENDING_HOURS`) e há **limite de 5 presentes por hora por pessoa** |
| S3 | **Sem limite de tentativas:** dava para descobrir nomes de convidados testando milhares de nomes, lotar o mural de spam ou tentar adivinhar a senha do painel | Limites por IP: RSVP 20 a cada 10 min, mural 5 a cada 10 min. Senha do painel: **10 erros bloqueiam o IP por 15 min**. O Nginx ganhou um freio extra (`limit_req`) |
| S4 | O limite por IP podia ser "enganado" com um cabeçalho falso (`X-Forwarded-For`) | O IP é lido da direita para a esquerda, ignorando o que o visitante inventa |
| S5 | Uma **senha do painel fraca** era aceita | Menos de 20 caracteres = painel desligado (o `.env.example` ensina a gerar uma forte) |
| S6 | A documentação automática `/docs` ficava pública e mostrava o "mapa" de todas as rotas | Desligada em produção (`ENABLE_DOCS=false`) |
| S7 | **Sem cabeçalhos de segurança** (CSP, anti-clickjacking etc.) | Arquivo `_headers` (Netlify) e `add_header` no Nginx. Testado: o site funciona com a política ligada, sem nenhum bloqueio indevido |
| S8 | O script do painel ficava dentro do HTML, o que impedia uma CSP rígida | Movido para `admin.js` |
| S9 | A regra do Nginx que bloqueia arquivos ocultos (`.env`) também bloquearia o **certificado HTTPS** na renovação | Regra ajustada para liberar só `.well-known` |
| S10 | Os relatórios `.md` ficariam públicos se enviados junto com o site | Bloqueados no Nginx. No guia da Netlify, a lista do que enviar não inclui os `.md` |
| S11 | Se o convidado clicasse rápido demais, antes de o site "perceber" o backend, os dados iam só para o navegador dele | O site confere o servidor na hora de enviar (`ensureApi`) |

### O que continua sendo risco (e por que aceitei)
- **Qualquer pessoa que saiba o nome completo de um convidado pode confirmar ou cancelar a presença dele.** Para evitar isso de vez, seria preciso pedir mais um dado (ex.: os 4 últimos dígitos do telefone) ou mandar um código por convidado, o que complica para os convidados mais velhos. Com os limites de tentativas e o painel mostrando quem cancelou, o risco é baixo. Se quiser, implemento o código individual.
- **Bibliotecas externas (Font Awesome e QR Code no cdnjs) sem "integrity" (SRI).** Se o cdnjs fosse invadido, o script mudaria. Na página do cdnjs de cada biblioteca há o botão "Copy SRI". Adicione `integrity="..." crossorigin="anonymous"` nas duas tags do `index.html` (não consegui acessar o cdnjs do meu ambiente para gerar os códigos).
- **O limite de tentativas fica na memória do servidor:** zera se o servidor reiniciar e não funciona se houver vários servidores. Para um casamento (um servidor só), é suficiente.
- **Recados indevidos aparecem até vocês esconderem** (não há moderação prévia). Dá para mudar para "só aparece depois de aprovado", se preferir.

---

## 7. O que ainda falta você fazer ✅

1. ~~Manter os SVGs antigos.~~ **Não precisa mais:** o site não usa nenhum SVG. Os arquivos `dog_ok.svg`, `dog_cry.svg`, `dog_laugh.svg`, `dog_rich.svg`, `dog_gift.svg`, `dog_growl.svg` e `doodle_pattern.svg` não vieram como arquivos, só os nomes. **Copie a pasta `assets` nova POR CIMA da antiga** (não apague a antiga). Se algum SVG faltar, o site mostra uma figurinha de cachorro no lugar.
2. **Colocar a música** em `assets/musica.mp3` (pode ser uma música sertaneja que vocês tenham o direito de usar).
3. **Conferir o endereço** do Porto Vitória em `index.html` (SCES Trecho 2, Conjunto 19). Não consegui validar.
4. **Escrever o texto "Como nos conhecemos"** (ainda é o texto de exemplo).
5. **Atualizar a lista de convidados** em `backend/seed.py` (a lista não fica mais no `app.js`).
6. **Apagar o `wedding.db` antigo.** Ele não tem dados reais (conferi: 0 confirmações, 0 recados) e a estrutura mudou. O backend cria um novo sozinho.
7. **Definir a senha do painel** (`ADMIN_TOKEN`) no `.env`.
8. **Nome do Pix:** em `app.js` → `PIX_MERCHANT_NAME`, o ideal é o nome do titular da conta.
9. **Senha do painel:** gere uma com 20+ caracteres (`python -c "import secrets; print(secrets.token_urlsafe(24))"`) e coloque no `ADMIN_TOKEN`.
10. **Na Netlify:** troque a URL da API dentro do arquivo `_headers`.
11. **Testar** o Pix com R$ 1 de verdade antes de divulgar o site (crie um presente de teste ou use o valor livre).

> ℹ️ **Sobre os testes:** o site foi testado num navegador automatizado (Pix, RSVP, busca secreta, mural, desfile e celular), e o código Pix foi validado (CRC correto). O backend foi revisado e compilado, e o gerador Pix dele produz exatamente o mesmo código do site. Só não deu para rodar o FastAPI no meu ambiente, então rode `uvicorn main:app --reload` no seu computador uma vez antes de publicar (passo a passo no guia).

---

## 8. Versão "Ana Beatriz & Igor" (lista de 42 itens)

| # | Pedido | Feito |
|---|---|---|
| 1 | Música → playlist do Spotify | Botão "Nossa playlist" abre o player do Spotify. Falta só colar o link em `SPOTIFY_PLAYLIST_URL` |
| 2–3 | Horário 16:30, data 07/08/2027 | Em todo o site, contagem regressiva e avisos |
| 4 | Monograma | No topo, na capa, no rodapé, no ícone da aba e no painel |
| 5 | Texto sobre amor | Texto oficial dos noivos ("Friends to lovers") em Nossa História |
| 6 | Fundo com menos rosto | Capa usa a foto da silhueta primeiro e enquadra as outras mais pelo corpo/paisagem |
| 7 | Mais fotos na galeria | Estrutura pronta. **Só existem 3 fotos do casal**; mande mais que eu coloco |
| 8 | Coração | Corações da identidade no logo, no rodapé, no desfile e no livro |
| 9 | 5 ossos | "Parabéns! Você ganhou um lambeijo da matilha!" |
| 10 | Tirar "Passeio Completo" lá de cima | Saiu da capa e do resumo da confirmação. Fica só em "Local & Traje" |
| 11 | Trajes | Madrinhas: vestido longo verde oliva. Padrinhos: terno chumbo e gravata verde oliva. Textos **acima** das imagens. Inspirações para convidados com os desenhos novos |
| 12 | Botão do traje verde | Verde oliva |
| 13 | Tirar o laranja | Nenhum laranja/verde-limão: tudo vinho, creme e champanhe |
| 14 | Tirar "RSVP" | Agora é "Confirmar Presença" |
| 15 | Exemplo com o nome da Carol | "Ex: Carolina Vinhal" (e a Carol está na lista de convidados) |
| 16 | Só "nome" | "Seu nome:" (sem exigir nome completo) |
| 17 | Nomes parecidos ao digitar | A partir de 3 letras aparece a lista de convidados parecidos (até 6) |
| 18 | Confirmar por casal | Escolhendo o nome, aparecem todos do mesmo convite com caixinhas; desmarca quem não vai |
| 19 | Cães da identidade | Todos os pop-ups e easter eggs usam os cães desenhados, menos o que espia |
| 20 | Pix ou cartão no anúncio | "Pagamento via Pix ou cartão de crédito". Explicação de cotas removida |
| 21 | Esposa troféu | Mulher com sacolas de compras (foto do Unsplash) |
| 22 | Le Creuset R$ 3.000 | Jogo de Panelas Le Creuset (e a panela azul e a chaleira) |
| 23 | Faixas de preço | Até R$ 500 · R$ 500 a R$ 1.000 · Acima de R$ 1.000 |
| 24 | Sem cotas | Todo presente tem valor fixo |
| 25 | Robô aspirador R$ 1.000 | Feito |
| 26 | PayPal → cartão | Aba "Cartão de crédito" no pagamento |
| 27 | Pop-ups de presentes sem cachorro | Envelope (confirmar) e champanhe (obrigado) |
| 28 | Sem "fora do ar" | Se o servidor não responder, a mensagem fica guardada no navegador e é reenviada sozinha. O convidado só vê o agradecimento |
| 29 | Ordenar e filtro de 50 em 50 | Botão menor/maior preço + régua "Até R$ X" que anda de 50 em 50 |
| 30 | Presentes da vida adulta | Geladeira, lava e seca, cooktop, TV, sofá, escrivaninha, toalhas, roupões etc. (97 presentes no total) |
| 31 | Viagem com preço real | Passagens Brasília–Roma (R$ 5.500 cada), diária na Costa Amalfitana (R$ 2.500), jantares e passeios com valores de mercado aproximados |
| 32 | Cachorro → estrelinha | Ícone do botão "Presentear" e do "voltar ao topo" |
| 33 | Mural com a matilha da identidade | Cada cão (Bela, Nina, Costela, **Paçoca**, Lua) responde com o desenho dele. **A Nina só rosna** |
| 34 | Tirar exemplos do mural/presentes | Mural começa vazio ("Seja o primeiro...") |
| 35 | Corações da identidade | Feito |
| 36 | Manter animações e ossos | Mantidos: desfile (digite "auau"), cão espiando, 5 ossinhos, presentes secretos ("matilha") |
| 37 | Tirar "da matilha" da mensagem final | "...com a gente!" |
| 38 | Direitos reservados | "© 2027 Todos os direitos reservados a Ana Beatriz & Igor." |
| 39 | Cores da identidade | Vinho `#661C1D` do monograma em todos os botões, creme e champanhe |
| 40 | Confirmações → WhatsApp, e-mail e banco | Banco (sempre) + e-mail (Gmail) + WhatsApp (CallMeBot grátis ou API própria). Guia, seção 7 |
| 41 | Presentes e mensagens → WhatsApp, e-mail e banco | Igual ao 40, com forma de pagamento (Pix/cartão) e mensagem |
| 42 | PDF com todas as mensagens | `livro.html` gera o livro de recados no visual do casamento → "Salvar como PDF". Exemplo em `exemplo_livro_de_recados.pdf` |

### 8.1 Lista oficial de presentes (preços dos noivos)
Os 45 presentes da lista enviada foram atualizados com o nome e o preço exatos (ex.: Le Creuset sets de 8/6/4 panelas por R$ 9.239 / R$ 6.519 / R$ 3.889, Parcela da Cobertura no Noroeste R$ 15.000, Saco de Ração R$ 150). Entraram 2 novos: **Smart TV Samsung 85"** (R$ 6.000) e **Set com 6 Panelas Le Creuset** (R$ 6.519). A "Caminha para a Belinha" deixou de ser secreta. Os presentes que não estavam na lista (passeios da lua de mel, zoeiras, chás etc.) continuam no site.


## 9. Ajustes finais (fotos, playlist, local, presentes)

| Item | O que foi feito |
|---|---|
| 6 e 7 – Fotos | 8 fotos na capa (carrossel) e 19 na galeria da história, com setas, contador e deslizar no celular |
| 1 – Spotify | Playlist oficial ligada (botão "Nossa playlist" no canto) |
| 8 – Coração | Corações da identidade no final do texto da história |
| Local | Port Vittoria – SCES Trecho 2, Conjunto 19, Asa Sul, Brasília-DF, 70200-002 (mapa, Google Maps e Waze) |
| Presentes extras | 24 presentes fora da lista oficial retirados (Noivazila, Esposa Troféu, chás calmantes, antiácidos, protetor auricular, passeios repetidos e itens de cozinha duplicados) |
| Matilha | Respostas do mural com a personalidade de cada cachorro (Bela da piscadinha, Costela a maior, Paçoca e Nina pequeninas, Lua de focinho fino) |
| Cartão | Pagamento via Mercado Pago: basta colar o link de pagamento (valor livre) em `CARD_PAYMENT_URL` |
| Layout | Texto da história não fica mais espremido ao lado das fotos |
| Convidados | Lista oficial no `backend/seed.py`: 151 convites, 249 pessoas. Os nomes de teste são apagados ao rodar o seed (só se ainda não confirmaram) |
| Sugestões | Ao digitar, cada nome mostra com quem está no convite ("Ricardo — com Luiza") para diferenciar nomes parecidos |
