// Coffee Land - Main Application Script

document.addEventListener('DOMContentLoaded', () => {
  // --- STATE ---
  let cart = JSON.parse(localStorage.getItem('coffeeland_cart')) || [];
  
  // Customizer state defaults
  const customizerState = {
    baseDrink: 'espresso', // espresso, matcha, cocoa
    size: 'medium', // small, medium, large
    milk: 'whole', // whole, oat, almond, none
    sweetness: '50', // 0, 50, 100
    extras: {
      cream: false,
      caramel: false,
      extraShot: false,
      cinnamon: false
    }
  };

  // Brewing guides data
  const brewGuides = {
    pour_over: {
      title: 'Pour Over (Chemex / V60)',
      desc: 'A clean, bright cup highlighting origin notes. Requires patience and precision.',
      totalTime: 180, // 3 minutes total
      steps: [
        { id: 1, duration: 30, title: 'Blooming the Grounds', desc: 'Pour 60g water to wet beans. Watch them bloom and expand.' },
        { id: 2, duration: 90, title: 'The Main Pour', desc: 'Pour in steady spirals, keeping the water level consistent.' },
        { id: 3, duration: 60, title: 'Final Drip Down', desc: 'Let the remaining water filter through completely. Enjoy!' }
      ]
    },
    french_press: {
      title: 'French Press',
      desc: 'Robust, full-bodied coffee with rich natural oils. Direct immersion brewing.',
      totalTime: 240, // 4 minutes total
      steps: [
        { id: 1, duration: 60, title: 'First Immersion & Bloom', desc: 'Pour hot water halfway, stir gently, and let sit for 1 minute.' },
        { id: 2, duration: 120, title: 'The Long Steep', desc: 'Fill to the top, place lid on (do not plunge), and wait 2 minutes.' },
        { id: 3, duration: 60, title: 'Plunge & Serve', desc: 'Press the plunger down slowly with consistent weight. Pour immediately.' }
      ]
    },
    espresso: {
      title: 'Double Espresso Shot',
      desc: 'Concentrated coffee brewed under pressure. Complex, intense, and sweet.',
      totalTime: 30, // 30 seconds
      steps: [
        { id: 1, duration: 8, title: 'Pre-Infusion', desc: 'Hot water gently saturates the puck under low pressure.' },
        { id: 2, duration: 15, title: 'Main Extraction', desc: 'High pressure forces water through, extracting rich oils.' },
        { id: 3, duration: 7, title: 'Blonding Phase', desc: 'The stream lightens. Stop extraction to prevent bitterness.' }
      ]
    }
  };

  let activeBrewKey = 'pour_over';
  let brewTimerInterval = null;
  let brewTimeElapsed = 0;
  let isBrewTimerRunning = false;

  // --- MENU ITEMS DATABASE ---
  const menuItems = [
    {
      id: 'espresso-double',
      name: 'Double Espresso',
      category: 'espresso',
      price: 3.50,
      desc: 'Rich, intense, double shot of espresso made with our house organic beans.',
      image: 'assets/images/menu_espresso.png',
      badge: 'Classic',
      temp: 'Hot',
      size: '2oz'
    },
    {
      id: 'flat-white',
      name: 'Signature Flat White',
      category: 'espresso',
      price: 4.50,
      desc: 'Velvety micro-foam milk poured over double ristretto shots for smooth, robust flavor.',
      image: 'assets/images/menu_latte.png',
      badge: 'Popular',
      temp: 'Hot',
      size: '8oz'
    },
    {
      id: 'house-cold-brew',
      name: 'House Cold Brew',
      category: 'cold-brews',
      price: 4.80,
      desc: 'Steeped for 18 hours in cold water, presenting a low-acid, chocolatey finish.',
      image: 'assets/images/menu_cold_brew.png',
      badge: 'Refreshing',
      temp: 'Cold',
      size: '16oz'
    },
    {
      id: 'pourover-single',
      name: 'Single Origin Pour Over',
      category: 'specials',
      price: 5.50,
      desc: 'Rotating single-origin beans hand-poured through Chemex, highlighting natural fruity notes.',
      image: 'assets/images/brew_pour_over.png',
      badge: 'Premium',
      temp: 'Hot',
      size: '12oz'
    },
    {
      id: 'vanilla-iced-latte',
      name: 'Iced Madagascar Vanilla Latte',
      category: 'cold-brews',
      price: 5.20,
      desc: 'Our house cold espresso mixed with creamy milk, ice, and house-made vanilla bean syrup.',
      image: 'assets/images/menu_latte.png',
      badge: 'Sweet',
      temp: 'Cold',
      size: '16oz'
    },
    {
      id: 'ceramic-latte',
      name: 'Classic Caffe Latte',
      category: 'espresso',
      price: 4.25,
      desc: 'A double shot of espresso topped with a generous layer of steamed milk and artful foam.',
      image: 'assets/images/hero_latte.png',
      badge: '',
      temp: 'Hot',
      size: '12oz'
    }
  ];

  // --- SELECTORS ---
  // Nav
  const header = document.querySelector('header');
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinksList = document.querySelector('.nav-links');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section');

  // Menu Filters
  const menuFiltersContainer = document.querySelector('.menu-filters');
  const menuGrid = document.querySelector('.menu-grid');

  // Cart Drawer
  const cartIconBtn = document.querySelector('.cart-icon-btn');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartCloseBtn = document.querySelector('.cart-close-btn');
  const drawerOverlay = document.querySelector('.drawer-overlay');
  const cartItemsContainer = document.querySelector('.cart-items');
  const cartBadge = document.querySelector('.cart-badge');
  const cartSubtotalEl = document.getElementById('cart-subtotal');
  const cartTaxEl = document.getElementById('cart-tax');
  const cartTotalEl = document.getElementById('cart-total');
  const checkoutBtn = document.querySelector('.checkout-btn');

  // Customizer Controls
  const customizerCup = document.querySelector('.svg-cup');
  const addCustomizerBtn = document.getElementById('add-customizer-btn');
  const customizerNameInput = document.getElementById('customizer-name');
  
  // Brewing Guide
  const brewTabButtons = document.querySelectorAll('.brew-tab-btn');
  const brewDisplayTitle = document.querySelector('.brew-display-title');
  const brewDisplayDesc = document.querySelector('.brew-display-desc');
  const brewStepsContainer = document.querySelector('.brew-steps');
  const timerClock = document.querySelector('.timer-clock');
  const timerProgressBar = document.querySelector('.timer-progress-bar');
  const timerBtn = document.querySelector('.timer-btn');

  // Contact / Shop Status
  const statusBadge = document.getElementById('shop-status');
  const contactForm = document.getElementById('contact-form');
  const formFeedback = document.getElementById('form-feedback');

  // Checkout Modal
  const checkoutModal = document.getElementById('checkout-modal');
  const checkoutCloseBtn = checkoutModal.querySelector('.modal-close-btn');
  const checkoutForm = document.getElementById('checkout-form');
  const pickupTab = document.getElementById('tab-pickup');
  const deliveryTab = document.getElementById('tab-delivery');
  const addressGroup = document.getElementById('address-group');
  const checkoutItemsSummary = document.getElementById('checkout-items-summary');
  const checkoutTotalEl = document.getElementById('checkout-total');

  // Success Modal
  const successModal = document.getElementById('success-modal');
  const successCloseBtn = successModal.querySelector('.modal-close-btn');
  const successReceipt = document.getElementById('success-receipt');
  const confirmBtn = document.getElementById('confirm-btn');

  // --- INITIALIZE SITE ---
  initMenu();
  updateCartUI();
  updateShopStatus();
  updateCustomizerCup();
  initBrewGuide();

  // --- MOBILE NAV ---
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('open');
    navLinksList.classList.toggle('open');
  });

  // Close nav on link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('open');
      navLinksList.classList.remove('open');
    });
  });

  // Sticky header on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    highlightNavOnScroll();
  });

  // Highlight Nav Link on Scroll
  function highlightNavOnScroll() {
    let scrollPos = window.scrollY + 150;
    sections.forEach(section => {
      if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${section.id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  // --- BUSINESS STATUS ---
  function updateShopStatus() {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Open from 8:00 (8) to 22:00 (22)
    if (currentHour >= 8 && currentHour < 22) {
      statusBadge.className = 'status-badge open';
      statusBadge.innerHTML = '<span class="status-dot"></span>Open Now (Closes at 10 PM)';
    } else {
      statusBadge.className = 'status-badge closed';
      statusBadge.innerHTML = '<span class="status-dot"></span>Closed (Opens at 8 AM)';
    }
  }

  // --- RENDER MENU & FILTERS ---
  function initMenu() {
    renderMenuItems('all');

    menuFiltersContainer.addEventListener('click', (e) => {
      if (!e.target.classList.contains('filter-btn')) return;
      
      // Update active filter class
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');

      const category = e.target.getAttribute('data-filter');
      renderMenuItems(category);
    });
  }

  function renderMenuItems(category) {
    const filtered = category === 'all' 
      ? menuItems 
      : menuItems.filter(item => item.category === category);

    menuGrid.innerHTML = '';
    
    filtered.forEach(item => {
      const card = document.createElement('article');
      card.className = 'menu-card';
      card.innerHTML = `
        <div class="menu-card-img-wrapper">
          <img src="${item.image}" alt="${item.name}" class="menu-card-img" loading="lazy">
          ${item.badge ? `<span class="menu-card-badge">${item.badge}</span>` : ''}
        </div>
        <div class="menu-card-content">
          <div class="menu-card-header">
            <h3 class="menu-card-title">${item.name}</h3>
            <span class="menu-card-price">$${item.price.toFixed(2)}</span>
          </div>
          <p class="menu-card-desc">${item.desc}</p>
          <div class="menu-card-footer">
            <div class="menu-card-meta">
              <span>
                <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                ${item.size}
              </span>
              <span>
                <svg viewBox="0 0 24 24"><path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm0 2.27L19.46 12H17v6h-2v-6H9v6H7v-6H4.54L12 5.27z"/></svg>
                ${item.temp}
              </span>
            </div>
            <button class="add-to-cart-btn" data-id="${item.id}" aria-label="Add ${item.name} to cart">
              <svg><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>
            </button>
          </div>
        </div>
      `;
      menuGrid.appendChild(card);
    });

    // Add click events to newly created cart buttons
    menuGrid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        addToCart(id);
      });
    });
  }

  // --- CART OPERATIONS ---
  cartIconBtn.addEventListener('click', toggleCartDrawer);
  cartCloseBtn.addEventListener('click', toggleCartDrawer);
  drawerOverlay.addEventListener('click', toggleCartDrawer);

  function toggleCartDrawer() {
    cartDrawer.classList.toggle('open');
    drawerOverlay.classList.toggle('open');
  }

  function addToCart(id) {
    const item = menuItems.find(p => p.id === id);
    if (!item) return;

    // Check if item already exists in cart with no customizations
    const existing = cart.find(cartItem => cartItem.id === id && !cartItem.customized);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: 1,
        customized: false
      });
    }

    updateCartUI();
    // Open drawer to notify user
    cartDrawer.classList.add('open');
    drawerOverlay.classList.add('open');
    
    // Visual button bounce effect on cart button
    cartIconBtn.style.transform = 'scale(1.15)';
    setTimeout(() => cartIconBtn.style.transform = '', 300);
  }

  function updateCartUI() {
    localStorage.setItem('coffeeland_cart', JSON.stringify(cart));
    
    // Update badge count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (totalItems > 0) {
      cartBadge.textContent = totalItems;
      cartBadge.classList.add('show');
    } else {
      cartBadge.classList.remove('show');
    }

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="cart-empty-message">
          <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          <p>Your cart is empty.</p>
          <p style="font-size:0.85rem; margin-top:5px;">Add some fresh brews!</p>
        </div>
      `;
      checkoutBtn.disabled = true;
      checkoutBtn.style.opacity = '0.5';
      checkoutBtn.style.cursor = 'not-allowed';
    } else {
      cartItemsContainer.innerHTML = '';
      checkoutBtn.disabled = false;
      checkoutBtn.style.opacity = '1';
      checkoutBtn.style.cursor = 'pointer';

      cart.forEach((item, index) => {
        const cartItemEl = document.createElement('div');
        cartItemEl.className = 'cart-item';
        cartItemEl.innerHTML = `
          <img src="${item.image}" alt="${item.name}" class="cart-item-img">
          <div class="cart-item-details">
            <h4 class="cart-item-name">${item.name}</h4>
            ${item.customDetails ? `<div class="cart-item-customizations">${item.customDetails}</div>` : ''}
            <div class="cart-item-row">
              <div class="qty-selector">
                <button class="qty-btn minus" data-index="${index}">-</button>
                <span class="qty-val">${item.quantity}</span>
                <button class="qty-btn plus" data-index="${index}">+</button>
              </div>
              <span class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
            <button class="cart-item-remove" data-index="${index}" style="margin-top:8px;">
              <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg> Remove
            </button>
          </div>
        `;
        cartItemsContainer.appendChild(cartItemEl);
      });

      // Cart items action listeners
      cartItemsContainer.querySelectorAll('.qty-btn.plus').forEach(btn => {
        btn.addEventListener('click', () => {
          const index = btn.getAttribute('data-index');
          cart[index].quantity += 1;
          updateCartUI();
        });
      });

      cartItemsContainer.querySelectorAll('.qty-btn.minus').forEach(btn => {
        btn.addEventListener('click', () => {
          const index = btn.getAttribute('data-index');
          if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
          } else {
            cart.splice(index, 1);
          }
          updateCartUI();
        });
      });

      cartItemsContainer.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', () => {
          const index = btn.getAttribute('data-index');
          cart.splice(index, 1);
          updateCartUI();
        });
      });
    }

    // Totals calculations
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08; // 8% sales tax
    const total = subtotal + tax;

    cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    cartTaxEl.textContent = `$${tax.toFixed(2)}`;
    cartTotalEl.textContent = `$${total.toFixed(2)}`;
  }

  // --- DRINK CUSTOMIZER WIDGET ---
  // Option Selectors listeners
  document.querySelectorAll('input[name="cust-base"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      customizerState.baseDrink = e.target.value;
      
      // Update selected value text display
      document.getElementById('base-selected-text').textContent = 
        e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1);

      // Default the name in input if they haven't typed a custom one
      updateDefaultCustomName();
      updateCustomizerCup();
    });
  });

  document.querySelectorAll('input[name="cust-size"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      customizerState.size = e.target.value;
      document.getElementById('size-selected-text').textContent = 
        e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1);
      updateCustomizerCup();
    });
  });

  const milkSelector = document.getElementById('cust-milk');
  milkSelector.addEventListener('change', (e) => {
    customizerState.milk = e.target.value;
    updateCustomizerCup();
  });

  const sweetnessSlider = document.getElementById('cust-sweetness');
  sweetnessSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    customizerState.sweetness = val;
    let label = 'Medium Sweet';
    if (val === '0') label = 'Unsweetened';
    if (val === '100') label = 'Fully Sweet';
    document.getElementById('sweet-selected-text').textContent = label;
  });

  // Extras Checkboxes
  document.querySelectorAll('.checkbox-item input').forEach(box => {
    box.addEventListener('change', (e) => {
      const extraKey = e.target.value;
      customizerState.extras[extraKey] = e.target.checked;
      updateCustomizerCup();
    });
  });

  // Computes Custom Drink pricing dynamically
  function calculateCustomPrice() {
    let basePrice = 3.50; // default espresso
    if (customizerState.baseDrink === 'matcha') basePrice = 4.50;
    if (customizerState.baseDrink === 'cocoa') basePrice = 4.00;

    let sizeCost = 0.00;
    if (customizerState.size === 'medium') sizeCost = 0.60;
    if (customizerState.size === 'large') sizeCost = 1.10;

    let milkCost = 0.00;
    if (customizerState.milk === 'oat' || customizerState.milk === 'almond') {
      milkCost = 0.60;
    }

    let extrasCost = 0;
    Object.keys(customizerState.extras).forEach(key => {
      if (customizerState.extras[key]) {
        // dynamic additions pricing
        if (key === 'extraShot') extrasCost += 1.00;
        else extrasCost += 0.50; // caramel, whipped cream, cinnamon
      }
    });

    return basePrice + sizeCost + milkCost + extrasCost;
  }

  function updateDefaultCustomName() {
    if (customizerNameInput.value.trim() === '' || customizerNameInput.dataset.userEdited === 'false') {
      const drinkName = customizerState.baseDrink.charAt(0).toUpperCase() + customizerState.baseDrink.slice(1);
      customizerNameInput.value = `My Special Custom ${drinkName}`;
      customizerNameInput.dataset.userEdited = 'false';
    }
  }

  customizerNameInput.addEventListener('input', () => {
    customizerNameInput.dataset.userEdited = 'true';
    if (customizerNameInput.value.trim() === '') {
      customizerNameInput.dataset.userEdited = 'false';
      updateDefaultCustomName();
    }
  });

  // Updates SVG cup states, colors and visual styles in real-time
  function updateCustomizerCup() {
    const finalPrice = calculateCustomPrice();
    document.getElementById('custom-price').textContent = `$${finalPrice.toFixed(2)}`;

    // 1. Set drink color class
    customizerCup.className.baseVal = `svg-cup ${customizerState.baseDrink}-liquid`;
    
    const fillLiquid = customizerCup.querySelector('.cup-liquid-espresso');
    if (customizerState.baseDrink === 'espresso') {
      fillLiquid.style.fill = '#2b1509'; // Rich espresso brown
    } else if (customizerState.baseDrink === 'matcha') {
      fillLiquid.style.fill = '#688c52'; // Earthy matcha green
    } else if (customizerState.baseDrink === 'cocoa') {
      fillLiquid.style.fill = '#4a2b16'; // Rich milk chocolate brown
    }

    // Adjust milk swirl mixing color based on milk type selected
    if (customizerState.milk !== 'none') {
      customizerCup.classList.add('has-milk');
    } else {
      customizerCup.classList.remove('has-milk');
    }

    // 2. Size scale effect
    let scaleVal = 0.85; // small
    if (customizerState.size === 'medium') scaleVal = 1.0;
    if (customizerState.size === 'large') scaleVal = 1.15;
    customizerCup.style.transform = `scale(${scaleVal})`;

    // 3. Extras layers toggle
    // Whipped Cream
    if (customizerState.extras.cream) {
      customizerCup.classList.add('has-cream');
    } else {
      customizerCup.classList.remove('has-cream');
    }

    // Caramel Drizzle
    if (customizerState.extras.caramel) {
      customizerCup.classList.add('has-caramel');
    } else {
      customizerCup.classList.remove('has-caramel');
    }

    // Foam Layer (Milk selection updates foam opacity)
    if (customizerState.milk !== 'none') {
      customizerCup.classList.add('has-foam');
    } else {
      customizerCup.classList.remove('has-foam');
    }
  }

  // Add Custom Drink to Cart Action
  addCustomizerBtn.addEventListener('click', () => {
    const price = calculateCustomPrice();
    const drinkName = customizerNameInput.value.trim() || 'Custom Crafted Cup';
    
    // Assemble details list
    const details = [];
    details.push(`Size: ${customizerState.size.charAt(0).toUpperCase() + customizerState.size.slice(1)}`);
    details.push(`Milk: ${customizerState.milk.charAt(0).toUpperCase() + customizerState.milk.slice(1)}`);
    details.push(`Sweetness: ${customizerState.sweetness}%`);
    
    const extrasList = [];
    if (customizerState.extras.cream) extrasList.push('Whipped Cream');
    if (customizerState.extras.caramel) extrasList.push('Caramel Drizzle');
    if (customizerState.extras.extraShot) extrasList.push('Extra Espresso Shot');
    if (customizerState.extras.cinnamon) extrasList.push('Dust of Cinnamon');
    
    if (extrasList.length > 0) {
      details.push(`Extras: ${extrasList.join(', ')}`);
    }

    const uniqueId = `custom-${Date.now()}`;
    
    cart.push({
      id: uniqueId,
      name: drinkName,
      price: price,
      image: 'assets/images/menu_latte.png', // custom drink representation
      quantity: 1,
      customized: true,
      customDetails: details.join(' | ')
    });

    updateCartUI();
    toggleCartDrawer(); // open the cart drawer

    // Button animation feedback
    addCustomizerBtn.style.transform = 'scale(0.95)';
    setTimeout(() => addCustomizerBtn.style.transform = '', 150);
  });

  // --- BREWING GUIDE WIDGET ---
  function initBrewGuide() {
    renderBrewDisplay();

    brewTabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        brewTabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        activeBrewKey = btn.getAttribute('data-brew');
        resetBrewTimer();
        renderBrewDisplay();
      });
    });
  }

  function renderBrewDisplay() {
    const data = brewGuides[activeBrewKey];
    brewDisplayTitle.textContent = data.title;
    brewDisplayDesc.textContent = data.desc;
    
    // Reset timer label
    const minutes = Math.floor(data.totalTime / 60);
    const seconds = data.totalTime % 60;
    timerClock.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    timerProgressBar.style.width = '0%';
    
    // Set timer button play icon
    timerBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';

    // Render Steps
    brewStepsContainer.innerHTML = '';
    data.steps.forEach((step, index) => {
      const stepEl = document.createElement('div');
      stepEl.className = `brew-step ${index === 0 ? 'active' : ''}`;
      stepEl.setAttribute('data-step', index);
      stepEl.innerHTML = `
        <div class="brew-step-number">${step.id}</div>
        <div class="brew-step-text">
          <h4>${step.title} (${step.duration}s)</h4>
          <p>${step.desc}</p>
        </div>
      `;
      brewStepsContainer.appendChild(stepEl);
    });
  }

  // Brewing timer operations
  timerBtn.addEventListener('click', toggleBrewTimer);

  function toggleBrewTimer() {
    if (isBrewTimerRunning) {
      pauseBrewTimer();
    } else {
      startBrewTimer();
    }
  }

  function startBrewTimer() {
    isBrewTimerRunning = true;
    timerBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>'; // Pause icon
    
    const data = brewGuides[activeBrewKey];
    
    brewTimerInterval = setInterval(() => {
      brewTimeElapsed++;
      const timeRemaining = data.totalTime - brewTimeElapsed;

      // Update timer clock display
      const minutes = Math.floor(timeRemaining / 60);
      const seconds = timeRemaining % 60;
      timerClock.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      // Update progress bar
      const progressPercent = (brewTimeElapsed / data.totalTime) * 100;
      timerProgressBar.style.width = `${progressPercent}%`;

      // Update active brew step highlight
      updateActiveStepHighlight();

      // Check for completion
      if (brewTimeElapsed >= data.totalTime) {
        completeBrewTimer();
      }
    }, 1000);
  }

  function updateActiveStepHighlight() {
    const data = brewGuides[activeBrewKey];
    let elapsedAccumulator = 0;
    let currentStepIndex = 0;

    for (let i = 0; i < data.steps.length; i++) {
      elapsedAccumulator += data.steps[i].duration;
      if (brewTimeElapsed < elapsedAccumulator) {
        currentStepIndex = i;
        break;
      }
      if (i === data.steps.length - 1) {
        currentStepIndex = i; // fallback to last step at finish
      }
    }

    const steps = brewStepsContainer.querySelectorAll('.brew-step');
    steps.forEach((stepEl, idx) => {
      if (idx === currentStepIndex) {
        stepEl.classList.add('active');
      } else {
        stepEl.classList.remove('active');
      }
    });
  }

  function pauseBrewTimer() {
    isBrewTimerRunning = false;
    timerBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>'; // Play icon
    clearInterval(brewTimerInterval);
  }

  function resetBrewTimer() {
    isBrewTimerRunning = false;
    clearInterval(brewTimerInterval);
    brewTimeElapsed = 0;
  }

  function completeBrewTimer() {
    pauseBrewTimer();
    resetBrewTimer();
    
    // Play visual feedback
    timerClock.textContent = 'Done!';
    timerProgressBar.style.width = '100%';
    
    // Briefly highlight all steps as complete
    brewStepsContainer.querySelectorAll('.brew-step').forEach(s => s.classList.add('active'));
    
    setTimeout(() => {
      renderBrewDisplay();
    }, 4000);
  }


  // --- TESTIMONIALS SLIDER ---
  const testimonialSlides = document.querySelectorAll('.testimonial-slide');
  const prevBtn = document.getElementById('prev-testimonial');
  const nextBtn = document.getElementById('next-testimonial');
  let currentSlide = 0;

  if (testimonialSlides.length > 0) {
    showTestimonial(currentSlide);
    
    prevBtn.addEventListener('click', () => {
      currentSlide = (currentSlide - 1 + testimonialSlides.length) % testimonialSlides.length;
      showTestimonial(currentSlide);
    });

    nextBtn.addEventListener('click', () => {
      currentSlide = (currentSlide + 1) % testimonialSlides.length;
      showTestimonial(currentSlide);
    });
  }

  function showTestimonial(index) {
    testimonialSlides.forEach((slide, idx) => {
      slide.classList.remove('active');
      if (idx === index) {
        slide.classList.add('active');
      }
    });
  }


  // --- CONTACT FORM SUBMIT ---
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic Input Validations
    const nameVal = document.getElementById('contact-name').value.trim();
    const emailVal = document.getElementById('contact-email').value.trim();
    const msgVal = document.getElementById('contact-msg').value.trim();

    if (!nameVal || !emailVal || !msgVal) {
      showFormFeedback('Please fill out all fields.', 'error');
      return;
    }

    if (!validateEmail(emailVal)) {
      showFormFeedback('Please enter a valid email address.', 'error');
      return;
    }

    // Success simulation
    const submitBtn = contactForm.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Sending...';

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      showFormFeedback('Thank you for contacting us! We will respond shortly.', 'success');
      contactForm.reset();
    }, 1500);
  });

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function showFormFeedback(text, type) {
    formFeedback.textContent = text;
    formFeedback.className = `form-feedback ${type}`;
    formFeedback.style.display = 'block';

    setTimeout(() => {
      formFeedback.style.display = 'none';
    }, 5000);
  }


  // --- CHECKOUT & SUCCESS ORDER FLOW ---
  checkoutBtn.addEventListener('click', () => {
    // Hide cart drawer
    toggleCartDrawer();
    
    // Open checkout modal
    openCheckoutModal();
  });

  checkoutCloseBtn.addEventListener('click', closeCheckoutModal);

  function openCheckoutModal() {
    checkoutModal.classList.add('open');
    renderCheckoutSummary();
  }

  function closeCheckoutModal() {
    checkoutModal.classList.remove('open');
  }

  function renderCheckoutSummary() {
    checkoutItemsSummary.innerHTML = '';
    
    cart.forEach(item => {
      const summaryRow = document.createElement('div');
      summaryRow.className = 'receipt-row';
      summaryRow.innerHTML = `
        <span>${item.name} (x${item.quantity})</span>
        <span>$${(item.price * item.quantity).toFixed(2)}</span>
      `;
      checkoutItemsSummary.appendChild(summaryRow);
    });

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    checkoutTotalEl.textContent = `$${total.toFixed(2)}`;
  }

  // Delivery vs Pickup toggle
  pickupTab.addEventListener('click', () => {
    pickupTab.classList.add('active');
    deliveryTab.classList.remove('active');
    addressGroup.style.display = 'none';
    document.getElementById('checkout-address').required = false;
  });

  deliveryTab.addEventListener('click', () => {
    deliveryTab.classList.add('active');
    pickupTab.classList.remove('active');
    addressGroup.style.display = 'block';
    document.getElementById('checkout-address').required = true;
  });

  // Handle Checkout Submit
  checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('checkout-name').value.trim();
    const email = document.getElementById('checkout-email').value.trim();
    const phone = document.getElementById('checkout-phone').value.trim();
    const address = document.getElementById('checkout-address').value.trim();
    
    // Validations
    if (!name || !email || !phone) {
      alert('Please fill out all required contact fields.');
      return;
    }

    if (deliveryTab.classList.contains('active') && !address) {
      alert('Please fill out your delivery address.');
      return;
    }

    // Simulated payment processing spinner
    const checkoutSubmitBtn = checkoutForm.querySelector('.btn-primary');
    const originalText = checkoutSubmitBtn.innerHTML;
    checkoutSubmitBtn.disabled = true;
    checkoutSubmitBtn.innerHTML = 'Securing Payment...';

    setTimeout(() => {
      // Calculate final summary
      const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tax = subtotal * 0.08;
      const total = subtotal + tax;
      const orderNumber = `CL-${Math.floor(100000 + Math.random() * 900000)}`;
      const orderMethod = pickupTab.classList.contains('active') ? 'Pickup (Ready in 15 mins)' : 'Delivery (Arriving in 30-45 mins)';

      // Render Receipt in Success Modal
      successReceipt.innerHTML = `
        <div class="receipt-row">
          <span>Order Reference:</span>
          <strong>${orderNumber}</strong>
        </div>
        <div class="receipt-row">
          <span>Service Method:</span>
          <strong>${orderMethod}</strong>
        </div>
        <div class="receipt-row" style="margin-top:15px; border-top:1px dashed var(--glass-border); padding-top:15px;">
          <span>Subtotal:</span>
          <span>$${subtotal.toFixed(2)}</span>
        </div>
        <div class="receipt-row">
          <span>Tax (8.0%):</span>
          <span>$${tax.toFixed(2)}</span>
        </div>
        <div class="receipt-row total">
          <span>Total Paid:</span>
          <span>$${total.toFixed(2)}</span>
        </div>
      `;

      // Clear Form & Cart
      checkoutForm.reset();
      checkoutSubmitBtn.disabled = false;
      checkoutSubmitBtn.innerHTML = originalText;
      cart = [];
      updateCartUI();

      // Switch Modals
      closeCheckoutModal();
      openSuccessModal();
    }, 2000);
  });

  function openSuccessModal() {
    successModal.classList.add('open');
  }

  function closeSuccessModal() {
    successModal.classList.remove('open');
  }

  successCloseBtn.addEventListener('click', closeSuccessModal);
  confirmBtn.addEventListener('click', closeSuccessModal);
});
