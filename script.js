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
                'স্ট্যাটাস: <span style="color:#00bfff;font-weight:bold;">রানিং (100%)</span>';

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
                'স্ট্যাটাস: <span style="color:#ff0055;font-weight:bold;">MOTION DETECTED!</span>';

        } else {

            card.classList.remove("active-sensor");

            status.innerHTML =
                'স্ট্যাটাস: <span>নিষ্ক্রিয় (IDLE)</span>';
        }
    }

    if (type === "ac") {

        if (state.ac) {

            card.classList.add("active-ac");

            status.innerHTML =
                `স্ট্যাটাস: <span style="color:#38bdf8;font-weight:bold;">কুলিং (${acTemp}°C)</span>`;

        } else {

            card.classList.remove("active-ac");

            status.innerHTML =
                'স্ট্যাটাস: <span>অফ (OFF)</span>';
        }
    }

    const logMessages = {
        light: state.light ? "স্মার্ট লাইট চালু (ON) করা হয়েছে" : "স্মার্ট লাইট বন্ধ (OFF) করা হয়েছে",
        fan: state.fan ? "স্মার্ট ফ্যান চালু (ON) করা হয়েছে" : "স্মার্ট ফ্যান বন্ধ (OFF) করা হয়েছে",
        sensor: state.sensor ? "মোশন সেন্সর ট্রিগার হয়েছে — মুভমেন্ট ডিটেক্টেড" : "মোশন সেন্সর আইডল অবস্থায় ফিরেছে",
        ac: state.ac ? `স্মার্ট এসি চালু হয়েছে — ${acTemp}°C তে সেট করা` : "স্মার্ট এসি বন্ধ করা হয়েছে"
    };

    logActivity(logMessages[type]);
    updateEnergyMeter();
}

/* ---------- AC Temperature Control ---------- */
function adjustAcTemp(direction) {

    const newTemp = acTemp + direction;

    if (newTemp < 18 || newTemp > 30) {
        return;
    }

    acTemp = newTemp;

    const tempLabel = document.getElementById("ac-temp-value");

    if (tempLabel) {
        tempLabel.textContent = `${acTemp}°C`;
    }

    if (state.ac) {

        const status = document.getElementById("status-ac");

        if (status) {
            status.innerHTML =
                `স্ট্যাটাস: <span style="color:#38bdf8;font-weight:bold;">কুলিং (${acTemp}°C)</span>`;
        }

        logActivity(`এসি টেম্পারেচার ${acTemp}°C এ সেট করা হয়েছে`);
        updateEnergyMeter();
    }
}

/* ---------- Activity Log ---------- */
function logActivity(message) {

    const list = document.getElementById("activity-log");

    if (!list) {
        return;
    }

    const emptyItem = list.querySelector(".log-empty");

    if (emptyItem) {
        emptyItem.remove();
    }

    const li = document.createElement("li");

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    li.innerHTML = `<span class="log-time">${timeStr}</span>${message}`;

    list.prepend(li);

    while (list.children.length > 6) {
        list.removeChild(list.lastChild);
    }
}

/* ---------- Energy Meter ---------- */
const applianceWatts = {
    light: 15,
    fan: 60
};

const AC_MAX_WATTS = 1500; // ১৮°C (সর্বোচ্চ কুলিং লোড)
const AC_MIN_WATTS = 1080; // ৩০°C (সর্বনিম্ন কুলিং লোড)

function acWattsForTemp(temp) {
    const ratio = (temp - 18) / (30 - 18);
    return Math.round(AC_MAX_WATTS - ratio * (AC_MAX_WATTS - AC_MIN_WATTS));
}

const ELEC_RATE_TAKA = 7.5; // আনুমানিক গড় ইউনিট প্রতি রেট (৳/kWh)

const usageWithoutAutomation = { light: 8, fan: 10, ac: 10 }; // ঘণ্টা/দিন — ম্যানুয়াল ব্যবহার (ভুলে চালু থাকা সহ)
const usageWithAutomation = { light: 5, fan: 6, ac: 6 };      // ঘণ্টা/দিন — ElectroTech স্মার্ট অটোমেশন সহ (motion/timer/occupancy ভিত্তিক)

function calcMonthlySavings() {

    const acAvgWatts = acWattsForTemp(24); // গড় সেটিং ধরে হিসাব

    const baselineKwh =
        ((applianceWatts.light * usageWithoutAutomation.light) +
         (applianceWatts.fan * usageWithoutAutomation.fan) +
         (acAvgWatts * usageWithoutAutomation.ac)) / 1000 * 30;

    const smartKwh =
        ((applianceWatts.light * usageWithAutomation.light) +
         (applianceWatts.fan * usageWithAutomation.fan) +
         (acAvgWatts * usageWithAutomation.ac)) / 1000 * 30;

    return Math.max(0, Math.round((baselineKwh - smartKwh) * ELEC_RATE_TAKA));
}

function updateEnergyMeter() {

    const bar = document.getElementById("energy-bar");
    const wattsLabel = document.getElementById("energy-watts");
    const noteLabel = document.getElementById("energy-note");
    const savingsLabel = document.getElementById("energy-savings");

    if (!bar || !wattsLabel || !noteLabel) {
        return;
    }

    let totalWatts = 0;

    if (state.light) {
        totalWatts += applianceWatts.light;
    }

    if (state.fan) {
        totalWatts += applianceWatts.fan;
    }

    if (state.ac) {
        totalWatts += acWattsForTemp(acTemp);
    }

    const maxWatts = applianceWatts.light + applianceWatts.fan + AC_MAX_WATTS;
    const percent = maxWatts === 0 ? 0 : Math.round((totalWatts / maxWatts) * 100);

    bar.style.width = `${percent}%`;
    wattsLabel.textContent = `${totalWatts} W`;

    if (totalWatts === 0) {
        noteLabel.textContent = "সব ডিভাইস বন্ধ আছে";
    } else if (totalWatts < maxWatts * 0.5) {
        noteLabel.textContent = "এনার্জি সাশ্রয়ী মোডে চলছে";
    } else {
        noteLabel.textContent = "সর্বোচ্চ লোডে চলছে";
    }

    if (savingsLabel) {
        const savings = calcMonthlySavings();
        savingsLabel.textContent = `স্মার্ট অটোমেশন দিয়ে আনুমানিক মাসিক সাশ্রয়: ৳ ${savings}`;
    }
}

/* ---------- Climate Sensor ---------- */
function getClimateRange() {

    const hour = new Date().getHours();

    if (hour >= 0 && hour < 6) {
        return { tempMin: 22, tempMax: 26, humMin: 75, humMax: 90 };
    }

    if (hour >= 6 && hour < 11) {
        return { tempMin: 25, tempMax: 29, humMin: 60, humMax: 75 };
    }

    if (hour >= 11 && hour < 16) {
        return { tempMin: 30, tempMax: 36, humMin: 40, humMax: 55 };
    }

    if (hour >= 16 && hour < 20) {
        return { tempMin: 28, tempMax: 32, humMin: 50, humMax: 65 };
    }

    return { tempMin: 25, tempMax: 28, humMin: 65, humMax: 80 };
}

function refreshClimate(silent) {

    const tempEl = document.getElementById("temp-value");
    const humEl = document.getElementById("humidity-value");
    const card = document.getElementById("card-climate");

    if (!tempEl || !humEl) {
        return;
    }

    const range = getClimateRange();

    const temp = (Math.random() * (range.tempMax - range.tempMin) + range.tempMin).toFixed(1);
    const humidity = Math.round(Math.random() * (range.humMax - range.humMin) + range.humMin);

    tempEl.textContent = `${temp}°C`;
    humEl.textContent = `${humidity}% Humidity`;

    if (silent) {
        return;
    }

    if (card) {
        card.classList.remove("pulse-update");
        void card.offsetWidth;
        card.classList.add("pulse-update");
    }

    logActivity(`Climate reading আপডেট হয়েছে — ${temp}°C, ${humidity}% Humidity`);
}

/* ---------- Voice Assistant ---------- */
const voiceCommands = [
    { phrase: '"লাইট জ্বালাও"', action: () => { if (!state.light) { toggleAppliance("light"); } } },
    { phrase: '"লাইট বন্ধ করো"', action: () => { if (state.light) { toggleAppliance("light"); } } },
    { phrase: '"ফ্যান চালাও"', action: () => { if (!state.fan) { toggleAppliance("fan"); } } },
    { phrase: '"ফ্যান বন্ধ করো"', action: () => { if (state.fan) { toggleAppliance("fan"); } } }
];

function triggerVoiceCommand() {

    const card = document.getElementById("card-voice");
    const status = document.getElementById("status-voice");

    if (!card || !status) {
        return;
    }

    if (card.classList.contains("voice-listening")) {
        return;
    }

    card.classList.add("voice-listening");
    status.innerHTML = 'স্ট্যাটাস: <span style="color:#a855f7;font-weight:bold;">শুনছে...</span>';

    setTimeout(() => {

        const command = voiceCommands[Math.floor(Math.random() * voiceCommands.length)];

        status.innerHTML = `স্ট্যাটাস: <span style="color:#a855f7;font-weight:bold;">কমান্ড: ${command.phrase}</span>`;

        logActivity(`ভয়েস কমান্ড প্রসেস হয়েছে — ${command.phrase}`);

        command.action();

        setTimeout(() => {
            card.classList.remove("voice-listening");
            status.innerHTML = 'স্ট্যাটাস: <span>স্ট্যান্ডবাই</span>';
        }, 1800);

    }, 1200);
}

let currentSqft = 1200;
let roomCount = 3;
let selectedGrade = "standard";

function updateRooms(change) {

    roomCount += Number(change) || 0;

    if (roomCount < 1) {
        roomCount = 1;
    }

    const roomElement = document.getElementById("room-count");

    if (roomElement) {
        roomElement.innerText = roomCount;
    }

    calculateBudget();
}

function setGrade(grade, element) {

    if (grade !== "standard" && grade !== "smart") {
        return;
    }

    selectedGrade = grade;

    document
        .querySelectorAll(".grade-card")
        .forEach(card => {
            card.classList.remove("active");
        });

    if (element) {
        element.classList.add("active");
    }

    calculateBudget();
}

function calculateBudget() {

    const slider = document.getElementById("sqft-slider");

    if (!slider) {
        return;
    }

    currentSqft = parseInt(slider.value, 10) || 1200;

    const sqftValue = document.getElementById("sqft-val");

    if (sqftValue) {
        sqftValue.innerText =
            `${currentSqft.toLocaleString()} Sq.Ft`;
    }

    const solarToggle =
        document.getElementById("solar-toggle");

    const isSolar =
        solarToggle ? solarToggle.checked : false;

    let ratePerSqft = 25;

    if (selectedGrade === "smart") {
        ratePerSqft = 45;
    }

    const materialCost =
        (currentSqft * ratePerSqft) +
        (roomCount * 1500);

    const laborCost =
        materialCost * 0.45;

    let solarCost = 0;

    const solarRow =
        document.getElementById("solar-row");

    const solarCostElement =
        document.getElementById("solar-cost");

    if (isSolar) {

        solarCost =
            Math.round(currentSqft * 35);

        if (solarRow) {
            solarRow.style.display = "flex";
        }

        if (solarCostElement) {
            solarCostElement.innerText =
                `৳ ${solarCost.toLocaleString()}`;
        }

    } else {

        if (solarRow) {
            solarRow.style.display = "none";
        }
    }

    const totalBudget =
        Math.round(
            materialCost +
            laborCost +
            solarCost
        );

    const materialElement =
        document.getElementById("mat-cost");

    const laborElement =
        document.getElementById("labor-cost");

    const totalElement =
        document.getElementById("total-price");

    if (materialElement) {

        materialElement.innerText =
            `৳ ${Math.round(materialCost).toLocaleString()}`;
    }

    if (laborElement) {

        laborElement.innerText =
            `৳ ${Math.round(laborCost).toLocaleString()}`;
    }

    if (totalElement) {

        totalElement.innerText =
            `৳ ${totalBudget.toLocaleString()}`;
    }
}

function triggerConsultation() {

    const priceElement =
        document.getElementById("total-price");

    const price =
        priceElement
            ? priceElement.innerText
            : "৳ 0";

    const message =
        `আপনার নির্বাচিত আনুমানিক বাজেট: ${price}

আমাদের টিম আপনার সাথে যোগাযোগ করবে এবং প্রয়োজন অনুযায়ী প্রধান ইলেকট্রিশিয়ানের পরামর্শ দেবে।`;

    alert(message);

    sendEstimatorLead(price);

    const booking =
        document.getElementById("booking");

    if (booking) {

        setTimeout(() => {

            booking.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }, 300);
    }
}

function sendEstimatorLead(price) {

    const sqftElement =
        document.getElementById("sqft-val");

    const roomElement =
        document.getElementById("room-count");

    const activeGradeCard =
        document.querySelector(".grade-card.active h4");

    const solarToggle =
        document.getElementById("solar-toggle");

    const matElement =
        document.getElementById("mat-cost");

    const laborElement =
        document.getElementById("labor-cost");

    const solarCostElement =
        document.getElementById("solar-cost");

    const payload = {

        _subject:
            "\ud83d\udca1 \u09a8\u09a4\u09c1\u09a8 \u098f\u09b8\u09cd\u099f\u09bf\u09ae\u09c7\u099f\u09b0 \u09b2\u09bf\u09a1 - Free Consultation \u0995\u09cd\u09b2\u09bf\u0995 \u0995\u09b0\u09c7\u099b\u09c7",

        _captcha: "false",

        "\u09ae\u09cb\u099f \u098f\u09b0\u09bf\u09af\u09bc\u09be":
            sqftElement ? sqftElement.innerText.trim() : "N/A",

        "\u09ae\u09cb\u099f \u09b0\u09c1\u09ae":
            roomElement ? roomElement.innerText.trim() : "N/A",

        "\u0993\u09df\u09cd\u09af\u09be\u09b0\u09bf\u0982 \u0997\u09cd\u09b0\u09c7\u09a1":
            activeGradeCard ? activeGradeCard.innerText.trim() : "N/A",

        "\u09b8\u09cb\u09b2\u09be\u09b0 \u09b8\u09bf\u09b8\u09cd\u099f\u09c7\u09ae":
            (solarToggle && solarToggle.checked) ? "\u09b9\u09cd\u09af\u09be\u0981" : "\u09a8\u09be",

        "\u0986\u09a8\u09c1\u09ae\u09be\u09a8\u09bf\u0995 \u09ae\u09cb\u099f \u0996\u09b0\u099a": price,

        "\u09ae\u09cd\u09af\u09be\u099f\u09c7\u09b0\u09bf\u09af\u09bc\u09be\u09b2\u09b8 \u0996\u09b0\u099a":
            matElement ? matElement.innerText.trim() : "N/A",

        "\u0987\u099e\u09cd\u099c\u09bf\u09a8\u09bf\u09df\u09be\u09b0\u09bf\u0982/\u09b2\u09c7\u09ac\u09be\u09b0 \u0996\u09b0\u099a":
            laborElement ? laborElement.innerText.trim() : "N/A",

        "\u09b8\u09cb\u09b2\u09be\u09b0 \u0985\u09cd\u09af\u09be\u09a1-\u0985\u09a8 \u0996\u09b0\u099a":
            (solarToggle && solarToggle.checked && solarCostElement)
                ? solarCostElement.innerText.trim()
                : "\u09aa\u09cd\u09b0\u09af\u09cb\u099c\u09cd\u09af \u09a8\u09df",

        "\u09b8\u09ae\u09df":
            new Date().toLocaleString("bn-BD")
    };

    fetch("https://formsubmit.co/ajax/contact.electrotechbd@gmail.com", {

        method: "POST",

        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },

        body: JSON.stringify(payload)

    }).catch(error => {

        console.warn(
            "Estimator lead email failed:",
            error
        );
    });
}

function updateFileName(input) {

    const display =
        document.getElementById("file-name-display");

    if (!display) {
        return;
    }

    if (
        input &&
        input.files &&
        input.files.length > 0
    ) {

        const file =
            input.files[0];

        const fileName =
            file.name;

        display.innerHTML =
            `<i class="fa-solid fa-file-circle-check"></i>
             ফাইল যুক্ত হয়েছে:
             <strong>${escapeHTML(fileName)}</strong>`;

        display.style.color =
            "#00ff66";

        display.style.borderColor =
            "#00ff66";

        display.style.background =
            "rgba(0, 255, 102, 0.1)";

    } else {

        display.innerHTML =
            `<i class="fa-solid fa-shield-cat"></i>
             কোনো ফাইল যুক্ত হয়নি (ঐচ্ছিক)`;

        display.style.color =
            "var(--accent-cyan, #00ffcc)";

        display.style.borderColor =
            "rgba(0, 255, 204, 0.4)";

        display.style.background =
            "rgba(0, 255, 204, 0.08)";
    }
}

function handleBookingSubmit(event) {

    const nameElement =
        document.getElementById("client-name");

    const phoneElement =
        document.getElementById("client-phone");

    const serviceElement =
        document.getElementById("service-type");

    const dateElement =
        document.getElementById("meeting-date");

    const notesElement =
        document.getElementById("project-notes");

    const name =
        nameElement ? nameElement.value.trim() : "";

    const phone =
        phoneElement ? phoneElement.value.trim() : "";

    const service =
        serviceElement ? serviceElement.value : "";

    const date =
        dateElement ? dateElement.value : "";

    const notes =
        notesElement ? notesElement.value.trim() : "";

    const fileElement =
        document.getElementById("blueprint-file");

    if (!name || !phone || !service || !date) {

        event.preventDefault();

        alert(
            "দয়া করে প্রয়োজনীয় সব তথ্য পূরণ করুন।"
        );

        return;
    }

    event.preventDefault();

    const randomNumber =
        Math.floor(
            1000 + Math.random() * 9000
        );

    const randomId =
        `#ENG-2050-${randomNumber}`;

    const modalName =
        document.getElementById("modal-client-name");

    const modalService =
        document.getElementById("modal-service");

    const modalDate =
        document.getElementById("modal-date");

    const modalId =
        document.getElementById("modal-id");

    if (modalName) {
        modalName.innerText = name;
    }

    if (modalService) {
        modalService.innerText = service;
    }

    if (modalDate) {
        modalDate.innerText = date;
    }

    if (modalId) {
        modalId.innerText = randomId;
    }

    const bookingData = {

        id: randomId,

        name: name,

        phone: phone,

        service: service,

        date: date,

        notes: notes,

        createdAt:
            new Date().toISOString()
    };

    try {

        localStorage.setItem(
            "electrotech_last_booking",
            JSON.stringify(bookingData)
        );

    } catch (error) {

        console.warn(
            "LocalStorage unavailable:",
            error
        );
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('phone', phone);
    formData.append('service', service);
    formData.append('date', date);
    formData.append('notes', notes);

    if (fileElement?.files?.[0]) {
        formData.append('attachment', fileElement.files[0]);
    }

    fetch('/api/bookings', {
        method: 'POST',
        body: formData
    }).catch(error => {
        console.warn('Backend booking save failed:', error);
    });
    const modal =
        document.getElementById("booking-modal");

    if (modal) {

        modal.classList.add("active");

        document.body.classList.add(
            "modal-open"
        );
    }
}

function closeBookingModal() {

    const modal =
        document.getElementById("booking-modal");

    if (modal) {

        modal.classList.remove("active");

        document.body.classList.remove(
            "modal-open"
        );
    }

    const form =
        document.getElementById("consultation-form");

    if (form) {

        form.reset();
    }

    const fileInput =
        document.getElementById("blueprint-file");

    if (fileInput) {

        updateFileName(fileInput);
    }
}

function handleNewsletterSubmit(event) {

    const contactElement =
        document.getElementById("newsletter-contact");

    const contact =
        contactElement ? contactElement.value.trim() : "";

    if (!contact) {

        event.preventDefault();

        alert(
            "দয়া করে আপনার ইমেইল অথবা ফোন নম্বর লিখুন।"
        );

        return;
    }

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const phonePattern =
        /^[0-9+\-\s]{7,15}$/;

    const isValid =
        emailPattern.test(contact) ||
        phonePattern.test(contact);

    if (!isValid) {

        event.preventDefault();

        alert(
            "দয়া করে সঠিক ইমেইল অথবা ফোন নম্বর লিখুন।"
        );

        return;
    }

    fetch('/api/contact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: 'Newsletter Contact',
            contact: contact,
            message: 'Newsletter/contact form submission'
        })
    }).catch(error => {
        console.warn('Backend contact save failed:', error);
    });
    setTimeout(() => {

        if (contactElement) {
            contactElement.value = "";
        }

        alert(
    `ধন্যবাদ! ElectroTech-এর সঙ্গে যোগাযোগ করার জন্য।

    আপনার প্রয়োজন ও তথ্য পর্যালোচনা করে আমাদের টিম প্রয়োজন অনুযায়ী আপনার সঙ্গে যোগাযোগ করবে।

    আপনি যদি আমাদের সঙ্গে কাজ করতে আগ্রহী হন, তাহলে উপরের Blueprint Form-টি সম্পূর্ণ করুন। আমাদের অভিজ্ঞ টিম আপনার তথ্য পর্যালোচনা করে পরবর্তী পদক্ষেপের জন্য আপনার সঙ্গে যোগাযোগ করবে।

    আপনার আস্থা ও সহযোগিতার জন্য ধন্যবাদ।

    ElectroTechBD ⚡
    Engineering & Smart Automation`
    );

    }, 400);
}

function initFAQ() {

    const questions =
        document.querySelectorAll(
            ".faq-question"
        );

    questions.forEach(button => {

        button.addEventListener(
            "click",
            function () {

                const faqItem =
                    this.parentElement;

                if (!faqItem) {
                    return;
                }

                const answer =
                    faqItem.querySelector(
                        ".faq-answer"
                    );

                document
                    .querySelectorAll(".faq-item")
                    .forEach(item => {

                        if (item !== faqItem) {

                            item.classList.remove(
                                "active"
                            );

                            const otherAnswer =
                                item.querySelector(
                                    ".faq-answer"
                                );

                            if (otherAnswer) {

                                otherAnswer.style.maxHeight =
                                    null;
                            }
                        }
                    });

                faqItem.classList.toggle(
                    "active"
                );

                if (
                    faqItem.classList.contains(
                        "active"
                    )
                ) {

                    if (answer) {

                        answer.style.maxHeight =
                            answer.scrollHeight +
                            "px";
                    }

                } else {

                    if (answer) {

                        answer.style.maxHeight =
                            null;
                    }
                }
            }
        );
    });
}

function initMobileMenu() {

    const toggle =
        document.querySelector(
            ".mobile-menu-toggle"
        );

    const nav =
        document.getElementById(
            "site-navigation"
        );

    if (!toggle || !nav) {
        return;
    }

    toggle.addEventListener(
        "click",
        function () {

            const isOpen =
                nav.classList.toggle(
                    "active"
                );

            toggle.classList.toggle(
                "active",
                isOpen
            );

            toggle.setAttribute(
                "aria-expanded",
                isOpen ? "true" : "false"
            );
        }
    );

    nav.querySelectorAll("a")
        .forEach(link => {

            link.addEventListener(
                "click",
                function () {

                    nav.classList.remove(
                        "active"
                    );

                    toggle.classList.remove(
                        "active"
                    );

                    toggle.setAttribute(
                        "aria-expanded",
                        "false"
                    );
                }
            );
        });
}

function initRevealAnimations() {

    const items =
        document.querySelectorAll(
            ".reveal-item"
        );

    if (!items.length) {
        return;
    }

    if (
        !("IntersectionObserver" in window)
    ) {

        items.forEach(item => {

            item.classList.add(
                "visible"
            );
        });

        return;
    }

    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (
                        entry.isIntersecting
                    ) {

                        entry.target.classList.add(
                            "visible"
                        );

                        observer.unobserve(
                            entry.target
                        );
                    }
                });

            },
            {
                threshold: 0.12
            }
        );

    items.forEach(item => {

        observer.observe(item);
    });
}

function initDateInput() {

    const dateInput =
        document.getElementById(
            "meeting-date"
        );

    if (!dateInput) {
        return;
    }

    const today =
        new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            today.getDate()
        ).padStart(2, "0");

    dateInput.min =
        `${year}-${month}-${day}`;
}

function initDragAndDrop() {

    const dropzone =
        document.getElementById(
            "dropzone"
        );

    const fileInput =
        document.getElementById(
            "blueprint-file"
        );

    if (!dropzone || !fileInput) {
        return;
    }

    [
        "dragenter",
        "dragover"
    ].forEach(eventName => {

        dropzone.addEventListener(
            eventName,
            event => {

                event.preventDefault();

                event.stopPropagation();

                dropzone.classList.add(
                    "drag-active"
                );
            }
        );
    });

    [
        "dragleave",
        "drop"
    ].forEach(eventName => {

        dropzone.addEventListener(
            eventName,
            event => {

                event.preventDefault();

                event.stopPropagation();

                dropzone.classList.remove(
                    "drag-active"
                );
            }
        );
    });

    dropzone.addEventListener(
        "drop",
        event => {

            const files =
                event.dataTransfer.files;

            if (
                files &&
                files.length > 0
            ) {

                try {

                    fileInput.files =
                        files;

                    updateFileName(
                        fileInput
                    );

                } catch (error) {

                    console.warn(
                        "Could not assign dropped file.",
                        error
                    );
                }
            }
        }
    );
}

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

const CHAT_CONFIG = {

    apiUrl: "",

    phone: "+8801710830391",

    website:
        "https://electrotechbd.xyz",

    assistantName:
        "ভোল্ট",

    maxHistory:
        12
};

const CHAT_KB = [

    {
        keys: [
            "দাম",
            "খরচ",
            "মূল্য",
            "বাজেট",
            "রেট",
            "price",
            "cost",
            "budget",
            "charge",
            "কত টাকা"
        ],

        reply:
            "খরচ নির্ভর করে কাজের ধরন, জায়গার আয়তন, রুম সংখ্যা এবং নির্বাচিত গ্রেডের উপর।\n\n" +
            "• Standard Wiring: ৳২৫ / Sq.Ft\n" +
            "• Smart IoT: ৳৪৫ / Sq.Ft\n" +
            "• Solar Add-on: আনুমানিক ৳৩৫ / Sq.Ft\n\n" +
            "সঠিক আনুমানিক হিসাব দেখতে আমাদের Smart Cost Estimator ব্যবহার করতে পারেন 👉 #estimator"
    },

    {
        keys: [
            "প্যাকেজ",
            "package",
            "pricing",
            "plan",
            "অফার"
        ],

        reply:
            "ElectroTech-এর প্রধান প্যাকেজগুলো হলো:\n\n" +
            "⚡ Basic Wiring — ৳২৫ / Sq.Ft\n" +
            "🏠 Smart Home IoT — ৳৪৫ / Sq.Ft\n" +
            "🏭 Industrial / Commercial — Custom Budget\n\n" +
            "বিস্তারিত দেখতে 👉 #pricing"
    },

    {
        keys: [
            "বুকিং",
            "বুক",
            "অ্যাপয়েন্টমেন্ট",
            "মিটিং",
            "book",
            "booking",
            "appointment",
            "schedule"
        ],

        reply:
            "বুকিং করতে আমাদের Booking Section-এ গিয়ে নাম, ফোন নম্বর, সার্ভিস এবং পছন্দের তারিখ দিন। চাইলে Blueprint বা Wiring Drawing-ও upload করতে পারবেন। 👉 #booking"
    },

    {
        keys: [
            "ঠিকানা",
            "অফিস",
            "কোথায়",
            "লোকেশন",
            "ম্যাপ",
            "map",
            "location",
            "address",
            "direction"
        ],

        reply:
            "ElectroTech-এর contact section-এ অফিসের location এবং Google Map দেওয়া আছে। 👉 #contact\n\n" +
            "বর্তমান ওয়েবসাইটে location হিসেবে Dhaka, Bangladesh দেখানো হয়েছে।"
    },

    {
        keys: [
            "ফোন",
            "যোগাযোগ",
            "নম্বর",
            "কল",
            "contact",
            "phone",
            "call",
            "whatsapp",
            "হোয়াটসঅ্যাপ"
        ],

        reply:
            "ElectroTech-এর সাথে সরাসরি যোগাযোগ করতে কল করুন:\n\n" +
            "📞 +880 1710830391\n\n" +
            "Booking-এর মাধ্যমে site visit request-ও করতে পারেন 👉 #booking"
    },

    {
        keys: [
            "স্মার্ট",
            "অটোমেশন",
            "esp32",
            "iot",
            "smart",
            "automation",
            "সেন্সর",
            "অ্যাপ"
        ],

        reply:
            "Smart Home Automation-এ ESP32 ও IoT ব্যবহার করে লাইট, ফ্যান এবং বিভিন্ন sensor-based system নিয়ন্ত্রণ করা যায়। মোবাইল App/Web বা voice control-এর মতো system ব্যবহার করা যেতে পারে।\n\n" +
            "আমাদের simulator দেখতে 👉 #simulator"
    },

    {
        keys: [
            "লাইট",
            "light",
            "বাতি"
        ],

        reply:
            "Smart Light automation-এর মাধ্যমে লাইটকে automated বা remote-controlled করা যায়। আমাদের Live Simulator-এ একটি demo দেখতে পারবেন 👉 #simulator"
    },

    {
        keys: [
            "ফ্যান",
            "fan"
        ],

        reply:
            "Smart Home system-এর মাধ্যমে fan control automation করা যায়। ElectroTech-এর simulator-এ fan control-এর একটি demo আছে 👉 #simulator"
    },

    {
        keys: [
            "পুরোনো",
            "পুরনো",
            "ওয়্যারিং",
            "wiring",
            "rewiring",
            "দেয়াল"
        ],

        reply:
            "পুরোনো wiring-এ smart automation যোগ করা সম্ভব হতে পারে, তবে wiring-এর condition, neutral availability, load এবং existing electrical system site inspection করে নিশ্চিত করা উচিত।"
    },

    {
        keys: [
            "সোলার",
            "solar",
            "সৌর",
            "বিদ্যুৎ বিল",
            "ব্যাকআপ",
            "ips"
        ],

        reply:
            "ElectroTech-এর estimator-এ Solar System option আছে। Solar select করলে আনুমানিক Solar Add-on cost মোট বাজেটে যোগ হয় 👉 #estimator"
    },

    {
        keys: [
            "ceo",
            "সিইও",
            "মালিক",
            "প্রতিষ্ঠাতা",
            "founder",
            "owner",
            "সাইদুজ্জামান",
            "কে চালায়",
            "কোম্পানির"
        ],

        reply:
            "ElectroTech Engineering & Automation-এর website information অনুযায়ী এইচ. এম. মো. সাইদুজ্জামান প্রতিষ্ঠাতা ও প্রধান নির্বাহী হিসেবে উল্লেখ আছেন। বিস্তারিত দেখতে 👉 #team"
    },

    {
        keys: [
            "ওয়েবসাইট",
            "সাইট",
            "website",
            "domain",
            "electrotechbd"
        ],

        reply:
            "ElectroTech-এর website: electrotechbd.xyz ⚡"
    },

    {
        keys: [
            "লাইসেন্স",
            "license",
            "permit",
            "অনুমোদন"
        ],

        reply:
            "ElectroTech website-এ Chief Electrician-এর জন্য Permit: E20230043144 উল্লেখ করা হয়েছে। লাইসেন্স/permit সম্পর্কিত সিদ্ধান্তের ক্ষেত্রে official verification করা সবচেয়ে ভালো।"
    },

    {
        keys: [
            "সেফটি",
            "নিরাপত্তা",
            "safe",
            "safety",
            "বিপদ",
            "শক",
            "electric shock"
        ],

        reply:
            "Electrical কাজের ক্ষেত্রে safety সবচেয়ে গুরুত্বপূর্ণ। Live circuit-এ কাজ করার আগে power isolate করা এবং প্রয়োজন অনুযায়ী qualified/licensed electrician-এর সাহায্য নেওয়া উচিত।\n\n" +
            "⚠️ বিদ্যুৎস্পৃষ্ট হওয়ার ঝুঁকি থাকলে নিজে পরীক্ষা না করে professional help নিন।"
    },

    {
        keys: [
            "প্রজেক্ট",
            "কাজের",
            "উদাহরণ",
            "project",
            "portfolio",
            "আগের কাজ"
        ],

        reply:
            "ElectroTech-এর Smart Automation project showcase দেখতে পারেন 👉 #projects"
    },

    {
        keys: [
            "সময়",
            "কতদিন",
            "কবে",
            "how long",
            "duration",
            "time"
        ],

        reply:
            "কাজের সময় project-এর size, wiring condition এবং service type-এর উপর নির্ভর করে। ছোট automation project তুলনামূলকভাবে দ্রুত শেষ হতে পারে; বড় wiring বা industrial project-এর জন্য site assessment প্রয়োজন।"
    },

    {
        keys: [
            "হ্যালো",
            "হাই",
            "সালাম",
            "assalamu",
            "hello",
            "hi",
            "hey",
            "কেমন আছ"
        ],

        reply:
            "আসসালামু আলাইকুম! 👋\n\n" +
            "আমি ভোল্ট — ElectroTech-এর AI Assistant। ⚡\n\n" +
            "আপনি electrical service, wiring, smart home, solar, budget, booking বা safety সম্পর্কে প্রশ্ন করতে পারেন।"
    },

    {
        keys: [
            "ধন্যবাদ",
            "thanks",
            "thank you",
            "thnx"
        ],

        reply:
            "আপনাকেও ধন্যবাদ! ⚡ আরও কোনো প্রশ্ন থাকলে জিজ্ঞাসা করুন।"
    }
];

const CHAT_FALLBACK =

    "এই প্রশ্নটির নির্দিষ্ট উত্তর আমার ElectroTech knowledge base-এ নেই। 🙂\n\n" +

    "আপনি চাইলে প্রশ্নটি একটু বিস্তারিতভাবে লিখতে পারেন। অথবা ElectroTech team-এর সাথে যোগাযোগ করুন:\n\n" +

    "📞 +880 1710830391\n\n" +

    "👉 #booking";

const CHAT_CHIPS = [

    "খরচ কত?",

    "Smart Home কী?",

    "বুকিং করব",

    "অফিস কোথায়?",

    "Electrical Safety সম্পর্কে বলুন"
];

const chatHistory = [];

function chatEl(id) {

    return document.getElementById(id);
}

function chatLinkify(text) {

    let safeText =
        escapeHTML(text);

    safeText =
        safeText.replace(
            /#(estimator|pricing|booking|contact|simulator|team|projects|chief-electrician)/gi,
            '<a href="#$1" class="chat-jump">#$1</a>'
        );

    safeText =
        safeText.replace(
            /(\+880[\s-]?1[3-9]\d{8})/g,
            '<a href="tel:$1">$1</a>'
        );

    safeText =
        safeText.replace(
            /\n/g,
            "<br>"
        );

    return safeText;
}

function chatAddMessage(text, who) {

    const body =
        chatEl("chat-body");

    if (!body) {
        return null;
    }

    const bubble =
        document.createElement("div");

    bubble.className =
        `chat-msg ${who}`;

    if (who === "bot") {

        bubble.innerHTML =
            chatLinkify(text);

    } else {

        bubble.textContent =
            text;
    }

    body.appendChild(
        bubble
    );

    body.scrollTop =
        body.scrollHeight;

    return bubble;
}

function chatShowTyping() {

    const body =
        chatEl("chat-body");

    if (!body) {
        return null;
    }

    const bubble =
        document.createElement("div");

    bubble.className =
        "chat-msg bot chat-typing";

    bubble.innerHTML =
        "<span></span><span></span><span></span>";

    body.appendChild(
        bubble
    );

    body.scrollTop =
        body.scrollHeight;

    return bubble;
}

function chatLocalAnswer(message) {

    const text =
        String(message)
            .toLowerCase()
            .trim();

    let best = null;

    let bestScore = 0;

    CHAT_KB.forEach(item => {

        let score = 0;

        item.keys.forEach(key => {

            const keyword =
                key.toLowerCase();

            if (text.includes(keyword)) {

                score +=
                    keyword.length * 2;
            }
        });

        if (score > bestScore) {

            bestScore =
                score;

            best =
                item;
        }
    });

    return best
        ? best.reply
        : CHAT_FALLBACK;
}

async function chatGetReply(message) {

    if (!CHAT_CONFIG.apiUrl) {

        return chatLocalAnswer(
            message
        );
    }

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

                    body:
                        JSON.stringify({

                            message:
                                message,

                            history:
                                chatHistory.slice(
                                    -CHAT_CONFIG.maxHistory
                                )
                        })
                }
            );

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );
        }

        const data =
            await response.json();

        if (
            data &&
            typeof data.reply === "string" &&
            data.reply.trim()
        ) {

            return data.reply.trim();
        }

        return chatLocalAnswer(
            message
        );

    } catch (error) {

        console.error(
            "Volt AI error:",
            error
        );

        const localReply =
            chatLocalAnswer(
                message
            );

        if (
            localReply !== CHAT_FALLBACK
        ) {

            return (
                localReply +
                "\n\n⚠️ AI server বর্তমানে unavailable, তাই local ElectroTech information থেকে উত্তর দেওয়া হয়েছে।"
            );
        }

        return (
            "AI server-এর সাথে বর্তমানে যোগাযোগ করা যাচ্ছে না।\n\n" +
            "📞 +880 1710830391"
        );
    }
}

async function chatSend(message) {

    const text =
        String(message || "")
            .trim();

    if (!text) {
        return;
    }

    chatAddMessage(
        text,
        "user"
    );

    chatHistory.push({

        role: "user",

        content: text
    });

    const input =
        chatEl("chat-input");

    if (input) {
        input.value = "";
    }

    const typing =
        chatShowTyping();

    const reply =
        await chatGetReply(
            text
        );

    setTimeout(
        () => {

            if (typing) {
                typing.remove();
            }

            chatAddMessage(
                reply,
                "bot"
            );

            chatHistory.push({

                role:
                    "assistant",

                content:
                    reply
            });

            if (
                chatHistory.length >
                CHAT_CONFIG.maxHistory
            ) {

                chatHistory.splice(
                    0,
                    chatHistory.length -
                    CHAT_CONFIG.maxHistory
                );
            }

        },
        450
    );
}

function chatToggle(forceClose = false) {

    const windowElement =
        chatEl("chat-window");

    const launcher =
        chatEl("chat-launcher");

    if (
        !windowElement ||
        !launcher
    ) {
        return;
    }

    const shouldOpen =
        forceClose
            ? false
            : !windowElement.classList.contains(
                "active"
            );

    windowElement.classList.toggle(
        "active",
        shouldOpen
    );

    launcher.classList.toggle(
        "open",
        shouldOpen
    );

    launcher.setAttribute(
        "aria-expanded",
        shouldOpen
            ? "true"
            : "false"
    );

    launcher.innerHTML =
        shouldOpen

            ? '<i class="fa-solid fa-xmark"></i>'

            : '<i class="fa-solid fa-comment-dots"></i><span class="chat-ping"></span>';

    const body =
        chatEl("chat-body");

    if (
        shouldOpen &&
        body &&
        body.children.length === 0
    ) {

        chatAddMessage(

            "আসসালামু আলাইকুম! 👋\n" +
            "আমি ভোল্ট — ElectroTech-এর AI Assistant। ⚡\n\n" +
            "Electrical, Smart Home, Solar, Wiring, Budget অথবা Booking সম্পর্কে আপনার প্রশ্ন লিখুন।",

            "bot"
        );
    }

    if (shouldOpen) {

        const input =
            chatEl("chat-input");

        if (input) {

            setTimeout(
                () => input.focus(),
                100
            );
        }
    }
}

function initChat() {

    const launcher =
        chatEl("chat-launcher");

    const closeButton =
        chatEl("chat-close");

    const form =
        chatEl("chat-form");

    const input =
        chatEl("chat-input");

    const chipBox =
        chatEl("chat-chips");

    if (!launcher) {
        return;
    }

    launcher.addEventListener(
        "click",
        () => chatToggle()
    );

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            () => chatToggle(true)
        );
    }

    if (form) {

        form.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                if (input) {

                    chatSend(
                        input.value
                    );
                }
            }
        );
    }

    if (input) {

        input.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();

                    chatSend(
                        input.value
                    );
                }
            }
        );
    }

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                chatToggle(true);
            }
        }
    );

    if (chipBox) {

        chipBox.innerHTML = "";

        CHAT_CHIPS.forEach(label => {

            const chip =
                document.createElement(
                    "button"
                );

            chip.type =
                "button";

            chip.className =
                "chat-chip";

            chip.innerText =
                label;

            chip.addEventListener(
                "click",
                () => {

                    chatSend(
                        label
                    );
                }
            );

            chipBox.appendChild(
                chip
            );
        });
    }

    const body =
        chatEl("chat-body");

    if (body) {

        body.addEventListener(
            "click",
            event => {

                const link =
                    event.target.closest(
                        ".chat-jump"
                    );

                if (!link) {
                    return;
                }

                setTimeout(
                    () => chatToggle(true),
                    200
                );
            }
        );
    }
}

function initModalOutsideClick() {

    const modal =
        document.getElementById(
            "booking-modal"
        );

    if (!modal) {
        return;
    }

    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {

                closeBookingModal();
            }
        }
    );
}

function initModalEscape() {

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                const modal =
                    document.getElementById(
                        "booking-modal"
                    );

                if (
                    modal &&
                    modal.classList.contains(
                        "active"
                    )
                ) {

                    closeBookingModal();
                }
            }
        }
    );
}

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "⚡ ElectroTech System Online"
        );

        calculateBudget();

        initFAQ();

        initRevealAnimations();

        initDateInput();

        initDragAndDrop();

        initChat();

        initModalOutsideClick();

        initModalEscape();

        refreshClimate(true);

        updateEnergyMeter();

        const fileInput =
            document.getElementById(
                "blueprint-file"
            );

        if (fileInput) {

            updateFileName(
                fileInput
            );
        }
    }
);

(function () {
    "use strict";

    function syncVoltChatViewport() {
        const chat = document.getElementById("chat-window");
        if (!chat) return;

        const isSmall = window.innerWidth <= 768;
        if (!isSmall) {
            chat.style.removeProperty("max-height");
            chat.style.removeProperty("height");
            return;
        }

        const safeHeight = Math.max(
            300,
            window.visualViewport
                ? window.visualViewport.height - 100
                : window.innerHeight - 100
        );

        chat.style.maxHeight = safeHeight + "px";
        chat.style.height = Math.min(620, safeHeight) + "px";
    }

    window.addEventListener("resize", syncVoltChatViewport, { passive: true });
    if (window.visualViewport) {
        window.visualViewport.addEventListener(
            "resize",
            syncVoltChatViewport,
            { passive: true }
        );
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", syncVoltChatViewport, { once: true });
    } else {
        syncVoltChatViewport();
    }
})();
