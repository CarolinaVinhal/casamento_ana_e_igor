/* ==========================================================================
   SITE DE CASAMENTO ANA BEATRIZ & IGOR - LÓGICA FRONTEND (JS ES6)
   ========================================================================== */

/* --------------------------------------------------------------------------
   CONFIGURAÇÕES — altere aqui antes de publicar
   -------------------------------------------------------------------------- */
const CONFIG = {
  // Endereço do backend: definido em api-config.js
  API_BASE_URL: window.API_BASE,

  // Chave Pix (celular). No código Pix o celular PRECISA ir no formato +55DDDNÚMERO.
  PIX_KEY: '+5561991760206',
  PIX_KEY_DISPLAY: '(61) 99176-0206',
  PIX_MERCHANT_NAME: 'Ana Beatriz e Igor',
  PIX_MERCHANT_CITY: 'BRASILIA',

  // Cartão de crédito via Mercado Pago: cole aqui o link de pagamento (ex.: 'https://link.mercadopago.com.br/anaeigor').
  // Crie o link com "valor livre" para o convidado digitar o valor do presente. Vazio = o botão abre o WhatsApp pedindo o link.
  CARD_PAYMENT_URL: '',

  // WhatsApp de contato dos noivos (não é a chave Pix)
  WHATSAPP_CONTATO: '5561992894788',

  // Playlist do Spotify: cole o link de compartilhamento da playlist
  // (no Spotify: ••• > Compartilhar > Copiar link da playlist). Vazio = botão escondido.
  SPOTIFY_PLAYLIST_URL: 'https://open.spotify.com/playlist/76sYIv0rR3tYUfOJsNUTOH',

  WEDDING_DATE: '2027-08-07T16:30:00-03:00'
};

const API_BASE_URL = CONFIG.API_BASE_URL;
let apiOnline = false;

const ID = 'assets/identidade/';
const IDENTITY_DOGS = ['dog_bela', 'dog_nina', 'dog_costela', 'dog_pacoca', 'dog_lua', 'dog_extra1', 'dog_extra2', 'dog_extra3'].map(n => `${ID}${n}.png`);
const IMG = {
  ok: ID + 'dog_bela.png',            // deu certo
  sad: ID + 'dog_extra1.png',         // cancelou / não encontrado
  grr: ID + 'dog_nina.png',           // Nina só rosna
  party: ID + 'dog_costela.png',
  envelope: ID + 'envelope.png',      // presentes: confirmar
  champagne: ID + 'champanhe.png',    // presentes: obrigado
  hearts: ID + 'coracoes.png'
};

/* --------------------------------------------------------------------------
   MATILHA (respostas do mural) — figurinhas da identidade visual
   -------------------------------------------------------------------------- */
const dogResponders = [
  { name: "Bela", sprite: ID + 'dog_bela.png', replies: [
    "Au au au! 🦴 (Bela adorou seu recado e perguntou se você vai levar petisco pra ela!)",
    "Rrrruff! 🐾 (Bela carimbou este recado com uma patinha cheia de carinho!)",
    "Au au! 😉 (Bela deu aquela piscadinha charmosa dela pra você!)"
  ]},
  { name: "Nina", sprite: ID + 'dog_nina.png', replies: [
    "Grrrrrr... 🐾",
    "Grrr. Grrrrrr! (a Nina só rosna, mas é de carinho)",
    "GRRRR... grrr. (tradução: aprovado!)"
  ]},
  { name: "Costela", sprite: ID + 'dog_costela.png', replies: [
    "Au au! Woof! 🍖 (Costela já reservou um lugarzinho ao lado da mesa do buffet!)",
    "Au au au! 🥩 (Costela ficou babando de alegria com seu recado!)",
    "WOOF! 🥓 (Costela, a maior da matilha, mandou um abraço do tamanho dela!)"
  ]},
  { name: "Paçoca", sprite: ID + 'dog_pacoca.png', replies: [
    "Yap yap au au! ✨ (Paçoca achou a sua mensagem tão doce quanto uma paçoca!)",
    "Arf arf! 🦴 (Paçoca quase lambeu a tela de tanto carinho!)",
    "Au auuu! 🥜 (Paçoca é pequenininha, mas deu pulinhos enormes de alegria com o seu recado!)"
  ]},
  { name: "Lua", sprite: ID + 'dog_lua.png', replies: [
    "AuuuOOOOOO! 🌙 (Lua uivou de emoção com essa mensagem linda!)",
    "Auuu au au! 🐾 (Lua deu três voltinhas no tapete e suspirou de alegria!)",
    "Woof woof! ⭐ (Lua esticou o focinho fininho e mandou um beijinho!)"
  ]}
];

function spriteForDog(dogName = '') {
  const found = dogResponders.find(d => dogName.startsWith(d.name));
  return found ? found.sprite : IMG.ok;
}

/* --------------------------------------------------------------------------
   UTILITÁRIOS
   -------------------------------------------------------------------------- */
function normalizeName(str) {
  return (str || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function escapeHTML(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const brl = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: Number.isInteger(Number(v)) ? 0 : 2 });

function showToast(msg, ms = 2600) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.remove('show'), ms);
}

async function copyText(text, okMsg) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch { /* ignora */ }
    ta.remove();
  }
  showToast(okMsg);
}

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options });
  let data = null;
  try { data = await res.json(); } catch { /* sem corpo */ }
  if (!res.ok) {
    const err = new Error((data && data.detail) || `Erro ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

const storage = {
  get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* modo anônimo */ } }
};

/* --------------------------------------------------------------------------
   📮 CAIXA DE SAÍDA: se o servidor estiver dormindo/fora do ar, o envio fica
   guardado no navegador e é reenviado sozinho. O convidado só vê o agradecimento.
   -------------------------------------------------------------------------- */
const outbox = {
  add(path, body) {
    const list = storage.get('outbox', []);
    list.push({ path, body, at: Date.now() });
    storage.set('outbox', list.slice(-30));
  },
  async flush() {
    const list = storage.get('outbox', []);
    if (!list.length) return;
    const keep = [];
    for (const item of list) {
      try { await api(item.path, { method: 'POST', body: JSON.stringify(item.body) }); }
      catch (err) { if (!err.status || err.status >= 500 || err.status === 429) keep.push(item); }
    }
    storage.set('outbox', keep);
  }
};

// Envia; se o servidor não responder, guarda para reenviar. Nunca mostra "fora do ar".
async function sendOrQueue(path, body) {
  try {
    return await api(path, { method: 'POST', body: JSON.stringify(body) });
  } catch (err) {
    if (err.status && err.status < 500 && err.status !== 429) throw err; // erro "de verdade" (ex.: presente já escolhido)
    if (err.status === 429) throw err;
    outbox.add(path, body);
    return null;
  }
}

/* --------------------------------------------------------------------------
   CATÁLOGO DE PRESENTES
   type: casa | cozinha | eletro | viagem | zoeira | matilha
   secret: só aparece quando alguém busca por "matilha" 🐾
   -------------------------------------------------------------------------- */
const P = 'assets/presentes/';
const M = 'assets/matilha/';
const U = (id) => `https://images.unsplash.com/${id}?w=600&h=450&fit=crop&q=70&fm=jpg`; // fotos gratuitas do Unsplash
const giftCatalog = [
  // ---- Casa ----
  { id: 14,  type: 'casa', title: "Jogo de Cama 600 Fios", price: 600, img: P + 'quarto_cama.jpg', desc: "Noites de sono aconchegantes para o casal." },
  { id: 109, type: 'casa', title: "Toalhas de Banho Trussardi para o Casal", price: 500, img: P + 'toalhas.jpg', desc: "Toalhas macias e felpudas para o enxoval da casa nova." },
  { id: 122, type: 'casa', title: "Roupão", price: 350, img: P + 'roupao.jpg', desc: "Para o dia de spa da noiva." },
  { id: 106, type: 'casa', title: "Kit de Banheiro", price: 300, img: P + 'kit_banheiro.jpg', desc: "Porta-escovas, saboneteira e dispenser combinando." },
  { id: 107, type: 'casa', title: "Tapete para a Sala", price: 1500, img: P + 'tapete.jpg', desc: "Para a sala ficar aconchegante (e a matilha deitar)." },
  { id: 120, type: 'casa', title: "Sofá 4 Lugares Retrátil e Reclinável", price: 2000, img: P + 'sofa.jpg', desc: "O sofá das maratonas de série do casal." },
  { id: 125, type: 'casa', title: "Poltrona para a Varanda", price: 2100, img: P + 'poltrona.jpg', desc: "O cantinho do café e do pôr do sol." },
  { id: 121, type: 'casa', title: "Escrivaninha", price: 2700, img: P + 'escrivaninha.jpg', desc: "Para o escritório da casa nova." },
  { id: 126, type: 'casa', title: "Cadeira de Escritório", price: 1600, img: P + 'cadeira_escritorio.jpg', desc: "Conforto para os dias de trabalho em casa." },
  { id: 117, type: 'casa', title: "Vaso de Flor", price: 150, img: P + 'vaso.jpg', desc: "Para a noiva tentar manter as flores vivas." },
  { id: 116, type: 'casa', title: "Porta-Joias", price: 600, img: P + 'porta_joias.jpg', desc: "Para a noiva guardar todas as joias que o noivo der para ela." },
  { id: 11,  type: 'casa', title: "Adega Climatizada 12 Garrafas", price: 1600, img: P + 'adega.jpg', desc: "Vinho na temperatura certa para as noites a dois." },
  { id: 12,  type: 'casa', title: "Kit de Taças de Cristal", price: 250, img: P + 'tacas.jpg', desc: "Para brindarmos aos melhores momentos com os amigos." },
  { id: 17,  type: 'casa', title: "Garrafa do Vinho Favorito do Noivo", price: 260, img: P + 'vinho_primitivo.jpg', desc: "Para brindar à nova fase." },
  { id: 32,  type: 'casa', title: "Kit Mesa Posta", price: 500, img: P + 'mesa_posta.jpg', desc: "Taças, pratos e guardanapos para receber os amigos." },
  { id: 108, type: 'casa', title: "Kit Pilates para a Noiva", price: 480, img: P + 'kit_pilates.jpg', desc: "Bola, anel, elásticos e meias para a noiva treinar em casa." },
  { id: 115, type: 'casa', title: "Kit de Halteres", price: 450, img: P + 'halteres.jpg', desc: "Para a academia em casa do noivo." },
  { id: 110, type: 'casa', title: "1 Ano de Academia para o Noivo ou a Noiva", price: 1200, img: P + 'smartfit.jpg', desc: "Pra entrar em forma depois do bolo do casamento." },
  { id: 142, type: 'casa', title: "Kit Videolaringoscópio para o Noivo", price: 4500, img: P + 'videolaringoscopio.jpg', desc: "Equipamento profissional para a carreira do noivo." },

  // ---- Cozinha ----
  { id: 100, type: 'cozinha', title: "Set com 8 Panelas Ceramic Essential Le Creuset", price: 9239, img: P + 'panelas_le_creuset.jpg', desc: "O jogo completo para a cozinha dos sonhos." },
  { id: 7,   type: 'cozinha', title: "Panela Redonda Signature Le Creuset", price: 3869, img: P + 'panela_azul.jpg', desc: "A panela de ferro esmaltado que dura a vida inteira." },
  { id: 102, type: 'cozinha', title: "Chaleira Clássica Le Creuset", price: 929, img: P + 'chaleira_le_creuset.jpg', desc: "Para os chás da tarde com charme." },
  { id: 101, type: 'cozinha', title: "Set com 4 Panelas Ceramic Essential Le Creuset", price: 3889, img: P + 'panelas_kit4.jpg', desc: "O essencial Le Creuset para o dia a dia." },
  { id: 15,  type: 'cozinha', title: "Aparelho de Jantar de Cerâmica", price: 800, img: P + 'aparelho_jantar.jpg', desc: "Pratos elegantes para os jantares em família." },
  { id: 29,  type: 'cozinha', title: "Jogo de Chá com Filete Dourado", price: 450, img: P + 'jogo_cha.jpg', desc: "Bule, xícaras e leiteira para os chás da tarde." },
  { id: 104, type: 'cozinha', title: "Boleira Camicado", price: 350, img: P + 'boleira.jpg', desc: "Para o bolo de domingo ficar sempre à mostra." },
  { id: 112, type: 'cozinha', title: "Fruteira", price: 200, img: P + 'fruteira.jpg', desc: "Fruta à vista, casal saudável." },
  { id: 31,  type: 'cozinha', title: "Kit de Potes Herméticos", price: 450, img: P + 'pote_vidro.jpg', desc: "Para a cozinha aesthetic da noiva." },
  { id: 136, type: 'cozinha', title: "Conjunto de Bowls de Inox Electrolux", price: 100, img: P + 'bowls_inox.jpg', desc: "Tigelas de inox com tampa para a cozinha." },
  { id: 18,  type: 'cozinha', title: "Jogo de Facas de Chef", price: 450, img: P + 'facas.jpg', desc: "Facas de primeira para os churrascos de fim de semana." },
  { id: 30,  type: 'cozinha', title: "Kit de Drinks", price: 250, img: P + 'kit_coquetelaria.jpg', desc: "Para receber os amigos com drinks caprichados." },
  { id: 27,  type: 'cozinha', title: "Cafeteira Italiana", price: 250, img: P + 'cafeteira_italiana.jpg', desc: "O cafezinho da tarde com cheiro de casa de vó." },

  // ---- Eletrodomésticos ----
  { id: 143, type: 'eletro', title: "Smart TV Samsung 85\" Crystal UHD 4K", price: 6000, img: P + 'smart_tv_85.jpg', desc: "U8600F 2025 com Xbox Cloud Gaming e Alexa integrada." },
  { id: 144, type: 'cozinha', title: "Set com 6 Panelas Ceramic Essential Le Creuset", price: 6519, img: P + 'panelas_le_creuset_6.jpg', desc: "Seis panelas para cozinhar a dois (ou para a família toda)." },
  { id: 135, type: 'eletro', title: "Geladeira Electrolux 484L 3 Portas", price: 5300, img: P + 'geladeira.jpg', desc: "Frost Free Inverter, Black Inox Look." },
  { id: 134, type: 'eletro', title: "Lava e Seca LG Smart VC2 14kg", price: 4000, img: P + 'lava_e_seca.jpg', desc: "Inox Look, com Inteligência Artificial AIDD™." },
  { id: 22,  type: 'eletro', title: "Lava-Louças", price: 3500, img: P + 'lava_loucas_inox.jpg', desc: "Pra acabar de vez com a briga de quem lava a louça." },
  { id: 123, type: 'eletro', title: "Cooktop Elétrico Philco Vitrocerâmico", price: 1400, img: P + 'cooktop.jpg', desc: "Cooktop PCT55VC de 5 bocas para cozinhar tudo ao mesmo tempo." },
  { id: 124, type: 'eletro', title: "Smart TV Philips 58\" 4K", price: 2800, img: P + 'smart_tv.jpg', desc: "Google TV, Wi-Fi, Bluetooth e Google Assistente." },
  { id: 20,  type: 'eletro', title: "Soundbar JBL Cinema SB180 2.1", price: 800, img: P + 'soundbar.jpg', desc: "Soundbar Bluetooth com subwoofer de 6,5\" sem fio." },
  { id: 111, type: 'eletro', title: "Frigobar Brastemp Retrô", price: 1700, img: P + 'frigobar.jpg', desc: "Para os noivos guardarem as coquinhas zero." },
  { id: 113, type: 'eletro', title: "Chopeira", price: 1600, img: P + 'chopeira.jpg', desc: "Para o noivo receber os convidados em grande estilo." },
  { id: 21,  type: 'eletro', title: "Batedeira Planetária", price: 2800, img: P + 'batedeira.jpg', desc: "Bolos, pães e massas caseiras." },
  { id: 13,  type: 'eletro', title: "Robô Aspirador de Pó", price: 1000, img: U('photo-1762500824496-9094f37873c4'), desc: "Limpar os pelos da matilha sem esforço!" },
  { id: 8,   type: 'eletro', title: "Air Fryer Philco 6,5L", price: 389.90, img: P + 'airfryer_philco.jpg', desc: "Visor Glass e Redstone, 1700W." },
  { id: 127, type: 'eletro', title: "Cafeteira Elétrica Electrolux 38 Xícaras", price: 320, img: P + 'cafeteira_eletrica.jpg', desc: "Digital, programável e com timer." },
  { id: 9,   type: 'eletro', title: "Cafeteira Espresso", price: 900, img: P + 'cafeteira_espresso.jpg', desc: "Espresso de cafeteria em casa." },
  { id: 19,  type: 'eletro', title: "Liquidificador de Alta Potência", price: 400, img: U('photo-1585515320310-259814833e62'), desc: "Sucos, vitaminas e molhos todos os dias." },
  { id: 137, type: 'eletro', title: "Grill e Sanduicheira Philco", price: 250, img: P + 'grill.jpg', desc: "Maxx Clean 1000W para lanches rapidinhos." },
  { id: 133, type: 'eletro', title: "Umidificador de Ar", price: 650, img: P + 'umidificador.jpg', desc: "Para o clima seco de Brasília." },
  { id: 138, type: 'eletro', title: "Alexa Echo Dot", price: 180, img: P + 'echo_dot.jpg', desc: "Alexa, toca a música do casamento!" },

  // ---- Lua de mel (valores reais aproximados) ----
  { id: 10,  type: 'viagem', title: "Passagem da Noiva para a Itália", price: 5500, img: P + 'aviao.jpg', desc: "Ida e volta Brasília–Roma para a lua de mel." },
  { id: 140, type: 'viagem', title: "Passagem do Noivo para a Itália", price: 5500, img: P + 'aviao.jpg', desc: "Porque não dá pra ir sem ele, né?" },
  { id: 141, type: 'viagem', title: "Hospedagem da Lua de Mel do Casal", price: 7000, img: P + 'amalfi.jpg', desc: "As noites da lua de mel com vista para o mar." },
  { id: 38,  type: 'viagem', title: "Jantar Romântico Pé na Areia", price: 1200, img: P + 'jantar_pe_na_areia.jpg', desc: "Mesa na areia e pôr do sol." },
  { id: 34,  type: 'viagem', title: "Passeio de Veleiro", price: 1500, img: P + 'veleiro.jpg', desc: "Uma tarde velejando em alto-mar." },
  { id: 33,  type: 'viagem', title: "Batismo de Mergulho para o Casal", price: 1200, img: P + 'mergulho.jpg', desc: "Mergulho entre corais e peixinhos coloridos." },
  { id: 45,  type: 'viagem', title: "Degustação de Vinhos", price: 800, img: P + 'degustacao_vinho.jpg', desc: "Tour por uma vinícola com degustação." },
  { id: 46,  type: 'viagem', title: "Aula de Drinks para Dois", price: 600, img: P + 'bartender.jpg', desc: "Aprender os drinks com um bartender profissional." },
  { id: 48,  type: 'viagem', title: "Passeio ao Pôr do Sol", price: 400, img: P + 'por_do_sol.jpg', desc: "Caminhada vendo o sol se pôr no mar." },
  { id: 114, type: 'casa', title: "Aula de Cerâmica para a Noiva", price: 450, img: P + 'ceramica.jpg', desc: "Para a noiva fazer as próprias canecas do café da manhã." },

  // ---- Diversão / zoeiras ----
  { id: 131, type: 'zoeira', title: "Parcela da Cobertura no Noroeste", price: 15000, img: P + 'cobertura.jpg', desc: "Um dia a gente chega lá. Com a sua ajuda, mais rápido!" },
  { id: 130, type: 'zoeira', title: "Parcela do Apartamento no Noroeste", price: 5000, img: P + 'apartamento.jpg', desc: "Cada parcela conta!" },
  { id: 132, type: 'zoeira', title: "Ingresso para a Final da Champions League", price: 3000, img: P + 'champions.jpg', desc: "O Igor jura que é um presente pro casal." },
  { id: 139, type: 'zoeira', title: "GTA VI pro Igor", price: 450, img: P + 'gta.jpg', desc: "Pra ele ficar quietinho enquanto a Ana lê." },
  { id: 129, type: 'zoeira', title: "Box Corte de Espinhos e Rosas", price: 350, img: P + 'box_livros.jpg', desc: "Pra Ana ficar quietinha enquanto o Igor joga." },
  { id: 128, type: 'zoeira', title: "Bola Oficial de Futevôlei Mikasa FT-5", price: 569.90, img: P + 'bola_futevolei.jpg', desc: "Pro Igor perder pra Ana na praia." },
  { id: 1,   type: 'zoeira', title: "Salão para o Noivo", price: 150, img: P + 'barbearia.jpg', desc: "Corte e barba pro Igor não parecer um náufrago no altar." },

  // ---- Matilha ----
  { id: 2,   type: 'matilha', title: "Saco de Ração para a Cachorrada", price: 150, img: P + 'racao_special.jpg', desc: "Manter os cachorrinhos bem nutridos e felizes!" },
  { id: 53,  type: 'matilha', title: "Ração Premium pra Matilha", price: 250, img: P + 'tigela_racao.jpg', desc: "Tigela sempre cheia: a matilha agradece!" },
  { id: 118, type: 'matilha', title: "Comedouro Duplo de Inox", price: 350, img: P + 'comedouro.jpg', desc: "Jantar chique para os cachorrinhos." },

  // ---- SECRETOS 🐾 (aparecem ao buscar "matilha") ----
  { id: 90, type: 'matilha', title: "Caminha para a Belinha", price: 700, img: P + 'caminha.jpg', desc: "Porque a cama dos noivos já foi dominada!" },
  { id: 91, type: 'matilha', secret: true, title: "Caixa de Brinquedos da Matilha", price: 180, img: M + 'hora_de_brincar.jpg', desc: "Bolinhas e mordedores pra não roerem o sapato do Igor." },
  { id: 92, type: 'matilha', secret: true, title: "Pote de Petiscos Vitalício", price: 200, img: M + 'pote_petiscos.jpg', desc: "Biscoitinhos para todos os 'senta' e 'dá a pata'." },
  { id: 93, type: 'matilha', secret: true, title: "Happy Hour da Matilha", price: 160, img: M + 'happy_hour.jpg', desc: "Um brinde (de água) pra cada cachorrinho." }
];

let giftStatus = {};          // { [id]: 'CLAIMED' | 'PENDING' }
let guestbookMessages = [];   // carregadas do servidor

/* ==========================================================================
   INICIALIZAÇÃO
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initImageFallbacks();
  initMobileMenu();
  initHeroCarousel();
  initCountdown();
  initHistoryGallery();
  initSpotify();
  initRSVP();
  initGiftsGrid();
  initGuestbook();
  initModals();
  initEasterEggs();
  checkApiAndLoad();
  setInterval(() => apiOnline && outbox.flush(), 60000);
});

function initImageFallbacks() {
  document.addEventListener('error', (e) => {
    const img = e.target;
    if (img.tagName !== 'IMG' || img.dataset.fallback) return;
    const src = img.getAttribute('src') || '';
    if (!/^(assets\/|https:\/\/images\.unsplash\.com)/.test(src)) return;
    img.dataset.fallback = '1';
    const gift = giftCatalog.find(g => g.img === src && g.fallbackImg);
    img.src = gift ? gift.fallbackImg : IMG.hearts;
  }, true);
}

async function checkApiAndLoad() {
  try {
    const [gifts, messages] = await Promise.all([api('/gifts/status'), api('/messages')]);
    apiOnline = true;
    giftStatus = {};
    (gifts || []).forEach(g => { if (g.status && g.status !== 'AVAILABLE') giftStatus[g.id] = g.status; });
    guestbookMessages = (messages || []).map(m => ({
      author: m.author_name, content: m.content, date: new Date(m.created_at).toLocaleDateString('pt-BR'),
      dogName: m.dog_name, reply: m.couple_reply
    }));
    renderGifts();
    renderMessages();
    outbox.flush();
  } catch {
    apiOnline = false;
  }
}

/* ==========================================================================
   MENU, CAPA, CONTAGEM, GALERIA
   ========================================================================== */
function initMobileMenu() {
  const btn = document.getElementById('mobileMenuBtn');
  const nav = document.getElementById('navLinks');
  if (!btn || !nav) return;
  const set = (open) => {
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
    btn.querySelector('i').className = open ? 'fas fa-times' : 'fas fa-bars';
  };
  btn.addEventListener('click', () => set(!nav.classList.contains('open')));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => set(false)));
}

function initHeroCarousel() {
  const slides = document.querySelectorAll('.carousel-slide');
  if (!slides.length) return;
  let current = 0;
  setInterval(() => {
    slides[current].classList.remove('active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
  }, 5000);
}

function initCountdown() {
  const target = new Date(CONFIG.WEDDING_DATE).getTime();
  const el = (id) => document.getElementById(id);
  const box = el('countdown');
  if (!box) return;
  const tick = () => {
    const diff = target - Date.now();
    if (diff <= 0) {
      box.innerHTML = '<p class="countdown-done">💍 É hoje! Viva os noivos!</p>';
      clearInterval(timer);
      return;
    }
    el('cdDays').textContent = Math.floor(diff / 86400000);
    el('cdHours').textContent = String(Math.floor(diff / 3600000) % 24).padStart(2, '0');
    el('cdMinutes').textContent = String(Math.floor(diff / 60000) % 60).padStart(2, '0');
    el('cdSeconds').textContent = String(Math.floor(diff / 1000) % 60).padStart(2, '0');
  };
  const timer = setInterval(tick, 1000);
  tick();
}

function initHistoryGallery() {
  const mainImg = document.getElementById('historyMainImg');
  const thumbs = [...document.querySelectorAll('.history-thumb')];
  const counter = document.getElementById('galleryCounter');
  if (!mainImg || !thumbs.length) return;
  let index = 0;
  const select = (i) => {
    index = (i + thumbs.length) % thumbs.length;
    const t = thumbs[index];
    mainImg.src = t.dataset.photo;
    mainImg.alt = t.alt;
    thumbs.forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    t.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    if (counter) counter.textContent = `${index + 1} / ${thumbs.length}`;
  };
  thumbs.forEach((thumb, i) => {
    thumb.addEventListener('click', () => select(i));
    thumb.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(i); } });
  });
  document.getElementById('galleryPrev')?.addEventListener('click', () => select(index - 1));
  document.getElementById('galleryNext')?.addEventListener('click', () => select(index + 1));
  // deslizar no celular
  let x0 = null;
  mainImg.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  mainImg.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) select(index + (dx < 0 ? 1 : -1));
    x0 = null;
  });
}

/* ==========================================================================
   🎵 PLAYLIST DO SPOTIFY
   ========================================================================== */
function cardPaymentUrl(price) {
  const base = String(CONFIG.CARD_PAYMENT_URL || '').trim().replace(/\/+$/, '');
  if (!base) return '';
  return base;
}

function spotifyEmbedUrl(url) {
  const m = String(url).match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(playlist|album|track)\/([A-Za-z0-9]+)/);
  return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator&theme=0` : '';
}

function initSpotify() {
  const embed = spotifyEmbedUrl(CONFIG.SPOTIFY_PLAYLIST_URL);
  const bar = document.getElementById('musicBar');
  const panel = document.getElementById('spotifyPanel');
  const frame = document.getElementById('spotifyFrame');
  const btn = document.getElementById('musicToggleBtn');
  if (!embed || !bar) return;
  bar.hidden = false;
  const toggle = (open) => {
    if (open && !frame.src) frame.src = embed;   // só carrega o Spotify quando a pessoa clica
    panel.hidden = !open;
    btn.setAttribute('aria-expanded', open);
  };
  btn.addEventListener('click', () => toggle(panel.hidden));
  document.getElementById('spotifyClose').addEventListener('click', () => toggle(false));
}

/* ==========================================================================
   💌 CONFIRMAÇÃO DE PRESENÇA (por convite: casal / família)
   ========================================================================== */
function initRSVP() {
  const input = document.getElementById('guestName');
  const list = document.getElementById('nameSuggestions');
  const notice = document.getElementById('nameNotice');
  const groupBox = document.getElementById('rsvpGroup');
  const membersBox = document.getElementById('rsvpMembers');
  const form = document.getElementById('rsvpForm');
  const submitBtn = document.getElementById('btnRsvpSubmit');
  if (!input) return;

  let timer, activeIndex = -1, suggestions = [];
  const listNames = (a) => a.length > 1 ? `${a.slice(0, -1).join(', ')} e ${a[a.length - 1]}` : a[0];

  const hideList = () => { list.hidden = true; input.setAttribute('aria-expanded', 'false'); activeIndex = -1; };

  const renderList = () => {
    if (!suggestions.length) { hideList(); return; }
    list.innerHTML = suggestions.map((s, i) => `
      <li role="option" data-i="${i}" aria-selected="${i === activeIndex}">
        <span>${escapeHTML(s.name)}</span>
        ${s.group_size > 1 ? `<small>${(s.with_names || []).length ? 'com ' + escapeHTML(listNames(s.with_names)) : `convite de ${s.group_size}`}</small>` : ''}
      </li>`).join('');
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  };

  const showGroup = (members) => {
    membersBox.innerHTML = members.map(m => `
      <label class="rsvp-member">
        <input type="checkbox" value="${escapeHTML(m.name)}" ${m.status === 'CANCELLED' ? '' : 'checked'}>
        <span>${escapeHTML(m.name)}</span>
        ${m.status === 'CONFIRMED' ? '<span class="status">já confirmado ✓</span>' : ''}
      </label>`).join('');
    groupBox.hidden = false;
    notice.textContent = '';
  };

  const pick = async (s) => {
    input.value = s.name;
    hideList();
    try {
      const data = await api(`/guests/group?name=${encodeURIComponent(s.name)}`);
      showGroup(data.members);
    } catch {
      showGroup([{ name: s.name }]);
    }
    submitBtn.focus();
  };

  input.addEventListener('input', () => {
    groupBox.hidden = true;
    const q = input.value.trim();
    clearTimeout(timer);
    if (normalizeName(q).length < 3) { suggestions = []; hideList(); notice.textContent = ''; return; }
    timer = setTimeout(async () => {
      try {
        suggestions = await api(`/guests/suggest?q=${encodeURIComponent(q)}`);
        renderList();
        notice.textContent = suggestions.length ? '' : 'Não achamos esse nome. Tente como está no convite.';
      } catch (err) {
        suggestions = [];
        hideList();
        // Sem servidor: deixa confirmar com o nome digitado (fica guardado e é enviado depois)
        if (!err.status || err.status >= 500) showGroup([{ name: q }]);
        else if (err.status === 429) notice.textContent = 'Muitas buscas seguidas. Espere um minutinho.';
      }
    }, 250);
  });

  input.addEventListener('keydown', (e) => {
    if (list.hidden) return;
    if (e.key === 'ArrowDown') { activeIndex = Math.min(activeIndex + 1, suggestions.length - 1); renderList(); e.preventDefault(); }
    if (e.key === 'ArrowUp') { activeIndex = Math.max(activeIndex - 1, 0); renderList(); e.preventDefault(); }
    if (e.key === 'Enter' && activeIndex >= 0) { e.preventDefault(); pick(suggestions[activeIndex]); }
    if (e.key === 'Escape') hideList();
  });
  list.addEventListener('mousedown', (e) => {
    const li = e.target.closest('li');
    if (li) { e.preventDefault(); pick(suggestions[Number(li.dataset.i)]); }
  });
  input.addEventListener('blur', () => setTimeout(hideList, 150));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const boxes = [...membersBox.querySelectorAll('input[type="checkbox"]')];
    if (!boxes.length) return;
    const confirm = boxes.filter(b => b.checked).map(b => b.value);
    const decline = boxes.filter(b => !b.checked).map(b => b.value);
    submitBtn.disabled = true;
    try {
      await sendOrQueue('/rsvp', { confirm, decline });
      if (confirm.length) {
        const names = confirm.length > 1 ? `${confirm.slice(0, -1).join(', ')} e ${confirm.slice(-1)}` : confirm[0];
        showDogModal(IMG.ok, 'Presença confirmada! 💌',
          `Que alegria! ${names}, contamos com vocês no dia 07/08/2027, às 16:30, no Port Vittoria. Ana Beatriz e Igor agradecem!`);
      } else {
        showDogModal(IMG.sad, 'Que pena!',
          'Vamos sentir sua falta! Obrigado por avisar. Se mudar de ideia, é só voltar aqui e confirmar.');
      }
      form.reset();
      groupBox.hidden = true;
    } catch (err) {
      if (err.status === 429) showDogModal(IMG.grr, 'Calma, humano!', 'Muitas tentativas seguidas. Espere alguns minutos e tente de novo.');
      else showDogModal(IMG.sad, 'Nome não encontrado', 'Não achamos esse nome na lista. Digite como está no convite e escolha na lista que aparece.');
    } finally {
      submitBtn.disabled = false;
    }
  });
}

/* ==========================================================================
   🎁 LISTA DE PRESENTES & FILTROS
   ========================================================================== */
const giftFilters = { price: 'all', type: 'all', query: '', sort: 'asc', max: Infinity };

function priceBand(price) {
  if (price <= 500) return 'low';
  if (price <= 1000) return 'mid';
  return 'high';
}

function isUnavailable(g) {
  return giftStatus[g.id] === 'CLAIMED' || giftStatus[g.id] === 'PENDING';
}

function renderGifts() {
  const grid = document.getElementById('giftsGrid');
  const counter = document.getElementById('giftsCount');
  if (!grid) return;
  const q = normalizeName(giftFilters.query);
  const showSecret = /matilha|cachorr|au au|auau|pet/.test(q);

  const list = giftCatalog.filter(g => {
    if (g.secret && !showSecret) return false;
    const text = normalizeName(`${g.title} ${g.desc}`);
    const matchSearch = !q || text.includes(q) || (showSecret && g.type === 'matilha');
    const matchBand = giftFilters.price === 'all' || priceBand(g.price) === giftFilters.price;
    const matchType = giftFilters.type === 'all' || g.type === giftFilters.type || (giftFilters.type === 'casa' && g.type === 'matilha');
    return matchSearch && matchBand && matchType && g.price <= giftFilters.max;
  }).sort((a, b) => (isUnavailable(a) - isUnavailable(b)) || (giftFilters.sort === 'asc' ? a.price - b.price : b.price - a.price));

  if (showSecret && !renderGifts._secretShown) {
    renderGifts._secretShown = true;
    showToast('🐾 Você achou os presentes secretos da matilha!');
  }

  grid.innerHTML = list.map(giftCardHTML).join('') ||
    '<p class="empty-state">Nenhum presente encontrado com esses filtros.</p>';
  if (counter) counter.textContent = `${list.length} presente${list.length === 1 ? '' : 's'}`;
}

function giftCardHTML(g) {
  const status = giftStatus[g.id];
  const claimed = status === 'CLAIMED';
  const pending = status === 'PENDING';
  const badge = claimed ? '<div class="claimed-badge-stamp">JÁ PRESENTEADO!</div>'
    : pending ? '<div class="claimed-badge-stamp pending">RESERVADO</div>'
    : g.secret ? '<div class="claimed-badge-stamp secret">🐾 SECRETO</div>' : '';
  const btnLabel = claimed ? 'Presenteado' : pending ? 'Reservado' : 'Presentear';

  return `
    <article class="gift-card ${claimed || pending ? 'claimed' : ''}">
      ${badge}
      <div class="gift-img-wrap"><img src="${g.img}" alt="${escapeHTML(g.title)}" loading="lazy"></div>
      <div class="gift-content">
        <div>
          <h3 class="gift-title">${escapeHTML(g.title)}</h3>
          <p class="gift-desc">${escapeHTML(g.desc)}</p>
        </div>
        <div class="gift-footer">
          <span class="gift-price">${brl(g.price)}</span>
          <button class="btn-gift-buy" data-gift-id="${g.id}" ${claimed || pending ? 'disabled' : ''}>
            <img src="${ID}brilhos.png" class="dog-interactive-icon" alt="">
            ${btnLabel}
          </button>
        </div>
      </div>
    </article>`;
}

function initGiftsGrid() {
  const grid = document.getElementById('giftsGrid');
  const search = document.getElementById('giftSearchInput');
  const range = document.getElementById('priceMax');
  const rangeLabel = document.getElementById('priceMaxLabel');
  const sortBtn = document.getElementById('sortToggle');
  if (!grid) return;

  // Controle "até R$ X" de 50 em 50 reais
  const maxPrice = Math.ceil(Math.max(...giftCatalog.filter(g => !g.secret).map(g => g.price)) / 50) * 50;
  range.max = maxPrice;
  range.value = maxPrice;
  range.addEventListener('input', () => {
    const v = Number(range.value);
    giftFilters.max = v >= maxPrice ? Infinity : v;
    rangeLabel.textContent = v >= maxPrice ? 'qualquer valor' : brl(v);
    renderGifts();
  });

  sortBtn.addEventListener('click', () => {
    giftFilters.sort = giftFilters.sort === 'asc' ? 'desc' : 'asc';
    document.getElementById('sortLabel').textContent = giftFilters.sort === 'asc' ? 'Menor preço' : 'Maior preço';
    sortBtn.querySelector('i').className = giftFilters.sort === 'asc' ? 'fas fa-arrow-up-wide-short' : 'fas fa-arrow-down-wide-short';
    renderGifts();
  });

  renderGifts();

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-gift-buy');
    if (btn && !btn.disabled) openPaymentModal(Number(btn.dataset.giftId));
  });

  search.addEventListener('input', () => { giftFilters.query = search.value; renderGifts(); });

  document.querySelectorAll('.price-chip').forEach(chip => chip.addEventListener('click', () => {
    document.querySelectorAll('.price-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    giftFilters.price = chip.dataset.filter;
    renderGifts();
  }));
  document.querySelectorAll('.type-chip').forEach(chip => chip.addEventListener('click', () => {
    document.querySelectorAll('.type-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    giftFilters.type = chip.dataset.type;
    renderGifts();
  }));
}

/* ==========================================================================
   GERADOR DE PIX (PADRÃO BR CODE EMV COM CRC16)
   ========================================================================== */
function crc16(data) {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= (data.charCodeAt(i) << 8);
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

const pixText = (s, max) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9 ]/g, '').trim().substring(0, max);

function generatePixCode(pixKey, merchantName, merchantCity, amount, txid = '***') {
  const f = (id, value) => `${id}${String(value.length).padStart(2, '0')}${value}`;
  let payload = f('00', '01');
  payload += f('26', f('00', 'br.gov.bcb.pix') + f('01', pixKey));
  payload += f('52', '0000');
  payload += f('53', '986');
  if (amount && amount > 0) payload += f('54', Number(amount).toFixed(2));
  payload += f('58', 'BR');
  payload += f('59', pixText(merchantName, 25) || 'NOIVOS');
  payload += f('60', pixText(merchantCity, 15) || 'BRASILIA');
  payload += f('62', f('05', (txid || '***').replace(/[^A-Za-z0-9*]/g, '').substring(0, 25)));
  payload += '6304';
  return payload + crc16(payload);
}

function renderQrCode(container, text) {
  container.innerHTML = '';
  if (window.QRCode) {
    new QRCode(container, { text, width: 200, height: 200, colorDark: '#2E1B1B', correctLevel: QRCode.CorrectLevel.M });
  } else {
    const img = document.createElement('img');
    img.alt = 'QR Code Pix';
    img.width = 200; img.height = 200;
    img.onerror = () => { container.innerHTML = '<p class="muted" style="max-width:200px">Use o Pix Copia e Cola abaixo 👇</p>'; };
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
    container.appendChild(img);
  }
}

/* ==========================================================================
   MODAL DE PAGAMENTO (Pix ou cartão)
   ========================================================================== */
let selectedGift = null;
let payMethod = 'PIX';

function setPayMethod(method) {
  payMethod = method;
  document.querySelectorAll('.pay-tab').forEach(t => {
    const on = t.dataset.method === method;
    t.classList.toggle('active', on);
    t.setAttribute('aria-selected', on);
  });
  document.getElementById('pixArea').hidden = method !== 'PIX';
  document.getElementById('cardArea').hidden = method !== 'CARTAO';
}

function openPaymentModal(giftId) {
  selectedGift = giftCatalog.find(g => g.id === giftId);
  if (!selectedGift || isUnavailable(selectedGift)) return;
  const gift = selectedGift;

  const img = document.getElementById('payGiftImg');
  img.dataset.fallback = '';
  img.src = gift.img; img.alt = gift.title;
  document.getElementById('payGiftTitle').textContent = gift.title;
  document.getElementById('payGiftPrice').textContent = `Valor: ${brl(gift.price)}`;
  document.getElementById('pixKeyDisplay').textContent = CONFIG.PIX_KEY_DISPLAY;

  const code = generatePixCode(CONFIG.PIX_KEY, CONFIG.PIX_MERCHANT_NAME, CONFIG.PIX_MERCHANT_CITY, gift.price, `PRESENTE${gift.id}`);
  document.getElementById('pixCodeText').textContent = code;
  renderQrCode(document.getElementById('pixQrCode'), code);

  document.getElementById('btnCopyPixCode').onclick = () => copyText(code, '✅ Código Pix copiado! Cole na opção "Pix Copia e Cola" do seu banco.');
  document.getElementById('btnCopyPixKey').onclick = () => copyText(CONFIG.PIX_KEY_DISPLAY.replace(/\D/g, ''), '✅ Chave Pix copiada!');

  document.getElementById('cardHint').textContent = CONFIG.CARD_PAYMENT_URL
    ? `No Mercado Pago, digite o valor de ${brl(gift.price)}. Depois volte aqui e confirme o presente.`
    : 'Vamos te enviar o link do cartão pelo WhatsApp dos noivos. Depois volte aqui e confirme.';
  document.getElementById('btnCardPay').onclick = () => {
    const url = cardPaymentUrl(gift.price) ||
      `https://wa.me/${CONFIG.WHATSAPP_CONTATO}?text=${encodeURIComponent(`Oi, Ana Beatriz e Igor! Quero dar o presente "${gift.title}" (${brl(gift.price)}) no cartão de crédito. Pode me mandar o link? 💝`)}`;
    window.open(url, '_blank', 'noopener');
  };

  document.querySelectorAll('.pay-tab').forEach(t => { t.onclick = () => setPayMethod(t.dataset.method); });
  setPayMethod('PIX');
  openOverlay('paymentModalOverlay');

  const form = document.getElementById('paymentForm');
  form.onsubmit = (e) => {
    e.preventDefault();
    const payerName = document.getElementById('payerName').value.trim();
    const payerMessage = document.getElementById('payerMessage').value.trim();
    if (!payerName) return document.getElementById('payerName').focus();
    const method = payMethod;

    showDogModal(IMG.envelope, 'Confirmar presente?',
      `${payerName}, você confirma que pagou ${brl(gift.price)} (${method === 'PIX' ? 'Pix' : 'cartão'}) pelo presente "${gift.title}"?`, true,
      async () => {
        try {
          await sendOrQueue('/gifts/claim', { gift_id: gift.id, giver_name: payerName, message: payerMessage, amount: gift.price, payment_method: method });
          giftStatus[gift.id] = 'PENDING';
          closeOverlay('paymentModalOverlay');
          form.reset();
          renderGifts();
          showDogModal(IMG.champagne, 'Muito obrigado! 🥂',
            `Seu presente "${gift.title}" foi registrado e sua mensagem chegou até Ana Beatriz e Igor. Obrigado pelo carinho!`);
        } catch (err) {
          const msg = err.status === 409
            ? 'Alguém acabou de escolher este presente! Se você já pagou, fique tranquilo: avise os noivos pelo WhatsApp que eles resolvem 💕'
            : 'Muitas tentativas seguidas. Espere alguns minutos e tente de novo, por favor!';
          showDogModal(IMG.hearts, 'Opa!', msg);
        }
      });
  };
}

/* ==========================================================================
   MURAL DE RECADOS
   ========================================================================== */
function renderMessages() {
  const list = document.getElementById('messagesList');
  if (!list) return;
  if (!guestbookMessages.length) {
    list.innerHTML = `<div class="empty-mural"><img src="${IMG.envelope}" alt="">Seja o primeiro a deixar um recado para os noivos 💌</div>`;
    return;
  }
  list.innerHTML = guestbookMessages.map(msg => `
    <div class="message-card">
      <div class="message-header">
        <span class="message-author">${escapeHTML(msg.author)}</span>
        <span class="message-date">${escapeHTML(msg.date)}</span>
      </div>
      <p>${escapeHTML(msg.content)}</p>
      ${msg.reply ? `
        <div class="couple-reply-box">
          <img src="${spriteForDog(msg.dogName || '')}" alt="" class="reply-dog-avatar">
          <div><strong>${escapeHTML((msg.dogName || 'Matilha').replace(/[^\p{L}\s]/gu, '').trim())} respondeu:</strong> ${escapeHTML(msg.reply)}</div>
        </div>` : ''}
    </div>`).join('');
}

function initGuestbook() {
  const form = document.getElementById('guestbookForm');
  if (!form) return;
  renderMessages();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const author = document.getElementById('msgAuthor').value.trim();
    const content = document.getElementById('msgContent').value.trim();
    if (!author || !content) return;
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;

    try {
      const saved = await sendOrQueue('/messages', { author, content });
      const dog = dogResponders[Math.floor(Math.random() * dogResponders.length)];
      guestbookMessages.unshift(saved
        ? { author: saved.author_name, content: saved.content, date: new Date(saved.created_at).toLocaleDateString('pt-BR'), dogName: saved.dog_name, reply: saved.couple_reply }
        : { author, content, date: new Date().toLocaleDateString('pt-BR'), dogName: dog.name, reply: dog.replies[0] });
      renderMessages();
      form.reset();
      showDogModal(IMG.ok, 'Recado enviado! 💌', 'Obrigado pelo carinho! Sua mensagem chegou até Ana Beatriz e Igor. Veja a resposta da matilha!');
    } catch (err) {
      showDogModal(IMG.grr, 'Calma, humano!', 'Muitas mensagens seguidas. Espere alguns minutos e tente de novo.');
    } finally {
      btn.disabled = false;
    }
  });
}

/* ==========================================================================
   MODAIS
   ========================================================================== */
let lastFocused = null;

function openOverlay(id) {
  lastFocused = document.activeElement;
  const overlay = document.getElementById(id);
  overlay.classList.add('active');
  document.body.classList.add('modal-open');
  setTimeout(() => overlay.querySelector('.modal-actions button, button.btn-primary, input, textarea')?.focus(), 50);
}

function closeOverlay(id) {
  document.getElementById(id).classList.remove('active');
  if (!document.querySelector('.modal-overlay.active')) document.body.classList.remove('modal-open');
  lastFocused?.focus?.();
}

function showDogModal(imgSrc, title, text, showConfirm = false, onConfirm = null) {
  const img = document.getElementById('modalDogImg');
  img.dataset.fallback = '';
  img.src = imgSrc;
  img.classList.toggle('photo', /\.jpe?g$/i.test(imgSrc));
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalText').textContent = text;
  const actions = document.getElementById('modalActions');

  if (showConfirm) {
    actions.innerHTML = `
      <button class="btn-modal-close" id="btnModalConfirmYes">Sim, confirmar!</button>
      <button class="btn-modal-close secondary" id="btnModalConfirmNo">Voltar</button>`;
    document.getElementById('btnModalConfirmYes').onclick = () => { closeOverlay('dogModalOverlay'); onConfirm && onConfirm(); };
    document.getElementById('btnModalConfirmNo').onclick = () => closeOverlay('dogModalOverlay');
  } else {
    actions.innerHTML = `<button class="btn-modal-close" id="btnModalClose">Fechar</button>`;
    document.getElementById('btnModalClose').onclick = () => closeOverlay('dogModalOverlay');
  }
  openOverlay('dogModalOverlay');
}

function initModals() {
  document.getElementById('btnOpenTrajesModal')?.addEventListener('click', () => openOverlay('trajesModalOverlay'));
  document.getElementById('btnCloseTrajesModal')?.addEventListener('click', () => closeOverlay('trajesModalOverlay'));
  document.querySelectorAll('.modal-x').forEach(btn => btn.addEventListener('click', () => closeOverlay(btn.dataset.close)));
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeOverlay(overlay.id); });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const open = [...document.querySelectorAll('.modal-overlay.active')].pop();
      if (open) closeOverlay(open.id);
    }
  });
}

/* ==========================================================================
   🐾 EASTER EGGS
   1. Cachorro espiando no canto da tela (clique nele!)
   2. Caça aos 5 ossinhos 🦴 escondidos pelo site
   3. Digite "auau" em qualquer lugar → desfile da matilha
   4. Clique 5x seguidas no logo
   5. Busque "matilha" na lista de presentes → presentes secretos
   6. Cachorrinho passeando no rodapé
   ========================================================================== */
function initEasterEggs() {
  initPeekDog();
  initTreatHunt();
  initDogParadeTrigger();
  initLogoClicks();
  initFooterDog();
  initBackToTop();
  console.log('%c🐾 Au au, curioso(a)! Digite "auau" na página e veja a matilha passar. Existem 5 ossinhos escondidos...', 'color:#661C1D;font-size:14px;font-weight:bold');
}

function initPeekDog() {
  const dog = document.getElementById('peekDog');
  if (!dog) return;
  let shown = 0;
  const peek = () => {
    if (document.body.classList.contains('modal-open') || shown >= 3) return;
    shown++;
    dog.classList.add('peeking');
    setTimeout(() => dog.classList.remove('peeking'), 5000);
  };
  setTimeout(peek, 20000);
  setInterval(peek, 75000);
  const gifts = document.getElementById('presentes');
  if (gifts && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { peek(); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(gifts);
  }
  dog.addEventListener('click', () => {
    dog.classList.remove('peeking');
    showDogModal('assets/matilha/espiando.jpg', 'Você me pegou espiando! 👀',
      'Eu só queria ver se você já escolheu o presente... Dica: tem 5 ossinhos 🦴 escondidos pelo site.');
  });
}

function initTreatHunt() {
  const found = new Set(storage.get('treats_found', []));
  const counter = document.getElementById('treatCounter');
  const countEl = document.getElementById('treatCount');
  const total = document.querySelectorAll('.hidden-treat').length;

  const update = () => {
    countEl.textContent = found.size;
    counter.hidden = found.size === 0;
    document.querySelectorAll('.hidden-treat').forEach(t => t.classList.toggle('found', found.has(t.dataset.treat)));
  };

  document.querySelectorAll('.hidden-treat').forEach(treat => {
    treat.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      const id = treat.dataset.treat;
      if (found.has(id)) return showToast('Esse ossinho você já pegou! 🦴');
      found.add(id);
      storage.set('treats_found', [...found]);
      update();
      counter.classList.remove('bump'); void counter.offsetWidth; counter.classList.add('bump');
      if (found.size >= total) {
        showDogModal(IMG.party, 'Você achou os 5 ossos! 🦴', 'Parabéns! Você ganhou um lambeijo da matilha! 🐾💋');
        startDogParade(14);
      } else {
        showToast(`🦴 Ossinho encontrado! ${found.size}/${total}`);
      }
    });
  });
  update();
}

function startDogParade(count = 10) {
  const stage = document.getElementById('dogParade');
  if (!stage || stage.childElementCount) return;
  const pool = [...IDENTITY_DOGS, ID + 'coracoes.png', ID + 'coracoes2.png'];
  const items = Array.from({ length: count }, (_, i) => pool[i % pool.length]).sort(() => Math.random() - 0.5);
  items.forEach((src, i) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.className = 'parade-dog';
    img.style.animationDelay = `${i * 0.45}s`;
    img.style.height = `${src.includes('coracoes') ? 40 : 75 + Math.random() * 30}px`;
    stage.appendChild(img);
  });
  setTimeout(() => { stage.innerHTML = ''; }, count * 450 + 7000);
}

function initDogParadeTrigger() {
  let buffer = '';
  document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
    buffer = (buffer + (e.key || '').toLowerCase()).slice(-4);
    if (buffer === 'auau') {
      buffer = '';
      showToast('🐾 AU AU! Lá vem a matilha!');
      startDogParade(12);
    }
  });
}

function initLogoClicks() {
  const logo = document.getElementById('logoCouple');
  if (!logo) return;
  let clicks = 0, timer;
  logo.addEventListener('click', () => {
    clicks++;
    clearTimeout(timer);
    timer = setTimeout(() => { clicks = 0; }, 1500);
    if (clicks >= 5) {
      clicks = 0;
      showDogModal(IMG.grr, 'Grrrrr! 🚩', 'Território demarcado! Oficialmente, este site agora pertence à matilha. Os noivos só estão aqui de enfeite.');
    }
  });
}

function initFooterDog() {
  const dog = document.getElementById('footerBeagle');
  const footer = document.getElementById('rodape');
  if (!dog || !footer || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) { dog.classList.remove('walk'); void dog.offsetWidth; dog.classList.add('walk'); }
  }, { threshold: 0.5 });
  io.observe(footer);
  dog.addEventListener('click', () => showToast('Ele só está passeando... finge que não viu 🐶'));
}

function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 900), { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}
