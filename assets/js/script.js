// ================================
// NICE SELECT
// ================================
$(document).ready(function () {
    $("select").niceSelect();
});

// const dateInput = document.querySelector('.input-field[type="date"]');
// dateInput.addEventListener('change', function () {
//     if (this.value) {
//         this.classList.add("is-filled");
//     } else {
//         this.classList.remove("is-filled");
//     }
// });

// ================================ //
// ================================ //
const form = document.querySelector(".form-step-wrapper");
const formSteps = document.querySelectorAll(".form-step");
const futureSteps = document.querySelectorAll(".future-step-stack");
const backBtn = document.querySelector(".back-btn");
const nextBtn = document.querySelector(".next-btn");
let currentStep = 0;
let maxUnlockedStep = 0;

// ----- Show Current Step -----

function showStep(stepIndex) {

    // ----- Show Form Step -----

    formSteps.forEach((step, index) => {

        if (index === stepIndex) {
            step.classList.add("active");
        } else {
            step.classList.remove("active");
        }
    });


    // ----- Update Progress Step -----

    futureSteps.forEach((step, index) => {

        // Remove active only.
        // Do NOT remove complete here.
        step.classList.remove("active");


        // Current step
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

        // Complete current step
        futureSteps[currentStep].classList.add("active");
        futureSteps[currentStep].classList.add("complete");


        // Unlock next step
        maxUnlockedStep = Math.max(
            maxUnlockedStep,
            currentStep + 1
        );


        // Go to next step
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

// ----- Future Step Click -----

futureSteps.forEach((step, index) => {

    step.addEventListener("click", () => {

        // Only unlocked steps can be opened
        if (index <= maxUnlockedStep) {

            currentStep = index;

            showStep(currentStep);
        }
    });
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


// ----- Remove Nice Select Error -----

form.addEventListener("click", (event) => {

    const option = event.target.closest(".nice-select .option");

    if (!option) {
        return;
    }

    const niceSelect = option.closest(".nice-select");

    if (!niceSelect) {
        return;
    }

    const select = niceSelect.previousElementSibling;

    if (
        select &&
        select.tagName === "SELECT"
    ) {
        removeError(select);
    }
});

// ----- Initial Step -----
showStep(currentStep);

// ----- Get Visible Input Element -----

function getErrorElement(input) {

    if (input.tagName === "SELECT") {

        const niceSelect = input.nextElementSibling;

        if (niceSelect && niceSelect.classList.contains("nice-select")) {
            return niceSelect;
        }
    }

    return input;
}


// ----- Show Error -----

function showError(input, message) {

    const inputStack = input.closest(".input-stack");

    if (!inputStack) {
        return;
    }

    const errorElement = getErrorElement(input);

    errorElement.classList.add("input-error-field");

    let errorMessage = inputStack.querySelector(".input-error");

    if (!errorMessage) {

        errorMessage = document.createElement("span");

        errorMessage.className = "input-error";

        inputStack.appendChild(errorMessage);
    }

    errorMessage.textContent = message;
}


// ----- Remove Error -----

function removeError(input) {

    const inputStack = input.closest(".input-stack");

    if (!inputStack) {
        return;
    }

    const errorElement = getErrorElement(input);

    errorElement.classList.remove("input-error-field");

    const errorMessage = inputStack.querySelector(".input-error");

    if (errorMessage) {
        errorMessage.remove();
    }
}


// ----- Validate Current Step -----

function validateStep() {

    const currentFormStep = formSteps[currentStep];

    const requiredFields = currentFormStep.querySelectorAll("[required]");

    let isValid = true;

    requiredFields.forEach((input) => {

        // ----- Skip Hidden Employment Fields -----

        const employmentOption = input.closest(".employment-status-option");

        if (
            employmentOption &&
            !employmentOption.classList.contains("active")
        ) {
            return;
        }

        removeError(input);


        // ----- Required Field -----

        if (input.value.trim() === "") {

            isValid = false;

            if (input.tagName === "SELECT") {

                showError(
                    input,
                    "Please select an option."
                );

            } else if (input.type === "file") {

                showError(
                    input,
                    "Please upload this document."
                );

            } else {

                showError(
                    input,
                    "This field is required."
                );
            }

            return;
        }


        // ----- First Name / Last Name -----

        if (
            input.id === "first-name" ||
            input.id === "last-name"
        ) {

            const namePattern = /^[A-Za-zÀ-ÿ\s'-]+$/;

            if (!namePattern.test(input.value.trim())) {

                isValid = false;

                showError(
                    input,
                    "Please enter letters only."
                );

                return;
            }
        }


        // ----- Phone Number -----

        if (
            input.id === "phone" ||
            input.type === "tel"
        ) {

            const phoneValue = input.value.trim();

            if (!/^[0-9]+$/.test(phoneValue)) {

                isValid = false;

                showError(
                    input,
                    "Please enter numbers only."
                );

                return;
            }

            if (phoneValue.length !== 10) {

                isValid = false;

                showError(
                    input,
                    "Phone number must contain exactly 10 digits."
                );

                return;
            }
        }


        // ----- Email -----
        if (input.type === "email") {

            const emailValue = input.value.trim();

            const emailPattern =
                /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

            if (!emailPattern.test(emailValue)) {

                isValid = false;

                showError(
                    input,
                    "Please enter a valid email address."
                );

                return;
            }
        }


        // ----- Date -----

        if (input.type === "date") {

            if (!input.value) {

                isValid = false;

                showError(
                    input,
                    "Please select your date of birth."
                );

                return;
            }
        }


        // ----- Other HTML Validation -----

        if (!input.checkValidity()) {

            isValid = false;

            showError(
                input,
                "Please enter a valid value."
            );
        }
    });

    return isValid;
}