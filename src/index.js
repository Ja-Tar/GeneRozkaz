import { getSection, formatSectionName, formatSectionIdFromId, formatInstructionIdFromId, formatFieldIdFromId, getField } from "./modules/fields.js"

const mainApiUrl = window.location.origin + "/api";

/**
 * @type {{inputTypes: string[], inputsDOM: null | HTMLCollection}}
 */
const FIELDS = {
    inputTypes: [],
    inputsDOM: null,
};

// See schema !!!
let VALIDATION = {};
let HELP = {};
let EXAMPLES = {}

// Enums

const ROZKAZ_ELEMENT_ID = {
    NORMAL: "rozkaz-normalny"
}

const ROZKAZ_TYPE = {
    NORMAL: "normal",
    ETCS: "etcs"
}

// HELPER FUNCTIONS ***

// get data ---

/**
 * @param {string} endpointUrl 
 * @returns {Promise<string>}
 */
async function getRequestText(endpointUrl) {
    const response = await getRequest(endpointUrl);
    return response.text();
}

/**
 * @param {string} endpointUrl 
 * @returns {Promise<JSON>}
 */
async function getRequestJSON(endpointUrl) {
    const response = await getRequest(endpointUrl);
    return response.json();
}

/**
 * @param {string} endpointUrl 
 * @returns {Promise<Response>}
 */
async function getRequest(endpointUrl) {
    if (!endpointUrl) throw TypeError("No URL specified!");
    const url = mainApiUrl + endpointUrl;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Response status: ${response.status}, ${endpointUrl}`);
    }
    return response;
}

// INPUT FIELDS LOADING ***

async function loadInputTypes() {
    const dom = document.createElement("div");
    dom.innerHTML = await getRequestText("/input_types.html");
    FIELDS.inputsDOM = dom.children;
    FIELDS.inputTypes = [];
    for (let i = 0; i < dom.children.length; i++) {
        const domChild = dom.children[i];
        if (domChild.nodeName === "TABLE") {
            FIELDS.inputTypes.push("checkbox-col");
            continue;
        }
        FIELDS.inputTypes.push(domChild.classList[1]);
    }
    console.debug(FIELDS.inputTypes);
}

/**
 * @param {string} tableID 
 */
function addInputsToDivs(tableID) {
    const table = document.getElementById(tableID);
    const parentsOfReplacedElements = [];

    for (let i = 0; i < FIELDS.inputTypes.length; i++) {
        /** @type {string} */
        const inputType = FIELDS.inputTypes[i];
        const divs = table.getElementsByClassName(inputType);
        for (let l = 0; l < divs.length; l++) {
            const element = divs[l];
            if (element.innerHTML) {
                continue;
            }
            /** @type {Element} */
            let newElement = FIELDS.inputsDOM[i].cloneNode(true);

            let tr = null;
            if (newElement.nodeName === "TABLE") {
                newElement = newElement.querySelector("th");
                newElement.id = element.id;
                if (element.classList.length > 0) { // Add lost classes if needed.
                    newElement.setAttribute("class", element.classList.toString())
                }
                element.parentElement.replaceChild(newElement, element);
                tr = newElement.parentElement;
            } else {
                element.parentElement.replaceChild(newElement, element);
                tr = newElement.parentElement.parentElement;
            }
            if (!parentsOfReplacedElements.includes(tr)) {
                parentsOfReplacedElements.push(tr);
            }
        }
    }

    for (let i = 0; i < parentsOfReplacedElements.length; i++) {
        const parent = parentsOfReplacedElements[i];
        if (parent.children[0].innerText.includes("NUM-HERE")) {
            updateCheckboxInfo(parent);
        }
        updateFieldInfo(parent);
    }

    /**
     * @param {Element} parent 
     */
    function updateFieldInfo(parent) {
        const checkbox = parent.getElementsByClassName("checkbox-col")[0];
        const rozContent = parent.getElementsByClassName("roz-content")[0];
        const inputs = rozContent.querySelectorAll("input");
        const labels = rozContent.querySelectorAll("label");
        const numberOfInputs = inputs.length;

        let minusNum = 0;
        for (let l = 0; l < numberOfInputs; l++) {
            if (labels[l].innerText.includes("x.0")) {
                updateInputIdAndLabel(l, minusNum, inputs, checkbox, labels);
            } else {
                minusNum += 1;
            }
        }
    }

    /**
     * @param {Number} l 
     * @param {Number} minusNum 
     * @param {NodeListOf<HTMLInputElement>} inputs 
     * @param {Element} checkbox 
     * @param {NodeListOf<HTMLLabelElement>} labels 
     */
    function updateInputIdAndLabel(l, minusNum, inputs, checkbox, labels) {
        const inputNumber = l + 1 - minusNum;
        const inputElement = inputs[l];
        const idToSet = checkbox.id + "-" + inputNumber + "-input";
        inputElement.id = idToSet;
        labels[l].setAttribute("for", idToSet);
        labels[l].innerText = labels[l].innerText.replace("x.0", "x." + inputNumber);
    }

    /**
     * @param {Element} parent 
     */
    function updateCheckboxInfo(parent) {
        const checkboxTH = parent.getElementsByClassName("checkbox-col")[0];
        const checkboxInput = parent.querySelector('input[type="checkbox"]');
        checkboxInput.id = checkboxTH.id + "-input";
        const numbersRegex = /nr(\d{2})_(\d{2})/;
        const number = checkboxTH.id.replace(numbersRegex, "$1.$2");
        checkboxTH.innerHTML = checkboxTH.innerHTML.replace("add-NUM-HERE", number);
    }
}

/**
 * @param {Element} from 
 */
function handleClick(from) {
    const numbersRegex = /nr(\d{2})(?:|_(\d{2}))-input/;
    let clickedNumber = from.id.replace(numbersRegex, "$1.$2")
    if (clickedNumber.endsWith(".")) clickedNumber = clickedNumber.slice(0, -1)

    toggleFieldHighlights();
    toggleDisallowedInstructions();

    function toggleFieldHighlights() {
        if (from.checked) {
            /** @type {string[] | null} */
            const neededFields = VALIDATION[clickedNumber]?.fieldsNeeded;
            if (neededFields) {
                highlightFields(neededFields, clickedNumber);
            } else {
                console.warn(`Fields to highlight in ${clickedNumber} not found`);
            }
        } else {
            removeHighlights(clickedNumber);
        }
    }

    function toggleDisallowedInstructions() {
        if (from.checked) {
            addDisallowedOverlay(clickedNumber)
        } else {
            removeDisallowedOverlay(clickedNumber)
        }
    }
}

function addClickEventToCheckboxes() {
    const checkboxes = document.querySelectorAll('table input[type="checkbox"]');
    for (let i = 0; i < checkboxes.length; i++) {
        const checkbox = checkboxes[i];
        checkbox.addEventListener("change", function () { handleClick(this) })
    }
}

// FIELDS VALIDATION AND HIGHLIGHTING

async function loadValidationData() {
    VALIDATION = await getRequestJSON("/field_validation.json");
}

/**
 * @param {string[]} neededFields
 * @param {string} section 
 */
function highlightFields(neededFields, section) {
    section = formatSectionName(section);

    if (section === "nr22_00") {
        return; // Small fix for top row fields
    }

    for (let i = 0; i < neededFields.length; i++) {
        const field = neededFields[i];
        const input = document.getElementById(`${section}-${field}-input`);
        highlightElement(input, "required")
    }

    const sectionElement = getSection(section);
    if (sectionElement instanceof Element) {
        highlightOptionalFields(sectionElement);
    } else if (sectionElement instanceof HTMLCollection) {
        for (let i = 0; i < sectionElement.length; i++) {
            const element = sectionElement[i];
            highlightOptionalFields(element);
        }
    } else {
        console.error(`Section not found! ${section}`)
    }

    /**
     * @param {Element} _sectionElement 
     */
    function highlightOptionalFields(_sectionElement) {
        const remainingFields = _sectionElement.querySelectorAll('input:not([type="checkbox"]):not(.required)');

        for (let i = 0; i < remainingFields.length; i++) {
            const field = remainingFields[i];
            highlightElement(field, "optional");
            if (isDashNeeded(field)) {
                field.placeholder = "―";
            }
        }
    }
}

/**
 * @param {Element} field 
 * @param {string} className 
 */
function highlightElement(field, className) {
    field.classList.add(className);
    field.required = true;
    field.disabled = false;
}

/**
 * @param {Element} field
 * @returns {boolean}
 */
function isDashNeeded(field) {
    const sectionId = formatInstructionIdFromId(field.id);

    if (sectionId === "normal") {
        return false;
    }

    // INFO: For now it's better to have it
    return true;

    /** @type {string[] | null} */
    const fieldsWithDash = VALIDATION[sectionId]?.fieldsDashedWhenEmpty;

    if (fieldsWithDash) {
        const fieldId = formatFieldIdFromId(field.id);
        if (fieldsWithDash.includes(fieldId)) {
            return true;
        }
    }

    return false;
}

/**
 * @param {string} section 
 */
function removeHighlights(section) {
    const sectionElement = getSection(section)
    if (!(sectionElement instanceof Element)) {
        throw Error("Not implemented!")
    }

    if (section === "22.00") {
        return; // Small fix for top row fields
    }

    const inputFields = sectionElement.querySelectorAll("input:not([type='checkbox']), textarea");

    for (let i = 0; i < inputFields.length; i++) {
        const element = inputFields[i];
        element.classList.remove(["required", "optional"]);
        element.required = false;
        element.disabled = true;
        element.removeAttribute("placeholder");
    }
}

function loadDefaultHighlights() {
    highlightFields(VALIDATION.normal.fieldsNeeded, "normal")
}

/**
 * @param {string} clickedNumber 
 */
function addDisallowedOverlay(clickedNumber) {
    /** @type {string[] | null} */
    const disallowed = VALIDATION[clickedNumber]?.instructionsDisallowed;

    if (!disallowed) {
        console.info("No disallowed instructions found for %s", clickedNumber);
        return;
    }

    for (let i = 0; i < disallowed.length; i++) {
        const item = disallowed[i];
        const itemElement = getSection(item);
        if (!(itemElement instanceof Element)) {
            return;
        }
        const overlayDiv = document.createElement("div");
        overlayDiv.classList.add("overlay-disallowed")
        itemElement.children[0].appendChild(overlayDiv);
    }
}

/**
 * @param {string} clickedNumber 
 */
function removeDisallowedOverlay(clickedNumber) {
    /** @type {string[] | null} */
    const disallowed = VALIDATION[clickedNumber]?.instructionsDisallowed;

    if (!disallowed) {
        console.info("No disallowed instructions found for %s", clickedNumber);
        return;
    }

    for (let i = 0; i < disallowed.length; i++) {
        const item = disallowed[i];
        const itemElement = getSection(item);
        if (!(itemElement instanceof Element)) {
            return;
        }
        itemElement.querySelector(".overlay-disallowed").remove();
    }
}

function checkForCheckedCheckboxes() {
    const checkboxes = document.querySelectorAll("input[type='checkbox']:checked");

    highlightCheckedFields();

    function highlightCheckedFields() {
        for (let i = 0; i < checkboxes.length; i++) {
            const boxID = formatSectionIdFromId(checkboxes[i].id);
            /** @type {string[] | null} */
            const neededFields = VALIDATION[boxID]?.fieldsNeeded;
            if (neededFields) {
                highlightFields(neededFields, boxID);
            } else {
                console.warn(`Fields to highlight in ${boxID} not found`);
            }
        }
    }
}

// AUTO RESIZE ***

let tableWidth = 650;

function adjustTableSize() {
    const currentTableDiv = document.querySelector("table:not([style*='none'])");
    const instructionBox = document.getElementById("instruction-box");

    if (currentTableDiv) {
        let tableFontSize = Math.max(0.5, instructionBox.clientWidth / tableWidth);
        tableFontSize = Math.round(tableFontSize * 1000) / 1000;
        console.log(tableFontSize);

        requestAnimationFrame(() => {
            document.documentElement.style.setProperty("--table-font-size", tableFontSize + "em");
            document.documentElement.style.setProperty("--toolbox-hight", currentTableDiv.clientHeight + "px");
        });
    }
}

// TOOLBAR ***

const ToolbarState = Object.freeze({
    CLOSED: 0,
    OPEN: 1,
});

const toolbarGrid = document.getElementById("toolbar-inner-box");
const sizeHolder = document.getElementById("size-holder");
const toolbarHandle = document.getElementById("toolbar-handle");
// TODO Add option to hold handle to adjust toolbar size

function hideToolbar() {
    sizeHolder.style.width = "0"

    localStorage.setItem("toolbar-state", ToolbarState.CLOSED);
    setTimeout(() => {
        toolbarGrid.style.display = "none"
    }, 510);
}

function showToolbar() {
    toolbarGrid.style.display = "grid";

    setTimeout(() => {
        sizeHolder.style.width = "20vw"
    }, 10);

    localStorage.setItem("toolbar-state", ToolbarState.OPEN)
}

function toggleToolBar() {
    const toolbarState = parseInt(localStorage.getItem("toolbar-state")) ?? ToolbarState.OPEN;

    if (toolbarState) {
        hideToolbar();
    } else {
        showToolbar();
    }
    setTimeout(adjustTableSize, 600)
}

// HELP BOX ***

/**
 * Download data for help functionality
 * @param {string} documentType 
 */
async function loadHelpData(documentType) {
    HELP = await getRequestJSON(`/help-${documentType}.json`);
    EXAMPLES = await getRequestJSON("/help-examples.json");
}

function loadHelpTriggers() {
    for (const sectionName of Object.keys(HELP)) {
        const sectionElement = getSection(sectionName);

        if (sectionElement instanceof HTMLCollection) {
            const fields = HELP[sectionName];
            for (const fieldName of Object.keys(fields)) {
                const fieldElement = document.getElementById(`${formatSectionName(sectionName)}-${fieldName}-input`);
                const fieldHelp = fields[fieldName];

                fieldElement.addEventListener("focusin", () => displayFieldHelp(fieldName, fieldHelp));
                fieldElement.addEventListener("focusout", clearFieldHelp)
            }
        } else if (sectionElement instanceof Element) {
            const sectionHelp = HELP[sectionName];
            const contentElement = sectionElement.getElementsByClassName("roz-content");
            if (contentElement.length > 1) {
                for (const i of Object.keys(contentElement)) {
                    const smallerContentElement = contentElement[parseInt(i)];
                    if (smallerContentElement.previousElementSibling?.id === formatSectionName(sectionName)) {
                        loadFieldsHelpTriggers(sectionName, sectionHelp);
                        smallerContentElement.addEventListener("focusin", () => displaySectionHelp(sectionName, sectionHelp))
                        smallerContentElement.addEventListener("focusout", () => clearSectionHelp(sectionElement))
                    }
                }
            } else {
                loadFieldsHelpTriggers(sectionName, sectionHelp);
                contentElement[0].addEventListener("focusin", () => displaySectionHelp(sectionName, sectionHelp))
                contentElement[0].addEventListener("focusout", () => clearSectionHelp(sectionElement))
            }
        }
    }
}

/**
 * @param {string} sectionName 
 * @param {*} sectionHelp 
 */
function loadFieldsHelpTriggers(sectionName, sectionHelp) {
    const fieldsInfo = sectionHelp?.fields;

    if (fieldsInfo) {
        for (const fieldNr of Object.keys(fieldsInfo)) {
            /** @type {Object} */
            let fieldHelp = fieldsInfo[fieldNr];
            /** Array with strings
             * @type {string[]} */
            let listExamples = fieldHelp?.examples;

            if (!listExamples && fieldHelp?.examplesType) {
                const examplesList = EXAMPLES[fieldHelp.examplesType];
                fieldHelp.examples = examplesList;
            }

            const fieldElement = getField(fieldNr, sectionName);
            fieldElement.addEventListener("focusin", () => displayFieldHelp(fieldNr, fieldHelp));
            fieldElement.addEventListener("focusout", clearFieldHelp);
        }
    }
}

/**
 * @param {string} sectionName 
 * @param {*} sectionHelp 
 */
function displaySectionHelp(sectionName, sectionHelp) {
    const sectionHelpElement = document.getElementById("section-help");

    const docsInfo = sectionHelp?.docsInfo;

    const title = document.createElement("h2");
    title.textContent = `Instrukcja: ${sectionName}`;
    sectionHelpElement.appendChild(title);

    if (docsInfo) {
        const useTitle = document.createElement("h3");
        useTitle.textContent = "Zastosowanie";
        sectionHelpElement.appendChild(useTitle);

        const topWhen = document.createElement("p");
        /** @type {string | undefined} */
        topWhen.textContent = docsInfo.application?.customTop;
        if (!topWhen.textContent) {
            topWhen.textContent = "W przypadku:";
        }
        sectionHelpElement.appendChild(topWhen);

        /** @type {string[]} */
        const whenList = docsInfo.application?.when;
        if (whenList) {
            const whenListElement = document.createElement("ul");
            whenList.forEach(whenText => {
                const whenElement = document.createElement("li");
                whenElement.textContent = whenText;
                whenListElement.appendChild(whenElement);
            });
            sectionHelpElement.appendChild(whenListElement);
        }

        // TODO add warnings

    }

    triggerHelpInfo();
}

/**
 * 
 * @param {string} fieldElement 
 * @param {*} fieldHelp 
 */
function displayFieldHelp(fieldName, fieldHelp) {
    const filedHelpElement = document.getElementById("field-help");

    const title = document.createElement("h2");
    title.textContent = `Pole: ${fieldName}`
    filedHelpElement.appendChild(title);

    const description = document.createElement("p");
    description.textContent = fieldHelp.docsInfo;
    filedHelpElement.appendChild(description);

    if (fieldHelp.examples) {
        const examplesTitle = document.createElement("h3");
        examplesTitle.textContent = "Przykłady: ";
        filedHelpElement.appendChild(examplesTitle);

        const examplesAllDiv = document.createElement("div");
        examplesAllDiv.classList.add("allHelpExamples");
        filedHelpElement.appendChild(examplesAllDiv);

        for (const i of Object.keys(fieldHelp.examples)) {
            const example = fieldHelp.examples[i]
            const exampleDiv = document.createElement("div");
            exampleDiv.classList.add("exampleFieldElement");
            exampleDiv.textContent = example;

            examplesAllDiv.appendChild(exampleDiv);
        }
    }

    triggerHelpInfo();
}

/**
 * @param {Element} sectionElement 
 * @returns 
 */
function clearSectionHelp(sectionElement) {
    const sectionHelpElement = document.getElementById("section-help");
    sectionHelpElement.innerHTML = "";

    const filedHelpElement = document.getElementById("field-help");
    filedHelpElement.classList.remove("smaller-help");

    triggerHelpInfo();
}

function clearFieldHelp() {
    const filedHelpElement = document.getElementById("field-help");
    filedHelpElement.innerHTML = "";

    triggerHelpInfo();
}

function triggerHelpInfo() {
    const helpInfo = document.getElementById("no-help");
    const filedHelpElement = document.getElementById("field-help");
    const sectionHelpElement = document.getElementById("section-help");

    if (filedHelpElement.innerText === "" && sectionHelpElement.innerText === "") {
        helpInfo.style.display = "block";
    } else {
        helpInfo.style.display = "none"
    }
}

// BUTTON FOCUS FIX ***

/**
 * @param {Event} event 
 */
function stopFocus(event) {
    event.preventDefault();
}

// GENERATE FIELD "Z" (ID) ***

function prepareIDGeneratorBox() {
    const dialog = document.getElementById("id-generator-dialog");
    const setIdButton = document.getElementById('set-id');
    const openIdGeneratorButton = document.getElementById('norm-Z-button');

    openIdGeneratorButton.addEventListener("click", () => {
        dialog.showModal();
    });

    setIdButton.addEventListener("click", () => {
        if (!validateRequiredFields(dialog)) return;

        const fieldZ = document.getElementById("norm-Z-input");
        const selectPrintedValue = document.getElementById("select-printed").value;
        const writtenOrderNumber = document.getElementById("written-order-number").value;
        const posterunekNumber = document.getElementById("posterunek-number").value;

        const today = new Date();
        const yearNumbers = today.getFullYear().toString().slice(2);

        fieldZ.value = `R${selectPrintedValue}-${writtenOrderNumber}-${posterunekNumber}-${yearNumbers}`;

        console.log(selectPrintedValue, writtenOrderNumber, posterunekNumber);
        dialog.close();
    });

}

// TAB INDEX ADDER ***

function addTabIndexToTable() {
    const cells = document.getElementsByClassName("roz-content");

    for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        cell.setAttribute("tabindex", "0");
    }
}

// PRINT FUNCTIONS ***

const saveButton = document.getElementById("save-written-order-button");
saveButton.addEventListener("click", openViewPage);
saveButton.addEventListener('mousedown', stopFocus)

function openViewPage() {
    const instructionBox = document.getElementById('instruction-box')
    if (!validateRozkazFields(instructionBox)) return;

    const viewURL = window.location.origin + "/view.html";
    const processedJSURL = JSURL.stringify(getJSONFromFields());
    const safeJSURL = encodeURIComponent(processedJSURL);
    window.open(`${viewURL}?${safeJSURL}`);
}

/**
 * Validation only for fields with "required" class
 * @param {Element} element 
 * @returns {boolean}
 */
function validateRozkazFields(element) {
    for (const el of element.querySelectorAll("[required]")) {
        if (!el.checkValidity() && el.classList.contains("required")) {
            el.reportValidity();
            return false;
        }
    }
    return true;
}

/**
 * @param {Element} element 
 * @returns {boolean}
 */
function validateRequiredFields(element) {
    for (const el of element.querySelectorAll("[required]")) {
        if (!el.checkValidity()) {
            el.reportValidity();
            return false;
        }
    }
    return true;
}

function getJSONFromFields() {
    // STRUCTURE:
    // {
    //     "normal": {
    //         "A": "Nr pociągu",
    //         "B": "Data"
    //     },
    //     "22.11": {
    //         "1": "Pole 1"
    //     },
    //     "generatedDate": "22.03.2025"
    // }

    const dataFromFields = {};

    const mainFields = document.querySelectorAll(".top-info input");
    const rozkazType = formatInstructionIdFromId(mainFields[0].id);
    dataFromFields[rozkazType] = collectFieldsData(mainFields);

    const checkboxes = document.querySelectorAll('table input[type="checkbox"]');
    checkboxes.forEach(checkboxInput => {
        const instructionName = formatInstructionIdFromId(checkboxInput.id);
        if (checkboxInput.checked) {
            const tableRow = checkboxInput.parentElement.parentElement;
            const sectionNameId = formatSectionName(instructionName);
            const instructionFields = tableRow.querySelectorAll(`input[id*=${sectionNameId}]:not([type='checkbox']), textarea[id*=${sectionNameId}]`);
            dataFromFields[instructionName] = collectFieldsData(instructionFields);
        }
    });

    const today = new Date();
    dataFromFields["generatedDate"] = today.toLocaleDateString("pl-PL");

    return dataFromFields;
}

/**
 * @param {NodeListOf<Element>} inputFields 
 * @returns {{"fieldsName": "fieldContent"}}
 */
function collectFieldsData(inputFields) {
    const fieldsData = {};
    inputFields.forEach(field => {
        const fieldName = formatFieldIdFromId(field.id);
        if (field.value === "" && !field.classList.contains("required") && !field.id.includes("norm")) {
            fieldsData[fieldName] = "―";
        } else {
            fieldsData[fieldName] = field.value;
        }
    });
    return fieldsData;
}

// RESET FIELDS ***

function resetNotNeededFields() {
    const instructionBox = document.getElementById("instruction-box");
    const skipList = [
        "norm-B-input",
        "norm-W-input"
    ]

    const disableSkipList = [
        "norm"
    ]

    const fields = instructionBox.querySelectorAll("input:not([type='checkbox']), textarea");
    fields.forEach(field => {
        if (!skipList.includes(field.id)) {
            field.value = '';
        }

        if (!disableSkipList.filter(option => option.startsWith(field.id))) {
            field.disabled = true;
        }
    });

    const checkboxes = instructionBox.querySelectorAll("table input[type='checkbox']");
    checkboxes.forEach(box => {
        box.checked = false;
    });
}

// START LOADING DATA ***

/**
 * Delay function call until time passed.
 * @param {Function} fn 
 * @param {number} [wait = 100]
 * @returns {Function & {cancel: Function}} 
 */
function limitFunction(fn, wait = 100) {
    let timeoutId = null;

    function limited(...args) {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
            timeoutId = null;
            fn.apply(this, args);
        }, wait);
    }

    limited.cancel = () => {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    };

    return limited;
}

loadInputTypes().then(() => {
    resetNotNeededFields(); // TODO: When adding simulator support change it
    addInputsToDivs(ROZKAZ_ELEMENT_ID.NORMAL);
    addClickEventToCheckboxes();
    loadValidationData().then(() => {
        loadDefaultHighlights();
        addTabIndexToTable()

        adjustTableSize();
        addEventListener('resize', limitFunction(adjustTableSize, 120));

        loadHelpData(ROZKAZ_TYPE.NORMAL).then(() => {
            loadHelpTriggers();
            prepareIDGeneratorBox()

            setTimeout(() => {
                document.getElementById("loader").remove();
            }, 1000);
        });
    });
});