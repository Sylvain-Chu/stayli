/**
 * Settings Page JavaScript
 * Handles form state tracking and submit button activation
 */

(function () {
  'use strict';

  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form.form-modern');
    if (!form) return;

    const submitButton = document.getElementById('save-button-top');
    if (!submitButton) {
      console.error('[Settings] Save button not found!');
      return;
    }

    // No sticky behavior - button stays in header naturally

    // Store initial form state
    const initialFormData = new FormData(form);
    const initialState = {};

    // Convert FormData to object for comparison
    for (const [key, value] of initialFormData.entries()) {
      if (!initialState[key]) {
        initialState[key] = [];
      }
      initialState[key].push(value);
    }

    // Function to check if form has changed
    function hasFormChanged() {
      const currentFormData = new FormData(form);
      const currentState = {};

      for (const [key, value] of currentFormData.entries()) {
        if (!currentState[key]) {
          currentState[key] = [];
        }
        currentState[key].push(value);
      }

      // Compare current state with initial state
      const allKeys = new Set([...Object.keys(initialState), ...Object.keys(currentState)]);

      for (const key of allKeys) {
        const initial = (initialState[key] || []).sort().join(',');
        const current = (currentState[key] || []).sort().join(',');
        if (initial !== current) {
          return true;
        }
      }

      return false;
    }

    // Function to update button state
    function updateButtonState() {
      const changed = hasFormChanged();

      submitButton.disabled = !changed;

      if (changed) {
        submitButton.classList.add('btn-active');
      } else {
        submitButton.classList.remove('btn-active');
      }
    }

    // Initially disable the button
    submitButton.disabled = true;

    // Listen to all form changes
    form.addEventListener('input', updateButtonState);
    form.addEventListener('change', updateButtonState);

    // Handle month button clicks for visual feedback only
    const monthButtons = document.querySelectorAll('.month-button input[type="checkbox"]');
    monthButtons.forEach((checkbox) => {
      checkbox.addEventListener('change', function () {
        updateButtonState();
      });
    });
  });
})();
