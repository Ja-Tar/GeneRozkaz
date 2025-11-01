const mainApiUrl = window.location.origin + "/api"

async function getRequestText(endpointUrl) {
    const response = await getRequest(endpointUrl);
    return await response.text();
}

async function getRequestJSON(endpointUrl) {
    const response = await getRequest(endpointUrl);
    return await response.json();
}

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

    function updateInputIdAndLabel(l, minusNum, inputs, checkbox, labels) {
        const inputNumber = l + 1 - minusNum;
        let inputElement = inputs[l];
        const idToSet = checkbox.id + "-" + inputNumber + "-input";
        inputElement.id = idToSet;
        labels[l].setAttribute("for", idToSet);
        labels[l].innerText = labels[l].innerText.replace("x.0", "x." + inputNumber);
    }

    function updateCheckboxInfo(parent) {
        const checkboxTH = parent.getElementsByClassName("checkbox-col")[0];
        const checkboxInput = parent.querySelector('input[type="checkbox"]');
        checkboxInput.id = checkboxTH.id + "-input";
        const numbersRegex = /nr(\d{2})_(\d{2})/;
        const number = checkboxTH.id.replace(numbersRegex, "$1.$2");
        checkboxTH.innerHTML = checkboxTH.innerHTML.replace("add-NUM-HERE", number);
    }
}

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

async function loadFieldValidation() {
    window.fieldsValJSON = await getRequestJSON("/field_validation.json");

    // TODO Add first time highlight and validation
}

// START LOADING DATA ***

async function loadAllData() {
    await loadInputTypes();
    await loadFieldValidation();
}

loadAllData().then(() => {
    addInputsToDivs("rozkaz-normalny");
    addClickEventToCheckboxes();
    console.log("DONE");
});