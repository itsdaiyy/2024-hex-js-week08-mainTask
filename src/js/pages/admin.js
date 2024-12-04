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
