

(function () {
    "use strict";

    if (window.ElectroHubMasterRouterLoaded) {
        console.warn("ElectroHub Master Router already loaded.");
        return;
    }

    window.ElectroHubMasterRouterLoaded = true;

    const CONFIG = {
        assistantName: "ভোল্ট",
        maxTextLength: 2000,
        enableLogs: false
    };

    const handlers = [];

    const previousChatLocalAnswer =
        typeof window.chatLocalAnswer === "function"
            ? window.chatLocalAnswer
            : null;

    function cleanText(text) {
        return String(text || "")
            .trim()
            .replace(/\s+/g, " ")
            .slice(0, CONFIG.maxTextLength);
    }

    function normalizeText(text) {
        return cleanText(text)
            .toLowerCase()
            .replace(/[।,!?;:()[\]{}"'`]/g, " ");
    }

    function isValidAnswer(answer) {
        return (
            answer !== undefined &&
            answer !== null &&
            String(answer).trim() !== ""
        );
    }

    function log(...args) {
        if (CONFIG.enableLogs) {
            console.log("[ElectroHub Router]", ...args);
        }
    }

    function safeRun(handler, text, context) {
        try {
            return handler(text, context);
        } catch (error) {
            console.error(
                "[ElectroHub Router] Handler error:",
                error
            );

            return null;
        }
    }

    function register(name, handler, priority = 50) {
        if (
            typeof name !== "string" ||
            !name.trim() ||
            typeof handler !== "function"
        ) {
            console.warn(
                "[ElectroHub Router] Invalid handler registration:",
                name
            );

            return false;
        }

        const alreadyExists = handlers.some(
            item => item.name === name
        );

        if (alreadyExists) {
            log("Handler already registered:", name);
            return false;
        }

        handlers.push({
            name: name.trim(),
            handler,
            priority: Number(priority) || 50
        });

        handlers.sort((a, b) => b.priority - a.priority);

        log("Registered:", name, "Priority:", priority);

        return true;
    }

    function unregister(name) {
        const index = handlers.findIndex(
            item => item.name === name
        );

        if (index === -1) {
            return false;
        }

        handlers.splice(index, 1);
        return true;
    }

    function listHandlers() {
        return handlers.map(item => ({
            name: item.name,
            priority: item.priority
        }));
    }

    function routeMessage(message, context = {}) {
        const text = cleanText(message);

        if (!text) {
            return null;
        }

        const normalized = normalizeText(text);

        const routerContext = {
            originalText: text,
            normalizedText: normalized,
            ...context
        };

        log("Incoming message:", text);

        for (const item of handlers) {
            const result = safeRun(
                item.handler,
                text,
                routerContext
            );

            if (isValidAnswer(result)) {
                log("Answered by:", item.name);

                return result;
            }
        }

        if (previousChatLocalAnswer) {
            const result = safeRun(
                previousChatLocalAnswer,
                text,
                routerContext
            );

            if (isValidAnswer(result)) {
                log("Answered by previous chatbot system.");

                return result;
            }
        }

        return null;
    }

    window.ElectroHubRouter = {
        register,
        unregister,
        listHandlers,
        route: routeMessage,
        normalizeText,
        cleanText,
        config: CONFIG
    };

    window.chatLocalAnswer = function (message, context = {}) {
        return routeMessage(message, context);
    };

    register(
        "router-battery-backup-needs-inputs",
        function (text) {
            const t = normalizeText(text);
            const hasBattery = [
                "battery",
                "ব্যাটারি",
                "ব্যাকআপ",
                "backup"
            ].some(keyword => t.includes(keyword));
            const capacityMatch =
                t.match(/(\d+(?:\.\d+)?)\s*(?:ah|amp hour|অ্যাম্প আওয়ার)/iu);
            const voltageMatch =
                t.match(/(\d+(?:\.\d+)?)\s*(?:v|volt|ভোল্ট)(?![\p{L}\p{N}])/iu);
            const loadMatch =
                t.match(/(\d+(?:\.\d+)?)\s*(kw|w|কিলোওয়াট|ওয়াট)(?![\p{L}\p{N}])/iu);

            if (!hasBattery) {
                return null;
            }

            const missingInputs = [];

            if (!capacityMatch) {
                missingInputs.push("battery capacity (Ah)");
            }

            if (!voltageMatch) {
                missingInputs.push("battery voltage (V)");
            }

            if (!loadMatch) {
                missingInputs.push("মোট load (W)");
            }

            if (missingInputs.length === 0) {
                const capacity = Number(capacityMatch[1]);
                const voltage = Number(voltageMatch[1]);
                const load = Number(loadMatch[1]) *
                    (/^(?:kw|কিলোওয়াট)$/iu.test(loadMatch[2]) ? 1000 : 1);
                const efficiencyMatch =
                    t.match(/(?:efficiency|eff|দক্ষতা)\s*(?:is|=|হল|ঃ|:)?\s*(\d+(?:\.\d+)?)/iu);
                const efficiency = efficiencyMatch
                    ? Number(efficiencyMatch[1])
                    : 85;

                if (
                    !Number.isFinite(capacity) ||
                    !Number.isFinite(voltage) ||
                    !Number.isFinite(load) ||
                    !Number.isFinite(efficiency) ||
                    capacity <= 0 ||
                    voltage <= 0 ||
                    load <= 0 ||
                    efficiency <= 0 ||
                    efficiency > 100
                ) {
                    return `
<div class="volt-result-card">
    <h3>🔋 Battery Backup হিসাব</h3>
    <p>Capacity, voltage, load এবং efficiency-এর মান শূন্যের বেশি হতে হবে; efficiency 100%-এর বেশি হতে পারে না।</p>
</div>
                    `;
                }

                const nominalEnergy = voltage * capacity;
                const usableEnergy = nominalEnergy * (efficiency / 100);
                const backupHours = usableEnergy / load;
                const format = value => value.toLocaleString(
                    "en-US",
                    { maximumFractionDigits: 2 }
                );

                return `
<div class="volt-result-card">
    <h3>🔋 Battery Backup-এর আনুমানিক হিসাব</h3>
    <p>Battery voltage: <strong>${format(voltage)} V</strong></p>
    <p>Battery capacity: <strong>${format(capacity)} Ah</strong></p>
    <p>Load: <strong>${format(load)} W</strong></p>
    <p>ধরা efficiency: <strong>${format(efficiency)}%</strong></p>
    <p>আনুমানিক backup: <strong>${format(backupHours)} ঘণ্টা</strong></p>
    <small>সূত্র: Runtime = (Voltage × Ah × Efficiency) ÷ Load। Battery age, chemistry, discharge limit ও inverter-এর কারণে বাস্তব সময় কম হতে পারে; datasheet দেখে যাচাই করুন।</small>
</div>
                `;
            }

            return `
<div class="volt-result-card">
    <h3>🔋 Battery Backup হিসাব</h3>
    <p>আনুমানিক backup time হিসাব করতে অনুগ্রহ করে ${missingInputs.join(", ")} লিখুন।</p>
    <p>Battery type, inverter efficiency এবং discharge limit-ও ব্যবহারযোগ্য backup time-কে প্রভাবিত করে।</p>
    <small>আনুমানিক সূত্র: Runtime = (Voltage × Ah × usable fraction × efficiency) ÷ Load (W)। বাস্তব ফল battery ও inverter-এর datasheet অনুযায়ী যাচাই করুন।</small>
</div>
            `;
        },
        1500
    );

    register(
        "router-electricity-bill-with-rate",
        function (text) {
            const t = normalizeText(text);
            const unitsMatch =
                t.match(/(\d+(?:\.\d+)?)\s*(?:units?|kwh|ইউনিট)(?![\p{L}\p{N}])/iu);
            const asksBill = [
                "bill",
                "বিদ্যুৎ বিল",
                "বিল",
                "কত টাকা"
            ].some(keyword => t.includes(keyword));
            const rateMatch =
                t.match(/(?:rate|রেট|প্রতি ইউনিট)\s*(?:is|=|হল|ঃ|:)?\s*(\d+(?:\.\d+)?)/iu) ||
                t.match(/(\d+(?:\.\d+)?)\s*(?:টাকা|tk|taka)\s*(?:per|প্রতি|\/)\s*(?:unit|kwh|ইউনিট)/iu);

            if (!unitsMatch || !asksBill || !rateMatch) {
                return null;
            }

            const units = Number(unitsMatch[1]);
            const rate = Number(rateMatch[1]);

            if (
                !Number.isFinite(units) ||
                !Number.isFinite(rate) ||
                units <= 0 ||
                rate <= 0
            ) {
                return null;
            }

            const energyCharge = units * rate;
            const formattedCharge = energyCharge.toLocaleString(
                "en-US",
                { maximumFractionDigits: 2 }
            );

            return `
<div class="volt-result-card">
    <h3>🧾 বিদ্যুৎ বিলের আনুমানিক হিসাব</h3>
    <p>ব্যবহৃত বিদ্যুৎ: <strong>${units} ইউনিট</strong></p>
    <p>প্রতি ইউনিটের rate: <strong>${rate} টাকা</strong></p>
    <p>আনুমানিক energy charge: <strong>${formattedCharge} টাকা</strong></p>
    <small>এতে fixed charge, demand charge, VAT বা slab tariff ধরা হয়নি; প্রকৃত bill আলাদা হতে পারে।</small>
</div>
            `;
        },
        1600
    );

    register(
        "router-electricity-bill-needs-rate",
        function (text) {
            const t = normalizeText(text);
            const hasUnits =
                /(\d+(?:\.\d+)?)\s*(?:units?|kwh|ইউনিট)(?![\p{L}\p{N}])/iu.test(t);
            const asksBill = [
                "bill",
                "বিদ্যুৎ বিল",
                "বিল",
                "কত টাকা"
            ].some(keyword => t.includes(keyword));
            const hasRate =
                /(?:rate|রেট|প্রতি ইউনিট)\s*(?:is|=|হল|ঃ|:)?\s*\d/i.test(t) ||
                /\d+(?:\.\d+)?\s*(?:টাকা|tk|taka)\s*(?:per|প্রতি)/i.test(t);

            if (!hasUnits || !asksBill || hasRate) {
                return null;
            }

            return `
<div class="volt-result-card">
    <h3>🧾 বিদ্যুৎ বিলের আনুমানিক হিসাব</h3>
    <p>ইউনিটের সংখ্যা জানা গেছে, কিন্তু প্রতি ইউনিটের rate বা প্রযোজ্য tariff slab জানা নেই—তাই মোট energy charge নির্ভুলভাবে বলা যাবে না।</p>
    <p>আপনার প্রতি ইউনিটের rate লিখুন; হিসাব হবে: Unit × Rate। Fixed charge, demand charge, VAT ও slab পরিবর্তনে প্রকৃত bill আলাদা হতে পারে।</p>
</div>
            `;
        },
        1500
    );

    register(
        "router-help",
        function (text) {
            const t = normalizeText(text);

            const helpKeywords = [
                "কি করতে পারো",
                "কি কি করতে পারো",
                "help",
                "সাহায্য",
                "calculator list",
                "সব calculator"
            ];

            const explicitCalculatorHelp =
                /(?:সব|কী কী|কি কি|কোন কোন).{0,20}(?:calculator|ক্যালকুলেটর)|(?:calculator|ক্যালকুলেটর).{0,20}(?:list|দেখাও|কী কী|কি কি)/i.test(t);
            const matched = explicitCalculatorHelp || helpKeywords.some(keyword =>
                t.includes(normalizeText(keyword))
            );

            if (!matched) {
                return null;
            }

            return `
<div class="volt-result-card">
    <h3>⚡ ${CONFIG.assistantName} কী কী করতে পারে?</h3>

    <p>আমি নিচের electrical calculation ও troubleshooting-এ সাহায্য করতে পারি:</p>

    <ul>
        <li>Ohm's Law</li>
        <li>Power ও Energy Calculation</li>
        <li>Electricity Bill</li>
        <li>Single Phase Load</li>
        <li>Three Phase Load</li>
        <li>Voltage Drop</li>
        <li>Cable Resistance</li>
        <li>Motor Current ও RPM</li>
        <li>Transformer Sizing</li>
        <li>Generator Sizing</li>
        <li>UPS ও Inverter Sizing</li>
        <li>Battery Backup</li>
        <li>Solar Panel ও Battery</li>
        <li>Power Factor Correction</li>
        <li>Resistor Series ও Parallel</li>
        <li>LED Resistor</li>
        <li>Fuse ও MCB Preliminary Estimate</li>
        <li>Fan Slow, Light Flicker, MCB Trip Troubleshooting</li>
    </ul>

    <p>
        উদাহরণ লিখুন:
        <br>
        <b>৫টি ফ্যান ৮ ঘণ্টা চললে কত ইউনিট?</b>
        <br>
        <b>১ HP motor কত ampere নেয়?</b>
        <br>
        <b>100Ah battery কত ঘণ্টা backup দেবে?</b>
    </p>

    <small>
        ⚠️ বাস্তব installation-এর আগে qualified electrician/engineer দিয়ে verify করুন।
    </small>
</div>
            `;
        },
        1000
    );

    register(
        "router-greeting",
        function (text) {
            const t = normalizeText(text);

            const greetings = [
                "হাই",
                "হ্যালো",
                "hello",
                "hi",
                "আসসালামু আলাইকুম",
                "salam",
                "শুভ সকাল",
                "শুভ সন্ধ্যা",
                "good morning",
                "good evening"
            ];

            const matched = greetings.some(keyword =>
                t === normalizeText(keyword) ||
                t.startsWith(normalizeText(keyword) + " ")
            );

            if (!matched) {
                return null;
            }

            return `
<div class="volt-result-card">
    <h3>⚡ আসসালামু আলাইকুম!</h3>

    <p>
        আমি ${CONFIG.assistantName}।
        আপনার electrical calculation, load sizing এবং troubleshooting-এ সাহায্য করতে পারি।
    </p>

    <p>
        আপনি কী জানতে চান?
        <br>
        যেমন: <b>Battery backup হিসাব করুন</b>
    </p>
</div>
            `;
        },
        900
    );

    register(
        "router-safety",
        function (text) {
            const t = normalizeText(text);

            const dangerKeywords = [
                "বিদ্যুৎ শক",
                "electric shock",
                "শর্ট সার্কিট",
                "short circuit",
                "আগুন",
                "আগুন লেগেছে",
                "burning smell",
                "পোড়া গন্ধ",
                "স্পার্ক",
                "spark",
                "live wire",
                "লাইভ তার"
            ];

            const matched = dangerKeywords.some(keyword =>
                t.includes(normalizeText(keyword))
            );

            if (!matched) {
                return null;
            }

            return `
<div class="volt-result-card volt-safety-warning">
    <h3>🛑 জরুরি Safety Warning</h3>

    <p>
        বিদ্যুৎ সংক্রান্ত বিপদ হলে আগে নিরাপত্তা নিশ্চিত করুন।
    </p>

    <ul>
        <li>সম্ভব হলে main breaker বন্ধ করুন।</li>
        <li>ভেজা হাতে কোনো switch বা wire touch করবেন না।</li>
        <li>আগুন হলে পানি ব্যবহার করবেন না।</li>
        <li>পোড়া গন্ধ বা spark থাকলে circuit ব্যবহার বন্ধ করুন।</li>
        <li>প্রয়োজনে qualified electrician বা emergency service ডাকুন।</li>
    </ul>

    <small>
        এই chatbot emergency repair instruction-এর বিকল্প নয়।
    </small>
</div>
            `;
        },
        2000
    );

    console.log(
        "⚡ ElectroHubBD Master Router loaded successfully."
    );

    console.log(
        "Registered handlers:",
        listHandlers()
    );

})();
