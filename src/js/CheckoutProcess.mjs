import { calculateCartTotal } from "./utils.mjs";
import { getLocalStorage } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";
import { alertMessage } from "./utils.mjs";

const services = new ExternalServices();

const TAX_RATE = 0.06;
const BASE_SHIPPING = 10;
const EXTRA_ITEM_SHIPPING = 2;

function clearCart() {
  localStorage.removeItem('so-cart');
}


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
    const formElement = document.forms["checkout"];
    const order = formDataToJSON(formElement);

    const cartItems = getLocalStorage('so-cart') || [];
    order.items = packageItems(cartItems);

    order.orderDate = new Date().toISOString();
    order.orderTotal = this.orderTotal;
    order.tax = this.tax;
    order.shipping = this.shipping;

    console.log(order);

    try {
      const response = await services.checkout(order);
      if (response?.message === "Order Placed") {
        clearCart();
        window.location.href = "/checkout/success.html";
      } else {
        alertMessage("Order failed. Please try again.");
      }
      } catch (err) {
        console.log(err);
        const errorData = err?.message;
        alertMessage(errorData || "Something went wrong. Please try again.");
      }
    }
}


