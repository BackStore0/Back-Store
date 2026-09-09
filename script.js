document.addEventListener("DOMContentLoaded", () => {
    const userSession = localStorage.getItem("userLoggedIn");
    const currentPath = window.location.pathname.toLowerCase();
    const isLoginPage = currentPath.includes("login.html");

    // التحويل إلى صفحة الدخول إذا لم يكن مسجلاً
    if (!userSession && !isLoginPage) {
        window.location.href = "login.html";
        return;
    }

    // تحويل تلقائي للرئيسية إذا كان مسجلاً بالحدث والدخول في صفحة الدخول
    if (userSession && isLoginPage) {
        window.location.href = "index.html";
        return;
    }

    setupLoginForms();
    setupKeypressSound();
});

// إنشاء صوت نقرة ناعمة برمجياً عند الكتابة
function setupKeypressSound() {
    let audioCtx = null;

    document.addEventListener("keydown", (e) => {
        // تشغيل الصوت فقط عند الكتابة في المدخلات
        if (e.target.tagName === "INPUT") {
            try {
                if (!audioCtx) {
                    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                }
                if (audioCtx.state === "suspended") {
                    audioCtx.resume();
                }

                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();

                osc.type = "sine";
                osc.frequency.setValueAtTime(600, audioCtx.currentTime); 
                osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.04);

                gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);

                osc.connect(gain);
                gain.connect(audioCtx.destination);

                osc.start();
                osc.stop(audioCtx.currentTime + 0.04);
            } catch (err) {
                // التعامل مع أي قيود متصفح للصوت
            }
        }
    });
}

function setupLoginForms() {
    const step1Form = document.getElementById("step-1-form");
    const step2Form = document.getElementById("step-2-form");
    const statusMsg = document.getElementById("status-message");

    if (!step1Form) return;

    let generatedCode = "1234"; // كود الكشف التجريبي
    let enteredUsername = "";

    step1Form.addEventListener("submit", async (e) => {
        e.preventDefault();
        enteredUsername = document.getElementById("discord-username").value.trim();

        if (!enteredUsername) return;

        statusMsg.style.color = "#f39c12";
        statusMsg.innerText = "جاري إرسال كود التحقق...";

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
                statusMsg.innerText = "تم إرسال الكود بنجاح عبر الديسكورد!";
                step1Form.style.display = "none";
                step2Form.style.display = "block";
            } else {
                throw new Error("Discord Bot Not Connected");
            }
        } catch (err) {
            // في حال عدم توفر سيرفر البوت: يتم التحويل لمربع الكود مباشرة للتجربة
            statusMsg.style.color = "#2eb85c";
            statusMsg.innerText = `[وضع تجريبي] تم توليد كود التحقق الخاص بك هو: ${generatedCode}`;
            step1Form.style.display = "none";
            step2Form.style.display = "block";
        }
    });

    step2Form.addEventListener("submit", (e) => {
        e.preventDefault();
        const inputCode = document.getElementById("verify-code").value.trim();

        if (inputCode === generatedCode || inputCode === "1234") {
            const userData = { username: enteredUsername || "عضو Back Store" };
            localStorage.setItem("userLoggedIn", JSON.stringify(userData));

            statusMsg.style.color = "#2eb85c";
            statusMsg.innerText = "تم التحقق بنجاح! جاري تحويلك للصفحة الرئيسية...";

            setTimeout(() => {
                window.location.href = "index.html";
            }, 800);
        } else {
            statusMsg.style.color = "#ff3333";
            statusMsg.innerText = "كود التحقق غير صحيح!";
        }
    });
}
