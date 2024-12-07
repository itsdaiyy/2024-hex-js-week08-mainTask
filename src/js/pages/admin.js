import { adminInstance } from "../config.js";
import { formateDate } from "../helpers.js";

// const orderList = document.querySelector(".order-list");

let ordersData = [];

const clearAllOrdersBtn = document.querySelector(
  "[data-action='clear-all-orders']"
);
const orderTableBody = document.querySelector(".orderPage-table tbody");

function getOrders() {
  adminInstance
    .get(`/orders`)
    .then((res) => {
      ordersData = res.data.orders;
      renderOrderList(ordersData);
      sortByItemRevenueChart(ordersData);
    })
    .catch((err) => {
      console.log(err);
    });
}

// 讀取所有訂單
function renderOrderItem({ id, user, products, paid, total, createdAt }) {
  const { name, tel, email, address, payment } = user;

  const orderDate = formateDate(createdAt);
  const productsStr = products
    .map((product) => `<p>${product.title} x ${product.quantity}</p>`)
    .join("");

  return `<tr data-id="${id}">
              <td>${id.substring(0, 4)}</td>
              <td>
                <p>${name}</p>
                <p>${tel}</p>
              </td>
              <td>${address}</td>
              <td>${email}</td>
              <td>
                ${productsStr}
              </td>
              <td>${orderDate}</td>
              <td class="orderStatus">
                <a href="#" data-action="update-paid-state">${
                  paid
                    ? "<span>已處理</span>"
                    : "<span class='warn'>未處理</span>"
                }</a>
              </td>
              <td>
                <input type="button" class="delSingleOrder-Btn" value="刪除" data-action="delete-order" />
              </td>
            </tr>`;
}

function renderOrderList(data) {
  const str = data.map((order) => renderOrderItem(order)).join("");
  orderTableBody.innerHTML = str;
}

function updatePaidState(id) {
  const paidState = ordersData.filter((order) => order.id === id)[0].paid;
  adminInstance
    .put(`/orders`, {
      data: {
        id: id,
        paid: !paidState,
      },
    })
    .then((res) => {
      ordersData = res.data.orders;
      console.log(ordersData);
      renderOrderList(ordersData);
    })
    .catch((err) => {
      console.log(err);
    });
}

function deleteOrderById(id) {
  adminInstance
    .delete(`/orders/${id}`)
    .then((res) => {
      ordersData = res.data.orders;
      renderOrderList(ordersData);
      sortByItemRevenueChart(ordersData);
    })
    .catch((err) => {
      console.log(err);
    });
}

// 刪除所有訂單
function handleDeleteAllOrders() {
  if (ordersData.length <= 0) return;
  console.log(clearAllOrdersBtn);
  adminInstance
    .delete(`/orders`)
    .then((res) => {
      ordersData = res.data.orders;
      renderOrderList(ordersData);
      sortByItemRevenueChart(ordersData);
    })
    .catch((err) => {
      console.log(err);
    });
}

// 圖表邏輯
function renderChart(data) {
  let chart = c3.generate({
    data: {
      columns: data,
      type: "pie",
    },
    color: {
      pattern: ["#DACBFF", "#9D7FEA", "#5434A7", "#392273"],
    },
  });
}

function calcItemRevenue(ordersData) {
  const itemsRevenueObj = {};
  ordersData.forEach((order) => {
    order.products.forEach((product) => {
      const { title, price, quantity } = product;
      if (itemsRevenueObj[title] === undefined) {
        itemsRevenueObj[title] = price * quantity;
      } else {
        itemsRevenueObj[title] += price * quantity;
      }
    });
  });

  return Object.entries(itemsRevenueObj);
}

function calcTopThreeRevenue(arr) {
  const topThreeRevenueArr = [];
  let otherTotal = 0;

  arr.forEach((product, index) => {
    if (index <= 2) {
      topThreeRevenueArr.push(product);
    }
    if (index > 2) {
      otherTotal += product[1];
    }
  });

  if (arr.length > 3) {
    topThreeRevenueArr.push(["其他", otherTotal]);
  }
  return topThreeRevenueArr;
}

function sortByItemRevenueChart(ordersData) {
  const itemsRevenueArr = calcItemRevenue(ordersData);
  const sortByRevenueArr = itemsRevenueArr.sort((a, b) => b[1] - a[1]);
  const chartData = calcTopThreeRevenue(sortByRevenueArr);
  renderChart(chartData);
}

function handleOrderListEvent(e) {
  e.preventDefault();
  const { dataset } = e.target;
  const { action } = dataset;
  const id = e.target.closest("tr").getAttribute("data-id");

  if (!action) return;

  if (action === "update-paid-state") {
    console.log("update-paid-state");
    updatePaidState(id);
  }

  if (action === "delete-order") {
    console.log("delete-order");
    deleteOrderById(id);
  }
}

function init() {
  getOrders();

  clearAllOrdersBtn.addEventListener("click", handleDeleteAllOrders);
  orderTableBody.addEventListener("click", handleOrderListEvent);
}

init();

//   orderList.innerHTML = str;
// }

// {
//     "id": "0m1i6eSkaS5g57f7SYcM",
//     "user": {
//         "name": "test3",
//         "tel": "0956-283-284",
//         "email": "test@gmail.com",
//         "address": "台中",
//         "payment": "xxxxxxx"
//     },
//     "products": [
//         {
//             "title": "Antony 床邊桌",
//             "description": "安東尼可調高度床邊桌。",
//             "category": "收納",
//             "origin_price": 3200,
//             "price": 1890,
//             "images": "https://hexschool-api.s3.us-west-2.amazonaws.com/custom/XWnC8Of71WeSvCbkGy5MvZSyCrim50F9njuwHypcbiimd8tWscxGdecRAyaNheboQkqQAiCWK12GwuwMBvEtAarU2Y7mKTwKZIqhIExyQzbAbls7NTOdN2vX1OAyEaAN.png",
//             "id": "evL2Fwgkw7zQyONpA6t0",
//             "quantity": 1
//         }
//     ],
//     "paid": false,
//     "quantity": 1,
//     "total": 1890,
//     "createdAt": 1732023605,
//     "updatedAt": 1732023605
// }
