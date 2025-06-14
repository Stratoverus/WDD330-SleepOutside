import { calculateCartTotal } from "./utils.mjs";
import { getLocalStorage } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";

const services = new ExternalServices();

const TAX_RATE = 0.06;
const BASE_SHIPPING = 10;
const EXTRA_ITEM_SHIPPING = 2;



function packageItems(items) {
    const simplifiedItems = items.map((item) => {
    console.log(item);
    return {
    id: item.Id,
    price: item.FinalPrice,
    name: item.Name,
    quantity: 1,
    };
    });
    return simplifiedItems;
}

function formDataToJSON(formElement) {
    const formData = new FormData(formElement);
    const convertedJSON = {};
    formData.forEach((value, key) => {
    convertedJSON[key] = value;
    });
    return convertedJSON;
}

export default class CheckoutProcess {
  constructor(subtotalSelector, taxSelector, shippingSelector, totalSelector) {
    this.subtotalElem = document.querySelector(subtotalSelector);
    this.taxElem = document.querySelector(taxSelector);
    this.shippingElem = document.querySelector(shippingSelector);
    this.totalElem = document.querySelector(totalSelector);
  }

  //subtotal calculations here
  displayItemSubtotal() {
    const subtotal = calculateCartTotal();
    this.subtotal = subtotal;
    if (this.subtotalElem) {
      this.subtotalElem.textContent = this.formatCurrency(subtotal);
    }
  }

  //calculating the total of the cart, will be only processed when the zip is entered.
  calculateOrderTotal(zip) {
    const cartItems = getLocalStorage('so-cart') || [];
    const totalQuantity = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

    const shipping = totalQuantity > 0 ? BASE_SHIPPING + (totalQuantity - 1) * EXTRA_ITEM_SHIPPING : 0;
    const tax = this.subtotal * TAX_RATE;
    const orderTotal = this.subtotal + tax + shipping;

    this.tax = tax;
    this.shipping = shipping;
    this.orderTotal = orderTotal;

    if (this.taxElem) this.taxElem.textContent = this.formatCurrency(tax);
    if (this.shippingElem) this.shippingElem.textContent = this.formatCurrency(shipping);
    if (this.totalElem) this.totalElem.textContent = this.formatCurrency(orderTotal);
  }

  formatCurrency(amount) {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }

  async checkout() {
    const formElement = document.forms['checkout'];
    
    // Validate form
    if (!formElement.checkValidity()) {
      formElement.reportValidity();
      throw new Error('Please fill in all required fields correctly.');
    }

    // Check if there are products in the cart
    const cartItems = getLocalStorage('so-cart') || [];
    if (cartItems.length === 0) {
      throw new Error('Your cart is empty. Cannot proceed with payment.');
    }

    // Crear objeto de orden
    const order = formDataToJSON(formElement);
    order.orderDate = new Date().toISOString();
    order.orderTotal = this.orderTotal;
    order.tax = this.tax;
    order.shipping = this.shipping;
    order.items = packageItems(cartItems);
    
    try {
      // Show loading indicator
      const submitBtn = document.querySelector('#checkoutSubmit');
      const originalBtnText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Processing...';
      
      // Enviar la orden
      const response = await services.checkout(order);
      
      // Clear cart and redirect to success page
      localStorage.removeItem('so-cart');
      
      // Generate order number (using timestamp if not provided by server)
      const orderNumber = response.orderId || `ORD-${Date.now()}`;
      
      // Redirect to success page with order number
      window.location.href = `/checkout/success.html?order=${orderNumber}`;
      
      return response;
      
    } catch (error) {
      console.error('Error en el proceso de pago:', error);
      
      // Custom error messages based on error type
      let errorMessage = 'An error occurred while processing your payment. Please try again.';
      
      if (error.status === 400) {
        errorMessage = 'There is a problem with the provided information. Please check your data.';
      } else if (error.status === 401 || error.status === 403) {
        errorMessage = 'Unauthorized. Please log in to continue.';
      } else if (error.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Mostrar mensaje de error al usuario
      alert(errorMessage);
      
      // Re-lanzar el error para que pueda ser manejado por el código que llama a este método
      throw error;
      
    } finally {
      // Restore submit button
      const submitBtn = document.querySelector('#checkoutSubmit');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText || 'Complete Purchase';
      }
    }
  }  
}
