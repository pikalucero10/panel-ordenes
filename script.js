document.addEventListener('DOMContentLoaded', () => {
  const orderForm = document.getElementById('orderForm');
  const serviceSelect = document.getElementById('service');
  const linkInput = document.getElementById('link');
  const quantityInput = document.getElementById('quantity');
  const responseMessage = document.getElementById('responseMessage');
  const orderStatus = document.getElementById('orderStatus');
  const submitButton = document.getElementById('submitButton');
  const btnText = document.getElementById('btnText');
  const spinner = document.getElementById('spinner');

  const API_URL = 'https://smmcoder.com/api/v2';
  const API_KEY = '89fa5c12e497c6031bf995fb4095070e';

  const servicios = {
    '3707': 'Seguidores Instagram',
    '157': 'Likes Instagram',
    '169': 'Vistas Instagram',
    '2850': 'Seguidores TikTok',
    '5120': 'Likes TikTok',
    '2771': 'Vistas TikTok'
  };

  orderForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    responseMessage.style.display = 'none';
    orderStatus.style.display = 'none';
    responseMessage.className = 'message-area';
    responseMessage.textContent = '';

    submitButton.disabled = true;
    btnText.textContent = 'Enviando...';
    spinner.style.display = 'inline-block';

    const serviceId = serviceSelect.value;
    const link = linkInput.value.trim();
    const quantityStr = quantityInput.value.trim();

    if (!link || !quantityStr) return;
    const quantity = parseInt(quantityStr);
    if (isNaN(quantity) || quantity <= 0) return;

    const finalQuantity = Math.ceil(quantity * 1.10);

    const params = new URLSearchParams();
    params.append('key', API_KEY);
    params.append('action', 'add');
    params.append('service', serviceId);
    params.append('link', link);
    params.append('quantity', finalQuantity.toString());

    let orderId = null;
    let charge = '0.00';
    let balance = '0.00';

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: params,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const text = await response.text();

      try {
        const json = JSON.parse(text);
        orderId = json.order;
        charge = json.charge || '0.00';
      } catch {
        const match = text.match(/"order"\s*:\s*(\d+)/);
        if (match) orderId = match[1];
      }

      const balanceResponse = await fetch(API_URL, {
        method: 'POST',
        body: new URLSearchParams({ key: API_KEY, action: 'balance' }),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      const balanceData = await balanceResponse.json();
      balance = balanceData.balance || '0.00';

    } catch (err) {
      // silencioso
    }

    showSuccess(`✅ Orden enviada correctamente${orderId ? ` (ID: ${orderId})` : ''} - Cantidad: ${finalQuantity}`);

    if (orderId) {
      fetchOrderStatus(orderId);
      showToast({
        id: orderId,
        service: servicios[serviceId] || 'Servicio desconocido',
        link,
        quantity: finalQuantity,
        charge,
        balance
      });
    }

    submitButton.disabled = false;
    btnText.textContent = 'Enviar Orden';
    spinner.style.display = 'none';
  });

  async function fetchOrderStatus(orderId) {
    const params = new URLSearchParams();
    params.append('key', API_KEY);
    params.append('action', 'status');
    params.append('order', orderId);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: params,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const data = await response.json();
      const html = `
        <strong>📦 Estado actual:</strong><br>
        <b>ID:</b> ${orderId}<br>
        <b>Estado:</b> ${data.status}<br>
        <b>Inicio:</b> ${data.start_count}<br>
        <b>Restantes:</b> ${data.remains}<br>
        <b>Costo:</b> ${data.charge} ${data.currency}
      `;
      orderStatus.innerHTML = html;
      orderStatus.style.display = 'block';
    } catch {}
  }

  function showSuccess(message) {
    responseMessage.textContent = message;
    responseMessage.className = 'message-area success';
    responseMessage.style.display = 'block';
  }

  // Toast Notification
  function showToast(details) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `
      <strong>✅ Pedido recibido</strong><br>
      ID: ${details.id}<br>
      Servicio: ${details.service}<br>
      Enlace: ${details.link}<br>
      Cantidad: ${details.quantity}<br>
      Cargo: $${details.charge}<br>
      Saldo: $${details.balance}
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("hide");
      setTimeout(() => toast.remove(), 1000);
    }, 5000);
  }

  // Modo oscuro
  function applyTheme(theme) {
    document.body.classList.toggle('dark', theme === 'dark');
    document.getElementById('toggleTheme').textContent = theme === 'dark' ? '🌞 Modo Claro' : '🌓 Modo Oscuro';
    localStorage.setItem('theme', theme);
  }

  function toggleTheme() {
    const current = document.body.classList.contains('dark') ? 'dark' : 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  document.getElementById('toggleTheme').addEventListener('click', toggleTheme);

  (function () {
    const saved = localStorage.getItem('theme');
    if (saved) {
      applyTheme(saved);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark ? 'dark' : 'light');
    }
  })();
});
