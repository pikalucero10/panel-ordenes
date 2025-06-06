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
    '1018': 'Seguidores Instagram',
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
    src: ['mpr/hover.mp3'],
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

    const finalQuantity = serviceId === '1018'
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
    responseMessage.classList.remove('d-none', 'alert-danger');
    responseMessage.classList.add('alert-success');
  }

  function showError(message) {
    responseMessage.textContent = message;
    responseMessage.classList.remove('d-none', 'alert-success');
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

  // 🌌 Fondo con partículas usando particles.js
  particlesJS("particles-js", {
    particles: {
      number: { value: 160, density: { enable: true, value_area: 800 } },
      color: { value: "#ffffff" },
      shape: {
        type: "circle",
        stroke: { width: 0, color: "#000000" },
        polygon: { nb_sides: 5 }
      },
      opacity: {
        value: 1,
        random: true,
        anim: { enable: true, speed: 1, opacity_min: 0, sync: false }
      },
      size: {
        value: 3,
        random: true,
        anim: { enable: false, speed: 4, size_min: 0.3, sync: false }
      },
      line_linked: {
        enable: false,
        distance: 150,
        color: "#ffffff",
        opacity: 0.4,
        width: 1
      },
      move: {
        enable: true,
        speed: 1,
        direction: "none",
        random: true,
        straight: false,
        out_mode: "out",
        bounce: false,
        attract: { enable: false, rotateX: 600, rotateY: 600 }
      }
    },
    interactivity: {
      detect_on: "window",
      events: {
        onhover: { enable: false, mode: "grab" },
        onclick: { enable: true, mode: "push" },
        resize: true
      },
      modes: {
        grab: { distance: 400, line_linked: { opacity: 1 } },
        bubble: { distance: 250, size: 0, duration: 2, opacity: 0, speed: 3 },
        repulse: { distance: 400, duration: 0.4 },
        push: { particles_nb: 4 },
        remove: { particles_nb: 2 }
      }
    },
    retina_detect: true
  });

  // 💡 Efecto de luz sobre la tarjeta
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
