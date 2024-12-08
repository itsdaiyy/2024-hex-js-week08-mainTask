import { adminInstance } from "../config.js";
import { formatDate } from "../helpers.js";

let ordersData = [];

const clearAllOrdersBtn = document.querySelector(
  "[data-action='clear-all-orders']"
);
const orderTableBody = document.querySelector(".orderPage-table tbody");
const pieChart = document.querySelector("#chart");

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

  const orderDate = formatDate(createdAt);
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
              ${
                paid
                  ? `<a href="#" data-action="update-paid-state">已處理</a>`
                  : `<a href="#" data-action="update-paid-state" class="warn">未處理</a>`
              }
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
  const paidState = ordersData.find((order) => order.id === id).paid;
  adminInstance
    .put(`/orders`, {
      data: {
        id: id,
        paid: !paidState,
      },
    })
    .then((res) => {
      ordersData = res.data.orders;
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
  if (ordersData.length <= 0) {
    pieChart.classList.add("none");
    return;
  }
  const itemsRevenueArr = calcItemRevenue(ordersData);
  const sortByRevenueArr = itemsRevenueArr.sort((a, b) => b[1] - a[1]);
  const chartData = calcTopThreeRevenue(sortByRevenueArr);
  renderChart(chartData);
}

function handleOrderListEvent(e) {
  e.preventDefault();
  const { dataset } = e.target;
  const { action } = dataset;
  const id = e.target.closest("tr")?.getAttribute("data-id");

  if (!action || !id) return;

  if (action === "update-paid-state") {
    updatePaidState(id);
  }

  if (action === "delete-order") {
    deleteOrderById(id);
  }
}

function init() {
  getOrders();

  clearAllOrdersBtn.addEventListener("click", handleDeleteAllOrders);
  orderTableBody.addEventListener("click", handleOrderListEvent);
}

init();
