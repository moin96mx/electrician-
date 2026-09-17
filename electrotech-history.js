/* =========================================================
   ElectroTechBD History System
   File: electrotech-history.js
   Version: 1.0.0

   Features:
   - Navbar History button
   - Save calculation history
   - Search history
   - Copy history
   - Delete single history
   - Clear all history
   - Responsive modal
   - LocalStorage support
========================================================= */

(function () {
    "use strict";

    /* -----------------------------------------------------
       Configuration
    ----------------------------------------------------- */

    const CONFIG = {
        storageKey: "electrotechbd_calculation_history",
        maxItems: 100,
        navButtonId: "eth-open-history-nav",
        modalId: "eth-history-modal"
    };

    /* -----------------------------------------------------
       Internal state
    ----------------------------------------------------- */

    let historyItems = [];
    let currentSearch = "";

    /* -----------------------------------------------------
       Utility functions
    ----------------------------------------------------- */

    function createId() {
        return (
            Date.now().toString(36) +
            Math.random().toString(36).slice(2, 8)
        );
    }

    function safeText(value) {
        if (value === null || value === undefined) {
            return "";
        }

        return String(value);
    }

    function escapeHTML(value) {
        return safeText(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatNumber(value) {
        const number = Number(value);

        if (!Number.isFinite(number)) {
            return safeText(value);
        }

        return number.toLocaleString("en-US", {
            maximumFractionDigits: 2
        });
    }

    function formatDate(dateValue) {
        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "Unknown date";
        }

        return date.toLocaleString("en-BD", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        });
    }

    function showToast(message, type) {
        let toast = document.getElementById(
            "eth-history-toast"
        );

        if (!toast) {
            toast = document.createElement("div");

            toast.id = "eth-history-toast";

            document.body.appendChild(toast);
        }

        toast.textContent = message;

        toast.className = "eth-history-toast";

        if (type === "error") {
            toast.classList.add("error");
        }

        requestAnimationFrame(function () {
            toast.classList.add("show");
        });

        setTimeout(function () {
            toast.classList.remove("show");
        }, 2600);
    }

    /* -----------------------------------------------------
       LocalStorage
    ----------------------------------------------------- */

    function loadHistory() {
        try {
            const saved = localStorage.getItem(
                CONFIG.storageKey
            );

            if (!saved) {
                historyItems = [];
                return;
            }

            const parsed = JSON.parse(saved);

            if (Array.isArray(parsed)) {
                historyItems = parsed;
            } else {
                historyItems = [];
            }
        } catch (error) {
            console.warn(
                "ElectroTechBD History Load Error:",
                error
            );

            historyItems = [];
        }
    }

    function saveHistoryToStorage() {
        try {
            historyItems = historyItems.slice(
                0,
                CONFIG.maxItems
            );

            localStorage.setItem(
                CONFIG.storageKey,
                JSON.stringify(historyItems)
            );

            return true;
        } catch (error) {
            console.warn(
                "ElectroTechBD History Save Error:",
                error
            );

            showToast(
                "History save করা যায়নি",
                "error"
            );

            return false;
        }
    }

    /* -----------------------------------------------------
       Normalize calculation data
    ----------------------------------------------------- */

    function normalizeCalculation(data) {
        const source = data || {};

        const result = {
            id: source.id || createId(),

            createdAt:
                source.createdAt ||
                new Date().toISOString(),

            customerName:
                source.customerName ||
                source.customer ||
                "",

            projectName:
                source.projectName ||
                source.project ||
                "Electrical Calculation",

            mobile:
                source.mobile ||
                source.phone ||
                "",

            totalLoad:
                source.totalLoad ??
                source.connectedLoad ??
                source.load ??
                "",

            dailyEnergy:
                source.dailyEnergy ??
                source.energy ??
                "",

            monthlyEnergy:
                source.monthlyEnergy ??
                "",

            monthlyBill:
                source.monthlyBill ??
                source.bill ??
                "",

            inverter:
                source.inverter ||
                source.suggestedInverter ||
                "",

            battery:
                source.battery ||
                source.suggestedBattery ||
                "",

            tariff:
                source.tariff ?? "",

            powerFactor:
                source.powerFactor ?? "",

            batteryVoltage:
                source.batteryVoltage || "",

            backupHours:
                source.backupHours ?? "",

            equipment:
                Array.isArray(source.equipment)
                    ? source.equipment
                    : Array.isArray(source.items)
                    ? source.items
                    : [],

            notes:
                source.notes || "",

            raw:
                source.raw || {}
        };

        return result;
    }

    /* -----------------------------------------------------
       Public save function
    ----------------------------------------------------- */

    function saveCalculation(data) {
        const item = normalizeCalculation(data);

        historyItems = historyItems.filter(function (oldItem) {
            return oldItem.id !== item.id;
        });

        historyItems.unshift(item);

        historyItems = historyItems.slice(
            0,
            CONFIG.maxItems
        );

        const saved = saveHistoryToStorage();

        if (saved) {
            showToast(
                "Calculation History save হয়েছে"
            );

            renderHistoryList();
        }

        return item;
    }

    /* -----------------------------------------------------
       Delete functions
    ----------------------------------------------------- */

    function deleteCalculation(id) {
        const confirmed = window.confirm(
            "এই calculation history মুছে ফেলতে চান?"
        );

        if (!confirmed) {
            return;
        }

        historyItems = historyItems.filter(function (item) {
            return item.id !== id;
        });

        saveHistoryToStorage();

        renderHistoryList();

        showToast("History মুছে ফেলা হয়েছে");
    }

    function clearAllHistory() {
        if (!historyItems.length) {
            showToast("মুছে ফেলার মতো history নেই");
            return;
        }

        const confirmed = window.confirm(
            "সব calculation history মুছে ফেলতে চান?"
        );

        if (!confirmed) {
            return;
        }

        historyItems = [];

        saveHistoryToStorage();

        renderHistoryList();

        showToast("সব history মুছে ফেলা হয়েছে");
    }

    /* -----------------------------------------------------
       Copy functions
    ----------------------------------------------------- */

    function createCopyText(item) {
        let text = "";

        text += "ElectroTechBD Electrical Calculation\n";
        text += "====================================\n";
        text += "Date: " + formatDate(item.createdAt) + "\n";

        if (item.customerName) {
            text += "Customer: " + item.customerName + "\n";
        }

        if (item.projectName) {
            text += "Project: " + item.projectName + "\n";
        }

        if (item.mobile) {
            text += "Mobile: " + item.mobile + "\n";
        }

        text += "\n";

        if (item.totalLoad !== "") {
            text +=
                "Total Connected Load: " +
                formatNumber(item.totalLoad) +
                " W\n";
        }

        if (item.dailyEnergy !== "") {
            text +=
                "Daily Energy: " +
                formatNumber(item.dailyEnergy) +
                " kWh\n";
        }

        if (item.monthlyEnergy !== "") {
            text +=
                "Monthly Energy: " +
                formatNumber(item.monthlyEnergy) +
                " kWh\n";
        }

        if (item.monthlyBill !== "") {
            text +=
                "Estimated Monthly Bill: ৳ " +
                formatNumber(item.monthlyBill) +
                "\n";
        }

        if (item.inverter) {
            text +=
                "Suggested Inverter: " +
                item.inverter +
                "\n";
        }

        if (item.battery) {
            text +=
                "Suggested Battery: " +
                item.battery +
                "\n";
        }

        if (item.tariff !== "") {
            text +=
                "Tariff: " +
                item.tariff +
                "\n";
        }

        if (item.powerFactor !== "") {
            text +=
                "Power Factor: " +
                item.powerFactor +
                "\n";
        }

        if (item.batteryVoltage) {
            text +=
                "Battery Voltage: " +
                item.batteryVoltage +
                "\n";
        }

        if (item.backupHours !== "") {
            text +=
                "Backup Hours: " +
                item.backupHours +
                "\n";
        }

        if (item.equipment.length) {
            text += "\nEquipment Load:\n";

            item.equipment.forEach(function (equipment, index) {
                const name =
                    equipment.name ||
                    equipment.equipment ||
                    "Equipment " + (index + 1);

                const quantity =
                    equipment.quantity ??
                    equipment.qty ??
                    1;

                const watt =
                    equipment.watt ??
                    equipment.power ??
                    "";

                const hours =
                    equipment.hours ??
                    equipment.hour ??
                    "";

                text +=
                    index +
                    1 +
                    ". " +
                    name +
                    " | Qty: " +
                    quantity +
                    " | Watt: " +
                    watt +
                    " | Hour: " +
                    hours +
                    "\n";
            });
        }

        if (item.notes) {
            text += "\nNotes: " + item.notes + "\n";
        }

        text +=
            "\nSafety: Final cable, MCB, inverter and battery selection must be verified by a qualified electrician/engineer.";

        return text;
    }

    function copyText(text) {
        if (
            navigator.clipboard &&
            navigator.clipboard.writeText
        ) {
            navigator.clipboard
                .writeText(text)
                .then(function () {
                    showToast("Report copy হয়েছে");
                })
                .catch(function () {
                    fallbackCopy(text);
                });

            return;
        }

        fallbackCopy(text);
    }

    function fallbackCopy(text) {
        const textarea =
            document.createElement("textarea");

        textarea.value = text;

        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";

        document.body.appendChild(textarea);

        textarea.select();

        try {
            document.execCommand("copy");

            showToast("Report copy হয়েছে");
        } catch (error) {
            showToast(
                "Copy করা যায়নি",
                "error"
            );
        }

        textarea.remove();
    }

    function copyCalculation(id) {
        const item = historyItems.find(function (historyItem) {
            return historyItem.id === id;
        });

        if (!item) {
            showToast(
                "Calculation পাওয়া যায়নি",
                "error"
            );

            return;
        }

        copyText(createCopyText(item));
    }

    /* -----------------------------------------------------
       Modal HTML
    ----------------------------------------------------- */

    function createModal() {
        if (
            document.getElementById(
                CONFIG.modalId
            )
        ) {
            return;
        }

        const modal =
            document.createElement("div");

        modal.id = CONFIG.modalId;

        modal.className =
            "eth-history-modal";

        modal.innerHTML = `
            <div
                class="eth-history-overlay"
                data-history-close="true">
            </div>

            <section
                class="eth-history-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="eth-history-title">

                <div class="eth-history-header">
                    <div>
                        <div class="eth-history-title">
                            🗂 Calculation History
                        </div>

                        <div class="eth-history-subtitle">
                            আপনার আগের electrical calculation
                        </div>
                    </div>

                    <button
                        type="button"
                        class="eth-history-close"
                        id="eth-history-close"
                        aria-label="Close History">
                        ×
                    </button>
                </div>

                <div class="eth-history-toolbar">
                    <input
                        type="search"
                        id="eth-history-search"
                        class="eth-history-search"
                        placeholder="Search customer বা project..."
                        autocomplete="off">

                    <button
                        type="button"
                        id="eth-history-clear"
                        class="eth-history-danger-button">
                        Clear All
                    </button>
                </div>

                <div
                    id="eth-history-count"
                    class="eth-history-count">
                    0 calculation
                </div>

                <div
                    id="eth-history-list"
                    class="eth-history-list">
                </div>

                <div class="eth-history-footer">
                    <span>
                        History এই browser-এ save থাকে
                    </span>

                    <button
                        type="button"
                        id="eth-history-footer-close"
                        class="eth-history-secondary-button">
                        Close
                    </button>
                </div>
            </section>
        `;

        document.body.appendChild(modal);

        bindModalEvents();
    }

    /* -----------------------------------------------------
       Modal events
    ----------------------------------------------------- */

    function bindModalEvents() {
        const modal =
            document.getElementById(
                CONFIG.modalId
            );

        if (!modal) {
            return;
        }

        const closeButton =
            document.getElementById(
                "eth-history-close"
            );

        const footerClose =
            document.getElementById(
                "eth-history-footer-close"
            );

        const clearButton =
            document.getElementById(
                "eth-history-clear"
            );

        const searchInput =
            document.getElementById(
                "eth-history-search"
            );

        if (closeButton) {
            closeButton.addEventListener(
                "click",
                closeHistory
            );
        }

        if (footerClose) {
            footerClose.addEventListener(
                "click",
                closeHistory
            );
        }

        if (clearButton) {
            clearButton.addEventListener(
                "click",
                clearAllHistory
            );
        }

        if (searchInput) {
            searchInput.addEventListener(
                "input",
                function (event) {
                    currentSearch =
                        event.target.value
                            .trim()
                            .toLowerCase();

                    renderHistoryList();
                }
            );
        }

        modal.addEventListener(
            "click",
            function (event) {
                const closeTarget =
                    event.target.closest(
                        "[data-history-close='true']"
                    );

                if (closeTarget) {
                    closeHistory();
                }
            }
        );

        document.addEventListener(
            "keydown",
            function (event) {
                if (
                    event.key === "Escape" &&
                    modal.classList.contains("open")
                ) {
                    closeHistory();
                }
            }
        );
    }

    /* -----------------------------------------------------
       Open and close modal
    ----------------------------------------------------- */

    function openHistory() {
        createModal();

        loadHistory();

        currentSearch = "";

        const searchInput =
            document.getElementById(
                "eth-history-search"
            );

        if (searchInput) {
            searchInput.value = "";
        }

        renderHistoryList();

        const modal =
            document.getElementById(
                CONFIG.modalId
            );

        if (modal) {
            modal.classList.add("open");

            document.body.classList.add(
                "eth-history-lock-scroll"
            );
        }
    }

    function closeHistory() {
        const modal =
            document.getElementById(
                CONFIG.modalId
            );

        if (modal) {
            modal.classList.remove("open");

            document.body.classList.remove(
                "eth-history-lock-scroll"
            );
        }
    }

    /* -----------------------------------------------------
       Render history list
    ----------------------------------------------------- */

    function renderHistoryList() {
        const list =
            document.getElementById(
                "eth-history-list"
            );

        const count =
            document.getElementById(
                "eth-history-count"
            );

        if (!list) {
            return;
        }

        const filteredItems =
            historyItems.filter(function (item) {
                if (!currentSearch) {
                    return true;
                }

                const searchableText = [
                    item.customerName,
                    item.projectName,
                    item.mobile,
                    item.totalLoad,
                    item.monthlyBill
                ]
                    .join(" ")
                    .toLowerCase();

                return searchableText.includes(
                    currentSearch
                );
            });

        if (count) {
            count.textContent =
                filteredItems.length +
                " calculation found";
        }

        if (!filteredItems.length) {
            list.innerHTML = `
                <div class="eth-history-empty">
                    <div class="eth-history-empty-icon">
                        🗂
                    </div>

                    <h3>
                        ${
                            currentSearch
                                ? "কোনো history পাওয়া যায়নি"
                                : "এখনো কোনো history নেই"
                        }
                    </h3>

                    <p>
                        Load Calculator থেকে calculation save করলে
                        এখানে দেখা যাবে।
                    </p>
                </div>
            `;

            return;
        }

        list.innerHTML = filteredItems
            .map(function (item) {
                return createHistoryCard(item);
            })
            .join("");

        bindHistoryCardEvents();
    }

    function createHistoryCard(item) {
        const customer =
            item.customerName ||
            "Customer not specified";

        const project =
            item.projectName ||
            "Electrical Calculation";

        const load =
            item.totalLoad !== ""
                ? formatNumber(item.totalLoad) + " W"
                : "Not available";

        const bill =
            item.monthlyBill !== ""
                ? "৳ " +
                  formatNumber(item.monthlyBill)
                : "Not available";

        const energy =
            item.dailyEnergy !== ""
                ? formatNumber(item.dailyEnergy) +
                  " kWh/day"
                : "Not available";

        return `
            <article
                class="eth-history-card"
                data-history-id="${escapeHTML(item.id)}">

                <div class="eth-history-card-top">
                    <div>
                        <h3 class="eth-history-project">
                            ${escapeHTML(project)}
                        </h3>

                        <p class="eth-history-customer">
                            👤 ${escapeHTML(customer)}
                        </p>
                    </div>

                    <span class="eth-history-date">
                        ${escapeHTML(
                            formatDate(item.createdAt)
                        )}
                    </span>
                </div>

                <div class="eth-history-metrics">
                    <div class="eth-history-metric">
                        <span>Total Load</span>
                        <strong>${escapeHTML(load)}</strong>
                    </div>

                    <div class="eth-history-metric">
                        <span>Daily Energy</span>
                        <strong>${escapeHTML(energy)}</strong>
                    </div>

                    <div class="eth-history-metric">
                        <span>Monthly Bill</span>
                        <strong>${escapeHTML(bill)}</strong>
                    </div>
                </div>

                <div class="eth-history-card-actions">
                    <button
                        type="button"
                        class="eth-history-action copy"
                        data-history-action="copy"
                        data-history-id="${escapeHTML(item.id)}">
                        📋 Copy
                    </button>

                    <button
                        type="button"
                        class="eth-history-action view"
                        data-history-action="view"
                        data-history-id="${escapeHTML(item.id)}">
                        👁 View
                    </button>

                    <button
                        type="button"
                        class="eth-history-action delete"
                        data-history-action="delete"
                        data-history-id="${escapeHTML(item.id)}">
                        🗑 Delete
                    </button>
                </div>
            </article>
        `;
    }

    function bindHistoryCardEvents() {
        const buttons =
            document.querySelectorAll(
                "[data-history-action]"
            );

        buttons.forEach(function (button) {
            button.addEventListener(
                "click",
                function () {
                    const action =
                        button.getAttribute(
                            "data-history-action"
                        );

                    const id =
                        button.getAttribute(
                            "data-history-id"
                        );

                    if (action === "copy") {
                        copyCalculation(id);
                    }

                    if (action === "view") {
                        viewCalculation(id);
                    }

                    if (action === "delete") {
                        deleteCalculation(id);
                    }
                }
            );
        });
    }

    /* -----------------------------------------------------
       View single calculation
    ----------------------------------------------------- */

    function viewCalculation(id) {
        const item = historyItems.find(function (historyItem) {
            return historyItem.id === id;
        });

        if (!item) {
            showToast(
                "Calculation পাওয়া যায়নি",
                "error"
            );

            return;
        }

        const details = createCopyText(item);

        const modal =
            document.getElementById(
                CONFIG.modalId
            );

        if (!modal) {
            return;
        }

        const existing =
            document.getElementById(
                "eth-history-detail"
            );

        if (existing) {
            existing.remove();
        }

        const detail =
            document.createElement("div");

        detail.id = "eth-history-detail";

        detail.className =
            "eth-history-detail";

        detail.innerHTML = `
            <div class="eth-history-detail-box">
                <div class="eth-history-detail-header">
                    <strong>
                        Calculation Details
                    </strong>

                    <button
                        type="button"
                        id="eth-history-detail-close">
                        ×
                    </button>
                </div>

                <pre>${escapeHTML(details)}</pre>

                <div class="eth-history-detail-actions">
                    <button
                        type="button"
                        id="eth-history-detail-copy"
                        class="eth-history-action copy">
                        📋 Copy Report
                    </button>

                    <button
                        type="button"
                        id="eth-history-detail-close-bottom"
                        class="eth-history-action view">
                        Close
                    </button>
                </div>
            </div>
        `;

        modal.querySelector(
            ".eth-history-dialog"
        ).appendChild(detail);

        document
            .getElementById(
                "eth-history-detail-close"
            )
            .addEventListener(
                "click",
                function () {
                    detail.remove();
                }
            );

        document
            .getElementById(
                "eth-history-detail-close-bottom"
            )
            .addEventListener(
                "click",
                function () {
                    detail.remove();
                }
            );

        document
            .getElementById(
                "eth-history-detail-copy"
            )
            .addEventListener(
                "click",
                function () {
                    copyText(details);
                }
            );
    }

    /* -----------------------------------------------------
       Navbar button
    ----------------------------------------------------- */

    function connectNavbarButton() {
        const button =
            document.getElementById(
                CONFIG.navButtonId
            );

        if (!button) {
            console.warn(
                "History navbar button পাওয়া যায়নি। " +
                "id='eth-open-history-nav' ব্যবহার করুন।"
            );

            return;
        }

        if (
            button.dataset.historyConnected ===
            "true"
        ) {
            return;
        }

        button.dataset.historyConnected =
            "true";

        button.addEventListener(
            "click",
            function () {
                openHistory();

                /*
                 Mobile menu থাকলে close করবে
                */
                const mobileMenu =
                    document.querySelector(
                        ".nav-menu.active, " +
                        ".nav-links.active, " +
                        ".mobile-menu.active, " +
                        ".menu-open"
                    );

                if (mobileMenu) {
                    mobileMenu.classList.remove(
                        "active"
                    );

                    mobileMenu.classList.remove(
                        "menu-open"
                    );
                }
            }
        );
    }

    /* -----------------------------------------------------
       Automatic event integration
    ----------------------------------------------------- */

    function connectCalculationEvent() {
        document.addEventListener(
            "eth:calculation-saved",
            function (event) {
                if (
                    event &&
                    event.detail
                ) {
                    saveCalculation(
                        event.detail
                    );
                }
            }
        );
    }

    /*
       Other JavaScript file থেকে এই event dispatch করতে পারবেন:

       document.dispatchEvent(
           new CustomEvent(
               "eth:calculation-saved",
               {
                   detail: {
                       customerName: "Md. Moin",
                       projectName: "Home Project",
                       totalLoad: 1250,
                       dailyEnergy: 6.5,
                       monthlyBill: 2340
                   }
               }
           )
       );
    */

    /* -----------------------------------------------------
       CSS injection
    ----------------------------------------------------- */

    function injectStyles() {
        if (
            document.getElementById(
                "eth-history-styles"
            )
        ) {
            return;
        }

        const style =
            document.createElement("style");

        style.id =
            "eth-history-styles";

        style.textContent = `
            .eth-history-lock-scroll {
                overflow: hidden !important;
            }

            .eth-history-modal {
                position: fixed;
                inset: 0;
                z-index: 999999;

                display: none;

                align-items: center;
                justify-content: center;

                padding: 18px;
            }

            .eth-history-modal.open {
                display: flex;
            }

            .eth-history-overlay {
                position: absolute;
                inset: 0;

                background:
                    rgba(0, 0, 0, 0.78);

                backdrop-filter:
                    blur(5px);
            }

            .eth-history-dialog {
                position: relative;
                z-index: 2;

                width: min(
                    100%,
                    850px
                );

                max-height: 92vh;

                overflow-y: auto;

                color: #eefcff;

                background:
                    linear-gradient(
                        145deg,
                        #111c2a,
                        #0c1420
                    );

                border: 1px solid
                    rgba(0, 245, 212, 0.7);

                border-radius: 18px;

                box-shadow:
                    0 25px 90px
                    rgba(0, 0, 0, 0.55),

                    0 0 35px
                    rgba(0, 245, 212, 0.12);

                padding: 22px;
            }

            .eth-history-header {
                display: flex;

                align-items: flex-start;
                justify-content: space-between;

                gap: 18px;

                margin-bottom: 20px;
            }

            .eth-history-title {
                color: #00f5d4;

                font-size: clamp(
                    20px,
                    3vw,
                    29px
                );

                font-weight: 800;

                line-height: 1.25;
            }

            .eth-history-subtitle {
                margin-top: 7px;

                color: #a9bbc9;

                font-size: 13px;
            }

            .eth-history-close {
                display: grid;

                place-items: center;

                width: 42px;
                height: 42px;

                flex: 0 0 auto;

                color: #ff477e;

                background: transparent;

                border: 1px solid
                    #ff477e;

                border-radius: 10px;

                font-size: 28px;

                line-height: 1;

                cursor: pointer;

                transition: 0.25s ease;
            }

            .eth-history-close:hover {
                color: #ffffff;

                background: #ff477e;
            }

            .eth-history-toolbar {
                display: flex;

                align-items: center;

                gap: 10px;

                margin-bottom: 12px;
            }

            .eth-history-search {
                width: 100%;

                min-width: 0;

                padding: 13px 14px;

                color: #ffffff;

                background: #1a2a3a;

                border: 1px solid
                    #36556c;

                border-radius: 10px;

                outline: none;

                font: inherit;

                font-size: 14px;
            }

            .eth-history-search:focus {
                border-color: #00f5d4;

                box-shadow:
                    0 0 0 3px
                    rgba(0, 245, 212, 0.12);
            }

            .eth-history-danger-button {
                flex: 0 0 auto;

                padding: 12px 14px;

                color: #ffffff;

                background: #8d2346;

                border: 1px solid #ff477e;

                border-radius: 10px;

                font: inherit;

                font-size: 13px;

                font-weight: 700;

                cursor: pointer;
            }

            .eth-history-count {
                margin-bottom: 12px;

                color: #8fa8b8;

                font-size: 13px;
            }

            .eth-history-list {
                display: grid;

                gap: 12px;
            }

            .eth-history-card {
                padding: 16px;

                background:
                    rgba(26, 42, 58, 0.8);

                border: 1px solid
                    rgba(0, 245, 212, 0.25);

                border-radius: 13px;

                transition:
                    border-color 0.2s ease,
                    transform 0.2s ease;
            }

            .eth-history-card:hover {
                border-color: #00f5d4;

                transform: translateY(-1px);
            }

            .eth-history-card-top {
                display: flex;

                align-items: flex-start;
                justify-content: space-between;

                gap: 15px;

                margin-bottom: 14px;
            }

            .eth-history-project {
                margin: 0;

                color: #00f5d4;

                font-size: 17px;

                font-weight: 800;
            }

            .eth-history-customer {
                margin: 6px 0 0;

                color: #d3e0e8;

                font-size: 13px;
            }

            .eth-history-date {
                color: #8fa8b8;

                font-size: 11px;

                text-align: right;
            }

            .eth-history-metrics {
                display: grid;

                grid-template-columns:
                    repeat(3, minmax(0, 1fr));

                gap: 10px;

                margin-bottom: 15px;
            }

            .eth-history-metric {
                min-width: 0;

                padding: 11px;

                background: #122333;

                border-radius: 9px;
            }

            .eth-history-metric span {
                display: block;

                margin-bottom: 6px;

                color: #91a9b8;

                font-size: 11px;
            }

            .eth-history-metric strong {
                display: block;

                color: #ffffff;

                font-size: 14px;

                overflow-wrap: anywhere;
            }

            .eth-history-card-actions {
                display: flex;

                flex-wrap: wrap;

                gap: 8px;
            }

            .eth-history-action {
                padding: 9px 12px;

                border-radius: 8px;

                font: inherit;

                font-size: 12px;

                font-weight: 700;

                cursor: pointer;

                transition: 0.2s ease;
            }

            .eth-history-action.copy {
                color: #001b19;

                background: #00f5d4;

                border: 1px solid #00f5d4;
            }

            .eth-history-action.view {
                color: #00f5d4;

                background: transparent;

                border: 1px solid #00f5d4;
            }

            .eth-history-action.delete {
                color: #ffb4c8;

                background: transparent;

                border: 1px solid #ff477e;
            }

            .eth-history-action:hover {
                transform: translateY(-1px);

                filter: brightness(1.1);
            }

            .eth-history-empty {
                padding: 45px 18px;

                color: #a9bbc9;

                text-align: center;

                border: 1px dashed
                    rgba(0, 245, 212, 0.35);

                border-radius: 13px;
            }

            .eth-history-empty-icon {
                margin-bottom: 10px;

                font-size: 38px;
            }

            .eth-history-empty h3 {
                margin: 0 0 8px;

                color: #00f5d4;

                font-size: 18px;
            }

            .eth-history-empty p {
                margin: 0;

                font-size: 13px;

                line-height: 1.7;
            }

            .eth-history-footer {
                display: flex;

                align-items: center;
                justify-content: space-between;

                gap: 15px;

                margin-top: 20px;

                padding-top: 15px;

                color: #8fa8b8;

                border-top: 1px solid
                    rgba(255, 255, 255, 0.1);

                font-size: 12px;
            }

            .eth-history-secondary-button {
                padding: 9px 15px;

                color: #00f5d4;

                background: transparent;

                border: 1px solid #00f5d4;

                border-radius: 8px;

                font: inherit;

                cursor: pointer;
            }

            .eth-history-detail {
                position: absolute;

                inset: 0;

                z-index: 10;

                display: flex;

                align-items: center;
                justify-content: center;

                padding: 18px;

                background:
                    rgba(4, 10, 17, 0.94);

                border-radius: 18px;
            }

            .eth-history-detail-box {
                width: 100%;

                max-height: 100%;

                overflow-y: auto;

                padding: 18px;

                background: #101e2d;

                border: 1px solid #00f5d4;

                border-radius: 13px;
            }

            .eth-history-detail-header {
                display: flex;

                align-items: center;
                justify-content: space-between;

                gap: 12px;

                margin-bottom: 12px;

                color: #00f5d4;

                font-size: 17px;
            }

            .eth-history-detail-header button {
                width: 32px;
                height: 32px;

                color: #ff477e;

                background: transparent;

                border: 1px solid #ff477e;

                border-radius: 7px;

                font-size: 22px;

                cursor: pointer;
            }

            .eth-history-detail pre {
                margin: 0;

                padding: 14px;

                color: #e8faff;

                background: #09131f;

                border-radius: 9px;

                white-space: pre-wrap;

                overflow-wrap: anywhere;

                font-family: inherit;

                font-size: 13px;

                line-height: 1.7;
            }

            .eth-history-detail-actions {
                display: flex;

                flex-wrap: wrap;

                gap: 8px;

                margin-top: 14px;
            }

            .eth-history-toast {
                position: fixed;

                left: 50%;

                bottom: 25px;

                z-index: 1000000;

                max-width: calc(100% - 30px);

                padding: 12px 18px;

                color: #001b19;

                background: #00f5d4;

                border-radius: 10px;

                font-size: 13px;

                font-weight: 800;

                text-align: center;

                opacity: 0;

                pointer-events: none;

                transform:
                    translate(-50%, 15px);

                transition:
                    opacity 0.25s ease,
                    transform 0.25s ease;
            }

            .eth-history-toast.show {
                opacity: 1;

                transform:
                    translate(-50%, 0);
            }

            .eth-history-toast.error {
                color: #ffffff;

                background: #c52858;
            }

            @media (max-width: 600px) {
                .eth-history-modal {
                    align-items: flex-end;

                    padding: 0;
                }

                .eth-history-dialog {
                    width: 100%;

                    max-height: 94vh;

                    padding: 16px;

                    border-radius:
                        18px 18px 0 0;
                }

                .eth-history-title {
                    font-size: 21px;
                }

                .eth-history-toolbar {
                    flex-direction: column;

                    align-items: stretch;
                }

                .eth-history-danger-button {
                    width: 100%;
                }

                .eth-history-card-top {
                    flex-direction: column;

                    gap: 8px;
                }

                .eth-history-date {
                    text-align: left;
                }

                .eth-history-metrics {
                    grid-template-columns:
                        1fr;
                }

                .eth-history-metric {
                    display: flex;

                    align-items: center;
                    justify-content: space-between;

                    gap: 10px;
                }

                .eth-history-metric span {
                    margin: 0;
                }

                .eth-history-metric strong {
                    text-align: right;
                }

                .eth-history-card-actions {
                    display: grid;

                    grid-template-columns:
                        repeat(3, minmax(0, 1fr));
                }

                .eth-history-action {
                    width: 100%;

                    padding: 10px 5px;

                    font-size: 11px;
                }

                .eth-history-footer {
                    align-items: stretch;

                    flex-direction: column;
                }

                .eth-history-secondary-button {
                    width: 100%;
                }
            }

            @media (max-width: 380px) {
                .eth-history-dialog {
                    padding: 13px;
                }

                .eth-history-title {
                    font-size: 19px;
                }

                .eth-history-project {
                    font-size: 15px;
                }

                .eth-history-card-actions {
                    grid-template-columns:
                        1fr;
                }

                .eth-history-action {
                    font-size: 12px;
                }
            }
        `;

        document.head.appendChild(style);
    }

    /* -----------------------------------------------------
       Public API
    ----------------------------------------------------- */

    window.ElectroTechHistory = {
        open: openHistory,
        close: closeHistory,
        save: saveCalculation,
        delete: deleteCalculation,
        clear: clearAllHistory,
        copy: copyCalculation,
        getAll: function () {
            return [...historyItems];
        },
        count: function () {
            return historyItems.length;
        }
    };

    /* -----------------------------------------------------
       Initialize
    ----------------------------------------------------- */

    function initialize() {
        loadHistory();

        injectStyles();

        createModal();

        connectNavbarButton();

        connectCalculationEvent();

        console.log(
            "🗂 ElectroTechBD History System Loaded Successfully."
        );
    }

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            initialize
        );
    } else {
        initialize();
    }
})();