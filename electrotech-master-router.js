/*
=========================================================
 ElectroTechBD Master Router
 File: electrotech-master-router.js
=========================================================
 কাজ:
 - সব chatbot module একসাথে manage করা
 - নতুন calculator register করা
 - duplicate response কমানো
 - priority অনুযায়ী calculator চালানো
 - পুরোনো chatLocalAnswer() নষ্ট না করা
=========================================================
*/

(function () {
    "use strict";

    // Prevent duplicate loading
    if (window.ElectroTechMasterRouterLoaded) {
        console.warn("ElectroTech Master Router already loaded.");
        return;
    }

    window.ElectroTechMasterRouterLoaded = true;

    /*
    -----------------------------------------------------
    Configuration
    -----------------------------------------------------
    */

    const CONFIG = {
        assistantName: "ভোল্ট",
        maxTextLength: 2000,
        enableLogs: false
    };

    /*
    -----------------------------------------------------
    Internal storage
    -----------------------------------------------------
    */

    const handlers = [];

    // Existing chatbot function capture
    const previousChatLocalAnswer =
        typeof window.chatLocalAnswer === "function"
            ? window.chatLocalAnswer
            : null;

    /*
    -----------------------------------------------------
    Utility Functions
    -----------------------------------------------------
    */

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
            console.log("[ElectroTech Router]", ...args);
        }
    }

    function safeRun(handler, text, context) {
        try {
            return handler(text, context);
        } catch (error) {
            console.error(
                "[ElectroTech Router] Handler error:",
                error
            );

            return null;
        }
    }

    /*
    -----------------------------------------------------
    Register New Handler
    -----------------------------------------------------

    Example:

    ElectroTechRouter.register(
        "my-calculator",
        function(text) {
            if (text.includes("test")) {
                return "Test result";
            }

            return null;
        },
        100
    );

    Higher priority runs first.
    -----------------------------------------------------
    */

    function register(name, handler, priority = 50) {
        if (
            typeof name !== "string" ||
            !name.trim() ||
            typeof handler !== "function"
        ) {
            console.warn(
                "[ElectroTech Router] Invalid handler registration:",
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

    /*
    -----------------------------------------------------
    Main Router
    -----------------------------------------------------
    */

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

        /*
        First: Run newly registered master handlers
        */

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

        /*
        Second: Run previously loaded chatbot system
        */

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

        /*
        No module found
        */

        return null;
    }

    /*
    -----------------------------------------------------
    Public API
    -----------------------------------------------------
    */

    window.ElectroTechRouter = {
        register,
        unregister,
        listHandlers,
        route: routeMessage,
        normalizeText,
        cleanText,
        config: CONFIG
    };

    /*
    -----------------------------------------------------
    Replace Global chatLocalAnswer
    -----------------------------------------------------
    */

    window.chatLocalAnswer = function (message, context = {}) {
        return routeMessage(message, context);
    };

    /*
    -----------------------------------------------------
    Built-in General Handlers
    -----------------------------------------------------
    */

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
                "সব calculator",
                "ক্যালকুলেটর"
            ];

            const matched = helpKeywords.some(keyword =>
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

    /*
    -----------------------------------------------------
    Built-in Greeting Handler
    -----------------------------------------------------
    */

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

    /*
    -----------------------------------------------------
    Built-in Safety Handler
    -----------------------------------------------------
    */

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

    /*
    -----------------------------------------------------
    Console Information
    -----------------------------------------------------
    */

    console.log(
        "⚡ ElectroTechBD Master Router loaded successfully."
    );

    console.log(
        "Registered handlers:",
        listHandlers()
    );

})();