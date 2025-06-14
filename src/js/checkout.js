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

document.querySelector("#checkoutSubmit").addEventListener("click", async (e) => {
  e.preventDefault();
  
  try {
    await checkout.checkout();
  } catch (error) {
    // El error ya fue manejado en el método checkout
    console.error('Error en el proceso de pago:', error);
  }
});

loadHeaderFooter();
