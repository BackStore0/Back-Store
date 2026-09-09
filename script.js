document.addEventListener("DOMContentLoaded", () => {
    const userSession = localStorage.getItem("userLoggedIn");
    
    // الحصول على اسم الصفحة الحالية بدقة لتجنب التعليق
    const currentPath = window.location.pathname.toLowerCase();
    const isLoginPage = currentPath.includes("login.html");

    // إذا لم يكن مسجلاً ودخل أي صفحة غير صفحة الدخول، يتم تحويله لصفحة الدخول
    if (!userSession && !isLoginPage) {
        window.location.href = "login.html";
        return;
    }

    // إذا كان مسجلاً ودخل صفحة الدخول، يتم تحويله للرئيسية تلقائياً
    if (userSession && isLoginPage) {
        window.location.href = "index.html";
        return;
    }

    updateNavigationUI();
    setupLoginForms();
});

// تحديث واجهة المستخدم بعد الدخول
function updateNavigationUI() {
    const userSession = localStorage.getItem("userLoggedIn");
    const loginBtnContainer = document.getElementById("login-btn-container"); // ضع هذا الـ ID في زر الدخول بالشريط العلوي
    
    if (userSession && loginBtnContainer) {
        const user = JSON.parse(userSession);
        loginBtnContainer.innerHTML = `
            <div class="user-profile-nav">
                <img src="${user.avatar || 'logo.png'}" class="nav-avatar" alt="Avatar">
                <span>${user.username || 'مستخدم'}</span>
            </div>
        `;
    }
}

// التحكم بنماذج صفحة تسجيل الدخول
function setupLoginForms() {
    const step1Form = document.getElementById("step-1-form");
    const step2Form = document.getElementById("step-2-form");
    const statusMsg = document.getElementById("status-message");

    if (!step1Form) return;

    let generatedCode = "";
    let userDiscordId = "";

    // الخطوة الأولى: إرسال الكود
    step1Form.addEventListener("submit", async (e) => {
        e.preventDefault();
        userDiscordId = document.getElementById("discord-id").value.trim();

        if (!userDiscordId) return;

        statusMsg.style.color = "#f39c12";
        statusMsg.innerText = "جاري إرسال كود التحقق إلى حسابك في الديسكورد...";

        // إنشاء كود عشوائي من 4 أرقام
        generatedCode = Math.floor(1000 + Math.random() * 9000).toString();

        try {
            // رابط السيرفر الخاص بك (غيّره عند رفعه على Render)
            const response = await fetch("http://localhost:3000/send-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: userDiscordId, code: generatedCode })
            });

            const data = await response.json();

            if (data.success) {
                statusMsg.style.color = "#2eb85c";
                statusMsg.innerText = "تم إرسال الكود بنجاح! تحقق من رسائل الديسكورد الخاصة بك.";
                step1Form.style.display = "none";
                step2Form.style.display = "block";
            } else {
                statusMsg.style.color = "#ff3333";
                statusMsg.innerText = "فشل إرسال الكود. تأكد من إدخال ID صحيح وأنك متواجد في السيرفر وتسمح بالرسائل الخاصة!";
            }
        } catch (err) {
            statusMsg.style.color = "#ff3333";
            statusMsg.innerText = "تعذر الاتصال ببوت الديسكورد، تأكد من تشغيل البوت!";
        }
    });

    // الخطوة الثانية: التأكد من الكود وحفظ الدخول
    step2Form.addEventListener("submit", (e) => {
        e.preventDefault();
        const inputCode = document.getElementById("verify-code").value.trim();

        if (inputCode === generatedCode) {
            const userData = {
                id: userDiscordId,
                username: "عضو Back Store",
                avatar: "logo.png"
            };

            // حفظ الجلسة في المتصفح
            localStorage.setItem("userLoggedIn", JSON.stringify(userData));
            
            statusMsg.style.color = "#2eb85c";
            statusMsg.innerText = "تم تسجيل الدخول بنجاح! جاري التوجيه...";
            
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1000);
        } else {
            statusMsg.style.color = "#ff3333";
            statusMsg.innerText = "كود التحقق غير صحيح!";
        }
    });
}

// زر شراء الان يفتح الديسكورد بصفحة جديدة
function buyNow(discordLink) {
    window.open(discordLink, '_blank');
}
