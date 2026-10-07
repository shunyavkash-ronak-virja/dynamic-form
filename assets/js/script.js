// ================================
// NICE SELECT
// ================================
$(document).ready(function () {
    $("select").niceSelect();
});

// ================================ //
// ================================ //
const form = document.querySelector(".form-step-wrapper");
const formSteps = document.querySelectorAll(".form-step");
const futureSteps = document.querySelectorAll(".future-step-stack");
const backBtn = document.querySelector(".back-btn");
const nextBtn = document.querySelector(".next-btn");
let currentStep = 0;


// ----- Show Current Step -----
function showStep(stepIndex) {
    formSteps.forEach((step, index) => {
        step.classList.toggle("active", index === stepIndex);
    });
    futureSteps.forEach((step, index) => {
        step.classList.remove("active");
        step.classList.remove("completed");
        if (index < stepIndex) {
            step.classList.add("completed");
        }
        if (index === stepIndex) {
            step.classList.add("active");
        }
    });

    // ----- Back Button -----
    if (stepIndex === 0) {
        backBtn.classList.remove("active");
    } else {
        backBtn.classList.add("active");
    }
}

// ----- Continue Button -----
nextBtn.addEventListener("click", () => {
    const isValid = validateStep();
    if (!isValid) {
        return;
    }
    if (currentStep < formSteps.length - 1) {
        currentStep++;
        showStep(currentStep);
    }
});

// ----- Back Button -----
backBtn.addEventListener("click", () => {
    if (currentStep > 0) {
        currentStep--;
        showStep(currentStep);
    }
});

// ----- Remove Error When User Changes Field -----
form.addEventListener("input", (event) => {
    if (event.target.hasAttribute("required")) {
        removeError(event.target);
    }
});

form.addEventListener("change", (event) => {
    if (event.target.hasAttribute("required")) {
        removeError(event.target);
    }
});

// ----- Initial Step -----
showStep(currentStep);