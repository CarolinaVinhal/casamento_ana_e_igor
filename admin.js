/* Painel dos noivos — arquivo separado para permitir uma política de segurança (CSP) rígida */
  const API = window.API_BASE;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const tokenInput = document.getElementById('token');
  try { tokenInput.value = sessionStorage.getItem('adm') || ''; } catch {}

  async function call(path, method = 'GET') {
    const r = await fetch(API + path, { method, headers: { 'X-Admin-Token': tokenInput.value } });
    if (!r.ok) throw new Error({ 401: 'Senha incorreta.', 429: 'Muitas tentativas erradas. Espere 15 minutos.', 503: 'Painel desativado: defina ADMIN_TOKEN (mín. 20 caracteres) no servidor.' }[r.status] || 'Erro ' + r.status);
    return r.json();
  }

  async function load() {
    document.getElementById('msg').textContent = '';
    try {
      const [contribs, rsvps, gifts] = await Promise.all([call('/admin/contributions'), call('/admin/rsvps'), fetch(API + '/gifts').then(r => r.json())]);
      try { sessionStorage.setItem('adm', tokenInput.value); } catch {}
      const giftName = Object.fromEntries(gifts.map(g => [g.id, g.title]));
      const paid = contribs.filter(c => c.status === 'PAID').reduce((s, c) => s + c.amount, 0);
      document.getElementById('stats').innerHTML = `
        <div>✅ ${rsvps.confirmed} de ${rsvps.total_guests} confirmados</div>
        <div>❌ ${rsvps.declined} não vão</div>
        <div>⏳ ${contribs.filter(c => c.status === 'PENDING').length} Pix a conferir</div>
        <div>💰 R$ ${paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} recebidos</div>`;
      document.getElementById('contribs').innerHTML = contribs.map(c => `
        <tr><td>${c.id}</td><td>${new Date(c.created_at).toLocaleString('pt-BR')}</td><td>${esc(c.giver_name)}</td>
        <td>${esc(giftName[c.gift_id] || c.gift_id)}</td><td>R$ ${c.amount.toFixed(2)}</td><td>${c.payment_method === 'CARTAO' ? 'Cartão' : 'Pix'}</td><td>${esc(c.message)}</td>
        <td class="${c.status}">${c.status === 'PENDING' ? 'A conferir' : c.status === 'PAID' ? 'Recebido' : 'Recusado'}</td>
        <td>${c.status === 'PENDING' ? `<button data-a="confirm" data-id="${c.id}">Caiu ✔</button> <button class="no" data-a="reject" data-id="${c.id}">Não caiu</button>` : ''}</td></tr>`).join('') || '<tr><td colspan="9">Nenhum presente ainda.</td></tr>';
      document.getElementById('rsvps').innerHTML = rsvps.items.map(r => `
        <tr><td>${esc(r.guest)}</td><td>${esc(r.group || '')}</td><td>${r.status === 'CONFIRMED' ? '✅ Vai' : '❌ Não vai'}</td><td>${new Date(r.updated_at).toLocaleString('pt-BR')}</td></tr>`).join('');
      document.getElementById('content').hidden = false;
    } catch (e) {
      document.getElementById('msg').textContent = e.message;
    }
  }

  document.getElementById('btnLoad').onclick = load;
  document.getElementById('contribs').addEventListener('click', async (e) => {
    const b = e.target.closest('button[data-a]');
    if (!b) return;
    await call(`/admin/contributions/${b.dataset.id}/${b.dataset.a}`, 'POST');
    load();
  });
