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

document.querySelector("#checkoutSubmit").addEventListener("click", (e) => {
  e.preventDefault();
  const form = document.forms[0];
  const check_status = form.checkValidity();
  form.reportValidity();
  if(check_status)
    checkout.checkout();
});

loadHeaderFooter();
