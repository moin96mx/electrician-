/*
=========================================================
 ElectroTechBD Load Calculator
 File: electrotech-load-form.js
 Version: 3.0 Navbar Edition
=========================================================
*/

(function () {
    "use strict";

    if (window.ElectroTechLoadFormLoaded) {
        console.warn(
            "ElectroTech Load Form already loaded."
        );
        return;
    }

    window.ElectroTechLoadFormLoaded = true;

    const APP_ID =
        "electrotech-load-calculator-app";

    const STYLE_ID =
        "electrotech-load-calculator-styles";

    const NAVBAR_BUTTON_ID =
        "navbar-load-calculator";

    const state = {
        customerName: "",
        projectName: "",
        customerPhone: "",

        tariff: 12,
        powerFactor: 0.8,
        batteryVoltage: 12,
        backupHours: 4,

        rows: [
            {
                id: createId(),
                name: "Fan",
                quantity: 1,
                watt: 75,
                hours: 8
            }
        ]
    };

    const equipmentList = [
        {
            name: "Fan",
            watt: 75
        },
        {
            name: "LED Light",
            watt: 12
        },
        {
            name: "Tube Light",
            watt: 40
        },
        {
            name: "TV",
            watt: 100
        },
        {
            name: "Refrigerator",
            watt: 150
        },
        {
            name: "Computer",
            watt: 200
        },
        {
            name: "Laptop",
            watt: 65
        },
        {
            name: "Router",
            watt: 15
        },
        {
            name: "Washing Machine",
            watt: 500
        },
        {
            name: "Iron",
            watt: 1000
        },
        {
            name: "Rice Cooker",
            watt: 700
        },
        {
            name: "Water Pump",
            watt: 750
        },
        {
            name: "AC",
            watt: 1200
        },
        {
            name: "Microwave Oven",
            watt: 1200
        },
        {
            name: "Water Heater",
            watt: 2000
        },
        {
            name: "Custom Equipment",
            watt: 100
        }
    ];

    /*
    =====================================================
     BASIC HELPERS
    =====================================================
    */

    function createId() {
        return (
            Date.now().toString(36) +
            Math.random()
                .toString(36)
                .slice(2, 9)
        );
    }

    function number(value) {
        const parsed = parseFloat(value);

        return Number.isFinite(parsed)
            ? parsed
            : 0;
    }

    function money(value) {
        return Number(value || 0).toLocaleString(
            "en-BD",
            {
                maximumFractionDigits: 2
            }
        );
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getApp() {
        return document.getElementById(APP_ID);
    }

    /*
    =====================================================
     OPEN / CLOSE
    =====================================================
    */

    function openCalculator() {
        const app = getApp();

        if (!app) {
            return;
        }

        app.classList.add("etl-visible");
        app.style.display = "block";
        app.setAttribute("aria-hidden", "false");

        document.body.classList.add(
            "etl-calculator-open"
        );
    }

    function closeCalculator() {
        const app = getApp();

        if (!app) {
            return;
        }

        app.classList.remove("etl-visible");
        app.style.display = "none";
        app.setAttribute("aria-hidden", "true");

        document.body.classList.remove(
            "etl-calculator-open"
        );
    }

    function toggleCalculator() {
        const app = getApp();

        if (!app) {
            return;
        }

        if (
            app.classList.contains("etl-visible")
        ) {
            closeCalculator();
        } else {
            openCalculator();
        }
    }

    /*
    =====================================================
     CALCULATION
    =====================================================
    */

    function calculate() {
        let totalLoad = 0;
        let dailyEnergy = 0;

        const rows = state.rows.map(row => {
            const quantity = Math.max(
                0,
                number(row.quantity)
            );

            const watt = Math.max(
                0,
                number(row.watt)
            );

            const hours = Math.min(
                24,
                Math.max(
                    0,
                    number(row.hours)
                )
            );

            const load =
                quantity * watt;

            const energy =
                (load * hours) / 1000;

            totalLoad += load;
            dailyEnergy += energy;

            return {
                ...row,
                quantity,
                watt,
                hours,
                load,
                energy
            };
        });

        const monthlyEnergy =
            dailyEnergy * 30;

        const estimatedBill =
            monthlyEnergy *
            Math.max(
                0,
                number(state.tariff)
            );

        const powerFactor = Math.min(
            1,
            Math.max(
                0.1,
                number(state.powerFactor)
            )
        );

        const inverterVA =
            totalLoad / powerFactor;

        const recommendedInverter =
            Math.ceil(
                inverterVA / 100
            ) * 100;

        const batteryAh =
            (
                totalLoad *
                number(state.backupHours)
            ) /
            (
                number(state.batteryVoltage) *
                0.85
            );

        const recommendedBatteryAh =
            Math.ceil(
                batteryAh / 10
            ) * 10;

        return {
            rows,
            totalLoad,
            dailyEnergy,
            monthlyEnergy,
            estimatedBill,
            inverterVA,
            recommendedInverter,
            batteryAh,
            recommendedBatteryAh
        };
    }

    /*
    =====================================================
     EQUIPMENT OPTIONS
    =====================================================
    */

    function equipmentOptions(selectedName) {
        return equipmentList
            .map(item => {
                const selected =
                    item.name === selectedName
                        ? "selected"
                        : "";

                return `
                    <option
                        value="${escapeHTML(
                            item.name
                        )}"
                        ${selected}>
                        ${escapeHTML(
                            item.name
                        )}
                    </option>
                `;
            })
            .join("");
    }

    /*
    =====================================================
     RENDER EQUIPMENT ROWS
    =====================================================
    */

    function renderRows() {
        const container =
            document.getElementById(
                "etl-load-rows"
            );

        if (!container) {
            return;
        }

        container.innerHTML =
            state.rows
                .map(row => {
                    return `
                        <div
                            class="etl-equipment-row"
                            data-row-id="${row.id}">

                            <div
                                class="etl-input-group
                                etl-equipment-name">

                                <label>
                                    Equipment
                                </label>

                                <div
                                    class="etl-custom-select"
                                    data-custom-select
                                    data-id="${row.id}">
                                    <button
                                        type="button"
                                        class="etl-custom-select-trigger"
                                        aria-haspopup="listbox"
                                        aria-expanded="false"
                                        data-custom-select-trigger>
                                        <span>${escapeHTML(row.name)}</span>
                                        <span class="etl-select-chevron" aria-hidden="true">▾</span>
                                    </button>

                                    <div
                                        class="etl-custom-select-menu"
                                        role="listbox"
                                        aria-label="Equipment"
                                        data-custom-select-menu>
                                        ${equipmentList.map(item => `
                                            <button
                                                type="button"
                                                class="etl-custom-option${item.name === row.name ? " is-selected" : ""}"
                                                role="option"
                                                aria-selected="${item.name === row.name ? "true" : "false"}"
                                                data-custom-option
                                                data-value="${escapeHTML(item.name)}"
                                                data-id="${row.id}">
                                                <span>${escapeHTML(item.name)}</span>
                                                <small>${item.watt} W</small>
                                            </button>
                                        `).join("")}
                                    </div>
                                </div>
                            </div>

                            <div
                                class="etl-input-group">

                                <label>
                                    Quantity
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value="${row.quantity}"
                                    data-action="quantity"
                                    data-id="${row.id}">
                            </div>

                            <div
                                class="etl-input-group">

                                <label>
                                    Watt
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value="${row.watt}"
                                    data-action="watt"
                                    data-id="${row.id}">
                            </div>

                            <div
                                class="etl-input-group">

                                <label>
                                    Hour/day
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    max="24"
                                    step="0.5"
                                    value="${row.hours}"
                                    data-action="hours"
                                    data-id="${row.id}">
                            </div>

                            <button
                                type="button"
                                class="etl-delete-button"
                                data-remove-row="${row.id}"
                                aria-label="Remove equipment">
                                ×
                            </button>
                        </div>
                    `;
                })
                .join("");
    }

    /*
    =====================================================
     RENDER RESULT
    =====================================================
    */

    function renderResults() {
        const result = calculate();

        const values = {
            "etl-total-load":
                `${money(
                    result.totalLoad
                )} W`,

            "etl-daily-energy":
                `${money(
                    result.dailyEnergy
                )} kWh`,

            "etl-monthly-energy":
                `${money(
                    result.monthlyEnergy
                )} unit`,

            "etl-estimated-bill":
                `৳ ${money(
                    result.estimatedBill
                )}`,

            "etl-inverter-size":
                `${money(
                    result.recommendedInverter
                )} VA`,

            "etl-battery-size":
                `${money(
                    result.recommendedBatteryAh
                )} Ah`
        };

        Object.keys(values).forEach(id => {
            const element =
                document.getElementById(id);

            if (element) {
                element.textContent =
                    values[id];
            }
        });
    }

    /*
    =====================================================
     ROW ACTIONS
    =====================================================
    */

    function addEquipment() {
        state.rows.push({
            id: createId(),
            name: "LED Light",
            quantity: 1,
            watt: 12,
            hours: 6
        });

        renderRows();
        renderResults();
    }

    function removeEquipment(id) {
        if (state.rows.length <= 1) {
            alert(
                "কমপক্ষে একটি equipment রাখতে হবে।"
            );

            return;
        }

        state.rows =
            state.rows.filter(
                row => row.id !== id
            );

        renderRows();
        renderResults();
    }

    function updateRow(
        id,
        field,
        value
    ) {
        const row =
            state.rows.find(
                item => item.id === id
            );

        if (!row) {
            return;
        }

        if (field === "name") {
            row.name = value;

            const equipment =
                equipmentList.find(
                    item =>
                        item.name === value
                );

            if (equipment) {
                row.watt =
                    equipment.watt;
            }
        } else {
            row[field] = value;
        }

        renderRows();
        renderResults();
    }

    /*
    =====================================================
     REPORT
    =====================================================
    */

    function getReportText() {
        const result = calculate();

        let report = "";

        report +=
            "ElectroTechBD Electrical Load Report\n";

        report +=
            "====================================\n\n";

        report +=
            `Customer: ${
                state.customerName ||
                "Not provided"
            }\n`;

        report +=
            `Project: ${
                state.projectName ||
                "Not provided"
            }\n`;

        report +=
            `Phone: ${
                state.customerPhone ||
                "Not provided"
            }\n\n`;

        result.rows.forEach(
            (row, index) => {
                report +=
                    `${index + 1}. ${
                        row.name
                    }\n`;

                report +=
                    `Quantity: ${
                        row.quantity
                    }\n`;

                report +=
                    `Watt: ${
                        row.watt
                    } W\n`;

                report +=
                    `Hour/day: ${
                        row.hours
                    }\n`;

                report +=
                    `Total Load: ${
                        row.load
                    } W\n`;

                report +=
                    `Daily Energy: ${
                        row.energy.toFixed(2)
                    } kWh\n\n`;
            }
        );

        report +=
            "------------------------------------\n";

        report +=
            `Total Connected Load: ${
                result.totalLoad.toFixed(2)
            } W\n`;

        report +=
            `Daily Energy: ${
                result.dailyEnergy.toFixed(2)
            } kWh\n`;

        report +=
            `Monthly Energy: ${
                result.monthlyEnergy.toFixed(2)
            } unit\n`;

        report +=
            `Estimated Bill: ৳ ${
                result.estimatedBill.toFixed(2)
            }\n`;

        report +=
            `Suggested Inverter: ${
                result.recommendedInverter
            } VA\n`;

        report +=
            `Suggested Battery: ${
                result.recommendedBatteryAh
            } Ah @ ${
                state.batteryVoltage
            }V\n\n`;

        report +=
            "Safety Note:\n";

        report +=
            "This is a preliminary estimate. " +
            "Actual load, starting current, cable size, " +
            "MCB, earthing, inverter and battery rating " +
            "must be verified by a qualified electrician " +
            "or engineer.\n";

        return report;
    }

    function copyReport() {
        const report =
            getReportText();

        if (
            navigator.clipboard &&
            typeof navigator.clipboard.writeText ===
                "function"
        ) {
            navigator.clipboard
                .writeText(report)
                .then(() => {
                    alert(
                        "Report copied successfully."
                    );
                })
                .catch(() => {
                    fallbackCopy(report);
                });
        } else {
            fallbackCopy(report);
        }
    }

    function fallbackCopy(text) {
        const textarea =
            document.createElement(
                "textarea"
            );

        textarea.value = text;

        textarea.style.position =
            "fixed";

        textarea.style.left =
            "-9999px";

        document.body.appendChild(
            textarea
        );

        textarea.focus();
        textarea.select();

        try {
            document.execCommand(
                "copy"
            );

            alert(
                "Report copied successfully."
            );
        } catch (error) {
            alert(
                "Copy করা যায়নি। Manually copy করুন।"
            );
        }

        textarea.remove();
    }

    /*
    =====================================================
     PRINT REPORT
    =====================================================
    */

    function printReport() {
        const result =
            calculate();

        const reportRows =
            result.rows
                .map(row => {
                    return `
                        <tr>
                            <td>
                                ${escapeHTML(
                                    row.name
                                )}
                            </td>

                            <td>
                                ${row.quantity}
                            </td>

                            <td>
                                ${row.watt} W
                            </td>

                            <td>
                                ${row.hours}
                            </td>

                            <td>
                                ${row.load} W
                            </td>

                            <td>
                                ${row.energy.toFixed(
                                    2
                                )} kWh
                            </td>
                        </tr>
                    `;
                })
                .join("");

        const printWindow =
            window.open(
                "",
                "_blank",
                "width=1000,height=750"
            );

        if (!printWindow) {
            alert(
                "Popup blocked হয়েছে। Browser popup allow করুন।"
            );

            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="bn">
            <head>
                <meta charset="UTF-8">

                <title>
                    ElectroTechBD Load Report
                </title>

                <style>
                    body {
                        font-family: Arial, sans-serif;
                        color: #111;
                        padding: 25px;
                        line-height: 1.6;
                    }

                    h1 {
                        color: #008f7a;
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }

                    th,
                    td {
                        border: 1px solid #bbb;
                        padding: 8px;
                        text-align: left;
                    }

                    th {
                        background: #eeeeee;
                    }

                    .summary {
                        margin-top: 25px;
                        border: 1px solid #bbb;
                        padding: 20px;
                    }

                    .warning {
                        color: #9a4c00;
                        margin-top: 25px;
                    }
                </style>
            </head>

            <body>
                <h1>
                    ElectroTechBD Electrical Load Report
                </h1>

                <p>
                    <b>Customer:</b>
                    ${escapeHTML(
                        state.customerName ||
                        "Not provided"
                    )}
                </p>

                <p>
                    <b>Project:</b>
                    ${escapeHTML(
                        state.projectName ||
                        "Not provided"
                    )}
                </p>

                <p>
                    <b>Phone:</b>
                    ${escapeHTML(
                        state.customerPhone ||
                        "Not provided"
                    )}
                </p>

                <table>
                    <thead>
                        <tr>
                            <th>Equipment</th>
                            <th>Qty</th>
                            <th>Watt</th>
                            <th>Hour/day</th>
                            <th>Total Load</th>
                            <th>Daily Energy</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${reportRows}
                    </tbody>
                </table>

                <div class="summary">
                    <h2>Summary</h2>

                    <p>
                        <b>Total Load:</b>
                        ${money(
                            result.totalLoad
                        )} W
                    </p>

                    <p>
                        <b>Daily Energy:</b>
                        ${money(
                            result.dailyEnergy
                        )} kWh
                    </p>

                    <p>
                        <b>Monthly Energy:</b>
                        ${money(
                            result.monthlyEnergy
                        )} unit
                    </p>

                    <p>
                        <b>Estimated Bill:</b>
                        ৳ ${money(
                            result.estimatedBill
                        )}
                    </p>

                    <p>
                        <b>Suggested Inverter:</b>
                        ${money(
                            result.recommendedInverter
                        )} VA
                    </p>

                    <p>
                        <b>Suggested Battery:</b>
                        ${money(
                            result.recommendedBatteryAh
                        )} Ah @ ${
                            state.batteryVoltage
                        }V
                    </p>
                </div>

                <p class="warning">
                    ⚠️ এটি preliminary estimate।
                    বাস্তব installation-এর আগে qualified
                    electrician/engineer দিয়ে verify করুন।
                </p>

                <script>
                    window.onload = function () {
                        window.print();
                    };
                <\/script>
            </body>
            </html>
        `);

        printWindow.document.close();
    }

    /*
    =====================================================
     RESET
    =====================================================
    */

    function resetCalculator() {
        const confirmed =
            confirm(
                "সব calculation reset করতে চান?"
            );

        if (!confirmed) {
            return;
        }

        state.customerName = "";
        state.projectName = "";
        state.customerPhone = "";

        state.tariff = 12;
        state.powerFactor = 0.8;
        state.batteryVoltage = 12;
        state.backupHours = 4;

        state.rows = [
            {
                id: createId(),
                name: "Fan",
                quantity: 1,
                watt: 75,
                hours: 8
            }
        ];

        const fields = {
            "etl-customer-name": "",
            "etl-project-name": "",
            "etl-customer-phone": "",
            "etl-tariff": 12,
            "etl-power-factor": 0.8,
            "etl-battery-voltage": 12,
            "etl-backup-hours": 4
        };

        Object.keys(fields).forEach(id => {
            const element =
                document.getElementById(id);

            if (element) {
                element.value =
                    fields[id];
            }
        });

        renderRows();
        renderResults();
    }

    /*
    =====================================================
     CSS
    =====================================================
    */

    function injectStyles() {
        if (
            document.getElementById(
                STYLE_ID
            )
        ) {
            return;
        }

        const style =
            document.createElement(
                "style"
            );

        style.id = STYLE_ID;

        style.textContent = `
            body.etl-calculator-open {
                overflow: hidden;
            }

            #${APP_ID} {
                position: fixed;

                top: 50%;
                left: 50%;

                transform:
                    translate(-50%, -50%);

                width: min(
                    960px,
                    calc(100vw - 24px)
                );

                max-height:
                    calc(100vh - 30px);

                display: none;
                overflow-y: auto;

                z-index: 999999;

                box-sizing: border-box;

                padding: 22px;

                color: #eaffff;

                background:
                    linear-gradient(
                        145deg,
                        #0b1420,
                        #101e2d
                    );

                border: 1px solid #00f5d4;

                border-radius: 18px;

                box-shadow:
                    0 0 0 9999px
                    rgba(0, 0, 0, 0.70),

                    0 0 45px
                    rgba(0, 245, 212, 0.28);

                font-family:
                    Arial,
                    "Noto Sans Bengali",
                    sans-serif;
            }

            #${APP_ID}.etl-visible {
                display: block !important;
            }

            .etl-header {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;

                gap: 15px;
                margin-bottom: 20px;
            }

            .etl-title {
                margin: 0;

                color: #00f5d4;

                font-size:
                    clamp(19px, 3vw, 28px);

                line-height: 1.35;
            }

            .etl-subtitle {
                margin: 7px 0 0;

                color: #a9c1cc;

                font-size: 13px;
                line-height: 1.6;
            }

            .etl-close-button {
                flex: 0 0 auto;

                width: 42px;
                height: 42px;

                border: 1px solid #ff477e;
                border-radius: 10px;

                color: #ff477e;
                background: transparent;

                font-size: 28px;
                line-height: 1;

                cursor: pointer;
            }

            .etl-close-button:hover {
                color: #ffffff;
                background: #ff477e;
            }

            .etl-section-title {
                color: #00f5d4;

                font-size: 17px;

                margin: 20px 0 12px;
            }

            .etl-customer-grid {
                display: grid;

                grid-template-columns:
                    repeat(
                        3,
                        minmax(0, 1fr)
                    );

                gap: 12px;
            }

            .etl-input-group {
                min-width: 0;
            }

            .etl-input-group label {
                display: block;

                margin-bottom: 6px;

                color: #a9c1cc;

                font-size: 12px;
                font-weight: 600;
            }

            .etl-input-group input,
            .etl-input-group select {
                width: 100%;
                min-width: 0;

                box-sizing: border-box;

                padding: 11px 10px;

                color: #ffffff;
                background: #142535;

                border: 1px solid #365263;
                border-radius: 9px;

                outline: none;

                font-size: 14px;
            }

            .etl-input-group input:focus,
            .etl-input-group select:focus {
                border-color: #00f5d4;

                box-shadow:
                    0 0 0 2px
                    rgba(0, 245, 212, 0.12);
            }

            /* Equipment picker: styled custom dropdown so the option list
               never falls back to the browser's unstyled inline buttons. */
            .etl-custom-select {
                position: relative;
                width: 100%;
                min-width: 0;
            }

            .etl-custom-select-trigger {
                width: 100%;
                min-width: 0;
                min-height: 40px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 10px;
                padding: 10px 11px;
                box-sizing: border-box;
                border: 1px solid #365263;
                border-radius: 9px;
                color: #ffffff;
                background: #142535;
                font: inherit;
                font-size: 14px;
                text-align: left;
                cursor: pointer;
                appearance: none;
                -webkit-appearance: none;
                touch-action: manipulation;
            }

            .etl-custom-select-trigger:hover,
            .etl-custom-select.open .etl-custom-select-trigger {
                border-color: #00f5d4;
                box-shadow: 0 0 0 2px rgba(0, 245, 212, 0.10);
            }

            .etl-custom-select-trigger > span:first-child {
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .etl-select-chevron {
                flex: 0 0 auto;
                color: #00f5d4;
                font-size: 15px;
                line-height: 1;
            }

            .etl-custom-select-menu {
                position: absolute;
                left: 0;
                right: 0;
                top: calc(100% + 5px);
                z-index: 1000001;
                display: none;
                max-height: min(240px, 42vh);
                overflow-y: auto;
                overflow-x: hidden;
                padding: 5px;
                box-sizing: border-box;
                border: 1px solid #00f5d4;
                border-radius: 10px;
                background: #142535;
                box-shadow: 0 12px 28px rgba(0, 0, 0, 0.45),
                            0 0 18px rgba(0, 245, 212, 0.12);
                scrollbar-width: thin;
                -webkit-overflow-scrolling: touch;
            }

            .etl-custom-select.open .etl-custom-select-menu {
                display: block;
            }

            .etl-custom-select.open-up .etl-custom-select-menu {
                top: auto;
                bottom: calc(100% + 5px);
            }

            .etl-custom-option {
                width: 100%;
                min-height: 38px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 10px;
                padding: 9px 10px;
                margin: 0;
                box-sizing: border-box;
                border: 1px solid transparent;
                border-radius: 7px;
                color: #eaffff;
                background: transparent;
                font: inherit;
                font-size: 13px;
                line-height: 1.25;
                text-align: left;
                cursor: pointer;
                white-space: normal;
                overflow-wrap: anywhere;
                appearance: none;
                -webkit-appearance: none;
                touch-action: manipulation;
            }

            .etl-custom-option span {
                min-width: 0;
            }

            .etl-custom-option small {
                flex: 0 0 auto;
                color: #8feee0;
                font-size: 11px;
            }

            .etl-custom-option:hover,
            .etl-custom-option:focus-visible,
            .etl-custom-option.is-selected {
                color: #001b19;
                background: #00e5c3;
                border-color: #00f5d4;
                outline: none;
            }

            .etl-custom-option:hover small,
            .etl-custom-option:focus-visible small,
            .etl-custom-option.is-selected small {
                color: #003d37;
            }

            @media (max-width: 480px) {
                .etl-custom-select-menu {
                    max-height: min(220px, 38vh);
                }

                .etl-custom-option {
                    min-height: 40px;
                    padding: 10px;
                    font-size: 13px;
                }
            }

            .etl-equipment-row {
                display: grid;

                grid-template-columns:
                    minmax(150px, 2fr)
                    minmax(65px, 0.8fr)
                    minmax(75px, 1fr)
                    minmax(90px, 1fr)
                    40px;

                align-items: end;

                gap: 10px;

                padding: 13px;
                margin-bottom: 10px;

                background:
                    rgba(255, 255, 255, 0.035);

                border:
                    1px solid
                    rgba(0, 245, 212, 0.23);

                border-radius: 12px;
            }

            .etl-delete-button {
                width: 40px;
                height: 40px;

                border: 1px solid #ff477e;
                border-radius: 9px;

                color: #ff477e;
                background: transparent;

                font-size: 25px;

                cursor: pointer;
            }

            .etl-delete-button:hover {
                color: #ffffff;
                background: #ff477e;
            }

            .etl-settings-grid {
                display: grid;

                grid-template-columns:
                    repeat(
                        4,
                        minmax(0, 1fr)
                    );

                gap: 12px;
            }

            .etl-button-area {
                display: flex;

                flex-wrap: wrap;

                gap: 10px;

                margin: 18px 0;
            }

            .etl-action-button {
                min-height: 42px;

                padding: 11px 16px;

                border: 1px solid #00f5d4;
                border-radius: 10px;

                color: #001b19;
                background: #00e5c3;

                font-size: 14px;
                font-weight: 700;

                cursor: pointer;
            }

            .etl-action-button.secondary {
                color: #00f5d4;
                background: transparent;
            }

            .etl-action-button:hover {
                filter: brightness(1.1);
            }

            .etl-summary-grid {
                display: grid;

                grid-template-columns:
                    repeat(
                        3,
                        minmax(0, 1fr)
                    );

                gap: 12px;
            }

            .etl-summary-card {
                min-width: 0;

                padding: 16px;

                background:
                    rgba(0, 245, 212, 0.055);

                border:
                    1px solid
                    rgba(0, 245, 212, 0.28);

                border-radius: 12px;
            }

            .etl-summary-card span {
                display: block;

                color: #a9c1cc;

                font-size: 12px;
                line-height: 1.5;

                margin-bottom: 8px;
            }

            .etl-summary-card strong {
                display: block;

                color: #00f5d4;

                font-size:
                    clamp(17px, 2.5vw, 23px);

                overflow-wrap: anywhere;
            }

            .etl-safety-note {
                color: #ffcc80;

                font-size: 12px;
                line-height: 1.7;

                margin: 20px 0 0;
            }

            @media (max-width: 760px) {
                #${APP_ID} {
                    width:
                        calc(100vw - 20px);

                    max-height:
                        calc(100vh - 20px);

                    padding: 16px;
                }

                .etl-customer-grid {
                    grid-template-columns:
                        repeat(
                            2,
                            minmax(0, 1fr)
                        );
                }

                .etl-settings-grid {
                    grid-template-columns:
                        repeat(
                            2,
                            minmax(0, 1fr)
                        );
                }

                .etl-summary-grid {
                    grid-template-columns:
                        repeat(
                            2,
                            minmax(0, 1fr)
                        );
                }

                .etl-equipment-row {
                    grid-template-columns:
                        repeat(
                            2,
                            minmax(0, 1fr)
                        );
                }

                .etl-equipment-name {
                    grid-column: 1 / -1;
                }

                .etl-delete-button {
                    width: 100%;
                }
            }

            @media (max-width: 480px) {
                #${APP_ID} {
                    width:
                        calc(100vw - 12px);

                    max-height:
                        calc(100vh - 12px);

                    padding: 12px;

                    border-radius: 14px;
                }

                .etl-header {
                    gap: 8px;
                }

                .etl-title {
                    font-size: 19px;
                }

                .etl-subtitle {
                    font-size: 11px;
                }

                .etl-close-button {
                    width: 35px;
                    height: 35px;

                    font-size: 24px;
                }

                .etl-customer-grid,
                .etl-settings-grid,
                .etl-summary-grid {
                    grid-template-columns: 1fr;
                }

                .etl-equipment-row {
                    grid-template-columns:
                        repeat(
                            2,
                            minmax(0, 1fr)
                        );

                    padding: 10px;
                    gap: 8px;
                }

                .etl-equipment-name {
                    grid-column: 1 / -1;
                }

                .etl-button-area {
                    display: grid;

                    grid-template-columns: 1fr;
                }

                .etl-action-button {
                    width: 100%;
                }
            }

            @media (prefers-reduced-motion: reduce) {
                * {
                    transition: none !important;
                }
            }
        `;

        document.head.appendChild(
            style
        );
    }

    /*
    =====================================================
     CREATE CALCULATOR APP
    =====================================================
    */

    function createApp() {
        if (getApp()) {
            return;
        }

        injectStyles();

        const app =
            document.createElement(
                "section"
            );

        app.id = APP_ID;

        app.setAttribute(
            "aria-hidden",
            "true"
        );

        app.setAttribute(
            "aria-label",
            "Electrical Load Calculator"
        );

        app.innerHTML = `
            <div class="etl-header">
                <div>
                    <h2 class="etl-title">
                        ⚡ Electrical Load Calculator
                    </h2>

                    <p class="etl-subtitle">
                        Load, energy bill, inverter ও battery estimate
                    </p>
                </div>

                <button
                    type="button"
                    id="etl-close-button"
                    class="etl-close-button"
                    aria-label="Close calculator">
                    ×
                </button>
            </div>

            <h3 class="etl-section-title">
                👤 Customer Information
            </h3>

            <div class="etl-customer-grid">
                <div class="etl-input-group">
                    <label for="etl-customer-name">
                        Customer Name
                    </label>

                    <input
                        id="etl-customer-name"
                        type="text"
                        placeholder="Customer name">
                </div>

                <div class="etl-input-group">
                    <label for="etl-project-name">
                        Project Name
                    </label>

                    <input
                        id="etl-project-name"
                        type="text"
                        placeholder="Project name">
                </div>

                <div class="etl-input-group">
                    <label for="etl-customer-phone">
                        Mobile Number
                    </label>

                    <input
                        id="etl-customer-phone"
                        type="tel"
                        placeholder="01XXXXXXXXX">
                </div>
            </div>

            <h3 class="etl-section-title">
                🔌 Equipment Load
            </h3>

            <div id="etl-load-rows"></div>

            <div class="etl-button-area">
                <button
                    type="button"
                    id="etl-add-equipment"
                    class="etl-action-button">
                    + Add Equipment
                </button>

                <button
                    type="button"
                    id="etl-copy-report"
                    class="etl-action-button secondary">
                    📋 Copy Report
                </button>

                <button
                    type="button"
                    id="etl-print-report"
                    class="etl-action-button secondary">
                    🖨 Print Report
                </button>

                <button
                    type="button"
                    id="etl-reset-calculator"
                    class="etl-action-button secondary">
                    ↻ Reset
                </button>
            </div>

            <h3 class="etl-section-title">
                ⚙️ Calculation Settings
            </h3>

            <div class="etl-settings-grid">
                <div class="etl-input-group">
                    <label for="etl-tariff">
                        Tariff ৳/unit
                    </label>

                    <input
                        id="etl-tariff"
                        type="number"
                        min="0"
                        step="0.1"
                        value="${state.tariff}">
                </div>

                <div class="etl-input-group">
                    <label for="etl-power-factor">
                        Power Factor
                    </label>

                    <input
                        id="etl-power-factor"
                        type="number"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value="${state.powerFactor}">
                </div>

                <div class="etl-input-group">
                    <label for="etl-battery-voltage">
                        Battery Voltage
                    </label>

                    <select id="etl-battery-voltage">
                        <option value="12">
                            12V
                        </option>

                        <option value="24">
                            24V
                        </option>

                        <option value="48">
                            48V
                        </option>
                    </select>
                </div>

                <div class="etl-input-group">
                    <label for="etl-backup-hours">
                        Backup Hours
                    </label>

                    <input
                        id="etl-backup-hours"
                        type="number"
                        min="0"
                        step="0.5"
                        value="${state.backupHours}">
                </div>
            </div>

            <h3 class="etl-section-title">
                📊 Calculation Result
            </h3>

            <div class="etl-summary-grid">
                <div class="etl-summary-card">
                    <span>
                        Total Connected Load
                    </span>

                    <strong id="etl-total-load">
                        0 W
                    </strong>
                </div>

                <div class="etl-summary-card">
                    <span>
                        Daily Energy
                    </span>

                    <strong id="etl-daily-energy">
                        0 kWh
                    </strong>
                </div>

                <div class="etl-summary-card">
                    <span>
                        Monthly Energy
                    </span>

                    <strong id="etl-monthly-energy">
                        0 unit
                    </strong>
                </div>

                <div class="etl-summary-card">
                    <span>
                        Estimated Monthly Bill
                    </span>

                    <strong id="etl-estimated-bill">
                        ৳ 0
                    </strong>
                </div>

                <div class="etl-summary-card">
                    <span>
                        Suggested Inverter
                    </span>

                    <strong id="etl-inverter-size">
                        0 VA
                    </strong>
                </div>

                <div class="etl-summary-card">
                    <span>
                        Suggested Battery
                    </span>

                    <strong id="etl-battery-size">
                        0 Ah
                    </strong>
                </div>
            </div>

            <p class="etl-safety-note">
                ⚠️ এটি preliminary estimate।
                বাস্তব installation-এর আগে starting current,
                cable size, voltage drop, MCB, earthing,
                inverter ও battery specification qualified
                electrician/engineer দিয়ে verify করুন।
            </p>
        `;

        document.body.appendChild(
            app
        );

        bindEvents();

        renderRows();
        renderResults();

        const batteryVoltage =
            document.getElementById(
                "etl-battery-voltage"
            );

        if (batteryVoltage) {
            batteryVoltage.value =
                String(
                    state.batteryVoltage
                );
        }
    }

    /*
    =====================================================
     EVENTS
    =====================================================
    */

    function bindEvents() {
        const app = getApp();

        if (!app) {
            return;
        }

        const closeButton =
            document.getElementById(
                "etl-close-button"
            );

        const addButton =
            document.getElementById(
                "etl-add-equipment"
            );

        const copyButton =
            document.getElementById(
                "etl-copy-report"
            );

        const printButton =
            document.getElementById(
                "etl-print-report"
            );

        const resetButton =
            document.getElementById(
                "etl-reset-calculator"
            );

        if (closeButton) {
            closeButton.addEventListener(
                "click",
                function (event) {
                    event.preventDefault();
                    event.stopPropagation();

                    closeCalculator();
                }
            );
        }

        if (addButton) {
            addButton.addEventListener(
                "click",
                function (event) {
                    event.preventDefault();

                    addEquipment();
                }
            );
        }

        if (copyButton) {
            copyButton.addEventListener(
                "click",
                function (event) {
                    event.preventDefault();

                    copyReport();
                }
            );
        }

        if (printButton) {
            printButton.addEventListener(
                "click",
                function (event) {
                    event.preventDefault();

                    printReport();
                }
            );
        }

        if (resetButton) {
            resetButton.addEventListener(
                "click",
                function (event) {
                    event.preventDefault();

                    resetCalculator();
                }
            );
        }

        /* Custom equipment dropdown: keeps options inside the calculator on mobile. */
        app.addEventListener(
            "click",
            function (event) {
                const trigger = event.target.closest(
                    "[data-custom-select-trigger]"
                );

                if (trigger) {
                    event.preventDefault();
                    event.stopPropagation();

                    const wrapper = trigger.closest(
                        "[data-custom-select]"
                    );

                    if (!wrapper) return;

                    const wasOpen =
                        wrapper.classList.contains("open");

                    app.querySelectorAll(
                        ".etl-custom-select.open"
                    ).forEach(select => {
                        select.classList.remove("open", "open-up");
                        const btn = select.querySelector(
                            "[data-custom-select-trigger]"
                        );
                        if (btn) {
                            btn.setAttribute(
                                "aria-expanded",
                                "false"
                            );
                        }
                    });

                    if (wasOpen) return;

                    const rect = trigger.getBoundingClientRect();
                    const estimatedMenuHeight = 235;
                    const spaceBelow =
                        window.innerHeight - rect.bottom;
                    const spaceAbove = rect.top;

                    if (
                        spaceBelow < estimatedMenuHeight &&
                        spaceAbove > spaceBelow
                    ) {
                        wrapper.classList.add("open-up");
                    }

                    wrapper.classList.add("open");
                    trigger.setAttribute(
                        "aria-expanded",
                        "true"
                    );
                    return;
                }

                const option = event.target.closest(
                    "[data-custom-option]"
                );

                if (option) {
                    event.preventDefault();
                    event.stopPropagation();

                    const id = option.dataset.id;
                    const value = option.dataset.value;

                    if (id && value) {
                        updateRow(id, "name", value);
                    }

                    return;
                }

                if (
                    !event.target.closest(
                        "[data-custom-select]"
                    )
                ) {
                    app.querySelectorAll(
                        ".etl-custom-select.open"
                    ).forEach(select => {
                        select.classList.remove(
                            "open",
                            "open-up"
                        );

                        const btn = select.querySelector(
                            "[data-custom-select-trigger]"
                        );

                        if (btn) {
                            btn.setAttribute(
                                "aria-expanded",
                                "false"
                            );
                        }
                    });
                }
            }
        );

        app.addEventListener(
            "keydown",
            function (event) {
                if (event.key === "Escape") {
                    app.querySelectorAll(
                        ".etl-custom-select.open"
                    ).forEach(select => {
                        select.classList.remove(
                            "open",
                            "open-up"
                        );

                        const btn = select.querySelector(
                            "[data-custom-select-trigger]"
                        );

                        if (btn) {
                            btn.setAttribute(
                                "aria-expanded",
                                "false"
                            );
                        }
                    });
                }
            }
        );

        app.addEventListener(
            "change",
            function (event) {
                const target =
                    event.target;

                const action =
                    target.dataset.action;

                const id =
                    target.dataset.id;

                if (action && id) {
                    updateRow(
                        id,
                        action,
                        target.value
                    );

                    return;
                }

                if (
                    target.id ===
                    "etl-customer-name"
                ) {
                    state.customerName =
                        target.value;
                }

                if (
                    target.id ===
                    "etl-project-name"
                ) {
                    state.projectName =
                        target.value;
                }

                if (
                    target.id ===
                    "etl-customer-phone"
                ) {
                    state.customerPhone =
                        target.value;
                }

                if (
                    target.id ===
                    "etl-tariff"
                ) {
                    state.tariff =
                        Math.max(
                            0,
                            number(
                                target.value
                            )
                        );

                    renderResults();
                }

                if (
                    target.id ===
                    "etl-power-factor"
                ) {
                    state.powerFactor =
                        Math.min(
                            1,
                            Math.max(
                                0.1,
                                number(
                                    target.value
                                )
                            )
                        );

                    renderResults();
                }

                if (
                    target.id ===
                    "etl-battery-voltage"
                ) {
                    state.batteryVoltage =
                        number(
                            target.value
                        );

                    renderResults();
                }

                if (
                    target.id ===
                    "etl-backup-hours"
                ) {
                    state.backupHours =
                        Math.max(
                            0,
                            number(
                                target.value
                            )
                        );

                    renderResults();
                }
            }
        );

        app.addEventListener(
            "click",
            function (event) {
                const removeButton =
                    event.target.closest(
                        "[data-remove-row]"
                    );

                if (!removeButton) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();

                removeEquipment(
                    removeButton.dataset
                        .removeRow
                );
            }
        );

        /*
        Navbar button support
        */

        document.addEventListener(
            "click",
            function (event) {
                const navbarButton =
                    event.target.closest(
                        `#${NAVBAR_BUTTON_ID}`
                    );

                if (!navbarButton) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();

                openCalculator();
            }
        );

        /*
        ESC closes calculator
        */

        document.addEventListener(
            "keydown",
            function (event) {
                if (
                    event.key === "Escape" ||
                    event.key === "Esc"
                ) {
                    closeCalculator();
                }
            }
        );
    }

    /*
    =====================================================
     PUBLIC API
    =====================================================
    */

    window.ElectroTechLoadForm = {
        open: openCalculator,
        close: closeCalculator,
        toggle: toggleCalculator,
        calculate: calculate,
        getReport: getReportText,
        reset: resetCalculator,

        getData: function () {
            return {
                ...calculate(),

                customerName:
                    state.customerName,

                projectName:
                    state.projectName,

                customerPhone:
                    state.customerPhone,

                settings: {
                    tariff:
                        state.tariff,

                    powerFactor:
                        state.powerFactor,

                    batteryVoltage:
                        state.batteryVoltage,

                    backupHours:
                        state.backupHours
                }
            };
        }
    };

    /*
    =====================================================
     INITIALIZE
    =====================================================
    */

    function initialize() {
        createApp();

        console.log(
            "⚡ ElectroTechBD Load Calculator Loaded Successfully."
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