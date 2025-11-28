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
 * @returns {string}
 */
function formatSectionName(name) {
    const sectionAliases = {
        "normal": "norm"
    };

    if (isSectionFormatted(name) || Object.values(sectionAliases).includes(name)) {
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
 * @param {string} name 
 * @returns {boolean}
 */
function isSectionFormatted(name) {
    const regex = /^nr\d{2}(?:|_\d{2})$/
    return regex.test(name);
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
    elementId = formatSectionIdFromId(elementId);
    elementId = elementId.split("-")[0];

    const oppositeSectionAliases = {
        "norm": "normal",
        "99": "99"
    };

    if (elementId in oppositeSectionAliases) {
        return oppositeSectionAliases[elementId];
    }

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

    const textareaFields = document.querySelectorAll(`textarea[id*="${section}"]`);
    for (let i = 0; i < textareaFields.length; i++) {
        const element = textareaFields[i];
        if (element.id.split("-")[1] === name) {
            return element;
        }
    }

    return null;
}

export {getSection, formatSectionName, isSectionFormatted, formatSectionIdFromId, formatInstructionIdFromId, formatFieldIdFromId, getField };