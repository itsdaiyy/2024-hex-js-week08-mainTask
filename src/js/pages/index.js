import axios from "axios";
import Swal from "sweetalert2";
import { validate } from "validate.js";
import { customerApi } from "../config.js";
import { formatNumber } from "../helpers.js";

let productsData = [];
let cartData = [];

const productsSection = document.querySelector(".productDisplay");
const productsList = document.querySelector(".productWrap");
const cartTableBody = document.querySelector(".shoppingCart-table tbody");
const cartTableFoot = document.querySelector(".shoppingCart-table tFoot");
const orderForm = document.querySelector(".orderInfo-form");

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

// 產品 - 取得資料邏輯
function getProducts() {
  axios
    .get(`${customerApi}/products`)
    .then((res) => {
      productsData = res.data.products;
      renderProductsList(productsData);
    })
    .catch((err) => {
      console.log(err.response.data.message);
      Toast.fire({
        icon: "error",
        title: "取得產品失敗",
      });
    });
}

// 產品 - 渲染
function renderProductsList(data) {
  productsList.innerHTML = data
    .map((item) => {
      const { id, title, category, origin_price, price, images } = item;
      return `<li class="productCard">
          <h4 class="productType">${category}</h4>
          <img
            src="${images}"
            alt="${title}"
          />
          <button class="addCardBtn" data-action="add-to-cart" data-id="${id}">加入購物車</button>
          <h3>${title}</h3>
          <del class="originPrice">NT$${formatNumber(origin_price)}</del>
          <p class="nowPrice">NT$${formatNumber(price)}</p>
        </li>`;
    })
    .join("");
}

// 產品 - 列表依類別篩選
function filterProducts(type) {
  if (type === "全部") {
    renderProductsList(productsData);
    return;
  }
  const filterData = productsData.filter(
    (product) => product.category === type
  );
  renderProductsList(filterData);
}

// 購物車
function getCarts() {
  axios
    .get(`${customerApi}/carts`)
    .then((res) => {
      cartData = res.data.carts;
      renderCartList(cartData);
    })
    .catch((err) => {
      console.log(err.response.data.message);
      Toast.fire({
        icon: "error",
        title: "取得購物車失敗",
      });
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
  const totalPrice = price * quantity;
  return `
          <tr data-id="${cartItemId}">
            <td>
              <div class="cardItem-title">
                <img src="${images}" alt="${title}" />
                <p>${title}</p>
              </div>
            </td>
            <td>NT$${formatNumber(price)}</td>
            <td>
              <button class="material-icons quantity-btn" type="button" data-action="minus-item-quantity"> remove </button>
            <span>${quantity}</span>
            <button class="material-icons quantity-btn" type="button" data-action="add-item-quantity"> add </button>
            </td>
            <td>NT$${formatNumber(totalPrice)}</td>
            <td class="discardBtn">
             <button class="material-icons" data-action="delete-item"> clear </button>
            </td>
          </tr>`;
}

function renderCartList(data) {
  if (data.length <= 0) {
    cartTableBody.innerHTML = `<tr><td>購物車內沒有商品，請先加入商品至購物車</td></tr>`;
    cartTableFoot.innerHTML = "";
    return;
  }
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
            <td>NT$${formatNumber(totalPrice)}</td>
          </tr>`;

  cartTableBody.innerHTML = cartItems;
  cartTableFoot.innerHTML = cartTableFootStr;
}

// 購物車 - 新增商品
function addCartItem(productId) {
  const existItem = cartData.find((item) => item.product.id === productId);
  const newQuantity = existItem ? existItem.quantity + 1 : 1;

  const addCardBtn = document.querySelectorAll(".addCardBtn");
  addCardBtn.forEach((btn) => btn.classList.add("disabled"));

  axios
    .post(`${customerApi}/carts`, {
      data: {
        productId: productId,
        quantity: newQuantity,
      },
    })
    .then((res) => {
      Toast.fire({
        icon: "success",
        title: "商品成功加入購物車",
      });
      cartData = res.data.carts;
      renderCartList(cartData);
      addCardBtn.forEach((btn) => btn.classList.remove("disabled"));
    })
    .catch((err) => {
      console.log(err.response.data.message);
      Toast.fire({
        icon: "error",
        title: "新增商品失敗",
      });
    });
}

// 購物車 - 更新數量
function updateCartQuantity(cartItemId, action) {
  // 取得原本的 quantity
  let originQuantity = cartData.find(
    (product) => product.id === cartItemId
  ).quantity;

  if (originQuantity <= 1 && action === "minus") {
    deleteCartItem(cartItemId);
    return;
  }

  const rules = {
    add: (quantity) => quantity + 1,
    minus: (quantity) => quantity - 1,
  };

  axios
    .patch(`${customerApi}/carts`, {
      data: {
        id: cartItemId,
        quantity: rules[action](originQuantity),
      },
    })
    .then((res) => {
      cartData = res.data.carts;
      renderCartList(cartData);
    })
    .catch((err) => {
      console.log(err.response.data.message);
      Toast.fire({
        icon: "error",
        title: "更新購物車數量失敗",
      });
    });
}

// 購物車 - 刪除「購物車內全部商品」邏輯
function clearCart() {
  if (!cartData.length) return;
  axios
    .delete(`${customerApi}/carts`)
    .then((res) => {
      cartData = res.data.carts;
      renderCartList(cartData);
    })
    .catch((err) => {
      console.log(err.response.data.message);
      Toast.fire({
        icon: "error",
        title: "刪除購物車內全部商品失敗",
      });
    });
}

// 購物車 - 刪除「購物車特定品項」邏輯
function deleteCartItem(cartItemId) {
  axios
    .delete(`${customerApi}/carts/${cartItemId}`)
    .then((res) => {
      cartData = res.data.carts;
      renderCartList(cartData);
    })
    .catch((err) => {
      console.log(err.response.data.message);
      Toast.fire({
        icon: "error",
        title: "刪除商品失敗",
      });
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
    deleteCartItem(id);
    return;
  }

  if (action === "add-item-quantity") {
    updateCartQuantity(id, "add");
    return;
  }

  if (action === "minus-item-quantity") {
    updateCartQuantity(id, "minus");
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
    .post(`${customerApi}/orders`, orderData)
    .then((res) => {
      getCarts();
      Toast.fire({
        icon: "success",
        title: "訂單成功送出",
      });
    })
    .catch((err) => {
      console.log(err.response.data.message);
      Toast.fire({
        icon: "error",
        title: "送出訂單失敗",
      });
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
    console.log(errors);
    Object.keys(errors).forEach((key) => {
      console.log(key);
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
