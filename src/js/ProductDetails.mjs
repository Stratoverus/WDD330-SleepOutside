import { getLocalStorage, setLocalStorage } from "./utils.mjs";
import { updateCartCount } from "./utils.mjs";

export default class ProductDetails {
  constructor(productID, dataSource) {
    this.productID = productID;
    this.product = {};
    this.dataSource = dataSource;
  }
  
  async init() {
    // use the datasource to get the details for the current product. findProductById will return a promise! use await or .then() to process it
    this.product = await this.dataSource.findProductById(this.productID);
    // the product details are needed before rendering the HTML
    this.renderProductDetails();
    // once the HTML is rendered, add a listener to the Add to Cart button
    // Notice the .bind(this). This callback will not work if the bind(this) is missing. Review the readings from this week on 'this' to understand why.
    document.getElementById('addToCart')
        .addEventListener('click', this.addProductToCart.bind(this));
  }

  addProductToCart() {
    const cart = getLocalStorage("so-cart") || [];

    //checking to see if the product will exist already
    const existingInCart = cart.find(item => item.Id === this.product.Id)

    if (existingInCart) {
      existingInCart.quantity = (existingInCart.quantity || 1) + 1;
    }
    else {
      this.product.quantity = 1;
      cart.push(this.product);
    }
    
    setLocalStorage("so-cart", cart);
    updateCartCount();
  }

  renderProductDetails() {
    productDetailsTemplate(this.product);
  }
}

function productDetailsTemplate(product) {
  document.querySelector('h2').textContent = product.Brand.Name;
  document.querySelector('h3').textContent = product.NameWithoutBrand;

  const productImage = document.getElementById('productImage');
  productImage.src = product.Images.PrimaryLarge;
  productImage.alt = product.NameWithoutBrand;

  document.getElementById('productPrice').innerHTML = `<b>Price:</b> $${product.FinalPrice}`;
  document.getElementById('productColor').innerHTML = `<b>Color:</b> ${product.Colors[0].ColorName}`;
  document.getElementById('productDesc').innerHTML = `<b>Description:</b> ${product.DescriptionHtmlSimple}`;

  document.getElementById('addToCart').dataset.id = product.Id;
}
