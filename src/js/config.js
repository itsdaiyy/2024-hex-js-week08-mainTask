import axios from "axios";

const apiPath = "ollie";
const apiBase = "https://livejs-api.hexschool.io";

// 前台
const customerApi = `${apiBase}/api/livejs/v1/customer/${apiPath}`;

// 後台
const token = "ECv7xxOCBre83U2b0aU2vrrqCBw1";
const adminApi = `${apiBase}/api/livejs/v1/admin/${apiPath}`;
const headers = {
  authorization: token,
};

const adminInstance = axios.create({
  baseURL: adminApi,
  headers,
});

export { customerApi, adminInstance };
