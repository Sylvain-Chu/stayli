/**
 * BOOKING CALCULATOR ENHANCED
 * Gestion du formulaire de création avec calcul en temps réel
 */

(function () {
  'use strict';

  // === ELEMENTS ===
  const form = document.querySelector('.booking-create-container');
  if (!form) return;

  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');
  const propertyIdSelect = document.getElementById('propertyId');
  const clientIdSelect = document.getElementById('clientId');
  const adultsInput = document.getElementById('adults');
  const childrenInput = document.getElementById('children');

  const hasLinensCheckbox = document.getElementById('hasLinens');
  const linensPriceInput = document.getElementById('linensPrice');
  const hasCleaningCheckbox = document.getElementById('hasCleaning');
  const cleaningPriceInput = document.getElementById('cleaningPrice');

  const discountInput = document.getElementById('discount');
  const discountTypeSelect = document.getElementById('discountType');
  const hasInsuranceCheckbox = document.getElementById('hasCancellationInsurance');

  const nightsBadge = document.getElementById('nightsBadge');
  const nightsCount = document.getElementById('nightsCount');
  const charCount = document.getElementById('charCount');
  const specialRequestsTextarea = document.getElementById('specialRequests');

  // Display elements
  const basePriceDisplay = document.getElementById('basePriceDisplay');
  const basePriceDetail = document.getElementById('basePriceDetail');
  const optionsDisplay = document.getElementById('optionsDisplay');
  const optionsDetail = document.getElementById('optionsDetail');
  const optionsSection = document.getElementById('optionsSection');
  const discountDisplay = document.getElementById('discountDisplay');
  const discountSection = document.getElementById('discountSection');
  const insuranceDisplay = document.getElementById('insuranceDisplay');
  const insuranceHint = document.getElementById('insuranceHint');
  const taxDisplay = document.getElementById('taxDisplay');
  const taxDetail = document.getElementById('taxDetail');
  const totalPriceDisplay = document.getElementById('totalPriceDisplay');
  const discountSuffix = document.getElementById('discountSuffix');

  // === STEPPER CONTROLS ===
  const stepperButtons = document.querySelectorAll('.stepper-btn');

  stepperButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const action = btn.dataset.action;
      const targetId = btn.dataset.target;
      const input = document.getElementById(targetId);
      const min = parseInt(btn.dataset.min) || 0;

      let currentValue = parseInt(input.value) || min;

      if (action === 'increase') {
        input.value = currentValue + 1;
      } else if (action === 'decrease' && currentValue > min) {
        input.value = currentValue - 1;
      }

      calculatePrice();
    });
  });

  // === OPTION TOGGLE (Enable/Disable price inputs) ===
  function toggleOptionInput(checkbox, priceInput) {
    if (checkbox.checked) {
      priceInput.disabled = false;
      priceInput.style.background = '#ffffff';
    } else {
      priceInput.disabled = true;
      priceInput.style.background = '#f3f4f6';
    }
  }

  if (hasLinensCheckbox && linensPriceInput) {
    toggleOptionInput(hasLinensCheckbox, linensPriceInput);
    hasLinensCheckbox.addEventListener('change', () => {
      toggleOptionInput(hasLinensCheckbox, linensPriceInput);
      calculatePrice();
    });
  }

  if (hasCleaningCheckbox && cleaningPriceInput) {
    toggleOptionInput(hasCleaningCheckbox, cleaningPriceInput);
    hasCleaningCheckbox.addEventListener('change', () => {
      toggleOptionInput(hasCleaningCheckbox, cleaningPriceInput);
      calculatePrice();
    });
  }

  // === DISCOUNT SUFFIX ===
  if (discountTypeSelect && discountSuffix) {
    function updateDiscountSuffix() {
      discountSuffix.textContent = discountTypeSelect.value === 'percent' ? '%' : '€';
    }
    updateDiscountSuffix();
    discountTypeSelect.addEventListener('change', () => {
      updateDiscountSuffix();
      calculatePrice();
    });
  }

  // === NIGHTS BADGE ===
  function updateNightsBadge() {
    if (!startDateInput || !endDateInput || !nightsBadge || !nightsCount) return;

    const start = new Date(startDateInput.value);
    const end = new Date(endDateInput.value);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      nightsBadge.style.display = 'none';
      return;
    }

    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    nightsCount.textContent = nights;
    nightsBadge.style.display = 'flex';
  }

  if (startDateInput)
    startDateInput.addEventListener('change', () => {
      updateNightsBadge();
      calculatePrice();
    });

  if (endDateInput)
    endDateInput.addEventListener('change', () => {
      updateNightsBadge();
      calculatePrice();
    });

  // === CHARACTER COUNTER ===
  if (specialRequestsTextarea && charCount) {
    function updateCharCount() {
      const length = specialRequestsTextarea.value.length;
      charCount.textContent = length;

      if (length > 450) {
        charCount.style.color = '#dc2626';
      } else {
        charCount.style.color = '#6b7280';
      }
    }

    updateCharCount();
    specialRequestsTextarea.addEventListener('input', updateCharCount);
  }

  // === PRICE CALCULATION ===
  let debounceTimer;

  function calculatePrice() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      try {
        const formData = {
          propertyId: propertyIdSelect?.value,
          clientId: clientIdSelect?.value,
          startDate: startDateInput?.value,
          endDate: endDateInput?.value,
          adults: parseInt(adultsInput?.value) || 1,
          children: parseInt(childrenInput?.value) || 0,
          hasLinens: hasLinensCheckbox?.checked || false,
          linensPrice: parseFloat(linensPriceInput?.value) || 0,
          hasCleaning: hasCleaningCheckbox?.checked || false,
          cleaningPrice: parseFloat(cleaningPriceInput?.value) || 0,
          discount: parseFloat(discountInput?.value) || 0,
          discountType: discountTypeSelect?.value || 'amount',
          hasCancellationInsurance: hasInsuranceCheckbox?.checked || false,
        };

        if (!formData.startDate || !formData.endDate) {
          resetDisplay();
          return;
        }

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

        const prices = await response.json();
        updateDisplay(prices, formData);
      } catch (error) {
        console.error('Price calculation error:', error);
        resetDisplay();
      }
    }, 300);
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  }

  function updateDisplay(prices, formData) {
    // Base Price
    if (basePriceDisplay) {
      basePriceDisplay.textContent = formatCurrency(prices.basePrice);
    }

    if (basePriceDetail) {
      const start = new Date(formData.startDate);
      const month = start.getMonth() + 1;
      const lowSeasonMonths = [1, 2, 3, 11, 12]; // TODO: get from settings
      const season = lowSeasonMonths.includes(month) ? 'Basse saison' : 'Haute saison';
      basePriceDetail.textContent = `${season}`;
    }

    // Options
    const optionsTotal = prices.linensPrice + prices.cleaningPrice;
    if (optionsTotal > 0) {
      optionsSection.style.display = 'block';
      optionsDisplay.textContent = formatCurrency(optionsTotal);

      const details = [];
      if (prices.linensPrice > 0) details.push(`Draps: ${formatCurrency(prices.linensPrice)}`);
      if (prices.cleaningPrice > 0) details.push(`Ménage: ${formatCurrency(prices.cleaningPrice)}`);
      optionsDetail.textContent = details.join(' • ');
    } else {
      optionsSection.style.display = 'none';
    }

    // Discount
    if (prices.discount > 0) {
      discountSection.style.display = 'block';
      discountDisplay.textContent = `- ${formatCurrency(prices.discount)}`;
    } else {
      discountSection.style.display = 'none';
    }

    // Insurance
    insuranceDisplay.textContent = formatCurrency(prices.insuranceFee);
    if (insuranceHint) {
      insuranceHint.textContent = `environ ${formatCurrency(prices.insuranceFee)}`;
    }

    // Tourist Tax
    taxDisplay.textContent = formatCurrency(prices.touristTax);
    if (taxDetail) {
      const nights = Math.ceil(
        (new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24),
      );
      const totalGuests = formData.adults + formData.children;
      taxDetail.textContent = `${totalGuests} pers. × ${nights} nuits × 1€`;
    }

    // Total
    totalPriceDisplay.textContent = formatCurrency(prices.totalPrice);
  }

  function resetDisplay() {
    if (basePriceDisplay) basePriceDisplay.textContent = '-';
    if (basePriceDetail) basePriceDetail.textContent = '';
    if (optionsDisplay) optionsDisplay.textContent = '-';
    if (optionsDetail) optionsDetail.textContent = '';
    if (optionsSection) optionsSection.style.display = 'none';
    if (discountDisplay) discountDisplay.textContent = '-';
    if (discountSection) discountSection.style.display = 'none';
    if (insuranceDisplay) insuranceDisplay.textContent = '-';
    if (insuranceHint) insuranceHint.textContent = '';
    if (taxDisplay) taxDisplay.textContent = '-';
    if (taxDetail) taxDetail.textContent = '';
    if (totalPriceDisplay) totalPriceDisplay.textContent = '-';
  }

  // === EVENT LISTENERS ===
  [
    propertyIdSelect,
    clientIdSelect,
    startDateInput,
    endDateInput,
    adultsInput,
    childrenInput,
    hasLinensCheckbox,
    linensPriceInput,
    hasCleaningCheckbox,
    cleaningPriceInput,
    discountInput,
    discountTypeSelect,
    hasInsuranceCheckbox,
  ].forEach((element) => {
    if (element) {
      const event =
        element.type === 'checkbox' || element.tagName === 'SELECT' ? 'change' : 'input';
      element.addEventListener(event, calculatePrice);
    }
  });

  // === INITIAL CALCULATION ===
  updateNightsBadge();
  calculatePrice();

  // === FEATHER ICONS ===
  if (typeof feather !== 'undefined') {
    feather.replace();
  }
})();
