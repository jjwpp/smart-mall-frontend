import{o as L,s as M,b as r,c as s,d as e,_ as B,f as k,J as p,F as z,z as j,y as v,n as d,e as A,j as V,h as w,r as c,p as S,k as D,m as x,i as H,t as N}from"./index-2bSS2Ji2.js";import{_ as R}from"./_plugin-vue_export-helper-DlAUqK2U.js";const E={class:"admin-layout"},T={class:"sidebar-logo"},F={class:"logo-text"},I={class:"sidebar-nav"},U={class:"menu-list"},J=["innerHTML"],O={viewBox:"0 0 24 24",width:"16",height:"16",fill:"currentColor"},P={key:0,d:"M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"},W={key:1,d:"M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"},$={class:"admin-topbar"},q={class:"topbar-right"},G={key:0,class:"user-menu"},K={class:"admin-content"},Q={__name:"AdminLayout",setup(X){const y=D(),g=S(),t=c(!1),n=c(!1),a=c(null),f=[{key:"dashboard",label:"控制台",path:"/admin/dashboard",icon:`<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>`},{key:"users",label:"用户管理",path:"/admin/users",icon:`<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <circle cx="12" cy="7" r="4" />
      <path d="M5.5 21.5C5.5 17.36 8.69 14 12 14c3.31 0 6.5 3.36 6.5 7.5" stroke="currentColor" stroke-width="2" fill="none" />
    </svg>`},{key:"roles",label:"角色管理",path:"/admin/roles",icon:`<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M12 2L3 7v6c0 5.25 3.83 10.15 9 11 5.17-.85 9-5.75 9-11V7l-9-5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
      <polyline points="8 12 11 15 16 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>`},{key:"products",label:"商品管理",path:"/admin/products",icon:`<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>`},{key:"categories",label:"分类管理",path:"/admin/categories",icon:`<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <rect x="2" y="3" width="8" height="6" rx="1" fill="none" stroke="currentColor" stroke-width="2" />
      <rect x="14" y="3" width="8" height="6" rx="1" fill="none" stroke="currentColor" stroke-width="2" />
      <rect x="2" y="13" width="8" height="8" rx="1" fill="none" stroke="currentColor" stroke-width="2" />
      <rect x="14" y="13" width="8" height="8" rx="1" fill="none" stroke="currentColor" stroke-width="2" />
      <line x1="6" y1="9" x2="6" y2="11" stroke="currentColor" stroke-width="2" />
      <line x1="6" y1="11" x2="10" y2="11" stroke="currentColor" stroke-width="2" />
      <line x1="18" y1="9" x2="18" y2="11" stroke="currentColor" stroke-width="2" />
    </svg>`},{key:"orders",label:"订单管理",path:"/admin/orders",icon:`<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <rect x="4" y="3" width="16" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="2" />
      <line x1="8" y1="8" x2="16" y2="8" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <line x1="8" y1="16" x2="12" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>`},{key:"after-sales",label:"售后管理",path:"/admin/after-sales",icon:`<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M21 12a9 9 0 1 1-9-9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <path d="M21 3v6h-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>`},{key:"payments",label:"支付管理",path:"/admin/payments",icon:`<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <rect x="2" y="4" width="20" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2" />
      <line x1="2" y1="10" x2="22" y2="10" stroke="currentColor" stroke-width="2" />
      <rect x="12" y="14" width="8" height="4" rx="0.5" fill="#1677ff" />
      <line x1="4" y1="14" x2="8" y2="14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <line x1="4" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>`},{key:"reviews",label:"评价管理",path:"/admin/reviews",icon:`<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
    </svg>`},{key:"coupons",label:"优惠券管理",path:"/admin/coupons",icon:`<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M20 12V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <circle cx="8" cy="12" r="2" fill="none" stroke="currentColor" stroke-width="1.5" />
      <path d="M14 13l-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <circle cx="14" cy="20" r="2" fill="none" stroke="#1677ff" stroke-width="1.5" />
      <circle cx="20" cy="14" r="2" fill="none" stroke="#1677ff" stroke-width="1.5" />
      <circle cx="20" cy="20" r="2" fill="none" stroke="#1677ff" stroke-width="1.5" />
      <path d="M16 20h4v-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>`}];function u(){t.value=!t.value}function m(i){return y.path.startsWith(i)}function C(){n.value=!1,g.push("/login")}function h(i){a.value&&!a.value.contains(i.target)&&(n.value=!1)}return L(()=>{document.addEventListener("click",h)}),M(()=>{document.removeEventListener("click",h)}),(i,o)=>{const b=x("router-link"),_=x("router-view");return r(),s("div",E,[e("aside",{class:d(["admin-sidebar",{collapsed:t.value}]),style:v({width:t.value?"64px":"220px"})},[e("div",T,[o[1]||(o[1]=e("img",{src:B,alt:"Smart Mall",class:"sidebar-logo-img"},null,-1)),k(e("span",F,"Smart Mall",512),[[p,!t.value]])]),e("nav",I,[e("ul",U,[(r(),s(z,null,j(f,l=>e("li",{key:l.key},[w(b,{to:l.path,class:d(["menu-item",{active:m(l.path)}])},{default:H(()=>[e("span",{class:"menu-icon",innerHTML:l.icon},null,8,J),k(e("span",{class:"menu-label"},N(l.label),513),[[p,!t.value]])]),_:2},1032,["to","class"])])),64))])]),e("div",{class:"sidebar-toggle",onClick:u},[(r(),s("svg",O,[t.value?(r(),s("path",W)):(r(),s("path",P))]))])],6),e("div",{class:"admin-main",style:v({marginLeft:t.value?"64px":"220px"})},[e("header",$,[e("div",{class:"topbar-left"},[e("button",{class:"hamburger-btn",onClick:u},[...o[2]||(o[2]=[e("svg",{viewBox:"0 0 24 24",width:"18",height:"18",fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round"},[e("line",{x1:"3",y1:"6",x2:"21",y2:"6"}),e("line",{x1:"3",y1:"12",x2:"21",y2:"12"}),e("line",{x1:"3",y1:"18",x2:"21",y2:"18"})],-1)])]),o[3]||(o[3]=e("nav",{class:"breadcrumb"},[e("span",{class:"breadcrumb-item"},"Dashboard"),e("span",{class:"breadcrumb-separator"},"/"),e("span",{class:"breadcrumb-item active"},"Sub Page")],-1))]),e("div",q,[o[10]||(o[10]=e("a",{class:"return-link",href:"/"},[e("svg",{viewBox:"0 0 24 24",width:"14",height:"14",fill:"none",stroke:"currentColor","stroke-width":"2","stroke-linecap":"round","stroke-linejoin":"round"},[e("path",{d:"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"}),e("polyline",{points:"9 22 9 12 15 12 15 22"})]),A(" 返回商城 ")],-1)),e("div",{class:"user-dropdown",ref_key:"userDropdownRef",ref:a},[e("button",{class:"user-trigger",onClick:o[0]||(o[0]=l=>n.value=!n.value)},[o[5]||(o[5]=e("span",{class:"user-avatar"},"A",-1)),o[6]||(o[6]=e("span",{class:"user-name"},"Admin",-1)),(r(),s("svg",{viewBox:"0 0 24 24",width:"12",height:"12",fill:"currentColor",class:d(["dropdown-arrow",{open:n.value}])},[...o[4]||(o[4]=[e("path",{d:"M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"},null,-1)])],2))]),n.value?(r(),s("div",G,[o[7]||(o[7]=e("div",{class:"menu-item"},"个人中心",-1)),o[8]||(o[8]=e("div",{class:"menu-item"},"系统设置",-1)),o[9]||(o[9]=e("div",{class:"menu-divider"},null,-1)),e("div",{class:"menu-item logout",onClick:C},"退出登录")])):V("",!0)],512)])]),e("main",K,[w(_)])],4)])}}},ee=R(Q,[["__scopeId","data-v-96df873a"]]);export{ee as default};
