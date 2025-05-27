import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";
import { getParam, loadHeaderFooter } from "./utils.mjs";

const category = getParam('category');

const productData = new ProductData();

let topTitle = document.querySelector("#topTitle");

topTitle.innerHTML = category.charAt(0).toUpperCase() + category.slice(1);

const element = document.querySelector(".product-list");

const productList = new ProductList(category, productData, element);

productList.init();
loadHeaderFooter();
