import { calculateCartTotal } from "./utils.mjs";
import { getLocalStorage } from "./utils.mjs";

const TAX_RATE = 0.06;
const BASE_SHIPPING = 10;
const EXTRA_ITEM_SHIPPING = 2;

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

    if (this.taxElem) this.taxElem.textContent = this.formatCurrency(tax);
    if (this.shippingElem) this.shippingElem.textContent = this.formatCurrency(shipping);
    if (this.totalElem) this.totalElem.textContent = this.formatCurrency(orderTotal);
  }

  formatCurrency(amount) {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }
}