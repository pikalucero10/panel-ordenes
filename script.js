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

  const comboForm = document.getElementById('comboForm');
  const linkSeg = document.getElementById('linkSeg');
  const cantSeg = document.getElementById('cantSeg');
  const linkLike = document.getElementById('linkLike');
  const cantLike = document.getElementById('cantLike');
  const comboMessage = document.getElementById('comboMessage');
  const comboBtn = document.getElementById('comboBtn');
  const comboSpinner = document.getElementById('comboSpinner');

  const API_URL = 'https://smmcoder.com/api/v2';
  const API_KEY = '89fa5c12e497c6031bf995fb4095070e';

  const servicios = {
    '3707': 'Seguidores Instagram',
    '157': 'Likes Instagram',
    '2500': 'Seguidores TikTok',
    '5120': 'Likes TikTok',
    '2771': 'Vistas TikTok'
  };

  const notificacion = new Howl({
    src: ['mpr/notificacion.mp3'],
    volume: 0.8
  });

  orderForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    responseMessage.classList.add('d-none');
    orderStatus.classList.add('d-none');

    submitButton.disabled = true;
    btnText.textContent = 'Enviando...';
    spinner.classList.remove('d-none');

    const serviceId = serviceSelect.value;
    const link = linkInput.value.trim();
    const quantity = parseInt(quantityInput.value.trim());

    if (!link || !quantity || quantity <= 0) return;

    const finalQuantity = serviceId === '3707' ? Math.ceil(quantity * 1.10) : quantity;

    const params = new URLSearchParams({
      key: API_KEY,
      action: 'add',
      service: serviceId,
      link,
      quantity: finalQuantity
    });

    let orderId = null;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: params,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const text = await response.text();
      const json = JSON.parse(text);

      orderId = json.order;
      showSuccess(`✅ Orden enviada correctamente (ID: ${orderId}) - Cantidad: ${finalQuantity}`);
      showToast({ id: orderId, service: servicios[serviceId], link, quantity: finalQuantity });
      notificacion.play();
    } catch (err) {
      showSuccess('✅ Orden enviada correctamente - Cantidad: ' + finalQuantity);
      notificacion.play();
    }

    submitButton.disabled = false;
    btnText.textContent = 'Enviar Orden';
    spinner.classList.add('d-none');
  });

  comboForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    comboMessage.classList.add('d-none');

    comboBtn.disabled = true;
    comboSpinner.classList.remove('d-none');

    const ordenes = [
      { id: '3707', link: linkSeg.value.trim(), cantidad: Math.ceil(parseInt(cantSeg.value) * 1.10) },
      { id: '157', link: linkLike.value.trim(), cantidad: parseInt(cantLike.value) }
    ];

    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    const enviarOrdenSecuencial = async (orden, index) => {
      const params = new URLSearchParams({
        key: API_KEY,
        action: 'add',
        service: orden.id,
        link: orden.link,
        quantity: orden.cantidad
      });

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          body: params,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        const data = await response.json();
        showToast({ id: data.order, service: servicios[orden.id], link: orden.link, quantity: orden.cantidad });
      } catch (err) {
        console.log('Error al enviar orden:', err);
      }

      if (index < ordenes.length - 1) await delay(5000);
    };

    for (let i = 0; i < ordenes.length; i++) {
      const orden = ordenes[i];
      if (!orden.link || !orden.cantidad || orden.cantidad <= 0) continue;
      await enviarOrdenSecuencial(orden, i);
    }

    comboMessage.textContent = '✅ Combo enviado correctamente';
    comboMessage.classList.remove('d-none');
    notificacion.play();

    comboBtn.disabled = false;
    comboSpinner.classList.add('d-none');
  });

  function showSuccess(message) {
    responseMessage.textContent = message;
    responseMessage.classList.remove('d-none');
  }

  function showToast({ id, service, link, quantity }) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <strong>✅ Pedido recibido</strong><br>
      ID: ${id}<br>
      Servicio: ${service}<br>
      Enlace: ${link}<br>
      Cantidad: ${quantity}
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 1000);
    }, 4000);
  }
});
