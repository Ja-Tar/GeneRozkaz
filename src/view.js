import { getFieldId, getCheckboxId } from "./modules/fields.js"

// PAGE CLEANING ***

function cleanFields() {
    const fields = document.querySelectorAll(".field");
    fields.forEach(field => {
        field.innerText = "";
    });
}

// URL PARSING ***

function getDataFromURI() {
    const uriEncodedJSURL = window.location.search.slice(1);
    if (uriEncodedJSURL) {
        return JSURL.tryParse(uriEncodedJSURL, {}, { deURI: true });
    }
    return {};
}

// PAGE FILLING ***

function fillFields() {
    const dataJSON = getDataFromURI();
    if (dataJSON instanceof Object) {
        for (const instructionName of Object.keys(dataJSON)) {
            if (instructionName == "generatedDate") {
                const printDate = document.getElementById("print-date");
                printDate.innerText = dataJSON[instructionName];
                continue;
            }

            if (instructionName != "normal" && instructionName != "etcs") {
                const checkboxId = getCheckboxId(instructionName);
                const checkboxElement = document.getElementById(checkboxId);
                checkboxElement.classList.add("checked");
            }

            const fields = dataJSON[instructionName];
            for (const fieldName of Object.keys(fields)) {
                /** @type {String} */
                const fieldValue = fields[fieldName];
                const fieldId = getFieldId(fieldName, instructionName)
                const fieldElement = document.getElementById(fieldId);
                if (fieldValue.match(/\d{1,2}-\d{1,2}-\d{2,4}/)) {
                    const date = new Date(fieldValue);
                    const convertedValue = date.toLocaleDateString("pl-PL");
                    if (isNaN(date.getTime())) {
                        continue;
                    }
                    fieldElement.innerText = convertedValue;
                } else {
                    fieldElement.innerText = fieldValue;
                }
            }
        }
    }
}

// OVERFLOW TESTER FOR 23.20 *inne* field ***

function adjustInneField() {
    const inneFieldDivs = document.getElementsByClassName("inne-dl");
    const elementHight = inneFieldDivs[1].clientHeight + 1;
    // Text to check is in first field

    for (let i = 0; i < inneFieldDivs.length; i++) {
        const element = inneFieldDivs[i];
        let nextElement = inneFieldDivs.item(i + 1);

        const textToCheck = element.innerText.split(" ");
        for (let i = textToCheck.length - 1; i >= 0; i--) {
            const word = textToCheck[i];
            const fontSize = parseFloat(getComputedStyle(element).fontSize);
            if (element.clientHeight > elementHight) {
                if (!nextElement) createFieldInneElement(inneFieldDivs[0].parentElement);
                nextElement.textContent = `${word}${i === 1 ? "" : " " + nextElement.textContent}`;
                element.textContent = element.textContent.substring(0, element.textContent.trimEnd().lastIndexOf(" "));
            }
        }
    }
}

/**
 * @param {Element} parentElement 
 * @returns 
 */
function createFieldInneElement(parentElement) {
    const nextElement = document.createElement('div');
    nextElement.classList.add("field", "inne-dl")
    parentElement.appendChild(nextElement);
    return nextElement;
}

function printingAdjustments() {
    const inneFieldDivs = document.getElementsByClassName("inne-dl");
    // Text to check is in first field

    for (let i = 0; i < inneFieldDivs.length; i++) {
        const element = inneFieldDivs[i];
        let nextElement = inneFieldDivs.item(i + 1)

        const textToCheck = element.innerText.split(" ");
        for (let i = textToCheck.length - 1; i >= 0; i--) {
            const word = textToCheck[i];
            const textLength = element.innerText.length;
            if (textLength > 80) {
                if (!nextElement) createFieldInneElement(inneFieldDivs[0].parentElement);
                nextElement.textContent = `${word}${i === 1 ? "" : " " + nextElement.textContent}`;
                element.textContent = element.textContent.substring(0, element.textContent.trimEnd().lastIndexOf(" "));
            }
        }
    }
}

function adjustInneFieldAgain() {
    const inneFieldDivs = document.getElementsByClassName("inne-dl");
    // Text to check is in first field

    let lines = [];
    for (let i = 0; i < inneFieldDivs.length; i++) {
        const element = inneFieldDivs[i];
        lines.push(element.innerText);
        element.textContent = "";
    }

    inneFieldDivs[0].textContent = lines.join(" ");

    setTimeout(adjustInneField, 30);
}

// HOME PAGE BUTTON ***

function goToHomepage() {
    window.location.href = "/";
}

document.getElementById("home-button").addEventListener("click", goToHomepage)

// PRINT BUTTON ***

document.getElementById("print-button").addEventListener("click", () => print());

// THEME BUTTON ***

function setupTheme() {
    let themeOverride = localStorage.getItem("theme-override");

    if (!themeOverride) {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            document.documentElement.dataset["theme"] = "dark";
        } else {
            document.documentElement.dataset["theme"] = "light";
        }
    } else {
        document.documentElement.dataset["theme"] = themeOverride;
    }
}

function toggleTheme() {
    let themeOverride = localStorage.getItem("theme-override");

    if (document.documentElement.dataset["theme"] === "dark") {
        document.documentElement.dataset["theme"] = "light";
        themeOverride = "light";
    } else {
        document.documentElement.dataset["theme"] = "dark";
        themeOverride = "dark";
    }

    localStorage.setItem("theme-override", themeOverride);
}

document.getElementById("theme-button").addEventListener("click", toggleTheme);

// RESET SETTINGS BUTTON ***

function resetSettings() {
    localStorage.clear();
    document.getElementById("loader").style.display = "flex";
    setupTheme();
    hideLoaderAfterDelay();
}

document.getElementById("reset-button").addEventListener("click", resetSettings);

// START LOADING DATA ***

function hideLoaderAfterDelay() {
    setTimeout(() => {
        document.getElementById("loader").style.display = "none";
    }, 500);
}

cleanFields();
fillFields();
adjustInneField();
addEventListener("beforeprint", printingAdjustments);
addEventListener("afterprint", adjustInneFieldAgain);

setupTheme();
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", setupTheme)

hideLoaderAfterDelay();
