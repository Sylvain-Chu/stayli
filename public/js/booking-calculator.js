/**
 * Booking Price Calculator - Client-side real-time calculation
 */

(function () {
  const form = document.querySelector('form[action="/bookings/create"]');
  if (!form) return;

  // Get all form inputs
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');
  const adultsInput = document.getElementById('adults');
  const childrenInput = document.getElementById('children');
  const hasLinensInput = document.getElementById('hasLinens');
  const linensPriceInput = document.getElementById('linensPrice');
  const hasCleaningInput = document.getElementById('hasCleaning');
  const cleaningPriceInput = document.getElementById('cleaningPrice');
  const discountInput = document.getElementById('discount');
  const discountTypeSelect = document.getElementById('discountType');
  const hasInsuranceInput = document.getElementById('hasCancellationInsurance');

  // Get price display elements
  const basePriceDisplay = document.getElementById('basePriceDisplay');
  const optionsDisplay = document.getElementById('optionsDisplay');
  const discountDisplay = document.getElementById('discountDisplay');
  const insuranceDisplay = document.getElementById('insuranceDisplay');
  const taxDisplay = document.getElementById('taxDisplay');
  const totalPriceDisplay = document.getElementById('totalPriceDisplay');

  let debounceTimer = null;

  /**
   * Calculate price by calling the API
   */
  async function calculatePrice() {
    const startDate = startDateInput?.value;
    const endDate = endDateInput?.value;

    if (!startDate || !endDate) {
      resetDisplay();
      return;
    }

    // Collect form data
    const formData = {
      startDate,
      endDate,
      adults: parseInt(adultsInput?.value || '1', 10),
      children: parseInt(childrenInput?.value || '0', 10),
      hasLinens: hasLinensInput?.checked || false,
      linensPrice: parseFloat(linensPriceInput?.value || '0'),
      hasCleaning: hasCleaningInput?.checked || false,
      cleaningPrice: parseFloat(cleaningPriceInput?.value || '0'),
      discount: parseFloat(discountInput?.value || '0'),
      discountType: discountTypeSelect?.value || 'amount',
      hasCancellationInsurance: hasInsuranceInput?.checked || false,
      propertyId: 'temp',
      clientId: 'temp',
    };

    try {
      const response = await fetch('/bookings/calculate-price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Calculation failed');
      }

      const breakdown = await response.json();
      updateDisplay(breakdown);
    } catch (error) {
      console.error('Price calculation error:', error);
      resetDisplay();
    }
  }

  /**
   * Update price display with calculated values
   */
  function updateDisplay(breakdown) {
    if (basePriceDisplay) basePriceDisplay.textContent = `€${breakdown.basePrice.toFixed(2)}`;
    if (optionsDisplay)
      optionsDisplay.textContent = `€${(breakdown.linensPrice + breakdown.cleaningPrice).toFixed(2)}`;
    if (discountDisplay)
      discountDisplay.textContent =
        breakdown.discount > 0 ? `-€${breakdown.discount.toFixed(2)}` : '€0.00';
    if (insuranceDisplay) insuranceDisplay.textContent = `€${breakdown.insuranceFee.toFixed(2)}`;
    if (taxDisplay) taxDisplay.textContent = `€${breakdown.touristTax.toFixed(2)}`;
    if (totalPriceDisplay) totalPriceDisplay.textContent = `€${breakdown.totalPrice.toFixed(2)}`;
  }

  /**
   * Reset display to default state
   */
  function resetDisplay() {
    if (basePriceDisplay) basePriceDisplay.textContent = '-';
    if (optionsDisplay) optionsDisplay.textContent = '-';
    if (discountDisplay) discountDisplay.textContent = '-';
    if (insuranceDisplay) insuranceDisplay.textContent = '-';
    if (taxDisplay) taxDisplay.textContent = '-';
    if (totalPriceDisplay) totalPriceDisplay.textContent = '-';
  }

  /**
   * Debounced calculation trigger
   */
  function triggerCalculation() {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(calculatePrice, 300);
  }

  // Attach event listeners to all inputs
  const inputs = [
    startDateInput,
    endDateInput,
    adultsInput,
    childrenInput,
    hasLinensInput,
    linensPriceInput,
    hasCleaningInput,
    cleaningPriceInput,
    discountInput,
    discountTypeSelect,
    hasInsuranceInput,
  ];

  inputs.forEach((input) => {
    if (input) {
      if (input.type === 'checkbox') {
        input.addEventListener('change', triggerCalculation);
      } else {
        input.addEventListener('input', triggerCalculation);
      }
    }
  });

  // Initial calculation if dates are present
  if (startDateInput?.value && endDateInput?.value) {
    calculatePrice();
  }
})();
