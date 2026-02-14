const reveals = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

reveals.forEach((el) => revealObserver.observe(el));

const navLinks = document.querySelectorAll('nav a');
const current = document.body.dataset.page;
if (current) {
  navLinks.forEach((link) => {
    if (link.dataset.page === current) {
      link.classList.add('active');
    }
  });
}

const makeSparks = () => {
  const canvas = document.createElement('canvas');
  canvas.id = 'sparks';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  const mouse = { x: 0, y: 0 };
  const sparks = Array.from({ length: 50 }).map(() => ({
    x: Math.random(),
    y: Math.random(),
    radius: 1 + Math.random() * 2,
    vx: (Math.random() - 0.5) * 0.0006,
    vy: (Math.random() - 0.5) * 0.0006,
    hue: Math.random() > 0.5 ? 350 : 140,
  }));

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  };
  resize();
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  });

  const tick = () => {
    ctx.clearRect(0, 0, width, height);
    sparks.forEach((spark) => {
      spark.x += spark.vx;
      spark.y += spark.vy;
      if (spark.x < 0 || spark.x > 1) spark.vx *= -1;
      if (spark.y < 0 || spark.y > 1) spark.vy *= -1;

      const px = spark.x * width;
      const py = spark.y * height;
      const dx = mouse.x - px;
      const dy = mouse.y - py;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const glow = Math.max(0, 120 - dist) / 120;

      ctx.beginPath();
      ctx.fillStyle = `hsla(${spark.hue}, 85%, 55%, ${0.22 + glow * 0.5})`;
      ctx.arc(px, py, spark.radius + glow * 2, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(tick);
  };
  tick();
};

const setupRitualClick = () => {
  const brand = document.querySelector('.brand-logo');
  if (!brand) return;
  brand.addEventListener('click', () => {
    document.body.classList.add('ritual-flare');
    window.setTimeout(() => document.body.classList.remove('ritual-flare'), 1600);
  });
};

// Secrets removed.

// Gallery modal removed.

const setupRunePuzzle = () => {
  const puzzle = document.getElementById('rune-puzzle');
  if (!puzzle) return;

  let menu = document.getElementById('rune-menu');
  const downloadLink = document.getElementById('rune-download');
  const checkButton = document.getElementById('rune-check');
  const mixButton = document.getElementById('rune-mix');

  if (!menu) {
    menu = document.createElement('div');
    menu.id = 'rune-menu';
    menu.className = 'puzzle-menu';
    menu.innerHTML = `
      <div class="puzzle-menu__content">
        <div class="puzzle-menu__title">Сегодня удача на вашей стороне</div>
        <a class="puzzle-menu__download" id="rune-download" href="#" download="roseville_ticket.png">Скачать талон PNG</a>
      </div>
    `;
    document.body.appendChild(menu);
  }

  const downloadAnchor = menu.querySelector('#rune-download');

  const goal = [
    { symbol: 'ᚱ', number: 1 },
    { symbol: 'ᚢ', number: 2 },
    { symbol: 'ᚾ', number: 3 },
    { symbol: 'ᛟ', number: 4 },
    { symbol: 'ᚾ', number: 5 },
    { symbol: 'ᚨ', number: 6 },
    { symbol: 'ᛏ', number: 7 },
    { symbol: 'ᚢ', number: 8 },
    { symbol: 'ᛁ', number: 9 },
    { symbol: 'ᚱ', number: 10 },
    { symbol: 'ᚨ', number: 11 },
    { symbol: 'ᛋ', number: 12 },
    { symbol: 'ᛏ', number: 13 },
    { symbol: 'ᛖ', number: 14 },
    { symbol: 'ᚱ', number: 15 },
    { symbol: '', number: null },
  ];

  let tiles = goal.map((tile) => ({ ...tile }));

  const shuffle = (arr) => {
    for (let i = arr.length - 2; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    if (arr.every((value, index) => value.number === goal[index].number)) {
      [arr[0], arr[1]] = [arr[1], arr[0]];
    }
  };

  const isSolved = () =>
    tiles.every((value, index) => value.number === goal[index].number);

  const render = () => {
    puzzle.innerHTML = '';
    tiles.forEach((value, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `puzzle-tile ${value.number ? '' : 'puzzle-empty'}`;
      if (value.number) {
        const number = document.createElement('span');
        number.className = 'puzzle-number';
        number.textContent = value.number;
        button.appendChild(number);
      }
      button.appendChild(document.createTextNode(value.symbol));
      button.dataset.index = index;
      if (!value.number) button.setAttribute('aria-hidden', 'true');
      puzzle.appendChild(button);
    });
  };

  const move = (index) => {
    const emptyIndex = tiles.findIndex((value) => !value.number);
    const row = Math.floor(index / 4);
    const col = index % 4;
    const emptyRow = Math.floor(emptyIndex / 4);
    const emptyCol = emptyIndex % 4;
    const isAdjacent = Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1;
    if (!isAdjacent) return;
    [tiles[index], tiles[emptyIndex]] = [tiles[emptyIndex], tiles[index]];
    render();
  };

  puzzle.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.classList.contains('puzzle-tile')) return;
    if (target.classList.contains('puzzle-empty')) return;
    const index = Number(target.dataset.index);
    move(index);
  });

  const makeTicket = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 560;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#050806';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#22090f');
    gradient.addColorStop(1, '#0b1410');
    ctx.fillStyle = gradient;
    ctx.fillRect(20, 20, canvas.width - 40, canvas.height - 40);

    ctx.strokeStyle = '#ff2b4a';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    ctx.fillStyle = '#d7f7d2';
    ctx.font = '28px "Cormorant Garamond", serif';
    ctx.fillText('Поздравляю, удача на вашей стороне.', 60, 140);
    ctx.fillText('Талончик на запись к М-сье Дювалю', 60, 200);

    const weekdays = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье'];
    const dayText = weekdays[Math.floor(Math.random() * weekdays.length)];

    const eveningHours = [17, 18, 19, 20, 21, 22];
    const hour = Math.random() < 0.75
      ? eveningHours[Math.floor(Math.random() * eveningHours.length)]
      : 10 + Math.floor(Math.random() * 6);
    const minute = Math.random() > 0.5 ? '00' : '30';
    const time = `${hour}:${minute}`;
    ctx.fillStyle = '#ff2b4a';
    ctx.font = '32px "Cinzel", serif';
    ctx.fillText(`День: ${dayText}`, 60, 270);
    ctx.fillText(`Время: ${time}`, 60, 330);

    ctx.fillStyle = 'rgba(255, 43, 74, 0.4)';
    ctx.font = '18px "Cinzel", serif';
    ctx.fillText('ROSEVILLE • ESTATE PASS', 60, 400);

    return canvas.toDataURL('image/png');
  };

  if (checkButton) {
    checkButton.textContent = 'Попытать удачу';
    checkButton.addEventListener('click', () => {
      if (isSolved()) {
        const lucky = Math.random() < 0.6;
        const title = menu?.querySelector('.puzzle-menu__title');
        if (lucky) {
          if (title) title.textContent = 'Сегодня удача на вашей стороне';
          menu?.classList.add('show');
          checkButton.classList.add('success');
          checkButton.textContent = 'Собрано';
          if (downloadAnchor) {
            const dataUrl = makeTicket();
            if (dataUrl) downloadAnchor.href = dataUrl;
            downloadAnchor.style.display = 'inline-flex';
          }
        } else {
          if (title) title.textContent = 'Духи сегодня не на вашей стороне';
          menu?.classList.add('show');
          checkButton.classList.remove('success');
          checkButton.textContent = 'Попытать удачу';
          if (downloadAnchor) downloadAnchor.style.display = 'none';
        }
      } else {
        checkButton.classList.remove('success');
        checkButton.textContent = 'Попытать удачу';
      }
    });
  }

  if (mixButton) {
    mixButton.addEventListener('click', () => {
      shuffle(tiles);
      render();
      menu?.classList.remove('show');
      if (checkButton) {
        checkButton.classList.remove('success');
        checkButton.textContent = 'Попытать удачу';
      }
    });
  }

  shuffle(tiles);
  render();
};

const drawRitualStamp = (ctx) => {
  const x = 520;
  const y = 380;
  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = '#d7f7d2';
  ctx.font = '14px "Courier New", monospace';
  const art = [
    '⠀⠀⠀⠀⠀⢀⣶⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⡄⠀⠀⠀⠀⠀',
    '⠀⠀⠀⠀⠀⣼⣿⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⣿⣧⠀⠀⠀⠀⠀',
    '⠀⠀⠀⠀⢰⣿⣿⠻⣷⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⣸⡿⣿⣿⡄⣶⠀⠀⠀',
    '⠀⠀⣶⡀⣼⣿⡇⠀⠀⢆⡆⠀⠀⢀⠀⢀⠀⠀⢀⡇⢀⠋⠀⢹⣿⣿⣿⠀⠀⠀',
    '⠀⠀⣿⣿⣿⣿⠇⠀⠀⠘⡝⢤⡠⠜⠀⠀⠓⢲⠊⠀⡜⠀⠀⠘⣿⡿⢻⡆⠀⠀',
    '⠀⠀⢿⠙⢿⡿⠀⠀⠀⠀⠓⠚⡖⠂⠀⠀⠉⢹⠁⠒⠃⠀⠀⠀⠉⠁⠀⡇⠀⠀',
    '⠀⠀⠘⡄⠀⠀⢀⣀⣀⣀⣀⠀⠁⠀⠀⠀⠀⠀⠀⠀⣀⣀⣀⣀⠀⠀⠀⡇⠀⠀',
    '⠀⠀⠀⡇⣠⡺⢍⡀⠀⠀⠀⠉⠢⡀⠀⠀⢀⡴⠊⠉⠀⠀⠀⢀⡭⣑⠢⡇⠀⠀',
    '⠀⠀⢰⡏⡎⢰⠀⠈⡄⠀⠀⠀⠀⡇⠀⠀⠸⡀⠀⠀⠀⠀⠰⠁⢰⠀⢱⠈⡆⠀',
    '⠀⢀⡏⠣⡣⣀⣃⡠⠃⠀⠀⢀⠜⠁⠀⠀⠀⠙⠢⢄⣀⣀⣐⣄⣘⣠⡮⠜⠁⠀',
    '⠀⢸⠀⡴⠊⠉⠑⣤⠶⢖⡊⠁⠀⠀⠀⠀⠀⠀⠀⢀⣠⠜⣏⠝⠈⠀⠀⠀⠀⠀',
    '⠀⡟⢠⠨⠔⠒⠊⠁⠑⡘⡌⢉⢶⠒⠒⡲⡒⠒⡞⡅⡘⢳⠊⠀⠀⠀⠀⡇⠀⠀',
    '⢸⠁⠀⠀⠀⠀⠀⠀⠀⠀⠙⢇⠀⢇⡰⠁⠱⣰⠀⡸⠗⠁⠀⠀⠀⠀⠀⠇⠀⠀',
    '⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠘⠓⠐⠒⠓⠉⠀⠀⠀⠀⠀⠀⠀⢰⠀⠀⠀',
    '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡸⠀⠀⠀',
  ];
  art.forEach((line, index) => {
    ctx.fillText(line, x, y + index * 16);
  });
  ctx.restore();
};

const setupMarketplace = () => {
  const markets = document.querySelectorAll('[data-marketplace]');
  if (!markets.length) return;

  markets.forEach((market) => {
    const itemsEl = market.querySelector('.cart-items');
    const totalEl = market.querySelector('.cart-total');
    const emptyEl = market.querySelector('.cart-empty');
    const printBtn = market.querySelector('.cart-print');
    const currency = market.dataset.currency || 'RUB';
    const cart = [];

    const formatPrice = (value) => {
      if (!Number.isFinite(value) || value === 0 || currency === 'NONE') return '';
      if (currency === 'USD') return `$${value}`;
      return `${value} р.`;
    };

    const render = () => {
      if (!itemsEl) return;
      itemsEl.innerHTML = '';
      let total = 0;
      cart.forEach((item) => {
        total += item.price * item.qty;
        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `
          <div>
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-meta">${item.qty}${item.price ? ` × ${formatPrice(item.price)}` : ''}</div>
          </div>
          <button class="cart-remove" type="button" data-name="${item.name}">Убрать</button>
        `;
        itemsEl.appendChild(row);
      });
      if (totalEl) {
        if (currency === 'NONE') {
          totalEl.textContent = `${cart.reduce((sum, item) => sum + item.qty, 0)}`;
        } else {
          totalEl.textContent = currency === 'USD' ? `$${total}` : `${total} р.`;
        }
      }
      if (emptyEl) emptyEl.style.display = cart.length ? 'none' : 'block';
      if (printBtn) printBtn.disabled = cart.length === 0;
    };

    const addItem = (name, price) => {
      const existing = cart.find((item) => item.name === name);
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({ name, price: Number(price || 0), qty: 1 });
      }
      render();
    };

    const removeItem = (name) => {
      const index = cart.findIndex((item) => item.name === name);
      if (index === -1) return;
      if (cart[index].qty > 1) {
        cart[index].qty -= 1;
      } else {
        cart.splice(index, 1);
      }
      render();
    };

    const makeReceipt = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 860;
      canvas.height = 680;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.fillStyle = '#050806';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0b1410';
      ctx.fillRect(20, 20, canvas.width - 40, canvas.height - 40);
      ctx.strokeStyle = '#ff2b4a';
      ctx.lineWidth = 3;
      ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

      ctx.fillStyle = '#d7f7d2';
      ctx.font = '28px "Cinzel", serif';
      ctx.fillText(currency === 'NONE' ? 'Список ритуалов' : 'Чек Roseville', 60, 90);

      const date = new Date();
      const dateText = date.toLocaleDateString('ru-RU');
      const timeText = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      ctx.font = '18px "Cormorant Garamond", serif';
      ctx.fillText(`Дата: ${dateText}   Время: ${timeText}`, 60, 130);

      let y = 190;
      ctx.font = '22px "Cormorant Garamond", serif';
      cart.forEach((item) => {
        ctx.fillText(`${item.name} × ${item.qty}`, 60, y);
        if (currency !== 'NONE') {
          const linePrice = item.price * item.qty;
          ctx.fillText(currency === 'USD' ? `$${linePrice}` : `${linePrice} р.`, 680, y);
        }
        y += 36;
      });

      if (currency !== 'NONE') {
        const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        y += 16;
        ctx.strokeStyle = 'rgba(255, 43, 74, 0.6)';
        ctx.beginPath();
        ctx.moveTo(60, y);
        ctx.lineTo(800, y);
        ctx.stroke();
        y += 40;
        ctx.font = '26px "Cinzel", serif';
        ctx.fillStyle = '#ff2b4a';
        ctx.fillText(`Итого: $${total}`, 60, y);

        const bank = Math.random() > 0.5 ? 'Voxsa' : 'VeestarCard';
        const proofUrl = `receipt-verify.html#${bank.toLowerCase()}`;
        const qrX = 620;
        const qrY = 440;
        const qrSize = 180;
        const cell = Math.floor(qrSize / 21);
        ctx.fillStyle = '#0b1410';
        ctx.fillRect(qrX - 6, qrY - 6, cell * 21 + 12, cell * 21 + 12);
        ctx.fillStyle = '#ff2b4a';
        ctx.fillRect(qrX, qrY, cell * 21, cell * 21);
        const hashSeed = Array.from(proofUrl).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
        for (let row = 0; row < 21; row += 1) {
          for (let col = 0; col < 21; col += 1) {
            const isFinder =
              (row < 7 && col < 7) ||
              (row < 7 && col > 13) ||
              (row > 13 && col < 7);
            const value = (hashSeed + row * 31 + col * 17) % 3 === 0;
            if (isFinder || value) {
              ctx.fillStyle = '#050806';
              ctx.fillRect(qrX + col * cell + 2, qrY + row * cell + 2, cell - 4, cell - 4);
            }
          }
        }
        // QR points to receipt-verify.html; text moved to the verification page.
      } else {
        ctx.fillStyle = '#d7f7d2';
        ctx.font = '18px "Cormorant Garamond", serif';
        ctx.fillText('Ритуалы опасны. Несоблюдение правил ведет к последствиям.', 60, 470);
        ctx.fillText('Оплата не принимается — цену назовет мастер.', 60, 510);
      }

      if (currency === 'NONE') {
        drawRitualStamp(ctx);
      }
      return canvas.toDataURL('image/png');
    };

    market.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      if (target.classList.contains('product-add')) {
        const card = target.closest('.product-card');
        if (!card) return;
        const name = card.dataset.name || 'Товар';
        const price = Number(card.dataset.price || 0);
        addItem(name, price);
      }

      if (target.classList.contains('cart-remove')) {
        const name = target.dataset.name;
        if (name) removeItem(name);
      }
    });

    if (printBtn) {
      printBtn.addEventListener('click', () => {
        if (!cart.length) return;
        const dataUrl = makeReceipt();
        if (!dataUrl) return;
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'roseville_receipt.png';
        link.click();
      });
    }

    render();
  });
};

const setupMapToggle = () => {
  const mapFrame = document.querySelector('.map-frame.map-collapsed');
  if (!mapFrame) return;
  const button = mapFrame.querySelector('.map-toggle');
  if (!button) return;
  button.addEventListener('click', () => {
    mapFrame.classList.toggle('map-collapsed');
    button.textContent = mapFrame.classList.contains('map-collapsed')
      ? 'Открыть карту'
      : 'Свернуть карту';
  });
};

makeSparks();
setupRitualClick();
setupRunePuzzle();
setupMarketplace();
setupMapToggle();
