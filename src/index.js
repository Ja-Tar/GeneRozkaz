const mainApiUrl = window.location.origin + "/api"

/**
 * @type {{inputTypes: string[], inputsDOM: null | HTMLCollection}}
 */
const FIELDS = {
    inputTypes: [],
    inputsDOM: null,
}

// See schema !!!
let VALIDATION = {}

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
        throw new Error(`Response status: ${response.status}`);
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
    console.log(from.checked, clickedNumber); // REMOVE

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
        checkbox.setAttribute("onclick", "handleClick(this)")
    }
}

// FIELDS VALIDATION AND HIGHLIGHTING

/**
 * @param {string} name 
 * @returns {Element | null | HTMLCollectionOf<Element>}
 */
function getSection(name) {
    // name [str] - name of written order section, like:
    // '22.00'; 'normal'; '99'

    name = formatSectionName(name);

    if (name === "norm") {
        return document.getElementsByClassName("top-info");
    } else if (name === "etcs") {
        throw Error("Not implemented"); // TODO add proper list
    }

    return document.getElementById(`${name}`).parentElement;
}

/**
 * @param {string} name 
 * @returns 
 */
function formatSectionName(name) {
    const sectionAliases = {
        "normal": "norm"
    };

    if (name.startsWith("nr") || Object.values(sectionAliases).includes(name)) {
        return name; // already formatted
    }

    let splitName = name.split(".");

    if (splitName.length > 2) {
        throw SyntaxError(`Wrong section name: ${name}`);
    } else if (name in sectionAliases) {
        name = sectionAliases[name];
    } else {
        splitName = splitName.filter((val) => /^\d+$/.test(val));
        if (splitName.length < 1) {
            throw SyntaxError(`Wrong section name - splitting error: ${name}`);
        }
        name = "nr" + splitName.join("_");
    }

    return name;
}

/**
 * @param {string} elementId 
 * @returns {string}
 */
function formatSectionIdFromId(elementId) {
    elementId = elementId.replaceAll("-input", "");
    const name = elementId.replaceAll("nr", "");
    return name;
}

/**
 * @param {string} elementId 
 * @returns {string}
 */
function formatInstructionIdFromId(elementId) {
    elementId = elementId = formatSectionIdFromId(elementId);
    elementId = elementId.split("-")[0];
    let splitInstructionId = elementId.split("_");
    splitInstructionId = splitInstructionId.filter((val) => /^\d+$/.test(val));
    if (splitInstructionId.length === 2) {
        return splitInstructionId.join(".");
    }
    console.error("Element id is wrong for this conversion: %s", elementId);
    return "";
}

/**
 * @param {string} elementId 
 * @returns {string}
 */
function formatFieldIdFromId(elementId) {
    elementId = formatSectionIdFromId(elementId);
    const nameSplit = elementId.split("-");
    return nameSplit[1];
}

/**
 * @param {string} name 
 * @param {string} section 
 * @returns {Element | null}
 */
function getField(name, section) {
    // name [str] - name of field like:
    // '1', 'A', '96'

    section = formatSectionName(section);

    const inputFields = document.querySelectorAll(`input[id*="${section}"]`);
    for (let i = 0; i < inputFields.length; i++) {
        const element = inputFields[i];
        if (element.id.split("-")[1] === name) {
            return element;
        }
    }

    return null;
}

async function loadFieldValidation() {
    VALIDATION = await getRequestJSON("/field_validation.json");
}

/**
 * @param {string[]} neededFields
 * @param {string} section 
 */
function highlightFields(neededFields, section) {
    section = formatSectionName(section);

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
            checkIfDashNeeded(field);
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
 * @param {string} section 
 */
function checkIfDashNeeded(field) {
    const sectionId = formatInstructionIdFromId(field.id);
    /** @type {string[] | null} */
    const fieldsWithDash = VALIDATION[sectionId]?.fieldsDashedWhenEmpty;

    if (fieldsWithDash) {
        const fieldId = formatFieldIdFromId(field.id);
        if (fieldsWithDash.includes(fieldId)) {
            field.placeholder = "―";
        }
    }
}

/**
 * @param {string} section 
 */
function removeHighlights(section) {
    const sectionElement = getSection(section)
    if (!(sectionElement instanceof Element)) {
        throw Error("Not implemented!")
    }

    const inputFields = sectionElement.querySelectorAll("input:not([type='checkbox'])");

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

function adjustTableSize() {
    const currentTableDiv = document.querySelector(".fill-page:not([style*='none'])");
    const instructionBox = document.getElementById("instruction-box");

    if (currentTableDiv) {
        const tableWidth = 774;

        let tableScale = Math.max(1, instructionBox.clientWidth / tableWidth);
        tableScale = Math.round(tableScale * 1000) / 1000;

        requestAnimationFrame(() => {
            document.documentElement.style.setProperty("--scale-instruction", tableScale);
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
        sizeHolder.style.width = "300px"
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

// TODO Add here functions

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
    addInputsToDivs("rozkaz-normalny");
    addClickEventToCheckboxes();
    loadFieldValidation().then(() => {
        loadDefaultHighlights();
        checkForCheckedCheckboxes();
        adjustTableSize();

        addEventListener('resize', limitFunction(adjustTableSize, 120));
        toolbarHandle.addEventListener('click', limitFunction(toggleToolBar, 120));

        console.info("LOADING DONE");
    })
});