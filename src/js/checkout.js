import { loadHeaderFooter } from "./utils.mjs";
import CheckoutProcess from './CheckoutProcess.mjs';

const checkout = new CheckoutProcess('#subtotal', '#tax', '#shipping', '#order-total');

checkout.displayItemSubtotal();


//Need this to only run when the zip code is entered.
document.querySelector('#zip').addEventListener('blur', () => {
  checkout.calculateOrderTotal();
});

loadHeaderFooter();
