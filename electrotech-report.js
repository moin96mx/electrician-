

(function () {
    "use strict";

    if (window.ElectroTechReportLoaded) {
        console.warn(
            "ElectroTech Report already loaded."
        );
        return;
    }

    window.ElectroTechReportLoaded = true;

    const MODAL_ID =
        "electrotech-professional-report";

    const STYLE_ID =
        "electrotech-professional-report-style";

    let lastReportData = null;

    function number(value) {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return 0;
        }

        const cleaned =
            String(value)
                .replace(/,/g, "")
                .replace(/[^\d.-]/g, "");

        const result =
            parseFloat(cleaned);

        return Number.isFinite(result)
            ? result
            : 0;
    }

    function money(value) {
        return number(value).toLocaleString(
            "en-BD",
            {
                maximumFractionDigits: 2
            }
        );
    }

    function fixed(value, digits = 2) {
        return number(value).toFixed(digits);
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function today() {
        return new Date().toLocaleDateString(
            "en-GB"
        );
    }

    function getText(element) {
        return element
            ? element.textContent.trim()
            : "";
    }

    function getValue(selectors) {
        for (const selector of selectors) {
            const element =
                document.querySelector(
                    selector
                );

            if (element) {
                return (
                    element.value ||
                    element.textContent ||
                    ""
                ).trim();
            }
        }

        return "";
    }

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
            #${MODAL_ID} {
                position: fixed;
                inset: 0;

                z-index: 999999;

                display: none;

                align-items: center;
                justify-content: center;

                padding: 12px;

                background:
                    rgba(0, 0, 0, 0.82);

                box-sizing: border-box;
            }

            #${MODAL_ID}.show {
                display: flex;
            }

            .etr-report-panel {
                width: min(1100px, 100%);

                max-height:
                    calc(100vh - 24px);

                overflow-y: auto;

                padding: 25px;

                color: #eafcff;

                background:
                    linear-gradient(
                        145deg,
                        #101a27,
                        #172635
                    );

                border: 1px solid #00f5d4;

                border-radius: 18px;

                box-shadow:
                    0 0 40px
                    rgba(0, 245, 212, 0.22);

                box-sizing: border-box;
            }

            .etr-report-header {
                display: flex;

                align-items: flex-start;
                justify-content: space-between;

                gap: 15px;

                margin-bottom: 22px;

                padding-bottom: 16px;

                border-bottom: 1px solid
                    rgba(0, 245, 212, 0.3);
            }

            .etr-report-brand {
                color: #00f5d4;

                font-size:
                    clamp(21px, 3vw, 32px);

                font-weight: 800;

                line-height: 1.35;
            }

            .etr-report-subtitle {
                margin-top: 7px;

                color: #a9c1cc;

                font-size: 13px;

                line-height: 1.6;
            }

            .etr-report-close {
                width: 42px;
                height: 42px;

                flex-shrink: 0;

                color: #ff477e;

                background: transparent;

                border: 1px solid #ff477e;

                border-radius: 9px;

                font-size: 28px;

                cursor: pointer;
            }

            .etr-report-close:hover {
                color: #ffffff;

                background: #ff477e;
            }

            .etr-report-info {
                display: grid;

                grid-template-columns:
                    repeat(
                        3,
                        minmax(0, 1fr)
                    );

                gap: 12px;

                margin-bottom: 22px;
            }

            .etr-info-card {
                padding: 13px;

                background:
                    rgba(0, 245, 212, 0.05);

                border: 1px solid
                    rgba(0, 245, 212, 0.22);

                border-radius: 10px;

                overflow-wrap: anywhere;
            }

            .etr-info-card span {
                display: block;

                margin-bottom: 5px;

                color: #91aab8;

                font-size: 12px;
            }

            .etr-info-card strong {
                display: block;

                color: #ffffff;

                font-size: 14px;
            }

            .etr-report-heading {
                margin: 22px 0 12px;

                color: #00f5d4;

                font-size: 19px;
            }

            .etr-table-container {
                width: 100%;

                overflow-x: auto;

                border: 1px solid
                    rgba(0, 245, 212, 0.25);

                border-radius: 10px;
            }

            .etr-report-table {
                width: 100%;

                min-width: 700px;

                border-collapse: collapse;

                font-size: 13px;
            }

            .etr-report-table th,
            .etr-report-table td {
                padding: 11px;

                text-align: left;

                border-bottom: 1px solid
                    rgba(255, 255, 255, 0.1);
            }

            .etr-report-table th {
                color: #001b19;

                background: #00e5c3;

                font-weight: 800;
            }

            .etr-report-table td {
                color: #dceff3;
            }

            .etr-report-table tr:last-child td {
                border-bottom: none;
            }

            .etr-summary {
                display: grid;

                grid-template-columns:
                    repeat(
                        3,
                        minmax(0, 1fr)
                    );

                gap: 12px;
            }

            .etr-summary-card {
                padding: 16px;

                background:
                    rgba(0, 245, 212, 0.06);

                border: 1px solid
                    rgba(0, 245, 212, 0.28);

                border-radius: 12px;
            }

            .etr-summary-card span {
                display: block;

                margin-bottom: 8px;

                color: #a5bbc6;

                font-size: 12px;

                line-height: 1.5;
            }

            .etr-summary-card strong {
                display: block;

                color: #00f5d4;

                font-size:
                    clamp(18px, 2.5vw, 26px);

                overflow-wrap: anywhere;
            }

            .etr-report-warning {
                margin-top: 20px;

                padding: 13px 15px;

                color: #ffd18a;

                background:
                    rgba(255, 174, 0, 0.08);

                border: 1px solid
                    rgba(255, 174, 0, 0.3);

                border-radius: 10px;

                font-size: 12px;

                line-height: 1.8;
            }

            .etr-report-footer {
                display: flex;

                flex-wrap: wrap;

                justify-content: space-between;

                gap: 12px;

                margin-top: 22px;

                padding-top: 15px;

                color: #8fa9b6;

                border-top: 1px solid
                    rgba(0, 245, 212, 0.2);

                font-size: 12px;
            }

            .etr-report-actions {
                display: flex;

                flex-wrap: wrap;

                gap: 10px;

                margin-top: 22px;
            }

            .etr-report-button {
                min-height: 43px;

                padding: 11px 17px;

                color: #001b19;

                background: #00e5c3;

                border: 1px solid #00f5d4;

                border-radius: 9px;

                font-size: 14px;

                font-weight: 800;

                cursor: pointer;
            }

            .etr-report-button.secondary {
                color: #00f5d4;

                background: transparent;
            }

            .etr-report-button:hover {
                filter: brightness(1.12);
            }

            .etr-external-button {
                display: block;

                width: 100%;

                margin-top: 12px;

                padding: 12px;

                color: #001b19;

                background: #00e5c3;

                border: 1px solid #00f5d4;

                border-radius: 10px;

                font-weight: 800;

                cursor: pointer;
            }

            @media (max-width: 760px) {
                .etr-report-panel {
                    padding: 17px;

                    border-radius: 14px;
                }

                .etr-report-info {
                    grid-template-columns:
                        repeat(
                            2,
                            minmax(0, 1fr)
                        );
                }

                .etr-summary {
                    grid-template-columns:
                        repeat(
                            2,
                            minmax(0, 1fr)
                        );
                }
            }

            @media (max-width: 480px) {
                #${MODAL_ID} {
                    padding: 6px;
                }

                .etr-report-panel {
                    max-height:
                        calc(100vh - 12px);

                    padding: 12px;
                }

                .etr-report-info,
                .etr-summary {
                    grid-template-columns: 1fr;
                }

                .etr-report-header {
                    gap: 8px;
                }

                .etr-report-brand {
                    font-size: 21px;
                }

                .etr-report-close {
                    width: 35px;
                    height: 35px;

                    font-size: 24px;
                }

                .etr-report-actions {
                    display: grid;

                    grid-template-columns: 1fr;
                }

                .etr-report-button {
                    width: 100%;
                }

                .etr-report-footer {
                    display: block;
                }
            }

            @media print {
                body * {
                    visibility: hidden !important;
                }

                #${MODAL_ID},
                #${MODAL_ID} * {
                    visibility: visible !important;
                }

                #${MODAL_ID} {
                    position: absolute;

                    inset: 0;

                    display: block !important;

                    padding: 0;

                    background: #ffffff;
                }

                .etr-report-panel {
                    width: 100%;

                    max-height: none;

                    overflow: visible;

                    padding: 0;

                    color: #111111;

                    background: #ffffff;

                    border: none;

                    border-radius: 0;

                    box-shadow: none;
                }

                .etr-report-close,
                .etr-report-actions {
                    display: none !important;
                }

                .etr-report-brand,
                .etr-report-heading,
                .etr-summary-card strong {
                    color: #008f7a;
                }

                .etr-report-subtitle,
                .etr-info-card span,
                .etr-summary-card span,
                .etr-report-footer,
                .etr-report-warning {
                    color: #333333;
                }

                .etr-info-card,
                .etr-summary-card {
                    background: #ffffff;

                    border: 1px solid #cccccc;
                }

                .etr-report-table th {
                    color: #111111;

                    background: #eeeeee;
                }

                .etr-report-table td {
                    color: #111111;
                }

                .etr-report-warning {
                    border: 1px solid #bbbbbb;
                }
            }
        `;

        document.head.appendChild(
            style
        );
    }

    function getDataFromGlobalAPI() {
        if (
            window.ElectroTechLoadForm &&
            typeof window.ElectroTechLoadForm.getData ===
                "function"
        ) {
            try {
                const data =
                    window.ElectroTechLoadForm.getData();

                if (data) {
                    return normalizeData(
                        data
                    );
                }
            } catch (error) {
                console.warn(
                    "Load form data error:",
                    error
                );
            }
        }

        return null;
    }

    function getDataFromDOM() {
        const rows = [];

        const possibleRows =
            document.querySelectorAll(
                [
                    ".etl-equipment-row",
                    ".etl-load-row",
                    ".equipment-row",
                    "[data-equipment-row]",
                    ".load-equipment-row"
                ].join(",")
            );

        possibleRows.forEach(row => {
            const name =
                getText(
                    row.querySelector(
                        "select, .equipment-name, [data-name]"
                    )
                ) ||
                row.getAttribute(
                    "data-equipment"
                ) ||
                "Equipment";

            const inputs =
                row.querySelectorAll(
                    "input"
                );

            const quantity =
                number(
                    row.querySelector(
                        ".quantity, [name*='quantity'], [name*='qty']"
                    )?.value ||
                    inputs[0]?.value ||
                    1
                );

            const watt =
                number(
                    row.querySelector(
                        ".watt, [name*='watt'], [name*='power']"
                    )?.value ||
                    inputs[1]?.value ||
                    0
                );

            const hours =
                number(
                    row.querySelector(
                        ".hours, [name*='hour']"
                    )?.value ||
                    inputs[2]?.value ||
                    0
                );

            const load =
                quantity * watt;

            const energy =
                load * hours / 1000;

            rows.push({
                name,
                quantity,
                watt,
                hours,
                load,
                energy
            });
        });

        if (!rows.length) {
            return null;
        }

        const totalLoad =
            rows.reduce(
                (total, row) =>
                    total + row.load,
                0
            );

        const dailyEnergy =
            rows.reduce(
                (total, row) =>
                    total + row.energy,
                0
            );

        const monthlyEnergy =
            dailyEnergy * 30;

        const tariff =
            number(
                getValue([
                    "#etl-tariff",
                    "#tariff",
                    "[name='tariff']",
                    "[name='tariffPerUnit']"
                ])
            ) || 12;

        const estimatedBill =
            monthlyEnergy * tariff;

        const recommendedInverter =
            Math.ceil(
                totalLoad /
                0.8 /
                100
            ) * 100;

        const batteryVoltage =
            number(
                getValue([
                    "#etl-battery-voltage",
                    "#batteryVoltage",
                    "[name='batteryVoltage']"
                ])
            ) || 12;

        const backupHours =
            number(
                getValue([
                    "#etl-backup-hours",
                    "#backupHours",
                    "[name='backupHours']"
                ])
            ) || 4;

        const recommendedBatteryAh =
            Math.ceil(
                totalLoad *
                backupHours /
                batteryVoltage /
                0.8
            );

        return normalizeData({
            rows,
            totalLoad,
            dailyEnergy,
            monthlyEnergy,
            estimatedBill,
            recommendedInverter,
            recommendedBatteryAh,
            customerName:
                getValue([
                    "#etl-customer-name",
                    "#customerName",
                    "[name='customerName']"
                ]),
            projectName:
                getValue([
                    "#etl-project-name",
                    "#projectName",
                    "[name='projectName']"
                ]),
            customerPhone:
                getValue([
                    "#etl-customer-phone",
                    "#customerPhone",
                    "[name='customerPhone']"
                ])
        });
    }

    function normalizeData(data) {
        const rows =
            Array.isArray(data.rows)
                ? data.rows.map(row => {
                    const quantity =
                        number(
                            row.quantity
                        ) || 1;

                    const watt =
                        number(
                            row.watt
                        );

                    const hours =
                        number(
                            row.hours
                        );

                    const load =
                        number(
                            row.load
                        ) ||
                        quantity * watt;

                    const energy =
                        number(
                            row.energy
                        ) ||
                        load * hours / 1000;

                    return {
                        name:
                            row.name ||
                            row.equipment ||
                            "Equipment",

                        quantity,

                        watt,

                        hours,

                        load,

                        energy
                    };
                })
                : [];

        const totalLoad =
            number(data.totalLoad) ||
            rows.reduce(
                (total, row) =>
                    total + row.load,
                0
            );

        const dailyEnergy =
            number(data.dailyEnergy) ||
            rows.reduce(
                (total, row) =>
                    total + row.energy,
                0
            );

        const monthlyEnergy =
            number(data.monthlyEnergy) ||
            dailyEnergy * 30;

        const tariff =
            number(data.tariff) || 12;

        const estimatedBill =
            number(data.estimatedBill) ||
            monthlyEnergy * tariff;

        const recommendedInverter =
            number(
                data.recommendedInverter
            ) ||
            Math.ceil(
                totalLoad / 0.8 / 100
            ) * 100;

        const recommendedBatteryAh =
            number(
                data.recommendedBatteryAh
            ) ||
            Math.ceil(
                totalLoad * 4 / 12 / 0.8
            );

        return {
            customerName:
                data.customerName ||
                data.customer ||
                "",

            projectName:
                data.projectName ||
                data.project ||
                "",

            customerPhone:
                data.customerPhone ||
                data.phone ||
                "",

            rows,

            totalLoad,

            dailyEnergy,

            monthlyEnergy,

            tariff,

            estimatedBill,

            recommendedInverter,

            recommendedBatteryAh,

            batteryVoltage:
                number(
                    data.batteryVoltage
                ) || 12,

            backupHours:
                number(
                    data.backupHours
                ) || 4
        };
    }

    function collectReportData() {
        return (
            getDataFromGlobalAPI() ||
            getDataFromDOM() ||
            normalizeData({
                rows: []
            })
        );
    }

    function createModal() {
        if (
            document.getElementById(
                MODAL_ID
            )
        ) {
            return;
        }

        injectStyles();

        const modal =
            document.createElement(
                "div"
            );

        modal.id = MODAL_ID;

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

        modal.innerHTML = `
            <div
                class="etr-report-panel"
                role="dialog"
                aria-modal="true"
                aria-labelledby="etr-report-title">

                <div class="etr-report-header">
                    <div>
                        <div
                            id="etr-report-title"
                            class="etr-report-brand">
                            ⚡ ElectroTechBD
                            Electrical Report
                        </div>

                        <div class="etr-report-subtitle">
                            Professional Electrical Load
                            & Energy Estimate
                        </div>
                    </div>

                    <button
                        type="button"
                        class="etr-report-close"
                        id="etr-report-close"
                        aria-label="Close report">
                        ×
                    </button>
                </div>

                <div id="etr-report-content">
                    Report loading...
                </div>

                <div class="etr-report-actions">
                    <button
                        type="button"
                        class="etr-report-button"
                        id="etr-report-print">
                        🖨 Print Report
                    </button>

                    <button
                        type="button"
                        class="etr-report-button secondary"
                        id="etr-report-copy">
                        📋 Copy Report
                    </button>

                    <button
                        type="button"
                        class="etr-report-button secondary"
                        id="etr-report-close-bottom">
                        Close
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(
            modal
        );

        bindModalEvents();
    }

    function buildReportHTML(data) {
        const rowsHTML =
            data.rows.length
                ? data.rows.map(
                    (row, index) => `
                        <tr>
                            <td>
                                ${index + 1}
                            </td>

                            <td>
                                ${escapeHTML(
                                    row.name
                                )}
                            </td>

                            <td>
                                ${money(
                                    row.quantity
                                )}
                            </td>

                            <td>
                                ${money(
                                    row.watt
                                )} W
                            </td>

                            <td>
                                ${money(
                                    row.hours
                                )}
                            </td>

                            <td>
                                ${money(
                                    row.load
                                )} W
                            </td>

                            <td>
                                ${fixed(
                                    row.energy
                                )} kWh
                            </td>
                        </tr>
                    `
                ).join("")
                : `
                    <tr>
                        <td colspan="7">
                            No equipment data found
                        </td>
                    </tr>
                `;

        return `
            <div class="etr-report-info">
                <div class="etr-info-card">
                    <span>
                        Customer Name
                    </span>

                    <strong>
                        ${escapeHTML(
                            data.customerName ||
                            "Not provided"
                        )}
                    </strong>
                </div>

                <div class="etr-info-card">
                    <span>
                        Project Name
                    </span>

                    <strong>
                        ${escapeHTML(
                            data.projectName ||
                            "Not provided"
                        )}
                    </strong>
                </div>

                <div class="etr-info-card">
                    <span>
                        Mobile Number
                    </span>

                    <strong>
                        ${escapeHTML(
                            data.customerPhone ||
                            "Not provided"
                        )}
                    </strong>
                </div>

                <div class="etr-info-card">
                    <span>
                        Report Date
                    </span>

                    <strong>
                        ${today()}
                    </strong>
                </div>

                <div class="etr-info-card">
                    <span>
                        Tariff Per Unit
                    </span>

                    <strong>
                        ৳ ${money(data.tariff)}
                    </strong>
                </div>

                <div class="etr-info-card">
                    <span>
                        Battery Voltage
                    </span>

                    <strong>
                        ${money(
                            data.batteryVoltage
                        )} V
                    </strong>
                </div>
            </div>

            <h3 class="etr-report-heading">
                🔌 Equipment Load Details
            </h3>

            <div class="etr-table-container">
                <table class="etr-report-table">
                    <thead>
                        <tr>
                            <th>
                                #
                            </th>

                            <th>
                                Equipment
                            </th>

                            <th>
                                Qty
                            </th>

                            <th>
                                Watt
                            </th>

                            <th>
                                Hour/day
                            </th>

                            <th>
                                Load
                            </th>

                            <th>
                                Energy/day
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        ${rowsHTML}
                    </tbody>
                </table>
            </div>

            <h3 class="etr-report-heading">
                📊 Calculation Summary
            </h3>

            <div class="etr-summary">
                <div class="etr-summary-card">
                    <span>
                        Total Connected Load
                    </span>

                    <strong>
                        ${money(
                            data.totalLoad
                        )} W
                    </strong>
                </div>

                <div class="etr-summary-card">
                    <span>
                        Daily Energy
                    </span>

                    <strong>
                        ${fixed(
                            data.dailyEnergy
                        )} kWh
                    </strong>
                </div>

                <div class="etr-summary-card">
                    <span>
                        Monthly Energy
                    </span>

                    <strong>
                        ${fixed(
                            data.monthlyEnergy
                        )} Unit
                    </strong>
                </div>

                <div class="etr-summary-card">
                    <span>
                        Estimated Monthly Bill
                    </span>

                    <strong>
                        ৳ ${money(
                            data.estimatedBill
                        )}
                    </strong>
                </div>

                <div class="etr-summary-card">
                    <span>
                        Suggested Inverter
                    </span>

                    <strong>
                        ${money(
                            data.recommendedInverter
                        )} VA
                    </strong>
                </div>

                <div class="etr-summary-card">
                    <span>
                        Suggested Battery
                    </span>

                    <strong>
                        ${money(
                            data.recommendedBatteryAh
                        )} Ah
                    </strong>
                </div>
            </div>

            <div class="etr-report-warning">
                ⚠️ সতর্কতা: এটি preliminary estimate।
                বাস্তব installation-এর আগে qualified
                electrician/engineer দিয়ে starting current,
                cable size, voltage drop, MCB, RCCB,
                earthing, inverter ও battery specification
                verify করতে হবে।
            </div>

            <div class="etr-report-footer">
                <div>
                    Prepared by:
                    ElectroTechBD
                </div>

                <div>
                    Electrical Engineering & Automation
                </div>
            </div>
        `;
    }

    function buildReportText(data) {
        let text =
            "ElectroTechBD Electrical Load Report\n";

        text +=
            "========================================\n\n";

        text +=
            `Customer Name: ${
                data.customerName ||
                "Not provided"
            }\n`;

        text +=
            `Project Name: ${
                data.projectName ||
                "Not provided"
            }\n`;

        text +=
            `Mobile Number: ${
                data.customerPhone ||
                "Not provided"
            }\n`;

        text +=
            `Report Date: ${
                today()
            }\n\n`;

        text +=
            "Equipment Details\n";

        text +=
            "----------------------------------------\n";

        data.rows.forEach(
            (row, index) => {
                text +=
                    `${index + 1}. ${
                        row.name
                    }\n`;

                text +=
                    `Quantity: ${
                        row.quantity
                    }\n`;

                text +=
                    `Watt: ${
                        row.watt
                    } W\n`;

                text +=
                    `Hour/day: ${
                        row.hours
                    }\n`;

                text +=
                    `Load: ${
                        row.load
                    } W\n`;

                text +=
                    `Daily Energy: ${
                        fixed(row.energy)
                    } kWh\n\n`;
            }
        );

        text +=
            "Calculation Summary\n";

        text +=
            "----------------------------------------\n";

        text +=
            `Total Load: ${
                fixed(data.totalLoad)
            } W\n`;

        text +=
            `Daily Energy: ${
                fixed(data.dailyEnergy)
            } kWh\n`;

        text +=
            `Monthly Energy: ${
                fixed(data.monthlyEnergy)
            } Unit\n`;

        text +=
            `Estimated Monthly Bill: ৳ ${
                fixed(data.estimatedBill)
            }\n`;

        text +=
            `Suggested Inverter: ${
                fixed(data.recommendedInverter)
            } VA\n`;

        text +=
            `Suggested Battery: ${
                fixed(data.recommendedBatteryAh)
            } Ah\n\n`;

        text +=
            "Safety Note: Preliminary estimate only. " +
            "Qualified electrician/engineer verification required.";

        return text;
    }

    function openReport() {
        createModal();

        const modal =
            document.getElementById(
                MODAL_ID
            );

        const content =
            document.getElementById(
                "etr-report-content"
            );

        lastReportData =
            collectReportData();

        if (content) {
            content.innerHTML =
                buildReportHTML(
                    lastReportData
                );
        }

        if (modal) {
            modal.classList.add(
                "show"
            );

            modal.setAttribute(
                "aria-hidden",
                "false"
            );

            document.body.style.overflow =
                "hidden";
        }
    }

    function closeReport() {
        const modal =
            document.getElementById(
                MODAL_ID
            );

        if (!modal) {
            return;
        }

        modal.classList.remove(
            "show"
        );

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.style.overflow =
            "";
    }

    function printReport() {
        openReport();

        setTimeout(
            function () {
                window.print();
            },
            300
        );
    }

    function copyReport() {
        const data =
            lastReportData ||
            collectReportData();

        const text =
            buildReportText(
                data
            );

        if (
            navigator.clipboard &&
            typeof navigator.clipboard.writeText ===
                "function"
        ) {
            navigator.clipboard
                .writeText(text)
                .then(
                    function () {
                        alert(
                            "Report copied successfully."
                        );
                    }
                )
                .catch(
                    function () {
                        fallbackCopy(
                            text
                        );
                    }
                );
        } else {
            fallbackCopy(
                text
            );
        }
    }

    function fallbackCopy(text) {
        const textarea =
            document.createElement(
                "textarea"
            );

        textarea.value =
            text;

        textarea.style.position =
            "fixed";

        textarea.style.left =
            "-9999px";

        textarea.style.top =
            "0";

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
                "Copy করা যায়নি। Report manually copy করুন।"
            );
        }

        textarea.remove();
    }

    function bindModalEvents() {
        const closeButton =
            document.getElementById(
                "etr-report-close"
            );

        const closeBottom =
            document.getElementById(
                "etr-report-close-bottom"
            );

        const printButton =
            document.getElementById(
                "etr-report-print"
            );

        const copyButton =
            document.getElementById(
                "etr-report-copy"
            );

        const modal =
            document.getElementById(
                MODAL_ID
            );

        if (closeButton) {
            closeButton.addEventListener(
                "click",
                closeReport
            );
        }

        if (closeBottom) {
            closeBottom.addEventListener(
                "click",
                closeReport
            );
        }

        if (printButton) {
            printButton.addEventListener(
                "click",
                printReport
            );
        }

        if (copyButton) {
            copyButton.addEventListener(
                "click",
                copyReport
            );
        }

        if (modal) {
            modal.addEventListener(
                "click",
                function (event) {
                    if (
                        event.target ===
                        modal
                    ) {
                        closeReport();
                    }
                }
            );
        }

        document.addEventListener(
            "keydown",
            function (event) {
                if (
                    event.key ===
                        "Escape" ||
                    event.key ===
                        "Esc"
                ) {
                    closeReport();
                }
            }
        );
    }

    function connectExistingButtons() {
        const allButtons =
            Array.from(
                document.querySelectorAll(
                    "button"
                )
            );

        allButtons.forEach(
            function (button) {
                const text =
                    button.textContent
                        .trim()
                        .toLowerCase();

                if (
                    text.includes(
                        "print report"
                    ) ||
                    text.includes(
                        "প্রিন্ট রিপোর্ট"
                    )
                ) {
                    if (
                        button.dataset.etrConnected ===
                        "true"
                    ) {
                        return;
                    }

                    button.dataset.etrConnected =
                        "true";

                    button.addEventListener(
                        "click",
                        function (event) {
                            event.preventDefault();

                            printReport();
                        }
                    );
                }

                if (
                    text.includes(
                        "copy report"
                    ) ||
                    text.includes(
                        "কপি রিপোর্ট"
                    )
                ) {
                    if (
                        button.dataset.etrCopyConnected ===
                        "true"
                    ) {
                        return;
                    }

                    button.dataset.etrCopyConnected =
                        "true";

                    button.addEventListener(
                        "click",
                        function (event) {
                            event.preventDefault();

                            copyReport();
                        }
                    );
                }
            }
        );
    }

    function addViewReportButton() {
        if (
            document.getElementById(
                "etr-view-report-button"
            )
        ) {
            return;
        }

        const existingPrintButton =
            Array.from(
                document.querySelectorAll(
                    "button"
                )
            ).find(
                button =>
                    button.textContent
                        .trim()
                        .toLowerCase()
                        .includes(
                            "print report"
                        )
            );

        let parent =
            existingPrintButton
                ? existingPrintButton.parentElement
                : null;

        if (!parent) {
            parent =
                document.querySelector(
                    "#electrotech-load-calculator-app"
                );
        }

        if (!parent) {
            parent =
                document.querySelector(
                    ".etl-panel"
                );
        }

        if (!parent) {
            return;
        }

        const button =
            document.createElement(
                "button"
            );

        button.type =
            "button";

        button.id =
            "etr-view-report-button";

        button.className =
            "etr-external-button";

        button.textContent =
            "📊 View Professional Report";

        button.addEventListener(
            "click",
            openReport
        );

        parent.appendChild(
            button
        );
    }

    window.ElectroTechReport = {
        open: openReport,

        close: closeReport,

        print: printReport,

        copy: copyReport,

        getData: collectReportData,

        getText: function () {
            return buildReportText(
                collectReportData()
            );
        }
    };

    function initialize() {
        createModal();

        connectExistingButtons();

        addViewReportButton();

        console.log(
            "📊 ElectroTechBD Professional Report Loaded Successfully."
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

    let observerStarted =
        false;

    function startObserver() {
        if (observerStarted) {
            return;
        }

        observerStarted =
            true;

        if (
            typeof MutationObserver ===
            "undefined"
        ) {
            return;
        }

        const observer =
            new MutationObserver(
                function () {
                    connectExistingButtons();

                    addViewReportButton();
                }
            );

        observer.observe(
            document.body,
            {
                childList: true,
                subtree: true
            }
        );
    }

    setTimeout(
        startObserver,
        800
    );

})();