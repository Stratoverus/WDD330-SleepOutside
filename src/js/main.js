import { loadHeaderFooter } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";
import ProductList from "./ProductList.mjs";

const productData = new ExternalServices("tents");

const element = document.querySelector(".product-list");

const productList = new ProductList("tents", productData, element);

productList.init();
loadHeaderFooter();
