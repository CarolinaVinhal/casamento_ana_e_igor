/* ==========================================================================
   ENDEREÇO DA API (backend no Render) — usado pelo site, pelo painel e pelo livro.
   Se o Render der outro endereço ao backend, troque só a linha RENDER_API.
   ========================================================================== */
(function () {
  const RENDER_API = 'https://api-casamento-ana-e-igor.onrender.com/api';
  const local = ['localhost', '127.0.0.1', ''].includes(location.hostname);
  window.API_BASE = local ? 'http://localhost:8000/api' : RENDER_API;
})();
