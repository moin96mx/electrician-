/*
=========================================================
 ElectroTechBD Ultimate Electrical Engineering Engine
 Bangla Electrical Calculator Pack
 File: electrotech-ultimate.js

 IMPORTANT:
 এটি preliminary calculation/education purpose-এর জন্য।
 বাস্তব wiring, breaker, cable, transformer, motor,
 solar বা generator installation-এর আগে qualified engineer
 দ্বারা যাচাই করতে হবে।
=========================================================
*/

(() => {
  "use strict";

  if (window.__ElectroTechUltimateLoaded) return;
  window.__ElectroTechUltimateLoaded = true;

  const NAME = "ভোল্ট";

  const num = (value, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };

  const clean = value =>
    String(value || "")
      .toLowerCase()
      .replace(/[০-৯]/g, d => "০১২৩৪৫৬৭৮৯".indexOf(d))
      .replace(/,/g, "")
      .trim();

  const fmt = (value, digits = 2) => {
    if (!Number.isFinite(value)) return "হিসাব করা যাচ্ছে না";
    return Number(value.toFixed(digits)).toLocaleString("en-US");
  };

  const watt = value => {
    const text = clean(value);
    const n = parseFloat(text) || 0;

    if (text.includes("mw")) return n * 1000000;
    if (text.includes("kw")) return n * 1000;
    if (text.includes("mw")) return n * 1000000;

    return n;
  };

  const volt = value => {
    const text = clean(value);
    const n = parseFloat(text) || 0;

    if (text.includes("kv")) return n * 1000;
    if (text.includes("mv")) return n * 1000000;

    return n;
  };

  const amp = value => {
    const text = clean(value);
    const n = parseFloat(text) || 0;

    if (text.includes("ma")) return n / 1000;
    if (text.includes("ka")) return n * 1000;

    return n;
  };

  const ohm = value => {
    const text = clean(value);
    const n = parseFloat(text) || 0;

    if (text.includes("kohm") || text.includes("kΩ")) return n * 1000;
    if (text.includes("mohm")) return n * 1000000;

    return n;
  };

  const pfValue = value => {
    const n = num(parseFloat(clean(value)));
    if (n > 1 && n <= 100) return n / 100;
    return n;
  };

  const parseNumbers = text =>
    clean(text)
      .match(/-?\d+(\.\d+)?/g)
      ?.map(Number) || [];

  const answer = (title, body, warning = true) => {
    let output = `⚡ ${title}\n\n${body}`;

    if (warning) {
      output +=
        "\n\n⚠️ সতর্কতা: এটি preliminary হিসাব। বাস্তব electrical installation-এর আগে স্থানীয় code, cable condition, temperature, fault level এবং qualified engineer-এর যাচাই প্রয়োজন।";
    }

    return output;
  };

  const help = () =>
    answer(
      "ElectroTechBD Ultimate Electrical Calculator",
      `আমি নিচের electrical হিসাব করতে পারি:

১. Ohm’s Law
২. Power, Energy ও Bill
৩. DC Power
৪. AC Single Phase
৫. AC Three Phase
৬. Voltage Drop
৭. Cable Resistance
৮. Copper/Aluminium Cable
৯. Transformer
১০. Motor Current
১১. Motor RPM
১২. Generator Sizing
১৩. UPS Sizing
১৪. Inverter Sizing
১৫. Battery Backup
১৬. Solar Panel
১৭. Solar Battery
১৮. Charge Controller
১৯. Power Factor Correction
২০. Capacitor kVAR
২১. Resistor Series
২২. Resistor Parallel
২৩. LED Resistor
২৪. Fuse/MCB Preliminary
২৫. kW/kVA/kVAR
২৬. Star-Delta
২৭. Frequency ও Pole
২৮. Load Schedule
২৯. Electricity Bill
৩০. Short Circuit Basic Estimate

উদাহরণ:
- ohm 12 volt 3 amp
- single phase 230 volt 10 amp pf 0.8
- three phase 400 volt 20 amp pf 0.85
- voltage drop 20 amp 30 meter 4 sqmm copper
- transformer 500 kva 11000 volt
- motor 15 kw 400 volt pf 0.85 efficiency 0.9
- battery 100 ah 12 volt 300 watt
- solar 500 watt panel 5 hour
- capacitor correction 10 kw pf 0.7 to 0.95
- electricity bill 350 unit rate 12`
    );

  // =====================================================
  // 1. OHM'S LAW
  // =====================================================

  function ohmsLaw(text) {
    const numbers = parseNumbers(text);
    const V = numbers[0];
    const I = numbers[1];
    const R = numbers[2];

    if (text.includes("volt") && text.includes("amp")) {
      const voltage = volt(V);
      const current = amp(I);
      const resistance = voltage / current;
      const power = voltage * current;

      return answer(
        "Ohm’s Law",
        `Voltage = ${fmt(voltage)} V
Current = ${fmt(current)} A

Resistance = V ÷ I
R = ${fmt(resistance)} Ω

Power = V × I
P = ${fmt(power)} W`
      );
    }

    if (text.includes("volt") && text.includes("ohm")) {
      const voltage = volt(V);
      const resistance = ohm(I);
      const current = voltage / resistance;
      const power = voltage * current;

      return answer(
        "Ohm’s Law",
        `Voltage = ${fmt(voltage)} V
Resistance = ${fmt(resistance)} Ω

Current = V ÷ R
I = ${fmt(current)} A

Power = V × I
P = ${fmt(power)} W`
      );
    }

    if (text.includes("amp") && text.includes("ohm")) {
      const current = amp(V);
      const resistance = ohm(I);
      const voltage = current * resistance;
      const power = voltage * current;

      return answer(
        "Ohm’s Law",
        `Current = ${fmt(current)} A
Resistance = ${fmt(resistance)} Ω

Voltage = I × R
V = ${fmt(voltage)} V

Power = ${fmt(power)} W`
      );
    }

    return null;
  }

  // =====================================================
  // 2. POWER / ENERGY
  // =====================================================

  function powerCalculator(text) {
    const n = parseNumbers(text);
    if (n.length < 2) return null;

    if (
      text.includes("power") ||
      text.includes("watt") ||
      text.includes("kw") ||
      text.includes("ওয়াট") ||
      text.includes("কিলোওয়াট")
    ) {
      const V = n[0];
      const I = n[1];
      const pf = n[2] || 1;

      const P = V * I * pf;

      return answer(
        "Power Calculator",
        `Voltage = ${fmt(V)} V
Current = ${fmt(I)} A
Power Factor = ${fmt(pf)}

DC/Unity PF Power = ${fmt(V * I)} W
AC Real Power = V × I × PF
Real Power = ${fmt(P)} W
Real Power = ${fmt(P / 1000)} kW`
      );
    }

    return null;
  }

  // =====================================================
  // 3. ENERGY AND ELECTRICITY BILL
  // =====================================================

  function energyBill(text) {
    if (
      !text.includes("bill") &&
      !text.includes("unit") &&
      !text.includes("energy") &&
      !text.includes("বিল") &&
      !text.includes("ইউনিট")
    ) {
      return null;
    }

    const n = parseNumbers(text);
    if (n.length < 2) return null;

    const powerKW = n[0] / 1000;
    const hours = n[1];
    const days = n[2] || 30;
    const rate = n[3] || 12;

    const daily = powerKW * hours;
    const monthly = daily * days;
    const cost = monthly * rate;

    return answer(
      "Energy ও Electricity Bill",
      `Load = ${fmt(n[0])} W
Daily Runtime = ${fmt(hours)} hour
Days = ${fmt(days)}
Unit Rate = ${fmt(rate)} টাকা

Daily Energy = ${fmt(daily)} kWh
Monthly Energy = ${fmt(monthly)} ইউনিট

Estimated Bill = ${fmt(cost)} টাকা

নোট: এখানে fixed charge, demand charge, VAT, slab tariff বা surcharge ধরা হয়নি।`
    );
  }

  // =====================================================
  // 4. SINGLE PHASE AC
  // =====================================================

  function singlePhase(text) {
    if (
      !text.includes("single") &&
      !text.includes("1 phase") &&
      !text.includes("single phase") &&
      !text.includes("এক ফেজ")
    ) {
      return null;
    }

    const n = parseNumbers(text);
    if (n.length < 2) return null;

    const V = n[0];
    const I = n[1];
    const pf = n[2] || 1;

    const VA = V * I;
    const W = VA * pf;
    const kVA = VA / 1000;
    const kW = W / 1000;
    const kVAR = Math.sqrt(Math.max(0, VA * VA - W * W)) / 1000;

    return answer(
      "Single Phase AC Calculator",
      `Voltage = ${fmt(V)} V
Current = ${fmt(I)} A
Power Factor = ${fmt(pf)}

Apparent Power = ${fmt(kVA)} kVA
Real Power = ${fmt(kW)} kW
Reactive Power = ${fmt(kVAR)} kVAR

Formula:
S = V × I
P = V × I × PF
Q = √(S² − P²)`
    );
  }

  // =====================================================
  // 5. THREE PHASE AC
  // =====================================================

  function threePhase(text) {
    if (
      !text.includes("three phase") &&
      !text.includes("3 phase") &&
      !text.includes("three-phase") &&
      !text.includes("তিন ফেজ")
    ) {
      return null;
    }

    const n = parseNumbers(text);
    if (n.length < 2) return null;

    const V = n[0];
    const I = n[1];
    const pf = n[2] || 1;

    const S = Math.sqrt(3) * V * I;
    const P = S * pf;
    const Q = Math.sqrt(Math.max(0, S * S - P * P));

    return answer(
      "Three Phase AC Calculator",
      `Line Voltage = ${fmt(V)} V
Line Current = ${fmt(I)} A
Power Factor = ${fmt(pf)}

Apparent Power = ${fmt(S / 1000)} kVA
Real Power = ${fmt(P / 1000)} kW
Reactive Power = ${fmt(Q / 1000)} kVAR

Formula:
S = √3 × VL × IL
P = √3 × VL × IL × PF`
    );
  }

  // =====================================================
  // 6. VOLTAGE DROP
  // =====================================================

  function voltageDrop(text) {
    if (
      !text.includes("voltage drop") &&
      !text.includes("ভোল্টেজ ড্রপ") &&
      !text.includes("drop")
    ) {
      return null;
    }

    const n = parseNumbers(text);
    if (n.length < 3) return null;

    const I = n[0];
    const length = n[1];
    const area = n[2];

    const copperRho = 0.0175;
    const aluminiumRho = 0.0282;

    const isAl = text.includes("aluminium") || text.includes("aluminum");
    const rho = isAl ? aluminiumRho : copperRho;

    const phaseLoop = text.includes("single") || text.includes("1 phase")
      ? 2
      : 1;

    const resistance = (rho * length * phaseLoop) / area;
    const drop = I * resistance;
    const percent = text.includes("230") ? (drop / 230) * 100 : 0;

    return answer(
      "Voltage Drop Calculator",
      `Current = ${fmt(I)} A
Cable Length = ${fmt(length)} meter
Cable Area = ${fmt(area)} mm²
Conductor = ${isAl ? "Aluminium" : "Copper"}

Estimated Resistance = ${fmt(resistance, 5)} Ω
Voltage Drop = ${fmt(drop)} V
${percent ? `Approx. Drop Percentage = ${fmt(percent)}%` : ""}

Formula:
R = ρ × L ÷ A
Vdrop = I × R

নোট: বাস্তবে reactance, temperature, installation method এবং power factor-এর কারণে ফল পরিবর্তিত হতে পারে।`
    );
  }

  // =====================================================
  // 7. CABLE RESISTANCE
  // =====================================================

  function cableResistance(text) {
    if (
      !text.includes("cable resistance") &&
      !text.includes("তার রেজিস্ট্যান্স") &&
      !text.includes("wire resistance")
    ) {
      return null;
    }

    const n = parseNumbers(text);
    if (n.length < 2) return null;

    const length = n[0];
    const area = n[1];
    const rho = text.includes("aluminium") ? 0.0282 : 0.0175;

    const R = rho * length / area;

    return answer(
      "Cable Resistance",
      `Length = ${fmt(length)} meter
Area = ${fmt(area)} mm²
Material = ${rho === 0.0175 ? "Copper" : "Aluminium"}

Resistance = ρ × L ÷ A
R = ${fmt(R, 5)} Ω`
    );
  }

  // =====================================================
  // 8. TRANSFORMER
  // =====================================================

  function transformer(text) {
    if (
      !text.includes("transformer") &&
      !text.includes("ট্রান্সফরমার")
    ) {
      return null;
    }

    const n = parseNumbers(text);
    if (n.length < 2) return null;

    const kva = n[0];
    const primary = n[1];
    const secondary = n[2] || 400;

    const primaryCurrent = (kva * 1000) / primary;
    const secondaryCurrent = (kva * 1000) / secondary;
    const ratio = primary / secondary;

    return answer(
      "Transformer Calculator",
      `Transformer Rating = ${fmt(kva)} kVA
Primary Voltage = ${fmt(primary)} V
Secondary Voltage = ${fmt(secondary)} V

Turns/Voltage Ratio = ${fmt(ratio)}

Primary Current ≈ ${fmt(primaryCurrent)} A
Secondary Current ≈ ${fmt(secondaryCurrent)} A

Formula:
I = VA ÷ V

বাস্তবে efficiency, impedance, vector group ও temperature বিবেচনা করতে হয়।`
    );
  }

  // =====================================================
  // 9. MOTOR CURRENT
  // =====================================================

  function motorCurrent(text) {
    if (
      !text.includes("motor") &&
      !text.includes("মোটর")
    ) {
      return null;
    }

    if (
      !text.includes("current") &&
      !text.includes("amp") &&
      !text.includes("কারেন্ট")
    ) {
      return null;
    }

    const n = parseNumbers(text);
    if (n.length < 2) return null;

    const kw = n[0];
    const voltage = n[1];
    const pf = n[2] || 0.85;
    const efficiency = n[3] || 0.9;

    const current =
      (kw * 1000) /
      (Math.sqrt(3) * voltage * pf * efficiency);

    return answer(
      "Three Phase Motor Current",
      `Motor Output = ${fmt(kw)} kW
Voltage = ${fmt(voltage)} V
Power Factor = ${fmt(pf)}
Efficiency = ${fmt(efficiency)}

Estimated Full Load Current = ${fmt(current)} A

Formula:
I = P ÷ (√3 × V × PF × η)`
    );
  }

  // =====================================================
  // 10. MOTOR RPM
  // =====================================================

  function motorRPM(text) {
    if (
      !text.includes("rpm") &&
      !text.includes("motor speed") &&
      !text.includes("মোটর স্পিড")
    ) {
      return null;
    }

    const n = parseNumbers(text);
    if (n.length < 2) return null;

    const frequency = n[0];
    const poles = n[1];

    const synchronous = (120 * frequency) / poles;
    const slip = n[2] || 3;
    const actual = synchronous * (1 - slip / 100);

    return answer(
      "Motor RPM Calculator",
      `Frequency = ${fmt(frequency)} Hz
Poles = ${fmt(poles)}
Slip = ${fmt(slip)}%

Synchronous Speed = ${fmt(synchronous)} RPM
Approx. Actual Speed = ${fmt(actual)} RPM

Formula:
Ns = 120 × f ÷ P`
    );
  }

  // =====================================================
  // 11. GENERATOR SIZING
  // =====================================================

  function generator(text) {
    if (
      !text.includes("generator") &&
      !text.includes("জেনারেটর")
    ) {
      return null;
    }

    const n = parseNumbers(text);
    if (!n.length) return null;

    const loadKW = n[0];
    const pf = n[1] || 0.8;
    const reserve = n[2] || 25;

    const kva = loadKW / pf;
    const recommended = kva * (1 + reserve / 100);

    return answer(
      "Generator Sizing",
      `Connected Load = ${fmt(loadKW)} kW
Assumed PF = ${fmt(pf)}
Reserve = ${fmt(reserve)}%

Calculated Load = ${fmt(kva)} kVA
Suggested Preliminary Capacity = ${fmt(recommended)} kVA

Motor starting current, compressor starting, future expansion এবং step-load অবশ্যই বিবেচনা করতে হবে।`
    );
  }

  // =====================================================
  // 12. UPS / INVERTER
  // =====================================================

  function ups(text) {
    if (
      !text.includes("ups") &&
      !text.includes("inverter") &&
      !text.includes("ইনভার্টার") &&
      !text.includes("ইউপিএস")
    ) {
      return null;
    }

    const n = parseNumbers(text);
    if (n.length < 2) return null;

    const load = n[0];
    const pf = n[1] || 0.8;
    const reserve = n[2] || 25;

    const kva = load / pf;
    const finalKVA = kva * (1 + reserve / 100);

    return answer(
      "UPS / Inverter Sizing",
      `Load = ${fmt(load)} W
Power Factor = ${fmt(pf)}
Reserve = ${fmt(reserve)}%

Required VA = ${fmt(load / pf)} VA
Required kVA = ${fmt(kva / 1000)} kVA
With Reserve = ${fmt(finalKVA / 1000)} kVA

সাধারণভাবে inverter/UPS-এর continuous rating load-এর চেয়ে বেশি রাখা হয়।`
    );
  }

  // =====================================================
  // 13. BATTERY BACKUP
  // =====================================================

  function battery(text) {
    if (
      !text.includes("battery") &&
      !text.includes("ব্যাটারি") &&
      !text.includes("backup")
    ) {
      return null;
    }

    const n = parseNumbers(text);
    if (n.length < 3) return null;

    const voltage = n[0];
    const ah = n[1];
    const load = n[2];
    const efficiency = n[3] || 0.85;

    const energy = voltage * ah;
    const usable = energy * efficiency;
    const backup = usable / load;

    return answer(
      "Battery Backup Calculator",
      `Battery Voltage = ${fmt(voltage)} V
Battery Capacity = ${fmt(ah)} Ah
Load = ${fmt(load)} W
System Efficiency = ${fmt(efficiency)}

Nominal Energy = ${fmt(energy)} Wh
Usable Energy ≈ ${fmt(usable)} Wh
Backup Time ≈ ${fmt(backup)} hour

Formula:
Backup = V × Ah × Efficiency ÷ Load`
    );
  }

  // =====================================================
  // 14. BATTERY AH REQUIRED
  // =====================================================

  function batteryRequired(text) {
    if (
      !text.includes("required battery") &&
      !text.includes("battery ah") &&
      !text.includes("ব্যাটারি কত ah")
    ) {
      return null;
    }

    const n = parseNumbers(text);
    if (n.length < 3) return null;

    const load = n[0];
    const hours = n[1];
    const voltage = n[2];
    const efficiency = n[3] || 0.85;
    const dod = n[4] || 0.8;

    const ah =
      (load * hours) /
      (voltage * efficiency * dod);

    return answer(
      "Required Battery Capacity",
      `Load = ${fmt(load)} W
Backup Time = ${fmt(hours)} hour
Battery Voltage = ${fmt(voltage)} V
Efficiency = ${fmt(efficiency)}
Depth of Discharge = ${fmt(dod)}

Required Capacity ≈ ${fmt(ah)} Ah

বাস্তবে battery chemistry, temperature, aging এবং surge load বিবেচনা করতে হবে।`
    );
  }

  // =====================================================
  // 15. SOLAR PANEL
  // =====================================================

  function solar(text) {
    if (
      !text.includes("solar") &&
      !text.includes("সোলার") &&
      !text.includes("panel")
    ) {
      return null;
    }

    const n = parseNumbers(text);
    if (n.length < 2) return null;

    const dailyWh = n[0];
    const panelW = n[1];
    const sunHours = n[2] || 4.5;
    const systemLoss = n[3] || 0.75;

    const requiredPanelW =
      dailyWh / (sunHours * systemLoss);

    const panelCount = Math.ceil(requiredPanelW / panelW);

    return answer(
      "Solar Panel Sizing",
      `Daily Energy Requirement = ${fmt(dailyWh)} Wh
Panel Size = ${fmt(panelW)} W
Peak Sun Hour = ${fmt(sunHours)}
System Factor = ${fmt(systemLoss)}

Required Solar Capacity ≈ ${fmt(requiredPanelW)} W
Required Panel Count ≈ ${fmt(panelCount)} টি

Formula:
Solar Watt = Daily Wh ÷ Sun Hour ÷ System Factor`
    );
  }

  // =====================================================
  // 16. SOLAR BATTERY
  // =====================================================

  function solarBattery(text) {
    if (
      !text.includes("solar battery") &&
      !text.includes("সোলার ব্যাটারি")
    ) {
      return null;
    }

    const n = parseNumbers(text);
    if (n.length < 3) return null;

    const dailyWh = n[0];
    const backupDays = n[1];
    const voltage = n[2];
    const dod = n[3] || 0.8;
    const efficiency = n[4] || 0.85;

    const ah =
      (dailyWh * backupDays) /
      (voltage * dod * efficiency);

    return answer(
      "Solar Battery Sizing",
      `Daily Energy = ${fmt(dailyWh)} Wh
Backup Days = ${fmt(backupDays)}
Battery Voltage = ${fmt(voltage)} V
DOD = ${fmt(dod)}
Efficiency = ${fmt(efficiency)}

Required Battery Capacity ≈ ${fmt(ah)} Ah`
    );
  }

  // =====================================================
  // 17. CHARGE CONTROLLER
  // =====================================================

  function chargeController(text) {
    if (
      !text.includes("charge controller") &&
      !text.includes("চার্জ কন্ট্রোলার")
    ) {
      return null;
    }

    const n = parseNumbers(text);
    if (n.length < 2) return null;

    const solarW = n[0];
    const batteryV = n[1];
    const reserve = n[2] || 25;

    const current = solarW / batteryV;
    const recommended = current * (1 + reserve / 100);

    return answer(
      "Solar Charge Controller",
      `Solar Array = ${fmt(solarW)} W
Battery Voltage = ${fmt(batteryV)} V
Reserve = ${fmt(reserve)}%

Charging Current ≈ ${fmt(current)} A
Suggested Controller ≈ ${fmt(recommended)} A

MPPT/PWM type, PV open-circuit voltage এবং controller maximum PV voltage যাচাই করতে হবে।`
    );
  }

  // =====================================================
  // 18. POWER FACTOR CORRECTION
  // =====================================================

  function capacitorCorrection(text) {
    if (
      !text.includes("power factor correction") &&
      !text.includes("pf correction") &&
      !text.includes("capacitor correction") &&
      !text.includes("kvar") &&
      !text.includes("ক্যাপাসিটর")
    ) {
      return null;
    }

    const n = parseNumbers(text);
    if (n.length < 3) return null;

    const kw = n[0];
    const oldPF = n[1];
    const newPF = n[2];

    const phi1 = Math.acos(oldPF);
    const phi2 = Math.acos(newPF);

    const kvar = kw * (Math.tan(phi1) - Math.tan(phi2));

    return answer(
      "Power Factor Correction Capacitor",
      `Real Power = ${fmt(kw)} kW
Existing PF = ${fmt(oldPF)}
Target PF = ${fmt(newPF)}

Required Capacitor ≈ ${fmt(kvar)} kVAR

Formula:
kVAR = kW × (tan φ1 − tan φ2)

Capacitor bank-এর switching, harmonics, detuned reactor এবং over-correction যাচাই করতে হবে।`
    );
  }

  // =====================================================
  // 19. RESISTOR SERIES
  // =====================================================

  function resistorSeries(text) {
    if (
      !text.includes("resistor series") &&
      !text.includes("series resistor") &&
      !text.includes("সিরিজ রেজিস্টর")
    ) {
      return null;
    }

    const n = parseNumbers(text);
    if (n.length < 2) return null;

    const total = n.reduce((sum, value) => sum + value, 0);

    return answer(
      "Series Resistor",
      `Resistors = ${n.map(v => fmt(v) + " Ω").join(" + ")}

Total Resistance = ${fmt(total)} Ω

Formula:
Rtotal = R1 + R2 + R3 + ...`
    );
  }

  // =====================================================
  // 20. RESISTOR PARALLEL
  // =====================================================

  function resistorParallel(text) {
    if (
      !text.includes("resistor parallel") &&
      !text.includes("parallel resistor") &&
      !text.includes("প্যারালাল রেজিস্টর")
    ) {
      return null;
    }

    const n = parseNumbers(text);
    if (n.length < 2) return null;

    const reciprocal = n.reduce(
      (sum, value) => sum + 1 / value,
      0
    );

    const total = 1 / reciprocal;

    return answer(
      "Parallel Resistor",
      `Resistors = ${n.map(v => fmt(v) + " Ω").join(" || ")}

Total Resistance = ${fmt(total)} Ω

Formula:
1/Rtotal = 1/R1 + 1/R2 + ...`
    );
  }

  // =====================================================
  // 21. LED RESISTOR
  // =====================================================

  function ledResistor(text) {
    if (
      !text.includes("led resistor") &&
      !text.includes("led resistance") &&
      !text.includes("এলইডি রেজিস্টর")
    ) {
      return null;
    }

    const n = parseNumbers(text);
    if (n.length < 3) return null;

    const supply = n[0];
    const ledForward = n[1];
    const currentMA = n[2];

    const current = currentMA / 1000;
    const resistance = (supply - ledForward) / current;
    const power = Math.pow(current, 2) * resistance;

    return answer(
      "LED Series Resistor",
      `Supply Voltage = ${fmt(supply)} V
LED Forward Voltage = ${fmt(ledForward)} V
LED Current = ${fmt(currentMA)} mA

Required Resistance = ${fmt(resistance)} Ω
Resistor Power = ${fmt(power)} W

সাধারণত calculated power-এর চেয়ে বেশি watt-rated resistor ব্যবহার করা হয়।`
    );
  }

  // =====================================================
  // 22. FUSE / MCB PRELIMINARY
  // =====================================================

  function protection(text) {
    if (
      !text.includes("fuse") &&
      !text.includes("mcb") &&
      !text.includes("breaker") &&
      !text.includes("ফিউজ") &&
      !text.includes("এমসিবি")
    ) {
      return null;
    }

    const n = parseNumbers(text);
    if (!n.length) return null;

    const loadCurrent = n[0];
    const reserve = n[1] || 25;
    const candidate = loadCurrent * (1 + reserve / 100);

    const standard = [2, 4, 6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100];

    const selected =
      standard.find(value => value >= candidate) ||
      Math.ceil(candidate / 10) * 10;

    return answer(
      "Fuse / MCB Preliminary Estimate",
      `Load Current = ${fmt(loadCurrent)} A
Reserve = ${fmt(reserve)}%

Calculated Candidate = ${fmt(candidate)} A
Nearest Common Rating ≈ ${fmt(selected)} A

কিন্তু breaker selection শুধু load current দিয়ে করা যায় না। Cable ampacity, breaking capacity, curve type, inrush current, earth fault loop এবং local electrical code অবশ্যই যাচাই করতে হবে।`
    );
  }

  // =====================================================
  // 23. KVA / KW / KVAR
  // =====================================================

  function kvaKwKvar(text) {
    if (
      !text.includes("kva") &&
      !text.includes("kw") &&
      !text.includes("kvar")
    ) {
      return null;
    }

    const n = parseNumbers(text);
    if (!n.length) return null;

    const value = n[0];
    const pf = n[1] || 0.8;

    const kW = value * pf;
    const kVAR = value * Math.sqrt(Math.max(0, 1 - pf * pf));

    return answer(
      "kVA / kW / kVAR Conversion",
      `Input Apparent Power = ${fmt(value)} kVA
Power Factor = ${fmt(pf)}

Real Power = ${fmt(kW)} kW
Reactive Power = ${fmt(kVAR)} kVAR

Formula:
kW = kVA × PF
kVAR = kVA × sin φ`
    );
  }

  // =====================================================
  // 24. STAR DELTA
  // =====================================================

  function starDelta(text) {
    if (
      !text.includes("star delta") &&
      !text.includes("star-delta") &&
      !text.includes("স্টার ডেল্টা")
    ) {
      return null;
    }

    const n = parseNumbers(text);
    if (!n.length) return null;

    const lineVoltage = n[0];
    const phaseStar = lineVoltage / Math.sqrt(3);
    const phaseDelta = lineVoltage;

    return answer(
      "Star–Delta Voltage Relation",
      `Line Voltage = ${fmt(lineVoltage)} V

Star Connection Phase Voltage:
Vph = VL ÷ √3
Vph = ${fmt(phaseStar)} V

Delta Connection Phase Voltage:
Vph = VL
Vph = ${fmt(phaseDelta)} V

নোট: Star-delta starter-এর motor terminal connection motor nameplate অনুযায়ী করতে হবে।`
    );
  }

  // =====================================================
  // 25. FREQUENCY / POLES
  // =====================================================

  function frequencyPole(text) {
    if (
      !text.includes("frequency") &&
      !text.includes("pole") &&
      !text.includes("ফ্রিকোয়েন্সি") &&
      !text.includes("পোল")
    ) {
      return null;
    }

    const n = parseNumbers(text);
    if (n.length < 2) return null;

    const frequency = n[0];
    const poles = n[1];
    const rpm = (120 * frequency) / poles;

    return answer(
      "Frequency–Pole–RPM",
      `Frequency = ${fmt(frequency)} Hz
Poles = ${fmt(poles)}

Synchronous RPM = ${fmt(rpm)}

Formula:
RPM = 120 × Frequency ÷ Poles`
    );
  }

  // =====================================================
  // 26. LOAD SCHEDULE
  // =====================================================

  function loadSchedule(text) {
    if (
      !text.includes("load schedule") &&
      !text.includes("লোড সিডিউল") &&
      !text.includes("load list")
    ) {
      return null;
    }

    const n = parseNumbers(text);
    if (!n.length) return null;

    const total = n.reduce((sum, value) => sum + value, 0);
    const demand = total * 0.8;
    const kva = demand / 0.8;

    return answer(
      "Preliminary Load Schedule",
      `Detected Loads:
${n.map((value, index) => `${index + 1}. ${fmt(value)} W`).join("\n")}

Connected Load = ${fmt(total)} W
Assumed Demand Factor = 0.8
Estimated Demand Load = ${fmt(demand)} W
At PF 0.8 ≈ ${fmt(kva / 1000)} kVA

নোট: lighting, socket, motor, HVAC, lift, pump এবং emergency load আলাদা করে schedule করলে ফল আরও নির্ভরযোগ্য হবে।`
    );
  }

  // =====================================================
  // 27. SHORT CIRCUIT BASIC ESTIMATE
  // =====================================================

  function shortCircuit(text) {
    if (
      !text.includes("short circuit") &&
      !text.includes("short-circuit") &&
      !text.includes("শর্ট সার্কিট")
    ) {
      return null;
    }

    const n = parseNumbers(text);
    if (n.length < 2) return null;

    const voltage = n[0];
    const impedancePercent = n[1];

    const current = 100 / impedancePercent;
    const faultCurrent = current;

    return answer(
      "Basic Short-Circuit Estimate",
      `System Voltage = ${fmt(voltage)} V
Impedance = ${fmt(impedancePercent)}%

Per-unit fault multiplier ≈ ${fmt(100 / impedancePercent)}

এই হিসাব থেকে বাস্তব fault current নির্ণয় করা নিরাপদ নয়, কারণ source impedance, transformer rating, cable impedance, X/R ratio এবং network configuration দরকার।

Short-circuit protection design-এর জন্য proper fault study প্রয়োজন।`
    );
  }

  // =====================================================
  // 28. DC MOTOR / DC POWER
  // =====================================================

  function dcPower(text) {
    if (
      !text.includes("dc power") &&
      !text.includes("dc motor") &&
      !text.includes("ডিসি পাওয়ার") &&
      !text.includes("dc")
    ) {
      return null;
    }

    const n = parseNumbers(text);
    if (n.length < 2) return null;

    const V = n[0];
    const I = n[1];
    const P = V * I;

    return answer(
      "DC Power Calculator",
      `DC Voltage = ${fmt(V)} V
DC Current = ${fmt(I)} A

Power = V × I
P = ${fmt(P)} W
P = ${fmt(P / 1000)} kW`
    );
  }

  // =====================================================
  // 29. RESISTOR POWER
  // =====================================================

  function resistorPower(text) {
    if (
      !text.includes("resistor power") &&
      !text.includes("রেজিস্টর পাওয়ার")
    ) {
      return null;
    }

    const n = parseNumbers(text);
    if (n.length < 2) return null;

    const V = n[0];
    const R = n[1];

    const I = V / R;
    const P = (V * V) / R;

    return answer(
      "Resistor Power Rating",
      `Voltage = ${fmt(V)} V
Resistance = ${fmt(R)} Ω

Current = ${fmt(I)} A
Power = V² ÷ R
Power = ${fmt(P)} W

বাস্তবে calculated power-এর চেয়ে পর্যাপ্ত margin সহ resistor নির্বাচন করতে হয়।`
    );
  }

  // =====================================================
  // 30. FREQUENCY CONVERTER
  // =====================================================

  function hzToRpm(text) {
    if (
      !text.includes("hz to rpm") &&
      !text.includes("hz rpm")
    ) {
      return null;
    }

    const n = parseNumbers(text);
    if (n.length < 2) return null;

    const hz = n[0];
    const poles = n[1];
    const rpm = 120 * hz / poles;

    return answer(
      "Hz to RPM",
      `Frequency = ${fmt(hz)} Hz
Poles = ${fmt(poles)}

RPM = ${fmt(rpm)}`
    );
  }

  // =====================================================
  // MAIN ROUTER
  // =====================================================

  function calculate(text) {
    const t = clean(text);

    if (!t) return null;

    if (
      t === "help" ||
      t.includes("কি কি পার") ||
      t.includes("কি করতে পার") ||
      t.includes("সব calculator") ||
      t.includes("all calculator")
    ) {
      return help();
    }

    const calculators = [
      ohmsLaw,
      energyBill,
      voltageDrop,
      cableResistance,
      transformer,
      motorCurrent,
      motorRPM,
      generator,
      ups,
      batteryRequired,
      battery,
      solarBattery,
      solar,
      chargeController,
      capacitorCorrection,
      resistorSeries,
      resistorParallel,
      ledResistor,
      protection,
      singlePhase,
      threePhase,
      starDelta,
      frequencyPole,
      hzToRpm,
      loadSchedule,
      shortCircuit,
      resistorPower,
      dcPower,
      kvaKwKvar,
      powerCalculator
    ];

    for (const calculator of calculators) {
      try {
        const result = calculator(t);
        if (result) return result;
      } catch (error) {
        console.warn("Electrical calculator error:", error);
      }
    }

    return null;
  }

  // Public API
  window.ElectroTechUltimate = {
    calculate,
    help,
    version: "Ultimate-1.0"
  };

  // =====================================================
  // CHATBOT INTEGRATION
  // =====================================================

  const previousAnswer =
    typeof window.chatLocalAnswer === "function"
      ? window.chatLocalAnswer
      : null;

  window.chatLocalAnswer = function (message) {
    const result = calculate(message);

    if (result) return result;

    if (previousAnswer) {
      return previousAnswer(message);
    }

    return null;
  };

  // Optional alternative function
  window.electricalCalculator = calculate;

  console.log(
    "%c ElectroTechBD Ultimate Electrical Engine Loaded ",
    "background:#00d4ff;color:#001018;font-weight:bold;padding:5px"
  );
})();