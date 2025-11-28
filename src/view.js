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
    debugger;
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

adjustInneField();
addEventListener("beforeprint", printingAdjustments);
addEventListener("afterprint", adjustInneFieldAgain);
