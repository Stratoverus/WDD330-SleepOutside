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
    
    // Validar el formulario
    if (!formElement.checkValidity()) {
      formElement.reportValidity();
      throw new Error('Por favor, completa todos los campos requeridos correctamente.');
    }

    // Verificar que hay productos en el carrito
    const cartItems = getLocalStorage('so-cart') || [];
    if (cartItems.length === 0) {
      throw new Error('Tu carrito está vacío. No se puede realizar el pago.');
    }

    // Crear objeto de orden
    const order = formDataToJSON(formElement);
    order.orderDate = new Date().toISOString();
    order.orderTotal = this.orderTotal;
    order.tax = this.tax;
    order.shipping = this.shipping;
    order.items = packageItems(cartItems);
    
    try {
      // Mostrar indicador de carga
      const submitBtn = document.querySelector('#checkoutSubmit');
      const originalBtnText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Procesando...';
      
      // Enviar la orden
      const response = await services.checkout(order);
      
      // Limpiar carrito y redirigir a la página de éxito
      localStorage.removeItem('so-cart');
      
      // Generar un número de orden (usando timestamp si no viene del servidor)
      const orderNumber = response.orderId || `ORD-${Date.now()}`;
      
      // Redirigir a la página de éxito con el número de orden
      window.location.href = `/checkout/success.html?order=${orderNumber}`;
      
      return response;
      
    } catch (error) {
      console.error('Error en el proceso de pago:', error);
      
      // Mensajes de error personalizados según el tipo de error
      let errorMessage = 'Ocurrió un error al procesar tu pago. Por favor, inténtalo de nuevo.';
      
      if (error.status === 400) {
        errorMessage = 'Hay un problema con la información proporcionada. Por favor, verifica los datos.';
      } else if (error.status === 401 || error.status === 403) {
        errorMessage = 'No autorizado. Por favor, inicia sesión para continuar.';
      } else if (error.status >= 500) {
        errorMessage = 'Error en el servidor. Por favor, inténtalo más tarde.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Mostrar mensaje de error al usuario
      alert(errorMessage);
      
      // Re-lanzar el error para que pueda ser manejado por el código que llama a este método
      throw error;
      
    } finally {
      // Restaurar el botón de envío
      const submitBtn = document.querySelector('#checkoutSubmit');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText || 'Realizar Pago';
      }
    }
  }  
}
