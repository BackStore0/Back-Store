document.addEventListener("DOMContentLoaded", () => {
    const userSession = localStorage.getItem("userLoggedIn");
    const currentPath = window.location.pathname.toLowerCase();
    const isLoginPage = currentPath.includes("login.html");

    // حماية الصفحات: إذا لم يدخل يتم توجيهه للدخول
    if (!userSession && !isLoginPage) {
        window.location.href = "login.html";
        return;
    }

    // إذا كان في صفحة الدخول وهو مسجل بالفعل، يتم نقله للرئيسية
    if (userSession && isLoginPage) {
        window.location.href = "index.html";
        return;
    }

    setupLoginForms();
});

function setupLoginForms() {
    const step1Form = document.getElementById("step-1-form");
    const step2Form = document.getElementById("step-2-form");
    const statusMsg = document.getElementById("status-message");

    if (!step1Form) return;

    let generatedCode = "";
    let enteredUsername = "";

    step1Form.addEventListener("submit", async (e) => {
        e.preventDefault();
        enteredUsername = document.getElementById("discord-username").value.trim();

        if (!enteredUsername) return;

        statusMsg.style.color = "#f39c12";
        statusMsg.innerText = "جاري البحث عن حسابك وإرسال الكود...";

        generatedCode = Math.floor(1000 + Math.random() * 9000).toString();

        try {
            const response = await fetch("http://localhost:3000/send-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: enteredUsername, code: generatedCode })
            });

            const data = await response.json();

            if (data.success) {
                statusMsg.style.color = "#2eb85c";
                statusMsg.innerText = "تم إرسال الكود بنجاح إلى ديسكورد!";
                step1Form.style.display = "none";
                step2Form.style.display = "block";
            } else {
                statusMsg.style.color = "#ff3333";
                statusMsg.innerText = data.error || "تعذر العثور على اسم المستخدم في السيرفر!";
            }
        } catch (err) {
            statusMsg.style.color = "#ff3333";
            statusMsg.innerText = "تعذر الاتصال بالسيرفر/البوت!";
        }
    });

    step2Form.addEventListener("submit", (e) => {
        e.preventDefault();
        const inputCode = document.getElementById("verify-code").value.trim();

        if (inputCode === generatedCode) {
            const userData = {
                username: enteredUsername
            };

            // حفظ الجلسة
            localStorage.setItem("userLoggedIn", JSON.stringify(userData));

            statusMsg.style.color = "#2eb85c";
            statusMsg.innerText = "تم تسجيل الدخول بنجاح! جاري تحويلك للرئيسية...";

            // التوجيه فوراً إلى الرئيسية
            setTimeout(() => {
                window.location.href = "index.html";
            }, 800);
        } else {
            statusMsg.style.color = "#ff3333";
            statusMsg.innerText = "كود التحقق غير صحيح!";
        }
    });
}
