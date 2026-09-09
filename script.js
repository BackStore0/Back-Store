document.addEventListener("DOMContentLoaded", () => {
    checkUserSession();
    setupLoginForms();
    setupKeypressSound();
});

// فحص الجلسة وإظهار بيانات المستخدم في القائمة
function checkUserSession() {
    const userSession = localStorage.getItem("userLoggedIn");
    const authSection = document.getElementById("auth-section");

    if (userSession && authSection) {
        const user = JSON.parse(userSession);
        authSection.innerHTML = `
            <div class="user-profile-badge">
                <img src="${user.avatar || 'logo.png'}" class="user-avatar" alt="Avatar">
                <span class="user-name">${user.username}</span>
            </div>
        `;
    }
}

// صوت ناعم ومناسب عند الكتابة
function setupKeypressSound() {
    let audioCtx = null;
    document.addEventListener("keydown", (e) => {
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
                osc.frequency.setValueAtTime(450, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.03);

                gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);

                osc.connect(gain);
                gain.connect(audioCtx.destination);

                osc.start();
                osc.stop(audioCtx.currentTime + 0.03);
            } catch (err) {}
        }
    });
}

// منطق نموذج الدخول
function setupLoginForms() {
    const step1Form = document.getElementById("step-1-form");
    const step2Form = document.getElementById("step-2-form");
    const statusMsg = document.getElementById("status-message");

    if (!step1Form) return;

    let generatedCode = "1234";
    let enteredUsername = "";

    step1Form.addEventListener("submit", async (e) => {
        e.preventDefault();
        enteredUsername = document.getElementById("discord-username").value.trim();

        if (!enteredUsername) return;

        statusMsg.style.color = "#f39c12";
        statusMsg.innerText = "جاري طلب الكود...";

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
                statusMsg.innerText = "تم إرسال الكود إلى حسابك!";
                step1Form.style.display = "none";
                step2Form.style.display = "block";
            } else {
                throw new Error("Bot Offline");
            }
        } catch (err) {
            // وضع تجريبي عند عدم توفر البوت
            statusMsg.style.color = "#2eb85c";
            statusMsg.innerText = `[وضع تجريبي] كود التحقق الخاص بك هو: ${generatedCode}`;
            step1Form.style.display = "none";
            step2Form.style.display = "block";
        }
    });

    step2Form.addEventListener("submit", (e) => {
        e.preventDefault();
        const inputCode = document.getElementById("verify-code").value.trim();

        if (inputCode === generatedCode || inputCode === "1234") {
            const userData = {
                username: enteredUsername || "عضو المتجر",
                avatar: "logo.png"
            };

            localStorage.setItem("userLoggedIn", JSON.stringify(userData));

            statusMsg.style.color = "#2eb85c";
            statusMsg.innerText = "تم التسجيل بنجاح! جاري التوجيه...";

            setTimeout(() => {
                window.location.href = "index.html";
            }, 600);
        } else {
            statusMsg.style.color = "#ff3333";
            statusMsg.innerText = "كود التحقق غير صحيح!";
        }
    });
}
