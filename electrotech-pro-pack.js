(() => {
  "use strict";

  const E = Object.freeze({
    n: "ElectroTechBD",
    a: "ভোল্ট",
    v: 230,
    v3: 400,
    pf: .8,
    pi: Math.PI
  });

  const X = s => String(s ?? "")
    .toLowerCase()
    .replace(/[০-৯]/g, x => "০১২৩৪৫৬৭৮৯".indexOf(x))
    .replace(/,/g, "")
    .replace(/[^\p{L}\p{N}.\-+*/()%\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  const H = t => `⚡ ${t}\n\nElectroTechBD | ভোল্ট\n\n`;

  const F = (n, d = 2) =>
    Number.isFinite(n)
      ? Number(n.toFixed(d)).toLocaleString("en-US")
      : "N/A";

  const A = (t, a) => a.some(x => t.includes(x));

  const N = (t, r) => {
    for (const x of r) {
      const m = t.match(x);
      if (m) return Number(m[1]);
    }
    return null;
  };

  const P = t => N(t, [
    /(\d+(?:\.\d+)?)\s*(?:kw|কিলোওয়াট)/i,
    /(?:load|power|লোড|পাওয়ার)\s*(?:is|=|হল|ঃ|:)?\s*(\d+(?:\.\d+)?)/i
  ]);

  const I = t => N(t, [
    /(\d+(?:\.\d+)?)\s*(?:a|amp|ampere|amps|এম্পিয়ার|অ্যাম্পিয়ার)/i,
    /(?:current|কারেন্ট)\s*(?:is|=|হল|ঃ|:)?\s*(\d+(?:\.\d+)?)/i
  ]);

  const V = t => N(t, [
    /(\d+(?:\.\d+)?)\s*(?:v|volt|voltage|ভোল্ট|ভোল্টেজ)/i
  ]);

  const PF = t => N(t, [
    /(?:pf|power factor|পিএফ)\s*(?:is|=|হল|ঃ|:)?\s*(0?\.\d+|1(?:\.0+)?)/i
  ]) || E.pf;

  const HP = t => N(t, [
    /(\d+(?:\.\d+)?)\s*(?:hp|horse power|হর্স পাওয়ার)/i
  ]);

  const LEN = t => N(t, [
    /(\d+(?:\.\d+)?)\s*(?:m|meter|মিটার)/i
  ]);

  const THREE = t => A(t, [
    "three phase",
    "3 phase",
    "3-phase",
    "threephase",
    "ত্রিফেজ",
    "থ্রি ফেজ"
  ]);

  const VOLT = (t, three = false) =>
    V(t) || (three ? E.v3 : E.v);

  const WARN = () => `

⚠️ Safety Notice:

এই ফলাফল preliminary calculation।
বাস্তব কাজে cable length, installation method, derating,
fault level, manufacturer datasheet ও applicable standard
যাচাই করতে হবে।

লাইভ electrical line-এ কাজ করবেন না।
Supply isolate এবং test-before-touch অনুসরণ করুন।
Qualified electrician/engineer দিয়ে final verification করান।
`;

  function currentFromPower(t) {
    const p = P(t);
    if (p === null) return null;

    const three = THREE(t);
    const v = VOLT(t, three);
    const pf = PF(t);
    const w = p * 1000;

    const i = three
      ? w / (Math.sqrt(3) * v * pf)
      : w / (v * pf);

    return `${H("Power থেকে Current")}

• Load: ${F(p)} kW
• Voltage: ${F(v)} V
• PF: ${F(pf)}
• System: ${three ? "Three Phase" : "Single Phase"}

Formula:
${three ? "I = P / (√3 × V × PF)" : "I = P / (V × PF)"}

✅ আনুমানিক Current: **${F(i)} A**
${WARN()}`;
  }

  function powerFromCurrent(t) {
    const i = I(t);
    if (i === null) return null;

    const three = THREE(t);
    const v = VOLT(t, three);
    const pf = PF(t);

    const w = three
      ? Math.sqrt(3) * v * i * pf
      : v * i * pf;

    return `${H("Current থেকে Power")}

• Current: ${F(i)} A
• Voltage: ${F(v)} V
• PF: ${F(pf)}
• System: ${three ? "Three Phase" : "Single Phase"}

✅ আনুমানিক Power: **${F(w / 1000)} kW**

Formula:
${three ? "P = √3 × V × I × PF" : "P = V × I × PF"}
${WARN()}`;
  }

  function kva(t) {
    const p = P(t);
    const pf = PF(t);

    if (
      p === null ||
      !A(t, ["kva", "কেভিএ", "power factor", "pf", "পিএফ"])
    ) return null;

    return `${H("kW থেকে kVA")}

• Active Power: ${F(p)} kW
• PF: ${F(pf)}

Formula:
kVA = kW / PF

✅ Result: **${F(p / pf)} kVA**
${WARN()}`;
  }

  function kwFromKva(t) {
    const k = N(t, [
      /(\d+(?:\.\d+)?)\s*(?:kva|কেভিএ)/i
    ]);

    if (k === null) return null;

    const pf = PF(t);

    return `${H("kVA থেকে kW")}

• Apparent Power: ${F(k)} kVA
• PF: ${F(pf)}

Formula:
kW = kVA × PF

✅ Result: **${F(k * pf)} kW**
${WARN()}`;
  }

  function hpConvert(t) {
    const hp = HP(t);

    if (hp !== null) {
      return `${H("HP থেকে kW")}

1 HP ≈ 0.746 kW

• Motor Rating: ${F(hp)} HP

✅ Result: **${F(hp * .746)} kW**
${WARN()}`;
    }

    const p = P(t);

    if (p !== null && A(t, ["hp", "horse", "হর্স"])) {
      return `${H("kW থেকে HP")}

1 kW ≈ 1.341 HP

• Power: ${F(p)} kW

✅ Result: **${F(p * 1.341)} HP**
${WARN()}`;
    }

    return null;
  }

  function energy(t) {
    const p = P(t);
    const h = N(t, [
      /(\d+(?:\.\d+)?)\s*(?:hour|hours|ঘণ্টা|ঘন্টা)/i
    ]);

    if (p === null || h === null) return null;

    return `${H("Energy Consumption")}

• Load: ${F(p)} kW
• Running Time: ${F(h)} ঘণ্টা

Formula:
Energy = Power × Time

✅ Consumption: **${F(p * h)} kWh / Unit**
${WARN()}`;
  }

  function bill(t) {
    const unit = N(t, [
      /(\d+(?:\.\d+)?)\s*(?:unit|units|kwh|ইউনিট)/i
    ]);

    const rate = N(t, [
      /(?:rate|রেট|প্রতি ইউনিট)\s*(?:is|=|হল|ঃ|:)?\s*(\d+(?:\.\d+)?)/i,
      /(\d+(?:\.\d+)?)\s*(?:টাকা|tk|taka)\s*(?:per|প্রতি)/i
    ]);

    if (unit === null || rate === null) return null;

    return `${H("Electricity Bill Estimate")}

• Consumption: ${F(unit)} Unit
• Rate: ${F(rate)} টাকা/Unit

✅ Energy Charge: **${F(unit * rate)} টাকা**

নোট: বাস্তব bill-এ slab, VAT, demand charge,
meter charge ও service charge থাকতে পারে।
${WARN()}`;
  }

  function motorFLC(t) {
    const hp = HP(t);
    if (hp === null || !A(t, ["motor", "মোটর"])) return null;

    const three = THREE(t);
    const v = VOLT(t, three);
    const pf = PF(t);
    const eff = N(t, [
      /(?:efficiency|eff|দক্ষতা)\s*(?:is|=|হল|ঃ|:)?\s*(\d+(?:\.\d+)?)/i
    ]) || 85;

    const kw = hp * .746;
    const eta = eff > 1 ? eff / 100 : eff;

    const amp = three
      ? kw * 1000 / (Math.sqrt(3) * v * pf * eta)
      : kw * 1000 / (v * pf * eta);

    return `${H("Motor Full Load Current Estimate")}

• Motor: ${F(hp)} HP
• Power: ${F(kw)} kW
• Voltage: ${F(v)} V
• PF: ${F(pf)}
• Efficiency: ${F(eff)}%

✅ Estimated FLC: **${F(amp)} A**

Motor nameplate current থাকলে সেটিই priority হিসেবে
ব্যবহার করতে হবে। Starting current ও starter type বিবেচনা করুন।
${WARN()}`;
  }

  function transformer(t) {
    const k = N(t, [
      /(\d+(?:\.\d+)?)\s*(?:kva|কেভিএ)/i
    ]);

    if (
      k === null ||
      !A(t, ["transformer", "ট্রান্সফরমার"])
    ) return null;

    return `${H("Transformer Load Estimate")}

• Transformer Rating: ${F(k)} kVA
• PF assumed: ${F(PF(t))}

Estimated active power:

✅ **${F(k * PF(t))} kW**

Transformer capacity-এর পুরোটা continuous load হিসেবে
ব্যবহার করার আগে temperature rise, diversity, future load,
motor starting এবং manufacturer data যাচাই করুন।
${WARN()}`;
  }

  function generator(t) {
    const k = N(t, [
      /(\d+(?:\.\d+)?)\s*(?:kva|কেভিএ)/i
    ]);

    if (
      k === null ||
      !A(t, ["generator", "জেনারেটর", "জেনারেটর সাইজ"])
    ) return null;

    return `${H("Generator Rating Information")}

• Generator Rating: ${F(k)} kVA
• Assumed PF: ${F(PF(t))}

Approximate active power:

✅ **${F(k * PF(t))} kW**

Generator sizing-এর সময় motor starting current,
step loading, harmonics, UPS load এবং future expansion
অবশ্যই বিবেচনা করতে হবে।
${WARN()}`;
  }

  function cableInfo() {
    return `${H("Cable Selection Guide")}

Cable size নির্ধারণে প্রয়োজন:

• Load current
• Voltage
• Single/Three phase
• Cable length
• Copper/Aluminium
• PVC/XLPE
• Conduit/Tray/Buried method
• Ambient temperature
• Grouping factor
• Voltage drop
• Short-circuit withstand
• Breaker rating

শুধু Ampere দেখে cable size নির্বাচন করা যাবে না।

Load, phase, voltage ও length দিলে আরও নির্দিষ্ট
preliminary calculation করা যাবে।
${WARN()}`;
  }

  function protectionInfo(t) {
    if (A(t, ["mcb", "এমসিবি"])) {
      return `${H("MCB")}

MCB = Miniature Circuit Breaker

MCB overload এবং short-circuit protection দেয়।
Earth leakage protection-এর জন্য RCCB/RCBO প্রয়োজন হতে পারে।

B Curve: সাধারণ resistive load
C Curve: moderate inrush load
D Curve: high inrush industrial load

Breaker selection-এ cable ampacity, fault level ও
breaking capacity যাচাই করতে হবে।
${WARN()}`;
    }

    if (A(t, ["mccb", "এমসিসিবি"])) {
      return `${H("MCCB")}

MCCB = Molded Case Circuit Breaker

বড় feeder, MDB এবং industrial circuit-এ ব্যবহৃত হয়।

সুবিধা:

• Higher current rating
• Higher breaking capacity
• Adjustable trip
• Auxiliary contact
• Shunt trip
• Electronic protection option

${WARN()}`;
    }

    if (A(t, ["rccb", "আরসিসিবি"])) {
      return `${H("RCCB")}

RCCB residual current বা earth leakage detect করে।

RCCB:

• Earth leakage protection দেয়
• Overload protection-এর বিকল্প নয়
• Short-circuit protection-এর বিকল্প নয়

বারবার trip হলে faulty appliance, moisture,
neutral-earth mixing এবং insulation fault পরীক্ষা করুন।
${WARN()}`;
    }

    if (A(t, ["rcbo", "আরসিবিও"])) {
      return `${H("RCBO")}

RCBO একইসঙ্গে দিতে পারে:

• Overload protection
• Short-circuit protection
• Earth leakage protection

Individual circuit protection-এর জন্য RCBO ব্যবহার করা যায়।
${WARN()}`;
    }

    return null;
  }

  function route(message) {
    const t = X(message);

    return (
      protectionInfo(t) ||
      motorFLC(t) ||
      transformer(t) ||
      generator(t) ||
      energy(t) ||
      bill(t) ||
      hpConvert(t) ||
      kwFromKva(t) ||
      kva(t) ||
      powerFromCurrent(t) ||
      currentFromPower(t) ||
      (
        A(t, [
          "cable",
          "wire",
          "ক্যাবল",
          "কেবল",
          "তার কত",
          "sqmm"
        ])
          ? cableInfo()
          : null
      ) ||
      `${H("আরও তথ্য প্রয়োজন")}

আপনি প্রশ্নটি এভাবে লিখতে পারেন:

• 5 kW single phase current কত?
• 10 HP motor-এর FLC কত?
• 100 kVA transformer কত kW?
• 50 kVA generator কত load নিতে পারবে?
• 5 kW load 8 ঘণ্টা চললে কত unit?
• 100 unit-এর bill কত?
• MCB আর RCCB-এর পার্থক্য কী?
• Cable size কীভাবে নির্বাচন করব?

${WARN()}`
    );
  }

  window.ElectroTechPro = Object.freeze({
    answer: route,
    version: "2.0.0"
  });

  if (
    typeof window.chatLocalAnswer === "function" &&
    !window.__ElectroTechProAttached
  ) {
    const old = window.chatLocalAnswer;

    window.chatLocalAnswer = function(message) {
      const t = X(message);

      const electrical = [
        "mcb",
        "mccb",
        "rccb",
        "rcbo",
        "cable",
        "wire",
        "motor",
        "transformer",
        "generator",
        "voltage",
        "current",
        "power",
        "load",
        "kw",
        "kva",
        "hp",
        "ফেজ",
        "ভোল্ট",
        "কারেন্ট",
        "পাওয়ার",
        "লোড",
        "মোটর",
        "ক্যাবল",
        "কেবল",
        "ব্রেকার"
      ];

      if (A(t, electrical)) {
        return route(message);
      }

      return old(message);
    };

    window.__ElectroTechProAttached = true;
  }

  console.log("ElectroTechBD Pro Pack loaded.");
})();