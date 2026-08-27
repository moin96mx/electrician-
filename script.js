// ================================
// SMART HOME SIMULATOR
// ================================

const state = {
    light: false,
    fan: false,
    sensor: false
};


function toggleAppliance(type) {

    state[type] = !state[type];

    const card = document.getElementById(`card-${type}`);

    const status = document.getElementById(`status-${type}`);


    // LIGHT

    if (type === "light") {

        if (state.light) {

            card.classList.add("active-light");

            status.innerHTML =
                'স্ট্যাটাস: <span style="color:#ffd700;font-weight:bold;">অন (ON)</span>';

        } else {

            card.classList.remove("active-light");

            status.innerHTML =
                'স্ট্যাটাস: <span>অফ (OFF)</span>';

        }

    }


    // FAN

    if (type === "fan") {

        if (state.fan) {

            card.classList.add("active-fan");

            status.innerHTML =
                'স্ট্যাটাস: <span style="color:#00bfff;font-weight:bold;">রানিং (100%)</span>';

        } else {

            card.classList.remove("active-fan");

            status.innerHTML =
                'স্ট্যাটাস: <span>অফ (OFF)</span>';

        }

    }


    // SENSOR

    if (type === "sensor") {

        if (state.sensor) {

            card.classList.add("active-sensor");

            status.innerHTML =
                'স্ট্যাটাস: <span style="color:#ff0055;font-weight:bold;">MOTION DETECTED!</span>';

        } else {

            card.classList.remove("active-sensor");

            status.innerHTML =
                'স্ট্যাটাস: <span>নিষ্ক্রিয় (IDLE)</span>';

        }

    }

}


// ================================
// BUDGET CALCULATOR
// ================================

let currentSqft = 1200;

let roomCount = 3;

let selectedGrade = "standard";


// ROOM UPDATE

function updateRooms(change) {

    roomCount += change;

    if (roomCount < 1) {

        roomCount = 1;

    }

    document.getElementById("room-count").innerText =
        roomCount;

    calculateBudget();

}


// GRADE SELECTION

function setGrade(grade, element) {

    selectedGrade = grade;


    document
        .querySelectorAll(".grade-card")
        .forEach(card => {

            card.classList.remove("active");

        });


    element.classList.add("active");


    calculateBudget();

}


// BUDGET CALCULATION

function calculateBudget() {

    const slider =
        document.getElementById("sqft-slider");


    currentSqft =
        parseInt(slider.value);


    document.getElementById("sqft-val").innerText =
        `${currentSqft.toLocaleString()} Sq.Ft`;


    const isSolar =
        document.getElementById("solar-toggle").checked;


    // PRICE PER SQFT

    let ratePerSqft;

    if (selectedGrade === "standard") {

        ratePerSqft = 25;

    } else {

        ratePerSqft = 45;

    }


    // MATERIAL COST

    const materialCost =
        currentSqft * ratePerSqft +
        roomCount * 1500;


    // ENGINEERING & LABOR

    const laborCost =
        materialCost * 0.45;


    // SOLAR COST

    let solarCost = 0;


    if (isSolar) {

        solarCost =
            Math.round(currentSqft * 35);


        document.getElementById("solar-row")
            .style.display = "flex";


        document.getElementById("solar-cost")
            .innerText =
            `৳ ${solarCost.toLocaleString()}`;

    } else {

        document.getElementById("solar-row")
            .style.display = "none";

    }


    // TOTAL

    const totalBudget =
        Math.round(
            materialCost +
            laborCost +
            solarCost
        );


    // UPDATE UI

    document.getElementById("mat-cost").innerText =
        `৳ ${Math.round(materialCost).toLocaleString()}`;


    document.getElementById("labor-cost").innerText =
        `৳ ${Math.round(laborCost).toLocaleString()}`;


    document.getElementById("total-price").innerText =
        `৳ ${totalBudget.toLocaleString()}`;

}


// ================================
// CONSULTATION BUTTON
// ================================

function triggerConsultation() {

    const price =
        document.getElementById("total-price")
            .innerText;


    alert(
        `আপনার নির্বাচিত আনুমানিক বাজেট: ${price}

আমাদের টিম আপনার সাথে যোগাযোগ করবে।`
    );

}


// ================================
// INITIAL CALCULATION
// ================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        calculateBudget();

    }
);


// Dynamic File Selection Feedback
function updateFileName(input) {
  const display = document.getElementById('file-name-display');
  if (input.files && input.files[0]) {
    const fileName = input.files[0].name;
    display.innerHTML = `<i class="fa-solid fa-file-circle-check"></i> ফাইল যুক্ত হয়েছে: <strong>${fileName}</strong>`;
    display.style.color = '#00ff66';
    display.style.borderColor = '#00ff66';
    display.style.background = 'rgba(0, 255, 102, 0.1)';
  } else {
    display.innerHTML = `<i class="fa-solid fa-shield-cat"></i> কোনো ফাইল যুক্ত হয়নি (ঐচ্ছিক)`;
    display.style.color = 'var(--accent-cyan, #00ffcc)';
    display.style.borderColor = 'rgba(0, 255, 204, 0.4)';
    display.style.background = 'rgba(0, 255, 204, 0.08)';
  }
}

// Form Submission & Modal Handling
function handleBookingSubmit(event) {
  event.preventDefault();

  const name = document.getElementById('client-name').value;
  const service = document.getElementById('service-type').value;
  const date = document.getElementById('meeting-date').value;

  const randomId = `#ENG-2050-${Math.floor(1000 + Math.random() * 9000)}`;

  document.getElementById('modal-client-name').innerText = name;
  document.getElementById('modal-service').innerText = service;
  document.getElementById('modal-date').innerText = date;
  document.getElementById('modal-id').innerText = randomId;

  // Show Modal Overlay in Center
  const modal = document.getElementById('booking-modal');
  modal.classList.add('active');
}

// Close Modal
function closeBookingModal() {
  const modal = document.getElementById('booking-modal');
  modal.classList.remove('active');
  document.getElementById('consultation-form').reset();
  updateFileName(document.getElementById('blueprint-file'));
}