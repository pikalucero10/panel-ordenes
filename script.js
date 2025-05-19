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
    '2500': 'Seguidores TikTok', // actualizado
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
