/* ============================================
   ROYAL LEGEND - Premium Store Script (Final)
   ملف واحد يعمل مع كل الصفحات
   ============================================ */

// تحميل السلة من التخزين المحلي أو تهيئة فارغة
let cartItems = JSON.parse(localStorage.getItem('royalCart')) || [];
let cartCount = cartItems.length;

// حفظ السلة
function saveCart() {
    localStorage.setItem('royalCart', JSON.stringify(cartItems));
}

/* --- Navbar Scroll --- */
window.addEventListener('scroll', function () {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    }
});

/* --- تأثير الظهور التدريجي --- */
document.addEventListener('DOMContentLoaded', () => {
    // Fade-in للـ Hero
    const fades = document.querySelectorAll('.fade-in');
    fades.forEach((el, index) => {
        setTimeout(() => el.classList.add('visible'), 300 * index);
    });

    // ظهور الكروت
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('card-visible');
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.product-card').forEach(card => {
        card.classList.add('card-hidden');
        observer.observe(card);
    });

    // إضافة ستايل الظهور ديناميكياً
    const style = document.createElement('style');
    style.textContent = `
        .card-hidden { opacity: 0; }
        .card-visible { opacity: 1; transition: opacity 0.8s ease; }
    `;
    document.head.appendChild(style);

    // تحديث العداد وعرض السلة عند التحميل
    updateCartCount();
    setupCart();
    renderCartPage();
});

/* ============================================
   🛒 نظام السلة الكامل
   ============================================ */
function setupCart() {
    const cartIcon = document.getElementById('cart-icon');
    const cartClose = document.getElementById('cart-close');
    const cartOverlay = document.getElementById('cart-overlay');

    if (cartIcon) cartIcon.addEventListener('click', openCart);
    if (cartClose) cartClose.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

    renderSidebarCart();
}

function openCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    if (sidebar) sidebar.classList.add('active');
    if (overlay) overlay.classList.add('active');
}

function closeCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
}

// إضافة للسلة
window.addToCart = function(event) {
    if (event) event.stopPropagation();

    const btn = event.currentTarget;
    const cardBackContent = btn.closest('.card-back-content');
    const card = btn.closest('.product-card');

    const name = cardBackContent.querySelector('h3').innerText;
    const priceText = cardBackContent.querySelector('.price-tag').innerText;
    const price = parseFloat(priceText.replace(/[^0-9.]/g, '').replace(',', ''));
    const img = card.querySelector('.card-front img').src;

    cartItems.push({
        id: Date.now(),
        name: name,
        price: price,
        priceText: priceText,
        img: img,
        qty: 1
    });

    cartCount = cartItems.length;
    saveCart();
    updateCartCount();
    renderSidebarCart();
    renderCartPage();

    const originalText = btn.innerText;
    btn.innerText = "تمت الإضافة ✓";
    btn.classList.add('added');

    setTimeout(() => {
        btn.innerText = originalText;
        btn.classList.remove('added');
    }, 2000);
};

function updateCartCount() {
    const countEl = document.getElementById('cart-count');
    if (countEl) {
        countEl.innerText = cartItems.length;
        countEl.classList.remove('bump');
        void countEl.offsetWidth;
        countEl.classList.add('bump');
    }
}

function renderSidebarCart() {
    const container = document.getElementById('cart-items');
    const footer = document.getElementById('cart-footer');
    if (!container) return;

    if (cartItems.length === 0) {
        container.innerHTML = '<p class="cart-empty">السلة فارغة</p>';
        if (footer) footer.style.display = 'none';
        return;
    }

    if (footer) footer.style.display = 'block';
    container.innerHTML = '';

    cartItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <img src="${item.img}" alt="${item.name}">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>${item.priceText}</p>
            </div>
            <button class="cart-item-remove" onclick="window.removeFromCart(${item.id})">✕</button>
        `;
        container.appendChild(div);
    });

    const total = cartItems.reduce((sum, item) => sum + item.price, 0);
    const totalEl = document.getElementById('cart-total-price');
    if (totalEl) totalEl.innerText = total.toLocaleString() + '$';
}

// ✅ حذف من السلة (مربط بـ window لضمان عمل onclick)
window.removeFromCart = function(id) {
    cartItems = cartItems.filter(item => item.id !== id);
    cartCount = cartItems.length;
    saveCart();
    updateCartCount();
    renderSidebarCart();
    renderCartPage();
};

/* --- صفحة السلة الكاملة --- */
function renderCartPage() {
    const pageItems = document.getElementById('cart-page-items');
    const pageWrapper = document.getElementById('cart-page-wrapper');
    const emptyPage = document.getElementById('cart-empty-page');

    if (!pageItems) return;

    if (cartItems.length === 0) {
        if (pageWrapper) pageWrapper.style.display = 'none';
        if (emptyPage) emptyPage.style.display = 'block';
        return;
    }

    if (pageWrapper) pageWrapper.style.display = 'grid';
    if (emptyPage) emptyPage.style.display = 'none';

    pageItems.innerHTML = '';

    cartItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cart-page-item';
        div.innerHTML = `
            <div class="cart-product-info">
                <img src="${item.img}" alt="${item.name}">
                <div>
                    <h4>${item.name}</h4>
                    <p>فاخر</p>
                </div>
            </div>
            <span class="cart-price">${item.priceText}</span>
            <div class="quantity-control">
                <button class="qty-btn" onclick="window.changeQty(${item.id}, -1)">−</button>
                <span class="qty-number">${item.qty || 1}</span>
                <button class="qty-btn" onclick="window.changeQty(${item.id}, 1)">+</button>
            </div>
            <span class="cart-subtotal">${((item.qty || 1) * item.price).toLocaleString()}$</span>
            <button class="cart-remove-btn" onclick="window.removeFromCart(${item.id})">✕</button>
        `;
        pageItems.appendChild(div);
    });

    updateCartPageTotals();
}

// ✅ تغيير الكمية
window.changeQty = function(id, change) {
    const item = cartItems.find(i => i.id === id);
    if (item) {
        item.qty = (item.qty || 1) + change;
        if (item.qty < 1) {
            window.removeFromCart(id);
            return;
        }
        saveCart();
        renderCartPage();
    }
};

function updateCartPageTotals() {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
    const tax = subtotal * 0.15;
    const total = subtotal + tax;

    const subtotalEl = document.getElementById('subtotal');
    const taxEl = document.getElementById('tax');
    const grandEl = document.getElementById('grand-total');

    if (subtotalEl) subtotalEl.innerText = subtotal.toLocaleString() + '$';
    if (taxEl) taxEl.innerText = tax.toLocaleString() + '$';
    if (grandEl) grandEl.innerText = total.toLocaleString() + '$';
}

// ✅ تطبيق كود الخصم
window.applyCoupon = function() {
    const input = document.getElementById('coupon-input');
    const msg = document.getElementById('coupon-msg');
    if (!input || !msg) return;

    const code = input.value.trim().toUpperCase();
    msg.style.display = 'block';

    if (code === 'ROYAL10') {
        msg.style.color = '#4CAF50';
        msg.innerText = '✓ تم تطبيق خصم 10% بنجاح!';
    } else if (code === 'LEGEND20') {
        msg.style.color = '#4CAF50';
        msg.innerText = '✓ تم تطبيق خصم 20% بنجاح!';
    } else {
        msg.style.color = '#ff4444';
        msg.innerText = '✕ كود الخصم غير صالح';
    }
};

// ✅ إتمام الشراء
window.checkout = function() {
    alert('شكراً لك! سيتم توجيهك لصفحة الدفع قريباً.');
};

/* ============================================
   ✨ المطر الذهبي
   ============================================ */
const canvas = document.getElementById('particleCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const heroSection = document.querySelector('.hero');

function resizeCanvas() {
    if (heroSection && canvas) {
        canvas.width = heroSection.offsetWidth;
        canvas.height = heroSection.offsetHeight;
    }
}

let particlesArray = [];

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2.5 + 0.8;
        this.speedY = Math.random() * 1 + 0.3;
        this.opacity = Math.random() * 0.5 + 0.15;
    }
    update() {
        this.y += this.speedY;
        if (this.y > canvas.height) {
            this.y = -10;
            this.x = Math.random() * canvas.width;
            this.opacity = Math.random() * 0.5 + 0.15;
        }
    }
    draw() {
        ctx.fillStyle = `rgba(197, 160, 89, ${this.opacity})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = "rgba(197, 160, 89, 0.25)";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

function initParticles() {
    particlesArray = [];
    if (!canvas) return;
    const count = Math.min(100, Math.floor(canvas.width / 10));
    for (let i = 0; i < count; i++) particlesArray.push(new Particle());
}

function animateParticles() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
    }
    requestAnimationFrame(animateParticles);
}

window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });
if (canvas && ctx) { resizeCanvas(); initParticles(); animateParticles(); }

/* ============================================
   📦 فلترة وترتيب المجموعات
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const sortSelect = document.getElementById('sort-select');

    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.dataset.filter;
                document.querySelectorAll('.product-card').forEach(card => {
                    if (filter === 'all' || card.dataset.category === filter) {
                        card.style.display = 'block';
                        setTimeout(() => card.style.opacity = '1', 10);
                    } else {
                        card.style.opacity = '0';
                        setTimeout(() => card.style.display = 'none', 300);
                    }
                });
            });
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            const grid = document.getElementById('collection-grid');
            if (!grid) return;
            const cards = Array.from(grid.querySelectorAll('.product-card'));
            const value = sortSelect.value;
            cards.sort((a, b) => {
                const pA = parseFloat(a.dataset.price), pB = parseFloat(b.dataset.price);
                if (value === 'price-low') return pA - pB;
                if (value === 'price-high') return pB - pA;
                return 0;
            });
            cards.forEach(card => grid.appendChild(card));
        });
    }
});

/* ============================================
   📞 فورم التواصل
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-contact-submit');
        const msg = document.getElementById('form-success');
        if (btn) { btn.innerText = 'جاري الإرسال...'; btn.disabled = true; }

        setTimeout(() => {
            if (btn) { btn.innerText = 'تم الإرسال ✓'; btn.style.background = '#4CAF50'; }
            if (msg) msg.style.display = 'block';
            form.reset();
            setTimeout(() => {
                if (btn) { btn.innerText = 'إرسال الرسالة'; btn.style.background = ''; btn.disabled = false; }
            }, 3000);
        }, 1500);
    });
});

/* ============================================
   🔐 تبديل تسجيل الدخول/التسجيل
   ============================================ */
window.toggleAuth = function() {
    const login = document.getElementById('login-box');
    const register = document.getElementById('register-box');
    if (login) login.classList.toggle('hidden');
    if (register) register.classList.toggle('hidden');
};

/* ============================================
   📱 التحكم الذكي في القائمة (جوال)
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('mobile-toggle');
    const navLinks = document.getElementById('nav-links');

    if (toggle && navLinks) {
        let overlay = document.querySelector('.nav-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'nav-overlay';
            document.body.appendChild(overlay);
        }

        function toggleMenu() {
            navLinks.classList.toggle('active');
            toggle.classList.toggle('active');
            overlay.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        }

        toggle.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', toggleMenu);

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) toggleMenu();
            });
        });
    }
});
