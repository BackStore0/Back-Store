// 1. حركة الضوء التفاعلي خلف الماوس
const light = document.createElement('div');
light.className = 'mouse-light';
document.body.appendChild(light);

document.addEventListener('mousemove', (e) => {
    light.style.left = e.clientX + 'px';
    light.style.top = e.clientY + 'px';
});

// 2. تأثر البطاقات بالحركة الثلاثية الأبعاد (3D Effect)
document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.glass-card');
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
            card.style.transform = `rotateY(${x / 25}deg) rotateX(${-y / 25}deg)`;
        } else {
            card.style.transform = `rotateY(0deg) rotateX(0deg)`;
        }
    });
});

// 3. نظام توليد وإرسال والتحقق الصحيح من الكود
let generatedCode = null;

function openAuthModal() {
    document.getElementById('authModal').style.display = 'flex';
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

function sendOTP() {
    const user = document.getElementById('discordUser').value.trim();
    if (!user) return alert('يرجى إدخال اسم المستخدم بالديسكورد بشكل صحيح');

    // توليد كود عشوائي حقيقي مكون من 4 أرقام
    generatedCode = Math.floor(1000 + Math.random() * 9000).toString();
    console.log("Generated Code for verification:", generatedCode); // للتجربة في الكونسول

    // إرسال طلب إلى البوت لتوصيل الكود
    fetch('http://localhost:3000/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, code: generatedCode })
    }).catch(() => console.log('تعذر الاتصال بسيرفر البوت المحلي، الكود للتجربة هو: ' + generatedCode));

    document.getElementById('step1').style.display = 'none';
    document.getElementById('step2').style.display = 'block';
    alert('تم طلب إرسال كود التحقق من البوت إلى حسابك بالخاص!');
}

function verifyOTP() {
    const inputs = document.querySelectorAll('.otp-input');
    let enteredCode = '';
    inputs.forEach(input => enteredCode += input.value);

    // التحقق الفعلي المباشر
    if (enteredCode === generatedCode && generatedCode !== null) {
        // نجاح التحقق - تحويل المربعات للون الأخضر
        inputs.forEach(input => {
            input.classList.remove('error');
            input.classList.add('correct');
        });

        setTimeout(() => {
            // حفظ تسجيل الدخول لمدة 10 أيام (Expiry timestamp)
            const expiryDate = new Date().getTime() + (10 * 24 * 60 * 60 * 1000);
            localStorage.setItem('userSession', JSON.stringify({ loggedIn: true, username: document.getElementById('discordUser').value, expiry: expiryDate }));
            alert('تم التحقق بنجاح! مرحباً بك.');
            closeAuthModal();
            checkAuthStatus();
        }, 600);

    } else {
        // فشل التحقق - تحويل المربعات للون الأحمر والتوهج
        inputs.forEach(input => {
            input.classList.remove('correct');
            input.classList.add('error');
        });
        alert('الكود الذي أدخلته غير صحيح! يرجى التأكد وإعادة المحاولة.');
    }
}

function checkAuthStatus() {
    const session = JSON.parse(localStorage.getItem('userSession'));
    if (session) {
        const now = new Date().getTime();
        if (now > session.expiry) {
            localStorage.removeItem('userSession');
        } else {
            const loginBtn = document.getElementById('loginBtn');
            if (loginBtn) loginBtn.innerHTML = `<i class="fa-solid fa-user-check"></i> ${session.username}`;
        }
    }
}

// التحكم التلقائي بإنقلاب المؤشر لمربعات الـ OTP
document.querySelectorAll('.otp-input').forEach((input, index, inputs) => {
    input.addEventListener('input', () => {
        input.classList.remove('error', 'correct');
        if (input.value.length === 1 && index < inputs.length - 1) {
            inputs[index + 1].focus();
        }
    });
});

// عرض المنتجات ديناميكياً
function renderProducts() {
    const container = document.getElementById('productsContainer');
    if (!container) return;

    const products = JSON.parse(localStorage.getItem('products')) || [];
    container.innerHTML = '';

    if (products.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#aaa; grid-column: 1/-1;">لا توجد منتجات معروضة حالياً.</p>';
        return;
    }

    products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'glass-card product-card';
        card.innerHTML = `
            <img src="${p.images[0]}" alt="${p.name}">
            <h3>${p.name}</h3>
            <p style="color: var(--accent-gray); margin: 10px 0; font-weight: bold;">$ ${p.price}</p>
            <button onclick="viewProduct(${p.id})" class="btn-action"><i class="fa-solid fa-eye"></i> عرض المواصفات والتحميل</button>
        `;
        container.appendChild(card);
    });
}

function viewProduct(id) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const prod = products.find(p => p.id === id);
    if (prod) {
        localStorage.setItem('selectedProduct', JSON.stringify(prod));
        window.location.href = 'product.html';
    }
}
window.onload = () => {
    checkAuthStatus();
    renderProducts();
};
// حفظ حالة الدخول في localStorage
document.addEventListener("DOMContentLoaded", () => {
    const userSession = localStorage.getItem("userLoggedIn");
    
    // إجبار تسجيل الدخول عند فتح الموقع أول مرة
    if (!userSession && window.location.pathname !== "/login.html") {
        window.location.href = "login.html";
    }

    updateNavigationUI();
});

function loginUser(userData) {
    localStorage.setItem("userLoggedIn", JSON.stringify(userData));
    window.location.href = "index.html";
}

function updateNavigationUI() {
    const user = JSON.parse(localStorage.getItem("userLoggedIn"));
    const loginBtn = document.getElementById("login-btn");
    
    if (user && loginBtn) {
        loginBtn.innerHTML = `<img src="${user.avatar}" class="nav-avatar"> ${user.username}`;
    }
}

// زر شراء الآن للتحويل إلى الديسكورد في نافذة جديدة
function buyNow(discordLink) {
    window.open(discordLink, '_blank');
}
