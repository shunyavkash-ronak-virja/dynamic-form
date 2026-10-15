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

document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector(".form-step-wrapper");
    const formSteps = [...document.querySelectorAll(".form-step")];
    const futureSteps = [...document.querySelectorAll(".future-step-stack")];
    const backBtn = document.querySelector(".back-btn");
    const nextBtn = document.querySelector(".next-btn");
    const submitBtn = document.querySelector(".submit-btn");
    const confirmationMessage = document.querySelector(".confirmation-message");
    const startNewApplicationBtn = confirmationMessage?.querySelector(".btn.primary-btn");
    const employmentStatus = document.getElementById("employment-status");
    const STORAGE_KEY = "dynamicMultiStepForm";
    let currentStep = 0;
    let maxUnlockedStep = 0;


    // STORAGE ----------
    function getSavedForm() {
        try {
            const savedData = sessionStorage.getItem(STORAGE_KEY);
            if (!savedData) {
                return {
                    completedSteps: {},
                    maxUnlockedStep: 0
                };
            }
            return JSON.parse(savedData);
        } catch (error) {
            return {
                completedSteps: {},
                maxUnlockedStep: 0
            };
        }
    }

    function saveFormData(data) {
        sessionStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(data)
        );
    }


    function cleanSavedEmploymentData() {
        if (!employmentStatus) return;

        const savedForm = getSavedForm();
        const employmentStepIndex = formSteps.findIndex((step) => step.contains(employmentStatus));

        if (employmentStepIndex === -1) return;

        const stepNumber = employmentStepIndex + 1;
        const savedStepData = savedForm.completedSteps[stepNumber];

        if (!savedStepData) return;

        const selectedValue = savedStepData[employmentStatus.name];

        if (!selectedValue) return;

        // Remove data belonging to every unselected employment option.
        document.querySelectorAll(".employment-status-option").forEach((container) => {
            if (container.dataset.employmentStatus === selectedValue) {
                return;
            }

            container.querySelectorAll("input, select, textarea").forEach((input) => {
                if (input.name) {
                    delete savedStepData[input.name];
                }
            });
        });

        saveFormData(savedForm);
    }


    // ERROR HANDLING ----------
    function getErrorElement(input) {
        if (input.tagName === "SELECT") {
            const niceSelect = input.nextElementSibling;
            if (
                niceSelect &&
                niceSelect.classList.contains("nice-select")
            ) {
                return niceSelect;
            }
        }

        if (input.type === "radio") {
            return input.closest(".gender-wrapper");
        }

        if (input.type === "file") {
            const fileLabel = input.closest("label");
            if (fileLabel) {
                return fileLabel.querySelector(
                    ".document-input-field"
                );
            }
        }
        return input;
    }

    function showError(input, message) {
        const inputStack = input.closest(".input-stack");
        if (!inputStack) {
            return;
        }

        const errorElement = getErrorElement(input);
        if (errorElement) {
            errorElement.classList.add("input-error-field");
        }

        let errorMessage = inputStack.querySelector(".input-error");

        if (!errorMessage) {
            errorMessage = document.createElement("span");
            errorMessage.className = "input-error";
            inputStack.appendChild(errorMessage);
        }
        errorMessage.textContent = message;
    }

    function removeError(input) {
        const inputStack = input.closest(".input-stack");
        if (!inputStack) {
            return;
        }

        const errorElement = getErrorElement(input);
        if (errorElement) {
            errorElement.classList.remove(
                "input-error-field"
            );
        }

        const errorMessage = inputStack.querySelector(".input-error");
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    function removeStepErrors(step) {
        step.querySelectorAll(
            "input, select, textarea"
        ).forEach((input) => {
            removeError(input);
        });
    }



    function refreshNiceSelect(select) {
        if (!select) return;

        if (window.jQuery && window.jQuery.fn.niceSelect) {
            window.jQuery(select).niceSelect("update");

            const niceSelect = select.nextElementSibling;

            if (!niceSelect?.classList.contains("nice-select")) {
                return;
            }

            niceSelect.classList.toggle("disabled", select.disabled);
            niceSelect.querySelectorAll(".option").forEach((option) => {
                const value = option.getAttribute("data-value");
                const originalOption = Array.from(select.options).find(
                    (item) => item.value === value
                );
                const isDisabled = !originalOption || originalOption.disabled || select.disabled;

                option.classList.toggle("disabled", isDisabled);
                option.setAttribute("aria-disabled", String(isDisabled));
            });
        }
    }

    // =========================================
    // NATIONALITY, PHONE AND ADDRESS DEPENDENCIES
    // Add inside the existing DOMContentLoaded
    // callback, after refreshNiceSelect().
    // =========================================

    const nationalitySelect = document.getElementById("nationality");
    const countrySelect = document.getElementById("country");
    const stateSelect = document.getElementById("state");
    const cityInput = document.getElementById("city");
    const postalCodeInput = document.getElementById("postal-code");
    const phoneInput = document.getElementById("phone");

    const countryConfig = {
        australia: {
            name: "Australia",
            iso2: "au",
            dialCode: "+61"
        },
        brazil: {
            name: "Brazil",
            iso2: "br",
            dialCode: "+55"
        },
        canada: {
            name: "Canada",
            iso2: "ca",
            dialCode: "+1"
        },
        china: {
            name: "China",
            iso2: "cn",
            dialCode: "+86"
        },
        egypt: {
            name: "Egypt",
            iso2: "eg",
            dialCode: "+20"
        },
        germany: {
            name: "Germany",
            iso2: "de",
            dialCode: "+49"
        },
        india: {
            name: "India",
            iso2: "in",
            dialCode: "+91"
        },
        italy: {
            name: "Italy",
            iso2: "it",
            dialCode: "+39"
        },
        japan: {
            name: "Japan",
            iso2: "jp",
            dialCode: "+81"
        },
        mexico: {
            name: "Mexico",
            iso2: "mx",
            dialCode: "+52"
        },
        nigeria: {
            name: "Nigeria",
            iso2: "ng",
            dialCode: "+234"
        },
        russia: {
            name: "Russia",
            iso2: "ru",
            dialCode: "+7"
        },
        spain: {
            name: "Spain",
            iso2: "es",
            dialCode: "+34"
        },
        "united-kingdom": {
            name: "United Kingdom",
            iso2: "gb",
            dialCode: "+44"
        },
        "united-states": {
            name: "United States",
            iso2: "us",
            dialCode: "+1"
        }
    };

    function getCountryConfig(value) {
        if (!value) return null;

        const normalizedValue = value.trim().toLowerCase();
        return countryConfig[normalizedValue] || Object.values(countryConfig).find(country => country.name.toLowerCase() === normalizedValue) || null;
    }

    // Initialise international phone input.
    const phoneInstance = window.intlTelInput && phoneInput ? window.intlTelInput(phoneInput, {
        initialCountry: "in",
        separateDialCode: true,
        countrySelectorMode: "DROPDOWN",
        autoPlaceholder: "off",
        loadUtils: () => import(
            "https://cdn.jsdelivr.net/npm/intl-tel-input@25.12.5/build/js/utils.js"
        )
    }) : null;

    if (phoneInstance && phoneInput) {
        phoneInput.addEventListener("countrychange", () => {
            removeError(phoneInput);
        });
    }

    function setSelectOptions(select, placeholder, items) {
        if (!select) return;

        select.replaceChildren();

        const placeholderOption = document.createElement("option");
        placeholderOption.value = "";
        placeholderOption.textContent = placeholder;
        placeholderOption.disabled = true;
        placeholderOption.selected = true;

        select.appendChild(placeholderOption);

        items.forEach((item) => {
            const option = document.createElement("option");

            // Supports both strings and objects.
            option.value =
                typeof item === "string" ? item : item.value;

            option.textContent =
                typeof item === "string" ? item : item.label;

            select.appendChild(option);
        });

        select.value = "";

        // Update the visible Nice Select dropdown.
        refreshNiceSelect(select);
    }

    function resetCityAndPostalCode() {
        if (cityInput) {
            cityInput.value = "";
            // If you want users to be able to type into them at all times, remove these two lines from
            // cityInput.readOnly = true;
            removeError(cityInput);
        }

        if (postalCodeInput) {
            postalCodeInput.value = "";
            // If you want users to be able to type into them at all times, remove these two lines from
            // postalCodeInput.readOnly = true;
            removeError(postalCodeInput);
        }
    }

    function resetStateAndAddress() {
        if (stateSelect) {
            stateSelect.replaceChildren();

            const placeholder = document.createElement("option");
            placeholder.value = "";
            placeholder.textContent = "Select a country first";
            placeholder.disabled = true;
            placeholder.selected = true;

            stateSelect.appendChild(placeholder);
            stateSelect.value = "";
            stateSelect.disabled = true;

            refreshNiceSelect(stateSelect);
        }

        resetCityAndPostalCode();
    }

    let stateRequestId = 0;

    async function loadStates(countryName, savedState = "") {
        const requestId = ++stateRequestId;

        if (!stateSelect) return;

        // Reset old states immediately when the country changes.
        setSelectOptions(
            stateSelect,
            "Loading states...",
            []
        );

        stateSelect.disabled = true;
        refreshNiceSelect(stateSelect);
        resetCityAndPostalCode();

        if (!countryName) {
            setSelectOptions(
                stateSelect,
                "Select a country first",
                []
            );
            stateSelect.disabled = true;
            refreshNiceSelect(stateSelect);
            return;
        }

        try {
            const response = await fetch(
                "https://countriesnow.space/api/v0.1/countries/states",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        country: countryName
                    })
                }
            );

            if (!response.ok) {
                throw new Error("Unable to load states.");
            }

            const result = await response.json();

            // Ignore an older response if the user changed country again.
            if (requestId !== stateRequestId) return;

            const states = result?.data?.states || [];

            const stateOptions = states
                .map((state) => ({
                    value: state.name,
                    label: state.name
                }))
                .filter((state) => state.value);

            setSelectOptions(
                stateSelect,
                stateOptions.length
                    ? "Select your state / province"
                    : "No states available",
                stateOptions
            );

            stateSelect.disabled = stateOptions.length === 0;

            // Restore the saved state only if it exists for this country.
            if (
                savedState &&
                stateOptions.some(
                    (state) =>
                        state.value.toLowerCase() ===
                        savedState.toLowerCase()
                )
            ) {
                stateSelect.value = stateOptions.find(
                    (state) =>
                        state.value.toLowerCase() ===
                        savedState.toLowerCase()
                ).value;
            }

            refreshNiceSelect(stateSelect);

            if (stateSelect.value) {
                stateSelect.dispatchEvent(
                    new Event("change", { bubbles: true })
                );
            }
        } catch (error) {
            if (requestId !== stateRequestId) return;

            console.error("State loading failed:", error);

            setSelectOptions(
                stateSelect,
                "Unable to load states. Please try again.",
                []
            );

            stateSelect.disabled = true;
            refreshNiceSelect(stateSelect);
        }
    }

    function applyNationality(nationality, options = {}) {
        const config = countryConfig[nationality];

        if (!config) {
            countrySelect.value = "";
            refreshNiceSelect(countrySelect);
            resetStateAndAddress();

            if (phoneInstance) {
                phoneInstance.setCountry("in");
            }

            return;
        }

        const previousCountry = countrySelect.value;

        countrySelect.value = nationality;
        refreshNiceSelect(countrySelect);
        countrySelect.disabled = true;
        refreshNiceSelect(countrySelect);

        if (phoneInstance) {
            phoneInstance.setCountry(config.iso2);
        }

        if (
            !options.restoring &&
            previousCountry !== nationality
        ) {
            phoneInput.value = "";
            removeError(phoneInput);
        }

        // Reload address dependencies only when needed.
        if (
            options.force ||
            previousCountry !== nationality
        ) {
            resetStateAndAddress();
            loadStates(config.name);
        }
    }

    function isPhoneCountryMatchingNationality() {
        const nationality = nationalitySelect.value;
        const expectedCountry = countryConfig[nationality];

        if (!expectedCountry || !phoneInstance) {
            return false;
        }

        const selectedPhoneCountry = phoneInstance.getSelectedCountryData();
        return selectedPhoneCountry?.iso2 === expectedCountry.iso2;
    }

    // Nationality -> phone country and address country.
    nationalitySelect.addEventListener("change", async () => {
        applyNationality(nationalitySelect.value, {
            force: true
        });

        const config = getCountryConfig(nationalitySelect.value);

        if (config) {
            await loadStates(config.name);
        }

        saveCompletedStep(0);
        saveLocationStepIfAlreadySaved();
        updateReview();
    });


    // COUNTRY CHANGE

    countrySelect.addEventListener("change", async () => {
        const config = getCountryConfig(countrySelect.value);

        removeError(countrySelect);

        // Keep Country consistent with Nationality (Step 1).
        if (
            nationalitySelect.value &&
            config &&
            countrySelect.value !== nationalitySelect.value
        ) {
            countrySelect.value = nationalitySelect.value;
            refreshNiceSelect(countrySelect);

            showError(
                countrySelect,
                "Country must match your nationality."
            );

            return;
        }

        resetStateAndAddress();

        if (config) {
            await loadStates(config.name);
        }

        saveLocationStepIfAlreadySaved();
        updateReview();
    });

    stateSelect.addEventListener("change", () => {
        removeError(stateSelect);

        // A valid state selection unlocks the address inputs.
        if (stateSelect.value) {
            if (cityInput) {
                cityInput.readOnly = false;
            }

            if (postalCodeInput) {
                postalCodeInput.readOnly = !cityInput?.value.trim();
            }
        } else {
            resetCityAndPostalCode();
        }

        saveLocationStepIfAlreadySaved();
        updateReview();
    });

    cityInput.addEventListener("input", () => {
        removeError(cityInput);

        if (postalCodeInput) {
            postalCodeInput.readOnly =
                !stateSelect.value || !cityInput.value.trim();

            if (postalCodeInput.readOnly) {
                postalCodeInput.value = "";
            }
        }

        saveLocationStepIfAlreadySaved();
        updateReview();
    });

    postalCodeInput.addEventListener("input", () => {
        removeError(postalCodeInput);
        saveLocationStepIfAlreadySaved();
        updateReview();
    });



    // City -> postal code.
    cityInput.addEventListener("input", () => {
        const hasCity = Boolean(cityInput.value.trim());

        postalCodeInput.disabled = !hasCity;

        if (!hasCity) {
            postalCodeInput.value = "";
            removeError(postalCodeInput);
        }

        saveLocationStepIfAlreadySaved();
        updateReview();
    });

    postalCodeInput.addEventListener("input", () => {
        saveLocationStepIfAlreadySaved();
        updateReview();
    });

    // RESTORE ADDRESS DEPENDENCIES
    async function initializeLocationDependencies() {
        const savedForm = getSavedForm();
        const savedAddress =
            savedForm.completedSteps?.[3] || {};

        const savedNationality =
            nationalitySelect?.value || "";

        const savedCountry =
            savedAddress.country || savedNationality;

        if (savedNationality && savedCountry !== savedNationality) {
            countrySelect.value = savedNationality;
            refreshNiceSelect(countrySelect);
        } else if (savedCountry) {
            countrySelect.value = savedCountry;
            refreshNiceSelect(countrySelect);
        }

        resetStateAndAddress();

        const config = getCountryConfig(countrySelect.value);

        if (!config) {
            return;
        }

        await loadStates(
            config.name,
            savedAddress.state || ""
        );

        // Restore City and Postal Code only after the state is restored.
        if (stateSelect.value) {
            if (cityInput) {
                cityInput.value = savedAddress.city || "";
                cityInput.readOnly = false;
            }

            if (postalCodeInput) {
                postalCodeInput.value =
                    savedAddress["postal-code"] || "";
                postalCodeInput.readOnly =
                    !cityInput?.value.trim();
            }
        }

        refreshNiceSelect(countrySelect);
        refreshNiceSelect(stateSelect);
    }


    // CONDITIONAL FIELD HELPERS ----------
    function isFieldVisible(input) {
        const employmentOption = input.closest(".employment-status-option");

        if (
            employmentOption && !employmentOption.classList.contains("show")
        ) {
            return false;
        }

        const conditionElement = input.closest("[data-show-if]");

        if (conditionElement) {
            if (!checkCondition(conditionElement)) {
                return false;
            }
        }
        return true;
    }

    function checkCondition(element) {
        const condition = element.dataset.showIf;

        if (!condition) {
            return true;
        }

        const [fieldId, expectedValue] = condition.split("=");
        const field = document.getElementById(fieldId?.trim());
        if (!field) {
            return true;
        }

        if (field.type === "radio") {
            const checkedRadio = document.querySelector(`input[name="${field.name}"]:checked`);
            return (
                checkedRadio && checkedRadio.value === expectedValue.trim()
            );
        }

        return (
            field.value.trim() === expectedValue.trim()
        );
    }

    function updateGenericConditions() {
        document.querySelectorAll("[data-show-if]").forEach((element) => {
            const shouldShow = checkCondition(element);

            element.classList.toggle("active", shouldShow);
            element.querySelectorAll("input, select, textarea").forEach((input) => {
                if (!shouldShow) {
                    removeError(input);
                    input.disabled = true;
                } else {
                    input.disabled = false;
                    input.removeAttribute("disabled");
                }
                if (input.tagName === "SELECT") {
                    refreshNiceSelect(input);
                }
            });
        });
    }

    // EMPLOYMENT CONDITIONAL FIELDS ----------
    function clearInactiveEmploymentData(selectedValue) {
        if (!employmentStatus) return;

        const employmentStep = employmentStatus.closest(".form-step");
        const stepIndex = formSteps.indexOf(employmentStep);

        if (stepIndex === -1) return;

        const savedForm = getSavedForm();
        const stepNumber = stepIndex + 1;
        const savedStepData = savedForm.completedSteps[stepNumber] || {};

        document.querySelectorAll(".employment-status-option").forEach((container) => {
            const isActive = container.dataset.employmentStatus === selectedValue;

            if (isActive) return;

            container.querySelectorAll("input, select, textarea").forEach((input) => {
                if (input.name) {
                    delete savedStepData[input.name];
                }

                if (input.type === "radio" || input.type === "checkbox") {
                    input.checked = false;
                }
                else if (input.type === "file") {
                    input.value = "";

                    const display = input.closest("label")?.querySelector(".document-input-field");
                    if (display) {
                        display.textContent = display.dataset.defaultText || "Upload document";
                    }
                }
                else {
                    input.value = "";
                }

                removeError(input);

                if (input.tagName === "SELECT") {
                    refreshNiceSelect(input);
                }
            });
        });

        savedForm.completedSteps[stepNumber] = savedStepData;
        saveFormData(savedForm);
        updateReview();
    }

    function updateEmploymentFields() {
        if (!employmentStatus) return;

        const selectedValue = employmentStatus.value.trim();

        document.querySelectorAll(".employment-status-option").forEach((container) => {
            const isActive = container.dataset.employmentStatus === selectedValue;

            container.classList.toggle("show", isActive);
            container.style.display = isActive ? "" : "none";
            container.querySelectorAll("input, select, textarea").forEach((input) => {
                input.disabled = !isActive;

                if (!isActive) {
                    removeError(input);
                }
                if (input.tagName === "SELECT") {
                    refreshNiceSelect(input);
                }
            });
        });
        updateGenericConditions();
    }

    // VALIDATION ----------
    function validateStep() {
        const currentFormStep = formSteps[currentStep];
        const requiredFields = currentFormStep.querySelectorAll("[required]");
        let isValid = true;

        requiredFields.forEach((input) => {

            if (
                input.disabled || !isFieldVisible(input)
            ) {
                return;
            }
            removeError(input);

            if (input.type === "radio") {

                const radioGroup = currentFormStep.querySelectorAll(`input[type="radio"][name="${input.name}"]`);
                const isSelected = [...radioGroup].some((radio) => radio.checked);

                if (!isSelected) {
                    isValid = false;
                    showError(
                        input,
                        "Please select an option."
                    );
                }
                return;
            }

            if (input.type === "file") {

                const savedForm = getSavedForm();
                const savedStepData = savedForm.completedSteps[currentStep + 1];
                const hasSavedFile = savedStepData && savedStepData[input.name];

                if (
                    !input.files.length &&
                    !hasSavedFile
                ) {
                    isValid = false;
                    showError(
                        input,
                        "Please upload this document."
                    );
                }
                return;
            }

            if (input.tagName === "SELECT") {
                if (!input.value.trim()) {
                    isValid = false;
                    showError(
                        input,
                        "Please select an option."
                    );
                }
                return;
            }

            if (!input.value.trim()) {
                isValid = false;
                showError(
                    input,
                    "This field is required."
                );
                return;
            }
        });

        const fields = currentFormStep.querySelectorAll("input, select, textarea");
        fields.forEach((input) => {
            if (
                input.disabled ||
                !isFieldVisible(input) ||
                input.type === "radio" ||
                input.type === "file" ||
                input.tagName === "SELECT"
            ) {
                return;
            }

            const value = input.value.trim();
            if (!value) {
                return;
            }

            if (
                input.id === "first-name" ||
                input.id === "last-name"
            ) {

                const namePattern = /^[A-Za-zÀ-ÿ\s'-]+$/;
                if (
                    !namePattern.test(value)
                ) {
                    isValid = false;
                    showError(
                        input,
                        "Please enter letters only."
                    );
                }
            }


            if (input.id === "phone") {
                const countryMatches = isPhoneCountryMatchingNationality();

                if (!countryMatches) {
                    isValid = false;
                    showError(
                        input,
                        "Your phone country must match your nationality."
                    );
                    return;
                }

                let phoneIsValid = false;

                try {
                    phoneIsValid = phoneInstance ? phoneInstance.isValidNumber() : /^\d{7,15}$/.test(input.value.replace(/\D/g, ""));
                } catch (error) {
                    phoneIsValid = /^\d{7,15}$/.test(
                        input.value.replace(/\D/g, "")
                    );
                }

                if (!phoneIsValid) {
                    isValid = false;
                    showError(
                        input,
                        "Please enter a valid phone number for the selected country."
                    );
                }
            }

            if (input.type === "email") {
                const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]{2,}(?:\.[A-Za-z0-9-]{2,})*\.[A-Za-z]{2,}$/;
                if (!emailPattern.test(value)) {
                    isValid = false;
                    showError(
                        input,
                        "Please enter a valid email address."
                    );
                }
            }

            if (input.id === "postal-code") {

                const postalCodePattern = /^[A-Za-z0-9][A-Za-z0-9\s-]{2,9}$/;
                if (!postalCodePattern.test(value)) {
                    isValid = false;
                    showError(
                        input,
                        "Please enter a valid postal code."
                    );
                }
            }

            if (
                input.type === "number" &&
                value !== ""
            ) {
                const numberValue = Number(value);
                if (Number.isNaN(numberValue)) {
                    isValid = false;
                    showError(
                        input,
                        "Please enter a valid number."
                    );
                }
            }

            if (input.type === "date") {
                const selectedDate = new Date(value);
                const today = new Date();
                today.setHours(
                    0,
                    0,
                    0,
                    0
                );

                if (
                    selectedDate >= today
                ) {
                    isValid = false;
                    showError(
                        input,
                        "Please select a valid date of birth."
                    );
                }
            }
        });

        const genderInputs = currentFormStep.querySelectorAll('input[name="gender"]');
        if (genderInputs.length) {

            const genderSelected = [...genderInputs].some((radio) => radio.checked);
            if (!genderSelected) {
                isValid = false;
                showError(
                    genderInputs[0],
                    "Please select your gender."
                );
            }
        }
        return isValid;
    }

    function collectStepData(stepIndex) {
        const step = formSteps[stepIndex];
        const data = {};

        step.querySelectorAll("input, select, textarea").forEach((input) => {
            if (!input.name) {
                return;
            }

            if (!isFieldVisible(input) || input.disabled) {
                return;
            }

            // Radio
            if (input.type === "radio") {
                if (input.checked) {
                    data[input.name] = input.value;
                }
                return;
            }
            // File
            if (input.type === "file") {
                if (input.files.length) {
                    const file = input.files[0];
                    data[input.name] = {
                        type: "file",
                        name: file.name,
                        size: file.size,
                        fileType: file.type
                    };
                }

                return;
            }

            data[input.name] = input.value;
        });
        return data;
    }

    function saveCompletedStep(stepIndex) {
        const savedForm = getSavedForm();
        const newData = collectStepData(stepIndex);
        const oldData = savedForm.completedSteps[stepIndex + 1] || {};
        const step = formSteps[stepIndex];

        step.querySelectorAll('input[type="file"]').forEach((input) => {
            if (
                !input.files.length &&
                oldData[input.name]
            ) {
                newData[input.name] = oldData[input.name];
            }
        });
        savedForm.completedSteps[stepIndex + 1] = newData;
        savedForm.maxUnlockedStep = Math.max(
            savedForm.maxUnlockedStep || 0,
            stepIndex + 1
        );
        saveFormData(savedForm);
    }

    function clearStep(stepIndex) {
        const step = formSteps[stepIndex];
        step.querySelectorAll("input, select, textarea").forEach((input) => {
            if (
                input.type === "radio" ||
                input.type === "checkbox"
            ) {
                input.checked = false;
            }
            else if (
                input.type === "file"
            ) {
                input.value = "";
                const display = input.closest("label")?.querySelector(".document-input-field");
                if (display) {
                    display.textContent = display.dataset.defaultText || "Upload document";
                }
            }
            else if (
                input.tagName === "SELECT"
            ) {
                input.value = "";
                if (
                    typeof $ !== "undefined"
                ) {
                    $(input).niceSelect("update");
                }
            } else {
                input.value = "";
            }
            removeError(input);
        });
        updateEmploymentFields();
    }

    function restoreStep(stepIndex) {
        const savedForm = getSavedForm();
        const savedData = savedForm.completedSteps[stepIndex + 1];

        if (!savedData) {
            clearStep(stepIndex);
            return;
        }

        const step = formSteps[stepIndex];
        step.querySelectorAll("input, select, textarea").forEach((input) => {
            if (!input.name) {
                return;
            }


            const savedValue = savedData[input.name];

            if (savedValue === undefined) {
                const employmentOption = input.closest(".employment-status-option");

                if (employmentOption) {
                    if (input.type === "radio" || input.type === "checkbox") {
                        input.checked = false;
                    }
                    else if (input.type === "file") {
                        input.value = "";

                        const display = input.closest("label")?.querySelector(".document-input-field");
                        if (display) {
                            display.textContent = display.dataset.defaultText || "Upload document";
                        }
                    }
                    else {
                        input.value = "";
                    }

                    removeError(input);
                    if (input.tagName === "SELECT") {
                        refreshNiceSelect(input);
                    }
                }
                return;
            }

            if (input.type === "radio") {
                input.checked = savedValue === input.value;
                return;
            }

            if (input.type === "file") {
                const display = input.closest("label")?.querySelector(".document-input-field");

                if (display) {
                    if (
                        savedValue && savedValue.name
                    ) {
                        display.textContent = savedValue.name;

                    } else {
                        display.textContent = "Upload document";
                    }
                }
                return;
            }

            input.value = savedValue;

            if (
                input.tagName === "SELECT" && typeof $ !== "undefined"
            ) {
                $(input).niceSelect("update");
            }
        });
        updateEmploymentFields();
    }

    function restoreSavedData() {

        cleanSavedEmploymentData();
        const savedForm = getSavedForm();
        maxUnlockedStep = savedForm.maxUnlockedStep || 0;
        if (
            maxUnlockedStep >= formSteps.length
        ) {
            maxUnlockedStep = formSteps.length - 1;
        }

        for (
            let index = 0;
            index < maxUnlockedStep;
            index++
        ) {
            restoreStep(index);
        }

        if (
            maxUnlockedStep >= formSteps.length - 1
        ) {
            currentStep = formSteps.length - 1;
        } else {
            currentStep = maxUnlockedStep;
        }
        updateEmploymentFields();
        showStep(currentStep);
        updateReview();
    }

    function showStep(stepIndex) {
        formSteps.forEach((step, index) => {
            step.classList.toggle("active", index === stepIndex);
        });

        futureSteps.forEach(
            (step, index) => {
                step.classList.remove(
                    "active",
                    "complete"
                );

                if (
                    index < maxUnlockedStep
                ) {
                    step.classList.add(
                        "active",
                        "complete"
                    );
                }

                if (
                    index === stepIndex
                ) {
                    step.classList.add(
                        "active"
                    );
                }
            }
        );

        if (stepIndex === 0) {
            backBtn.classList.remove(
                "active"
            );

        } else {
            backBtn.classList.add(
                "active"
            );
        }

        if (
            stepIndex === formSteps.length - 1
        ) {
            nextBtn.style.display = "none";
            submitBtn.classList.add(
                "active"
            );

        } else {
            nextBtn.style.display = "";
            submitBtn.classList.remove(
                "active"
            );
        }
        if (stepIndex === 2) {
            initializeLocationDependencies();
        }
    }


    // =========================================
    // PROGRESS CLICK
    // =========================================
    futureSteps.forEach((step, index) => {
        step.addEventListener("click", () => {

            if (
                index >
                maxUnlockedStep
            ) {
                return;
            }

            if (
                index !== currentStep
            ) {
                restoreStep(currentStep);
                currentStep = index;
                restoreStep(currentStep);
            }

            showStep(currentStep);
            updateReview();
        }
        );
    });

    // =========================================
    // CONTINUE BUTTON
    // =========================================

    nextBtn.addEventListener("click", () => {
        if (!validateStep()) {
            return;
        }

        saveCompletedStep(
            currentStep
        );

        maxUnlockedStep = Math.max(
            maxUnlockedStep,
            currentStep + 1
        );

        currentStep++;

        if (
            currentStep <
            formSteps.length
        ) {

            const savedForm = getSavedForm();
            savedForm.maxUnlockedStep = maxUnlockedStep;
            saveFormData(savedForm);




            const nextStepData = savedForm.completedSteps[currentStep + 1];
            if (nextStepData) {
                restoreStep(currentStep);
            } else {
                clearStep(currentStep);
            }

            showStep(currentStep);
            updateReview();
        }
    });

    // =========================================
    // BACK BUTTON
    // =========================================
    backBtn.addEventListener("click", () => {
        if (currentStep === 0) {
            return;
        }

        restoreStep(currentStep);
        currentStep--;
        restoreStep(currentStep);
        showStep(currentStep);
        updateReview();
    });

    // =========================================
    // LIVE ERROR REMOVAL
    // =========================================
    form.addEventListener("input", (event) => {
        const input = event.target;
        if (
            input.matches(
                "input, textarea"
            )
        ) {
            removeError(input);
        }
    });

    form.addEventListener("change", (event) => {
        const input = event.target;
        if (
            input.matches(
                "input, select, textarea"
            )
        ) {
            removeError(input);
        }
        if (
            input.name === "gender"
        ) {
            const genderInputs = form.querySelectorAll('input[name="gender"]');
            const selected = [...genderInputs].some((radio) => radio.checked);
            if (selected) {
                removeError(
                    genderInputs[0]
                );
            }
        }

        if (input.id === "employment-status") {
            removeError(input);

            const selectedValue = input.value.trim();
            clearInactiveEmploymentData(selectedValue);
            updateEmploymentFields();
            saveCompletedStep(currentStep);
            updateReview();
        }
    });

    // =========================================
    // NICE SELECT OPTION CLICK
    // =========================================
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
            setTimeout(() => {
                updateEmploymentFields();
            }, 0);
        }
    });

    // =========================================
    // FILE CHANGE
    // =========================================
    form.querySelectorAll('input[type="file"]').forEach((input) => {
        input.addEventListener("change", () => {

            removeError(input);
            const file = input.files[0];
            if (!file) {
                return;
            }

            const display = input.closest("label")?.querySelector(".document-input-field");
            if (display) {
                if (!display.dataset.defaultText) {
                    display.dataset.defaultText = display.textContent;
                }
                display.textContent = file.name;
            }
        });
    });

    // =========================================
    // REVIEW
    // =========================================
    function getDisplayValue(input) {

        if (!input) {
            return "Not provided";
        }
        if (
            input.type === "radio"
        ) {
            const checked = document.querySelector(`input[name="${input.name}"]:checked`);
            return checked ? getRadioLabel(checked) : "Not selected";
        }
        if (
            input.type === "file"
        ) {

            if (input.files.length) {
                return input.files[0].name;
            }

            const savedForm = getSavedForm();
            const step = input.closest(".form-step");
            const stepIndex = formSteps.indexOf(step);
            const savedData = savedForm.completedSteps[stepIndex + 1];

            if (
                savedData &&
                savedData[input.name]
            ) {
                return savedData[
                    input.name
                ].name;
            }
            return "Not uploaded";
        }
        if (
            input.tagName === "SELECT"
        ) {
            const selectedOption = input.options[input.selectedIndex];
            return selectedOption ? selectedOption.textContent.trim() : "Not selected";
        }
        return input.value.trim() || "Not provided";
    }

    function getRadioLabel(radio) {
        const label = radio.closest("label");
        if (!label) {
            return radio.value;
        }
        return label.textContent.trim();
    }

    function createReviewRow(
        label,
        value
    ) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${escapeHtml(label)}</td>
            <td>
                <div class="table-value-wrapper">
                    <span class="table-value">
                        ${escapeHtml(value)}
                    </span>
                </div>
            </td>
        `;
        return row;
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function addReviewRow(
        tbody,
        label,
        selector
    ) {

        const input = document.querySelector(selector);
        if (!input) {
            return;
        }

        if (
            input.closest(
                ".employment-status-option"
            ) &&
            !input.closest(
                ".employment-status-option"
            ).classList.contains("show")
        ) {
            return;
        }

        const value = getDisplayValue(input);
        tbody.appendChild(
            createReviewRow(
                label,
                value
            )
        );
    }

    function updateReview() {
        const reviewBlocks = document.querySelectorAll(".form-step-five .review-table-block");
        if (reviewBlocks.length < 3) {
            return;
        }

        // =====================================
        // PERSONAL DETAILS
        // =====================================

        const personalBody = reviewBlocks[0].querySelector(".review-tbody");

        if (personalBody) {
            personalBody.innerHTML = "";
            addReviewRow(
                personalBody,
                "First Name",
                "#first-name"
            );

            addReviewRow(
                personalBody,
                "Last Name",
                "#last-name"
            );

            addReviewRow(
                personalBody,
                "Email",
                "#email"
            );

            addReviewRow(
                personalBody,
                "Phone",
                "#phone"
            );

            addReviewRow(
                personalBody,
                "Date of Birth",
                "#date-of-birth"
            );

            addReviewRow(
                personalBody,
                "Nationality",
                "#nationality"
            );

            addReviewRow(
                personalBody,
                "Gender",
                "#male"
            );
        }

        // =====================================
        // EMPLOYMENT
        // =====================================

        const employmentBody = reviewBlocks[1].querySelector(".review-tbody");
        if (employmentBody) {
            employmentBody.innerHTML = "";
            addReviewRow(
                employmentBody,
                "Status",
                "#employment-status"
            );

            const status = employmentStatus?.value;
            if (status === "yes") {
                addReviewRow(
                    employmentBody,
                    "Job Title",
                    "#job-title"
                );

                addReviewRow(
                    employmentBody,
                    "Company Name",
                    "#company-name"
                );

                addReviewRow(
                    employmentBody,
                    "Work Email",
                    "#work-email"
                );

                addReviewRow(
                    employmentBody,
                    "Years of Experience",
                    "#years-experience"
                );
            }

            if (status === "no") {
                addReviewRow(
                    employmentBody,
                    "Current Situation",
                    "#current-situation"
                );

                addReviewRow(
                    employmentBody,
                    "Additional Information",
                    "#employment-notes"
                );
            }


            if (status === "self-employed") {
                addReviewRow(
                    employmentBody,
                    "Business Name",
                    "#business-name"
                );

                addReviewRow(
                    employmentBody,
                    "Business Type",
                    "#business-type"
                );

                addReviewRow(
                    employmentBody,
                    "Your Role",
                    "#business-role"
                );

                addReviewRow(
                    employmentBody,
                    "Years in Business",
                    "#business-years"
                );
            }

            if (status === "student") {
                addReviewRow(
                    employmentBody,
                    "Institution Name",
                    "#institution-name"
                );

                addReviewRow(
                    employmentBody,
                    "Field of Study",
                    "#field-of-study"
                );

                addReviewRow(
                    employmentBody,
                    "Education Level",
                    "#education-level"
                );

                addReviewRow(
                    employmentBody,
                    "Expected Graduation Year",
                    "#graduation-year"
                );
            }
        }


        // =====================================
        // ADDRESS
        // ===================================== 
        const addressBody = reviewBlocks[2].querySelector(".review-tbody");
        if (addressBody) {
            addressBody.innerHTML = "";

            addReviewRow(
                addressBody,
                "Address Line 1",
                "#address-line-1"
            );

            addReviewRow(
                addressBody,
                "Address Line 2",
                "#address-line-2"
            );

            addReviewRow(
                addressBody,
                "Country",
                "#country"
            );

            addReviewRow(
                addressBody,
                "State / Province",
                "#state"
            );

            addReviewRow(
                addressBody,
                "City",
                "#city"
            );

            addReviewRow(
                addressBody,
                "Postal Code",
                "#postal-code"
            );

            addReviewRow(
                addressBody,
                "Additional Address Details",
                "#address-notes"
            );
        }


        // =====================================
        // DOCUMENTS
        // =====================================

        const documentBody = reviewBlocks[3]?.querySelector(".review-tbody");

        if (documentBody) {
            documentBody.innerHTML = "";

            addReviewRow(
                documentBody,
                "Identity Document",
                "#identity-document"
            );

            addReviewRow(
                documentBody,
                "Proof of Address",
                "#proof-of-address"
            );

            addReviewRow(
                documentBody,
                "Passport-Size Photo",
                "#passport-photo"
            );

            addReviewRow(
                documentBody,
                "Education Certificate",
                "#education-certificate"
            );

            addReviewRow(
                documentBody,
                "Financial Proof",
                "#financial-proof"
            );

            addReviewRow(
                documentBody,
                "Supporting Document",
                "#supporting-document"
            );
        }
    }


    // =========================================
    // SUBMIT
    // =========================================
    submitBtn.addEventListener("click", () => {
        updateReview();

        // Make sure review step
        // itself is displayed.
        if (
            currentStep !== formSteps.length - 1
        ) {
            return;
        }

        // Final validation:
        // all previously completed
        // steps are already validated
        // before Continue.
        //
        // Review itself has no required
        // input fields.


        // Clear saved application.
        sessionStorage.removeItem(
            STORAGE_KEY
        );

        // Hide form/progress.
        document.querySelector(".future-step-wrapper").style.display = "none";
        form.style.display = "none";

        // Show confirmation.
        confirmationMessage.classList.add("active");
    });

    // =========================================
    // START NEW APPLICATION
    // =========================================
    if (startNewApplicationBtn) {
        startNewApplicationBtn.addEventListener("click", () => {

            sessionStorage.removeItem(STORAGE_KEY);

            currentStep = 0;
            maxUnlockedStep = 0;

            formSteps.forEach((_, index) => {
                clearStep(index);
            });

            if (phoneInstance) {
                phoneInstance.setCountry("in");
            }

            if (phoneInput) {
                phoneInput.value = "";
                removeError(phoneInput);
            }

            formSteps.forEach((step) => {
                removeStepErrors(step);
            });

            document.querySelectorAll(".document-input-field")
                .forEach((element) => {
                    const defaultText = element.dataset.defaultText;
                    if (defaultText) {
                        element.textContent = defaultText;
                    }
                });

            confirmationMessage.classList.remove("active");

            document.querySelector(".future-step-wrapper").style.display = "";
            form.style.display = "";

            updateEmploymentFields();
            showStep(0);
            updateReview();
        });
    }

    // =========================================
    // INITIALIZE
    // =========================================

    document.querySelectorAll(".document-input-field")
        .forEach((element) => {
            element.dataset.defaultText = element.textContent.trim();
        });


    updateEmploymentFields();
    restoreSavedData();

    function enableAllSelectOptions() {
        document.querySelectorAll("select").forEach((select) => {
            Array.from(select.options).forEach((option, index) => {
                const isPlaceholder = index === 0 && option.value.trim() === "";

                if (isPlaceholder) {
                    option.disabled = true;
                    option.setAttribute("disabled", "");
                } else {
                    option.disabled = false;
                    option.removeAttribute("disabled");
                }
            });

            refreshNiceSelect(select);
        });
    }

    function saveLocationStepIfAlreadySaved() {
        const savedForm = getSavedForm();

        // Only update the address if the user has already
        // unlocked and saved this step.
        if (
            !savedForm.completedSteps?.[3] &&
            (savedForm.maxUnlockedStep || 0) < 3
        ) {
            return;
        }

        savedForm.completedSteps = savedForm.completedSteps || {};
        savedForm.completedSteps[3] = collectStepData(2);
        saveFormData(savedForm);
    }

});


document.addEventListener("input", function (event) {
    const input = event.target;

    if (input.matches("input[type='number'][data-max-digits]")) {
        const maxDigits = Number(input.dataset.maxDigits);

        if (input.value.length > maxDigits) {
            input.value = input.value.slice(0, maxDigits);
        }
    }
});