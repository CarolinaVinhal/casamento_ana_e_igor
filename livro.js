/* Livro de recados: junta mural + mensagens dos presentes + confirmados num documento para salvar em PDF */
(async function () {
  const API = window.API_BASE;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = d => d ? new Date(d).toLocaleDateString('pt-BR') : '';
  const DOGS = { Bela: 'dog_bela', Nina: 'dog_nina', Costela: 'dog_costela', 'Paçoca': 'dog_pacoca', Lua: 'dog_lua' };
  const dogImg = name => `assets/identidade/${DOGS[Object.keys(DOGS).find(k => (name || '').startsWith(k))] || 'dog_bela'}.png`;
  const status = document.getElementById('status');
  const btn = document.getElementById('btnPrint');
  btn.onclick = () => window.print();

  let token = '';
  try { token = sessionStorage.getItem('adm') || ''; } catch { /* ignora */ }
  if (!token) token = prompt('Senha do painel (ADMIN_TOKEN):') || '';

  try {
    const r = await fetch(`${API}/admin/livro`, { headers: { 'X-Admin-Token': token } });
    if (!r.ok) throw new Error(r.status === 401 ? 'Senha incorreta.' : `Erro ${r.status}`);
    const data = await r.json();

    document.getElementById('mural').innerHTML = data.mural.map(m => `
      <div class="card">
        <p class="from">${esc(m.author)}</p>
        <p class="text">${esc(m.content)}</p>
        ${m.reply ? `<div class="reply"><img src="${dogImg(m.dog)}" alt=""><span>${esc(m.reply)}</span></div>` : ''}
        <p class="when">${fmt(m.date)}</p>
      </div>`).join('') || '<p class="empty">Nenhum recado no mural.</p>';

    document.getElementById('presentes').innerHTML = data.presentes.filter(p => (p.message || '').trim()).map(p => `
      <div class="card">
        <p class="from">${esc(p.author)}</p>
        <p class="gift">Presente: ${esc(p.gift)}</p>
        <p class="text">${esc(p.message)}</p>
        <p class="when">${fmt(p.date)}</p>
      </div>`).join('') || '<p class="empty">Nenhuma mensagem junto dos presentes.</p>';

    document.getElementById('convidados').innerHTML = data.confirmados.map(n => `<li>${esc(n)}</li>`).join('');

    status.textContent = `${data.mural.length} recados · ${data.presentes.length} presentes · ${data.confirmados.length} confirmados`;
    btn.disabled = false;
  } catch (e) {
    status.textContent = `Não foi possível carregar: ${e.message}`;
  }
})();
