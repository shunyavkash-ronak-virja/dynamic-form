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
    const startNewApplicationBtn =
        confirmationMessage?.querySelector(".btn.primary-btn");
    const employmentStatus =
        document.getElementById("employment-status");
    const STORAGE_KEY = "dynamicMultiStepForm";
    let currentStep = 0;
    let maxUnlockedStep = 0;


    // =========================================
    // STORAGE
    // =========================================

    function getSavedForm() {
        try {
            const savedData = localStorage.getItem(STORAGE_KEY);
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
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(data)
        );
    }

    // =========================================
    // ERROR HANDLING
    // =========================================

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

        let errorMessage =
            inputStack.querySelector(".input-error");

        if (!errorMessage) {

            errorMessage =
                document.createElement("span");
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

        const errorMessage =
            inputStack.querySelector(".input-error");

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

    // =========================================
    // CONDITIONAL FIELD HELPERS
    // =========================================
    function isFieldVisible(input) {
        const employmentOption =
            input.closest(
                ".employment-status-option"
            );

        if (
            employmentOption &&
            !employmentOption.classList.contains("active")
        ) {
            return false;
        }

        const conditionElement =
            input.closest("[data-show-if]");

        if (conditionElement) {
            if (
                !checkCondition(
                    conditionElement
                )
            ) {
                return false;
            }
        }

        return true;
    }

    function checkCondition(element) {
        const condition =
            element.dataset.showIf;

        if (!condition) {
            return true;
        }

        const [fieldId, expectedValue] =
            condition.split("=");

        const field =
            document.getElementById(
                fieldId?.trim()
            );

        if (!field) {
            return true;
        }

        if (field.type === "radio") {
            const checkedRadio =
                document.querySelector(
                    `input[name="${field.name}"]:checked`
                );

            return (
                checkedRadio &&
                checkedRadio.value ===
                expectedValue.trim()
            );
        }

        return (
            field.value.trim() ===
            expectedValue.trim()
        );
    }


    function updateGenericConditions() {
        document
            .querySelectorAll("[data-show-if]")
            .forEach((element) => {

                const shouldShow =
                    checkCondition(element);
                element.classList.toggle(
                    "active",
                    shouldShow
                );

                element
                    .querySelectorAll(
                        "input, select, textarea"
                    )
                    .forEach((input) => {
                        if (!shouldShow) {
                            removeError(input);
                            input.disabled = true;
                        } else {
                            input.disabled = false;
                        }
                    });
            });
    }

    // =========================================
    // EMPLOYMENT CONDITIONAL FIELDS
    // =========================================
    function updateEmploymentFields() {
        if (!employmentStatus) {
            return;
        }

        const selectedValue =
            employmentStatus.value;

        document
            .querySelectorAll(
                ".employment-status-option"
            )
            .forEach((option) => {

                const optionValue =
                    option.dataset.employmentStatus;

                const isActive =
                    optionValue === selectedValue;

                option.classList.toggle(
                    "active",
                    isActive
                );

                option
                    .querySelectorAll(
                        "input, select, textarea"
                    )
                    .forEach((input) => {
                        if (isActive) {
                            input.disabled = false;
                        } else {
                            input.disabled = true;
                            removeError(input);
                        }
                    });
            });

        updateGenericConditions();
    }

    // =========================================
    // VALIDATION
    // =========================================

    function validateStep() {
        const currentFormStep =
            formSteps[currentStep];

        const requiredFields =
            currentFormStep.querySelectorAll(
                "[required]"
            );

        let isValid = true;

        // -------------------------------------
        // REQUIRED FIELDS
        // -------------------------------------

        requiredFields.forEach((input) => {

            if (
                input.disabled ||
                !isFieldVisible(input)
            ) {
                return;
            }

            removeError(input);


            // ---------------------------------
            // RADIO
            // ---------------------------------

            if (input.type === "radio") {

                const radioGroup =
                    currentFormStep.querySelectorAll(
                        `input[type="radio"][name="${input.name}"]`
                    );

                const isSelected =
                    [...radioGroup].some(
                        (radio) => radio.checked
                    );

                if (!isSelected) {

                    isValid = false;

                    showError(
                        input,
                        "Please select an option."
                    );
                }

                return;
            }


            // ---------------------------------
            // FILE
            // ---------------------------------

            if (input.type === "file") {

                const savedForm =
                    getSavedForm();

                const savedStepData =
                    savedForm.completedSteps[
                    currentStep
                    ];

                const hasSavedFile =
                    savedStepData &&
                    savedStepData[input.name];


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


            // ---------------------------------
            // SELECT
            // ---------------------------------

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


            // ---------------------------------
            // TEXT / TEXTAREA
            // ---------------------------------

            if (!input.value.trim()) {

                isValid = false;

                showError(
                    input,
                    "This field is required."
                );

                return;
            }
        });


        // =====================================
        // CUSTOM VALIDATION
        // =====================================

        const fields =
            currentFormStep.querySelectorAll(
                "input, select, textarea"
            );


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


            const value =
                input.value.trim();


            if (!value) {
                return;
            }


            // ---------------------------------
            // NAME
            // ---------------------------------

            if (
                input.id === "first-name" ||
                input.id === "last-name"
            ) {

                const namePattern =
                    /^[A-Za-zÀ-ÿ\s'-]+$/;

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


            // ---------------------------------
            // PHONE
            // ---------------------------------

            if (input.id === "phone") {

                if (!/^[0-9]+$/.test(value)) {

                    isValid = false;

                    showError(
                        input,
                        "Please enter numbers only."
                    );

                } else if (value.length !== 10) {

                    isValid = false;

                    showError(
                        input,
                        "Phone number must contain exactly 10 digits."
                    );
                }
            }


            // ---------------------------------
            // EMAIL
            // ---------------------------------
            if (input.type === "email") {
                const emailPattern =
                    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]{2,}(?:\.[A-Za-z0-9-]{2,})*\.[A-Za-z]{2,}$/;
                if (!emailPattern.test(value)) {
                    isValid = false;
                    showError(
                        input,
                        "Please enter a valid email address."
                    );
                }
            }

            // ---------------------------------
            // POSTAL CODE
            // ---------------------------------

            if (input.id === "postal-code") {

                const postalCodePattern =
                    /^[A-Za-z0-9][A-Za-z0-9\s-]{2,9}$/;

                if (!postalCodePattern.test(value)) {

                    isValid = false;

                    showError(
                        input,
                        "Please enter a valid postal code."
                    );
                }
            }


            // ---------------------------------
            // NUMBER FIELDS
            // ---------------------------------

            if (
                input.type === "number" &&
                value !== ""
            ) {

                const numberValue =
                    Number(value);

                if (Number.isNaN(numberValue)) {

                    isValid = false;

                    showError(
                        input,
                        "Please enter a valid number."
                    );
                }
            }


            // ---------------------------------
            // DATE
            // ---------------------------------

            if (input.type === "date") {

                const selectedDate =
                    new Date(value);

                const today =
                    new Date();

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


        // =====================================
        // GENDER GROUP
        // =====================================

        const genderInputs =
            currentFormStep.querySelectorAll(
                'input[name="gender"]'
            );

        if (genderInputs.length) {

            const genderSelected =
                [...genderInputs].some(
                    (radio) => radio.checked
                );

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


    // =========================================
    // SAVE STEP
    // =========================================

    function collectStepData(stepIndex) {

        const step =
            formSteps[stepIndex];

        const data = {};

        step.querySelectorAll(
            "input, select, textarea"
        ).forEach((input) => {

            if (!input.name) {
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

                    const file =
                        input.files[0];

                    data[input.name] = {
                        type: "file",
                        name: file.name,
                        size: file.size,
                        fileType: file.type
                    };
                }

                return;
            }


            data[input.name] =
                input.value;
        });

        return data;
    }


    function saveCompletedStep(stepIndex) {

        const savedForm =
            getSavedForm();

        const newData =
            collectStepData(stepIndex);

        const oldData =
            savedForm.completedSteps[
            stepIndex
            ] || {};


        // Preserve previously saved file data
        // when the browser file input is empty
        // after a page refresh.

        const step =
            formSteps[stepIndex];

        step.querySelectorAll(
            'input[type="file"]'
        ).forEach((input) => {

            if (
                !input.files.length &&
                oldData[input.name]
            ) {

                newData[input.name] =
                    oldData[input.name];
            }
        });


        savedForm.completedSteps[
            stepIndex
        ] = newData;


        savedForm.maxUnlockedStep =
            Math.max(
                savedForm.maxUnlockedStep || 0,
                stepIndex + 1
            );


        saveFormData(savedForm);
    }


    // =========================================
    // RESTORE STEP
    // =========================================

    function clearStep(stepIndex) {

        const step =
            formSteps[stepIndex];

        step.querySelectorAll(
            "input, select, textarea"
        ).forEach((input) => {

            if (
                input.type === "radio" ||
                input.type === "checkbox"
            ) {

                input.checked = false;


            } else if (
                input.type === "file"
            ) {

                input.value = "";

                // Reset visible filename
                const display =
                    input
                        .closest("label")
                        ?.querySelector(
                            ".document-input-field"
                        );

                if (display) {

                    display.textContent =
                        display.dataset.defaultText ||
                        "Upload document";
                }


            } else if (
                input.tagName === "SELECT"
            ) {

                // Clear the actual select
                input.value = "";

                // IMPORTANT:
                // Update Nice Select UI
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

    function isDocumentStep(stepIndex) {
        return stepIndex === formSteps.length - 2;
    }


    function resetDocumentStep() {

        const documentStepIndex =
            formSteps.length - 2;

        clearStep(documentStepIndex);

        const documentStep =
            formSteps[documentStepIndex];

        // Reset the visible upload text
        documentStep
            .querySelectorAll(".document-input-field")
            .forEach((element) => {

                const defaultText =
                    element.dataset.defaultText;

                if (defaultText) {
                    element.textContent =
                        defaultText;
                }
            });
    }


    function restoreStep(stepIndex) {

        const savedForm =
            getSavedForm();

        const savedData =
            savedForm.completedSteps[
            stepIndex
            ];

        if (!savedData) {

            clearStep(stepIndex);

            return;
        }


        const step =
            formSteps[stepIndex];


        step.querySelectorAll(
            "input, select, textarea"
        ).forEach((input) => {

            if (!input.name) {
                return;
            }


            const savedValue =
                savedData[input.name];


            if (
                savedValue === undefined
            ) {
                return;
            }


            // ---------------------------------
            // RADIO
            // ---------------------------------

            if (input.type === "radio") {

                input.checked =
                    savedValue === input.value;

                return;
            }


            // ---------------------------------
            // FILE
            // ---------------------------------


            if (input.type === "file") {
                const display =
                    input
                        .closest("label")
                        ?.querySelector(
                            ".document-input-field"
                        );

                if (display) {

                    if (
                        savedValue &&
                        savedValue.name
                    ) {

                        display.textContent =
                            savedValue.name;

                    } else {

                        display.textContent =
                            "Upload document";
                    }
                }

                return;
            }


            // ---------------------------------
            // SELECT / TEXT / TEXTAREA
            // ---------------------------------

            input.value =
                savedValue;


            // ---------------------------------
            // NICE SELECT
            // ---------------------------------

            if (
                input.tagName === "SELECT" &&
                typeof $ !== "undefined"
            ) {

                $(input).niceSelect("update");
            }
        });

        updateEmploymentFields();
    }


    // =========================================
    // RESTORE ALL SAVED DATA
    // =========================================

    function restoreSavedData() {

        const savedForm =
            getSavedForm();

        maxUnlockedStep =
            savedForm.maxUnlockedStep || 0;

        if (
            maxUnlockedStep >= formSteps.length
        ) {
            maxUnlockedStep =
                formSteps.length - 1;
        }

        // =========================================
        // RESTORE STEPS 1, 2, 3...
        // BUT NEVER RESTORE DOCUMENT STEP
        // =========================================

        for (
            let index = 0;
            index < maxUnlockedStep;
            index++
        ) {

            restoreStep(index);
        }

        // =========================================
        // AFTER ALL STEPS ARE COMPLETED
        // SHOW REVIEW
        // =========================================

        if (
            maxUnlockedStep >=
            formSteps.length - 1
        ) {

            currentStep =
                formSteps.length - 1;

        } else {

            currentStep =
                maxUnlockedStep;
        }


        updateEmploymentFields();

        showStep(currentStep);

        updateReview();
    }

    // =========================================
    // SHOW STEP
    // =========================================

    function showStep(stepIndex) {

        formSteps.forEach(
            (step, index) => {

                step.classList.toggle(
                    "active",
                    index === stepIndex
                );
            }
        );


        // -------------------------------------
        // PROGRESS STATE
        // -------------------------------------

        futureSteps.forEach(
            (step, index) => {

                step.classList.remove(
                    "active",
                    "complete"
                );


                // Completed steps
                if (
                    index < maxUnlockedStep
                ) {

                    step.classList.add(
                        "active",
                        "complete"
                    );
                }


                // Current step
                if (
                    index === stepIndex
                ) {

                    step.classList.add(
                        "active"
                    );
                }
            }
        );


        // -------------------------------------
        // BACK BUTTON
        // -------------------------------------

        if (stepIndex === 0) {

            backBtn.classList.remove(
                "active"
            );

        } else {

            backBtn.classList.add(
                "active"
            );
        }


        // -------------------------------------
        // BUTTONS
        // -------------------------------------

        if (
            stepIndex ===
            formSteps.length - 1
        ) {

            nextBtn.style.display =
                "none";

            submitBtn.classList.add(
                "active"
            );

        } else {

            nextBtn.style.display =
                "";

            submitBtn.classList.remove(
                "active"
            );
        }
    }


    // =========================================
    // PROGRESS CLICK
    // =========================================

    futureSteps.forEach(
        (step, index) => {

            step.addEventListener(
                "click",
                () => {

                    /*
                     * Only unlocked steps can
                     * be clicked.
                     *
                     * Example:
                     *
                     * Step 1 = complete
                     * Step 2 = complete
                     * Step 3 = active
                     * Step 4 = locked
                     *
                     * Step 1, 2 and 3 clickable.
                     * Step 4 and 5 locked.
                     */

                    if (
                        index >
                        maxUnlockedStep
                    ) {
                        return;
                    }


                    // Current unfinished data
                    // was not committed.
                    // Discard it before leaving.
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
        }
    );


    // =========================================
    // CONTINUE BUTTON
    // =========================================

    nextBtn.addEventListener(
        "click",
        () => {

            if (!validateStep()) {
                return;
            }


            // ---------------------------------
            // Save only after validation
            // + Continue click
            // ---------------------------------

            saveCompletedStep(
                currentStep
            );


            // ---------------------------------
            // Unlock next step
            // ---------------------------------

            maxUnlockedStep =
                Math.max(
                    maxUnlockedStep,
                    currentStep + 1
                );


            currentStep++;


            // If current step is not last
            if (
                currentStep <
                formSteps.length
            ) {

                // Save progress state
                const savedForm =
                    getSavedForm();

                savedForm.maxUnlockedStep =
                    maxUnlockedStep;

                saveFormData(savedForm);


                // Clear new step because it
                // has not been filled yet.
                // If the next step was already completed,
                // restore its saved data.
                //
                // Otherwise, keep it empty for first-time entry.

                const nextStepData =
                    savedForm.completedSteps[
                    currentStep
                    ];

                if (nextStepData) {

                    restoreStep(currentStep);

                } else {

                    clearStep(currentStep);
                }


                showStep(currentStep);

                updateReview();
            }
        }
    );


    // =========================================
    // BACK BUTTON
    // =========================================

    backBtn.addEventListener(
        "click",
        () => {

            if (currentStep === 0) {
                return;
            }


            // Restore the current step's
            // last saved data before leaving it.
            restoreStep(currentStep);


            currentStep--;


            // Restore the previous step,
            // including Step 4.
            restoreStep(currentStep);


            showStep(currentStep);

            updateReview();
        }
    );


    // =========================================
    // LIVE ERROR REMOVAL
    // =========================================

    form.addEventListener(
        "input",
        (event) => {

            const input =
                event.target;

            if (
                input.matches(
                    "input, textarea"
                )
            ) {

                removeError(input);
            }
        }
    );


    form.addEventListener(
        "change",
        (event) => {

            const input =
                event.target;


            if (
                input.matches(
                    "input, select, textarea"
                )
            ) {

                removeError(input);
            }


            // Gender
            if (
                input.name === "gender"
            ) {

                const genderInputs =
                    form.querySelectorAll(
                        'input[name="gender"]'
                    );

                const selected =
                    [...genderInputs]
                        .some(
                            (radio) =>
                                radio.checked
                        );

                if (selected) {

                    removeError(
                        genderInputs[0]
                    );
                }
            }


            // Employment
            if (
                input.id ===
                "employment-status"
            ) {

                removeError(input);

                updateEmploymentFields();
            }
        }
    );


    // =========================================
    // NICE SELECT OPTION CLICK
    // =========================================

    form.addEventListener(
        "click",
        (event) => {

            const option =
                event.target.closest(
                    ".nice-select .option"
                );

            if (!option) {
                return;
            }


            const niceSelect =
                option.closest(
                    ".nice-select"
                );

            if (!niceSelect) {
                return;
            }


            const select =
                niceSelect.previousElementSibling;

            if (
                select &&
                select.tagName === "SELECT"
            ) {

                removeError(select);

                setTimeout(() => {

                    updateEmploymentFields();

                }, 0);
            }
        }
    );


    // =========================================
    // FILE CHANGE
    // =========================================

    form.querySelectorAll(
        'input[type="file"]'
    ).forEach(
        (input) => {

            input.addEventListener(
                "change",
                () => {

                    removeError(input);

                    const file =
                        input.files[0];

                    if (!file) {
                        return;
                    }


                    const display =
                        input
                            .closest("label")
                            ?.querySelector(
                                ".document-input-field"
                            );

                    if (display) {

                        // Remember the original placeholder
                        // before replacing it.
                        if (!display.dataset.defaultText) {

                            display.dataset.defaultText =
                                display.textContent;
                        }

                        display.textContent =
                            file.name;
                    }
                }
            );
        }
    );


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

            const checked =
                document.querySelector(
                    `input[name="${input.name}"]:checked`
                );

            return checked
                ? getRadioLabel(checked)
                : "Not selected";
        }


        if (
            input.type === "file"
        ) {

            if (input.files.length) {
                return input.files[0].name;
            }


            const savedForm =
                getSavedForm();

            const step =
                input.closest(".form-step");

            const stepIndex =
                formSteps.indexOf(step);

            const savedData =
                savedForm.completedSteps[
                stepIndex
                ];

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

            const selectedOption =
                input.options[
                input.selectedIndex
                ];

            return selectedOption
                ? selectedOption.textContent.trim()
                : "Not selected";
        }


        return input.value.trim()
            || "Not provided";
    }


    function getRadioLabel(radio) {

        const label =
            radio.closest("label");

        if (!label) {
            return radio.value;
        }

        return label.textContent.trim();
    }


    function createReviewRow(
        label,
        value
    ) {

        const row =
            document.createElement("tr");

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

        const input =
            document.querySelector(selector);

        if (!input) {
            return;
        }


        if (
            input.closest(
                ".employment-status-option"
            ) &&
            !input.closest(
                ".employment-status-option"
            ).classList.contains("active")
        ) {

            return;
        }


        const value =
            getDisplayValue(input);


        tbody.appendChild(
            createReviewRow(
                label,
                value
            )
        );
    }


    function updateReview() {

        const reviewBlocks =
            document.querySelectorAll(
                ".form-step-five .review-table-block"
            );

        if (reviewBlocks.length < 3) {
            return;
        }


        // =====================================
        // PERSONAL DETAILS
        // =====================================

        const personalBody =
            reviewBlocks[0]
                .querySelector(".review-tbody");

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

        const employmentBody =
            reviewBlocks[1]
                .querySelector(".review-tbody");

        if (employmentBody) {

            employmentBody.innerHTML = "";

            addReviewRow(
                employmentBody,
                "Status",
                "#employment-status"
            );


            const status =
                employmentStatus?.value;


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

        const addressBody =
            reviewBlocks[2]
                .querySelector(".review-tbody");

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

        const documentBody =
            reviewBlocks[3]
                ?.querySelector(".review-tbody");

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

    submitBtn.addEventListener(
        "click",
        () => {

            updateReview();


            // Make sure review step
            // itself is displayed.
            if (
                currentStep !==
                formSteps.length - 1
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
            localStorage.removeItem(
                STORAGE_KEY
            );


            // Hide form/progress.
            document
                .querySelector(
                    ".future-step-wrapper"
                )
                .style.display = "none";

            form.style.display = "none";


            // Show confirmation.
            confirmationMessage.classList.add(
                "active"
            );
        }
    );


    // =========================================
    // START NEW APPLICATION
    // =========================================

    if (startNewApplicationBtn) {

        startNewApplicationBtn.addEventListener(
            "click",
            () => {

                // Remove saved application
                localStorage.removeItem(
                    STORAGE_KEY
                );

                // Reset state
                currentStep = 0;
                maxUnlockedStep = 0;


                // Clear all steps
                formSteps.forEach(
                    (_, index) => {
                        clearStep(index);
                    }
                );


                // Clear errors
                formSteps.forEach(
                    (step) => {
                        removeStepErrors(step);
                    }
                );


                // Clear document display names
                document
                    .querySelectorAll(
                        ".document-input-field"
                    )
                    .forEach(
                        (element) => {

                            const defaultText =
                                element.dataset.defaultText;

                            if (defaultText) {
                                element.textContent =
                                    defaultText;
                            }
                        }
                    );


                // Hide confirmation
                confirmationMessage.classList.remove(
                    "active"
                );


                // Show form/progress
                document
                    .querySelector(
                        ".future-step-wrapper"
                    )
                    .style.display = "";

                form.style.display = "";


                updateEmploymentFields();

                showStep(0);

                updateReview();
            }
        );
    }


    // =========================================
    // INITIALIZE
    // =========================================

    document
        .querySelectorAll(
            ".document-input-field"
        )
        .forEach(
            (element) => {

                element.dataset.defaultText =
                    element.textContent.trim();
            }
        );


    updateEmploymentFields();

    restoreSavedData();

});