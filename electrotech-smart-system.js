

(() => {
  "use strict";

  if (window.__ElectroTechSmartSystemLoaded) return;
  window.__ElectroTechSmartSystemLoaded = true;

  const BOT = "ভোল্ট";

  function normalize(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[০-৯]/g, d => "০১২৩৪৫৬৭৮৯".indexOf(d))
      .replace(/,/g, "")
      .trim();
  }

  function numbers(text) {
    return normalize(text)
      .match(/-?\d+(\.\d+)?/g)
      ?.map(Number) || [];
  }

  function f(value, digits = 2) {
    if (!Number.isFinite(value)) return "হিসাব করা যাচ্ছে না";
    return Number(value.toFixed(digits)).toLocaleString("en-US");
  }

  function result(title, text, warning = true) {
    let output = `⚡ ${title}\n\n${text}`;

    if (warning) {
      output +=
        "\n\n⚠️ নিরাপত্তা সতর্কতা: এটি শিক্ষামূলক ও preliminary হিসাব। বাস্তব electrical কাজের আগে qualified electrician/engineer-এর পরামর্শ নিন।";
    }

    return output;
  }

  const equipmentList = [
    { names: ["fan", "ফ্যান"], watt: 75, label: "ফ্যান" },
    { names: ["ceiling fan", "সিলিং ফ্যান"], watt: 75, label: "সিলিং ফ্যান" },
    { names: ["light", "লাইট", "bulb", "বাল্ব"], watt: 15, label: "লাইট" },
    { names: ["led", "led light", "এলইডি"], watt: 12, label: "LED Light" },
    { names: ["tv", "টিভি", "television"], watt: 100, label: "TV" },
    { names: ["fridge", "ফ্রিজ", "refrigerator"], watt: 250, label: "ফ্রিজ" },
    { names: ["ac", "এসি", "air conditioner"], watt: 1500, label: "AC" },
    { names: ["iron", "ইস্ত্রি"], watt: 1000, label: "ইস্ত্রি" },
    { names: ["rice cooker", "রাইস কুকার"], watt: 700, label: "Rice Cooker" },
    { names: ["computer", "কম্পিউটার", "pc"], watt: 250, label: "Computer" },
    { names: ["laptop", "ল্যাপটপ"], watt: 65, label: "Laptop" },
    { names: ["router", "রাউটার"], watt: 15, label: "Router" },
    { names: ["pump", "পাম্প", "water pump"], watt: 750, label: "Water Pump" },
    { names: ["microwave", "মাইক্রোওয়েভ"], watt: 1200, label: "Microwave" },
    { names: ["washing machine", "ওয়াশিং মেশিন"], watt: 500, label: "Washing Machine" },
    { names: ["heater", "হিটার"], watt: 1500, label: "Heater" },
    { names: ["oven", "ওভেন"], watt: 1800, label: "Oven" },
    { names: ["charger", "চার্জার"], watt: 20, label: "Charger" },
    { names: ["exhaust fan", "এক্সহস্ট ফ্যান"], watt: 40, label: "Exhaust Fan" }
  ];

  function findEquipment(text) {
    return equipmentList.find(item =>
      item.names.some(name => text.includes(name))
    );
  }

  function smartLoad(text) {
    const t = normalize(text);

    if (
      !t.includes("load") &&
      !t.includes("লোড") &&
      !t.includes("বাসায়") &&
      !t.includes("বাড়িতে") &&
      !t.includes("equipment") &&
      !t.includes("ফ্যান") &&
      !t.includes("লাইট")
    ) {
      return null;
    }

    const found = [];
    let total = 0;

    for (const item of equipmentList) {
      for (const name of item.names) {
        if (t.includes(name)) {
          const before = t.split(name)[0];
          const matches = before.match(/(\d+)\s*$/);
          const quantity = matches ? Number(matches[1]) : 1;

          const already = found.find(x => x.label === item.label);

          if (!already) {
            found.push({
              label: item.label,
              quantity,
              watt: item.watt,
              subtotal: quantity * item.watt
            });

            total += quantity * item.watt;
          }

          break;
        }
      }
    }

    if (!found.length) return null;

    const current230 = total / 230;
    const demand = total * 0.8;
    const demandCurrent = demand / 230;
    const kva = demand / 0.8 / 1000;

    return result(
      "Smart Home Load Calculator",
      `Equipment List:

${found
  .map(
    item =>
      `${item.label}: ${item.quantity} × ${item.watt} W = ${f(
        item.subtotal
      )} W`
  )
  .join("\n")}

Connected Load = ${f(total)} W
Connected Load = ${f(total / 1000)} kW

Estimated Demand Load = ${f(demand)} W
Estimated Current at 230V = ${f(current230)} A
Demand Current ≈ ${f(demandCurrent)} A

Preliminary Apparent Power ≈ ${f(kva)} kVA

নোট: equipment-এর প্রকৃত nameplate watt ব্যবহার করলে হিসাব আরও নির্ভুল হবে।`
    );
  }

  function smartEnergy(text) {
    const t = normalize(text);

    if (
      !t.includes("monthly") &&
      !t.includes("daily") &&
      !t.includes("unit") &&
      !t.includes("ইউনিট") &&
      !t.includes("মাসে") &&
      !t.includes("দিনে")
    ) {
      return null;
    }

    const n = numbers(t);
    if (n.length < 2) return null;

    const loadW = n[0];
    const hours = n[1];
    const days = n[2] || 30;
    const rate = n[3] || 12;

    const daily = (loadW / 1000) * hours;
    const monthly = daily * days;
    const bill = monthly * rate;

    return result(
      "Energy & Bill Calculator",
      `Load = ${f(loadW)} W
Runtime = ${f(hours)} hour/day
Days = ${f(days)}
Unit Rate = ${f(rate)} টাকা

Daily Energy = ${f(daily)} kWh
Monthly Energy = ${f(monthly)} ইউনিট

Estimated Bill = ${f(bill)} টাকা

এখানে fixed charge, VAT, demand charge এবং slab tariff ধরা হয়নি।`
    );
  }

  const troubleshooting = [
    {
      keys: ["fan slow", "ফ্যান ধীরে", "fan speed কম", "ফ্যান আস্তে"],
      title: "ফ্যান ধীরে চলার সম্ভাব্য কারণ",
      body: `সম্ভাব্য কারণ:
১. Supply voltage কম
২. Fan capacitor দুর্বল
৩. Bearing বা bush সমস্যা
৪. Regulator সমস্যা
৫. Winding-এর সমস্যা
৬. Fan blade-এ mechanical resistance

প্রাথমিকভাবে:
- অন্য socket/line-এ পরীক্ষা করুন
- অস্বাভাবিক শব্দ আছে কি না দেখুন
- Capacitor technician দিয়ে পরীক্ষা করান

⚠️ বিদ্যুৎ চালু থাকা অবস্থায় fan খুলবেন না।`
    },
    {
      keys: ["light flicker", "লাইট জ্বলে নিভে", "লাইট flicker", "আলো কাঁপে"],
      title: "লাইট Flicker করার কারণ",
      body: `সম্ভাব্য কারণ:
১. Loose connection
২. Low voltage
৩. Neutral connection দুর্বল
৪. LED driver সমস্যা
৫. অতিরিক্ত load
৬. Voltage fluctuation

যদি একাধিক room-এর light একসাথে flicker করে, main connection ও neutral পরীক্ষা করাতে হবে।`
    },
    {
      keys: ["mcb trip", "breaker trip", "এমসিবি ট্রিপ", "ব্রেকার ট্রিপ"],
      title: "MCB বারবার Trip করার কারণ",
      body: `সম্ভাব্য কারণ:
১. Overload
২. Short circuit
৩. Faulty appliance
৪. Loose wiring
৫. Wrong breaker rating
৬. Motor starting current
৭. Insulation fault

করণীয়:
- সব appliance বন্ধ করুন
- একে একে appliance চালু করুন
- পোড়া গন্ধ বা spark থাকলে main supply বন্ধ করুন
- বারবার breaker বদলাবেন না

⚠️ বেশি amp-এর MCB লাগিয়ে সমস্যা লুকানো বিপজ্জনক।`
    },
    {
      keys: ["motor hot", "মোটর গরম", "motor overheating", "মোটর অতিরিক্ত গরম"],
      title: "Motor অতিরিক্ত গরম হওয়ার কারণ",
      body: `সম্ভাব্য কারণ:
১. Overload
২. Low voltage
৩. Single phasing
৪. Bearing jam
৫. Poor ventilation
৬. Capacitor দুর্বল
৭. Wrong connection
৮. Frequent starting

পরীক্ষা:
- Motor current তিন phase-এ মাপুন
- Voltage balance দেখুন
- Bearing ও ventilation পরীক্ষা করুন
- Thermal overload relay কাজ করছে কি না দেখুন`
    },
    {
      keys: ["socket no power", "সকেটে বিদ্যুৎ নেই", "socket কাজ করে না"],
      title: "Socket-এ বিদ্যুৎ না থাকার কারণ",
      body: `সম্ভাব্য কারণ:
১. MCB OFF বা trip
২. Loose terminal
৩. Socket switch নষ্ট
৪. Neutral open
৫. Cable break
৬. RCCB trip

পরীক্ষার জন্য proper tester বা multimeter ব্যবহার করতে হবে। Live terminal স্পর্শ করা যাবে না।`
    },
    {
      keys: ["inverter backup low", "ইনভার্টার backup কম", "ব্যাকআপ কম"],
      title: "Inverter Backup কম হওয়ার কারণ",
      body: `সম্ভাব্য কারণ:
১. Battery capacity কমে গেছে
২. Battery পুরোনো
৩. Load বেশি
৪. Inverter efficiency কম
৫. Battery fully charged নয়
৬. Loose battery terminal
৭. Battery cell সমস্যা

Battery voltage, charging current এবং actual load technician দিয়ে পরীক্ষা করান।`
    },
    {
      keys: ["rccb trip", "rccb বারবার", "rcbo trip"],
      title: "RCCB/RCBO Trip করার কারণ",
      body: `সম্ভাব্য কারণ:
১. Earth leakage
২. Moisture
৩. Faulty appliance
৪. Neutral-earth connection ভুল
৫. Cable insulation damage
৬. Water heater বা washing machine leakage

RCCB bypass করবেন না। Earth leakage থাকলে qualified electrician দিয়ে insulation test করান।`
    }
  ];

  function troubleshoot(text) {
    const t = normalize(text);

    const item = troubleshooting.find(entry =>
      entry.keys.some(key => t.includes(key))
    );

    if (!item) return null;

    return result(item.title, item.body);
  }

  function safety(text) {
    const t = normalize(text);

    if (
      !t.includes("safety") &&
      !t.includes("নিরাপত্তা") &&
      !t.includes("সেফটি") &&
      !t.includes("electric shock") &&
      !t.includes("বিদ্যুৎস্পৃষ্ট") &&
      !t.includes("আগুন") &&
      !t.includes("fire")
    ) {
      return null;
    }

    return result(
      "Electrical Safety Guide",
      `Electrical কাজের আগে:

১. Main supply OFF করুন
২. Lockout/Tagout করুন
৩. Voltage tester দিয়ে dead নিশ্চিত করুন
৪. ভেজা হাতে কাজ করবেন না
৫. Damaged cable ব্যবহার করবেন না
৬. Proper earthing রাখুন
৭. Correct fuse/MCB ব্যবহার করুন
৮. Overloaded socket ব্যবহার করবেন না
৯. পানির কাছে RCCB ব্যবহার করুন
১০. শিশুদের electrical panel থেকে দূরে রাখুন

বিদ্যুৎস্পৃষ্ট হলে:
- সরাসরি ব্যক্তিকে ধরবেন না
- প্রথমে supply বন্ধ করুন
- emergency service ডাকুন
- প্রশিক্ষিত ব্যক্তি হলে CPR সহায়তা দিন

আগুন হলে:
- সম্ভব হলে main supply বন্ধ করুন
- পানি ব্যবহার করবেন না
- উপযুক্ত electrical fire extinguisher ব্যবহার করুন
- দ্রুত emergency service ডাকুন`
    );
  }

  function formulas(text) {
    const t = normalize(text);

    if (
      !t.includes("formula") &&
      !t.includes("ফর্মুলা") &&
      !t.includes("সূত্র") &&
      !t.includes("law")
    ) {
      return null;
    }

    return result(
      "Electrical Formula Library",
      `Ohm’s Law:
V = I × R
I = V ÷ R
R = V ÷ I

DC Power:
P = V × I

Single Phase AC:
P = V × I × PF
S = V × I

Three Phase:
P = √3 × VL × IL × PF
S = √3 × VL × IL

Energy:
Energy = Power × Time

Transformer:
I = VA ÷ V

Motor:
I = P ÷ (√3 × V × PF × Efficiency)

Voltage Drop:
Vdrop = I × R

Cable Resistance:
R = ρ × L ÷ A

Battery:
Backup Time = V × Ah × Efficiency ÷ Load

Solar:
Panel Watt = Daily Wh ÷ Sun Hour ÷ System Factor

Power Factor:
PF = kW ÷ kVA

Capacitor Correction:
kVAR = kW × (tan φ1 − tan φ2)

Motor RPM:
Ns = 120 × f ÷ P

Efficiency:
Efficiency = Output ÷ Input × 100`
    );
  }

  function converter(text) {
    const t = normalize(text);
    const n = numbers(t);

    if (!n.length) return null;

    const value = n[0];

    if (
      t.includes("watt to kw") ||
      t.includes("w to kw") ||
      t.includes("ওয়াট থেকে kw")
    ) {
      return result(
        "Unit Converter",
        `${f(value)} W = ${f(value / 1000)} kW`,
        false
      );
    }

    if (
      t.includes("kw to watt") ||
      t.includes("kw থেকে watt")
    ) {
      return result(
        "Unit Converter",
        `${f(value)} kW = ${f(value * 1000)} W`,
        false
      );
    }

    if (
      t.includes("hp to watt") ||
      t.includes("hp থেকে watt")
    ) {
      return result(
        "Unit Converter",
        `${f(value)} HP ≈ ${f(value * 746)} W`,
        false
      );
    }

    if (
      t.includes("hp to kw") ||
      t.includes("hp থেকে kw")
    ) {
      return result(
        "Unit Converter",
        `${f(value)} HP ≈ ${f(value * 0.746)} kW`,
        false
      );
    }

    if (
      t.includes("amp to ma") ||
      t.includes("amp থেকে ma")
    ) {
      return result(
        "Unit Converter",
        `${f(value)} A = ${f(value * 1000)} mA`,
        false
      );
    }

    if (
      t.includes("ma to amp") ||
      t.includes("ma থেকে amp")
    ) {
      return result(
        "Unit Converter",
        `${f(value)} mA = ${f(value / 1000)} A`,
        false
      );
    }

    if (
      t.includes("kwh to joule") ||
      t.includes("kwh থেকে joule")
    ) {
      return result(
        "Unit Converter",
        `${f(value)} kWh = ${f(value * 3600000)} Joule`,
        false
      );
    }

    if (
      t.includes("joule to wh") ||
      t.includes("joule থেকে wh")
    ) {
      return result(
        "Unit Converter",
        `${f(value)} Joule = ${f(value / 3600)} Wh`,
        false
      );
    }

    if (
      t.includes("kw to kva") ||
      t.includes("kw থেকে kva")
    ) {
      const pf = n[1] || 0.8;

      return result(
        "kW to kVA",
        `${f(value)} kW at PF ${f(pf)}
= ${f(value / pf)} kVA`,
        false
      );
    }

    if (
      t.includes("kva to kw") ||
      t.includes("kva থেকে kw")
    ) {
      const pf = n[1] || 0.8;

      return result(
        "kVA to kW",
        `${f(value)} kVA at PF ${f(pf)}
= ${f(value * pf)} kW`,
        false
      );
    }

    return null;
  }

  const quizQuestions = [
    {
      q: "Ohm’s Law কোনটি?",
      options: [
        "V = I × R",
        "P = V + I",
        "R = V × I",
        "I = V × R"
      ],
      answer: 1,
      explanation: "Ohm’s Law হলো V = I × R।"
    },
    {
      q: "Power Factor-এর মান সাধারণত কত থেকে কত?",
      options: ["0 থেকে 1", "1 থেকে 10", "10 থেকে 100", "-10 থেকে -1"],
      answer: 1,
      explanation: "সাধারণ AC system-এ PF সাধারণত 0 থেকে 1-এর মধ্যে থাকে।"
    },
    {
      q: "Three phase power formula কোনটি?",
      options: [
        "P = V + I",
        "P = √3 × V × I × PF",
        "P = R ÷ I",
        "P = V − I"
      ],
      answer: 2,
      explanation: "Balanced three-phase real power হলো √3 × VL × IL × PF।"
    },
    {
      q: "RCCB কী detect করে?",
      options: [
        "শুধু overload",
        "শুধু frequency",
        "Earth leakage",
        "শুধু low voltage"
      ],
      answer: 3,
      explanation: "RCCB মূলত residual current বা earth leakage detect করে।"
    },
    {
      q: "Transformer কোন principle-এ কাজ করে?",
      options: [
        "Electromagnetic induction",
        "Chemical reaction",
        "Friction",
        "Heat expansion"
      ],
      answer: 1,
      explanation: "Transformer electromagnetic induction principle-এ কাজ করে।"
    }
  ];

  function quiz(text) {
    const t = normalize(text);

    if (
      !t.includes("quiz") &&
      !t.includes("কুইজ") &&
      !t.includes("প্রশ্ন কর")
    ) {
      return null;
    }

    const q =
      quizQuestions[Math.floor(Math.random() * quizQuestions.length)];

    return result(
      "Electrical Quiz",
      `প্রশ্ন:
${q.q}

${q.options
  .map((option, index) => `${index + 1}. ${option}`)
  .join("\n")}

উত্তর জানতে লিখুন:
quiz answer 1 / quiz answer 2 / quiz answer 3 / quiz answer 4

নোট: প্রতিবার নতুন প্রশ্ন আসতে পারে।`,
      false
    );
  }

  let currentQuiz = null;

  function quizAnswer(text) {
    const t = normalize(text);

    if (
      !t.includes("quiz answer") &&
      !t.includes("কুইজ উত্তর") &&
      !t.includes("উত্তর")
    ) {
      return null;
    }

    const n = numbers(t);
    if (!n.length || !currentQuiz) return null;

    const selected = n[0];

    if (selected === currentQuiz.answer) {
      return result(
        "Quiz Result",
        `✅ সঠিক উত্তর!

${currentQuiz.explanation}`,
        false
      );
    }

    return result(
      "Quiz Result",
      `❌ উত্তরটি সঠিক নয়।

সঠিক উত্তর:
${currentQuiz.options[currentQuiz.answer - 1]}

${currentQuiz.explanation}`,
      false
    );
  }

  function circuitGuide(text) {
    const t = normalize(text);

    if (
      !t.includes("circuit diagram") &&
      !t.includes("সার্কিট ডায়াগ্রাম") &&
      !t.includes("wiring diagram") &&
      !t.includes("ওয়্যারিং ডায়াগ্রাম") &&
      !t.includes("series circuit") &&
      !t.includes("parallel circuit")
    ) {
      return null;
    }

    return result(
      "Basic Circuit Guide",
      `Series Circuit:

Battery (+)
   |
Resistor 1
   |
Resistor 2
   |
Lamp
   |
Battery (-)

Series-এ:
- Current একই থাকে
- Voltage ভাগ হয়
- Total Resistance = R1 + R2

Parallel Circuit:

          |--- Load 1 ---|
Supply ---|--- Load 2 ---|--- Return
          |--- Load 3 ---|

Parallel-এ:
- Voltage একই থাকে
- Current ভাগ হয়
- Total Resistance কমে

Basic House Wiring:
Main Supply
   ↓
Main Breaker
   ↓
RCCB/RCBO
   ↓
Distribution Board
   ↓
MCB
   ↓
Light / Fan / Socket

⚠️ বাস্তব house wiring local electrical code অনুযায়ী করতে হবে।`
    );
  }

  function terms(text) {
    const t = normalize(text);

    const dictionary = {
      voltage: "Voltage হলো বৈদ্যুতিক potential difference। একক Volt (V)।",
      ভোল্টেজ: "Voltage হলো বৈদ্যুতিক potential difference। একক Volt (V)।",
      current: "Current হলো electric charge flow। একক Ampere (A)।",
      কারেন্ট: "Current হলো electric charge flow। একক Ampere (A)।",
      resistance: "Resistance হলো current flow-এর বাধা। একক Ohm (Ω)।",
      রেজিস্ট্যান্স:
        "Resistance হলো current flow-এর বাধা। একক Ohm (Ω)।",
      capacitor:
        "Capacitor বৈদ্যুতিক charge সঞ্চয় করে এবং AC circuit-এ reactive effect তৈরি করে।",
      transformer:
        "Transformer electromagnetic induction ব্যবহার করে AC voltage বাড়ায় বা কমায়।",
      inverter:
        "Inverter DC power-কে AC power-এ রূপান্তর করে।",
      rectifier:
        "Rectifier AC power-কে DC power-এ রূপান্তর করে।",
      frequency:
        "Frequency হলো প্রতি সেকেন্ডে cycle সংখ্যা। একক Hertz (Hz)।",
      earthing:
        "Earthing fault current-এর নিরাপদ পথ তৈরি করে এবং shock risk কমাতে সাহায্য করে।",
      grounding:
        "Grounding/earthing electrical safety-এর গুরুত্বপূর্ণ অংশ।",
      efficiency:
        "Efficiency = Output ÷ Input × 100।"
    };

    for (const key of Object.keys(dictionary)) {
      if (t.includes(key)) {
        return result(
          "Electrical Term Explanation",
          dictionary[key],
          false
        );
      }
    }

    return null;
  }

  function smartSystem(message) {
    const text = normalize(message);

    if (!text) return null;

    if (
      text === "help" ||
      text.includes("সব program") ||
      text.includes("সব প্রোগ্রাম") ||
      text.includes("কি কি পার") ||
      text.includes("what can you do")
    ) {
      return result(
        "ElectroTechBD Smart System",
        `আমি করতে পারি:

১. Smart Home Load Calculation
২. Energy ও Electricity Bill
৩. Electrical Troubleshooting
৪. Electrical Safety Guide
৫. Formula Library
৬. Unit Conversion
৭. Electrical Quiz
৮. Circuit Guide
৯. Electrical Terms Explanation

উদাহরণ:
- বাসায় ৫টা ফ্যান ১০টা লাইট ১টা ফ্রিজ
- ২০০০ watt ৬ hour ৩০ দিন rate ১২
- fan slow
- mcb trip
- electrical formula
- 1000 watt to kw
- electrical quiz
- circuit diagram`
      );
    }

    const functions = [
      smartLoad,
      smartEnergy,
      troubleshoot,
      safety,
      formulas,
      converter,
      quizAnswer,
      quiz,
      circuitGuide,
      terms
    ];

    for (const fn of functions) {
      try {
        const response = fn(text);
        if (response) return response;
      } catch (error) {
        console.warn("Smart electrical error:", error);
      }
    }

    return null;
  }

  const oldChatLocalAnswer =
    typeof window.chatLocalAnswer === "function"
      ? window.chatLocalAnswer
      : null;

  window.chatLocalAnswer = function (message) {
    const smartResult = smartSystem(message);

    if (smartResult) return smartResult;

    if (oldChatLocalAnswer) {
      return oldChatLocalAnswer(message);
    }

    return null;
  };

  window.ElectroTechSmartSystem = {
    calculate: smartSystem,
    help: () =>
      smartSystem("সব program দেখাও"),
    version: "Smart-System-1.0"
  };

  console.log(
    "%c ElectroTechBD Smart System Loaded ",
    "background:#00e5ff;color:#001018;font-weight:bold;padding:6px"
  );
})();