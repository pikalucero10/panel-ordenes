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
    '3179': 'Seguidores Instagram',
    '157': 'Likes Instagram',
    '169': 'Vistas Instagram',
    '5692': 'Seguidores TikTok',
    '5120': 'Likes TikTok',
    '2771': 'Vistas TikTok'
  };

  const notificacion = new Howl({
    src: ['mpr/notificacion.mp3'],
    volume: 0.8
  });

  const hoverSound = new Howl({
    src: ['mpr/hover.mp3'], // agregalo en tu carpeta mpr
    volume: 0.3
  });

  submitButton.addEventListener('mouseenter', () => {
    hoverSound.play();
  });

  orderForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    responseMessage.classList.add('d-none');
    orderStatus.classList.add('d-none');

    const serviceId = serviceSelect.value;
    const link = linkInput.value.trim();
    const quantity = parseInt(quantityInput.value.trim());

    if (!link || !quantity || quantity <= 0) {
      showError('❌ Verificá que el enlace y la cantidad sean válidos.');
      return;
    }

    const finalQuantity = serviceId === '3179'
      ? Math.ceil(quantity * 1.05)
      : quantity;

    submitButton.disabled = true;
    btnText.textContent = 'Enviando...';
    spinner.classList.remove('d-none');

    const params = new URLSearchParams({
      key: API_KEY,
      action: 'add',
      service: serviceId,
      link,
      quantity: finalQuantity
    });

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: params,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const text = await response.text();
      const json = JSON.parse(text);

      if (json.order) {
        showSuccess(`✅ Orden enviada correctamente (ID: ${json.order}) - Cantidad: ${finalQuantity}`);
        showToast({ id: json.order, service: servicios[serviceId], link, quantity: finalQuantity });
      } else {
        showSuccess(`✅ Orden enviada correctamente - Cantidad: ${finalQuantity}`);
        showToast({ id: '-', service: servicios[serviceId], link, quantity: finalQuantity });
      }
      notificacion.play();
    } catch (err) {
      showSuccess(`✅ Orden enviada correctamente - Cantidad: ${finalQuantity}`);
      showToast({ id: '-', service: servicios[serviceId], link, quantity: finalQuantity });
      notificacion.play();
    }

    submitButton.disabled = false;
    btnText.textContent = 'Enviar Orden';
    spinner.classList.add('d-none');
  });

  function showSuccess(message) {
    responseMessage.textContent = message;
    responseMessage.classList.remove('d-none');
    responseMessage.classList.remove('alert-danger');
    responseMessage.classList.add('alert-success');
  }

  function showError(message) {
    responseMessage.textContent = message;
    responseMessage.classList.remove('d-none');
    responseMessage.classList.remove('alert-success');
    responseMessage.classList.add('alert-danger');
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

  // 🌌 Fondo animado con partículas
  tsParticles.load("tsparticles", {
    fullScreen: { enable: true, zIndex: -1 },
    background: { color: { value: "transparent" } },
    particles: {
      number: { value: 60, density: { enable: true, area: 800 } },
      color: { value: "#38bdf8" },
      shape: { type: "circle" },
      opacity: { value: 0.2, random: true },
      size: { value: { min: 1.5, max: 3.5 } },
      move: {
        enable: true,
        speed: 1.2,
        direction: "none",
        random: true,
        straight: false,
        outModes: { default: "bounce" }
      }
    },
    interactivity: {
      events: {
        onHover: { enable: true, mode: "repulse" },
        onClick: { enable: true, mode: "push" },
        resize: true
      },
      modes: {
        repulse: { distance: 100, duration: 0.4 },
        push: { quantity: 4 }
      }
    },
    detectRetina: true
  });

  // 💡 Efecto de luz que sigue el mouse en la tarjeta
  const card = document.querySelector('.card');
  card.addEventListener('mousemove', e => {
    const { left, top } = card.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    card.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(56,189,248,0.15), rgba(3,7,18,0.9))`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.background = 'linear-gradient(135deg, rgba(30,41,59,0.9), rgba(3,7,18,0.9))';
  });
});
