
const display = document.getElementById("display");
const historyDisplay = document.getElementById("history");
const historyPanel = document.getElementById("historyPanel");
const historyList = document.getElementById("historyList");

let currentExpression = "";
let calculationHistory = [];

// Update calculator display
function updateDisplay() {
    display.value = currentExpression || "0";
}

// Add numbers and operators
/**
 * @param {string} value
 */
function append(value) {
    if (currentExpression === "Error") {
        currentExpression = "";
    }

    const operators = ["+", "-", "*", "/"];

    if (operators.includes(value)) {
        if (!currentExpression) {
            if (value !== "-") return;
        }

        const last = currentExpression.slice(-1);

        if (operators.includes(last)) {
            if (value === "-" && last !== "-") {
                currentExpression += value;
            } else {
                currentExpression =
                    currentExpression.slice(0, -1) + value;
            }
        } else {
            currentExpression += value;
        }
    } else if (value === ".") {
        const lastNumber = currentExpression.split(/[+\-*/]/).pop();

        if (lastNumber.includes(".")) return;

        if (!lastNumber) {
            currentExpression += "0";
        }

        currentExpression += ".";
    } else if (value === "%") {
        if (/\d$/.test(currentExpression)) {
            currentExpression += "%";
        }
    } else {
        currentExpression += value;
    }

    updateDisplay();
}

// Clear all
function clearDisplay() {
    currentExpression = "";
    historyDisplay.textContent = "";
    updateDisplay();
}

// Delete last character
function deleteLast() {
    currentExpression = currentExpression.slice(0, -1);
    updateDisplay();
}

// Calculate result
function calculate() {
    try {
        if (!currentExpression.trim()) return;

        let expression = currentExpression;

        // Convert percentages
        expression = expression.replace(
            /(\d+(?:\.\d+)?)%/g,
            "($1/100)"
        );

        // Validate expression
        if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
            throw new Error("Invalid expression");
        }

        const result = Function(
            '"use strict"; return (' + expression + ')'
        )();

        if (!Number.isFinite(result)) {
            throw new Error("Invalid result");
        }

        const formattedResult = Number(
            result.toPrecision(12)
        );

        const previousExpression = currentExpression;

        // Save history
        calculationHistory.unshift({
            expression: previousExpression,
            result: formattedResult
        });

        historyDisplay.textContent = previousExpression + " =";

        currentExpression = String(formattedResult);

        updateDisplay();

    } catch (error) {
        currentExpression = "Error";
        updateDisplay();
    }
}

// Display calculation history
function showHistory() {
    historyList.innerHTML = "";

    if (calculationHistory.length === 0) {
        historyList.textContent = "No calculations yet.";
    }

    calculationHistory.forEach(item => {
        const div = document.createElement("div");
        div.className = "history-item";

        const expression = document.createElement("span");
        expression.textContent = item.expression + " =";

        const result = document.createElement("strong");
        result.textContent = item.result;

        div.append(expression, result);
        historyList.appendChild(div);
    });

    historyPanel.classList.remove("hidden");
}

// Close history
document.getElementById("closeHistory")
    .addEventListener("click", () => {
        historyPanel.classList.add("hidden");
    });

// Clear history
document.getElementById("clearHistory")
    .addEventListener("click", () => {
        calculationHistory = [];
        historyList.textContent = "No calculations yet.";
    });

// Handle calculator button clicks
document.querySelectorAll(".buttons button").forEach(button => {
    button.addEventListener("click", () => {
        const action = button.dataset.action;
        const value = button.dataset.value;

        if (action === "clear") {
            clearDisplay();
        } else if (action === "delete") {
            deleteLast();
        } else if (action === "calculate") {
            calculate();
        } else if (action === "history") {
            showHistory();
        } else if (value !== undefined) {
            append(value);
        }
    });
});

// Keyboard support
document.addEventListener("keydown", event => {
    if (event.key >= "0" && event.key <= "9") {
        append(event.key);
    } else if (["+", "-", "*", "/", "%", "."].includes(event.key)) {
        append(event.key);
    } else if (event.key === "Enter" || event.key === "=") {
        event.preventDefault();
        calculate();
    } else if (event.key === "Backspace") {
        deleteLast();
    } else if (event.key === "Escape") {
        clearDisplay();
    }
});

// Initial display
updateDisplay();

