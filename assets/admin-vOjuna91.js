import{b as s,d as y}from"./helpers-99FGThZe.js";let n=[];const $=document.querySelector("[data-action='clear-all-orders']"),p=document.querySelector(".orderPage-table tbody"),A=document.querySelector("#chart");function O(){s.get("/orders").then(t=>{n=t.data.orders,i(n),l(n)}).catch(t=>{console.log(t)})}function b({id:t,user:e,products:r,paid:a,total:d,createdAt:o}){const{name:c,tel:f,email:h,address:m,payment:I}=e,g=y(o),v=r.map(u=>`<p>${u.title} x ${u.quantity}</p>`).join("");return`<tr data-id="${t}">
              <td>${t.substring(0,4)}</td>
              <td>
                <p>${c}</p>
                <p>${f}</p>
              </td>
              <td>${m}</td>
              <td>${h}</td>
              <td>
                ${v}
              </td>
              <td>${g}</td>
              <td class="orderStatus">
              ${a?'<a href="#" data-action="update-paid-state">已處理</a>':'<a href="#" data-action="update-paid-state" class="warn">未處理</a>'}
              </td>
              <td>
                <input type="button" class="delSingleOrder-Btn" value="刪除" data-action="delete-order" />
              </td>
            </tr>`}function i(t){const e=t.map(r=>b(r)).join("");p.innerHTML=e}function R(t){const e=n.find(r=>r.id===t).paid;s.put("/orders",{data:{id:t,paid:!e}}).then(r=>{n=r.data.orders,i(n)}).catch(r=>{console.log(r)})}function S(t){s.delete(`/orders/${t}`).then(e=>{n=e.data.orders,i(n),l(n)}).catch(e=>{console.log(e)})}function B(){n.length<=0||s.delete("/orders").then(t=>{n=t.data.orders,i(n),l(n)}).catch(t=>{console.log(t)})}function D(t){c3.generate({data:{columns:t,type:"pie"},color:{pattern:["#DACBFF","#9D7FEA","#5434A7","#392273"]}})}function E(t){const e={};return t.forEach(r=>{r.products.forEach(a=>{const{title:d,price:o,quantity:c}=a;e[d]===void 0?e[d]=o*c:e[d]+=o*c})}),Object.entries(e)}function L(t){const e=[];let r=0;return t.forEach((a,d)=>{d<=2&&e.push(a),d>2&&(r+=a[1])}),t.length>3&&e.push(["其他",r]),e}function l(t){if(t.length<=0){A.classList.add("none");return}const r=E(t).sort((d,o)=>o[1]-d[1]),a=L(r);D(a)}function T(t){var d;t.preventDefault();const{dataset:e}=t.target,{action:r}=e,a=(d=t.target.closest("tr"))==null?void 0:d.getAttribute("data-id");if(!(!r||!a)){if(r==="update-paid-state"){R(a);return}if(r==="delete-order"){S(a);return}}}function q(){O(),$.addEventListener("click",B),p.addEventListener("click",T)}q();
