$(document).ready(function () {
    $("select").niceSelect();
});

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".form-step-wrapper");
    const formSteps = [...document.querySelectorAll(".form-step")];

    const nonNegativeFields = [
        document.getElementById("years-experience"),
        document.getElementById("business-years"),
        document.getElementById("graduation-year")
    ].filter(Boolean);

    nonNegativeFields.forEach((input) => {
        input.min = "0";

        input.addEventListener("keydown", (event) => {
            if (
                event.key === "+" ||
                event.key === "-" ||
                event.code === "NumpadAdd" ||
                event.code === "NumpadSubtract"
            ) {
                event.preventDefault();
            }
        });

        input.addEventListener("paste", (event) => {
            const pastedText = event.clipboardData?.getData("text") || "";

            if (/[+-]/.test(pastedText)) {
                event.preventDefault();
                showError(input, "Plus (+) and minus (-) signs are not allowed.");
            }
        });

        input.addEventListener("input", () => {
            const value = input.value.trim();

            if (/[+-]/.test(value)) {
                showError(
                    input,
                    "Plus (+) and minus (-) signs are not allowed."
                );
                return;
            }

            if (value !== "" && !/^\d+(\.\d+)?$/.test(value)) {
                showError(input, "Please enter a valid non-negative number.");
                return;
            }

            if (value !== "" && Number(value) < 0) {
                showError(input, "Negative values are not allowed.");
                return;
            }

            removeError(input);
        });

        const initialValue = input.value.trim();

        if (/[+-]/.test(initialValue)) {
            showError(input, "Plus (+) and minus (-) signs are not allowed.");
        } else if (
            initialValue !== "" &&
            !/^\d+(\.\d+)?$/.test(initialValue)
        ) {
            showError(input, "Please enter a valid non-negative number.");
        }
    });

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
    function getSavedForm() {
        try {
            const savedData = sessionStorage.getItem(STORAGE_KEY);
            if (!savedData) {
                return { completedSteps: {}, maxUnlockedStep: 0 };
            }
            return JSON.parse(savedData);
        } catch (error) {
            return { completedSteps: {}, maxUnlockedStep: 0 };
        }
    }
    function saveFormData(data) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
    function getErrorElement(input) {
        if (input.tagName === "SELECT") {
            const niceSelect = input.nextElementSibling;
            if (niceSelect && niceSelect.classList.contains("nice-select")) {
                return niceSelect;
            }
        }
        if (input.type === "radio") {
            return input.closest(".gender-wrapper");
        }
        if (input.type === "file") {
            const fileLabel = input.closest("label");
            if (fileLabel) {
                return fileLabel.querySelector(".document-input-field");
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
            errorElement.classList.remove("input-error-field");
        }
        const errorMessage = inputStack.querySelector(".input-error");
        if (errorMessage) {
            errorMessage.remove();
        }
    }
    function removeStepErrors(step) {
        step.querySelectorAll("input, select, textarea").forEach((input) => {
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
                const originalOption = Array.from(select.options).find((item) => item.value === value);
                const isDisabled = !originalOption || originalOption.disabled || select.disabled;
                option.classList.toggle("disabled", isDisabled);
                option.setAttribute("aria-disabled", String(isDisabled));
            });
        }
    }
    const nationalitySelect = document.getElementById("nationality");
    const countrySelect = document.getElementById("country");
    const stateSelect = document.getElementById("state");
    const cityInput = document.getElementById("city");
    const postalCodeInput = document.getElementById("postal-code");
    const phoneInput = document.getElementById("phone");
    const countryConfig = {
        australia: { name: "Australia", iso2: "au", dialCode: "+61" },
        brazil: { name: "Brazil", iso2: "br", dialCode: "+55" },
        canada: { name: "Canada", iso2: "ca", dialCode: "+1" },
        china: { name: "China", iso2: "cn", dialCode: "+86" },
        egypt: { name: "Egypt", iso2: "eg", dialCode: "+20" },
        germany: { name: "Germany", iso2: "de", dialCode: "+49" },
        india: { name: "India", iso2: "in", dialCode: "+91" },
        italy: { name: "Italy", iso2: "it", dialCode: "+39" },
        japan: { name: "Japan", iso2: "jp", dialCode: "+81" },
        mexico: { name: "Mexico", iso2: "mx", dialCode: "+52" },
        nigeria: { name: "Nigeria", iso2: "ng", dialCode: "+234" },
        russia: { name: "Russia", iso2: "ru", dialCode: "+7" },
        spain: { name: "Spain", iso2: "es", dialCode: "+34" },
        "united-kingdom": { name: "United Kingdom", iso2: "gb", dialCode: "+44" },
        "united-states": { name: "United States", iso2: "us", dialCode: "+1" },
    };
    function getCountryConfig(value) {
        if (!value) return null;
        const normalizedValue = value.trim().toLowerCase();
        return (
            countryConfig[normalizedValue] ||
            Object.values(countryConfig).find((country) => country.name.toLowerCase() === normalizedValue) ||
            null
        );
    }
    const phoneInstance =
        window.intlTelInput && phoneInput
            ? window.intlTelInput(phoneInput, {
                initialCountry: "in",
                separateDialCode: !0,
                countrySelectorMode: "DROPDOWN",
                autoPlaceholder: "off",
                loadUtils: () => import("https://cdn.jsdelivr.net/npm/intl-tel-input@25.12.5/build/js/utils.js"),
            })
            : null;
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
        placeholderOption.disabled = !0;
        placeholderOption.selected = !0;
        select.appendChild(placeholderOption);
        items.forEach((item) => {
            const option = document.createElement("option");
            option.value = typeof item === "string" ? item : item.value;
            option.textContent = typeof item === "string" ? item : item.label;
            select.appendChild(option);
        });
        select.value = "";
        refreshNiceSelect(select);
    }
    function resetCityAndPostalCode() {
        if (cityInput) {
            cityInput.value = "";
            removeError(cityInput);
        }
        if (postalCodeInput) {
            postalCodeInput.value = "";
            removeError(postalCodeInput);
        }
    }
    function resetStateAndAddress() {
        if (stateSelect) {
            stateSelect.replaceChildren();
            const placeholder = document.createElement("option");
            placeholder.value = "";
            placeholder.textContent = "Select a country first";
            placeholder.disabled = !0;
            placeholder.selected = !0;
            stateSelect.appendChild(placeholder);
            stateSelect.value = "";
            stateSelect.disabled = !0;
            refreshNiceSelect(stateSelect);
        }
        resetCityAndPostalCode();
    }
    let stateRequestId = 0;
    let isRestoringLocation = !1;
    let hasPreparedLocationStep = !1;
    async function loadStates(countryName, savedState = "") {
        const requestId = ++stateRequestId;
        if (!stateSelect) return;
        setSelectOptions(stateSelect, "Loading states...", []);
        stateSelect.disabled = !0;
        refreshNiceSelect(stateSelect);
        resetCityAndPostalCode();
        if (!countryName) {
            setSelectOptions(stateSelect, "Select a country first", []);
            stateSelect.disabled = !0;
            refreshNiceSelect(stateSelect);
            return;
        }
        try {
            const response = await fetch("https://countriesnow.space/api/v0.1/countries/states", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ country: countryName }),
            });
            if (!response.ok) {
                throw new Error("Unable to load states.");
            }
            const result = await response.json();
            if (requestId !== stateRequestId) return;
            const states = result?.data?.states || [];
            const stateOptions = states
                .map((state) => ({ value: state.name, label: state.name }))
                .filter((state) => state.value);
            setSelectOptions(
                stateSelect,
                stateOptions.length ? "Select your state / province" : "No states available",
                stateOptions
            );
            stateSelect.disabled = stateOptions.length === 0;
            if (savedState && stateOptions.some((state) => state.value.toLowerCase() === savedState.toLowerCase())) {
                stateSelect.value = stateOptions.find(
                    (state) => state.value.toLowerCase() === savedState.toLowerCase()
                ).value;
            }
            refreshNiceSelect(stateSelect);
            if (stateSelect.value) {
                stateSelect.dispatchEvent(new Event("change", { bubbles: !0 }));
            }
        } catch (error) {
            if (requestId !== stateRequestId) return;
            console.error("State loading failed:", error);
            setSelectOptions(stateSelect, "Unable to load states. Please try again.", []);
            stateSelect.disabled = !0;
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
        countrySelect.disabled = !0;
        refreshNiceSelect(countrySelect);
        if (phoneInstance) {
            phoneInstance.setCountry(config.iso2);
        }
        if (!options.restoring && previousCountry !== nationality) {
            phoneInput.value = "";
            removeError(phoneInput);
        }
        if (options.force || previousCountry !== nationality) {
            resetStateAndAddress();
            loadStates(config.name);
        }
    }
    function isPhoneCountryMatchingNationality() {
        const nationality = nationalitySelect.value;
        const expectedCountry = countryConfig[nationality];
        if (!expectedCountry || !phoneInstance) {
            return !1;
        }
        const selectedPhoneCountry = phoneInstance.getSelectedCountryData();
        return selectedPhoneCountry?.iso2 === expectedCountry.iso2;
    }
    nationalitySelect.addEventListener("change", () => {
        applyNationality(nationalitySelect.value, { force: !0 });
        saveCompletedStep(0);
        saveLocationStepIfAlreadySaved();
        updateReview();
    });
    countrySelect.addEventListener("change", async () => {
        const config = getCountryConfig(countrySelect.value);
        removeError(countrySelect);
        if (nationalitySelect.value && config && countrySelect.value !== nationalitySelect.value) {
            countrySelect.value = nationalitySelect.value;
            refreshNiceSelect(countrySelect);
            showError(countrySelect, "Country must match your nationality.");
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
        if (stateSelect.value) {
            if (cityInput) {
                cityInput.readOnly = !1;
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
        const hasState = Boolean(stateSelect.value);
        const hasCity = Boolean(cityInput.value.trim());
        cityInput.readOnly = !hasState;
        postalCodeInput.disabled = !(hasState && hasCity);
        postalCodeInput.readOnly = !(hasState && hasCity);
        if (!hasCity || !hasState) {
            postalCodeInput.value = "";
            removeError(postalCodeInput);
        }
        saveLocationStepIfAlreadySaved();
        updateReview();
    });
    postalCodeInput.addEventListener("input", () => {
        removeError(postalCodeInput);
        saveLocationStepIfAlreadySaved();
        updateReview();
    });

    function saveLocationStepIfAlreadySaved() {
        if (isRestoringLocation || currentStep !== 2) {
            return;
        }

        const savedForm = getSavedForm();
        savedForm.completedSteps = savedForm.completedSteps || {};
        const stepThreeCompleted = (Number(savedForm.maxUnlockedStep) || 0) >= 3;

        if (!stepThreeCompleted) {
            delete savedForm.locationDraft;
            saveFormData(savedForm);
            return;
        }

        const addressData = {
            country: countrySelect?.value || "",
            state: stateSelect?.value || "",
            city: cityInput?.value || "",
            "postal-code": postalCodeInput?.value || ""
        };

        savedForm.completedSteps[3] = {
            ...(savedForm.completedSteps[3] || {}),
            ...addressData
        };

        saveFormData(savedForm);
    }
    async function initializeLocationDependencies() {
        if (isRestoringLocation) return;
        isRestoringLocation = !0;
        try {
            const savedForm = getSavedForm();
            const stepThreeCompleted = (Number(savedForm.maxUnlockedStep) || 0) >= 3;
            const savedAddress = stepThreeCompleted ? savedForm.completedSteps?.[3] || {} : {};
            if (!hasPreparedLocationStep) {
                hasPreparedLocationStep = !0;
                if (!stepThreeCompleted) {
                    clearUncommittedStepThreeFields();
                }
            }
            const savedNationality = nationalitySelect?.value || "";
            const savedCountry = savedNationality || savedAddress.country || "";
            if (countrySelect) {
                countrySelect.value = savedCountry;
                refreshNiceSelect(countrySelect);
            }
            resetStateAndAddress();
            const config = getCountryConfig(savedCountry);
            if (!config) return;
            await loadStates(config.name, savedAddress.state || "");
            if (stateSelect?.value) {
                if (cityInput) {
                    cityInput.value = savedAddress.city || "";
                    cityInput.readOnly = !1;
                }
                if (postalCodeInput) {
                    postalCodeInput.value = savedAddress["postal-code"] || "";
                    const canEnterPostalCode = Boolean(cityInput?.value.trim());
                    postalCodeInput.disabled = !canEnterPostalCode;
                    postalCodeInput.readOnly = !canEnterPostalCode;
                }
            }
            refreshNiceSelect(countrySelect);
            refreshNiceSelect(stateSelect);
        } catch (error) {
            console.error("Address restoration failed:", error);
        } finally {
            isRestoringLocation = !1;
        }
    }
    function clearUncommittedStepThreeFields() {
        const step = formSteps[2];
        if (!step) return;

        step.querySelectorAll("input, select, textarea").forEach((field) => {
            if (field.type === "radio" || field.type === "checkbox") {
                field.checked = false;
            } else if (field.type === "file") {
                field.value = "";

                const display = field.closest("label")?.querySelector(".document-input-field");

                if (display) {
                    display.textContent = display.dataset.defaultText || "Upload document";
                }
            } else {
                field.value = "";
            }

            removeError(field);
            field.classList.remove("error", "is-invalid");

            const errorMessage = field.parentElement?.querySelector(".error-message");

            if (errorMessage) {
                errorMessage.remove();
            }

            if (field.tagName === "SELECT") {
                refreshNiceSelect(field);
            }
        });

        resetStateAndAddress();

        const savedForm = getSavedForm();
        delete savedForm.locationDraft;
        saveFormData(savedForm);
    }

    function isFieldVisible(input) {
        const employmentOption = input.closest(".employment-status-option");
        if (employmentOption && !employmentOption.classList.contains("show")) {
            return !1;
        }
        const conditionElement = input.closest("[data-show-if]");
        if (conditionElement) {
            if (!checkCondition(conditionElement)) {
                return !1;
            }
        }
        return !0;
    }
    function checkCondition(element) {
        const condition = element.dataset.showIf;
        if (!condition) {
            return !0;
        }
        const [fieldId, expectedValue] = condition.split("=");
        const field = document.getElementById(fieldId?.trim());
        if (!field) {
            return !0;
        }
        if (field.type === "radio") {
            const checkedRadio = document.querySelector(`input[name="${field.name}"]:checked`);
            return checkedRadio && checkedRadio.value === expectedValue.trim();
        }
        return field.value.trim() === expectedValue.trim();
    }
    function updateGenericConditions() {
        document.querySelectorAll("[data-show-if]").forEach((element) => {
            const shouldShow = checkCondition(element);
            element.classList.toggle("active", shouldShow);
            element.querySelectorAll("input, select, textarea").forEach((input) => {
                if (!shouldShow) {
                    removeError(input);
                    input.disabled = !0;
                } else {
                    input.disabled = !1;
                    input.removeAttribute("disabled");
                }
                if (input.tagName === "SELECT") {
                    refreshNiceSelect(input);
                }
            });
        });
    }
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
                    input.checked = !1;
                } else if (input.type === "file") {
                    input.value = "";
                    const display = input.closest("label")?.querySelector(".document-input-field");
                    if (display) {
                        display.textContent = display.dataset.defaultText || "Upload document";
                    }
                } else {
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
    function validateStep() {
        const currentFormStep = formSteps[currentStep];
        const requiredFields = currentFormStep.querySelectorAll("[required]");
        let isValid = !0;
        requiredFields.forEach((input) => {
            if (input.disabled || !isFieldVisible(input)) {
                return;
            }
            removeError(input);
            if (input.type === "radio") {
                const radioGroup = currentFormStep.querySelectorAll(`input[type="radio"][name="${input.name}"]`);
                const isSelected = [...radioGroup].some((radio) => radio.checked);
                if (!isSelected) {
                    isValid = !1;
                    showError(input, "Please select an option.");
                }
                return;
            }
            if (input.type === "file") {
                const savedForm = getSavedForm();
                const savedStepData = savedForm.completedSteps[currentStep + 1];
                const hasSavedFile = savedStepData && savedStepData[input.name];
                if (!input.files.length && !hasSavedFile) {
                    isValid = !1;
                    showError(input, "Please upload this document.");
                }
                return;
            }
            if (input.tagName === "SELECT") {
                if (!input.value.trim()) {
                    isValid = !1;
                    showError(input, "Please select an option.");
                }
                return;
            }
            if (!input.value.trim()) {
                isValid = !1;
                showError(input, "This field is required.");
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
            if (input.id === "first-name" || input.id === "last-name") {
                const namePattern = /^[A-Za-zÀ-ÿ\s'-]+$/;
                if (!namePattern.test(value)) {
                    isValid = !1;
                    showError(input, "Please enter letters only.");
                }
            }
            if (input.id === "phone") {
                const countryMatches = isPhoneCountryMatchingNationality();
                if (!countryMatches) {
                    isValid = !1;
                    showError(input, "Your phone country must match your nationality.");
                    return;
                }
                let phoneIsValid = !1;
                try {
                    phoneIsValid = phoneInstance
                        ? phoneInstance.isValidNumber()
                        : /^\d{7,15}$/.test(input.value.replace(/\D/g, ""));
                } catch (error) {
                    phoneIsValid = /^\d{7,15}$/.test(input.value.replace(/\D/g, ""));
                }
                if (!phoneIsValid) {
                    isValid = !1;
                    showError(input, "Please enter a valid phone number for the selected country.");
                }
            }
            if (input.type === "email") {
                const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]{2,}(?:\.[A-Za-z0-9-]{2,})*\.[A-Za-z]{2,}$/;
                if (!emailPattern.test(value)) {
                    isValid = !1;
                    showError(input, "Please enter a valid email address.");
                }
            }
            if (input.id === "postal-code") {
                const postalCodePattern = /^[A-Za-z0-9][A-Za-z0-9\s-]{2,9}$/;
                if (!postalCodePattern.test(value)) {
                    isValid = !1;
                    showError(input, "Please enter a valid postal code.");
                }
            }
            if (input.type === "number" && value !== "") {
                const numberValue = Number(value);

                if (!Number.isFinite(numberValue)) {
                    isValid = false;
                    showError(input, "Please enter a valid number.");
                } else if (numberValue < 0) {
                    isValid = false;
                    showError(input, "Negative values are not allowed.");
                } else if (!input.validity.valid) {
                    isValid = false;
                    showError(input, "Please enter a valid value.");
                }
            }
            if (input.type === "date") {
                const selectedDate = new Date(value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (selectedDate >= today) {
                    isValid = !1;
                    showError(input, "Please select a valid date of birth.");
                }
            }
        });
        const genderInputs = currentFormStep.querySelectorAll('input[name="gender"]');
        if (genderInputs.length) {
            const genderSelected = [...genderInputs].some((radio) => radio.checked);
            if (!genderSelected) {
                isValid = !1;
                showError(genderInputs[0], "Please select your gender.");
            }
        }
        if (currentStep === 2) {
            if (cityInput && !cityInput.value.trim()) {
                isValid = false;
                showError(cityInput, "City is required.");
            } else if (cityInput) {
                removeError(cityInput);
            }

            if (postalCodeInput && !postalCodeInput.value.trim()) {
                isValid = false;
                showError(postalCodeInput, "Postal Code is required.");
            } else if (postalCodeInput && postalCodeInput.value.trim()) {
                const postalCodePattern = /^[A-Za-z0-9][A-Za-z0-9\s-]{2,9}$/;

                if (!postalCodePattern.test(postalCodeInput.value.trim())) {
                    isValid = false;
                    showError(postalCodeInput, "Please enter a valid postal code.");
                } else {
                    removeError(postalCodeInput);
                }
            }

            if (nationalitySelect && countrySelect) {
                const nationalityConfig = getCountryConfig(nationalitySelect.value);
                const addressCountryConfig = getCountryConfig(countrySelect.value);

                const countriesMatch =
                    nationalityConfig &&
                    addressCountryConfig &&
                    nationalityConfig.iso2 === addressCountryConfig.iso2;

                if (!countriesMatch) {
                    isValid = false;
                    showError(countrySelect, "Country must match your nationality.");
                } else {
                    removeError(countrySelect);
                }
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
            if (input.type === "radio") {
                if (input.checked) {
                    data[input.name] = input.value;
                }
                return;
            }
            if (input.type === "file") {
                if (input.files.length) {
                    const file = input.files[0];
                    data[input.name] = { type: "file", name: file.name, size: file.size, fileType: file.type };
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
        if (stepIndex === 2) {
            if (countrySelect) {
                newData.country = countrySelect.value;
            }
            if (stateSelect) {
                newData.state = stateSelect.value;
            }
            if (cityInput) {
                newData.city = cityInput.value;
            }
            if (postalCodeInput) {
                newData["postal-code"] = postalCodeInput.value;
            }
        }
        step.querySelectorAll('input[type="file"]').forEach((input) => {
            if (!input.files.length && oldData[input.name]) {
                newData[input.name] = oldData[input.name];
            }
        });
        savedForm.completedSteps[stepIndex + 1] = newData;
        if (stepIndex === 2) {
            delete savedForm.locationDraft;
        }
        savedForm.maxUnlockedStep = Math.max(savedForm.maxUnlockedStep || 0, stepIndex + 1);
        saveFormData(savedForm);
    }
    function clearStep(stepIndex) {
        const step = formSteps[stepIndex];
        step.querySelectorAll("input, select, textarea").forEach((input) => {
            if (input.type === "radio" || input.type === "checkbox") {
                input.checked = !1;
            } else if (input.type === "file") {
                input.value = "";
                const display = input.closest("label")?.querySelector(".document-input-field");
                if (display) {
                    display.textContent = display.dataset.defaultText || "Upload document";
                }
            } else if (input.tagName === "SELECT") {
                input.value = "";
                if (typeof $ !== "undefined") {
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
                        input.checked = !1;
                    } else if (input.type === "file") {
                        input.value = "";
                        const display = input.closest("label")?.querySelector(".document-input-field");
                        if (display) {
                            display.textContent = display.dataset.defaultText || "Upload document";
                        }
                    } else {
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
                    if (savedValue && savedValue.name) {
                        display.textContent = savedValue.name;
                    } else {
                        display.textContent = "Upload document";
                    }
                }
                return;
            }
            input.value = savedValue;
            if (input.tagName === "SELECT" && typeof $ !== "undefined") {
                $(input).niceSelect("update");
            }
        });
        updateEmploymentFields();
    }
    function restoreSavedData() {
        cleanSavedEmploymentData();
        const savedForm = getSavedForm();
        maxUnlockedStep = Number(savedForm.maxUnlockedStep) || 0;
        maxUnlockedStep = Math.max(0, Math.min(maxUnlockedStep, formSteps.length - 1));
        for (let index = 0; index < maxUnlockedStep; index++) {
            restoreStep(index);
        }
        const savedNationality = nationalitySelect?.value;
        const nationalityConfig = getCountryConfig(savedNationality);
        if (phoneInstance && nationalityConfig) {
            phoneInstance.setCountry(nationalityConfig.iso2);
        }
        if (
            Number.isInteger(savedForm.currentStep) &&
            savedForm.currentStep >= 0 &&
            savedForm.currentStep < formSteps.length &&
            savedForm.currentStep <= maxUnlockedStep
        ) {
            currentStep = savedForm.currentStep;
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
        const savedForm = getSavedForm();
        savedForm.currentStep = stepIndex;
        savedForm.maxUnlockedStep = maxUnlockedStep;
        saveFormData(savedForm);

        futureSteps.forEach((step, index) => {
            const stepBlock = step.classList.contains("future-step-block") ? step : step.querySelector(".future-step-block");

            stepBlock?.classList.remove("current");

            if (index <= maxUnlockedStep) {
                step.classList.add("active");
            } else {
                step.classList.remove("active");
            }

            step.classList.toggle("complete", index < maxUnlockedStep);

            // if (index === stepIndex) {
            //     stepBlock?.classList.add("current");
            // }
        });

        if (stepIndex === 0) {
            backBtn.classList.remove("active");
        } else {
            backBtn.classList.add("active");
        }
        if (stepIndex === formSteps.length - 1) {
            nextBtn.style.display = "none";
            submitBtn.classList.add("active");
        } else {
            nextBtn.style.display = "";
            submitBtn.classList.remove("active");
        }
        if (stepIndex === 2) {
            initializeLocationDependencies();
        }
    }
    futureSteps.forEach((step, index) => {
        step.addEventListener("click", () => {
            if (index > maxUnlockedStep) {
                return;
            }

            if (index > currentStep && !validateStep()) {
                return;
            }

            if (index !== currentStep) {
                restoreStep(currentStep);
                currentStep = index;
                restoreStep(currentStep);
            }

            showStep(currentStep);
            updateReview();
        });
    });
    nextBtn.addEventListener("click", () => {
        if (!validateStep()) {
            return;
        }
        saveCompletedStep(currentStep);
        maxUnlockedStep = Math.max(maxUnlockedStep, currentStep + 1);
        currentStep++;
        if (currentStep < formSteps.length) {
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
    form.addEventListener("input", (event) => {
        const input = event.target;
        if (input.matches("input, textarea")) {
            removeError(input);
        }
    });
    form.addEventListener("change", (event) => {
        const input = event.target;
        if (input.matches("input, select, textarea")) {
            removeError(input);
        }
        if (input.name === "gender") {
            const genderInputs = form.querySelectorAll('input[name="gender"]');
            const selected = [...genderInputs].some((radio) => radio.checked);
            if (selected) {
                removeError(genderInputs[0]);
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
        if (select && select.tagName === "SELECT") {
            removeError(select);
            setTimeout(() => {
                updateEmploymentFields();
            }, 0);
        }
    });
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
    function getDisplayValue(input) {
        if (!input) {
            return "Not provided";
        }
        if (input.type === "radio") {
            const checked = document.querySelector(`input[name="${input.name}"]:checked`);
            return checked ? getRadioLabel(checked) : "Not selected";
        }
        if (input.type === "file") {
            if (input.files.length) {
                return input.files[0].name;
            }
            const savedForm = getSavedForm();
            const step = input.closest(".form-step");
            const stepIndex = formSteps.indexOf(step);
            const savedData = savedForm.completedSteps[stepIndex + 1];
            if (savedData && savedData[input.name]) {
                return savedData[input.name].name;
            }
            return "Not uploaded";
        }
        if (input.tagName === "SELECT") {
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
    function createReviewRow(label, value) {
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
    function addReviewRow(tbody, label, selector) {
        const input = document.querySelector(selector);
        if (!input) {
            return;
        }
        if (
            input.closest(".employment-status-option") &&
            !input.closest(".employment-status-option").classList.contains("show")
        ) {
            return;
        }
        const value = getDisplayValue(input);
        tbody.appendChild(createReviewRow(label, value));
    }
    function updateReview() {
        const reviewBlocks = document.querySelectorAll(".form-step-five .review-table-block");
        if (reviewBlocks.length < 3) {
            return;
        }
        const personalBody = reviewBlocks[0].querySelector(".review-tbody");
        if (personalBody) {
            personalBody.innerHTML = "";
            addReviewRow(personalBody, "First Name", "#first-name");
            addReviewRow(personalBody, "Last Name", "#last-name");
            addReviewRow(personalBody, "Email", "#email");
            addReviewRow(personalBody, "Phone", "#phone");
            addReviewRow(personalBody, "Date of Birth", "#date-of-birth");
            addReviewRow(personalBody, "Nationality", "#nationality");
            addReviewRow(personalBody, "Gender", "#male");
        }
        const employmentBody = reviewBlocks[1].querySelector(".review-tbody");
        if (employmentBody) {
            employmentBody.innerHTML = "";
            addReviewRow(employmentBody, "Status", "#employment-status");
            const status = employmentStatus?.value;
            if (status === "yes") {
                addReviewRow(employmentBody, "Job Title", "#job-title");
                addReviewRow(employmentBody, "Company Name", "#company-name");
                addReviewRow(employmentBody, "Work Email", "#work-email");
                addReviewRow(employmentBody, "Years of Experience", "#years-experience");
            }
            if (status === "no") {
                addReviewRow(employmentBody, "Current Situation", "#current-situation");
                addReviewRow(employmentBody, "Additional Information", "#employment-notes");
            }
            if (status === "self-employed") {
                addReviewRow(employmentBody, "Business Name", "#business-name");
                addReviewRow(employmentBody, "Business Type", "#business-type");
                addReviewRow(employmentBody, "Your Role", "#business-role");
                addReviewRow(employmentBody, "Years in Business", "#business-years");
            }
            if (status === "student") {
                addReviewRow(employmentBody, "Institution Name", "#institution-name");
                addReviewRow(employmentBody, "Field of Study", "#field-of-study");
                addReviewRow(employmentBody, "Education Level", "#education-level");
                addReviewRow(employmentBody, "Expected Graduation Year", "#graduation-year");
            }
        }
        const addressBody = reviewBlocks[2].querySelector(".review-tbody");
        if (addressBody) {
            addressBody.innerHTML = "";
            addReviewRow(addressBody, "Address Line 1", "#address-line-1");
            addReviewRow(addressBody, "Address Line 2", "#address-line-2");
            addReviewRow(addressBody, "Country", "#country");
            addReviewRow(addressBody, "State / Province", "#state");
            addReviewRow(addressBody, "City", "#city");
            addReviewRow(addressBody, "Postal Code", "#postal-code");
            addReviewRow(addressBody, "Additional Address Details", "#address-notes");
        }
        const documentBody = reviewBlocks[3]?.querySelector(".review-tbody");
        if (documentBody) {
            documentBody.innerHTML = "";
            addReviewRow(documentBody, "Identity Document", "#identity-document");
            addReviewRow(documentBody, "Proof of Address", "#proof-of-address");
            addReviewRow(documentBody, "Passport-Size Photo", "#passport-photo");
            addReviewRow(documentBody, "Education Certificate", "#education-certificate");
            addReviewRow(documentBody, "Financial Proof", "#financial-proof");
            addReviewRow(documentBody, "Supporting Document", "#supporting-document");
        }
    }
    submitBtn.addEventListener("click", () => {
        if (currentStep !== formSteps.length - 1) {
            return;
        }
        if (!validateStep()) {
            return;
        }
        saveCompletedStep(currentStep);
        updateReview();
        sessionStorage.removeItem(STORAGE_KEY);
        document.querySelector(".future-step-wrapper").style.display = "none";
        form.style.display = "none";
        confirmationMessage.classList.add("active");
    });
    if (startNewApplicationBtn) {
        startNewApplicationBtn.addEventListener("click", () => {
            stateRequestId++;
            isRestoringLocation = !1;
            hasPreparedLocationStep = !1;
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
            document.querySelectorAll(".document-input-field").forEach((element) => {
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
    document.querySelectorAll(".document-input-field").forEach((element) => {
        element.dataset.defaultText = element.textContent.trim();
    });
    updateEmploymentFields();
    restoreSavedData();
    document.body.classList.add("multi-step-ready");
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
