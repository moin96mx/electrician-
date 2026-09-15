// ================================
// SMART HOME SIMULATOR
// ================================

const state = {
    light: false,
    fan: false,
    sensor: false
};


function toggleAppliance(type) {

    state[type] = !state[type];

    const card = document.getElementById(`card-${type}`);

    const status = document.getElementById(`status-${type}`);


    // LIGHT

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


    // FAN

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


    // SENSOR

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

}


// ================================
// BUDGET CALCULATOR
// ================================

let currentSqft = 1200;

let roomCount = 3;

let selectedGrade = "standard";


// ROOM UPDATE

function updateRooms(change) {

    roomCount += change;

    if (roomCount < 1) {

        roomCount = 1;

    }

    document.getElementById("room-count").innerText =
        roomCount;

    calculateBudget();

}


// GRADE SELECTION

function setGrade(grade, element) {

    selectedGrade = grade;


    document
        .querySelectorAll(".grade-card")
        .forEach(card => {

            card.classList.remove("active");

        });


    element.classList.add("active");


    calculateBudget();

}


// BUDGET CALCULATION

function calculateBudget() {

    const slider =
        document.getElementById("sqft-slider");


    currentSqft =
        parseInt(slider.value);


    document.getElementById("sqft-val").innerText =
        `${currentSqft.toLocaleString()} Sq.Ft`;


    const isSolar =
        document.getElementById("solar-toggle").checked;


    // PRICE PER SQFT

    let ratePerSqft;

    if (selectedGrade === "standard") {

        ratePerSqft = 25;

    } else {

        ratePerSqft = 45;

    }


    // MATERIAL COST

    const materialCost =
        currentSqft * ratePerSqft +
        roomCount * 1500;


    // ENGINEERING & LABOR

    const laborCost =
        materialCost * 0.45;


    // SOLAR COST

    let solarCost = 0;


    if (isSolar) {

        solarCost =
            Math.round(currentSqft * 35);


        document.getElementById("solar-row")
            .style.display = "flex";


        document.getElementById("solar-cost")
            .innerText =
            `৳ ${solarCost.toLocaleString()}`;

    } else {

        document.getElementById("solar-row")
            .style.display = "none";

    }


    // TOTAL

    const totalBudget =
        Math.round(
            materialCost +
            laborCost +
            solarCost
        );


    // UPDATE UI

    document.getElementById("mat-cost").innerText =
        `৳ ${Math.round(materialCost).toLocaleString()}`;


    document.getElementById("labor-cost").innerText =
        `৳ ${Math.round(laborCost).toLocaleString()}`;


    document.getElementById("total-price").innerText =
        `৳ ${totalBudget.toLocaleString()}`;

}


// ================================
// CONSULTATION BUTTON
// ================================

function triggerConsultation() {

    const price =
        document.getElementById("total-price")
            .innerText;


    alert(
        `আপনার নির্বাচিত আনুমানিক বাজেট: ${price}

আমাদের টিম আপনার সাথে যোগাযোগ করবে এবং প্রয়োজন অনুযায়ী প্রধান ইলেকট্রিশিয়ানের পরামর্শ দেবে।`
    );

}


// ================================
// INITIAL CALCULATION
// ================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        calculateBudget();

    }
);


// Dynamic File Selection Feedback
function updateFileName(input) {
  const display = document.getElementById('file-name-display');
  if (input.files && input.files[0]) {
    const fileName = input.files[0].name;
    display.innerHTML = `<i class="fa-solid fa-file-circle-check"></i> ফাইল যুক্ত হয়েছে: <strong>${fileName}</strong>`;
    display.style.color = '#00ff66';
    display.style.borderColor = '#00ff66';
    display.style.background = 'rgba(0, 255, 102, 0.1)';
  } else {
    display.innerHTML = `<i class="fa-solid fa-shield-cat"></i> কোনো ফাইল যুক্ত হয়নি (ঐচ্ছিক)`;
    display.style.color = 'var(--accent-cyan, #00ffcc)';
    display.style.borderColor = 'rgba(0, 255, 204, 0.4)';
    display.style.background = 'rgba(0, 255, 204, 0.08)';
  }
}

// Form Submission & Modal Handling
function handleBookingSubmit(event) {
  event.preventDefault();

  const name = document.getElementById('client-name').value;
  const service = document.getElementById('service-type').value;
  const date = document.getElementById('meeting-date').value;

  const randomId = `#ENG-2050-${Math.floor(1000 + Math.random() * 9000)}`;

  document.getElementById('modal-client-name').innerText = name;
  document.getElementById('modal-service').innerText = service;
  document.getElementById('modal-date').innerText = date;
  document.getElementById('modal-id').innerText = randomId;

  // Show Modal Overlay in Center
  const modal = document.getElementById('booking-modal');
  modal.classList.add('active');
}

// Close Modal
function closeBookingModal() {
  const modal = document.getElementById('booking-modal');
  modal.classList.remove('active');
  document.getElementById('consultation-form').reset();
  updateFileName(document.getElementById('blueprint-file'));
}

// FAQ Accordion Functionality
document.querySelectorAll('.faq-question').forEach(button => {
  button.addEventListener('click', () => {
    const faqItem = button.parentElement;
    const answer = faqItem.querySelector('.faq-answer');

    // Close other open FAQs
    document.querySelectorAll('.faq-item').forEach(item => {
      if (item !== faqItem) {
        item.classList.remove('active');
        item.querySelector('.faq-answer').style.maxHeight = null;
      }
    });

    // Toggle Current FAQ
    faqItem.classList.toggle('active');
    if (faqItem.classList.contains('active')) {
      answer.style.maxHeight = answer.scrollHeight + 'px';
    } else {
      answer.style.maxHeight = null;
    }
  });
});



/* ================================================================
   AI CHAT ASSISTANT — "ভোল্ট"
   ================================================================
   ডিফল্টভাবে এটি অফলাইনে চলে (কোনো API key লাগে না)।
   নিজের AI সার্ভার যুক্ত করতে চাইলে নিচের CHAT_CONFIG.apiUrl এ
   আপনার ব্যাকএন্ড এন্ডপয়েন্ট বসান। (API key সবসময় সার্ভারে রাখবেন,
   কখনোই এই ফাইলে নয় — নাহলে যে কেউ চুরি করতে পারবে।)

   সার্ভার যা পাবে :  { "message": "...", "history": [...] }
   সার্ভার যা ফেরত দেবে :  { "reply": "..." }
   ================================================================ */

const CHAT_CONFIG = {
    // নিচের apiUrl-এ আপনার ব্যাকএন্ড সার্ভারের ঠিকানা বসান (server.js দেখুন)।
    // লোকালে টেস্ট করতে: "http://localhost:3000/api/chat"
    // লাইভ সাইটে হোস্ট করার পর:  "https://আপনার-ব্যাকএন্ড-ডোমেইন/api/chat"
    // খালি রাখলে চ্যাটবট শুধু নিচের অফলাইন উত্তর (CHAT_KB) ব্যবহার করবে।
    apiUrl: "",
    phone: "+8801710830391"
};

const CHAT_KB = [
    {
        keys: ["দাম", "খরচ", "মূল্য", "বাজেট", "রেট", "price", "cost", "budget", "charge", "কত টাকা"],
        reply: "খরচ নির্ভর করে জায়গার আয়তন, রুম সংখ্যা ও গ্রেডের উপর।\n\n• স্ট্যান্ডার্ড গ্রেড: প্রতি স্কয়ার ফিট ৳২৫\n• প্রিমিয়াম গ্রেড: প্রতি স্কয়ার ফিট ৳৪৫\n• সোলার যুক্ত করলে অতিরিক্ত প্রতি স্কয়ার ফিট ৳৩৫\n\nআপনার নিজের হিসাব দেখতে Estimator টুলটি ব্যবহার করুন 👉 #estimator"
    },
    {
        keys: ["প্যাকেজ", "package", "pricing", "plan", "অফার"],
        reply: "আমাদের সার্ভিস প্যাকেজগুলো একসাথে সাজানো আছে পেজের প্যাকেজ অংশে 👉 #pricing\nকোন প্যাকেজটি আপনার জন্য ঠিক হবে বুঝতে না পারলে বলুন, আমি সাহায্য করছি।"
    },
    {
        keys: ["বুকিং", "বুক", "অ্যাপয়েন্টমেন্ট", "মিটিং", "book", "booking", "appointment", "schedule"],
        reply: "বুকিং করতে নিচের ফর্মটি পূরণ করুন 👉 #booking\nনাম, ফোন নম্বর ও পছন্দের তারিখ দিলেই হবে। চাইলে ব্লুপ্রিন্ট বা রুমের ছবি আপলোড করতে পারেন — এতে আমাদের টিম আগেই কাজের ধারণা পেয়ে যায়।"
    },
    {
        keys: ["ঠিকানা", "অফিস", "কোথায়", "লোকেশন", "ম্যাপ", "map", "location", "address", "direction"],
        reply: "আমাদের অফিস ঢাকায়। ম্যাপ ও ডিরেকশন দেখতে পারেন এখানে 👉 #contact\nসার্ভিস এরিয়া: ঢাকা মহানগর ও আশপাশের এলাকা।\nওয়েবসাইট: electrotechbd.xyz"
    },
    {
        keys: ["ফোন", "যোগাযোগ", "নম্বর", "কল", "contact", "phone", "call", "whatsapp", "হোয়াটসঅ্যাপ"],
        reply: "সরাসরি কথা বলতে চাইলে কল করুন: " + CHAT_CONFIG.phone + "\nসার্ভিস আওয়ার: শনি–বৃহস্পতি, সকাল ৯টা – রাত ৮টা। জরুরি ইলেকট্রিক্যাল সমস্যায় ২৪ ঘণ্টাই কল করতে পারেন।"
    },
    {
        keys: ["স্মার্ট", "অটোমেশন", "esp32", "iot", "smart", "automation", "সেন্সর", "অ্যাপ"],
        reply: "আমরা ESP32 ও ক্লাউড ব্যবহার করে লাইট, ফ্যান, এসি, দরজা ও সেন্সর মোবাইল অ্যাপ বা ভয়েস দিয়ে নিয়ন্ত্রণের ব্যবস্থা করি।\nকেমন কাজ করে তা লাইভ দেখতে পারেন সিমুলেটরে 👉 #simulator"
    },
    {
        keys: ["পুরোনো", "পুরনো", "ওয়্যারিং", "rewiring", "wiring", "দেয়াল", "রূপান্তর"],
        reply: "হ্যাঁ, দেয়াল না ভেঙেই বিদ্যমান ওয়্যারিংয়ের সাথে স্মার্ট মডিউল বসানো যায়। বেশিরভাগ পুরোনো বাসাতেই এক দিনের কাজে বেসিক অটোমেশন চালু করা সম্ভব।"
    },
    {
        keys: ["সোলার", "solar", "সৌর", "বিদ্যুৎ বিল", "ব্যাকআপ", "ips"],
        reply: "সোলার সিস্টেম যুক্ত করলে আনুমানিক খরচ প্রতি স্কয়ার ফিট ৳৩৫। Estimator-এ সোলার অপশনটি চালু করলে মোট বাজেটে যোগ হয়ে যাবে 👉 #estimator"
    },
    {
        keys: ["ceo", "সিইও", "মালিক", "প্রতিষ্ঠাতা", "founder", "owner", "সাইদুজ্জামান", "কে চালায়", "কোম্পানির"],
        reply: "ElectroTech Engineering & Automation-এর প্রতিষ্ঠাতা ও প্রধান নির্বাহী (CEO) হলেন এইচ. এম. মো. সাইদুজ্জামান।\nটিম সম্পর্কে বিস্তারিত দেখুন 👉 #team"
    },
    {
        keys: ["ওয়েবসাইট", "সাইট", "website", "domain", "electrotechbd"],
        reply: "আমাদের অফিসিয়াল ওয়েবসাইট: electrotechbd.xyz ⚡"
    },
    {
        keys: ["লাইসেন্স", "অভিজ্ঞতা", "নিরাপদ", "license", "safe", "experience", "বিশ্বস্ত"],
        reply: "আমাদের প্রধান ইলেকট্রিশিয়ান লাইসেন্সপ্রাপ্ত (Permit: E20230043144) এবং ৪০+ বছরের অভিজ্ঞতাসম্পন্ন। টিম সম্পর্কে জানতে দেখুন 👉 #chief-electrician"
    },
    {
        keys: ["প্রজেক্ট", "কাজের", "উদাহরণ", "project", "portfolio", "আগের কাজ"],
        reply: "আমাদের সাম্প্রতিক স্মার্ট অটোমেশন প্রজেক্টগুলো দেখুন 👉 #projects"
    },
    {
        keys: ["সময়", "কতদিন", "কবে", "how long", "duration", "time"],
        reply: "সাধারণত ছোট অটোমেশন সেটআপ ১–২ দিনে শেষ হয়। পুরো বাসার ওয়্যারিং ও অটোমেশনের ক্ষেত্রে আয়তন অনুযায়ী ৫–১৫ দিন লাগতে পারে। সাইট ভিজিটের পর সঠিক সময় জানানো হয়।"
    },
    {
        keys: ["হ্যালো", "হাই", "সালাম", "assalamu", "hello", "hi", "hey", "কেমন আছ"],
        reply: "আসসালামু আলাইকুম! 👋 আমি ভোল্ট — ElectroTech-এর সহকারী। সার্ভিস, খরচ, বুকিং বা লোকেশন — যেকোনো বিষয়ে জিজ্ঞাসা করতে পারেন।"
    },
    {
        keys: ["ধন্যবাদ", "thanks", "thank you", "thnx"],
        reply: "আপনাকেও ধন্যবাদ! আরও কিছু জানার থাকলে নির্দ্বিধায় লিখুন। ⚡"
    }
];

const CHAT_FALLBACK =
    "এই বিষয়ে আমার কাছে নির্দিষ্ট তথ্য নেই। 🙂\nআমাদের টিম সরাসরি উত্তর দিতে পারবে — কল করুন " + CHAT_CONFIG.phone +
    " অথবা বুকিং ফর্মে প্রশ্নটি লিখে পাঠান 👉 #booking";

const CHAT_CHIPS = ["খরচ কত?", "বুকিং করব", "অফিস কোথায়?", "স্মার্ট হোম কী?"];

const chatHistory = [];

/* ---------- helpers ---------- */

function chatEl(id) {
    return document.getElementById(id);
}

function chatLinkify(text) {
    return text
        .replace(/#([a-z-]+)/g, '<a href="#$1" class="chat-jump">$&</a>')
        .replace(/(\+8801\d{9})/g, '<a href="tel:$1">$1</a>');
}

function chatAddMessage(text, who) {
    const bubble = document.createElement("div");
    bubble.className = "chat-msg " + who;
    bubble.innerHTML = who === "bot" ? chatLinkify(text) : text;
    chatEl("chat-body").appendChild(bubble);
    chatEl("chat-body").scrollTop = chatEl("chat-body").scrollHeight;
    return bubble;
}

function chatShowTyping() {
    const bubble = document.createElement("div");
    bubble.className = "chat-msg bot chat-typing";
    bubble.innerHTML = "<span></span><span></span><span></span>";
    chatEl("chat-body").appendChild(bubble);
    chatEl("chat-body").scrollTop = chatEl("chat-body").scrollHeight;
    return bubble;
}

/* ---------- answer engine ---------- */

function chatLocalAnswer(message) {
    const text = message.toLowerCase();
    let best = null;
    let bestScore = 0;

    CHAT_KB.forEach(item => {
        let score = 0;
        item.keys.forEach(key => {
            if (text.includes(key.toLowerCase())) {
                score += key.length;
            }
        });
        if (score > bestScore) {
            bestScore = score;
            best = item;
        }
    });

    return best ? best.reply : CHAT_FALLBACK;
}

async function chatGetReply(message) {
    if (!CHAT_CONFIG.apiUrl) {
        return chatLocalAnswer(message);
    }

    try {
        const res = await fetch(CHAT_CONFIG.apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: message, history: chatHistory.slice(-10) })
        });

        if (!res.ok) throw new Error("bad response");

        const data = await res.json();
        return data.reply || chatLocalAnswer(message);

    } catch (err) {
        return "সার্ভারের সাথে এখন সংযোগ করা যাচ্ছে না। একটু পরে আবার চেষ্টা করুন, অথবা কল করুন " + CHAT_CONFIG.phone;
    }
}

async function chatSend(message) {
    const text = message.trim();
    if (!text) return;

    chatAddMessage(text, "user");
    chatHistory.push({ role: "user", content: text });
    chatEl("chat-input").value = "";

    const typing = chatShowTyping();
    const reply = await chatGetReply(text);

    setTimeout(() => {
        typing.remove();
        chatAddMessage(reply, "bot");
        chatHistory.push({ role: "assistant", content: reply });
    }, 450);
}

/* ---------- ui wiring ---------- */

function chatToggle(forceClose) {
    const win = chatEl("chat-window");
    const launcher = chatEl("chat-launcher");
    const open = forceClose ? false : !win.classList.contains("active");

    win.classList.toggle("active", open);
    launcher.classList.toggle("open", open);
    launcher.setAttribute("aria-expanded", open ? "true" : "false");
    launcher.innerHTML = open
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-comment-dots"></i><span class="chat-ping"></span>';

    if (open && chatEl("chat-body").children.length === 0) {
        chatAddMessage(
            "আসসালামু আলাইকুম! 👋\nআমি ভোল্ট, ElectroTech-এর সহকারী। সার্ভিস, খরচ, বুকিং বা অফিসের ঠিকানা — যা জানতে চান লিখুন।",
            "bot"
        );
    }

    if (open) chatEl("chat-input").focus();
}

document.addEventListener("DOMContentLoaded", function () {

    if (!chatEl("chat-launcher")) return;

    chatEl("chat-launcher").addEventListener("click", () => chatToggle());
    chatEl("chat-close").addEventListener("click", () => chatToggle(true));

    chatEl("chat-form").addEventListener("submit", function (e) {
        e.preventDefault();
        chatSend(chatEl("chat-input").value);
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") chatToggle(true);
    });

    // quick reply chips
    const chipBox = chatEl("chat-chips");
    CHAT_CHIPS.forEach(label => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "chat-chip";
        chip.innerText = label;
        chip.addEventListener("click", () => chatSend(label));
        chipBox.appendChild(chip);
    });

    // চ্যাটের ভেতরের সেকশন লিংকে ক্লিক করলে চ্যাট বন্ধ হয়ে সেখানে যাবে
    chatEl("chat-body").addEventListener("click", function (e) {
        if (e.target.classList.contains("chat-jump")) {
            setTimeout(() => chatToggle(true), 200);
        }
    });

});
