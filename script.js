/**
 * TempConvert Pro — script.js
 * Vanilla JavaScript Temperature Converter
 */

// ─── DOM References ─────────────────────────────────────────────────────────
const tempInput      = document.getElementById('tempInput');
const conversionType = document.getElementById('conversionType');
const convertBtn     = document.getElementById('convertBtn');
const resultValue    = document.getElementById('resultValue');
const resultFormula  = document.getElementById('resultFormula');
const resultBox      = document.getElementById('resultBox');
const errorMsg       = document.getElementById('errorMsg');

// ─── Conversion Logic ────────────────────────────────────────────────────────

/**
 * Converts a temperature value based on the selected conversion type.
 * @param {number} value     - The input temperature value
 * @param {string} type      - The conversion type key
 * @returns {{ result: number, formula: string, unit: string }}
 */
function convertTemperature(value, type) {
  let result, formula, unit;

  switch (type) {
    case 'c-to-f':
      result  = (value * 9 / 5) + 32;
      formula = `(${value}°C × 9/5) + 32`;
      unit    = '°F';
      break;

    case 'f-to-c':
      result  = (value - 32) * 5 / 9;
      formula = `(${value}°F − 32) × 5/9`;
      unit    = '°C';
      break;

    case 'c-to-k':
      result  = value + 273.15;
      formula = `${value}°C + 273.15`;
      unit    = ' K';
      break;

    case 'k-to-c':
      result  = value - 273.15;
      formula = `${value} K − 273.15`;
      unit    = '°C';
      break;

    case 'f-to-k':
      result  = (value - 32) * 5 / 9 + 273.15;
      formula = `(${value}°F − 32) × 5/9 + 273.15`;
      unit    = ' K';
      break;

    case 'k-to-f':
      result  = (value - 273.15) * 9 / 5 + 32;
      formula = `(${value} K − 273.15) × 9/5 + 32`;
      unit    = '°F';
      break;

    default:
      result  = NaN;
      formula = '';
      unit    = '';
  }

  return { result, formula, unit };
}

// ─── Validation ──────────────────────────────────────────────────────────────

/**
 * Validates the temperature input.
 * @returns {{ valid: boolean, value: number|null, message: string }}
 */
function validateInput() {
  const raw = tempInput.value.trim();

  if (raw === '') {
    return { valid: false, value: null, message: 'Please enter a temperature value.' };
  }

  const num = parseFloat(raw);

  if (isNaN(num)) {
    return { valid: false, value: null, message: 'Please enter a valid numeric value.' };
  }

  // Physical lower bound — Absolute Zero check
  const type = conversionType.value;
  if (type === 'k-to-c' || type === 'k-to-f') {
    if (num < 0) {
      return { valid: false, value: null, message: 'Kelvin cannot be negative (min: 0 K).' };
    }
  }
  if (type === 'c-to-f' || type === 'c-to-k') {
    if (num < -273.15) {
      return { valid: false, value: null, message: 'Below absolute zero (min: -273.15°C).' };
    }
  }
  if (type === 'f-to-c' || type === 'f-to-k') {
    if (num < -459.67) {
      return { valid: false, value: null, message: 'Below absolute zero (min: -459.67°F).' };
    }
  }

  return { valid: true, value: num, message: '' };
}

// ─── UI Helpers ──────────────────────────────────────────────────────────────

function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.add('show');
  tempInput.classList.add('input-error');
}

function clearError() {
  errorMsg.textContent = '';
  errorMsg.classList.remove('show');
  tempInput.classList.remove('input-error');
}

/**
 * Formats a number to a clean, readable string.
 * Avoids floating-point noise while keeping precision where needed.
 * @param {number} num
 * @returns {string}
 */
function formatResult(num) {
  // Round to 4 decimal places, then strip trailing zeros
  return parseFloat(num.toFixed(4)).toString();
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

function handleConvert() {
  clearError();

  const { valid, value, message } = validateInput();

  if (!valid) {
    showError(message);

    // Shake the input field for feedback
    tempInput.classList.add('input-error');
    tempInput.animate(
      [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-6px)' },
        { transform: 'translateX(6px)' },
        { transform: 'translateX(-4px)' },
        { transform: 'translateX(4px)' },
        { transform: 'translateX(0)' },
      ],
      { duration: 350, easing: 'ease-in-out' }
    );
    return;
  }

  const type = conversionType.value;
  const { result, formula, unit } = convertTemperature(value, type);

  // Update result display
  const formatted = formatResult(result);
  resultValue.textContent = formatted + unit;
  resultFormula.textContent = `Formula: ${formula} = ${formatted}${unit}`;

  // Animate result in
  resultValue.classList.remove('highlight');
  void resultValue.offsetWidth; // reflow to restart animation
  resultValue.classList.add('highlight');

  // Add 'has-result' style to card
  resultBox.classList.add('has-result');
}

// ─── Event Listeners ─────────────────────────────────────────────────────────

// Button click
convertBtn.addEventListener('click', handleConvert);

// Enter key in input
tempInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleConvert();
});

// Clear error & result highlight when user edits input
tempInput.addEventListener('input', () => {
  clearError();
  resultBox.classList.remove('has-result');
  resultValue.classList.remove('highlight');
  resultValue.textContent = '—';
  resultFormula.textContent = '';
});

// Reset result display on conversion type change
conversionType.addEventListener('change', () => {
  clearError();
  resultBox.classList.remove('has-result');
  resultValue.classList.remove('highlight');
  resultValue.textContent = '—';
  resultFormula.textContent = '';
  // Re-validate if there's already a value entered
  if (tempInput.value.trim() !== '') {
    const { valid, message } = validateInput();
    if (!valid) showError(message);
  }
});
