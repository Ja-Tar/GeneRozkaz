window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", setupTheme);

function setupTheme() {
    let themeOverride = localStorage.getItem("theme-override");

    if (!themeOverride) {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            document.documentElement.dataset.theme = "dark";
            themeOverride = "dark";
        } else {
            document.documentElement.dataset.theme = "light";
            themeOverride = "light";
        }
    } else {
        document.documentElement.dataset.theme = themeOverride;
    }
    updateAppBackground(themeOverride);
}

function toggleTheme() {
    let themeOverride;

    if (document.documentElement.dataset.theme === "dark") {
        themeOverride = "light";
    } else {
        themeOverride = "dark";
    }

    document.documentElement.dataset.theme = themeOverride;
    localStorage.setItem("theme-override", themeOverride);
    updateAppBackground(themeOverride);
}

/**
 * 
 * @param {string} themeName 
 */
function selectTheme(themeName) {
    if (themeName) {
        document.documentElement.dataset.theme = themeName;
        localStorage.setItem("theme-override", themeName);
        updateAppBackground(themeName);
    } else {
        localStorage.removeItem("theme-override");
        setupTheme();
    }
}

/**
 * @param {string} themeOverride theme dataset string
 */
function updateAppBackground(themeOverride) {
    const element = document.querySelector("meta[name='theme-color'");
    let color = "#fff";
    if (themeOverride === "dark") {
        color = "#151515";
    }
    element.setAttribute("content", color);
}

export {setupTheme, toggleTheme, selectTheme}