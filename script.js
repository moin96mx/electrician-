const state = {
    light: false,
    fan: false,
    sensor: false,
    ac: false
};

let acTemp = 24;

function toggleAppliance(type) {

    if (!Object.prototype.hasOwnProperty.call(state, type)) {
        return;
    }

    state[type] = !state[type];

    const card = document.getElementById(`card-${type}`);
    const status = document.getElementById(`status-${type}`);

    if (!card || !status) {
        return;
    }

    if (type === "light") {

        if (state.light) {

            card.classList.add("active-light");

            status.innerHTML =
                'স্ট্যাটাস: <span style="color:#ffd700;font-weight:bold;">অন (ON)</span>';

        } else {

            card.classList.remove("active-light");

            status.innerHTML =
                'স্ট্যাটাস: <span>অফ (OFF)</span>';
        }
    }

    if (type === "fan") {

        if (state.fan) {

            card.classList.add("active-fan");

            status.innerHTML =
                'স্ট্যাটাস: <span style="color:#00e5ff;font-weight:bold;">অন (ON)</span>';

        } else {

            card.classList.remove("active-fan");

            status.innerHTML =
                'স্ট্যাটাস: <span>অফ (OFF)</span>';
        }
    }

    if (type === "sensor") {

        if (state.sensor) {

            card.classList.add("active-sensor");

            status.innerHTML =
                'স্ট্যাটাস: <span style="color:#00ff88;font-weight:bold;">সক্রিয় (ACTIVE)</span>';

        } else {

            card.classList.remove("active-sensor");

            status.innerHTML =
                'স্ট্যাটাস: <span>নিষ্ক্রিয় (INACTIVE)</span>';
        }
    }

    if (type === "ac") {

        if (state.ac) {

            card.classList.add("active-ac");

            status.innerHTML =
                `স্ট্যাটাস: <span style="color:#00bfff;font-weight:bold;">অন (ON) - ${acTemp}°C</span>`;

        } else {

            card.classList.remove("active-ac");

            status.innerHTML =
                'স্ট্যাটাস: <span>অফ (OFF)</span>';
        }
    }

    updateEnergyMeter();
    updateActivityLog(type, state[type]);
}


function increaseAC() {

    if (acTemp >= 30) {
        return;
    }

    acTemp++;

    updateACDisplay();
}


function decreaseAC() {

    if (acTemp <= 16) {
        return;
    }

    acTemp--;

    updateACDisplay();
}


function updateACDisplay() {

    const tempDisplay = document.getElementById("ac-temp");

    if (tempDisplay) {
        tempDisplay.textContent = `${acTemp}°C`;
    }

    const status = document.getElementById("status-ac");

    if (status && state.ac) {

        status.innerHTML =
            `স্ট্যাটাস: <span style="color:#00bfff;font-weight:bold;">অন (ON) - ${acTemp}°C</span>`;
    }

    updateEnergyMeter();
}


function updateActivityLog(type, status) {

    const logContainer = document.getElementById("activity-log");

    if (!logContainer) {
        return;
    }

    const names = {
        light: "লাইট",
        fan: "ফ্যান",
        sensor: "সেন্সর",
        ac: "এসি"
    };

    const currentTime = new Date().toLocaleTimeString("bn-BD", {
        hour: "2-digit",
        minute: "2-digit"
    });

    const item = document.createElement("div");

    item.className = "activity-item";

    item.innerHTML = `
        <span>${names[type] || type}</span>
        <span>${status ? "চালু" : "বন্ধ"}</span>
        <small>${currentTime}</small>
    `;

    logContainer.prepend(item);

    while (logContainer.children.length > 10) {
        logContainer.removeChild(logContainer.lastChild);
    }
}


function updateEnergyMeter() {

    const energyDisplay = document.getElementById("energy-value");
    const costDisplay = document.getElementById("energy-cost");

    let watts = 0;

    if (state.light) {
        watts += 15;
    }

    if (state.fan) {
        watts += 60;
    }

    if (state.ac) {
        watts += 1080 + ((30 - acTemp) * 35);
    }

    const hours = 1;

    const kwh = watts * hours / 1000;

    const rate = 7.5;

    const cost = kwh * rate;

    if (energyDisplay) {
        energyDisplay.textContent = `${watts.toFixed(0)} W`;
    }

    if (costDisplay) {
        costDisplay.textContent = `৳${cost.toFixed(2)}`;
    }
}


function updateClimateSensor() {

    const temperatureElement =
        document.getElementById("climate-temperature");

    const humidityElement =
        document.getElementById("climate-humidity");

    if (!temperatureElement && !humidityElement) {
        return;
    }

    const hour = new Date().getHours();

    let temperature;

    if (hour >= 6 && hour < 12) {
        temperature = 27 + Math.random() * 3;
    } else if (hour >= 12 && hour < 17) {
        temperature = 30 + Math.random() * 5;
    } else if (hour >= 17 && hour < 22) {
        temperature = 28 + Math.random() * 3;
    } else {
        temperature = 24 + Math.random() * 3;
    }

    const humidity = 55 + Math.random() * 25;

    if (temperatureElement) {
        temperatureElement.textContent =
            `${temperature.toFixed(1)}°C`;
    }

    if (humidityElement) {
        humidityElement.textContent =
            `${humidity.toFixed(0)}%`;
    }
}


function getCurrentDate() {

    const now = new Date();

    const year = now.getFullYear();

    const month =
        String(now.getMonth() + 1).padStart(2, "0");

    const day =
        String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function setMinimumDate() {

    const dateInputs =
        document.querySelectorAll('input[type="date"]');

    const today = getCurrentDate();

    dateInputs.forEach(input => {

        if (!input.min) {
            input.min = today;
        }
    });
}


function setupMobileMenu() {

    const menuButton =
        document.querySelector(".mobile-menu-btn");

    const nav =
        document.querySelector(".nav-menu");

    if (!menuButton || !nav) {
        return;
    }

    menuButton.addEventListener("click", () => {

        nav.classList.toggle("active");

        menuButton.classList.toggle("active");
    });

    nav.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            nav.classList.remove("active");

            menuButton.classList.remove("active");
        });
    });
}


function setupRevealAnimations() {

    const elements =
        document.querySelectorAll(".reveal, .fade-in, .animate-on-scroll");

    if (!elements.length) {
        return;
    }

    if (!("IntersectionObserver" in window)) {

        elements.forEach(element => {
            element.classList.add("visible");
        });

        return;
    }

    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("visible");

                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.12
            }
        );

    elements.forEach(element => {
        observer.observe(element);
    });
}


function setupDragAndDrop() {

    const dropZones =
        document.querySelectorAll(".drop-zone, [data-drop-zone]");

    dropZones.forEach(zone => {

        ["dragenter", "dragover"].forEach(eventName => {

            zone.addEventListener(eventName, event => {

                event.preventDefault();

                zone.classList.add("drag-over");
            });
        });

        ["dragleave", "drop"].forEach(eventName => {

            zone.addEventListener(eventName, event => {

                event.preventDefault();

                zone.classList.remove("drag-over");
            });
        });

        zone.addEventListener("drop", event => {

            const files = event.dataTransfer.files;

            if (!files || !files.length) {
                return;
            }

            const input =
                zone.querySelector('input[type="file"]');

            if (input) {
                input.files = files;

                input.dispatchEvent(
                    new Event("change", {
                        bubbles: true
                    })
                );
            }
        });
    });
}


function generateProjectId() {

    const randomNumber =
        Math.floor(1000 + Math.random() * 9000);

    return `#ENG-2050-${randomNumber}`;
}


async function submitBooking(form) {

    if (!form) {
        return;
    }

    const submitButton =
        form.querySelector('[type="submit"]');

    const originalText =
        submitButton ? submitButton.innerHTML : "";

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = "Submitting...";
    }

    try {

        const formData = new FormData(form);

        if (!formData.get("project_id")) {
            formData.append(
                "project_id",
                generateProjectId()
            );
        }

        const response =
            await fetch("/api/bookings", {
                method: "POST",
                body: formData
            });

        if (!response.ok) {

            throw new Error(
                `Booking request failed: HTTP ${response.status}`
            );
        }

        let result = null;

        try {
            result = await response.json();
        } catch {
            result = null;
        }

        console.log(
            "Booking submitted successfully:",
            result
        );

        try {
            localStorage.setItem(
                "lastBooking",
                JSON.stringify(
                    Object.fromEntries(formData.entries())
                )
            );
        } catch (storageError) {
            console.warn(
                "Could not save booking locally:",
                storageError
            );
        }

        showNotification(
            "আপনার বুকিং সফলভাবে পাঠানো হয়েছে। আমাদের MR MOIN টিম শীঘ্রই আপনার সাথে যোগাযোগ করবে।",
            "success"
        );

        form.reset();

    } catch (error) {

        console.error(
            "Booking error:",
            error
        );

        showNotification(
            "বুকিং পাঠানো যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।",
            "error"
        );

    } finally {

        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    }
}


async function submitContactForm(form) {

    if (!form) {
        return;
    }

    const submitButton =
        form.querySelector('[type="submit"]');

    const originalText =
        submitButton ? submitButton.innerHTML : "";

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = "Sending...";
    }

    try {

        const formData = new FormData(form);

        const response =
            await fetch("/api/contact", {
                method: "POST",
                body: formData
            });

        if (!response.ok) {

            throw new Error(
                `Contact request failed: HTTP ${response.status}`
            );
        }

        let result = null;

        try {
            result = await response.json();
        } catch {
            result = null;
        }

        console.log(
            "Contact form submitted:",
            result
        );

        showNotification(
            "আপনার মেসেজ সফলভাবে পাঠানো হয়েছে।",
            "success"
        );

        form.reset();

    } catch (error) {

        console.error(
            "Contact form error:",
            error
        );

        showNotification(
            "মেসেজ পাঠানো যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।",
            "error"
        );

    } finally {

        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    }
}


async function submitEstimator(form) {

    if (!form) {
        return;
    }

    const submitButton =
        form.querySelector('[type="submit"]');

    const originalText =
        submitButton ? submitButton.innerHTML : "";

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = "Calculating...";
    }

    try {

        const formData = new FormData(form);

        const response =
            await fetch(
                "https://formsubmit.co/ajax/contact.electrotechbd@gmail.com",
                {
                    method: "POST",
                    body: formData,
                    headers: {
                        Accept: "application/json"
                    }
                }
            );

        if (!response.ok) {

            throw new Error(
                `Estimator request failed: HTTP ${response.status}`
            );
        }

        let result = null;

        try {
            result = await response.json();
        } catch {
            result = null;
        }

        console.log(
            "Estimator submitted:",
            result
        );

        showNotification(
            "আপনার তথ্য সফলভাবে পাঠানো হয়েছে।",
            "success"
        );

    } catch (error) {

        console.error(
            "Estimator error:",
            error
        );

        showNotification(
            "তথ্য পাঠানো যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।",
            "error"
        );

    } finally {

        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    }
}


function showNotification(message, type = "info") {

    let container =
        document.getElementById("notification-container");

    if (!container) {

        container =
            document.createElement("div");

        container.id =
            "notification-container";

        container.style.position = "fixed";
        container.style.top = "20px";
        container.style.right = "20px";
        container.style.zIndex = "99999";
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.gap = "10px";

        document.body.appendChild(container);
    }

    const notification =
        document.createElement("div");

    notification.className =
        `notification notification-${type}`;

    notification.textContent = message;

    notification.style.padding = "14px 18px";
    notification.style.borderRadius = "10px";
    notification.style.background = "#111";
    notification.style.color = "#fff";
    notification.style.border = "1px solid rgba(255,255,255,.15)";
    notification.style.boxShadow =
        "0 10px 30px rgba(0,0,0,.3)";
    notification.style.maxWidth = "360px";

    container.appendChild(notification);

    setTimeout(() => {

        notification.style.opacity = "0";
        notification.style.transform =
            "translateX(20px)";
        notification.style.transition =
            "all .3s ease";

        setTimeout(() => {
            notification.remove();
        }, 300);

    }, 4000);
}


function setupForms() {

    const bookingForms =
        document.querySelectorAll(
            "#booking-form, .booking-form"
        );

    bookingForms.forEach(form => {

        form.addEventListener("submit", event => {

            event.preventDefault();

            submitBooking(form);
        });
    });

    const contactForms =
        document.querySelectorAll(
            "#contact-form, .contact-form"
        );

    contactForms.forEach(form => {

        form.addEventListener("submit", event => {

            event.preventDefault();

            submitContactForm(form);
        });
    });

    const estimatorForms =
        document.querySelectorAll(
            "#estimator-form, .estimator-form"
        );

    estimatorForms.forEach(form => {

        form.addEventListener("submit", event => {

            event.preventDefault();

            submitEstimator(form);
        });
    });
}


function setupNewsletter() {

    const forms =
        document.querySelectorAll(
            ".newsletter-form, #newsletter-form"
        );

    forms.forEach(form => {

        form.addEventListener("submit", async event => {

            event.preventDefault();

            const button =
                form.querySelector('[type="submit"]');

            const originalText =
                button ? button.innerHTML : "";

            if (button) {
                button.disabled = true;
                button.innerHTML = "Subscribing...";
            }

            try {

                const formData =
                    new FormData(form);

                const response =
                    await fetch(
                        "/api/contact",
                        {
                            method: "POST",
                            body: formData
                        }
                    );

                if (!response.ok) {

                    throw new Error(
                        `Newsletter request failed: HTTP ${response.status}`
                    );
                }

                showNotification(
                    "আপনি সফলভাবে newsletter-এ subscribe করেছেন।",
                    "success"
                );

                form.reset();

            } catch (error) {

                console.error(
                    "Newsletter error:",
                    error
                );

                showNotification(
                    "Subscribe করা যায়নি। আবার চেষ্টা করুন।",
                    "error"
                );

            } finally {

                if (button) {
                    button.disabled = false;
                    button.innerHTML = originalText;
                }
            }
        });
    });
}


function setupFAQ() {

    const questions =
        document.querySelectorAll(
            ".faq-question, .faq-header"
        );

    questions.forEach(question => {

        question.addEventListener("click", () => {

            const item =
                question.closest(
                    ".faq-item"
                );

            if (!item) {
                return;
            }

            const answer =
                item.querySelector(
                    ".faq-answer"
                );

            const isActive =
                item.classList.contains("active");

            document
                .querySelectorAll(".faq-item.active")
                .forEach(activeItem => {

                    if (activeItem !== item) {

                        activeItem.classList.remove(
                            "active"
                        );

                        const activeAnswer =
                            activeItem.querySelector(
                                ".faq-answer"
                            );

                        if (activeAnswer) {
                            activeAnswer.style.maxHeight =
                                null;
                        }
                    }
                });

            item.classList.toggle(
                "active",
                !isActive
            );

            if (!answer) {
                return;
            }

            if (!isActive) {

                answer.style.maxHeight =
                    `${answer.scrollHeight}px`;

            } else {

                answer.style.maxHeight = null;
            }
        });
    });
}


/* =========================================
   VOICE ASSISTANT
========================================= */

const voiceCommands = [
    {
        patterns: [
            "লাইট চালু",
            "লাইট অন",
            "light on",
            "turn on light"
        ],
        action: () => {

            if (!state.light) {
                toggleAppliance("light");
            }

            return "লাইট চালু করা হয়েছে।";
        }
    },

    {
        patterns: [
            "লাইট বন্ধ",
            "লাইট অফ",
            "light off",
            "turn off light"
        ],
        action: () => {

            if (state.light) {
                toggleAppliance("light");
            }

            return "লাইট বন্ধ করা হয়েছে।";
        }
    },

    {
        patterns: [
            "ফ্যান চালু",
            "ফ্যান অন",
            "fan on",
            "turn on fan"
        ],
        action: () => {

            if (!state.fan) {
                toggleAppliance("fan");
            }

            return "ফ্যান চালু করা হয়েছে।";
        }
    },

    {
        patterns: [
            "ফ্যান বন্ধ",
            "ফ্যান অফ",
            "fan off",
            "turn off fan"
        ],
        action: () => {

            if (state.fan) {
                toggleAppliance("fan");
            }

            return "ফ্যান বন্ধ করা হয়েছে।";
        }
    },

    {
        patterns: [
            "এসি চালু",
            "এসি অন",
            "ac on",
            "turn on ac"
        ],
        action: () => {

            if (!state.ac) {
                toggleAppliance("ac");
            }

            return "এসি চালু করা হয়েছে।";
        }
    },

    {
        patterns: [
            "এসি বন্ধ",
            "এসি অফ",
            "ac off",
            "turn off ac"
        ],
        action: () => {

            if (state.ac) {
                toggleAppliance("ac");
            }

            return "এসি বন্ধ করা হয়েছে।";
        }
    },

    {
        patterns: [
            "সেন্সর চালু",
            "সেন্সর অন",
            "sensor on"
        ],
        action: () => {

            if (!state.sensor) {
                toggleAppliance("sensor");
            }

            return "সেন্সর চালু করা হয়েছে।";
        }
    },

    {
        patterns: [
            "সেন্সর বন্ধ",
            "সেন্সর অফ",
            "sensor off"
        ],
        action: () => {

            if (state.sensor) {
                toggleAppliance("sensor");
            }

            return "সেন্সর বন্ধ করা হয়েছে।";
        }
    }
];


function normalizeVoiceText(text) {

    return text
        .toLowerCase()
        .trim()
        .replace(/[।,!?.]/g, "");
}


function triggerVoiceCommand(commandText) {

    if (!commandText) {
        return "আমি কোনো কমান্ড শুনতে পাইনি।";
    }

    const normalized =
        normalizeVoiceText(commandText);

    for (const command of voiceCommands) {

        const matched =
            command.patterns.some(pattern => {

                return normalized.includes(
                    normalizeVoiceText(pattern)
                );
            });

        if (matched) {
            return command.action();
        }
    }

    return `আমি "${commandText}" কমান্ডটি বুঝতে পারিনি।`;
}


let recognition = null;
let isListening = false;


function setupVoiceAssistant() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    const button =
        document.getElementById("voice-assistant-btn") ||
        document.querySelector(
            ".voice-assistant-btn, [data-voice-assistant]"
        );

    const status =
        document.getElementById("voice-status");

    if (!button) {
        return;
    }

    if (!SpeechRecognition) {

        button.addEventListener("click", () => {

            showNotification(
                "আপনার browser Speech Recognition support করে না। Chrome/Edge ব্যবহার করুন।",
                "error"
            );
        });

        return;
    }

    recognition =
        new SpeechRecognition();

    recognition.lang = "bn-BD";

    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.maxAlternatives = 1;

    recognition.onstart = () => {

        isListening = true;

        button.classList.add("listening");

        if (status) {
            status.textContent =
                "শুনছি...";
        }
    };

    recognition.onresult = event => {

        const transcript =
            event.results[0][0].transcript;

        const reply =
            triggerVoiceCommand(transcript);

        if (status) {
            status.textContent =
                reply;
        }

        showNotification(
            reply,
            "success"
        );
    };

    recognition.onerror = event => {

        console.error(
            "Voice recognition error:",
            event.error
        );

        if (status) {

            status.textContent =
                "Voice command কাজ করেনি। আবার চেষ্টা করুন।";
        }

        showNotification(
            "Voice command কাজ করেনি। আবার চেষ্টা করুন।",
            "error"
        );
    };

    recognition.onend = () => {

        isListening = false;

        button.classList.remove(
            "listening"
        );
    };

    button.addEventListener("click", () => {

        if (isListening) {

            recognition.stop();

            return;
        }

        try {

            recognition.start();

        } catch (error) {

            console.error(
                "Could not start voice recognition:",
                error
            );
        }
    });
}


/* =========================================
   CHATBOT - VOLT
========================================= */

const CHAT_CONFIG = {

    assistantName: "ভোল্ট",

    phone: "+8801710830391",

    website: "https://electrotechbd.xyz",

    maxHistory: 12,

    apiUrl: ""
};


const CHAT_KNOWLEDGE = [

    {
        keywords: [
            "হ্যালো",
            "হাই",
            "hello",
            "hi",
            "assalamu alaikum",
            "আসসালামু আলাইকুম"
        ],

        reply:
            "আসসালামু আলাইকুম! ⚡ আমি ভোল্ট, ElectroTech-এর Smart Electrical Assistant। কীভাবে সাহায্য করতে পারি?"
    },

    {
        keywords: [
            "price",
            "দাম",
            "কত টাকা",
            "খরচ"
        ],

        reply:
            "কাজের ধরন, সাইট এবং প্রয়োজন অনুযায়ী electrical কাজের খরচ পরিবর্তন হয়। সঠিক quotation-এর জন্য আমাদের সাথে consultation করতে পারেন।"
    },

    {
        keywords: [
            "booking",
            "বুকিং",
            "appointment",
            "অ্যাপয়েন্টমেন্ট"
        ],

        reply:
            "আপনি website-এর booking form ব্যবহার করে কাজের জন্য request পাঠাতে পারেন। আমাদের MR MOIN টিম আপনার সাথে যোগাযোগ করবে।"
    },

    {
        keywords: [
            "location",
            "লোকেশন",
            "কোথায়",
            "কোথায়"
        ],

        reply:
            "ElectroTech ঢাকা শহরের বিভিন্ন এলাকায় electrical ও engineering service প্রদান করে। আপনার location জানালে service availability সম্পর্কে জানানো যাবে।"
    },

    {
        keywords: [
            "phone",
            "মোবাইল",
            "ফোন",
            "যোগাযোগ"
        ],

        reply:
            `যোগাযোগ: ${CHAT_CONFIG.phone}`
    },

    {
        keywords: [
            "smart automation",
            "automation",
            "স্মার্ট অটোমেশন"
        ],

        reply:
            "ElectroTech smart home automation, electrical control এবং connected-device solution নিয়ে কাজ করে।"
    },

    {
        keywords: [
            "light",
            "লাইট",
            "বাতি"
        ],

        reply:
            "Smart lighting-এর মাধ্যমে light remotely বা automatedভাবে control করা যায়।"
    },

    {
        keywords: [
            "fan",
            "ফ্যান"
        ],

        reply:
            "Smart fan control ব্যবহার করে fan automation ও remote control করা সম্ভব।"
    },

    {
        keywords: [
            "old wiring",
            "পুরাতন wiring",
            "পুরোনো wiring",
            "wiring"
        ],

        reply:
            "পুরোনো বা damaged wiring থাকলে inspection করে প্রয়োজন অনুযায়ী rewiring বা repair করা উচিত।"
    },

    {
        keywords: [
            "solar",
            "সোলার"
        ],

        reply:
            "Solar electrical system design ও installation-এর প্রয়োজন হলে site assessment অনুযায়ী solution তৈরি করা যায়।"
    },

    {
        keywords: [
            "website",
            "ওয়েবসাইট",
            "ওয়েবসাইট"
        ],

        reply:
            `ElectroTech website: ${CHAT_CONFIG.website}`
    },

    {
        keywords: [
            "license",
            "লাইসেন্স"
        ],

        reply:
            "Electrical কাজের ক্ষেত্রে প্রয়োজনীয় অনুমোদন ও safety requirements project অনুযায়ী যাচাই করা গুরুত্বপূর্ণ।"
    },

    {
        keywords: [
            "safety",
            "নিরাপত্তা",
            "সেফটি"
        ],

        reply:
            "Electrical কাজের সময় power isolation, proper protection এবং qualified electrician ব্যবহার করা অত্যন্ত গুরুত্বপূর্ণ।"
    },

    {
        keywords: [
            "project",
            "প্রজেক্ট",
            "কাজ"
        ],

        reply:
            "ElectroTech residential, commercial এবং electrical engineering related বিভিন্ন project নিয়ে কাজ করতে পারে।"
    },

    {
        keywords: [
            "ceo",
            "সিইও"
        ],

        reply:
            "ElectroTech-এর business এবং technical operations সম্পর্কে জানতে আমাদের team-এর সাথে যোগাযোগ করতে পারেন।"
    },

    {
        keywords: [
            "time",
            "সময়",
            "সময়"
        ],

        reply:
            "Service timing project এবং location অনুযায়ী নির্ধারণ করা হয়।"
    },

    {
        keywords: [
            "ধন্যবাদ",
            "thanks",
            "thank you"
        ],

        reply:
            "আপনাকেও ধন্যবাদ! ⚡ ইলেকট্রিক্যাল কাজ সম্পর্কে আপনার আরও কোনো প্রশ্ন থাকলে, নির্দ্বিধায় জানাতে পারেন।"
    }
];


let chatHistory = [];


function findLocalChatReply(message) {

    const normalized =
        normalizeVoiceText(message);

    for (const item of CHAT_KNOWLEDGE) {

        const matched =
            item.keywords.some(keyword => {

                return normalized.includes(
                    normalizeVoiceText(keyword)
                );
            });

        if (matched) {
            return item.reply;
        }
    }

    return null;
}


async function chatGetReply(message) {

    if (!message) {
        return "আপনার প্রশ্নটি লিখুন।";
    }

    chatHistory.push({
        role: "user",
        content: message
    });

    if (
        chatHistory.length >
        CHAT_CONFIG.maxHistory
    ) {

        chatHistory =
            chatHistory.slice(
                -CHAT_CONFIG.maxHistory
            );
    }


    if (CHAT_CONFIG.apiUrl) {

        try {

            const response =
                await fetch(
                    CHAT_CONFIG.apiUrl,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            message,
                            history: chatHistory
                        })
                    }
                );

            if (!response.ok) {

                throw new Error(
                    `Chat API HTTP ${response.status}`
                );
            }

            const data =
                await response.json();

            const reply =
                data.reply ||
                data.message ||
                data.response;

            if (reply) {

                chatHistory.push({
                    role: "assistant",
                    content: reply
                });

                return reply;
            }

        } catch (error) {

            console.error(
                "Chat API error:",
                error
            );
        }
    }


    const localReply =
        findLocalChatReply(message);

    if (localReply) {

        chatHistory.push({
            role: "assistant",
            content: localReply
        });

        return localReply;
    }


    const fallback =
        `দুঃখিত, এই প্রশ্নের নির্দিষ্ট উত্তর আমার knowledge base-এ নেই। আপনি চাইলে আমাদের সাথে ${CHAT_CONFIG.phone} নম্বরে যোগাযোগ করতে পারেন অথবা website-এর booking form ব্যবহার করতে পারেন।`;

    chatHistory.push({
        role: "assistant",
        content: fallback
    });

    return fallback;
}


function setupChatbot() {

    const input =
        document.getElementById("chat-input") ||
        document.querySelector(
            ".chat-input"
        );

    const sendButton =
        document.getElementById("chat-send") ||
        document.querySelector(
            ".chat-send"
        );

    const messagesContainer =
        document.getElementById("chat-messages") ||
        document.querySelector(
            ".chat-messages"
        );

    const chatbot =
        document.getElementById("chatbot") ||
        document.querySelector(
            ".chatbot"
        );

    const toggleButton =
        document.getElementById("chat-toggle") ||
        document.querySelector(
            ".chat-toggle"
        );

    if (!input || !sendButton || !messagesContainer) {
        return;
    }


    function addMessage(
        message,
        sender = "bot"
    ) {

        const messageElement =
            document.createElement("div");

        messageElement.className =
            `chat-message ${sender}`;

        messageElement.textContent =
            message;

        messagesContainer.appendChild(
            messageElement
        );

        messagesContainer.scrollTop =
            messagesContainer.scrollHeight;
    }


    async function sendMessage() {

        const message =
            input.value.trim();

        if (!message) {
            return;
        }

        addMessage(
            message,
            "user"
        );

        input.value = "";

        sendButton.disabled = true;

        const typing =
            document.createElement("div");

        typing.className =
            "chat-message bot typing";

        typing.textContent =
            `${CHAT_CONFIG.assistantName} লিখছে...`;

        messagesContainer.appendChild(
            typing
        );

        messagesContainer.scrollTop =
            messagesContainer.scrollHeight;


        try {

            const reply =
                await chatGetReply(message);

            typing.remove();

            addMessage(
                reply,
                "bot"
            );

        } catch (error) {

            console.error(
                "Chatbot error:",
                error
            );

            typing.remove();

            addMessage(
                "দুঃখিত, বর্তমানে কিছু সমস্যা হচ্ছে। পরে আবার চেষ্টা করুন।",
                "bot"
            );

        } finally {

            sendButton.disabled = false;

            input.focus();
        }
    }


    sendButton.addEventListener(
        "click",
        sendMessage
    );


    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();
            }
        }
    );


    if (toggleButton && chatbot) {

        toggleButton.addEventListener(
            "click",
            () => {

                chatbot.classList.toggle(
                    "active"
                );
            }
        );
    }
}


/* =========================================
   GLOBAL BUTTON HELPERS
========================================= */

function setupApplianceButtons() {

    document
        .querySelectorAll(
            "[data-appliance]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const type =
                        button.dataset.appliance;

                    toggleAppliance(type);
                }
            );
        });


    document
        .querySelectorAll(
            "[data-ac-increase]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                increaseAC
            );
        });


    document
        .querySelectorAll(
            "[data-ac-decrease]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                decreaseAC
            );
        });
}


function setupSmoothScroll() {

    document
        .querySelectorAll(
            'a[href^="#"]'
        )
        .forEach(link => {

            link.addEventListener(
                "click",
                event => {

                    const href =
                        link.getAttribute("href");

                    if (
                        !href ||
                        href === "#"
                    ) {
                        return;
                    }

                    const target =
                        document.querySelector(
                            href
                        );

                    if (!target) {
                        return;
                    }

                    event.preventDefault();

                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }
            );
        });
}


/* =========================================
   INITIALIZATION
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        try {
            setupMobileMenu();
        } catch (error) {
            console.error(
                "Mobile menu initialization error:",
                error
            );
        }


        try {
            setupRevealAnimations();
        } catch (error) {
            console.error(
                "Reveal animation initialization error:",
                error
            );
        }


        try {
            setupDragAndDrop();
        } catch (error) {
            console.error(
                "Drag/drop initialization error:",
                error
            );
        }


        try {
            setupForms();
        } catch (error) {
            console.error(
                "Form initialization error:",
                error
            );
        }


        try {
            setupNewsletter();
        } catch (error) {
            console.error(
                "Newsletter initialization error:",
                error
            );
        }


        try {
            setupFAQ();
        } catch (error) {
            console.error(
                "FAQ initialization error:",
                error
            );
        }


        try {
            setupVoiceAssistant();
        } catch (error) {
            console.error(
                "Voice assistant initialization error:",
                error
            );
        }


        try {
            setupChatbot();
        } catch (error) {
            console.error(
                "Chatbot initialization error:",
                error
            );
        }


        try {
            setupApplianceButtons();
        } catch (error) {
            console.error(
                "Appliance button initialization error:",
                error
            );
        }


        try {
            setupSmoothScroll();
        } catch (error) {
            console.error(
                "Smooth scroll initialization error:",
                error
            );
        }


        try {
            setMinimumDate();
        } catch (error) {
            console.error(
                "Date initialization error:",
                error
            );
        }


        try {
            updateClimateSensor();

            setInterval(
                updateClimateSensor,
                30000
            );
        } catch (error) {
            console.error(
                "Climate sensor initialization error:",
                error
            );
        }


        try {
            updateEnergyMeter();
        } catch (error) {
            console.error(
                "Energy meter initialization error:",
                error
            );
        }


        console.log(
            "ElectroTech JavaScript initialized successfully."
        );
    }
);


/* =========================================
   WINDOW EXPORTS
   Keeps compatibility with inline HTML
   onclick handlers.
========================================= */

window.toggleAppliance =
    toggleAppliance;

window.increaseAC =
    increaseAC;

window.decreaseAC =
    decreaseAC;

window.updateEnergyMeter =
    updateEnergyMeter;

window.updateClimateSensor =
    updateClimateSensor;

window.triggerVoiceCommand =
    triggerVoiceCommand;

window.chatGetReply =
    chatGetReply;

window.submitBooking =
    submitBooking;

window.submitContactForm =
    submitContactForm;

window.submitEstimator =
    submitEstimator;
