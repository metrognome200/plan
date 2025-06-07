(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))a(e);new MutationObserver(e=>{for(const s of e)if(s.type==="childList")for(const r of s.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&a(r)}).observe(document,{childList:!0,subtree:!0});function n(e){const s={};return e.integrity&&(s.integrity=e.integrity),e.referrerPolicy&&(s.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?s.credentials="include":e.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function a(e){if(e.ep)return;e.ep=!0;const s=n(e);fetch(e.href,s)}})();let u=[],c={},d={},v={};const S={1:7.5,2:5,3:2.5,4:2.5,5:1.25,6:1.25,7:1.25,8:1.25,9:1.25,10:1.25};function T(){const o=document.getElementById("memberInput"),t=o.value.trim();t&&!u.includes(t)&&(u.push(t),v[t]={goats:0,goatPoints:0,tons:0,tonPoints:0},o.value="",f(),g(),b())}function P(o){u=u.filter(t=>t!==o),delete v[o],Object.keys(c).forEach(t=>{c[t]===o&&delete c[t]}),Object.keys(d).forEach(t=>{d[t]===o&&delete d[t]}),f(),y(),g(),h(),b()}function f(){const o=document.getElementById("teamList");o.innerHTML="",u.forEach(t=>{const n=document.createElement("div");n.className="team-member",n.draggable=!0,n.textContent=t;const a=document.createElement("button");a.className="remove-btn",a.innerHTML="×",a.onclick=e=>{e.stopPropagation(),P(t)},n.appendChild(a),n.addEventListener("dragstart",e=>{e.dataTransfer.setData("text/plain",t),n.classList.add("dragging")}),n.addEventListener("dragend",()=>{n.classList.remove("dragging")}),o.appendChild(n)})}function I(){const o=document.querySelectorAll(".drop-zone");let t=null;o.forEach(n=>{n.addEventListener("dragover",a=>{a.preventDefault(),n.classList.add("drag-over");const e=n.getBoundingClientRect(),s=15,r=100;t&&clearInterval(t),e.top<r?t=setInterval(()=>{window.scrollBy(0,-s)},16):e.bottom>window.innerHeight-r&&(t=setInterval(()=>{window.scrollBy(0,s)},16))}),n.addEventListener("dragleave",()=>{n.classList.remove("drag-over"),t&&(clearInterval(t),t=null)}),n.addEventListener("drop",a=>{a.preventDefault(),n.classList.remove("drag-over"),t&&(clearInterval(t),t=null);const e=a.dataTransfer.getData("text/plain"),s=n.dataset.board,r=parseInt(n.dataset.position);s==="goats"?(Object.keys(c).forEach(i=>{c[i]===e&&delete c[i]}),c[r]=e):(Object.keys(d).forEach(i=>{d[i]===e&&delete d[i]}),d[r]=e),y(),h()})}),document.addEventListener("dragend",()=>{t&&(clearInterval(t),t=null)})}function y(){E("goats",c),E("toons",d)}function E(o,t){document.getElementById(`${o}Leaderboard`).querySelectorAll(".drop-zone").forEach(e=>{const s=parseInt(e.dataset.position),r=e.querySelector(".placeholder");t[s]?(e.classList.add("occupied"),e.textContent=t[s],e.style.cursor="pointer",e.onclick=()=>{delete t[s],y(),h()}):(e.classList.remove("occupied"),e.textContent="",e.appendChild(r),e.style.cursor="default",e.onclick=null)})}function h(){L("goats",c),L("toons",d)}function L(o,t){const a=document.getElementById(`${o}Summary`).querySelector(".summary-content");let e=0,s="";const r=Object.keys(t).map(i=>parseInt(i)).sort((i,l)=>i-l);r.length===0?s='<div style="color: #999; font-style: italic;">No members assigned yet</div>':(r.forEach(i=>{const l=t[i],p=S[i];e+=p,s+=`
        <div class="summary-item">
          <span>${l} (${i}${M(i)})</span>
          <span>${p} tons</span>
        </div>
      `}),s+=`
      <div class="summary-item">
        <span>Total Expected Prize</span>
        <span>${e} tons</span>
      </div>
    `),a.innerHTML=s}function M(o){const t=["th","st","nd","rd"],n=o%100;return t[(n-20)%10]||t[n]||t[0]}function g(){const o=document.getElementById("memberStatsTable");o.innerHTML="";const t=a=>new Intl.NumberFormat("en-US",{maximumFractionDigits:0,minimumFractionDigits:0}).format(a),n=a=>new Intl.NumberFormat("en-US",{minimumFractionDigits:1,maximumFractionDigits:1}).format(a);u.forEach(a=>{const e=v[a]||{goats:0,goatPoints:0,tons:0,tonPoints:0},s=document.createElement("tr");s.setAttribute("data-member",a),s.innerHTML=`
      <td>${a}</td>
      <td>
        <input type="text" class="goats-input" value="${t(e.goats)}" 
               onchange="updateMemberStats('${a}', 'goats', this.value.replace(/,/g, ''))" 
               min="0" step="1000" placeholder="Enter goats">
      </td>
      <td class="points">${t(e.goatPoints)}</td>
      <td>
        <input type="number" class="tons-input" value="${n(e.tons)}" 
               onchange="updateMemberStats('${a}', 'tons', this.value)" 
               min="0" step="0.1" placeholder="Enter tons">
      </td>
      <td class="points">${t(e.tonPoints)}</td>
      <td class="actions">
        <button class="action-btn save-btn" onclick="saveMemberStats('${a}')">Save</button>
        <button class="action-btn reset-btn" onclick="resetMemberStats('${a}')">Reset</button>
      </td>
    `,o.appendChild(s)})}function b(){const o=document.querySelector("#statsSummary .summary-content");if(!o)return;let t=0,n=0,a=0,e=0,s=Object.keys(v).length;Object.values(v).forEach(m=>{t+=Number(m.goats)||0,n+=Number(m.tons)||0,a+=Number(m.goatPoints)||0,e+=Number(m.tonPoints)||0});const r=s?Math.round(a/s):0,i=s?Math.round(e/s):0,l=m=>new Intl.NumberFormat("en-US",{maximumFractionDigits:0,minimumFractionDigits:0}).format(m),p=m=>new Intl.NumberFormat("en-US",{minimumFractionDigits:1,maximumFractionDigits:1}).format(m);o.innerHTML=`
    <div class="stats-summary-item">
      <h5>Total Goats Spent</h5>
      <div class="value">${l(t)}</div>
    </div>
    <div class="stats-summary-item">
      <h5>Total Tons Spent</h5>
      <div class="value">${p(n)}</div>
    </div>
    <div class="stats-summary-item">
      <h5>Total Expected Goat Points</h5>
      <div class="value">${l(a)}</div>
    </div>
    <div class="stats-summary-item">
      <h5>Total Expected Ton Points</h5>
      <div class="value">${l(e)}</div>
    </div>
    <div class="stats-summary-item">
      <h5>Average Goat Points</h5>
      <div class="value">${l(r)}</div>
    </div>
    <div class="stats-summary-item">
      <h5>Average Ton Points</h5>
      <div class="value">${l(i)}</div>
    </div>
    <div class="stats-summary-item">
      <h5>Points per 10,000 Goats</h5>
      <div class="value">750,000</div>
    </div>
    <div class="stats-summary-item">
      <h5>Points per Ton</h5>
      <div class="value">75</div>
    </div>
  `}document.getElementById("memberInput").addEventListener("keypress",o=>{o.key==="Enter"&&T()});document.addEventListener("DOMContentLoaded",()=>{I(),f(),y(),g(),h(),b(),["Alice","Bob","Charlie","Diana","Eve","Frank"].forEach(t=>{u.includes(t)||(u.push(t),v[t]={goats:0,goatPoints:0,tons:0,tonPoints:0})}),f(),g()});
