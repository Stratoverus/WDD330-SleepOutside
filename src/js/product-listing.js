import ExternalServices from "./ExternalServices.mjs";
import ProductList from "./ProductList.mjs";
import { getParam, loadHeaderFooter } from "./utils.mjs";

const category = getParam("category");

const productData = new ExternalServices();

let topTitle = document.querySelector("#topTitle");

topTitle.innerHTML = category.charAt(0).toUpperCase() + category.slice(1);

const element = document.querySelector(".product-list");

const productList = new ProductList(category, productData, element);

productList.init();
loadHeaderFooter();
