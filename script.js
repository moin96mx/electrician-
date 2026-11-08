const state = {
    light: false,
    fan: false,
    sensor: false,
    ac: false
};

let acTemp = 24;
let resetBookingLocationSelection = () => {};

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
        requestAnimationFrame(() => {
            card.classList.add("pulse-update");
        });
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
            new Date().toLocaleString("bn-BD", {
                timeZone: "Asia/Dhaka"
            })
    };

    fetch(window.ElectroTechSupabase.apiUrl('/contact'), {
        method: 'POST',
        headers: {
            ...window.ElectroTechSupabase.headers(),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: 'Website estimate lead',
            contact: 'Website cost estimator',
            message: JSON.stringify(payload)
        })
    }).then(async response => {
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Estimate lead could not be saved.');
        }
    }).catch(error => {
        console.error('Estimator lead save failed:', error);
        alert('আপনার এস্টিমেট পাঠানো যায়নি। পরে আবার চেষ্টা করুন।');
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

async function handleBookingSubmit(event) {

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

    const latitudeValue = document.getElementById("booking-latitude")?.value;
    const longitudeValue = document.getElementById("booking-longitude")?.value;
    const location = latitudeValue && longitudeValue
        ? { latitude: Number(latitudeValue), longitude: Number(longitudeValue) }
        : null;

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

    const modalName =
        document.getElementById("modal-client-name");

    const modalService =
        document.getElementById("modal-service");

    const modalDate =
        document.getElementById("modal-date");

    const modalId =
        document.getElementById("modal-id");

    const submitButton = event.submitter;
    if (submitButton) submitButton.disabled = true;

    try {
        let attachment = null;
        const file = fileElement?.files?.[0];
        if (file) {
            const uploadUrlResponse = await fetch(
                window.ElectroTechSupabase.apiUrl('/bookings/upload-url'),
                {
                    method: 'POST',
                    headers: {
                        ...window.ElectroTechSupabase.headers(),
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ fileName: file.name, fileSize: file.size })
                }
            );
            const uploadResult = await uploadUrlResponse.json();
            if (!uploadUrlResponse.ok || !uploadResult.success) {
                throw new Error(uploadResult.message || 'ফাইল আপলোড প্রস্তুত করা যায়নি।');
            }

            const upload = uploadResult.data;
            const encodedPath = upload.path.split('/').map(encodeURIComponent).join('/');
            const storageForm = new FormData();
            storageForm.append('cacheControl', '3600');
            storageForm.append('', file);
            const storageResponse = await fetch(
                `${window.ElectroTechSupabase.projectUrl}/storage/v1/object/upload/sign/booking-files/${encodedPath}?token=${encodeURIComponent(upload.token)}`,
                {
                    method: 'PUT',
                    headers: {
                        ...window.ElectroTechSupabase.headers(),
                        'x-upsert': 'false'
                    },
                    body: storageForm
                }
            );
            if (!storageResponse.ok) {
                const details = await storageResponse.text();
                throw new Error(details || 'ফাইল আপলোড করা যায়নি।');
            }
            attachment = {
                path: upload.path,
                fileName: upload.fileName,
                fileSize: upload.fileSize
            };
        }

        const response = await fetch(window.ElectroTechSupabase.apiUrl('/bookings'), {
            method: 'POST',
            headers: {
                ...window.ElectroTechSupabase.headers(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, phone, service, date, notes, attachment, location })
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || 'বুকিং জমা দেওয়া যায়নি।');
        }

        const bookingData = result.data;
        if (modalName) modalName.innerText = bookingData.name;
        if (modalService) modalService.innerText = bookingData.service;
        if (modalDate) modalDate.innerText = bookingData.date;
        if (modalId) modalId.innerText = bookingData.id;

        try {
            localStorage.setItem("electrotech_last_booking", JSON.stringify(bookingData));
        } catch (error) {
            console.warn("LocalStorage unavailable:", error);
        }
    } catch (error) {
        console.error('Backend booking save failed:', error);
        alert(error.message || 'বুকিং জমা দেওয়া যায়নি। পরে আবার চেষ্টা করুন।');
        return;
    } finally {
        if (submitButton) submitButton.disabled = false;
    }

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

    resetBookingLocationSelection();

    const fileInput =
        document.getElementById("blueprint-file");

    if (fileInput) {

        updateFileName(fileInput);
    }
}

async function handleNewsletterSubmit(event) {
    event.preventDefault();

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

    try {
        const response = await fetch(window.ElectroTechSupabase.apiUrl('/contact'), {
            method: 'POST',
            headers: {
                ...window.ElectroTechSupabase.headers(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Newsletter Contact',
                contact: contact,
                message: 'Newsletter/contact form submission'
            })
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Contact information could not be saved.');
        }

        if (contactElement) contactElement.value = "";
        alert(
    `ধন্যবাদ! ElectroTech-এর সঙ্গে যোগাযোগ করার জন্য।

    আপনার প্রয়োজন ও তথ্য পর্যালোচনা করে আমাদের টিম প্রয়োজন অনুযায়ী আপনার সঙ্গে যোগাযোগ করবে।

    আপনি যদি আমাদের সঙ্গে কাজ করতে আগ্রহী হন, তাহলে উপরের Blueprint Form-টি সম্পূর্ণ করুন। আমাদের অভিজ্ঞ টিম আপনার তথ্য পর্যালোচনা করে পরবর্তী পদক্ষেপের জন্য আপনার সঙ্গে যোগাযোগ করবে।

    আপনার আস্থা ও সহযোগিতার জন্য ধন্যবাদ।

    ElectroTechBD ⚡
    Engineering & Smart Automation`
        );
    } catch (error) {
        console.error('Backend contact save failed:', error);
        alert(error.message || 'তথ্য পাঠানো যায়নি। পরে আবার চেষ্টা করুন।');
    }
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

                const targetHeight =
                    answer ? `${answer.scrollHeight}px` : null;

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
                                    "0px";
                            }
                        }
                    });

                const isOpen = !faqItem.classList.contains("active");

                faqItem.classList.toggle(
                    "active",
                    isOpen
                );

                if (answer) {
                    answer.style.maxHeight = isOpen ? targetHeight : "0px";
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

let bookingMapDependenciesPromise;

function loadBookingMapDependencies() {
    if (!bookingMapDependenciesPromise) {
        const stylesheet = document.createElement("link");
        stylesheet.rel = "stylesheet";
        stylesheet.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

        const stylesheetPromise = new Promise((resolve, reject) => {
            stylesheet.onload = resolve;
            stylesheet.onerror = () => reject(
                new Error("Leaflet stylesheet failed to load.")
            );
        });

        document.head.appendChild(stylesheet);

        const scriptPromise = window.L
            ? Promise.resolve()
            : new Promise((resolve, reject) => {
                const script = document.createElement("script");
                script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
                script.async = true;
                script.onload = () => {
                    if (window.L) {
                        resolve();
                    } else {
                        reject(new Error("Leaflet loaded without its map API."));
                    }
                };
                script.onerror = () => {
                    script.remove();
                    reject(new Error("Leaflet script failed to load."));
                };
                document.body.appendChild(script);
            });

        bookingMapDependenciesPromise = Promise.all([
            stylesheetPromise,
            scriptPromise
        ]).catch(error => {
            stylesheet.remove();
            bookingMapDependenciesPromise = null;
            throw error;
        });
    }

    return bookingMapDependenciesPromise;
}

function initBookingLocationMap() {
    const mapElement = document.getElementById("booking-location-map");
    const status = document.getElementById("booking-location-status");

    if (!mapElement || !status) return;

    let loading = false;
    const startMap = () => {
        if (loading || mapElement.dataset.mapInitialized === "true") return;
        loading = true;
        status.textContent = "বাংলাদেশের মানচিত্র লোড হচ্ছে…";

        loadBookingMapDependencies()
            .then(() => {
                createBookingLocationMap();
                mapElement.dataset.mapInitialized = "true";
            })
            .catch(error => {
                loading = false;
                console.error("Could not load the booking map.", error);
                status.textContent = "মানচিত্র লোড হয়নি। আবার চেষ্টা করুন, অথবা লোকেশন না দিয়েও বুকিং করুন।";
            });
    };

    mapElement.addEventListener("pointerdown", startMap);
    mapElement.addEventListener("focusin", startMap);

    const locateButton = document.getElementById("booking-use-location");
    locateButton?.addEventListener("pointerdown", startMap);
    locateButton?.addEventListener("focusin", startMap);

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(entries => {
            if (entries.some(entry => entry.isIntersecting)) {
                observer.disconnect();
                startMap();
            }
        }, { rootMargin: "400px 0px" });
        observer.observe(mapElement);
    } else if ("requestIdleCallback" in window) {
        window.requestIdleCallback(startMap, { timeout: 2500 });
    } else {
        window.setTimeout(startMap, 1500);
    }
}

function createBookingLocationMap() {
    const mapElement = document.getElementById("booking-location-map");
    const latitudeInput = document.getElementById("booking-latitude");
    const longitudeInput = document.getElementById("booking-longitude");
    const status = document.getElementById("booking-location-status");
    const locateButton = document.getElementById("booking-use-location");
    const clearButton = document.getElementById("booking-clear-location");

    if (!mapElement || !latitudeInput || !longitudeInput || !status) return;
    if (!window.L) {
        status.textContent = "মানচিত্র লোড হয়নি। লোকেশন না দিয়েও বুকিং করা যাবে।";
        return;
    }

    const defaultCenter = [23.8103, 90.4125];
    const map = window.L.map(mapElement, {
        minZoom: 5,
        maxZoom: 19,
        maxBoundsViscosity: 1,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true,
        keyboard: true
    }).setView(defaultCenter, 11);
    mapElement.querySelector('.leaflet-control-zoom-in')?.setAttribute('aria-label', 'মানচিত্র বড় করে দেখুন');
    mapElement.querySelector('.leaflet-control-zoom-in')?.setAttribute('title', 'মানচিত্র বড় করে দেখুন');
    mapElement.querySelector('.leaflet-control-zoom-out')?.setAttribute('aria-label', 'মানচিত্র ছোট করে দেখুন');
    mapElement.querySelector('.leaflet-control-zoom-out')?.setAttribute('title', 'মানচিত্র ছোট করে দেখুন');
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | Boundary: <a href="https://www.geoboundaries.org/">geoBoundaries</a> (CC0)'
    }).addTo(map);
    const worldMaskRing = [[-85, -180], [-85, 180], [85, 180], [85, -180]];
    const maskPane = map.createPane("bangladeshMask");
    maskPane.style.zIndex = "660";
    maskPane.style.pointerEvents = "none";
    const maskStyle = {
        pane: "bangladeshMask",
        stroke: false,
        fillColor: "#071018",
        fillOpacity: 1,
        fillRule: "evenodd",
        interactive: false
    };
    const loadingMask = window.L.polygon([worldMaskRing], maskStyle).addTo(map);
    let boundaryGeometry = null;
    let countryViewBounds = null;
    let selectedLocation = null;
    status.textContent = "বাংলাদেশের মানচিত্র লোড হচ্ছে…";

    const isInRing = (latitude, longitude, ring) => {
        let inside = false;
        for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
            const [currentLongitude, currentLatitude] = ring[i];
            const [previousLongitude, previousLatitude] = ring[j];
            const crossesLatitude = (currentLatitude > latitude) !== (previousLatitude > latitude);
            if (crossesLatitude &&
                longitude < (previousLongitude - currentLongitude) *
                    (latitude - currentLatitude) /
                    (previousLatitude - currentLatitude) + currentLongitude) {
                inside = !inside;
            }
        }
        return inside;
    };
    const isInBangladesh = (latitude, longitude) => boundaryGeometry?.coordinates.some(polygon =>
        isInRing(latitude, longitude, polygon[0]) &&
        !polygon.slice(1).some(ring => isInRing(latitude, longitude, ring))
    ) ?? false;

    let marker = null;
    let accuracyCircle = null;
    const setLocation = (coordinates, source = "map", accuracy = null) => {
        const latitude = Number(coordinates.lat);
        const longitude = Number(coordinates.lng);
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude) ||
            latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            status.textContent = "সঠিক map location নির্বাচন করা যায়নি। আবার চেষ্টা করুন।";
            return false;
        }
        if (!boundaryGeometry) {
            status.textContent = "বাংলাদেশের মানচিত্র লোড হচ্ছে। একটু পরে আবার চেষ্টা করুন।";
            return false;
        }
        if (!isInBangladesh(latitude, longitude)) {
            status.textContent = "শুধু বাংলাদেশের ভেতরের অবস্থান নির্বাচন করা যাবে।";
            return false;
        }

        if (!marker) {
            marker = window.L.marker([latitude, longitude], {
                draggable: true,
                title: "অবস্থানের pin সরাতে টেনে ধরুন",
                alt: "নির্বাচিত সার্ভিস লোকেশন"
            }).addTo(map);
            marker.bindTooltip("আপনার সাইটের অবস্থান", { direction: "top", offset: [0, -30] });
            marker.on("dragend", () => {
                const draggedLocation = marker.getLatLng();
                if (!isInBangladesh(draggedLocation.lat, draggedLocation.lng)) {
                    if (selectedLocation) marker.setLatLng(selectedLocation);
                    status.textContent = "Pin বাংলাদেশের সীমানার বাইরে নেওয়া যাবে না।";
                    return;
                }
                setLocation(draggedLocation);
            });
        } else {
            marker.setLatLng([latitude, longitude]);
        }
        selectedLocation = [latitude, longitude];

        if (accuracyCircle) {
            map.removeLayer(accuracyCircle);
            accuracyCircle = null;
        }
        latitudeInput.value = latitude.toFixed(7);
        longitudeInput.value = longitude.toFixed(7);
        status.classList.add("has-location");
        clearButton.disabled = false;
        const accuracyText = source === "gps" && Number.isFinite(accuracy) && accuracy > 0
            ? ` GPS-এর আনুমানিক নির্ভুলতা ±${Math.round(accuracy)} মিটার।`
            : "";
        if (source === "gps" && Number.isFinite(accuracy) && accuracy > 0) {
            accuracyCircle = window.L.circle([latitude, longitude], {
                radius: Math.min(accuracy, 10000),
                color: "#19e6c2",
                weight: 1,
                fillColor: "#19e6c2",
                fillOpacity: 0.12
            }).addTo(map);
        }
        status.textContent = `অবস্থান বাছাই হয়েছে। Pin টেনে ঠিক করতে পারেন।${accuracyText}`;
        return true;
    };

    map.on("click", event => setLocation(event.latlng));
    resetBookingLocationSelection = () => {
        if (marker) {
            map.removeLayer(marker);
            marker = null;
        }
        selectedLocation = null;
        if (accuracyCircle) {
            map.removeLayer(accuracyCircle);
            accuracyCircle = null;
        }
        latitudeInput.value = "";
        longitudeInput.value = "";
        clearButton.disabled = true;
        status.classList.remove("has-location");
        if (countryViewBounds) {
            map.fitBounds(countryViewBounds, { padding: [10, 10], maxZoom: 7 });
        } else {
            map.setView(defaultCenter, 11);
        }
        status.textContent = boundaryGeometry
            ? "মানচিত্রে চাপ দিয়ে বাংলাদেশের ভেতরের অবস্থান নির্বাচন করুন।"
            : "বাংলাদেশের মানচিত্র লোড হচ্ছে…";
    };
    locateButton?.addEventListener("click", () => {
        if (!navigator.geolocation) {
            status.textContent = "এই browser-এ GPS location পাওয়া যায় না। Map-এ চাপ দিয়ে pin বসান।";
            return;
        }

        locateButton.disabled = true;
        locateButton.setAttribute("aria-busy", "true");
        status.textContent = "আপনার অনুমতির অপেক্ষায়…";
        navigator.geolocation.getCurrentPosition(
            position => {
                const coordinates = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                if (setLocation(coordinates, "gps", position.coords.accuracy)) {
                    map.setView([coordinates.lat, coordinates.lng], 17);
                }
                locateButton.disabled = false;
                locateButton.removeAttribute("aria-busy");
            },
            error => {
                const message = error.code === error.PERMISSION_DENIED
                    ? "Location permission বন্ধ আছে। Browser settings-এ অনুমতি দিন, অথবা map-এ pin বসান।"
                    : error.code === error.TIMEOUT
                        ? "GPS থেকে উত্তর পেতে সময় বেশি লাগছে। আবার চেষ্টা করুন, অথবা map-এ pin বসান।"
                        : "বর্তমান অবস্থান পাওয়া যায়নি। GPS চালু করুন, অথবা map-এ pin বসান।";
                status.textContent = message;
                locateButton.disabled = false;
                locateButton.removeAttribute("aria-busy");
            },
            { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
        );
    });

    clearButton?.addEventListener("click", resetBookingLocationSelection);

    fetch("data/bangladesh-boundary.geojson")
        .then(response => {
            if (!response.ok) throw new Error(`Boundary request failed: ${response.status}`);
            return response.json();
        })
        .then(boundaryData => {
            const feature = boundaryData.features?.find(item =>
                item.geometry?.type === "MultiPolygon" &&
                item.geometry.coordinates?.length
            );
            if (!feature || feature.geometry.coordinates.some(polygon => !polygon[0]?.length)) {
                throw new Error("Bangladesh boundary geometry is missing or invalid.");
            }

            boundaryGeometry = feature.geometry;
            const countryRings = boundaryGeometry.coordinates.map(polygon =>
                polygon[0].map(([longitude, latitude]) => [latitude, longitude])
            );
            countryViewBounds = window.L.geoJSON(feature).getBounds().pad(0.02);
            map.setMaxBounds(countryViewBounds.pad(0.1));
            map.removeLayer(loadingMask);
            window.L.polygon([worldMaskRing, ...countryRings], maskStyle).addTo(map);
            window.L.geoJSON(feature, {
                pane: "bangladeshMask",
                interactive: false,
                style: { color: "#19e6c2", weight: 1.5, fill: false }
            }).addTo(map);
            map.fitBounds(countryViewBounds, { padding: [10, 10], maxZoom: 7 });
            status.textContent = "মানচিত্রে চাপ দিয়ে বাংলাদেশের ভেতরের অবস্থান নির্বাচন করুন।";
        })
        .catch(error => {
            console.error("Could not load the Bangladesh map boundary.", error);
            map.dragging.disable();
            map.touchZoom.disable();
            map.doubleClickZoom.disable();
            map.scrollWheelZoom.disable();
            map.keyboard.disable();
            if (locateButton) locateButton.disabled = true;
            status.textContent = "বাংলাদেশের মানচিত্র লোড হয়নি। লোকেশন না দিয়েও বুকিং করা যাবে।";
        });
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
        "https://electrohubbd.com",

    assistantName:
        "ভোল্ট",

    maxMessageLength:
        2000,

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
            "ElectroHubBD-এর প্রধান প্যাকেজগুলো হলো:\n\n" +
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
            "ElectroHubBD-এর contact section-এ অফিসের location এবং Google Map দেওয়া আছে। 👉 #contact\n\n" +
            "বর্তমান ওয়েবসাইটে location হিসেবে Dhaka, Bangladesh দেখানো হয়েছে।"
    },

    {
        keys: [
            "ফোন",
            "যোগাযোগ",
            "নম্বর",
            "নাম্বার",
            "কল",
            "contact",
            "contact number",
            "company number",
            "phone",
            "call",
            "number",
            "whatsapp",
            "হোয়াটসঅ্যাপ",
            "কোম্পানির ফোন",
            "কোম্পানির যোগাযোগ"
        ],

        reply:
            "ElectroHubBD-এর সাথে সরাসরি যোগাযোগ করতে কল করুন:\n\n" +
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
            "Smart Home system-এর মাধ্যমে fan control automation করা যায়। ElectroHubBD-এর simulator-এ fan control-এর একটি demo আছে 👉 #simulator"
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
            "ElectroHubBD-এর estimator-এ Solar System option আছে। Solar select করলে আনুমানিক Solar Add-on cost মোট বাজেটে যোগ হয় 👉 #estimator"
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
            "কে চালায়"
        ],

        reply:
            "ElectroHubBD-এর website information অনুযায়ী এইচ. এম. মো. সাইদুজ্জামান প্রতিষ্ঠাতা ও প্রধান নির্বাহী হিসেবে উল্লেখ আছেন। বিস্তারিত দেখতে 👉 #team"
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
            'ElectroHubBD-এর website: <a href="https://electrohubbd.com">electrohubbd.com</a> ⚡'
    },

    {
        keys: [
            "লাইসেন্স",
            "license",
            "permit",
            "অনুমোদন"
        ],

        reply:
            "ElectroHubBD website-এ Chief Electrician-এর জন্য Permit: E20230043144 উল্লেখ করা হয়েছে। লাইসেন্স/permit সম্পর্কিত সিদ্ধান্তের ক্ষেত্রে official verification করা সবচেয়ে ভালো।"
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
            "ElectroHubBD-এর Smart Automation project showcase দেখতে পারেন 👉 #projects"
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
            "আমি ভোল্ট — ElectroHubBD-এর সহকারী। ⚡\n\n" +
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
    },
    {
        keys: [
            "tomer namki",
            "namki",
            "what is your name",
            "tomar nam ki",
            "কে তুমি",
            "তোমার নাম কী",
            "তোমার নাম কি",
            "name",
            "who are you"
        ],
        reply:
            "আমি ElectroHubBD-এর অফিশিয়াল এআই অ্যাসিস্ট্যান্ট (ElectroHub AI)। বৈদ্যুতিক সেবা, স্মার্ট হোম সলিউশন, খরচ বা বুকিং সংক্রান্ত যেকোনো প্রশ্ন আমাকে করতে পারেন! ⚡🤖"
    },
    {
        keys: [
            "কেমন আছো",
            "কি খবর",
            "how are you",
            "kemon acho"
        ],
        reply:
            "আলহামদুলিল্লাহ, আমি বেশ ভালো আছি! ⚡ আপনার বৈদ্যুতিক সেবা বা অন্য কোনো বিষয়ে কীভাবে সাহায্য করতে পারি বলুন?"
    },
    {
        keys: [
            "সালাম",
            "আসসালামু আলাইকুম",
            "hi",
            "hello",
            "hey",
            "হাই",
            "হ্যালো"
        ],
        reply:
            "ওয়ালাইকুমুসসালাম ওয়া রাহমাতুল্লাহ! অথবা হ্যালো! ElectroHubBD-এ আপনাকে স্বাগতম। আজ আপনাকে কীভাবে সাহায্য করতে পারি? ⚡"
    }
];

const CHAT_FALLBACK =

    "এই প্রশ্নটির নির্দিষ্ট উত্তর আমার ElectroHubBD-এর সহায়িকা-তথ্যে নেই। 🙂\n\n" +

    "আপনি চাইলে প্রশ্নটি একটু বিস্তারিতভাবে লিখতে পারেন। অথবা ElectroHubBD team-এর সাথে যোগাযোগ করুন:\n\n" +

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
let chatReplyQueue = Promise.resolve();

function chatEl(id) {

    return document.getElementById(id);
}

function chatLinkify(text) {

    let safeText =
        escapeHTML(text);

    safeText =
        safeText.replace(
            /\*\*(.+?)\*\*/g,
            "<strong>$1</strong>"
        );

    safeText =
        safeText.replace(
            /#(estimator|pricing|booking|contact|simulator|team|projects|chief-electrician)/gi,
            '<a href="#$1" class="chat-jump">#$1</a>'
        );

    safeText =
        safeText.replace(
            /(\+880[\s-]?1[3-9]\d{8})/g,
            (phone) =>
                `<a href="tel:${phone.replace(/[^\d+]/g, "")}">${phone}</a>`
        );

    safeText =
        safeText.replace(
            /\n/g,
            "<br>"
        );

    return safeText;
}

function chatSanitizeAnswer(value) {
    const template = document.createElement("template");
    template.innerHTML = String(value ?? "");

    const fragment = document.createDocumentFragment();
    const allowedTags = new Set([
        "a", "b", "blockquote", "br", "code", "div", "em",
        "h3", "h4", "hr", "i", "li", "ol", "p", "pre",
        "small", "span", "strong", "sub", "sup", "ul"
    ]);
    const blockedTags = new Set([
        "audio", "button", "embed", "form", "iframe", "img",
        "input", "link", "math", "meta", "object", "script",
        "style", "svg", "template", "video"
    ]);
    const allowedHashTargets = new Set([
        "estimator", "pricing", "booking", "contact", "simulator",
        "team", "projects", "chief-electrician"
    ]);

    function appendText(text, parent, insideLink) {
        if (insideLink) {
            parent.appendChild(document.createTextNode(text));
            return;
        }

        const linkedText = document.createElement("template");
        linkedText.innerHTML = chatLinkify(text);
        parent.appendChild(linkedText.content);
    }

    function copyNode(node, parent, insideLink = false) {
        if (node.nodeType === Node.TEXT_NODE) {
            appendText(node.nodeValue, parent, insideLink);
            return;
        }

        if (node.nodeType !== Node.ELEMENT_NODE) {
            return;
        }

        const tagName = node.tagName.toLowerCase();

        if (blockedTags.has(tagName)) {
            return;
        }

        if (!allowedTags.has(tagName)) {
            node.childNodes.forEach(child =>
                copyNode(child, parent, insideLink)
            );
            return;
        }

        const safeElement = document.createElement(tagName);

        if (tagName === "div" && node.classList.contains("volt-result-card")) {
            safeElement.className = "volt-result-card";
        }

        if (tagName === "a") {
            const href = node.getAttribute("href") || "";

            if (href.startsWith("#") && allowedHashTargets.has(href.slice(1))) {
                safeElement.setAttribute("href", href);
                safeElement.className = "chat-jump";
            } else if (/^tel:\+?[\d\s()-]{8,24}$/i.test(href)) {
                safeElement.setAttribute("href", `tel:${href.slice(4).replace(/[^\d+]/g, "")}`);
            } else if (/^https:\/\/[^\s]+$/i.test(href)) {
                safeElement.setAttribute("href", href);
                safeElement.setAttribute("target", "_blank");
                safeElement.setAttribute("rel", "noopener noreferrer");
            }

            if (!safeElement.hasAttribute("href")) {
                node.childNodes.forEach(child =>
                    copyNode(child, parent, insideLink)
                );
                return;
            }
        }

        node.childNodes.forEach(child =>
            copyNode(child, safeElement, insideLink || tagName === "a")
        );

        parent.appendChild(safeElement);
    }

    template.content.childNodes.forEach(node =>
        copyNode(node, fragment)
    );

    return fragment;
}

function chatAddMessage(text, who, before = null) {

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

        bubble.appendChild(
            chatSanitizeAnswer(text)
        );

    } else {

        bubble.textContent =
            text;
    }

    if (before?.parentNode === body) {
        body.insertBefore(bubble, before);
    } else {
        body.appendChild(bubble);
    }

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

    function matchesKeyword(keyword) {
        const normalizedKeyword = keyword.toLowerCase();

        if (/^[a-z0-9]+(?:\s+[a-z0-9]+)*$/i.test(normalizedKeyword)) {
            const normalizedText = text.replace(/[^a-z0-9]+/g, " ");
            const paddedText = ` ${normalizedText} `;
            const paddedKeyword = ` ${normalizedKeyword} `;
            return paddedText.includes(paddedKeyword);
        }

        return text.includes(normalizedKeyword);
    }

    let best = null;

    let bestScore = 0;

    CHAT_KB.forEach(item => {

        let score = 0;

        item.keys.forEach(key => {

            const keyword =
                key.toLowerCase();

            if (matchesKeyword(keyword)) {

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
                "\n\n⚠️ AI server বর্তমানে unavailable, তাই ElectroHubBD-এর local তথ্য থেকে উত্তর দেওয়া হয়েছে।"
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

    if (text.length > CHAT_CONFIG.maxMessageLength) {
        chatAddMessage(
            `একটি বার্তা সর্বোচ্চ ${CHAT_CONFIG.maxMessageLength} অক্ষরের হতে পারে। প্রশ্নটি সংক্ষিপ্ত করে আবার পাঠান।`,
            "bot"
        );
        return;
    }

    const userMessage = chatAddMessage(
        text,
        "user"
    );

    const input =
        chatEl("chat-input");

    if (input) {
        input.value = "";
    }

    const replyTask = chatReplyQueue.then(async () => {
        chatHistory.push({
            role: "user",
            content: text
        });

        if (chatHistory.length > CHAT_CONFIG.maxHistory) {
            chatHistory.splice(
                0,
                chatHistory.length - CHAT_CONFIG.maxHistory
            );
        }

        const typing = chatShowTyping();
        let reply;

        try {
            reply = await chatGetReply(text);
        } catch (error) {
            console.error("Volt chat reply failed:", error);
            reply = "দুঃখিত, এই মুহূর্তে উত্তর তৈরি করা যায়নি। আবার চেষ্টা করুন অথবা +880 1710830391 নম্বরে যোগাযোগ করুন।";
        } finally {
            typing?.remove();
        }

        chatAddMessage(reply, "bot", userMessage?.nextSibling);

        chatHistory.push({
            role: "assistant",
            content: reply
        });

        if (chatHistory.length > CHAT_CONFIG.maxHistory) {
            chatHistory.splice(
                0,
                chatHistory.length - CHAT_CONFIG.maxHistory
            );
        }
    });

    chatReplyQueue = replyTask.catch(error => {
        console.error("Volt chat queue failed:", error);
    });

    return replyTask;
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
    launcher.setAttribute(
        "aria-label",
        shouldOpen
            ? "চ্যাট সহকারী বন্ধ করুন"
            : "চ্যাট সহকারী খুলুন"
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
            "আমি ভোল্ট — ElectroHubBD-এর সহকারী। ⚡\n\n" +
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
            () => {
                chatToggle(true);
                launcher.focus();
            }
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
                event.key === "Escape" &&
                chatEl("chat-window")?.classList.contains("active")
            ) {

                chatToggle(true);
                launcher.focus();
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

        initBookingLocationMap();

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
