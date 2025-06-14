import { loadHeaderFooter } from "./utils.mjs";
import CheckoutProcess from "./CheckoutProcess.mjs";

const checkout = new CheckoutProcess(
  "#subtotal",
  "#tax",
  "#shipping",
  "#order-total",
);

checkout.displayItemSubtotal();

//Need this to only run when the zip code is entered.
document.querySelector("#zip").addEventListener("blur", () => {
  checkout.calculateOrderTotal();
});

// Add novalidate to form to disable browser's default validation
document.forms['checkout'].setAttribute('novalidate', true);

// Define field validation in the order they appear in the form
const formFields = [
  { name: 'fname', message: 'Please enter your first name' },
  { name: 'lname', message: 'Please enter your last name' },
  { name: 'street', message: 'Please enter your street address' },
  { name: 'city', message: 'Please enter your city' },
  { name: 'state', message: 'Please enter your state' },
  { name: 'zip', message: 'Please enter your ZIP code' },
  { name: 'cardNumber', message: 'Please enter your card number' },
  { name: 'expiration', message: 'Please enter card expiration date' },
  { name: 'code', message: 'Please enter CVV code' }
];

// Handle form submission
document.querySelector("#checkoutSubmit").addEventListener("click", async (e) => {
  e.preventDefault();
  
  const form = document.forms['checkout'];
  let firstInvalidField = null;
  
  // First pass: Clear all custom validations
  formFields.forEach(({ name }) => {
    const field = form[name];
    if (field) {
      field.setCustomValidity('');
    }
  });
  
  // Second pass: Validate fields in order
  for (const { name, message } of formFields) {
    const field = form[name];
    if (!field) continue;
    
    // Check required field
    if (!field.value.trim()) {
      if (!firstInvalidField) {
        field.setCustomValidity(message);
        field.reportValidity();
        firstInvalidField = field;
      }
      continue;
    }
    
    // Additional validations only if field has a value
    let isValid = true;
    let errorMessage = '';
    
    switch(name) {
      case 'cardNumber':
        const cardNumber = field.value.replace(/\s/g, '');
        if (!/^\d{13,19}$/.test(cardNumber)) {
          errorMessage = 'Please enter a valid card number (13-19 digits)';
          isValid = false;
        }
        break;
        
      case 'expiration':
        if (!/^\d{2}\/\d{2}$/.test(field.value.trim())) {
          errorMessage = 'Please enter a valid expiration date (MM/YY)';
          isValid = false;
        }
        break;
        
      case 'code':
        if (!/^\d{3,4}$/.test(field.value.trim())) {
          errorMessage = 'Please enter a valid CVV (3-4 digits)';
          isValid = false;
        }
        break;
        
      case 'zip':
        if (!/^\d{5}(-\d{4})?$/.test(field.value.trim())) {
          errorMessage = 'Please enter a valid ZIP code (5 digits or 5-4 format)';
          isValid = false;
        }
        break;
    }
    
    if (!isValid && !firstInvalidField) {
      field.setCustomValidity(errorMessage);
      field.reportValidity();
      firstInvalidField = field;
    }
  }
  
  // Stop if any field is invalid
  if (firstInvalidField) {
    firstInvalidField.focus();
    return;
  }
  
  try {
    await checkout.checkout();
  } catch (error) {
    // Error is already handled in the checkout method
    console.error('Checkout process error:', error);
  }
});

// Add real-time validation and clear error messages on input
const formInputs = document.forms['checkout'].querySelectorAll('input, select, textarea');
formInputs.forEach(input => {
  // Clear validation message when user starts typing
  input.addEventListener('input', () => {
    if (input.validity.valid) {
      input.setCustomValidity('');
    }
    input.reportValidity();
  });
  
  // Add input masks for better UX
  if (input.name === 'expiration') {
    input.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
      }
      e.target.value = value;
    });
  }
  
  if (input.name === 'cardNumber') {
    input.addEventListener('input', (e) => {
      // Format as XXXX XXXX XXXX XXXX
      let value = e.target.value.replace(/\D/g, '');
      value = value.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
      e.target.value = value;
    });
  }
});

loadHeaderFooter();
