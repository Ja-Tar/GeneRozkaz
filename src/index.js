async function loadInputTypes() {
    //let data = sessionStorage.getItem("savedData");
    let data = null // REMOVE
    if (!data) {
        const url = document.baseURI + "/input_types.html";
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        data = await response.text();
        sessionStorage.setItem("savedData", data);
    }
    let dom = document.createElement("div");
    dom.innerHTML = data;
    document.inputsDOM = dom.children;
    document.inputTypes = [];
    for (let i = 0; i < dom.children.length; i++) {
        const domChild = dom.children[i];
        if (domChild.nodeName === "TABLE") {
            console.log(domChild);
            document.inputTypes.push("checkbox-col")
            continue;
        }
        document.inputTypes.push(domChild.classList[1]);
    }
    console.log(document.inputTypes);
}

function addInputsToDivs(tableID) {
    let table = document.getElementById(tableID);
    let parentsOfReplacedElements = [];

    for (let i = 0; i < document.inputTypes.length; i++) {
        const element = document.inputTypes[i];
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
            updateCheckboxIdAndLabel(parent);
        }
        const checkbox = parent.getElementsByClassName("checkbox-col")[0];
        const rozContent = parent.getElementsByClassName("roz-content")[0];
        const inputs = rozContent.querySelectorAll("input");
        const labels = rozContent.querySelectorAll("label");
        const numberOfInputs = inputs.length;
        
        for (let l = 0; l < numberOfInputs; l++) {
            updateInputIdAndLabel(l, inputs, checkbox, labels);
        }
    }

    function updateInputIdAndLabel(l, inputs, checkbox, labels) {
        const inputNumber = l + 1;
        let inputElement = inputs[l];
        const idToSet = checkbox.id + "-" + inputNumber + "-input";
        inputElement.id = idToSet;
        labels[l].setAttribute("for", idToSet);
        labels[l].innerText = labels[l].innerText.replace("x.0", "x." + inputNumber);
    }

    function updateCheckboxIdAndLabel(parent) {
        const checkboxTH = parent.getElementsByClassName("checkbox-col")[0];
        const checkboxInput = parent.querySelector('input[type="checkbox"]');
        checkboxInput.id = checkboxTH.id + "-input";
        const numbersRegex = /nr(\d{2})_(\d{2})/;
        const number = checkboxTH.id.replace(numbersRegex, "$1.$2");
        checkboxTH.innerHTML = checkboxTH.innerHTML.replace("add-NUM-HERE", number);
    }
}

loadInputTypes().then(() => {
    addInputsToDivs("rozkaz-normalny");
});