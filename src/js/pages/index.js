import axios from "axios";
import { apiPath, apiBase } from "../config.js";

let productsData = [];
let cartData = [];
let orderData = [];

const productsSection = document.querySelector(".productDisplay");
const productsList = document.querySelector(".productWrap");
const cartList = document.querySelector(".shoppingCart-table");
// const orderList = document.querySelector(".order-list");

// function getOrders() {
//   axios
//     .get(`${apiBase}/api/livejs/v1/admin/${apiPath}/orders`, {
//       headers: {
//         Authorization: `ECv7xxOCBre83U2b0aU2vrrqCBw1`,
//       },
//     })
//     .then(function (response) {
//       console.log(response.data.orders);
//       orderData = response.data.orders;
//       renderOrderList();
//     });
// }

// 取得資料邏輯
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

// 渲染資料邏輯
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

// 產品列表依類別篩選
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

// -------------------
// 購物車邏輯
function getCarts() {
  axios
    .get(`${apiBase}/api/livejs/v1/customer/${apiPath}/carts`)
    .then((res) => {
      cartData = res.data.carts;
      console.log("getCarts: ", cartData);
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
          <tr>
            <td>
              <div class="cardItem-title">
                <img src="${images}" alt="${title}" />
                <p>${title}</p>
              </div>
            </td>
            <td>NT$${price}</td>
            <td>${quantity}</td>
            <td>NT$${price * quantity}</td>
            <td class="discardBtn">
             <button class="material-icons" data-action="delete-item" data-id="${cartItemId}"> clear </button>
            </td>
          </tr>`;
}

function renderCartList(data) {
  const cartTableHead = `<tr>
            <th width="40%">品項</th>
            <th width="15%">單價</th>
            <th width="15%">數量</th>
            <th width="15%">金額</th>
            <th width="15%"></th>
          </tr>`;

  const cartItems = data.map(renderCartItem).join("");
  const totalPrice = calcCartTotalPrice(data);
  const cartTableFoot = `<tr>
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

  cartList.innerHTML = cartTableHead + cartItems + cartTableFoot;
}

// 新增產品邏輯
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

// 刪除「購物車內全部商品」邏輯
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

// 刪除「購物車特定品項」邏輯
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
  const target = e.target;
  const action = e.target.dataset.action;
  if (action === "delete-item") {
    console.log(target.dataset.id);
    deleteCartItem(target.dataset.id);
  }
}

// 初始化
function init() {
  getProducts();
  getCarts();
  // getOrders();

  // 監聽購物車
  cartList.addEventListener("click", (e) => {
    const { tagName, dataset } = e.target;
    const { action } = dataset;

    if (tagName !== "BUTTON" || !action) return;
    if (action === "clear-cart") {
      clearCart();
    }
  });

  // 監聽商品列表的按鈕;
  productsSection.addEventListener("click", handleProductsSectionEvent);
  productsSection.addEventListener("change", handleProductsSectionEvent);

  // 監聽產品列表
  cartList.addEventListener("click", handleCartEvent);
}

init();

// function renderOrderList() {
//   const str = orderData.reduce((acc, cur, curIndex) => {
//     const { user, quantity, total, paid } = cur;
//     const { name, payment } = user;
//     return (acc += `<tr>
//       <th scope="row">${curIndex + 1}</th>
//       <td>${name}</td>
//       <td>${payment}</td>
//       <td>${quantity}</td>
//       <td>${total}</td>
//        <td>${paid ? "已付款" : "尚未付款"}</td>
//     </tr>`);
//   }, "");

//   orderList.innerHTML = str;
// }

// 送出訂單邏輯
// function submitOrder() {
//   if (cartData.length === 0) {
//     console.log("請先新增品項至購物車");
//     return;
//   }
//   const orderData = {
//     data: {
//       user: {
//         name: "test3",
//         tel: "0956-283-284",
//         email: "test@gmail.com",
//         address: "台中",
//         payment: "xxxxxxx",
//       },
//     },
//   };

//   axios
//     .post(`${apiBase}/api/livejs/v1/customer/${apiPath}/orders`, orderData)
//     .then((res) => {
//       console.log(res.products);
//       getCarts();
//       getOrders();
//     })
//     .catch((err) => {
//       console.log(err.response.data.message || "送出訂單失敗");
//     });
// }
