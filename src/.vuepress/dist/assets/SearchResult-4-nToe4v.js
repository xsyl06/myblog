import{u as $,f as se,g as te,h as I,i as ae,P as le,t as re,j as ue,k as D,l as M,m as ie,n as U,p as t,q as oe,R as P,s as ne,v as ce,x as Ee,C as ve,y as ye,z as de,A as he,B as pe,D as Be,E as me,F as Ae,G as j,H as O,I as ge,J as H,K as Ce}from"./app-C_5Scca9.js";const fe=["/","/statudy/JVM/01-JVM%E5%86%85%E5%AD%98%E6%A8%A1%E5%9E%8B.html","/statudy/JVM/02-%E6%B7%B1%E5%85%A5%E7%90%86%E8%A7%A3JVM%E6%89%A7%E8%A1%8C%E5%BC%95%E6%93%8E.html","/statudy/JVM/03-JVM%E5%AF%B9%E8%B1%A1%E5%88%9B%E5%BB%BA%E5%8F%8A%E5%86%85%E5%AD%98%E5%88%86%E9%85%8D%E6%9C%BA%E5%88%B6.html","/statudy/JVM/04-JVM%E7%9A%84%E5%9E%83%E5%9C%BE%E6%94%B6%E9%9B%86%E5%99%A8%EF%BC%88%E4%B8%8A%EF%BC%89.html","/statudy/JVM/05-JVM%E7%9A%84%E5%9E%83%E5%9C%BE%E6%94%B6%E9%9B%86%E5%99%A8%EF%BC%88%E4%B8%8B%EF%BC%89.html","/statudy/JVM/06-JVM%E5%B7%A5%E5%85%B7%E8%AF%A6%E8%A7%A3.html","/statudy/Mysql/01-%E7%90%86%E8%A7%A3Mysql%E7%B4%A2%E5%BC%95%E5%BA%95%E5%B1%82%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84.html","/statudy/Mysql/02-Mysql%E7%B4%A2%E5%BC%95%E4%BC%98%E5%8C%96%E4%B8%80.html","/statudy/Mysql/03-Mysql%E7%B4%A2%E5%BC%95%E4%BC%98%E5%8C%96%E4%BA%8C.html","/statudy/Mysql/04-%E7%90%86%E8%A7%A3Mysql%E4%BA%8B%E5%8A%A1%E9%9A%94%E7%A6%BB%E7%BA%A7%E5%88%AB%E5%8F%8A%E9%94%81%E6%9C%BA%E5%88%B6.html","/statudy/Mysql/05-%E7%90%86%E8%A7%A3MVCC%E4%B8%8EBufferPool.html","/statudy/Mysql/Using%20filesort%E6%96%87%E4%BB%B6%E6%8E%92%E5%BA%8F%E5%8E%9F%E7%90%86.html","/404.html","/statudy/JVM/","/statudy/","/statudy/Mysql/","/category/","/category/jvm/","/category/mysql/","/tag/","/tag/jvm/","/tag/%E5%9E%83%E5%9C%BE%E6%94%B6%E9%9B%86%E5%99%A8/","/tag/mysql/","/article/","/star/","/timeline/"],qe="SEARCH_PRO_QUERY_HISTORY",B=$(qe,[]),Me=()=>{const{queryHistoryCount:a}=H,l=a>0;return{enabled:l,queryHistory:B,addQueryHistory:r=>{l&&(B.value=Array.from(new Set([r,...B.value.slice(0,a-1)])))},removeQueryHistory:r=>{B.value=[...B.value.slice(0,r),...B.value.slice(r+1)]}}},J=a=>fe[a.id]+("anchor"in a?`#${a.anchor}`:""),He="SEARCH_PRO_RESULT_HISTORY",{resultHistoryCount:T}=H,m=$(He,[]),Re=()=>{const a=T>0;return{enabled:a,resultHistory:m,addResultHistory:l=>{if(a){const r={link:J(l),display:l.display};"header"in l&&(r.header=l.header),m.value=[r,...m.value.slice(0,T-1)]}},removeResultHistory:l=>{m.value=[...m.value.slice(0,l),...m.value.slice(l+1)]}}},ke=a=>{const l=ve(),r=I(),R=ye(),i=D(0),C=M(()=>i.value>0),d=de([]);return he(()=>{const{search:h,terminate:k}=pe(),A=ge(c=>{const g=c.join(" "),{searchFilter:F=y=>y,splitWord:Q,suggestionsFilter:S,...p}=l.value;g?(i.value+=1,h(c.join(" "),r.value,p).then(y=>F(y,g,r.value,R.value)).then(y=>{i.value-=1,d.value=y}).catch(y=>{console.warn(y),i.value-=1,i.value||(d.value=[])})):d.value=[]},H.searchDelay-H.suggestDelay);U([a,r],([c])=>A(c),{immediate:!0}),Be(()=>{k()})}),{isSearching:C,results:d}};var Qe=se({name:"SearchResult",props:{queries:{type:Array,required:!0},isFocusing:Boolean},emits:["close","updateQuery"],setup(a,{emit:l}){const r=te(),R=I(),i=ae(le),{enabled:C,addQueryHistory:d,queryHistory:h,removeQueryHistory:k}=Me(),{enabled:A,resultHistory:c,addResultHistory:g,removeResultHistory:F}=Re(),Q=C||A,S=re(a,"queries"),{results:p,isSearching:y}=ke(S),u=ue({isQuery:!0,index:0}),E=D(0),v=D(0),L=M(()=>Q&&(h.value.length>0||c.value.length>0)),w=M(()=>p.value.length>0),x=M(()=>p.value[E.value]||null),_=()=>{const{isQuery:e,index:s}=u;s===0?(u.isQuery=!e,u.index=e?c.value.length-1:h.value.length-1):u.index=s-1},Y=()=>{const{isQuery:e,index:s}=u;s===(e?h.value.length-1:c.value.length-1)?(u.isQuery=!e,u.index=0):u.index=s+1},z=()=>{E.value=E.value>0?E.value-1:p.value.length-1,v.value=x.value.contents.length-1},G=()=>{E.value=E.value<p.value.length-1?E.value+1:0,v.value=0},K=()=>{v.value<x.value.contents.length-1?v.value+=1:G()},N=()=>{v.value>0?v.value-=1:z()},V=e=>e.map(s=>Ce(s)?s:t(s[0],s[1])),W=e=>{if(e.type==="customField"){const s=me[e.index]||"$content",[o,q=""]=Ae(s)?s[R.value].split("$content"):s.split("$content");return e.display.map(n=>t("div",V([o,...n,q])))}return e.display.map(s=>t("div",V(s)))},f=()=>{E.value=0,v.value=0,l("updateQuery",""),l("close")},X=()=>C?t("ul",{class:"search-pro-result-list"},t("li",{class:"search-pro-result-list-item"},[t("div",{class:"search-pro-result-title"},i.value.queryHistory),h.value.map((e,s)=>t("div",{class:["search-pro-result-item",{active:u.isQuery&&u.index===s}],onClick:()=>{l("updateQuery",e)}},[t(j,{class:"search-pro-result-type"}),t("div",{class:"search-pro-result-content"},e),t("button",{class:"search-pro-remove-icon",innerHTML:O,onClick:o=>{o.preventDefault(),o.stopPropagation(),k(s)}})]))])):null,Z=()=>A?t("ul",{class:"search-pro-result-list"},t("li",{class:"search-pro-result-list-item"},[t("div",{class:"search-pro-result-title"},i.value.resultHistory),c.value.map((e,s)=>t(P,{to:e.link,class:["search-pro-result-item",{active:!u.isQuery&&u.index===s}],onClick:()=>{f()}},()=>[t(j,{class:"search-pro-result-type"}),t("div",{class:"search-pro-result-content"},[e.header?t("div",{class:"content-header"},e.header):null,t("div",e.display.map(o=>V(o)).flat())]),t("button",{class:"search-pro-remove-icon",innerHTML:O,onClick:o=>{o.preventDefault(),o.stopPropagation(),F(s)}})]))])):null;return ie("keydown",e=>{if(a.isFocusing){if(w.value){if(e.key==="ArrowUp")N();else if(e.key==="ArrowDown")K();else if(e.key==="Enter"){const s=x.value.contents[v.value];d(a.queries.join(" ")),g(s),r.push(J(s)),f()}}else if(A){if(e.key==="ArrowUp")_();else if(e.key==="ArrowDown")Y();else if(e.key==="Enter"){const{index:s}=u;u.isQuery?(l("updateQuery",h.value[s]),e.preventDefault()):(r.push(c.value[s].link),f())}}}}),U([E,v],()=>{var e;(e=document.querySelector(".search-pro-result-list-item.active .search-pro-result-item.active"))==null||e.scrollIntoView(!1)},{flush:"post"}),()=>t("div",{class:["search-pro-result-wrapper",{empty:a.queries.length?!w.value:!L.value}],id:"search-pro-results"},a.queries.length?y.value?t(oe,{hint:i.value.searching}):w.value?t("ul",{class:"search-pro-result-list"},p.value.map(({title:e,contents:s},o)=>{const q=E.value===o;return t("li",{class:["search-pro-result-list-item",{active:q}]},[t("div",{class:"search-pro-result-title"},e||i.value.defaultTitle),s.map((n,ee)=>{const b=q&&v.value===ee;return t(P,{to:J(n),class:["search-pro-result-item",{active:b,"aria-selected":b}],onClick:()=>{d(a.queries.join(" ")),g(n),f()}},()=>[n.type==="text"?null:t(n.type==="title"?ne:n.type==="heading"?ce:Ee,{class:"search-pro-result-type"}),t("div",{class:"search-pro-result-content"},[n.type==="text"&&n.header?t("div",{class:"content-header"},n.header):null,t("div",W(n))])])})])})):i.value.emptyResult:Q?L.value?[X(),Z()]:i.value.emptyHistory:i.value.emptyResult)}});export{Qe as default};
