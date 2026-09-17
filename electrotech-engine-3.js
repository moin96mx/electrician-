(() => {
  "use strict";

  const BRAND = "ElectroTechBD | ভোল্ট";

  const clean = v => String(v || "")
    .toLowerCase()
    .replace(/[০-৯]/g, d => "০১২৩৪৫৬৭৮৯".indexOf(d))
    .replace(/,/g, "")
    .replace(/[^\p{L}\p{N}.\-+*/()%\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  const has = (t, arr) => arr.some(x => t.includes(x));

  const num = (t, regexes) => {
    for (const r of regexes) {
      const m = t.match(r);
      if (m) return Number(m[1]);
    }
    return null;
  };

  const f = (n, d = 2) =>
    Number.isFinite(n)
      ? Number(n.toFixed(d)).toLocaleString("en-US")
      : "N/A";

  const title = t => `⚡ ${t}\n\n${BRAND}\n\n`;

  const warning = `

⚠️ সতর্কতা:

এগুলো preliminary calculation। Final design বা installation-এর আগে
qualified electrical engineer, manufacturer datasheet, applicable code,
cable derating, fault level, temperature এবং site condition যাচাই করুন।
লাইভ electrical system-এ কাজ করবেন না।
`;

  const voltage = t =>
    num(t, [
      /(\d+(?:\.\d+)?)\s*(?:v|volt|voltage|ভোল্ট|ভোল্টেজ)/i
    ]) || 230;

  const current = t =>
    num(t, [
      /(\d+(?:\.\d+)?)\s*(?:a|amp|ampere|amps|এম্পিয়ার|অ্যাম্পিয়ার)/i
    ]);

  const power = t =>
    num(t, [
      /(\d+(?:\.\d+)?)\s*(?:kw|কিলোওয়াট)/i,
      /(?:load|power|লোড|পাওয়ার)\s*(?:is|=|হল|ঃ|:)?\s*(\d+(?:\.\d+)?)/i
    ]);

  const pf = t =>
    num(t, [
      /(?:pf|power factor|পিএফ|পাওয়ার ফ্যাক্টর)\s*(?:is|=|হল|ঃ|:)?\s*(0?\.\d+|1(?:\.0+)?)/i
    ]) || 0.8;

  const phase3 = t => has(t, [
    "three phase",
    "3 phase",
    "3-phase",
    "threephase",
    "ত্রিফেজ",
    "থ্রি ফেজ"
  ]);

  const phaseVoltage = t => phase3(t) ? 400 : voltage(t);

  /*
  1. Apparent power
  */
  function apparentPower(t) {
    const p = power(t);
    const factor = pf(t);

    if (
      p === null ||
      !has(t, ["kva", "apparent", "অ্যাপারেন্ট", "কেভিএ"])
    ) return null;

    return `${title("kW থেকে Apparent Power")}

• Active Power: ${f(p)} kW
• Power Factor: ${f(factor)}

Formula:
kVA = kW ÷ PF

✅ Apparent Power: **${f(p / factor)} kVA**
${warning}`;
  }

  /*
  2. Power factor from kW and kVA
  */
  function calculatePF(t) {
    const kw = power(t);
    const kva = num(t, [
      /(\d+(?:\.\d+)?)\s*(?:kva|কেভিএ)/i
    ]);

    if (
      kw === null ||
      kva === null ||
      !has(t, ["pf", "power factor", "পিএফ", "পাওয়ার ফ্যাক্টর"])
    ) return null;

    const result = kw / kva;

    return `${title("Power Factor Calculation")}

• Active Power: ${f(kw)} kW
• Apparent Power: ${f(kva)} kVA

Formula:
PF = kW ÷ kVA

✅ Power Factor: **${f(result, 3)}**
${warning}`;
  }

  /*
  3. Reactive power
  */
  function reactivePower(t) {
    const kw = power(t);
    const factor = pf(t);

    if (
      kw === null ||
      !has(t, ["kvar", "reactive", "রিঅ্যাকটিভ", "রিঅ্যাক্টিভ"])
    ) return null;

    const kvar = kw * Math.tan(Math.acos(factor));

    return `${title("Reactive Power Calculation")}

• Active Power: ${f(kw)} kW
• Power Factor: ${f(factor)}

Formula:
kVAR = kW × tan(cos⁻¹ PF)

✅ Reactive Power: **${f(kvar)} kVAR**
${warning}`;
  }

  /*
  4. Three phase line current from kVA
  */
  function threePhaseKvaCurrent(t) {
    const kva = num(t, [
      /(\d+(?:\.\d+)?)\s*(?:kva|কেভিএ)/i
    ]);

    if (
      kva === null ||
      !phase3(t) ||
      !has(t, ["current", "amp", "কারেন্ট", "এম্পিয়ার"])
    ) return null;

    const v = voltage(t) || 400;
    const i = kva * 1000 / (Math.sqrt(3) * v);

    return `${title("Three Phase kVA থেকে Current")}

• Apparent Power: ${f(kva)} kVA
• Line Voltage: ${f(v)} V

Formula:
I = kVA × 1000 ÷ (√3 × V)

✅ Line Current: **${f(i)} A**
${warning}`;
  }

  /*
  5. Voltage drop from cable resistance
  */
  function voltageDrop(t) {
    const i = current(t);
    const length = num(t, [
      /(\d+(?:\.\d+)?)\s*(?:m|meter|মিটার)/i
    ]);

    const resistance = num(t, [
      /(?:resistance|রেজিস্ট্যান্স|রেজিস্টেন্স)\s*(?:is|=|হল|ঃ|:)?\s*(\d+(?:\.\d+)?)/i
    ]);

    if (
      i === null ||
      length === null ||
      resistance === null ||
      !has(t, ["drop", "voltage drop", "ভোল্টেজ ড্রপ"])
    ) return null;

    const drop = i * resistance * length;

    return `${title("Voltage Drop Calculation")}

• Current: ${f(i)} A
• Length: ${f(length)} meter
• Resistance: ${f(resistance, 6)} Ω/m

Formula:
Voltage Drop = Current × Resistance × Length

✅ Voltage Drop: **${f(drop)} V**
${warning}`;
  }

  /*
  6. Battery backup time
  */
  function batteryBackup(t) {
    const ah = num(t, [
      /(\d+(?:\.\d+)?)\s*(?:ah|amp hour|অ্যাম্প আওয়ার)/i
    ]);

    const batteryV = num(t, [
      /(\d+(?:\.\d+)?)\s*(?:v|volt|ভোল্ট)/i
    ]);

    const loadW = num(t, [
      /(\d+(?:\.\d+)?)\s*(?:w|watt|ওয়াট)/i
    ]);

    const efficiency = num(t, [
      /(?:efficiency|eff|দক্ষতা)\s*(?:is|=|হল|ঃ|:)?\s*(\d+(?:\.\d+)?)/i
    ]) || 85;

    if (
      ah === null ||
      batteryV === null ||
      loadW === null ||
      !has(t, ["battery", "backup", "ব্যাটারি", "ব্যাকআপ"])
    ) return null;

    const usable = batteryV * ah * (efficiency / 100);
    const hours = usable / loadW;

    return `${title("Battery Backup Estimate")}

• Battery: ${f(batteryV)} V
• Capacity: ${f(ah)} Ah
• Load: ${f(loadW)} W
• Efficiency assumed: ${f(efficiency)}%

Formula:
Backup Time = Battery Voltage × Ah × Efficiency ÷ Load

✅ Estimated Backup: **${f(hours)} ঘণ্টা**

বাস্তবে battery age, temperature, discharge rate,
inverter efficiency এবং depth of discharge-এর কারণে সময় কমতে পারে।
${warning}`;
  }

  /*
  7. UPS capacity
  */
  function upsSize(t) {
    const w = num(t, [
      /(\d+(?:\.\d+)?)\s*(?:w|watt|ওয়াট)/i
    ]);

    const pfValue = pf(t);

    if (
      w === null ||
      !has(t, ["ups", "ইউপিএস"])
    ) return null;

    const kva = w / (1000 * pfValue);
    const recommended = kva * 1.25;

    return `${title("UPS Capacity Estimate")}

• Load: ${f(w)} W
• Assumed PF: ${f(pfValue)}

Calculated UPS capacity:
**${f(kva)} kVA**

২৫% reserve ধরে suggested minimum:
✅ **${f(recommended)} kVA**

UPS selection-এর সময় startup load, battery backup,
surge capacity এবং future expansion যাচাই করতে হবে।
${warning}`;
  }

  /*
  8. Solar panel estimate
  */
  function solarSize(t) {
    const daily = num(t, [
      /(\d+(?:\.\d+)?)\s*(?:kwh|unit|ইউনিট)/i
    ]);

    const sun = num(t, [
      /(\d+(?:\.\d+)?)\s*(?:sun hour|sun hours|রোদ ঘণ্টা|সান আওয়ার)/i
    ]) || 4;

    if (
      daily === null ||
      !has(t, ["solar", "সোলার"])
    ) return null;

    const systemLoss = 0.8;
    const kw = daily / (sun * systemLoss);

    return `${title("Solar System Size Estimate")}

• Daily Energy Requirement: ${f(daily)} kWh
• Sun Hours assumed: ${f(sun)} ঘণ্টা
• System efficiency assumed: 80%

Formula:
Solar Size = Daily Energy ÷ (Sun Hours × Efficiency)

✅ Estimated Solar Capacity: **${f(kw)} kW**

Battery, inverter, panel orientation, shading,
seasonal sunlight এবং backup requirement আলাদাভাবে যাচাই করুন।
${warning}`;
  }

  /*
  9. Diversity factor
  */
  function diversity(t) {
    const connected = power(t);

    const demand = num(t, [
      /(?:demand|maximum demand|ডিমান্ড|সর্বোচ্চ লোড)\s*(?:is|=|হল|ঃ|:)?\s*(\d+(?:\.\d+)?)/i
    ]);

    if (
      connected === null ||
      demand === null ||
      !has(t, ["diversity", "ডাইভারসিটি"])
    ) return null;

    const factor = connected / demand;

    return `${title("Diversity Factor Calculation")}

• Connected Load: ${f(connected)} kW
• Maximum Demand: ${f(demand)} kW

Formula:
Diversity Factor = Connected Load ÷ Maximum Demand

✅ Diversity Factor: **${f(factor, 3)}**
${warning}`;
  }

  /*
  10. Frequency and synchronous speed
  */
  function motorSpeed(t) {
    const poles = num(t, [
      /(\d+)\s*(?:pole|poles|পোল)/i
    ]);

    const hz = num(t, [
      /(\d+(?:\.\d+)?)\s*(?:hz|hertz|হার্টজ)/i
    ]) || 50;

    if (
      poles === null ||
      !has(t, ["speed", "rpm", "motor speed", "স্পিড", "rpm"])
    ) return null;

    const rpm = 120 * hz / poles;

    return `${title("Motor Synchronous Speed")}

• Frequency: ${f(hz)} Hz
• Number of poles: ${f(poles)}

Formula:
Ns = 120 × Frequency ÷ Number of Poles

✅ Synchronous Speed: **${f(rpm, 0)} RPM**

বাস্তব induction motor-এর actual speed slip-এর কারণে
synchronous speed থেকে কিছুটা কম হয়।
${warning}`;
  }

  /*
  11. Resistor series and parallel
  */
  function resistor(t) {
    const a = num(t, [
      /(?:r1|resistor 1|প্রথম রেজিস্টর)\s*(?:=|is|হল)?\s*(\d+(?:\.\d+)?)/i
    ]);

    const b = num(t, [
      /(?:r2|resistor 2|দ্বিতীয় রেজিস্টর)\s*(?:=|is|হল)?\s*(\d+(?:\.\d+)?)/i
    ]);

    if (
      a === null ||
      b === null ||
      !has(t, ["resistor", "resistance", "রেজিস্টর", "রেজিস্ট্যান্স"])
    ) return null;

    const series = a + b;
    const parallel = (a * b) / (a + b);

    return `${title("Resistor Calculation")}

• R1: ${f(a)} Ω
• R2: ${f(b)} Ω

Series:
R = R1 + R2

✅ Series Resistance: **${f(series)} Ω**

Parallel:
R = (R1 × R2) ÷ (R1 + R2)

✅ Parallel Resistance: **${f(parallel)} Ω**
${warning}`;
  }

  /*
  12. Ohm's law
  */
  function ohm(t) {
    const v = voltage(t);
    const i = current(t);

    if (
      i === null ||
      !has(t, ["ohm", "ohms law", "ওহম", "ওহমের সূত্র"])
    ) return null;

    return `${title("Ohm's Law")}

Formula:

V = I × R
I = V ÷ R
R = V ÷ I

• Voltage: ${f(v)} V
• Current: ${f(i)} A

যদি Resistance জানা থাকে, তাহলে:

R = V ÷ I

বর্তমান তথ্য অনুযায়ী resistance নির্ণয়ের জন্য
voltage ও current দুটোই ব্যবহার করা হয়েছে।

✅ Estimated Resistance: **${f(v / i)} Ω**
${warning}`;
  }

  /*
  13. Main router
  */
  function engine(message) {
    const t = clean(message);

    return (
      batteryBackup(t) ||
      solarSize(t) ||
      upsSize(t) ||
      motorSpeed(t) ||
      diversity(t) ||
      resistor(t) ||
      ohm(t) ||
      voltageDrop(t) ||
      calculatePF(t) ||
      reactivePower(t) ||
      threePhaseKvaCurrent(t) ||
      apparentPower(t) ||
      `⚡ ${BRAND}

আপনার প্রশ্নটি আরও নির্দিষ্ট করুন।

উদাহরণ:

• 1000W load-এর battery backup কত?
• 2kW solar system কত panel লাগবে?
• 1000W load-এর জন্য UPS কত kVA?
• 4 pole motor-এর speed কত RPM?
• R1 10 ohm এবং R2 20 ohm parallel হলে কত?
• 20kW এবং 25kVA থেকে PF কত?
• 10A current ও 230V হলে resistance কত?

${warning}`
    );
  }

  window.ElectroTechEngine3 = Object.freeze({
    answer: engine,
    version: "3.0.0"
  });

  /*
  Existing chatbot-এর সঙ্গে connection
  */
  if (
    typeof window.chatLocalAnswer === "function" &&
    !window.__ElectroTechEngine3Attached
  ) {
    const previous = window.chatLocalAnswer;

    window.chatLocalAnswer = function(message) {
      const t = clean(message);

      const keys = [
        "battery",
        "ব্যাটারি",
        "solar",
        "সোলার",
        "ups",
        "ইউপিএস",
        "resistor",
        "রেজিস্টর",
        "ohm",
        "ওহম",
        "rpm",
        "speed",
        "স্পিড",
        "diversity",
        "ডাইভারসিটি",
        "kvar",
        "reactive",
        "রিঅ্যাকটিভ",
        "apparent",
        "কেভিএ",
        "voltage drop",
        "ভোল্টেজ ড্রপ"
      ];

      if (has(t, keys)) {
        return engine(message);
      }

      return previous(message);
    };

    window.__ElectroTechEngine3Attached = true;
  }

  console.log("ElectroTechBD Engine 3 loaded.");
})();