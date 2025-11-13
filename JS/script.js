const defaultConfig = {
  store_name: "Chained Together",
  hero_title: "Gantungan Kunci Unik",
  hero_subtitle: "Temukan gantungan kunci unik",
  cta_button: "Lihat Koleksi",
  section_title: "Produk Terlaris",
  footer_text: "© 2025 Chained Together. All rights reserved.",
  background_color: "#1e3a8a",
  surface_color: "#ffffff",
  text_color: "#1e293b",
  primary_action_color: "#0ea5e9",
  secondary_action_color: "#38bdf8",
  font_family: "Plus Jakarta Sans",
  font_size: 16
};

const products = [
  {
    id: 1,
    name: "Keychain Custom Huruf A-Z",
    basePrice: 7000,
    image: "IMG/produk/2.jpg",
    description: "",
    hasVariants: true,
    variants: [
      {
        name: "Huruf",
        options: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
        priceAdd: 0
      },
      {
        name: "Lonceng",
        options: ["Tidak", "Ya"],
        priceAdd: 3000
      }
    ]
  },
  {
    id: 3,
    name: "Keychain Cherry",
    basePrice: 5000,
    image: "IMG/produk/3.jpg",
    description: "",
    hasVariants: false
  },
  {
    id: 4,
    name: "Keychain Bunga",
    basePrice: 5000,
    image: "IMG/produk/4.jpg",
    description: "",
    hasVariants: false
  }
];

let cart = [];
let currentProductIdForVariant = null;

// Helper: Robust stringify untuk compare varian (sort keys untuk consistency)
function robustStringify(obj) {
  const sorted = {};
  Object.keys(obj).sort().forEach(key => {
    sorted[key] = obj[key];
  });
  return JSON.stringify(sorted);
}

function renderProducts() {
  const grid = document.getElementById('products-grid');
  grid.innerHTML = products.map(product => {
    if (!product.hasVariants) {
      // No variants: original simple card
      return `
        <div class="product-card bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:border-pink-200 transition-all duration-300 group relative">
          <div class="product-image relative overflow-hidden">
            <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
            <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <span class="text-white text-sm font-semibold"></span>
            </div>
          </div>
          <div class="product-content p-5">
            <h3 class="text-xl font-bold mb-2 text-gray-800 group-hover:text-pink-600 transition-colors duration-300">${product.name}</h3>
            <p class="text-gray-600 mb-3 text-sm leading-relaxed">${product.description}</p>
            <div class="product-footer flex justify-between items-center pt-3 border-t border-gray-100">
              <span class="product-price text-2xl font-bold text-pink-600">Rp ${product.basePrice.toLocaleString('id-ID')}</span>
              <button class="add-to-cart-btn px-6 py-2 rounded-full text-white font-semibold text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 bg-gradient-to-r from-pink-500 to-purple-600" data-product-id="${product.id}">
                Tambah ke Keranjang
              </button>
            </div>
          </div>
        </div>
      `;
    } else {
      // With variants: show base price, button opens modal
      return `
        <div class="product-card bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:border-pink-200 transition-all duration-300 group relative">
          <div class="product-image relative overflow-hidden">
            <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
            <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <span class="text-white text-sm font-semibold"></span>
            </div>
          </div>
          <div class="product-content p-5">
            <h3 class="text-xl font-bold mb-2 text-gray-800 group-hover:text-pink-600 transition-colors duration-300">${product.name}</h3>
            <p class="text-gray-600 mb-3 text-sm leading-relaxed">${product.description}</p>
            <div class="product-footer flex justify-between items-center pt-3 border-t border-gray-100">
              <span class="product-price text-2xl font-bold text-pink-600">Rp ${product.basePrice.toLocaleString('id-ID')}</span>
              <button class="add-to-cart-btn px-6 py-2 rounded-full text-white font-semibold text-sm shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 bg-gradient-to-r from-pink-500 to-purple-600" data-product-id="${product.id}">
                Pilih Varian & Tambah
              </button>
            </div>
          </div>
        </div>
      `;
    }
  }).join('');

  // Add event listeners for add to cart buttons (gunakan data attr, bukan inline)
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const productId = parseInt(e.target.dataset.productId);
      const product = products.find(p => p.id === productId);
      if (product.hasVariants) {
        openVariantModal(productId);
      } else {
        addToCart(productId);
      }
    });
  });
}

function openVariantModal(productId) {
  currentProductIdForVariant = productId;
  const product = products.find(p => p.id === productId);
  document.getElementById('variant-title').textContent = `Pilih Varian untuk ${product.name}`;
  
  const content = document.getElementById('variant-content');
  content.innerHTML = product.variants.map((variantGroup, groupIndex) => `
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">Pilih ${variantGroup.name}</label>
      <select id="modal-variant-${groupIndex}" class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all" onchange="updateVariantPrice()">
        ${variantGroup.options.map(option => `<option value="${option}">${option}</option>`).join('')}
      </select>
    </div>
  `).join('');

  // Reset price
  updateVariantPrice();
  document.getElementById('variant-modal').classList.add('active');
}

function updateVariantPrice() {
  const product = products.find(p => p.id === currentProductIdForVariant);
  if (!product) return;

  let totalPrice = product.basePrice;
  let allSelected = true;

  product.variants.forEach((variantGroup, groupIndex) => {
    const select = document.getElementById(`modal-variant-${groupIndex}`);
    if (select && select.value) {
      // For price add: check if option triggers add (e.g., "Ya" for lonceng)
      if (variantGroup.priceAdd !== undefined && select.value === variantGroup.options.find(opt => opt === 'Ya' || opt === 'Yes')) {
        totalPrice += variantGroup.priceAdd;
      }
    } else {
      allSelected = false;
    }
  });

  const priceEl = document.getElementById('variant-total');
  const confirmBtn = document.getElementById('confirm-variant-btn');
  priceEl.textContent = `Rp ${totalPrice.toLocaleString('id-ID')}`;
  confirmBtn.disabled = !allSelected;
}

function confirmAddWithVariants() {
  const product = products.find(p => p.id === currentProductIdForVariant);
  if (!product) return;

  // Check all selections
  let allSelected = true;
  const selectedVariants = {};
  let variantPrice = product.basePrice;

  product.variants.forEach((variantGroup, groupIndex) => {
    const select = document.getElementById(`modal-variant-${groupIndex}`);
    if (select && select.value) {
      selectedVariants[variantGroup.name] = select.value;
      // Add price if applicable
      if (variantGroup.priceAdd !== undefined && select.value === 'Ya') {
        variantPrice += variantGroup.priceAdd;
      }
    } else {
      allSelected = false;
    }
  });

  if (!allSelected) {
    showToast('Silakan pilih semua varian!');
    return;
  }

  // Add to cart with robust key
  const variantKey = robustStringify(selectedVariants);
  const existingItem = cart.find(item => item.id === product.id && robustStringify(item.selectedVariants || {}) === variantKey);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1, selectedVariants, itemPrice: variantPrice });
  }
  
  updateCartCount();
  showToast('Produk dengan varian ditambahkan ke keranjang!');
  
  // Close modal
  document.getElementById('variant-modal').classList.remove('active');
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  const existingItem = cart.find(item => item.id === productId && robustStringify(item.selectedVariants || {}) === '{}'); // Empty variants key
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1, selectedVariants: {} });
  }
  
  updateCartCount();
  showToast('Produk ditambahkan ke keranjang!');
}

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('cart-count').textContent = count;
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function renderCart() {
  const cartItems = document.getElementById('cart-items');
  
  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="text-center text-gray-500 py-8">Keranjang masih kosong</p>';
    document.getElementById('cart-total').textContent = 'Rp 0';
    return;
  }
  
  cartItems.innerHTML = cart.map(item => {
    const displayPrice = item.itemPrice !== undefined ? item.itemPrice : item.basePrice;
    const variantText = Object.entries(item.selectedVariants || {}).map(([key, val]) => `${key}: ${val}`).join(', ');
    const variantsJson = JSON.stringify(item.selectedVariants || {}); // Untuk data attr
    return `
      <div class="cart-item flex items-center justify-between mb-4 pb-4 border-b border-gray-200" data-product-id="${item.id}" data-variants-json='${variantsJson.replace(/'/g, "\\'")}' data-item-price="${displayPrice}">
        <div class="flex items-center flex-1">
          <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded">
          <div class="ml-4">
            <h4 class="font-semibold text-gray-800">${item.name}</h4>
            ${variantText ? `<p class="text-xs text-gray-500">Varian: ${variantText}</p>` : ''}
            <p class="text-gray-600">Rp ${displayPrice.toLocaleString('id-ID')}</p>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <button class="quantity-btn decrease w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center" data-action="decrease">-</button>
          <span class="quantity font-semibold">${item.quantity}</span>
          <button class="quantity-btn increase w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center" data-action="increase">+</button>
          <button class="remove-btn ml-4 text-red-500 hover:text-red-700">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }).join('');
  
  // FIXED: Event delegation yang lebih robust - gunakan closest() untuk handle klik pada child elements (seperti SVG di remove-btn)
  const cartContainer = document.getElementById('cart-items');
  cartContainer.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.remove-btn');  // FIXED: Deteksi dari child (SVG/path)
    const quantityBtn = e.target.closest('.quantity-btn');  // FIXED: Deteksi dari child (jika ada nested di masa depan)

    if (removeBtn) {
      // FIXED: Ambil data dari cart-item terdekat
      const cartItem = removeBtn.closest('.cart-item');
      if (!cartItem) return;

      const productId = parseInt(cartItem.dataset.productId);
      const variantsJson = cartItem.dataset.variantsJson;
      let selectedVariants = {};
      try {
        selectedVariants = JSON.parse(variantsJson);
      } catch (err) {
        console.error('Parse variants error:', err);
        showToast('Error parsing varian. Refresh keranjang.');
        return;
      }

      removeFromCart(productId, selectedVariants);
      console.log('Remove triggered successfully');  // FIXED: Debug log (hapus jika sudah OK)

    } else if (quantityBtn) {
      // FIXED: Ambil data dari cart-item terdekat
      const cartItem = quantityBtn.closest('.cart-item');
      if (!cartItem) return;

      const productId = parseInt(cartItem.dataset.productId);
      const variantsJson = cartItem.dataset.variantsJson;
      let selectedVariants = {};
      try {
        selectedVariants = JSON.parse(variantsJson);
      } catch (err) {
        console.error('Parse variants error:', err);
        showToast('Error parsing varian. Refresh keranjang.');
        return;
      }

      const action = quantityBtn.dataset.action;  // FIXED: Ambil action dari closest button
      const change = action === 'increase' ? 1 : -1;
      updateQuantity(productId, change, selectedVariants);
      console.log('Quantity update triggered:', action);  // FIXED: Debug log (hapus jika sudah OK)
    }
  });

  const total = cart.reduce((sum, item) => sum + ((item.itemPrice !== undefined ? item.itemPrice : item.basePrice) * item.quantity), 0);
  document.getElementById('cart-total').textContent = `Rp ${total.toLocaleString('id-ID')}`;
}

function updateQuantity(productId, change, selectedVariants) {
  const variantKey = robustStringify(selectedVariants || {});
  const item = cart.find(i => i.id === productId && robustStringify(i.selectedVariants || {}) === variantKey);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(productId, selectedVariants);
    } else {
      updateCartCount();
      renderCart();
    }
  } else {
    console.warn('Item not found for update:', { productId, variantKey });
  }
}

function removeFromCart(productId, selectedVariants) {
  const variantKey = robustStringify(selectedVariants || {});
  const beforeLength = cart.length;
  cart = cart.filter(item => !(item.id === productId && robustStringify(item.selectedVariants || {}) === variantKey));
  const afterLength = cart.length;

  if (afterLength < beforeLength) {
    updateCartCount();
    renderCart();
    showToast('Produk dihapus dari keranjang');
  } else {
    console.warn('Item not removed - not found:', { productId, variantKey });
    showToast('Gagal menghapus produk. Coba lagi.');
  }
}

// Event listeners (sama seperti sebelumnya, no change needed)
document.getElementById('cart-btn').addEventListener('click', () => {
  document.getElementById('cart-modal').classList.add('active');
  renderCart();
});

document.getElementById('close-modal').addEventListener('click', () => {
  document.getElementById('cart-modal').classList.remove('active');
});

document.getElementById('cart-modal').addEventListener('click', (e) => {
  if (e.target.id === 'cart-modal') {
    document.getElementById('cart-modal').classList.remove('active');
  }
});

// Variant modal events
document.getElementById('close-variant-modal').addEventListener('click', () => {
  document.getElementById('variant-modal').classList.remove('active');
});

document.getElementById('variant-modal').addEventListener('click', (e) => {
  if (e.target.id === 'variant-modal') {
    document.getElementById('variant-modal').classList.remove('active');
  }
});

document.getElementById('confirm-variant-btn').addEventListener('click', confirmAddWithVariants);

document.getElementById('checkout-btn').addEventListener('click', () => {
  if (cart.length === 0) {
    showToast('Keranjang masih kosong!');
    return;
  }

  // Format pesan WhatsApp with variants and adjusted prices
  let message = `Saya mau pesan%0A%0A`;
  let total = 0;

  cart.forEach(item => {
    const displayPrice = item.itemPrice !== undefined ? item.itemPrice : item.basePrice;
    const itemTotal = displayPrice * item.quantity;
    total += itemTotal;
    let itemLine = `${item.name}%0A`;
    if (Object.keys(item.selectedVariants || {}).length > 0) {
      const variantText = Object.entries(item.selectedVariants).map(([key, val]) => `${key}: ${val}`).join(', ');
      itemLine += `  Varian: ${variantText}%0A`;
    }
    itemLine += `  ${item.quantity} x Rp ${displayPrice.toLocaleString('id-ID')} = Rp ${itemTotal.toLocaleString('id-ID')}%0A%0A`;
    message += itemLine;
  });

  message += `%0A*Total: Rp ${total.toLocaleString('id-ID')}*`;

  const phoneNumber = "628999223168";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  window.open(whatsappUrl, '_blank');
  document.getElementById('cart-modal').classList.remove('active');
});

document.getElementById('cta-button').addEventListener('click', () => {
  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
});

// Hamburger menu functionality (sama, no change)
const hamburgerBtn = document.getElementById('hamburger-btn');
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuItems = document.querySelectorAll('.mobile-menu-item');

hamburgerBtn.addEventListener('click', () => {
  hamburgerBtn.classList.toggle('active');
  mobileMenu.classList.toggle('active');
});

mobileMenuItems.forEach(item => {
  item.addEventListener('click', () => {
    hamburgerBtn.classList.remove('active');
    mobileMenu.classList.remove('active');
  });
});

document.addEventListener('click', (e) => {
  if (!hamburgerBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
    hamburgerBtn.classList.remove('active');
    mobileMenu.classList.remove('active');
  }
});

async function onConfigChange(config) {
  const customFont = config.font_family || defaultConfig.font_family;
  const baseFontStack = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  const baseSize = config.font_size || defaultConfig.font_size;

  document.body.style.fontFamily = `${customFont}, ${baseFontStack}`;

  document.getElementById('store-name').textContent = config.store_name || defaultConfig.store_name;
  document.getElementById('store-name').style.fontSize = `${baseSize * 1.25}px`;

  document.getElementById('hero-title').textContent = config.hero_title || defaultConfig.hero_title;
  document.getElementById('hero-title').style.fontSize = `${baseSize * 3}px`;

  document.getElementById('hero-subtitle').textContent = config.hero_subtitle || defaultConfig.hero_subtitle;
  document.getElementById('hero-subtitle').style.fontSize = `${baseSize * 1.25}px`;

  document.getElementById('cta-button').textContent = config.cta_button || defaultConfig.cta_button;
  document.getElementById('cta-button').style.fontSize = `${baseSize * 1.125}px`;

  document.getElementById('section-title').textContent = config.section_title || defaultConfig.section_title;
  document.getElementById('section-title').style.fontSize = `${baseSize * 2.5}px`;
  document.getElementById('section-title').style.color = config.text_color || defaultConfig.text_color;

  document.getElementById('footer-text').textContent = config.footer_text || defaultConfig.footer_text;
  document.getElementById('footer-text').style.fontSize = `${baseSize * 1.125}px`;

  const gradientBgs = document.querySelectorAll('.gradient-bg');
  const bgColor = config.background_color || defaultConfig.background_color;
  gradientBgs.forEach(el => {
    el.style.background = `linear-gradient(135deg, ${bgColor} 0%, #0ea5e9 100%)`;
  });

  const ctaButton = document.getElementById('cta-button');
  ctaButton.style.backgroundColor = config.surface_color || defaultConfig.surface_color;
  ctaButton.style.color = config.primary_action_color || defaultConfig.primary_action_color;

  renderProducts();
}

function adjustColor(color, percent) {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255))
    .toString(16).slice(1);
}

if (window.elementSdk) {
  window.elementSdk.init({
    defaultConfig,
    onConfigChange,
    mapToCapabilities: (config) => ({
      recolorables: [
        {
          get: () => config.background_color || defaultConfig.background_color,
          set: (value) => {
            config.background_color = value;
            window.elementSdk.setConfig({ background_color: value });
          }
        },
        {
          get: () => config.surface_color || defaultConfig.surface_color,
          set: (value) => {
            config.surface_color = value;
            window.elementSdk.setConfig({ surface_color: value });
          }
        },
        {
          get: () => config.text_color || defaultConfig.text_color,
          set: (value) => {
            config.text_color = value;
            window.elementSdk.setConfig({ text_color: value });
          }
        },
        {
          get: () => config.primary_action_color || defaultConfig.primary_action_color,
          set: (value) => {
            config.primary_action_color = value;
            window.elementSdk.setConfig({ primary_action_color: value });
          }
        },
        {
          get: () => config.secondary_action_color || defaultConfig.secondary_action_color,
          set: (value) => {
            config.secondary_action_color = value;
            window.elementSdk.setConfig({ secondary_action_color: value });
          }
        }
      ],
      borderables: [],
      fontEditable: {
        get: () => config.font_family || defaultConfig.font_family,
        set: (value) => {
          config.font_family = value;
          window.elementSdk.setConfig({ font_family: value });
        }
      },
      fontSizeable: {
        get: () => config.font_size || defaultConfig.font_size,
        set: (value) => {
          config.font_size = value;
          window.elementSdk.setConfig({ font_size: value });
        }
      }
    }),
    mapToEditPanelValues: (config) => new Map([
      ["store_name", config.store_name || defaultConfig.store_name],
      ["hero_title", config.hero_title || defaultConfig.hero_title],
      ["hero_subtitle", config.hero_subtitle || defaultConfig.hero_subtitle],
      ["cta_button", config.cta_button || defaultConfig.cta_button],
      ["section_title", config.section_title || defaultConfig.section_title],
      ["footer_text", config.footer_text || defaultConfig.footer_text]
    ])
  });
}

renderProducts();

// Smooth Scroll untuk semua link dengan href yang dimulai dengan #
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      
      // Tutup menu mobile jika terbuka
      if (mobileMenu.classList.contains('active')) {
        hamburgerBtn.classList.remove('active');
        mobileMenu.classList.remove('active');
      }
    }
  });
});
