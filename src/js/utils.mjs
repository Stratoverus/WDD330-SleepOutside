// wrapper for querySelector...returns matching element
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}
// or a more concise version if you are into that sort of thing:
// export const qs = (selector, parent = document) => parent.querySelector(selector);

// retrieve data from localstorage
export function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}
// save data to local storage
export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
// set a listener for both touchend and click
export function setClick(selector, callback) {
  qs(selector).addEventListener("touchend", (event) => {
    event.preventDefault();
    callback();
  });
  qs(selector).addEventListener("click", callback);
}

export function getParam(param) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const product = urlParams.get(param);
  return product
}

export function renderListWithTemplate(template, parentElement, list, position = "afterbegin", clear = false) {
  const htmlStrings = list.map(template);
  // if clear is true we need to clear out the contents of the parent.
  if (clear) {
    parentElement.innerHTML = "";
  }
  parentElement.insertAdjacentHTML(position, htmlStrings.join(""));
}

export function renderWithTemplate(template, parentElement, data, callback) {
  parentElement.innerHTML = template;
  if (callback) {
    callback(data);
  }
}

async function loadTemplate(path) { 
  const response = await fetch(path);
  const template = await response.text();
  return template;

}

export async function loadHeaderFooter() {
  const header = await loadTemplate("../partials/header.html");
  const headerElement = document.querySelector("#start-header");
  renderWithTemplate(header, headerElement)
  updateCartCount();

  const footer = await loadTemplate("../partials/footer.html");
  const footerElement = document.querySelector("#end-footer");
  renderWithTemplate(footer, footerElement)

}

export function updateCartCount() {
  const cartItems = getLocalStorage("so-cart") || [];
  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const cartCountElement = document.getElementById("cart-count");
  if (cartCountElement) {
    cartCountElement.textContent = cartCount;
    //hide the number if cart is empty
    cartCountElement.style.display = cartCount > 0 ? "block" : "none";
  }
}

export function calculateCartTotal() {
  const cartItems = getLocalStorage('so-cart');

  if (!Array.isArray(cartItems)) return 0;

  return cartItems.reduce((total, item) => {
    const itemTotal = (item.FinalPrice || 0) * (item.quantity || 0);
    return total + itemTotal;
  }, 0);
}

export function alertMessage(message, scroll=true) {
  //removing the alert, just in case user didn't x out the other
  const existingAlert = document.querySelector(".checkout-alert");
  if (existingAlert) {
    existingAlert.remove();
  }

  //creating the container
  const alert = document.createElement("div");
  alert.classList.add("checkout-alert");

  //making the close button
  const closeBtn = document.createElement("button");
  closeBtn.classList.add("alert-close-btn");
  closeBtn.innerHTML = "&times;";
  closeBtn.setAttribute("aria-label", "Close alert");
  closeBtn.addEventListener("click", () => {
    alert.remove();
  });
  alert.appendChild(closeBtn);

  //message content has been added
  if (typeof message === "string") {
    const msg = document.createElement("p");
    msg.textContent = message;
    alert.appendChild(msg);
  } else if (typeof message === "object") {
    const list = document.createElement("ul");
    for (const msg of Object.values(message)) {
      const li = document.createElement("li");
      li.textContent = msg;
      list.appendChild(li);
    }
    alert.appendChild(list);
  }

  //putting the alert at the top of the page
  const header = document.querySelector("header");
  header.insertAdjacentElement("afterend", alert);

  if (scroll) {
    header.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}