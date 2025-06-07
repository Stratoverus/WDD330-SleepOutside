import { loadHeaderFooter, getLocalStorage, setLocalStorage } from "./utils.mjs";

function renderCartContents() {
  const cartItems = getLocalStorage("so-cart") || [];
  const productList = document.querySelector(".product-list");
  
  if (cartItems.length === 0) {
    productList.innerHTML = "<p>Your cart is empty.</p>";
    updateCartCount(0);
    return;
  }

  const htmlItems = cartItems.map((item, index) => cartItemTemplate(item, index));
  productList.innerHTML = htmlItems.join("");
  
  // Agregar event listeners a los botones de eliminar
  document.querySelectorAll('.remove-item').forEach(button => {
    button.addEventListener('click', removeItemFromCart);
  });
  
  // Actualizar el contador del carrito
  updateCartCount(cartItems.reduce((total, item) => total + (item.quantity || 1), 0));
}

function cartItemTemplate(item, index) {
  return `
  <li class="cart-card divider">
    <a href="#" class="cart-card__image">
      <img
        src="${item.Image}"
        alt="${item.Name}"
      />
    </a>
    <a href="#">
      <h2 class="card__name">${item.Name}</h2>
    </a>
    <p class="cart-card__color">${item.Colors[0].ColorName}</p>
    <p class="cart-card__quantity">qty: ${item.quantity || 1}</p>
    <p class="cart-card__price">$${item.FinalPrice}</p>
    <button class="remove-item" data-index="${index}">Remove</button>
  </li>`;
}

function removeItemFromCart(e) {
  const index = e.target.dataset.index;
  let cartItems = getLocalStorage("so-cart") || [];
  
  // Eliminar el ítem del carrito
  cartItems.splice(index, 1);
  
  // Actualizar el localStorage
  setLocalStorage("so-cart", cartItems);
  
  // Volver a renderizar el carrito
  renderCartContents();
}

function updateCartCount(count) {
  const cartCount = document.querySelector('.cart-count');
  if (cartCount) {
    cartCount.textContent = count;
  }
}

// Inicializar
renderCartContents();
loadHeaderFooter();
