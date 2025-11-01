const mainApiUrl = window.location.origin + "/api"

/**
 * @param {string} endpointUrl 
 * @returns {Promise<string>}
 */
async function getRequestText(endpointUrl) {
    const response = await getRequest(endpointUrl);
    return await response.text();
}

/**
 * @param {string} endpointUrl 
 * @returns {Promise<JSON>}
 */
async function getRequestJSON(endpointUrl) {
    const response = await getRequest(endpointUrl);
    return await response.json();
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
    let dom = document.createElement("div");
    dom.innerHTML = await getRequestText("/input_types.html");
    document.inputsDOM = dom.children;
    window.inputTypes = [];
    for (let i = 0; i < dom.children.length; i++) {
        const domChild = dom.children[i];
        if (domChild.nodeName === "TABLE") {
            console.log(domChild);
            window.inputTypes.push("checkbox-col");
            continue;
        }
        window.inputTypes.push(domChild.classList[1]);
    }
    console.log(window.inputTypes);
}

/**
 * @param {string} tableID 
 */
function addInputsToDivs(tableID) {
    let table = document.getElementById(tableID);
    let parentsOfReplacedElements = [];

    for (let i = 0; i < window.inputTypes.length; i++) {
        const element = window.inputTypes[i];
        divs = table.getElementsByClassName(element);
        for (let l = 0; l < divs.length; l++) {
            const element = divs[l];
            if (element.innerHTML) {
                continue;
            }
            let newElement = document.inputsDOM[i].cloneNode(true);
            let tr = null;
            if (newElement.nodeName === "TABLE") {
                newElement = newElement.querySelector("th");
                newElement.id = element.id;
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
        let inputElement = inputs[l];
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
    console.log(from.checked, clickedNumber);

    // TODO Load data to validate checkboxes nad inputs
}

function addClickEventToCheckboxes() {
    const checkboxes = document.querySelectorAll('table input[type="checkbox"]');
    for (let i = 0; i < checkboxes.length; i++) {
        const checkbox = checkboxes[i];
        checkbox.setAttribute("onclick", "handleClick(this)")
    }
}

// FIELDS VALIDATION

/**
 * @param {string} name 
 * @returns {Element | null}
 */
function getSection(name) {
    // name [str] - name of written order section, like:
    // '22.00'; 'normal'; '99'

    processSectionName();

    return document.getElementById(`nr${name}`).parentElement;

    function processSectionName() {
        let splitName = name.split(".");

        if (splitName.length > 2) {
            throw SyntaxError(`Wrong section name: ${name}`);
        } else {
            splitName = splitName.filter((val) => /^\d+$/.test(val))
            if (splitName.length !== 2) {
                throw SyntaxError(`Wrong section name - splitting error: ${name}`);
            }
            name = splitName.join("_")
        }
    }
}

/**
 * @param {string} name 
 * @param {string} section 
 */
function getField(name, section) {
    // name [str] - name of field like:
    // '1', 'A', '96'

    processFieldName();

    const inputFields = document.querySelectorAll('input[id*="21_10"]');
    for (let i = 0; i < inputFields.length; i++) {
        const element = inputFields[i];
        console.log(element.id);
        // TODO Finish this!!! 
    }

    function processFieldName() {
        sectionAliases = { // INFO: Add aliases if needed
            "normal": "norm"
        }
 
        if (name in sectionAliases) {
            name = sectionAliases[name];
        }
    }
}

async function loadFieldValidation() {
    window.fieldsValJSON = await getRequestJSON("/field_validation.json");

    console.log(getSection("21.10"));
    getField();
    // TODO Add first time highlight and validation
}

// START LOADING DATA ***

loadInputTypes().then(() => {
    addInputsToDivs("rozkaz-normalny");
    addClickEventToCheckboxes();
    loadFieldValidation().then(() => {
        console.log("DONE");
    })
});