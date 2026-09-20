

(() => {
  "use strict";

  const CONFIG = {
    brand: "ElectroTechBD",
    assistant: "ভোল্ট",
    phone: "+8801710830391",
    website: "https://electrotechbd.xyz",
    language: "Bangla",
    maxHistory: 20
  };

  const $ = (value) => String(value || "");

  function normalize(value) {
    return $(value)
      .toLowerCase()
      .replace(/[০-৯]/g, d => "০১২৩৪৫৬৭৮৯".indexOf(d))
      .replace(/,/g, "")
      .replace(/[^\p{L}\p{N}.\-+*/=()%\s]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function has(text, words) {
    return words.some(word => text.includes(word));
  }

  function numberAfter(text, patterns) {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return Number(match[1]);
    }

    return null;
  }

  function fmt(value, digits = 2) {
    if (!Number.isFinite(value)) return "নির্ণয় করা যায়নি";

    return Number(value.toFixed(digits)).toLocaleString("en-US");
  }

  function safety() {
    return `

⚠️ গুরুত্বপূর্ণ নিরাপত্তা নির্দেশনা:

এই calculation preliminary guideline হিসেবে ব্যবহার করুন।
বাস্তব installation-এর আগে cable length, installation method,
ambient temperature, derating factor, fault level, manufacturer
datasheet এবং applicable electrical standard যাচাই করতে হবে।

লাইভ electrical line-এ কাজ করবেন না।
Supply isolate, lockout/tagout এবং test-before-touch অনুসরণ করুন।
চূড়ান্ত কাজ qualified electrician বা electrical engineer দিয়ে করান।
`;
  }

  function header(title) {
    return `⚡ ${title}

ElectroTechBD | ভোল্ট Electrical Assistant

`;
  }

  function extractPower(text) {
    return numberAfter(text, [
      /(\d+(?:\.\d+)?)\s*(?:kw|কিলোওয়াট)/i,
      /(?:power|load|লোড|পাওয়ার)\s*(?:is|=|হল|ঃ|:)?\s*(\d+(?:\.\d+)?)/i,
      /(\d+(?:\.\d+)?)\s*(?:w|ওয়াট)/i
    ]);
  }

  function extractVoltage(text) {
    return numberAfter(text, [
      /(\d+(?:\.\d+)?)\s*(?:v|volt|voltage|ভোল্ট|ভোল্টেজ)/i,
      /(?:voltage|volt|ভোল্টেজ|ভোল্ট)\s*(?:is|=|হল|ঃ|:)?\s*(\d+(?:\.\d+)?)/i
    ]);
  }

  function extractCurrent(text) {
    return numberAfter(text, [
      /(\d+(?:\.\d+)?)\s*(?:a|amp|ampere|amps|অ্যাম্পিয়ার|এম্পিয়ার)/i,
      /(?:current|কারেন্ট)\s*(?:is|=|হল|ঃ|:)?\s*(\d+(?:\.\d+)?)/i
    ]);
  }

  function extractPF(text) {
    return numberAfter(text, [
      /(?:pf|power factor|পাওয়ার ফ্যাক্টর|পিএফ)\s*(?:is|=|হল|ঃ|:)?\s*(0?\.\d+|1(?:\.0+)?)/i
    ]);
  }

  function extractHP(text) {
    return numberAfter(text, [
      /(\d+(?:\.\d+)?)\s*(?:hp|horse power|হর্স পাওয়ার)/i
    ]);
  }

  function extractKVA(text) {
    return numberAfter(text, [
      /(\d+(?:\.\d+)?)\s*(?:kva|কেভিএ)/i
    ]);
  }

  function isThreePhase(text) {
    return has(text, [
      "three phase",
      "3 phase",
      "3-phase",
      "threephase",
      "ত্রিফেজ",
      "থ্রি ফেজ",
      "থ্রি-ফেজ"
    ]);
  }

  function getVoltage(text, threePhase = false) {
    return extractVoltage(text) || (threePhase ? 400 : 230);
  }

  function getPF(text) {
    return extractPF(text) || 0.8;
  }

  function calculateCurrent(text) {
    const power = extractPower(text);
    const voltage = getVoltage(text, isThreePhase(text));
    const pf = getPF(text);
    const threePhase = isThreePhase(text);

    if (power === null) return null;

    let watts = power;

    if (
      has(text, ["kw", "কিলোওয়াট"]) &&
      !has(text, ["watt", "ওয়াট"])
    ) {
      watts = power * 1000;
    }

    if (has(text, ["watt", "ওয়াট"]) && !has(text, ["kw", "কিলোওয়াট"])) {
      watts = power;
    }

    const current = threePhase
      ? watts / (Math.sqrt(3) * voltage * pf)
      : watts / (voltage * pf);

    return `${header("Load Current Calculation")}
ধরা হয়েছে:

• System: ${threePhase ? "Three Phase" : "Single Phase"}
• Power: ${fmt(watts / 1000)} kW
• Voltage: ${fmt(voltage)} V
• Power Factor: ${fmt(pf, 2)}

Formula:

${threePhase
  ? "I = P / (√3 × V × PF)"
  : "I = P / (V × PF)"}

আনুমানিক Load Current:

✅ **${fmt(current)} Ampere**

নোট:
Breaker ও cable selection-এর জন্য starting current,
derating factor এবং continuous load বিবেচনা করতে হবে।
${safety()}`;
  }

  function calculatePowerFromCurrent(text) {
    const current = extractCurrent(text);
    const voltage = getVoltage(text, isThreePhase(text));
    const pf = getPF(text);
    const threePhase = isThreePhase(text);

    if (current === null) return null;

    const watts = threePhase
      ? Math.sqrt(3) * voltage * current * pf
      : voltage * current * pf;

    return `${header("Current থেকে Power Calculation")}

• Current: ${fmt(current)} A
• Voltage: ${fmt(voltage)} V
• Power Factor: ${fmt(pf, 2)}
• System: ${threePhase ? "Three Phase" : "Single Phase"}

আনুমানিক Power:

✅ **${fmt(watts / 1000)} kW**

Formula:

${threePhase
  ? "P = √3 × V × I × PF"
  : "P = V × I × PF"}

${safety()}`;
  }

  function calculateKVA(text) {
    const kw = extractPower(text);
    const pf = getPF(text);

    if (
      kw === null ||
      !has(text, ["kva", "কেভিএ", "power factor", "pf", "পিএফ"])
    ) {
      return null;
    }

    const kva = kw / pf;

    return `${header("kW থেকে kVA Calculation")}

• Power: ${fmt(kw)} kW
• Power Factor: ${fmt(pf, 2)}

Formula:

**kVA = kW / Power Factor**

Result:

✅ **${fmt(kva)} kVA**

Transformer বা generator sizing-এর সময় motor starting,
future expansion এবং actual load profile যাচাই করতে হবে।
${safety()}`;
  }

  function calculateKWFromKVA(text) {
    const kva = extractKVA(text);
    const pf = getPF(text);

    if (kva === null) return null;

    const kw = kva * pf;

    return `${header("kVA থেকে kW Calculation")}

• Apparent Power: ${fmt(kva)} kVA
• Power Factor: ${fmt(pf, 2)}

Formula:

**kW = kVA × PF**

Result:

✅ **${fmt(kw)} kW**
${safety()}`;
  }

  function calculateHP(text) {
    const hp = extractHP(text);

    if (hp !== null) {
      return `${header("HP থেকে kW Calculation")}

Formula:

**1 HP ≈ 0.746 kW**

• Motor Power: ${fmt(hp)} HP

Result:

✅ **${fmt(hp * 0.746)} kW**

বাস্তব motor input power বের করতে efficiency ও power factor
বিবেচনা করতে হবে।
${safety()}`;
    }

    const kw = extractPower(text);

    if (
      kw !== null &&
      has(text, ["hp", "horse", "হর্স"])
    ) {
      return `${header("kW থেকে HP Calculation")}

Formula:

**1 kW ≈ 1.341 HP**

• Power: ${fmt(kw)} kW

Result:

✅ **${fmt(kw * 1.341)} HP**
${safety()}`;
    }

    return null;
  }

  function calculateEnergy(text) {
    const power = extractPower(text);

    const hours = numberAfter(text, [
      /(\d+(?:\.\d+)?)\s*(?:hour|hours|ঘণ্টা|ঘন্টা)/i,
      /(\d+(?:\.\d+)?)\s*h\b/i
    ]);

    if (power === null || hours === null) return null;

    const energy = power * hours;

    return `${header("Energy Consumption Calculation")}

• Load: ${fmt(power)} kW
• Running Time: ${fmt(hours)} ঘণ্টা

Formula:

**Energy = Power × Time**

Result:

✅ **${fmt(energy)} kWh / Unit**

অর্থাৎ এই load ${fmt(hours)} ঘণ্টা চললে আনুমানিক
${fmt(energy)} ইউনিট electricity ব্যবহার করবে।
${safety()}`;
  }

  function calculateBill(text) {
    const units = numberAfter(text, [
      /(\d+(?:\.\d+)?)\s*(?:unit|units|kwh|ইউনিট)/i
    ]);

    const rate = numberAfter(text, [
      /(?:rate|প্রতি ইউনিট|রেট)\s*(?:is|=|হল|ঃ|:)?\s*(\d+(?:\.\d+)?)/i,
      /(\d+(?:\.\d+)?)\s*(?:টাকা|tk|taka)\s*(?:per|প্রতি)/i
    ]);

    if (units === null || rate === null) return null;

    const bill = units * rate;

    return `${header("Electricity Bill Estimation")}

• Consumption: ${fmt(units)} Unit
• Rate: ${fmt(rate)} টাকা/Unit

আনুমানিক Energy Charge:

✅ **${fmt(bill)} টাকা**

নোট:
বাস্তব bill-এ demand charge, VAT, meter charge,
service charge এবং slab rate থাকতে পারে।
${safety()}`;
  }

  function calculateVoltageDrop(text) {
    const current = extractCurrent(text);

    const length = numberAfter(text, [
      /(\d+(?:\.\d+)?)\s*(?:m|meter|মিটার)/i
    ]);

    const resistance = numberAfter(text, [
      /(?:resistance|রেজিস্ট্যান্স|রেজিসট্যান্স)\s*(?:is|=|হল|ঃ|:)?\s*(\d+(?:\.\d+)?)/i
    ]);

    if (current === null || length === null || resistance === null) {
      return null;
    }

    const drop = current * resistance * length;

    return `${header("Voltage Drop Estimation")}

• Current: ${fmt(current)} A
• Cable Length: ${fmt(length)} meter
• Resistance per meter: ${fmt(resistance, 6)} Ω

Basic Formula:

**Voltage Drop = Current × Resistance × Length**

Estimated Voltage Drop:

✅ **${fmt(drop)} Volt**

নোট:
বাস্তব voltage drop calculation-এ conductor material,
cross-sectional area, AC impedance, power factor এবং
single/three phase arrangement বিবেচনা করতে হয়।
${safety()}`;
  }

  function capacitorKVAR(text) {
    const kw = extractPower(text);

    const pf1 = numberAfter(text, [
      /(?:old pf|আগের pf|পুরোনো pf)\s*(?:is|=|হল|ঃ|:)?\s*(0?\.\d+|1(?:\.0+)?)/i
    ]);

    const pf2 = numberAfter(text, [
      /(?:new pf|target pf|নতুন pf|টার্গেট pf)\s*(?:is|=|হল|ঃ|:)?\s*(0?\.\d+|1(?:\.0+)?)/i
    ]);

    if (kw === null || pf1 === null || pf2 === null) {
      return null;
    }

    const kvar =
      kw *
      (Math.tan(Math.acos(pf1)) - Math.tan(Math.acos(pf2)));

    return `${header("Power Factor Correction Calculation")}

• Active Power: ${fmt(kw)} kW
• Existing PF: ${fmt(pf1, 2)}
• Target PF: ${fmt(pf2, 2)}

Formula:

**kVAR = kW × [tan(cos⁻¹ PF₁) − tan(cos⁻¹ PF₂)]**

প্রয়োজনীয় Capacitor Bank:

✅ **${fmt(kvar)} kVAR**

এটি preliminary result। Harmonic level, detuned reactor,
load variation এবং capacitor switching arrangement যাচাই করতে হবে।
${safety()}`;
  }

  function breakerSuggestion(text) {
    const current = extractCurrent(text);

    if (current === null) return null;

    const possible = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 400, 630];
    const suggestion = possible.find(value => value >= current * 1.25);

    return `${header("Preliminary Breaker Rating Guide")}

• Calculated Load Current: ${fmt(current)} A

সম্ভাব্য next standard breaker rating:

✅ **${suggestion || "Site/design অনুযায়ী নির্বাচন করতে হবে"} A**

কিন্তু শুধু load current দেখে breaker নির্বাচন করা যাবে না।

অবশ্যই যাচাই করতে হবে:

• Cable ampacity
• Installation method
• Short-circuit level
• Breaking capacity
• Ambient temperature
• Starting current
• Selectivity
• Coordination
• Manufacturer recommendation

${safety()}`;
  }

  function answerMCB() {
    return `${header("MCB সম্পর্কে তথ্য")}

MCB-এর পূর্ণরূপ:

**Miniature Circuit Breaker**

MCB সাধারণত:

• Overload protection দেয়
• Short-circuit protection দেয়
• Small circuit protection-এ ব্যবহৃত হয়

MCB সাধারণত earth leakage protection দেয় না।

MCB Curve:

• B Curve: Resistive ও light load
• C Curve: Fan, small motor ও moderate inrush
• D Curve: High inrush industrial load

MCB নির্বাচন করতে হবে:

• Load current
• Cable size
• Fault current
• Breaking capacity
• Voltage
• Load type

${safety()}`;
  }

  function answerMCCB() {
    return `${header("MCCB সম্পর্কে তথ্য")}

MCCB = Molded Case Circuit Breaker

MCCB সাধারণত MDB, industrial feeder এবং high-current circuit-এ ব্যবহৃত হয়।

MCCB-এর সুবিধা:

• High current rating
• Higher breaking capacity
• Adjustable trip setting
• Thermal-magnetic trip
• Electronic trip option
• Auxiliary contact
• Shunt trip
• Undervoltage release

MCCB নির্বাচন করার সময় cable protection এবং short-circuit coordination অত্যন্ত গুরুত্বপূর্ণ।

${safety()}`;
  }

  function answerRCCB() {
    return `${header("RCCB সম্পর্কে তথ্য")}

RCCB = Residual Current Circuit Breaker

RCCB earth leakage বা residual current detect করে trip করে।

RCCB:

• Earth leakage protection দেয়
• Overload protection-এর বিকল্প নয়
• Short-circuit protection-এর বিকল্প নয়
• সাধারণত MCB/MCCB-এর সঙ্গে ব্যবহার করা হয়

RCCB বারবার trip করলে পরীক্ষা করুন:

• Faulty appliance
• Moisture
• Neutral-earth mixing
• Cable insulation
• Leakage current
• Wrong wiring

${safety()}`;
  }

  function answerRCBO() {
    return `${header("RCBO সম্পর্কে তথ্য")}

RCBO = Residual Current operated Circuit Breaker with Overcurrent protection

RCBO একইসঙ্গে দেয়:

1. Overload protection
2. Short-circuit protection
3. Earth leakage protection

Individual circuit-এর জন্য RCBO ব্যবহার করলে fault হলে
অন্যান্য circuit সচল থাকতে পারে।

Socket, bathroom, kitchen, outdoor এবং sensitive circuit-এ
RCBO ব্যবহার করা যেতে পারে।

${safety()}`;
  }

  function answerCable() {
    return `${header("Cable Size নির্বাচন করার নিয়ম")}

Cable size নির্ধারণের সময় বিবেচনা করতে হবে:

• Load current
• Single phase / three phase
• Cable length
• Copper / aluminium
• PVC / XLPE insulation
• Conduit / tray / buried installation
• Ambient temperature
• Cable grouping
• Derating factor
• Voltage drop
• Short-circuit withstand
• Protective device rating

শুধু “কত Ampere load” দেখে cable size নির্বাচন করা নিরাপদ নয়।

আপনি যদি load, voltage, phase এবং cable length দেন,
তাহলে preliminary calculation করা যাবে।

${safety()}`;
  }

  function answerEarthing() {
    return `${header("Earthing সম্পর্কে তথ্য")}

Earthing fault current-এর জন্য low-impedance path তৈরি করে।

Earthing system-এ থাকতে পারে:

• Earth electrode
• Earth conductor
• Earth bar
• Main earthing terminal
• Protective bonding
• Equipotential bonding
• Earth pit

Earthing-এর মান নির্ভর করে:

• Soil condition
• System type
• Electrode arrangement
• Project specification
• Applicable standard
• Equipment requirement

Earth resistance-এর একটি নির্দিষ্ট value সব installation-এর জন্য প্রযোজ্য নয়।

${safety()}`;
  }

  function answerMotor() {
    return `${header("Motor সম্পর্কে তথ্য")}

Motor circuit-এ সাধারণত থাকতে পারে:

Supply → MCCB/MCB → Contactor → OLR → Motor

Contactor motor ON/OFF করে।

OLR motor overload protection দেয়।

MCCB/MCB short-circuit protection দেয়।

Motor selection-এর সময় বিবেচনা করতে হয়:

• Motor kW/HP
• Full Load Current
• Starting current
• Duty
• Efficiency
• Power factor
• DOL/Star-Delta/VFD starter
• Cable size
• Overload relay setting
• Short-circuit protection

OLR short-circuit protection-এর বিকল্প নয়।

${safety()}`;
  }

  function answerTransformer() {
    return `${header("Transformer সম্পর্কে তথ্য")}

Transformer electromagnetic induction-এর মাধ্যমে AC voltage
step-up অথবা step-down করে।

Transformer sizing-এর সময় বিবেচনা করতে হয়:

• Required kVA
• Maximum demand
• Diversity factor
• Future expansion
• Motor starting current
• Harmonics
• Cooling
• Voltage regulation
• Fault level
• Installation environment

Oil transformer-এ conservator, breather, oil এবং cooling system থাকতে পারে।

${safety()}`;
  }

  function answerTroubleshooting() {
    return `${header("Electrical Troubleshooting Guide")}

কোনো electrical fault হলে:

1. Supply isolate করুন
2. Lockout/tagout করুন
3. Visual inspection করুন
4. Burn mark বা burning smell দেখুন
5. Loose terminal পরীক্ষা করুন
6. Moisture পরীক্ষা করুন
7. Voltage absence test করুন
8. Continuity test করুন
9. Insulation resistance test করুন
10. Neutral-earth fault পরীক্ষা করুন
11. Leakage current পরীক্ষা করুন
12. Cable ও breaker rating মিলিয়ে দেখুন
13. Root cause ঠিক করুন
14. তারপর পুনরায় energize করুন

Breaker বারবার trip করলে বারবার reset করবেন না।

${safety()}`;
  }

  function fallback() {
    return `${header("আরও তথ্য প্রয়োজন")}

আপনার প্রশ্নটি একটু বিস্তারিত লিখুন।

যেমন:

• 5 kW load-এর current কত?
• 10 HP motor-এর current কত?
• 3 phase motor-এর cable size কী?
• 100 kVA transformer-এর load কত?
• RCCB বারবার trip করছে কেন?
• 32A MCB-এর জন্য cable size কত?
• 20 unit electricity bill কত?
• Power factor 0.75 থেকে 0.95 করতে capacitor কত kVAR লাগবে?

আপনি চাইলে Bangla, English অথবা Banglish-এ প্রশ্ন করতে পারেন।

${safety()}`;
  }

  function electricalAnswer(message) {
    const text = normalize(message);

    if (!text) {
      return `${header("স্বাগতম")}

আমি ভোল্ট, ElectroTechBD-এর Electrical Assistant।

আপনি electrical calculation, protection, wiring,
motor, transformer, generator, cable এবং troubleshooting
সম্পর্কে প্রশ্ন করতে পারেন।`;
    }

    if (has(text, ["mcb", "এমসিবি"])) {
      return answerMCB();
    }

    if (has(text, ["mccb", "এমসিসিবি"])) {
      return answerMCCB();
    }

    if (has(text, ["rccb", "আরসিসিবি"])) {
      return answerRCCB();
    }

    if (has(text, ["rcbo", "আরসিবিও"])) {
      return answerRCBO();
    }

    if (
      has(text, [
        "cable size",
        "wire size",
        "ক্যাবল সাইজ",
        "তার কত",
        "sqmm",
        "কেবল সাইজ"
      ])
    ) {
      return answerCable();
    }

    if (
      has(text, [
        "earthing",
        "earth pit",
        "আর্থিং",
        "গ্রাউন্ডিং"
      ])
    ) {
      return answerEarthing();
    }

    if (
      has(text, [
        "motor",
        "মোটর",
        "contactor",
        "olr",
        "overload relay"
      ])
    ) {
      return answerMotor();
    }

    if (
      has(text, [
        "transformer",
        "ট্রান্সফরমার"
      ])
    ) {
      return answerTransformer();
    }

    if (
      has(text, [
        "trip",
        "tripping",
        "short circuit",
        "শর্ট সার্কিট",
        "বারবার বন্ধ",
        "fault",
        "ফল্ট"
      ])
    ) {
      return answerTroubleshooting();
    }

    const capacitor = capacitorKVAR(text);
    if (capacitor) return capacitor;

    const bill = calculateBill(text);
    if (bill) return bill;

    const energy = calculateEnergy(text);
    if (energy) return energy;

    const voltageDrop = calculateVoltageDrop(text);
    if (voltageDrop) return voltageDrop;

    const hp = calculateHP(text);
    if (hp) return hp;

    const kvaToKw = calculateKWFromKVA(text);
    if (kvaToKw) return kvaToKw;

    const kva = calculateKVA(text);
    if (kva) return kva;

    if (
      has(text, [
        "breaker rating",
        "mcb rating",
        "কত amp breaker",
        "ব্রেকার কত",
        "breaker কত"
      ])
    ) {
      const breaker = breakerSuggestion(text);
      if (breaker) return breaker;
    }

    if (
      has(text, [
        "power থেকে current",
        "load current",
        "current কত",
        "কারেন্ট কত",
        "লোড কারেন্ট",
        "kw current",
        "কিলোওয়াট কারেন্ট"
      ])
    ) {
      const current = calculateCurrent(text);
      if (current) return current;
    }

    if (
      has(text, [
        "current থেকে power",
        "amp থেকে power",
        "কারেন্ট থেকে পাওয়ার",
        "ampere থেকে kw",
        "amp দিয়ে power"
      ])
    ) {
      const power = calculatePowerFromCurrent(text);
      if (power) return power;
    }

    if (
      has(text, [
        "power",
        "load",
        "লোড",
        "পাওয়ার",
        "kw",
        "কিলোওয়াট"
      ])
    ) {
      const current = calculateCurrent(text);
      if (current) return current;
    }

    return fallback();
  }

  window.ElectroTechAI = {
    answer: electricalAnswer,
    config: CONFIG
  };

  if (
    typeof window.chatLocalAnswer === "function" &&
    !window.__ElectroTechAdvancedLoaded
  ) {
    const oldAnswer = window.chatLocalAnswer;

    window.chatLocalAnswer = function(message) {
      const text = normalize(message);

      const electricalWords = [
        "mcb",
        "mccb",
        "rccb",
        "rcbo",
        "cable",
        "wire",
        "voltage",
        "current",
        "power",
        "load",
        "kw",
        "kva",
        "hp",
        "motor",
        "transformer",
        "generator",
        "earthing",
        "earth",
        "breaker",
        "contactor",
        "relay",
        "olr",
        "ফেজ",
        "ভোল্ট",
        "কারেন্ট",
        "পাওয়ার",
        "লোড",
        "মোটর",
        "ক্যাবল",
        "আর্থিং",
        "ব্রেকার",
        "ট্রান্সফরমার"
      ];

      if (has(text, electricalWords)) {
        return electricalAnswer(message);
      }

      return oldAnswer(message);
    };

    window.__ElectroTechAdvancedLoaded = true;
  }

  console.log(
    "ElectroTechBD Advanced Bangla Electrical Assistant Loaded Successfully."
  );
})();