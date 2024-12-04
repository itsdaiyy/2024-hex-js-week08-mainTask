import axios from "axios";
import { apiPath, apiBase } from "../config.js";
import { validate } from "validate.js";

let productsData = [];
let cartData = [];

const productsSection = document.querySelector(".productDisplay");
const productsList = document.querySelector(".productWrap");
const cartTableBody = document.querySelector(".shoppingCart-table tbody");
const cartTableFoot = document.querySelector(".shoppingCart-table tFoot");
const orderForm = document.querySelector(".orderInfo-form");

// 產品 - 取得資料邏輯
function getProducts() {
  axios
    .get(`${apiBase}/api/livejs/v1/customer/${apiPath}/products`)
    .then((res) => {
      productsData = res.data.products;
      renderProductsList(productsData);
    })
    .catch((err) => {
      console.log(err.response.data.message || "取得產品失敗");
    });
}

// 產品 - 渲染
function renderProductsList(data) {
  let str = "";
  data.forEach(function (item) {
    const { id, title, category, origin_price, price, images } = item;
    str += `<li class="productCard">
          <h4 class="productType">${category}</h4>
          <img
            src="${images}"
            alt="${title}"
          />
          <button class="addCardBtn" data-action="add-to-cart" data-id="${id}">加入購物車</button>
          <h3>${title}</h3>
          <del class="originPrice">NT$${origin_price}</del>
          <p class="nowPrice">NT$${price}</p>
        </li>`;
  });
  productsList.innerHTML = str;
}

// 產品 - 列表依類別篩選
function filterProducts(type) {
  console.log(type);
  if (type === "全部") {
    renderProductsList(productsData);
    return;
  }
  const filterData = productsData.filter(
    (product) => product.category === type
  );
  renderProductsList(filterData);
  console.log(filterData);
}

// 購物車
function getCarts() {
  axios
    .get(`${apiBase}/api/livejs/v1/customer/${apiPath}/carts`)
    .then((res) => {
      cartData = res.data.carts;
      renderCartList(cartData);
    })
    .catch((err) => {
      console.log(err || "取得購物車失敗");
    });
}

function calcCartTotalPrice(data) {
  return data.reduce((acc, cur) => {
    const { quantity, product } = cur;
    return (acc += product.price * quantity);
  }, 0);
}

function renderCartItem({ quantity, product, id: cartItemId }) {
  const { title, price, images } = product;
  return `
          <tr data-id="${cartItemId}">
            <td>
              <div class="cardItem-title">
                <img src="${images}" alt="${title}" />
                <p>${title}</p>
              </div>
            </td>
            <td>NT$${price}</td>
            <td>
             <button class="material-icons quantity-btn" type="button" data-action="add-item-quantity"> add </button>
            <span>${quantity}</span>
            <button class="material-icons quantity-btn" type="button" data-action="minus-item-quantity"> remove </button>
            </td>
            <td>NT$${price * quantity}</td>
            <td class="discardBtn">
             <button class="material-icons" data-action="delete-item"> clear </button>
            </td>
          </tr>`;
}

function renderCartList(data) {
  const cartItems = data.map(renderCartItem).join("");
  const totalPrice = calcCartTotalPrice(data);
  const cartTableFootStr = `<tr>
            <td>
              <button class="discardAllBtn" data-action="clear-cart">刪除所有品項</button>
            </td>
            <td></td>
            <td></td>
            <td>
              <p>總金額</p>
            </td>
            <td>NT$${totalPrice}</td>
          </tr>`;

  cartTableBody.innerHTML = cartItems;
  cartTableFoot.innerHTML = cartTableFootStr;
}

// 購物車 - 新增商品
function addCartItem(productId) {
  const existItem = cartData.find((item) => item.product.id === productId);
  const newQuantity = existItem ? existItem.quantity + 1 : 1;
  axios
    .post(`${apiBase}/api/livejs/v1/customer/${apiPath}/carts`, {
      data: {
        productId: productId,
        quantity: newQuantity,
      },
    })
    .then((res) => {
      cartData = res.data.carts;
      console.log("addItem: ", cartData);
      renderCartList(cartData);
    })
    .catch((err) => {
      console.log(err || "新增購物車失敗");
    });
}

// 購物車 - 刪除「購物車內全部商品」邏輯
function clearCart() {
  if (!cartData.length) return;
  axios
    .delete(`${apiBase}/api/livejs/v1/customer/${apiPath}/carts`)
    .then((res) => {
      cartData = res.data.carts;
      console.log(res.data.carts);
      renderCartList(cartData);
    })
    .catch((err) => {
      console.log(err.response.data.message);
    });
}

// 購物車 - 刪除「購物車特定品項」邏輯
function deleteCartItem(cartItemId) {
  axios
    .delete(`${apiBase}/api/livejs/v1/customer/${apiPath}/carts/${cartItemId}`)
    .then((res) => {
      console.log("deleteCart", res.data.carts);
      cartData = res.data.carts;
      renderCartList(cartData);
    })
    .catch((err) => {
      console.log(err.response.data.message || "刪除商品失敗");
    });
}

function handleProductsSectionEvent(e) {
  const action = e.target.dataset.action;

  if (e.type === "change" && action === "filter-products") {
    filterProducts(e.target.value);
  } else if (e.type === "click" && action === "add-to-cart") {
    addCartItem(e.target.dataset.id);
  }
}

function handleCartEvent(e) {
  const { dataset } = e.target;
  const { action } = dataset;
  const id = e.target.closest("tr").getAttribute("data-id");

  if (!action && !id) return;

  if (action === "delete-item") {
    console.log("delete-item", id);
    deleteCartItem(id);
    return;
  }

  if (action === "clear-cart") {
    clearCart();
    return;
  }
}

// 訂單 -（客戶）送出訂單邏輯
function submitOrder(order) {
  if (cartData.length === 0) {
    console.log("請先新增品項至購物車");
    return;
  }

  const orderData = {
    data: {
      user: {
        name: order["姓名"],
        tel: order["電話"],
        email: order["Email"],
        address: order["寄送地址"],
        payment: order["交易方式"],
      },
    },
  };

  axios
    .post(`${apiBase}/api/livejs/v1/customer/${apiPath}/orders`, orderData)
    .then((res) => {
      getCarts();
    })
    .catch((err) => {
      console.log(err.response.data.message || "送出訂單失敗");
    })
    .finally(() => {
      orderForm.reset();
    });
}

function checkOrderFormValue() {
  const constraints = {
    Email: {
      presence: { allowEmpty: false, message: "必填！" },
      email: {
        message: "請輸入正確 email 格式",
      },
    },
    交易方式: {
      presence: { message: "必填！" },
    },
    姓名: {
      presence: { message: "必填！" },
    },
    寄送地址: {
      presence: { message: "必填！" },
    },
    電話: {
      presence: { message: "必填！" },
    },
  };

  const errors = validate(orderForm, constraints);
  return errors;
}

function handleSubmitOrder(e) {
  e.preventDefault();

  // 清除錯誤訊息
  document
    .querySelectorAll(".orderInfo-message.block")
    .forEach((infoMsg) => infoMsg.classList.remove("block"));

  const errors = checkOrderFormValue();

  if (errors) {
    Object.keys(errors).forEach((key) => {
      const errorMsg = document.querySelector(`[data-message="${key}"]`);
      errorMsg.classList.add("block");
    });
    return;
  }

  const formData = new FormData(orderForm);
  const orderData = Object.fromEntries(formData.entries());

  submitOrder(orderData);
}

// 初始化
function init() {
  getProducts();
  getCarts();

  // 監聽購物車
  cartTableBody.addEventListener("click", handleCartEvent);
  cartTableFoot.addEventListener("click", handleCartEvent);

  // 監聽商品列表的按鈕;
  productsSection.addEventListener("click", handleProductsSectionEvent);
  productsSection.addEventListener("change", handleProductsSectionEvent);

  // 監聽送出訂單
  orderForm.addEventListener("submit", handleSubmitOrder);
}

init();
