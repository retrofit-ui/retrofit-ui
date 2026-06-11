var Rs=Object.defineProperty;var Ts=(t,e,r)=>e in t?Rs(t,e,{enumerable:!0,configurable:!0,writable:!0,value:r}):t[e]=r;var Z=(t,e,r)=>Ts(t,typeof e!="symbol"?e+"":e,r);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function r(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(i){if(i.ep)return;i.ep=!0;const s=r(i);fetch(i.href,s)}})();const Ps=!1,Os=(t,e)=>t===e,qr=Symbol("solid-proxy"),Ls=typeof Proxy=="function",Bs=Symbol("solid-track"),nr={equals:Os};let Is=Pi;const Wt=1,ir=2,Ei={owned:null,cleanups:null,context:null,owner:null},Rr={};var V=null;let Tr=null,Ds=null,U=null,ct=null,Jt=null,mr=0;function Ee(t,e){const r=U,n=V,i=t.length===0,s=e===void 0?n:e,o=i?Ei:{owned:null,cleanups:null,context:s?s.context:null,owner:s},l=i?t:()=>t(()=>wt(()=>Oe(o)));V=o,U=null;try{return Pt(l,!0)}finally{U=r,V=n}}function et(t,e){e=e?Object.assign({},nr,e):nr;const r={value:t,observers:null,observerSlots:null,comparator:e.equals||void 0},n=i=>(typeof i=="function"&&(i=i(r.value)),Ri(r,i));return[zi.bind(r),n]}function Vs(t,e,r){const n=pn(t,e,!0,Wt);Me(n)}function G(t,e,r){const n=pn(t,e,!1,Wt);Me(n)}function nt(t,e,r){r=r?Object.assign({},nr,r):nr;const n=pn(t,e,!0,0);return n.observers=null,n.observerSlots=null,n.comparator=r.equals||void 0,Me(n),zi.bind(n)}function Ms(t){return t&&typeof t=="object"&&"then"in t}function ln(t,e,r){let n,i,s;typeof e=="function"?(n=t,i=e,s={}):(n=!0,i=t,s=e||{});let o=null,l=Rr,a=!1,c="initialValue"in s,u=typeof n=="function"&&nt(n);const h=new Set,[p,g]=(s.storage||et)(s.initialValue),[f,v]=et(void 0),[y,k]=et(void 0,{equals:!1}),[x,w]=et(c?"ready":"unresolved");function b(C,L,K,M){return o===C&&(o=null,M!==void 0&&(c=!0),(C===l||L===l)&&s.onHydrated&&queueMicrotask(()=>s.onHydrated(M,{value:L})),l=Rr,S(L,K)),L}function S(C,L){Pt(()=>{L===void 0&&g(()=>C),w(L!==void 0?"errored":c?"ready":"unresolved"),v(L);for(const K of h.keys())K.decrement();h.clear()},!1)}function T(){const C=Hs,L=p(),K=f();if(K!==void 0&&!o)throw K;return U&&U.user,L}function W(C=!0){if(C!==!1&&a)return;a=!1;const L=u?u():n;if(L==null||L===!1){b(o,wt(p));return}let K;const M=l!==Rr?l:wt(()=>{try{return i(L,{value:p(),refetching:C})}catch(rt){K=rt}});if(K!==void 0){b(o,void 0,Qe(K),L);return}else if(!Ms(M))return b(o,M,void 0,L),M;return o=M,"v"in M?(M.s===1?b(o,M.v,void 0,L):b(o,void 0,Qe(M.v),L),M):(a=!0,queueMicrotask(()=>a=!1),Pt(()=>{w(c?"refreshing":"pending"),k()},!1),M.then(rt=>b(M,rt,void 0,L),rt=>b(M,void 0,Qe(rt),L)))}Object.defineProperties(T,{state:{get:()=>x()},error:{get:()=>f()},loading:{get(){const C=x();return C==="pending"||C==="refreshing"}},latest:{get(){if(!c)return T();const C=f();if(C&&!o)throw C;return p()}}});let it=V;return u?Vs(()=>(it=V,W(!1))):W(!1),[T,{refetch:C=>un(it,()=>W(C)),mutate:g}]}function Fs(t){return Pt(t,!1)}function wt(t){if(U===null)return t();const e=U;U=null;try{return t()}finally{U=e}}function an(t,e,r){const n=Array.isArray(t);let i,s=r&&r.defer;return o=>{let l;if(n){l=Array(t.length);for(let c=0;c<t.length;c++)l[c]=t[c]()}else l=t();if(s)return s=!1,o;const a=wt(()=>e(l,i,o));return i=l,a}}function cn(t){return V===null||(V.cleanups===null?V.cleanups=[t]:V.cleanups.push(t)),t}function tt(){return V}function un(t,e){const r=V,n=U;V=t,U=null;try{return Pt(e,!0)}catch(i){fn(i)}finally{V=r,U=n}}function Ns(t){const e=U,r=V;return Promise.resolve().then(()=>{U=e,V=r;let n;return Pt(t,!1),U=V=null,n?n.done:void 0})}const[yu,wu]=et(!1);function hn(t,e){const r=Symbol("context");return{id:r,Provider:qs(r),defaultValue:t}}function Ve(t){let e;return V&&V.context&&(e=V.context[t.id])!==void 0?e:t.defaultValue}function dn(t){const e=nt(t),r=nt(()=>Wr(e()));return r.toArray=()=>{const n=r();return Array.isArray(n)?n:n!=null?[n]:[]},r}let Hs;function zi(){if(this.sources&&this.state)if(this.state===Wt)Me(this);else{const t=ct;ct=null,Pt(()=>sr(this),!1),ct=t}if(U){const t=this.observers;if(!t||t[t.length-1]!==U){const e=t?t.length:0;U.sources?(U.sources.push(this),U.sourceSlots.push(e)):(U.sources=[this],U.sourceSlots=[e]),t?(t.push(U),this.observerSlots.push(U.sources.length-1)):(this.observers=[U],this.observerSlots=[U.sources.length-1])}}return this.value}function Ri(t,e,r){let n=t.value;return(!t.comparator||!t.comparator(n,e))&&(t.value=e,t.observers&&t.observers.length&&Pt(()=>{for(let i=0;i<t.observers.length;i+=1){const s=t.observers[i],o=Tr&&Tr.running;o&&Tr.disposed.has(s),(o?!s.tState:!s.state)&&(s.pure?ct.push(s):Jt.push(s),s.observers&&Oi(s)),o||(s.state=Wt)}if(ct.length>1e6)throw ct=[],new Error},!1)),e}function Me(t){if(!t.fn)return;Oe(t);const e=mr;Us(t,t.value,e)}function Us(t,e,r){let n;const i=V,s=U;U=V=t;try{n=t.fn(e)}catch(o){return t.pure&&(t.state=Wt,t.owned&&t.owned.forEach(Oe),t.owned=null),t.updatedAt=r+1,fn(o)}finally{U=s,V=i}(!t.updatedAt||t.updatedAt<=r)&&(t.updatedAt!=null&&"observers"in t?Ri(t,n):t.value=n,t.updatedAt=r)}function pn(t,e,r,n=Wt,i){const s={fn:t,state:n,updatedAt:null,owned:null,sources:null,sourceSlots:null,cleanups:null,value:e,owner:V,context:V?V.context:null,pure:r};return V===null||V!==Ei&&(V.owned?V.owned.push(s):V.owned=[s]),s}function Ti(t){if(t.state===0)return;if(t.state===ir)return sr(t);if(t.suspense&&wt(t.suspense.inFallback))return t.suspense.effects.push(t);const e=[t];for(;(t=t.owner)&&(!t.updatedAt||t.updatedAt<mr);)t.state&&e.push(t);for(let r=e.length-1;r>=0;r--)if(t=e[r],t.state===Wt)Me(t);else if(t.state===ir){const n=ct;ct=null,Pt(()=>sr(t,e[0]),!1),ct=n}}function Pt(t,e){if(ct)return t();let r=!1;e||(ct=[]),Jt?r=!0:Jt=[],mr++;try{const n=t();return js(r),n}catch(n){r||(Jt=null),ct=null,fn(n)}}function js(t){if(ct&&(Pi(ct),ct=null),t)return;const e=Jt;Jt=null,e.length&&Pt(()=>Is(e),!1)}function Pi(t){for(let e=0;e<t.length;e++)Ti(t[e])}function sr(t,e){t.state=0;for(let r=0;r<t.sources.length;r+=1){const n=t.sources[r];if(n.sources){const i=n.state;i===Wt?n!==e&&(!n.updatedAt||n.updatedAt<mr)&&Ti(n):i===ir&&sr(n,e)}}}function Oi(t){for(let e=0;e<t.observers.length;e+=1){const r=t.observers[e];r.state||(r.state=ir,r.pure?ct.push(r):Jt.push(r),r.observers&&Oi(r))}}function Oe(t){let e;if(t.sources)for(;t.sources.length;){const r=t.sources.pop(),n=t.sourceSlots.pop(),i=r.observers;if(i&&i.length){const s=i.pop(),o=r.observerSlots.pop();n<i.length&&(s.sourceSlots[o]=n,i[n]=s,r.observerSlots[n]=o)}}if(t.tOwned){for(e=t.tOwned.length-1;e>=0;e--)Oe(t.tOwned[e]);delete t.tOwned}if(t.owned){for(e=t.owned.length-1;e>=0;e--)Oe(t.owned[e]);t.owned=null}if(t.cleanups){for(e=t.cleanups.length-1;e>=0;e--)t.cleanups[e]();t.cleanups=null}t.state=0}function Qe(t){return t instanceof Error?t:new Error(typeof t=="string"?t:"Unknown error",{cause:t})}function fn(t,e=V){throw Qe(t)}function Wr(t){if(typeof t=="function"&&!t.length)return Wr(t());if(Array.isArray(t)){const e=[];for(let r=0;r<t.length;r++){const n=Wr(t[r]);if(Array.isArray(n))if(n.length<32768)e.push.apply(e,n);else for(let i=0;i<n.length;i++)e.push(n[i]);else e.push(n)}return e}return t}function qs(t,e){return function(n){let i;return G(()=>i=wt(()=>(V.context={...V.context,[t]:n.value},dn(()=>n.children))),void 0),i}}const Ws=Symbol("fallback");function Fn(t){for(let e=0;e<t.length;e++)t[e]()}function Ks(t,e,r={}){let n=[],i=[],s=[],o=0,l=e.length>1?[]:null;return cn(()=>Fn(s)),()=>{let a=t()||[],c=a.length,u,h;return a[Bs],wt(()=>{let g,f,v,y,k,x,w,b,S;if(c===0)o!==0&&(Fn(s),s=[],n=[],i=[],o=0,l&&(l=[])),r.fallback&&(n=[Ws],i[0]=Ee(T=>(s[0]=T,r.fallback())),o=1);else if(o===0){for(i=new Array(c),h=0;h<c;h++)n[h]=a[h],i[h]=Ee(p);o=c}else{for(v=new Array(c),y=new Array(c),l&&(k=new Array(c)),x=0,w=Math.min(o,c);x<w&&n[x]===a[x];x++);for(w=o-1,b=c-1;w>=x&&b>=x&&n[w]===a[b];w--,b--)v[b]=i[w],y[b]=s[w],l&&(k[b]=l[w]);for(g=new Map,f=new Array(b+1),h=b;h>=x;h--)S=a[h],u=g.get(S),f[h]=u===void 0?-1:u,g.set(S,h);for(u=x;u<=w;u++)S=n[u],h=g.get(S),h!==void 0&&h!==-1?(v[h]=i[u],y[h]=s[u],l&&(k[h]=l[u]),h=f[h],g.set(S,h)):s[u]();for(h=x;h<c;h++)h in v?(i[h]=v[h],s[h]=y[h],l&&(l[h]=k[h],l[h](h))):i[h]=Ee(p);i=i.slice(0,o=c),n=a.slice(0)}return i});function p(g){if(s[h]=g,l){const[f,v]=et(h);return l[h]=v,e(a[h],f)}return e(a[h])}}}function A(t,e){return wt(()=>t(e||{}))}function qe(){return!0}const Zs={get(t,e,r){return e===qr?r:t.get(e)},has(t,e){return e===qr?!0:t.has(e)},set:qe,deleteProperty:qe,getOwnPropertyDescriptor(t,e){return{configurable:!0,enumerable:!0,get(){return t.get(e)},set:qe,deleteProperty:qe}},ownKeys(t){return t.keys()}};function Pr(t){return(t=typeof t=="function"?t():t)?t:{}}function Xs(){for(let t=0,e=this.length;t<e;++t){const r=this[t]();if(r!==void 0)return r}}function Ys(...t){let e=!1;for(let o=0;o<t.length;o++){const l=t[o];e=e||!!l&&qr in l,t[o]=typeof l=="function"?(e=!0,nt(l)):l}if(Ls&&e)return new Proxy({get(o){for(let l=t.length-1;l>=0;l--){const a=Pr(t[l])[o];if(a!==void 0)return a}},has(o){for(let l=t.length-1;l>=0;l--)if(o in Pr(t[l]))return!0;return!1},keys(){const o=[];for(let l=0;l<t.length;l++)o.push(...Object.keys(Pr(t[l])));return[...new Set(o)]}},Zs);const r={},n=Object.create(null);for(let o=t.length-1;o>=0;o--){const l=t[o];if(!l)continue;const a=Object.getOwnPropertyNames(l);for(let c=a.length-1;c>=0;c--){const u=a[c];if(u==="__proto__"||u==="constructor")continue;const h=Object.getOwnPropertyDescriptor(l,u);if(!n[u])n[u]=h.get?{enumerable:!0,configurable:!0,get:Xs.bind(r[u]=[h.get.bind(l)])}:h.value!==void 0?h:void 0;else{const p=r[u];p&&(h.get?p.push(h.get.bind(l)):h.value!==void 0&&p.push(()=>h.value))}}}const i={},s=Object.keys(n);for(let o=s.length-1;o>=0;o--){const l=s[o],a=n[l];a&&a.get?Object.defineProperty(i,l,a):i[l]=a?a.value:void 0}return i}const Qs=t=>`Stale read from <${t}>.`;function Ht(t){const e="fallback"in t&&{fallback:()=>t.fallback};return nt(Ks(()=>t.each,t.children,e||void 0))}function H(t){const e=t.keyed,r=nt(()=>t.when,void 0,void 0),n=e?r:nt(r,void 0,{equals:(i,s)=>!i==!s});return nt(()=>{const i=n();if(i){const s=t.children;return typeof s=="function"&&s.length>0?wt(()=>s(e?i:()=>{if(!wt(n))throw Qs("Show");return r()})):s}return t.fallback},void 0,void 0)}const Ft=t=>nt(()=>t());function Gs(t,e,r){let n=r.length,i=e.length,s=n,o=0,l=0,a=e[i-1].nextSibling,c=null;for(;o<i||l<s;){if(e[o]===r[l]){o++,l++;continue}for(;e[i-1]===r[s-1];)i--,s--;if(i===o){const u=s<n?l?r[l-1].nextSibling:r[s-l]:a;for(;l<s;)t.insertBefore(r[l++],u)}else if(s===l)for(;o<i;)(!c||!c.has(e[o]))&&e[o].remove(),o++;else if(e[o]===r[s-1]&&r[l]===e[i-1]){const u=e[--i].nextSibling;t.insertBefore(r[l++],e[o++].nextSibling),t.insertBefore(r[--s],u),e[i]=r[s]}else{if(!c){c=new Map;let h=l;for(;h<s;)c.set(r[h],h++)}const u=c.get(e[o]);if(u!=null)if(l<u&&u<s){let h=o,p=1,g;for(;++h<i&&h<s&&!((g=c.get(e[h]))==null||g!==u+p);)p++;if(p>u-l){const f=e[o];for(;l<u;)t.insertBefore(r[l++],f)}else t.replaceChild(r[l++],e[o++])}else o++;else e[o++].remove()}}}const Nn="_$DX_DELEGATE";function Js(t,e,r,n={}){let i;return Ee(s=>{i=s,e===document?t():E(e,t(),e.firstChild?null:void 0,r)},n.owner),()=>{i(),e.textContent=""}}function O(t,e,r,n){let i;const s=()=>{const l=n?document.createElementNS("http://www.w3.org/1998/Math/MathML","template"):document.createElement("template");return l.innerHTML=t,r?l.content.firstChild.firstChild:n?l.firstChild:l.content.firstChild},o=e?()=>wt(()=>document.importNode(i||(i=s()),!0)):()=>(i||(i=s())).cloneNode(!0);return o.cloneNode=o,o}function br(t,e=window.document){const r=e[Nn]||(e[Nn]=new Set);for(let n=0,i=t.length;n<i;n++){const s=t[n];r.has(s)||(r.add(s),e.addEventListener(s,eo))}}function to(t,e){e==null?t.removeAttribute("class"):t.className=e}function lt(t,e,r,n){if(n)Array.isArray(r)?(t[`$$${e}`]=r[0],t[`$$${e}Data`]=r[1]):t[`$$${e}`]=r;else if(Array.isArray(r)){const i=r[0];t.addEventListener(e,r[0]=s=>i.call(t,r[1],s))}else t.addEventListener(e,r,typeof r!="function"&&r)}function Li(t,e,r){r!=null?t.style.setProperty(e,r):t.style.removeProperty(e)}function E(t,e,r,n){if(r!==void 0&&!n&&(n=[]),typeof e!="function")return or(t,e,n,r);G(i=>or(t,e(),i,r),n)}function eo(t){let e=t.target;const r=`$$${t.type}`,n=t.target,i=t.currentTarget,s=a=>Object.defineProperty(t,"target",{configurable:!0,value:a}),o=()=>{const a=e[r];if(a&&!e.disabled){const c=e[`${r}Data`];if(c!==void 0?a.call(e,c,t):a.call(e,t),t.cancelBubble)return}return e.host&&typeof e.host!="string"&&!e.host._$host&&e.contains(t.target)&&s(e.host),!0},l=()=>{for(;o()&&(e=e._$host||e.parentNode||e.host););};if(Object.defineProperty(t,"currentTarget",{configurable:!0,get(){return e||document}}),t.composedPath){const a=t.composedPath();s(a[0]);for(let c=0;c<a.length-2&&(e=a[c],!!o());c++){if(e._$host){e=e._$host,l();break}if(e.parentNode===i)break}}else l();s(n)}function or(t,e,r,n,i){for(;typeof r=="function";)r=r();if(e===r)return r;const s=typeof e,o=n!==void 0;if(t=o&&r[0]&&r[0].parentNode||t,s==="string"||s==="number"){if(s==="number"&&(e=e.toString(),e===r))return r;if(o){let l=r[0];l&&l.nodeType===3?l.data!==e&&(l.data=e):l=document.createTextNode(e),r=ae(t,r,n,l)}else r!==""&&typeof r=="string"?r=t.firstChild.data=e:r=t.textContent=e}else if(e==null||s==="boolean")r=ae(t,r,n);else{if(s==="function")return G(()=>{let l=e();for(;typeof l=="function";)l=l();r=or(t,l,r,n)}),()=>r;if(Array.isArray(e)){const l=[],a=r&&Array.isArray(r);if(Kr(l,e,r,i))return G(()=>r=or(t,l,r,n,!0)),()=>r;if(l.length===0){if(r=ae(t,r,n),o)return r}else a?r.length===0?Hn(t,l,n):Gs(t,r,l):(r&&ae(t),Hn(t,l));r=l}else if(e.nodeType){if(Array.isArray(r)){if(o)return r=ae(t,r,n,e);ae(t,r,null,e)}else r==null||r===""||!t.firstChild?t.appendChild(e):t.replaceChild(e,t.firstChild);r=e}}return r}function Kr(t,e,r,n){let i=!1;for(let s=0,o=e.length;s<o;s++){let l=e[s],a=r&&r[t.length],c;if(!(l==null||l===!0||l===!1))if((c=typeof l)=="object"&&l.nodeType)t.push(l);else if(Array.isArray(l))i=Kr(t,l,a)||i;else if(c==="function")if(n){for(;typeof l=="function";)l=l();i=Kr(t,Array.isArray(l)?l:[l],Array.isArray(a)?a:[a])||i}else t.push(l),i=!0;else{const u=String(l);a&&a.nodeType===3&&a.data===u?t.push(a):t.push(document.createTextNode(u))}}return i}function Hn(t,e,r=null){for(let n=0,i=e.length;n<i;n++)t.insertBefore(e[n],r)}function ae(t,e,r,n){if(r===void 0)return t.textContent="";const i=n||document.createTextNode("");if(e.length){let s=!1;for(let o=e.length-1;o>=0;o--){const l=e[o];if(i!==l){const a=l.parentNode===t;!s&&!o?a?t.replaceChild(i,l):t.insertBefore(i,r):a&&l.remove()}else s=!0}}else t.insertBefore(i,r);return[i]}const ro=!1;var Zr="";function Xr(t){Zr=t}function no(t=""){if(!Zr){const e=[...document.getElementsByTagName("script")],r=e.find(n=>n.hasAttribute("data-shoelace"));if(r)Xr(r.getAttribute("data-shoelace"));else{const n=e.find(s=>/shoelace(\.min)?\.js($|\?)/.test(s.src)||/shoelace-autoloader(\.min)?\.js($|\?)/.test(s.src));let i="";n&&(i=n.getAttribute("src")),Xr(i.split("/").slice(0,-1).join("/"))}}return Zr.replace(/\/$/,"")+(t?`/${t.replace(/^\//,"")}`:"")}var Bi=Object.defineProperty,io=Object.defineProperties,so=Object.getOwnPropertyDescriptor,oo=Object.getOwnPropertyDescriptors,Un=Object.getOwnPropertySymbols,lo=Object.prototype.hasOwnProperty,ao=Object.prototype.propertyIsEnumerable,Ii=t=>{throw TypeError(t)},jn=(t,e,r)=>e in t?Bi(t,e,{enumerable:!0,configurable:!0,writable:!0,value:r}):t[e]=r,ie=(t,e)=>{for(var r in e||(e={}))lo.call(e,r)&&jn(t,r,e[r]);if(Un)for(var r of Un(e))ao.call(e,r)&&jn(t,r,e[r]);return t},vr=(t,e)=>io(t,oo(e)),d=(t,e,r,n)=>{for(var i=n>1?void 0:n?so(e,r):e,s=t.length-1,o;s>=0;s--)(o=t[s])&&(i=(n?o(e,r,i):o(i))||i);return n&&i&&Bi(e,r,i),i},Di=(t,e,r)=>e.has(t)||Ii("Cannot "+r),co=(t,e,r)=>(Di(t,e,"read from private field"),e.get(t)),uo=(t,e,r)=>e.has(t)?Ii("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(t):e.set(t,r),ho=(t,e,r,n)=>(Di(t,e,"write to private field"),e.set(t,r),r);function Vi(){let t=new Set;function e(i){return t.add(i),()=>t.delete(i)}let r=!1;function n(i,s){if(r)return!(r=!1);const o={to:i,options:s,defaultPrevented:!1,preventDefault:()=>o.defaultPrevented=!0};for(const l of t)l.listener({...o,from:l.location,retry:a=>{a&&(r=!0),l.navigate(i,{...s,resolve:!1})}});return!o.defaultPrevented}return{subscribe:e,confirm:n}}let Yr;function gn(){(!window.history.state||window.history.state._depth==null)&&window.history.replaceState({...window.history.state,_depth:window.history.length-1},""),Yr=window.history.state._depth}gn();function po(t){return{...t,_depth:window.history.state&&window.history.state._depth}}function fo(t,e){let r=!1;return()=>{const n=Yr;gn();const i=n==null?null:Yr-n;if(r){r=!1;return}i&&e(i)?(r=!0,window.history.go(-i)):t()}}const go=/^(?:[a-z0-9]+:)?\/\//i,mo=/^\/+|(\/)\/+$/g,Mi="http://sr";function ze(t,e=!1){const r=t.replace(mo,"$1");return r?e||/^[?#]/.test(r)?r:"/"+r:""}function Ge(t,e,r){if(go.test(e))return;const n=ze(t),i=r&&ze(r);let s="";return!i||e.startsWith("/")?s=n:i.toLowerCase().indexOf(n.toLowerCase())!==0?s=n+i:s=i,(s||"/")+ze(e,!s)}function bo(t,e){if(t==null)throw new Error(e);return t}function vo(t,e){return ze(t).replace(/\/*(\*.*)?$/g,"")+ze(e)}function Fi(t){const e={};return t.searchParams.forEach((r,n)=>{n in e?Array.isArray(e[n])?e[n].push(r):e[n]=[e[n],r]:e[n]=r}),e}function yo(t,e,r){const[n,i]=t.split("/*",2),s=n.split("/").filter(Boolean),o=s.length;return l=>{const a=l.split("/").filter(Boolean),c=a.length-o;if(c<0||c>0&&i===void 0&&!e)return null;const u={path:o?"":"/",params:{}},h=p=>r===void 0?void 0:r[p];for(let p=0;p<o;p++){const g=s[p],f=g[0]===":",v=f?a[p]:a[p].toLowerCase(),y=f?g.slice(1):g.toLowerCase();if(f&&Or(v,h(y)))u.params[y]=v;else if(f||!Or(v,y))return null;u.path+=`/${v}`}if(i){const p=c?a.slice(-c).join("/"):"";if(Or(p,h(i)))u.params[i]=p;else return null}return u}}function Or(t,e){const r=n=>n===t;return e===void 0?!0:typeof e=="string"?r(e):typeof e=="function"?e(t):Array.isArray(e)?e.some(r):e instanceof RegExp?e.test(t):!1}function wo(t){const[e,r]=t.pattern.split("/*",2),n=e.split("/").filter(Boolean);return n.reduce((i,s)=>i+(s.startsWith(":")?2:3),n.length-(r===void 0?0:1))}function Ni(t){const e=new Map,r=tt();return new Proxy({},{get(n,i){return e.has(i)||un(r,()=>e.set(i,nt(()=>t()[i]))),e.get(i)()},getOwnPropertyDescriptor(){return{enumerable:!0,configurable:!0}},ownKeys(){return Reflect.ownKeys(t())},has(n,i){return i in t()}})}function Hi(t){let e=/(\/?\:[^\/]+)\?/.exec(t);if(!e)return[t];let r=t.slice(0,e.index),n=t.slice(e.index+e[0].length);const i=[r,r+=e[1]];for(;e=/^(\/\:[^\/]+)\?/.exec(n);)i.push(r+=e[1]),n=n.slice(e[0].length);return Hi(n).reduce((s,o)=>[...s,...i.map(l=>l+o)],[])}const xo=100,Ui=hn(),ji=hn(),qi=()=>bo(Ve(Ui),"<A> and 'use' router primitives can be only used inside a Route."),yr=()=>qi().navigatorFactory(),mn=()=>qi().params;function ko(t,e=""){const{component:r,preload:n,load:i,children:s,info:o}=t,l=!s||Array.isArray(s)&&!s.length,a={key:t,component:r,preload:n||i,info:o};return Wi(t.path).reduce((c,u)=>{for(const h of Hi(u)){const p=vo(e,h);let g=l?p:p.split("/*",1)[0];g=g.split("/").map(f=>f.startsWith(":")||f.startsWith("*")?f:encodeURIComponent(f)).join("/"),c.push({...a,originalPath:u,pattern:g,matcher:yo(g,!l,t.matchFilters)})}return c},[])}function _o(t,e=0){return{routes:t,score:wo(t[t.length-1])*1e4-e,matcher(r){const n=[];for(let i=t.length-1;i>=0;i--){const s=t[i],o=s.matcher(r);if(!o)return null;n.unshift({...o,route:s})}return n}}}function Wi(t){return Array.isArray(t)?t:[t]}function Ki(t,e="",r=[],n=[]){const i=Wi(t);for(let s=0,o=i.length;s<o;s++){const l=i[s];if(l&&typeof l=="object"){l.hasOwnProperty("path")||(l.path="");const a=ko(l,e);for(const c of a){r.push(c);const u=Array.isArray(l.children)&&l.children.length===0;if(l.children&&!u)Ki(l.children,c.pattern,r,n);else{const h=_o([...r],n.length);n.push(h)}r.pop()}}}return r.length?n:n.sort((s,o)=>o.score-s.score)}function Lr(t,e){for(let r=0,n=t.length;r<n;r++){const i=t[r].matcher(e);if(i)return i}return[]}function $o(t,e,r){const n=new URL(Mi),i=nt(u=>{const h=t();try{return new URL(h,n)}catch{return console.error(`Invalid path ${h}`),u}},n,{equals:(u,h)=>u.href===h.href}),s=nt(()=>i().pathname),o=nt(()=>i().search,!0),l=nt(()=>i().hash),a=()=>"",c=an(o,()=>Fi(i()));return{get pathname(){return s()},get search(){return o()},get hash(){return l()},get state(){return e()},get key(){return a()},query:r?r(c):Ni(c)}}let Xt;function Co(){return Xt}function So(t,e,r,n={}){const{signal:[i,s],utils:o={}}=t,l=o.parsePath||(z=>z),a=o.renderPath||(z=>z),c=o.beforeLeave||Vi(),u=Ge("",n.base||"");if(u===void 0)throw new Error(`${u} is not a valid base path`);u&&!i().value&&s({value:u,replace:!0,scroll:!1});const[h,p]=et(!1);let g;const f=(z,_)=>{_.value===v()&&_.state===k()||(g===void 0&&p(!0),Xt=z,g=_,Ns(()=>{g===_&&(y(g.value),x(g.state),S[1]($=>$.filter(R=>R.pending)))}).finally(()=>{g===_&&Fs(()=>{Xt=void 0,z==="navigate"&&M(g),p(!1),g=void 0})}))},[v,y]=et(i().value),[k,x]=et(i().state),w=$o(v,k,o.queryWrapper),b=[],S=et([]),T=nt(()=>typeof n.transformUrl=="function"?Lr(e(),n.transformUrl(w.pathname)):Lr(e(),w.pathname)),W=()=>{const z=T(),_={};for(let $=0;$<z.length;$++)Object.assign(_,z[$].params);return _},it=o.paramsWrapper?o.paramsWrapper(W,e):Ni(W),C={pattern:u,path:()=>u,outlet:()=>null,resolvePath(z){return Ge(u,z)}};return G(an(i,z=>f("native",z),{defer:!0})),{base:C,location:w,params:it,isRouting:h,renderPath:a,parsePath:l,navigatorFactory:K,matches:T,beforeLeave:c,preloadRoute:rt,singleFlight:n.singleFlight===void 0?!0:n.singleFlight,submissions:S};function L(z,_,$){wt(()=>{if(typeof _=="number"){_&&(o.go?o.go(_):console.warn("Router integration does not support relative routing"));return}const R=!_||_[0]==="?",{replace:F,resolve:X,scroll:dt,state:pt}={replace:!1,resolve:!R,scroll:!0,...$},bt=X?z.resolvePath(_):Ge(R&&w.pathname||"",_);if(bt===void 0)throw new Error(`Path '${_}' is not a routable path`);if(b.length>=xo)throw new Error("Too many redirects");const It=v();(bt!==It||pt!==k())&&(ro||c.confirm(bt,$)&&(b.push({value:It,replace:F,scroll:dt,state:k()}),f("navigate",{value:bt,state:pt})))})}function K(z){return z=z||Ve(ji)||C,(_,$)=>L(z,_,$)}function M(z){const _=b[0];_&&(s({...z,replace:_.replace,scroll:_.scroll}),b.length=0)}function rt(z,_){const $=Lr(e(),z.pathname),R=Xt;Xt="preload";for(let F in $){const{route:X,params:dt}=$[F];X.component&&X.component.preload&&X.component.preload();const{preload:pt}=X;_&&pt&&un(r(),()=>pt({params:dt,location:{pathname:z.pathname,search:z.search,hash:z.hash,query:Fi(z),state:null,key:""},intent:"preload"}))}Xt=R}}function Ao(t,e,r,n){const{base:i,location:s,params:o}=t,{pattern:l,component:a,preload:c}=n().route,u=nt(()=>n().path);a&&a.preload&&a.preload();const h=c?c({params:o,location:s,intent:Xt||"initial"}):void 0;return{parent:e,pattern:l,path:u,outlet:()=>a?A(a,{params:o,location:s,data:h,get children(){return r()}}):r(),resolvePath(g){return Ge(i.path(),g,u())}}}const Eo=t=>e=>{const{base:r}=e,n=dn(()=>e.children),i=nt(()=>Ki(n(),e.base||""));let s;const o=So(t,i,()=>s,{base:r,singleFlight:e.singleFlight,transformUrl:e.transformUrl});return t.create&&t.create(o),A(Ui.Provider,{value:o,get children(){return A(zo,{routerState:o,get root(){return e.root},get preload(){return e.rootPreload||e.rootLoad},get children(){return[Ft(()=>(s=tt())&&null),A(Ro,{routerState:o,get branches(){return i()}})]}})}})};function zo(t){const e=t.routerState.location,r=t.routerState.params,n=nt(()=>t.preload&&wt(()=>{t.preload({params:r,location:e,intent:Co()||"initial"})}));return A(H,{get when(){return t.root},keyed:!0,get fallback(){return t.children},children:i=>A(i,{params:r,location:e,get data(){return n()},get children(){return t.children}})})}function Ro(t){const e=[];let r;const n=nt(an(t.routerState.matches,(i,s,o)=>{let l=s&&i.length===s.length;const a=[];for(let c=0,u=i.length;c<u;c++){const h=s&&s[c],p=i[c];o&&h&&p.route.key===h.route.key?a[c]=o[c]:(l=!1,e[c]&&e[c](),Ee(g=>{e[c]=g,a[c]=Ao(t.routerState,a[c-1]||t.routerState.base,qn(()=>n()[c+1]),()=>{const f=t.routerState.matches();return f[c]??f[0]})}))}return e.splice(i.length).forEach(c=>c()),o&&l?o:(r=a[0],a)}));return qn(()=>n()&&r)()}const qn=t=>()=>A(H,{get when(){return t()},keyed:!0,children:e=>A(ji.Provider,{value:e,get children(){return e.outlet()}})}),we=t=>{const e=dn(()=>t.children);return Ys(t,{get children(){return e()}})};function To([t,e],r,n){return[t,n?i=>e(n(i)):e]}function Po(t){let e=!1;const r=i=>typeof i=="string"?{value:i}:i,n=To(et(r(t.get()),{equals:(i,s)=>i.value===s.value&&i.state===s.state}),void 0,i=>(!e&&t.set(i),i));return t.init&&cn(t.init((i=t.get())=>{e=!0,n[1](r(i)),e=!1})),Eo({signal:n,create:t.create,utils:t.utils})}function Oo(t,e,r){return t.addEventListener(e,r),()=>t.removeEventListener(e,r)}function Lo(t,e){const r=t&&document.getElementById(t);r?r.scrollIntoView():e&&window.scrollTo(0,0)}const Bo=new Map;function Io(t=!0,e=!1,r="/_server",n){return i=>{const s=i.base.path(),o=i.navigatorFactory(i.base);let l,a;function c(v){return v.namespaceURI==="http://www.w3.org/2000/svg"}function u(v){if(v.defaultPrevented||v.button!==0||v.metaKey||v.altKey||v.ctrlKey||v.shiftKey)return;const y=v.composedPath().find(T=>T instanceof Node&&T.nodeName.toUpperCase()==="A");if(!y||e&&!y.hasAttribute("link"))return;const k=c(y),x=k?y.href.baseVal:y.href;if((k?y.target.baseVal:y.target)||!x&&!y.hasAttribute("state"))return;const b=(y.getAttribute("rel")||"").split(/\s+/);if(y.hasAttribute("download")||b&&b.includes("external"))return;const S=k?new URL(x,document.baseURI):new URL(x);if(!(S.origin!==window.location.origin||s&&S.pathname&&!S.pathname.toLowerCase().startsWith(s.toLowerCase())))return[y,S]}function h(v){const y=u(v);if(!y)return;const[k,x]=y,w=i.parsePath(x.pathname+x.search+x.hash),b=k.getAttribute("state");v.preventDefault(),o(w,{resolve:!1,replace:k.hasAttribute("replace"),scroll:!k.hasAttribute("noscroll"),state:b?JSON.parse(b):void 0})}function p(v){const y=u(v);if(!y)return;const[k,x]=y;i.preloadRoute(x,k.getAttribute("preload")!=="false")}function g(v){clearTimeout(l);const y=u(v);if(!y)return a=null;const[k,x]=y;a!==k&&(l=setTimeout(()=>{i.preloadRoute(x,k.getAttribute("preload")!=="false"),a=k},20))}function f(v){if(v.defaultPrevented)return;let y=v.submitter&&v.submitter.hasAttribute("formaction")?v.submitter.getAttribute("formaction"):v.target.getAttribute("action");if(!y)return;if(!y.startsWith("https://action/")){const x=new URL(y,Mi);if(y=i.parsePath(x.pathname+x.search),!y.startsWith(r))return}if(v.target.method.toUpperCase()!=="POST")throw new Error("Only POST forms are supported for Actions");const k=Bo.get(y);if(k){v.preventDefault();const x=new FormData(v.target,v.submitter);k.call({r:i,f:v.target},v.target.enctype==="multipart/form-data"?x:new URLSearchParams(x))}}br(["click","submit"]),document.addEventListener("click",h),t&&(document.addEventListener("mousemove",g,{passive:!0}),document.addEventListener("focusin",p,{passive:!0}),document.addEventListener("touchstart",p,{passive:!0})),document.addEventListener("submit",f),cn(()=>{document.removeEventListener("click",h),t&&(document.removeEventListener("mousemove",g),document.removeEventListener("focusin",p),document.removeEventListener("touchstart",p)),document.removeEventListener("submit",f)})}}function Do(t){const e=t.replace(/^.*?#/,"");if(!e.startsWith("/")){const[,r="/"]=window.location.hash.split("#",2);return`${r}#${e}`}return e}function Vo(t){const e=()=>window.location.hash.slice(1),r=Vi();return Po({get:e,set({value:n,replace:i,scroll:s,state:o}){i?window.history.replaceState(po(o),"","#"+n):window.history.pushState(o,"","#"+n);const l=n.indexOf("#"),a=l>=0?n.slice(l+1):"";Lo(a,s),gn()},init:n=>Oo(window,"hashchange",fo(n,i=>!r.confirm(i&&i<0?i:e()))),create:Io(t.preload,t.explicitLinks,t.actionBase),utils:{go:n=>window.history.go(n),renderPath:n=>`#${n}`,parsePath:Do,beforeLeave:r}})(t)}/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Je=globalThis,bn=Je.ShadowRoot&&(Je.ShadyCSS===void 0||Je.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,vn=Symbol(),Wn=new WeakMap;let Zi=class{constructor(e,r,n){if(this._$cssResult$=!0,n!==vn)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=r}get styleSheet(){let e=this.o;const r=this.t;if(bn&&e===void 0){const n=r!==void 0&&r.length===1;n&&(e=Wn.get(r)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),n&&Wn.set(r,e))}return e}toString(){return this.cssText}};const Mo=t=>new Zi(typeof t=="string"?t:t+"",void 0,vn),xt=(t,...e)=>{const r=t.length===1?t[0]:e.reduce((n,i,s)=>n+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]);return new Zi(r,t,vn)},Fo=(t,e)=>{if(bn)t.adoptedStyleSheets=e.map(r=>r instanceof CSSStyleSheet?r:r.styleSheet);else for(const r of e){const n=document.createElement("style"),i=Je.litNonce;i!==void 0&&n.setAttribute("nonce",i),n.textContent=r.cssText,t.appendChild(n)}},Kn=bn?t=>t:t=>t instanceof CSSStyleSheet?(e=>{let r="";for(const n of e.cssRules)r+=n.cssText;return Mo(r)})(t):t;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:No,defineProperty:Ho,getOwnPropertyDescriptor:Uo,getOwnPropertyNames:jo,getOwnPropertySymbols:qo,getPrototypeOf:Wo}=Object,Nt=globalThis,Zn=Nt.trustedTypes,Ko=Zn?Zn.emptyScript:"",Br=Nt.reactiveElementPolyfillSupport,Re=(t,e)=>t,pe={toAttribute(t,e){switch(e){case Boolean:t=t?Ko:null;break;case Object:case Array:t=t==null?t:JSON.stringify(t)}return t},fromAttribute(t,e){let r=t;switch(e){case Boolean:r=t!==null;break;case Number:r=t===null?null:Number(t);break;case Object:case Array:try{r=JSON.parse(t)}catch{r=null}}return r}},yn=(t,e)=>!No(t,e),Xn={attribute:!0,type:String,converter:pe,reflect:!1,useDefault:!1,hasChanged:yn};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),Nt.litPropertyMetadata??(Nt.litPropertyMetadata=new WeakMap);let ue=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??(this.l=[])).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,r=Xn){if(r.state&&(r.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((r=Object.create(r)).wrapped=!0),this.elementProperties.set(e,r),!r.noAccessor){const n=Symbol(),i=this.getPropertyDescriptor(e,n,r);i!==void 0&&Ho(this.prototype,e,i)}}static getPropertyDescriptor(e,r,n){const{get:i,set:s}=Uo(this.prototype,e)??{get(){return this[r]},set(o){this[r]=o}};return{get:i,set(o){const l=i==null?void 0:i.call(this);s==null||s.call(this,o),this.requestUpdate(e,l,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Xn}static _$Ei(){if(this.hasOwnProperty(Re("elementProperties")))return;const e=Wo(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(Re("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(Re("properties"))){const r=this.properties,n=[...jo(r),...qo(r)];for(const i of n)this.createProperty(i,r[i])}const e=this[Symbol.metadata];if(e!==null){const r=litPropertyMetadata.get(e);if(r!==void 0)for(const[n,i]of r)this.elementProperties.set(n,i)}this._$Eh=new Map;for(const[r,n]of this.elementProperties){const i=this._$Eu(r,n);i!==void 0&&this._$Eh.set(i,r)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const r=[];if(Array.isArray(e)){const n=new Set(e.flat(1/0).reverse());for(const i of n)r.unshift(Kn(i))}else e!==void 0&&r.push(Kn(e));return r}static _$Eu(e,r){const n=r.attribute;return n===!1?void 0:typeof n=="string"?n:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){var e;this._$ES=new Promise(r=>this.enableUpdating=r),this._$AL=new Map,this._$E_(),this.requestUpdate(),(e=this.constructor.l)==null||e.forEach(r=>r(this))}addController(e){var r;(this._$EO??(this._$EO=new Set)).add(e),this.renderRoot!==void 0&&this.isConnected&&((r=e.hostConnected)==null||r.call(e))}removeController(e){var r;(r=this._$EO)==null||r.delete(e)}_$E_(){const e=new Map,r=this.constructor.elementProperties;for(const n of r.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Fo(e,this.constructor.elementStyles),e}connectedCallback(){var e;this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(e=this._$EO)==null||e.forEach(r=>{var n;return(n=r.hostConnected)==null?void 0:n.call(r)})}enableUpdating(e){}disconnectedCallback(){var e;(e=this._$EO)==null||e.forEach(r=>{var n;return(n=r.hostDisconnected)==null?void 0:n.call(r)})}attributeChangedCallback(e,r,n){this._$AK(e,n)}_$ET(e,r){var s;const n=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,n);if(i!==void 0&&n.reflect===!0){const o=(((s=n.converter)==null?void 0:s.toAttribute)!==void 0?n.converter:pe).toAttribute(r,n.type);this._$Em=e,o==null?this.removeAttribute(i):this.setAttribute(i,o),this._$Em=null}}_$AK(e,r){var s,o;const n=this.constructor,i=n._$Eh.get(e);if(i!==void 0&&this._$Em!==i){const l=n.getPropertyOptions(i),a=typeof l.converter=="function"?{fromAttribute:l.converter}:((s=l.converter)==null?void 0:s.fromAttribute)!==void 0?l.converter:pe;this._$Em=i;const c=a.fromAttribute(r,l.type);this[i]=c??((o=this._$Ej)==null?void 0:o.get(i))??c,this._$Em=null}}requestUpdate(e,r,n,i=!1,s){var o;if(e!==void 0){const l=this.constructor;if(i===!1&&(s=this[e]),n??(n=l.getPropertyOptions(e)),!((n.hasChanged??yn)(s,r)||n.useDefault&&n.reflect&&s===((o=this._$Ej)==null?void 0:o.get(e))&&!this.hasAttribute(l._$Eu(e,n))))return;this.C(e,r,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,r,{useDefault:n,reflect:i,wrapped:s},o){n&&!(this._$Ej??(this._$Ej=new Map)).has(e)&&(this._$Ej.set(e,o??r??this[e]),s!==!0||o!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(r=void 0),this._$AL.set(e,r)),i===!0&&this._$Em!==e&&(this._$Eq??(this._$Eq=new Set)).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(r){Promise.reject(r)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var n;if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(const[s,o]of this._$Ep)this[s]=o;this._$Ep=void 0}const i=this.constructor.elementProperties;if(i.size>0)for(const[s,o]of i){const{wrapped:l}=o,a=this[s];l!==!0||this._$AL.has(s)||a===void 0||this.C(s,void 0,o,a)}}let e=!1;const r=this._$AL;try{e=this.shouldUpdate(r),e?(this.willUpdate(r),(n=this._$EO)==null||n.forEach(i=>{var s;return(s=i.hostUpdate)==null?void 0:s.call(i)}),this.update(r)):this._$EM()}catch(i){throw e=!1,this._$EM(),i}e&&this._$AE(r)}willUpdate(e){}_$AE(e){var r;(r=this._$EO)==null||r.forEach(n=>{var i;return(i=n.hostUpdated)==null?void 0:i.call(n)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&(this._$Eq=this._$Eq.forEach(r=>this._$ET(r,this[r]))),this._$EM()}updated(e){}firstUpdated(e){}};ue.elementStyles=[],ue.shadowRootOptions={mode:"open"},ue[Re("elementProperties")]=new Map,ue[Re("finalized")]=new Map,Br==null||Br({ReactiveElement:ue}),(Nt.reactiveElementVersions??(Nt.reactiveElementVersions=[])).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Te=globalThis,Yn=t=>t,lr=Te.trustedTypes,Qn=lr?lr.createPolicy("lit-html",{createHTML:t=>t}):void 0,Xi="$lit$",Mt=`lit$${Math.random().toFixed(9).slice(2)}$`,Yi="?"+Mt,Zo=`<${Yi}>`,ee=document,Le=()=>ee.createComment(""),Be=t=>t===null||typeof t!="object"&&typeof t!="function",wn=Array.isArray,Xo=t=>wn(t)||typeof(t==null?void 0:t[Symbol.iterator])=="function",Ir=`[ 	
\f\r]`,xe=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Gn=/-->/g,Jn=/>/g,Kt=RegExp(`>|${Ir}(?:([^\\s"'>=/]+)(${Ir}*=${Ir}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ti=/'/g,ei=/"/g,Qi=/^(?:script|style|textarea|title)$/i,Yo=t=>(e,...r)=>({_$litType$:t,strings:e,values:r}),Q=Yo(1),_t=Symbol.for("lit-noChange"),J=Symbol.for("lit-nothing"),ri=new WeakMap,Gt=ee.createTreeWalker(ee,129);function Gi(t,e){if(!wn(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return Qn!==void 0?Qn.createHTML(e):e}const Qo=(t,e)=>{const r=t.length-1,n=[];let i,s=e===2?"<svg>":e===3?"<math>":"",o=xe;for(let l=0;l<r;l++){const a=t[l];let c,u,h=-1,p=0;for(;p<a.length&&(o.lastIndex=p,u=o.exec(a),u!==null);)p=o.lastIndex,o===xe?u[1]==="!--"?o=Gn:u[1]!==void 0?o=Jn:u[2]!==void 0?(Qi.test(u[2])&&(i=RegExp("</"+u[2],"g")),o=Kt):u[3]!==void 0&&(o=Kt):o===Kt?u[0]===">"?(o=i??xe,h=-1):u[1]===void 0?h=-2:(h=o.lastIndex-u[2].length,c=u[1],o=u[3]===void 0?Kt:u[3]==='"'?ei:ti):o===ei||o===ti?o=Kt:o===Gn||o===Jn?o=xe:(o=Kt,i=void 0);const g=o===Kt&&t[l+1].startsWith("/>")?" ":"";s+=o===xe?a+Zo:h>=0?(n.push(c),a.slice(0,h)+Xi+a.slice(h)+Mt+g):a+Mt+(h===-2?l:g)}return[Gi(t,s+(t[r]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),n]};class Ie{constructor({strings:e,_$litType$:r},n){let i;this.parts=[];let s=0,o=0;const l=e.length-1,a=this.parts,[c,u]=Qo(e,r);if(this.el=Ie.createElement(c,n),Gt.currentNode=this.el.content,r===2||r===3){const h=this.el.content.firstChild;h.replaceWith(...h.childNodes)}for(;(i=Gt.nextNode())!==null&&a.length<l;){if(i.nodeType===1){if(i.hasAttributes())for(const h of i.getAttributeNames())if(h.endsWith(Xi)){const p=u[o++],g=i.getAttribute(h).split(Mt),f=/([.?@])?(.*)/.exec(p);a.push({type:1,index:s,name:f[2],strings:g,ctor:f[1]==="."?Jo:f[1]==="?"?tl:f[1]==="@"?el:wr}),i.removeAttribute(h)}else h.startsWith(Mt)&&(a.push({type:6,index:s}),i.removeAttribute(h));if(Qi.test(i.tagName)){const h=i.textContent.split(Mt),p=h.length-1;if(p>0){i.textContent=lr?lr.emptyScript:"";for(let g=0;g<p;g++)i.append(h[g],Le()),Gt.nextNode(),a.push({type:2,index:++s});i.append(h[p],Le())}}}else if(i.nodeType===8)if(i.data===Yi)a.push({type:2,index:s});else{let h=-1;for(;(h=i.data.indexOf(Mt,h+1))!==-1;)a.push({type:7,index:s}),h+=Mt.length-1}s++}}static createElement(e,r){const n=ee.createElement("template");return n.innerHTML=e,n}}function fe(t,e,r=t,n){var o,l;if(e===_t)return e;let i=n!==void 0?(o=r._$Co)==null?void 0:o[n]:r._$Cl;const s=Be(e)?void 0:e._$litDirective$;return(i==null?void 0:i.constructor)!==s&&((l=i==null?void 0:i._$AO)==null||l.call(i,!1),s===void 0?i=void 0:(i=new s(t),i._$AT(t,r,n)),n!==void 0?(r._$Co??(r._$Co=[]))[n]=i:r._$Cl=i),i!==void 0&&(e=fe(t,i._$AS(t,e.values),i,n)),e}class Go{constructor(e,r){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=r}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:r},parts:n}=this._$AD,i=((e==null?void 0:e.creationScope)??ee).importNode(r,!0);Gt.currentNode=i;let s=Gt.nextNode(),o=0,l=0,a=n[0];for(;a!==void 0;){if(o===a.index){let c;a.type===2?c=new Fe(s,s.nextSibling,this,e):a.type===1?c=new a.ctor(s,a.name,a.strings,this,e):a.type===6&&(c=new rl(s,this,e)),this._$AV.push(c),a=n[++l]}o!==(a==null?void 0:a.index)&&(s=Gt.nextNode(),o++)}return Gt.currentNode=ee,i}p(e){let r=0;for(const n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(e,n,r),r+=n.strings.length-2):n._$AI(e[r])),r++}}class Fe{get _$AU(){var e;return((e=this._$AM)==null?void 0:e._$AU)??this._$Cv}constructor(e,r,n,i){this.type=2,this._$AH=J,this._$AN=void 0,this._$AA=e,this._$AB=r,this._$AM=n,this.options=i,this._$Cv=(i==null?void 0:i.isConnected)??!0}get parentNode(){let e=this._$AA.parentNode;const r=this._$AM;return r!==void 0&&(e==null?void 0:e.nodeType)===11&&(e=r.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,r=this){e=fe(this,e,r),Be(e)?e===J||e==null||e===""?(this._$AH!==J&&this._$AR(),this._$AH=J):e!==this._$AH&&e!==_t&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Xo(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==J&&Be(this._$AH)?this._$AA.nextSibling.data=e:this.T(ee.createTextNode(e)),this._$AH=e}$(e){var s;const{values:r,_$litType$:n}=e,i=typeof n=="number"?this._$AC(e):(n.el===void 0&&(n.el=Ie.createElement(Gi(n.h,n.h[0]),this.options)),n);if(((s=this._$AH)==null?void 0:s._$AD)===i)this._$AH.p(r);else{const o=new Go(i,this),l=o.u(this.options);o.p(r),this.T(l),this._$AH=o}}_$AC(e){let r=ri.get(e.strings);return r===void 0&&ri.set(e.strings,r=new Ie(e)),r}k(e){wn(this._$AH)||(this._$AH=[],this._$AR());const r=this._$AH;let n,i=0;for(const s of e)i===r.length?r.push(n=new Fe(this.O(Le()),this.O(Le()),this,this.options)):n=r[i],n._$AI(s),i++;i<r.length&&(this._$AR(n&&n._$AB.nextSibling,i),r.length=i)}_$AR(e=this._$AA.nextSibling,r){var n;for((n=this._$AP)==null?void 0:n.call(this,!1,!0,r);e!==this._$AB;){const i=Yn(e).nextSibling;Yn(e).remove(),e=i}}setConnected(e){var r;this._$AM===void 0&&(this._$Cv=e,(r=this._$AP)==null||r.call(this,e))}}let wr=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,r,n,i,s){this.type=1,this._$AH=J,this._$AN=void 0,this.element=e,this.name=r,this._$AM=i,this.options=s,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=J}_$AI(e,r=this,n,i){const s=this.strings;let o=!1;if(s===void 0)e=fe(this,e,r,0),o=!Be(e)||e!==this._$AH&&e!==_t,o&&(this._$AH=e);else{const l=e;let a,c;for(e=s[0],a=0;a<s.length-1;a++)c=fe(this,l[n+a],r,a),c===_t&&(c=this._$AH[a]),o||(o=!Be(c)||c!==this._$AH[a]),c===J?e=J:e!==J&&(e+=(c??"")+s[a+1]),this._$AH[a]=c}o&&!i&&this.j(e)}j(e){e===J?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},Jo=class extends wr{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===J?void 0:e}},tl=class extends wr{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==J)}},el=class extends wr{constructor(e,r,n,i,s){super(e,r,n,i,s),this.type=5}_$AI(e,r=this){if((e=fe(this,e,r,0)??J)===_t)return;const n=this._$AH,i=e===J&&n!==J||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,s=e!==J&&(n===J||i);i&&this.element.removeEventListener(this.name,this,n),s&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var r;typeof this._$AH=="function"?this._$AH.call(((r=this.options)==null?void 0:r.host)??this.element,e):this._$AH.handleEvent(e)}},rl=class{constructor(e,r,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=r,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){fe(this,e)}};const Dr=Te.litHtmlPolyfillSupport;Dr==null||Dr(Ie,Fe),(Te.litHtmlVersions??(Te.litHtmlVersions=[])).push("3.3.3");const nl=(t,e,r)=>{const n=(r==null?void 0:r.renderBefore)??e;let i=n._$litPart$;if(i===void 0){const s=(r==null?void 0:r.renderBefore)??null;n._$litPart$=i=new Fe(e.insertBefore(Le(),s),s,void 0,r??{})}return i._$AI(t),i};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const te=globalThis;let Pe=class extends ue{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var r;const e=super.createRenderRoot();return(r=this.renderOptions).renderBefore??(r.renderBefore=e.firstChild),e}update(e){const r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=nl(r,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),(e=this._$Do)==null||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),(e=this._$Do)==null||e.setConnected(!1)}render(){return _t}};var Ai;Pe._$litElement$=!0,Pe.finalized=!0,(Ai=te.litElementHydrateSupport)==null||Ai.call(te,{LitElement:Pe});const Vr=te.litElementPolyfillSupport;Vr==null||Vr({LitElement:Pe});(te.litElementVersions??(te.litElementVersions=[])).push("4.2.2");var il=xt`
  :host {
    --track-width: 2px;
    --track-color: rgb(128 128 128 / 25%);
    --indicator-color: var(--sl-color-primary-600);
    --speed: 2s;

    display: inline-flex;
    width: 1em;
    height: 1em;
    flex: none;
  }

  .spinner {
    flex: 1 1 auto;
    height: 100%;
    width: 100%;
  }

  .spinner__track,
  .spinner__indicator {
    fill: none;
    stroke-width: var(--track-width);
    r: calc(0.5em - var(--track-width) / 2);
    cx: 0.5em;
    cy: 0.5em;
    transform-origin: 50% 50%;
  }

  .spinner__track {
    stroke: var(--track-color);
    transform-origin: 0% 0%;
  }

  .spinner__indicator {
    stroke: var(--indicator-color);
    stroke-linecap: round;
    stroke-dasharray: 150% 75%;
    animation: spin var(--speed) linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
      stroke-dasharray: 0.05em, 3em;
    }

    50% {
      transform: rotate(450deg);
      stroke-dasharray: 1.375em, 1.375em;
    }

    100% {
      transform: rotate(1080deg);
      stroke-dasharray: 0.05em, 3em;
    }
  }
`;const Qr=new Set,he=new Map;let Yt,xn="ltr",kn="en";const Ji=typeof MutationObserver<"u"&&typeof document<"u"&&typeof document.documentElement<"u";if(Ji){const t=new MutationObserver(es);xn=document.documentElement.dir||"ltr",kn=document.documentElement.lang||navigator.language,t.observe(document.documentElement,{attributes:!0,attributeFilter:["dir","lang"]})}function ts(...t){t.map(e=>{const r=e.$code.toLowerCase();he.has(r)?he.set(r,Object.assign(Object.assign({},he.get(r)),e)):he.set(r,e),Yt||(Yt=e)}),es()}function es(){Ji&&(xn=document.documentElement.dir||"ltr",kn=document.documentElement.lang||navigator.language),[...Qr.keys()].map(t=>{typeof t.requestUpdate=="function"&&t.requestUpdate()})}let sl=class{constructor(e){this.host=e,this.host.addController(this)}hostConnected(){Qr.add(this.host)}hostDisconnected(){Qr.delete(this.host)}dir(){return`${this.host.dir||xn}`.toLowerCase()}lang(){return`${this.host.lang||kn}`.toLowerCase()}getTranslationData(e){var r,n;let i;try{i=new Intl.Locale(e.replace(/_/g,"-"))}catch{return{locale:void 0,language:"",region:"",primary:void 0,secondary:void 0}}const s=i.language.toLowerCase(),o=(n=(r=i.region)===null||r===void 0?void 0:r.toLowerCase())!==null&&n!==void 0?n:"",l=he.get(`${s}-${o}`),a=he.get(s);return{locale:i,language:s,region:o,primary:l,secondary:a}}exists(e,r){var n;const{primary:i,secondary:s}=this.getTranslationData((n=r.lang)!==null&&n!==void 0?n:this.lang());return r=Object.assign({includeFallback:!1},r),!!(i&&i[e]||s&&s[e]||r.includeFallback&&Yt&&Yt[e])}term(e,...r){const{primary:n,secondary:i}=this.getTranslationData(this.lang());let s;if(n&&n[e])s=n[e];else if(i&&i[e])s=i[e];else if(Yt&&Yt[e])s=Yt[e];else return console.error(`No translation found for: ${String(e)}`),String(e);return typeof s=="function"?s(...r):s}date(e,r){return e=new Date(e),new Intl.DateTimeFormat(this.lang(),r).format(e)}number(e,r){return e=Number(e),isNaN(e)?"":new Intl.NumberFormat(this.lang(),r).format(e)}relativeTime(e,r,n){return new Intl.RelativeTimeFormat(this.lang(),n).format(e,r)}};var rs={$code:"en",$name:"English",$dir:"ltr",carousel:"Carousel",clearEntry:"Clear entry",close:"Close",copied:"Copied",copy:"Copy",currentValue:"Current value",error:"Error",goToSlide:(t,e)=>`Go to slide ${t} of ${e}`,hidePassword:"Hide password",loading:"Loading",nextSlide:"Next slide",numOptionsSelected:t=>t===0?"No options selected":t===1?"1 option selected":`${t} options selected`,previousSlide:"Previous slide",progress:"Progress",remove:"Remove",resize:"Resize",scrollToEnd:"Scroll to end",scrollToStart:"Scroll to start",selectAColorFromTheScreen:"Select a color from the screen",showPassword:"Show password",slideNum:t=>`Slide ${t}`,toggleColorFormat:"Toggle color format"};ts(rs);var ol=rs,se=class extends sl{};ts(ol);var zt=xt`
  :host {
    box-sizing: border-box;
  }

  :host *,
  :host *::before,
  :host *::after {
    box-sizing: inherit;
  }

  [hidden] {
    display: none !important;
  }
`;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ll={attribute:!0,type:String,converter:pe,reflect:!1,hasChanged:yn},al=(t=ll,e,r)=>{const{kind:n,metadata:i}=r;let s=globalThis.litPropertyMetadata.get(i);if(s===void 0&&globalThis.litPropertyMetadata.set(i,s=new Map),n==="setter"&&((t=Object.create(t)).wrapped=!0),s.set(r.name,t),n==="accessor"){const{name:o}=r;return{set(l){const a=e.get.call(this);e.set.call(this,l),this.requestUpdate(o,a,t,!0,l)},init(l){return l!==void 0&&this.C(o,void 0,t,l),l}}}if(n==="setter"){const{name:o}=r;return function(l){const a=this[o];e.call(this,l),this.requestUpdate(o,a,t,!0,l)}}throw Error("Unsupported decorator location: "+n)};function m(t){return(e,r)=>typeof r=="object"?al(t,e,r):((n,i,s)=>{const o=i.hasOwnProperty(s);return i.constructor.createProperty(s,n),o?Object.getOwnPropertyDescriptor(i,s):void 0})(t,e,r)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function ut(t){return m({...t,state:!0,attribute:!1})}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const cl=(t,e,r)=>(r.configurable=!0,r.enumerable=!0,Reflect.decorate&&typeof e!="object"&&Object.defineProperty(t,e,r),r);/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function gt(t,e){return(r,n,i)=>{const s=o=>{var l;return((l=o.renderRoot)==null?void 0:l.querySelector(t))??null};return cl(r,n,{get(){return s(this)}})}}var tr,ht=class extends Pe{constructor(){super(),uo(this,tr,!1),this.initialReflectedProperties=new Map,Object.entries(this.constructor.dependencies).forEach(([t,e])=>{this.constructor.define(t,e)})}emit(t,e){const r=new CustomEvent(t,ie({bubbles:!0,cancelable:!1,composed:!0,detail:{}},e));return this.dispatchEvent(r),r}static define(t,e=this,r={}){const n=customElements.get(t);if(!n){try{customElements.define(t,e,r)}catch{customElements.define(t,class extends e{},r)}return}let i=" (unknown version)",s=i;"version"in e&&e.version&&(i=" v"+e.version),"version"in n&&n.version&&(s=" v"+n.version),!(i&&s&&i===s)&&console.warn(`Attempted to register <${t}>${i}, but <${t}>${s} has already been registered.`)}attributeChangedCallback(t,e,r){co(this,tr)||(this.constructor.elementProperties.forEach((n,i)=>{n.reflect&&this[i]!=null&&this.initialReflectedProperties.set(i,this[i])}),ho(this,tr,!0)),super.attributeChangedCallback(t,e,r)}willUpdate(t){super.willUpdate(t),this.initialReflectedProperties.forEach((e,r)=>{t.has(r)&&this[r]==null&&(this[r]=e)})}};tr=new WeakMap;ht.version="2.20.1";ht.dependencies={};d([m()],ht.prototype,"dir",2);d([m()],ht.prototype,"lang",2);var ns=class extends ht{constructor(){super(...arguments),this.localize=new se(this)}render(){return Q`
      <svg part="base" class="spinner" role="progressbar" aria-label=${this.localize.term("loading")}>
        <circle class="spinner__track"></circle>
        <circle class="spinner__indicator"></circle>
      </svg>
    `}};ns.styles=[zt,il];var ke=new WeakMap,_e=new WeakMap,$e=new WeakMap,Mr=new WeakSet,We=new WeakMap,Ne=class{constructor(t,e){this.handleFormData=r=>{const n=this.options.disabled(this.host),i=this.options.name(this.host),s=this.options.value(this.host),o=this.host.tagName.toLowerCase()==="sl-button";this.host.isConnected&&!n&&!o&&typeof i=="string"&&i.length>0&&typeof s<"u"&&(Array.isArray(s)?s.forEach(l=>{r.formData.append(i,l.toString())}):r.formData.append(i,s.toString()))},this.handleFormSubmit=r=>{var n;const i=this.options.disabled(this.host),s=this.options.reportValidity;this.form&&!this.form.noValidate&&((n=ke.get(this.form))==null||n.forEach(o=>{this.setUserInteracted(o,!0)})),this.form&&!this.form.noValidate&&!i&&!s(this.host)&&(r.preventDefault(),r.stopImmediatePropagation())},this.handleFormReset=()=>{this.options.setValue(this.host,this.options.defaultValue(this.host)),this.setUserInteracted(this.host,!1),We.set(this.host,[])},this.handleInteraction=r=>{const n=We.get(this.host);n.includes(r.type)||n.push(r.type),n.length===this.options.assumeInteractionOn.length&&this.setUserInteracted(this.host,!0)},this.checkFormValidity=()=>{if(this.form&&!this.form.noValidate){const r=this.form.querySelectorAll("*");for(const n of r)if(typeof n.checkValidity=="function"&&!n.checkValidity())return!1}return!0},this.reportFormValidity=()=>{if(this.form&&!this.form.noValidate){const r=this.form.querySelectorAll("*");for(const n of r)if(typeof n.reportValidity=="function"&&!n.reportValidity())return!1}return!0},(this.host=t).addController(this),this.options=ie({form:r=>{const n=r.form;if(n){const s=r.getRootNode().querySelector(`#${n}`);if(s)return s}return r.closest("form")},name:r=>r.name,value:r=>r.value,defaultValue:r=>r.defaultValue,disabled:r=>{var n;return(n=r.disabled)!=null?n:!1},reportValidity:r=>typeof r.reportValidity=="function"?r.reportValidity():!0,checkValidity:r=>typeof r.checkValidity=="function"?r.checkValidity():!0,setValue:(r,n)=>r.value=n,assumeInteractionOn:["sl-input"]},e)}hostConnected(){const t=this.options.form(this.host);t&&this.attachForm(t),We.set(this.host,[]),this.options.assumeInteractionOn.forEach(e=>{this.host.addEventListener(e,this.handleInteraction)})}hostDisconnected(){this.detachForm(),We.delete(this.host),this.options.assumeInteractionOn.forEach(t=>{this.host.removeEventListener(t,this.handleInteraction)})}hostUpdated(){const t=this.options.form(this.host);t||this.detachForm(),t&&this.form!==t&&(this.detachForm(),this.attachForm(t)),this.host.hasUpdated&&this.setValidity(this.host.validity.valid)}attachForm(t){t?(this.form=t,ke.has(this.form)?ke.get(this.form).add(this.host):ke.set(this.form,new Set([this.host])),this.form.addEventListener("formdata",this.handleFormData),this.form.addEventListener("submit",this.handleFormSubmit),this.form.addEventListener("reset",this.handleFormReset),_e.has(this.form)||(_e.set(this.form,this.form.reportValidity),this.form.reportValidity=()=>this.reportFormValidity()),$e.has(this.form)||($e.set(this.form,this.form.checkValidity),this.form.checkValidity=()=>this.checkFormValidity())):this.form=void 0}detachForm(){if(!this.form)return;const t=ke.get(this.form);t&&(t.delete(this.host),t.size<=0&&(this.form.removeEventListener("formdata",this.handleFormData),this.form.removeEventListener("submit",this.handleFormSubmit),this.form.removeEventListener("reset",this.handleFormReset),_e.has(this.form)&&(this.form.reportValidity=_e.get(this.form),_e.delete(this.form)),$e.has(this.form)&&(this.form.checkValidity=$e.get(this.form),$e.delete(this.form)),this.form=void 0))}setUserInteracted(t,e){e?Mr.add(t):Mr.delete(t),t.requestUpdate()}doAction(t,e){if(this.form){const r=document.createElement("button");r.type=t,r.style.position="absolute",r.style.width="0",r.style.height="0",r.style.clipPath="inset(50%)",r.style.overflow="hidden",r.style.whiteSpace="nowrap",e&&(r.name=e.name,r.value=e.value,["formaction","formenctype","formmethod","formnovalidate","formtarget"].forEach(n=>{e.hasAttribute(n)&&r.setAttribute(n,e.getAttribute(n))})),this.form.append(r),r.click(),r.remove()}}getForm(){var t;return(t=this.form)!=null?t:null}reset(t){this.doAction("reset",t)}submit(t){this.doAction("submit",t)}setValidity(t){const e=this.host,r=!!Mr.has(e),n=!!e.required;e.toggleAttribute("data-required",n),e.toggleAttribute("data-optional",!n),e.toggleAttribute("data-invalid",!t),e.toggleAttribute("data-valid",t),e.toggleAttribute("data-user-invalid",!t&&r),e.toggleAttribute("data-user-valid",t&&r)}updateValidity(){const t=this.host;this.setValidity(t.validity.valid)}emitInvalidEvent(t){const e=new CustomEvent("sl-invalid",{bubbles:!1,composed:!1,cancelable:!0,detail:{}});t||e.preventDefault(),this.host.dispatchEvent(e)||t==null||t.preventDefault()}},_n=Object.freeze({badInput:!1,customError:!1,patternMismatch:!1,rangeOverflow:!1,rangeUnderflow:!1,stepMismatch:!1,tooLong:!1,tooShort:!1,typeMismatch:!1,valid:!0,valueMissing:!1});Object.freeze(vr(ie({},_n),{valid:!1,valueMissing:!0}));Object.freeze(vr(ie({},_n),{valid:!1,customError:!0}));var ul=xt`
  :host {
    display: inline-block;
    position: relative;
    width: auto;
    cursor: pointer;
  }

  .button {
    display: inline-flex;
    align-items: stretch;
    justify-content: center;
    width: 100%;
    border-style: solid;
    border-width: var(--sl-input-border-width);
    font-family: var(--sl-input-font-family);
    font-weight: var(--sl-font-weight-semibold);
    text-decoration: none;
    user-select: none;
    -webkit-user-select: none;
    white-space: nowrap;
    vertical-align: middle;
    padding: 0;
    transition:
      var(--sl-transition-x-fast) background-color,
      var(--sl-transition-x-fast) color,
      var(--sl-transition-x-fast) border,
      var(--sl-transition-x-fast) box-shadow;
    cursor: inherit;
  }

  .button::-moz-focus-inner {
    border: 0;
  }

  .button:focus {
    outline: none;
  }

  .button:focus-visible {
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }

  .button--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* When disabled, prevent mouse events from bubbling up from children */
  .button--disabled * {
    pointer-events: none;
  }

  .button__prefix,
  .button__suffix {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    pointer-events: none;
  }

  .button__label {
    display: inline-block;
  }

  .button__label::slotted(sl-icon) {
    vertical-align: -2px;
  }

  /*
   * Standard buttons
   */

  /* Default */
  .button--standard.button--default {
    background-color: var(--sl-color-neutral-0);
    border-color: var(--sl-input-border-color);
    color: var(--sl-color-neutral-700);
  }

  .button--standard.button--default:hover:not(.button--disabled) {
    background-color: var(--sl-color-primary-50);
    border-color: var(--sl-color-primary-300);
    color: var(--sl-color-primary-700);
  }

  .button--standard.button--default:active:not(.button--disabled) {
    background-color: var(--sl-color-primary-100);
    border-color: var(--sl-color-primary-400);
    color: var(--sl-color-primary-700);
  }

  /* Primary */
  .button--standard.button--primary {
    background-color: var(--sl-color-primary-600);
    border-color: var(--sl-color-primary-600);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--primary:hover:not(.button--disabled) {
    background-color: var(--sl-color-primary-500);
    border-color: var(--sl-color-primary-500);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--primary:active:not(.button--disabled) {
    background-color: var(--sl-color-primary-600);
    border-color: var(--sl-color-primary-600);
    color: var(--sl-color-neutral-0);
  }

  /* Success */
  .button--standard.button--success {
    background-color: var(--sl-color-success-600);
    border-color: var(--sl-color-success-600);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--success:hover:not(.button--disabled) {
    background-color: var(--sl-color-success-500);
    border-color: var(--sl-color-success-500);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--success:active:not(.button--disabled) {
    background-color: var(--sl-color-success-600);
    border-color: var(--sl-color-success-600);
    color: var(--sl-color-neutral-0);
  }

  /* Neutral */
  .button--standard.button--neutral {
    background-color: var(--sl-color-neutral-600);
    border-color: var(--sl-color-neutral-600);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--neutral:hover:not(.button--disabled) {
    background-color: var(--sl-color-neutral-500);
    border-color: var(--sl-color-neutral-500);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--neutral:active:not(.button--disabled) {
    background-color: var(--sl-color-neutral-600);
    border-color: var(--sl-color-neutral-600);
    color: var(--sl-color-neutral-0);
  }

  /* Warning */
  .button--standard.button--warning {
    background-color: var(--sl-color-warning-600);
    border-color: var(--sl-color-warning-600);
    color: var(--sl-color-neutral-0);
  }
  .button--standard.button--warning:hover:not(.button--disabled) {
    background-color: var(--sl-color-warning-500);
    border-color: var(--sl-color-warning-500);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--warning:active:not(.button--disabled) {
    background-color: var(--sl-color-warning-600);
    border-color: var(--sl-color-warning-600);
    color: var(--sl-color-neutral-0);
  }

  /* Danger */
  .button--standard.button--danger {
    background-color: var(--sl-color-danger-600);
    border-color: var(--sl-color-danger-600);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--danger:hover:not(.button--disabled) {
    background-color: var(--sl-color-danger-500);
    border-color: var(--sl-color-danger-500);
    color: var(--sl-color-neutral-0);
  }

  .button--standard.button--danger:active:not(.button--disabled) {
    background-color: var(--sl-color-danger-600);
    border-color: var(--sl-color-danger-600);
    color: var(--sl-color-neutral-0);
  }

  /*
   * Outline buttons
   */

  .button--outline {
    background: none;
    border: solid 1px;
  }

  /* Default */
  .button--outline.button--default {
    border-color: var(--sl-input-border-color);
    color: var(--sl-color-neutral-700);
  }

  .button--outline.button--default:hover:not(.button--disabled),
  .button--outline.button--default.button--checked:not(.button--disabled) {
    border-color: var(--sl-color-primary-600);
    background-color: var(--sl-color-primary-600);
    color: var(--sl-color-neutral-0);
  }

  .button--outline.button--default:active:not(.button--disabled) {
    border-color: var(--sl-color-primary-700);
    background-color: var(--sl-color-primary-700);
    color: var(--sl-color-neutral-0);
  }

  /* Primary */
  .button--outline.button--primary {
    border-color: var(--sl-color-primary-600);
    color: var(--sl-color-primary-600);
  }

  .button--outline.button--primary:hover:not(.button--disabled),
  .button--outline.button--primary.button--checked:not(.button--disabled) {
    background-color: var(--sl-color-primary-600);
    color: var(--sl-color-neutral-0);
  }

  .button--outline.button--primary:active:not(.button--disabled) {
    border-color: var(--sl-color-primary-700);
    background-color: var(--sl-color-primary-700);
    color: var(--sl-color-neutral-0);
  }

  /* Success */
  .button--outline.button--success {
    border-color: var(--sl-color-success-600);
    color: var(--sl-color-success-600);
  }

  .button--outline.button--success:hover:not(.button--disabled),
  .button--outline.button--success.button--checked:not(.button--disabled) {
    background-color: var(--sl-color-success-600);
    color: var(--sl-color-neutral-0);
  }

  .button--outline.button--success:active:not(.button--disabled) {
    border-color: var(--sl-color-success-700);
    background-color: var(--sl-color-success-700);
    color: var(--sl-color-neutral-0);
  }

  /* Neutral */
  .button--outline.button--neutral {
    border-color: var(--sl-color-neutral-600);
    color: var(--sl-color-neutral-600);
  }

  .button--outline.button--neutral:hover:not(.button--disabled),
  .button--outline.button--neutral.button--checked:not(.button--disabled) {
    background-color: var(--sl-color-neutral-600);
    color: var(--sl-color-neutral-0);
  }

  .button--outline.button--neutral:active:not(.button--disabled) {
    border-color: var(--sl-color-neutral-700);
    background-color: var(--sl-color-neutral-700);
    color: var(--sl-color-neutral-0);
  }

  /* Warning */
  .button--outline.button--warning {
    border-color: var(--sl-color-warning-600);
    color: var(--sl-color-warning-600);
  }

  .button--outline.button--warning:hover:not(.button--disabled),
  .button--outline.button--warning.button--checked:not(.button--disabled) {
    background-color: var(--sl-color-warning-600);
    color: var(--sl-color-neutral-0);
  }

  .button--outline.button--warning:active:not(.button--disabled) {
    border-color: var(--sl-color-warning-700);
    background-color: var(--sl-color-warning-700);
    color: var(--sl-color-neutral-0);
  }

  /* Danger */
  .button--outline.button--danger {
    border-color: var(--sl-color-danger-600);
    color: var(--sl-color-danger-600);
  }

  .button--outline.button--danger:hover:not(.button--disabled),
  .button--outline.button--danger.button--checked:not(.button--disabled) {
    background-color: var(--sl-color-danger-600);
    color: var(--sl-color-neutral-0);
  }

  .button--outline.button--danger:active:not(.button--disabled) {
    border-color: var(--sl-color-danger-700);
    background-color: var(--sl-color-danger-700);
    color: var(--sl-color-neutral-0);
  }

  @media (forced-colors: active) {
    .button.button--outline.button--checked:not(.button--disabled) {
      outline: solid 2px transparent;
    }
  }

  /*
   * Text buttons
   */

  .button--text {
    background-color: transparent;
    border-color: transparent;
    color: var(--sl-color-primary-600);
  }

  .button--text:hover:not(.button--disabled) {
    background-color: transparent;
    border-color: transparent;
    color: var(--sl-color-primary-500);
  }

  .button--text:focus-visible:not(.button--disabled) {
    background-color: transparent;
    border-color: transparent;
    color: var(--sl-color-primary-500);
  }

  .button--text:active:not(.button--disabled) {
    background-color: transparent;
    border-color: transparent;
    color: var(--sl-color-primary-700);
  }

  /*
   * Size modifiers
   */

  .button--small {
    height: auto;
    min-height: var(--sl-input-height-small);
    font-size: var(--sl-button-font-size-small);
    line-height: calc(var(--sl-input-height-small) - var(--sl-input-border-width) * 2);
    border-radius: var(--sl-input-border-radius-small);
  }

  .button--medium {
    height: auto;
    min-height: var(--sl-input-height-medium);
    font-size: var(--sl-button-font-size-medium);
    line-height: calc(var(--sl-input-height-medium) - var(--sl-input-border-width) * 2);
    border-radius: var(--sl-input-border-radius-medium);
  }

  .button--large {
    height: auto;
    min-height: var(--sl-input-height-large);
    font-size: var(--sl-button-font-size-large);
    line-height: calc(var(--sl-input-height-large) - var(--sl-input-border-width) * 2);
    border-radius: var(--sl-input-border-radius-large);
  }

  /*
   * Pill modifier
   */

  .button--pill.button--small {
    border-radius: var(--sl-input-height-small);
  }

  .button--pill.button--medium {
    border-radius: var(--sl-input-height-medium);
  }

  .button--pill.button--large {
    border-radius: var(--sl-input-height-large);
  }

  /*
   * Circle modifier
   */

  .button--circle {
    padding-left: 0;
    padding-right: 0;
  }

  .button--circle.button--small {
    width: var(--sl-input-height-small);
    border-radius: 50%;
  }

  .button--circle.button--medium {
    width: var(--sl-input-height-medium);
    border-radius: 50%;
  }

  .button--circle.button--large {
    width: var(--sl-input-height-large);
    border-radius: 50%;
  }

  .button--circle .button__prefix,
  .button--circle .button__suffix,
  .button--circle .button__caret {
    display: none;
  }

  /*
   * Caret modifier
   */

  .button--caret .button__suffix {
    display: none;
  }

  .button--caret .button__caret {
    height: auto;
  }

  /*
   * Loading modifier
   */

  .button--loading {
    position: relative;
    cursor: wait;
  }

  .button--loading .button__prefix,
  .button--loading .button__label,
  .button--loading .button__suffix,
  .button--loading .button__caret {
    visibility: hidden;
  }

  .button--loading sl-spinner {
    --indicator-color: currentColor;
    position: absolute;
    font-size: 1em;
    height: 1em;
    width: 1em;
    top: calc(50% - 0.5em);
    left: calc(50% - 0.5em);
  }

  /*
   * Badges
   */

  .button ::slotted(sl-badge) {
    position: absolute;
    top: 0;
    right: 0;
    translate: 50% -50%;
    pointer-events: none;
  }

  .button--rtl ::slotted(sl-badge) {
    right: auto;
    left: 0;
    translate: -50% -50%;
  }

  /*
   * Button spacing
   */

  .button--has-label.button--small .button__label {
    padding: 0 var(--sl-spacing-small);
  }

  .button--has-label.button--medium .button__label {
    padding: 0 var(--sl-spacing-medium);
  }

  .button--has-label.button--large .button__label {
    padding: 0 var(--sl-spacing-large);
  }

  .button--has-prefix.button--small {
    padding-inline-start: var(--sl-spacing-x-small);
  }

  .button--has-prefix.button--small .button__label {
    padding-inline-start: var(--sl-spacing-x-small);
  }

  .button--has-prefix.button--medium {
    padding-inline-start: var(--sl-spacing-small);
  }

  .button--has-prefix.button--medium .button__label {
    padding-inline-start: var(--sl-spacing-small);
  }

  .button--has-prefix.button--large {
    padding-inline-start: var(--sl-spacing-small);
  }

  .button--has-prefix.button--large .button__label {
    padding-inline-start: var(--sl-spacing-small);
  }

  .button--has-suffix.button--small,
  .button--caret.button--small {
    padding-inline-end: var(--sl-spacing-x-small);
  }

  .button--has-suffix.button--small .button__label,
  .button--caret.button--small .button__label {
    padding-inline-end: var(--sl-spacing-x-small);
  }

  .button--has-suffix.button--medium,
  .button--caret.button--medium {
    padding-inline-end: var(--sl-spacing-small);
  }

  .button--has-suffix.button--medium .button__label,
  .button--caret.button--medium .button__label {
    padding-inline-end: var(--sl-spacing-small);
  }

  .button--has-suffix.button--large,
  .button--caret.button--large {
    padding-inline-end: var(--sl-spacing-small);
  }

  .button--has-suffix.button--large .button__label,
  .button--caret.button--large .button__label {
    padding-inline-end: var(--sl-spacing-small);
  }

  /*
   * Button groups support a variety of button types (e.g. buttons with tooltips, buttons as dropdown triggers, etc.).
   * This means buttons aren't always direct descendants of the button group, thus we can't target them with the
   * ::slotted selector. To work around this, the button group component does some magic to add these special classes to
   * buttons and we style them here instead.
   */

  :host([data-sl-button-group__button--first]:not([data-sl-button-group__button--last])) .button {
    border-start-end-radius: 0;
    border-end-end-radius: 0;
  }

  :host([data-sl-button-group__button--inner]) .button {
    border-radius: 0;
  }

  :host([data-sl-button-group__button--last]:not([data-sl-button-group__button--first])) .button {
    border-start-start-radius: 0;
    border-end-start-radius: 0;
  }

  /* All except the first */
  :host([data-sl-button-group__button]:not([data-sl-button-group__button--first])) {
    margin-inline-start: calc(-1 * var(--sl-input-border-width));
  }

  /* Add a visual separator between solid buttons */
  :host(
      [data-sl-button-group__button]:not(
          [data-sl-button-group__button--first],
          [data-sl-button-group__button--radio],
          [variant='default']
        ):not(:hover)
    )
    .button:after {
    content: '';
    position: absolute;
    top: 0;
    inset-inline-start: 0;
    bottom: 0;
    border-left: solid 1px rgb(128 128 128 / 33%);
    mix-blend-mode: multiply;
  }

  /* Bump hovered, focused, and checked buttons up so their focus ring isn't clipped */
  :host([data-sl-button-group__button--hover]) {
    z-index: 1;
  }

  /* Focus and checked are always on top */
  :host([data-sl-button-group__button--focus]),
  :host([data-sl-button-group__button][checked]) {
    z-index: 2;
  }
`,He=class{constructor(t,...e){this.slotNames=[],this.handleSlotChange=r=>{const n=r.target;(this.slotNames.includes("[default]")&&!n.name||n.name&&this.slotNames.includes(n.name))&&this.host.requestUpdate()},(this.host=t).addController(this),this.slotNames=e}hasDefaultSlot(){return[...this.host.childNodes].some(t=>{if(t.nodeType===t.TEXT_NODE&&t.textContent.trim()!=="")return!0;if(t.nodeType===t.ELEMENT_NODE){const e=t;if(e.tagName.toLowerCase()==="sl-visually-hidden")return!1;if(!e.hasAttribute("slot"))return!0}return!1})}hasNamedSlot(t){return this.host.querySelector(`:scope > [slot="${t}"]`)!==null}test(t){return t==="[default]"?this.hasDefaultSlot():this.hasNamedSlot(t)}hostConnected(){this.host.shadowRoot.addEventListener("slotchange",this.handleSlotChange)}hostDisconnected(){this.host.shadowRoot.removeEventListener("slotchange",this.handleSlotChange)}},hl={name:"default",resolver:t=>no(`assets/icons/${t}.svg`)},dl=hl,ni={caret:`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  `,check:`
    <svg part="checked-icon" class="checkbox__icon" viewBox="0 0 16 16">
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round">
        <g stroke="currentColor">
          <g transform="translate(3.428571, 3.428571)">
            <path d="M0,5.71428571 L3.42857143,9.14285714"></path>
            <path d="M9.14285714,0 L3.42857143,9.14285714"></path>
          </g>
        </g>
      </g>
    </svg>
  `,"chevron-down":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-down" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
    </svg>
  `,"chevron-left":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-left" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
    </svg>
  `,"chevron-right":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-right" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
    </svg>
  `,copy:`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-copy" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6ZM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2Z"/>
    </svg>
  `,eye:`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16">
      <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
      <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
    </svg>
  `,"eye-slash":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-slash" viewBox="0 0 16 16">
      <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
      <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
      <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
    </svg>
  `,eyedropper:`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eyedropper" viewBox="0 0 16 16">
      <path d="M13.354.646a1.207 1.207 0 0 0-1.708 0L8.5 3.793l-.646-.647a.5.5 0 1 0-.708.708L8.293 5l-7.147 7.146A.5.5 0 0 0 1 12.5v1.793l-.854.853a.5.5 0 1 0 .708.707L1.707 15H3.5a.5.5 0 0 0 .354-.146L11 7.707l1.146 1.147a.5.5 0 0 0 .708-.708l-.647-.646 3.147-3.146a1.207 1.207 0 0 0 0-1.708l-2-2zM2 12.707l7-7L10.293 7l-7 7H2v-1.293z"></path>
    </svg>
  `,"grip-vertical":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-grip-vertical" viewBox="0 0 16 16">
      <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-3 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"></path>
    </svg>
  `,indeterminate:`
    <svg part="indeterminate-icon" class="checkbox__icon" viewBox="0 0 16 16">
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round">
        <g stroke="currentColor" stroke-width="2">
          <g transform="translate(2.285714, 6.857143)">
            <path d="M10.2857143,1.14285714 L1.14285714,1.14285714"></path>
          </g>
        </g>
      </g>
    </svg>
  `,"person-fill":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-fill" viewBox="0 0 16 16">
      <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
    </svg>
  `,"play-fill":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
      <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"></path>
    </svg>
  `,"pause-fill":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pause-fill" viewBox="0 0 16 16">
      <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z"></path>
    </svg>
  `,radio:`
    <svg part="checked-icon" class="radio__icon" viewBox="0 0 16 16">
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g fill="currentColor">
          <circle cx="8" cy="8" r="3.42857143"></circle>
        </g>
      </g>
    </svg>
  `,"star-fill":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-star-fill" viewBox="0 0 16 16">
      <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
    </svg>
  `,"x-lg":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
      <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
    </svg>
  `,"x-circle-fill":`
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle-fill" viewBox="0 0 16 16">
      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"></path>
    </svg>
  `},pl={name:"system",resolver:t=>t in ni?`data:image/svg+xml,${encodeURIComponent(ni[t])}`:""},fl=pl,gl=[dl,fl],Gr=[];function ml(t){Gr.push(t)}function bl(t){Gr=Gr.filter(e=>e!==t)}function ii(t){return gl.find(e=>e.name===t)}var vl=xt`
  :host {
    display: inline-block;
    width: 1em;
    height: 1em;
    box-sizing: content-box !important;
  }

  svg {
    display: block;
    height: 100%;
    width: 100%;
  }
`;function ot(t,e){const r=ie({waitUntilFirstUpdate:!1},e);return(n,i)=>{const{update:s}=n,o=Array.isArray(t)?t:[t];n.update=function(l){o.forEach(a=>{const c=a;if(l.has(c)){const u=l.get(c),h=this[c];u!==h&&(!r.waitUntilFirstUpdate||this.hasUpdated)&&this[i](u,h)}}),s.call(this,l)}}}/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const yl=(t,e)=>(t==null?void 0:t._$litType$)!==void 0,wl=t=>t.strings===void 0,xl={},kl=(t,e=xl)=>t._$AH=e;var Ce=Symbol(),Ke=Symbol(),Fr,Nr=new Map,mt=class extends ht{constructor(){super(...arguments),this.initialRender=!1,this.svg=null,this.label="",this.library="default"}async resolveIcon(t,e){var r;let n;if(e!=null&&e.spriteSheet)return this.svg=Q`<svg part="svg">
        <use part="use" href="${t}"></use>
      </svg>`,this.svg;try{if(n=await fetch(t,{mode:"cors"}),!n.ok)return n.status===410?Ce:Ke}catch{return Ke}try{const i=document.createElement("div");i.innerHTML=await n.text();const s=i.firstElementChild;if(((r=s==null?void 0:s.tagName)==null?void 0:r.toLowerCase())!=="svg")return Ce;Fr||(Fr=new DOMParser);const l=Fr.parseFromString(s.outerHTML,"text/html").body.querySelector("svg");return l?(l.part.add("svg"),document.adoptNode(l)):Ce}catch{return Ce}}connectedCallback(){super.connectedCallback(),ml(this)}firstUpdated(){this.initialRender=!0,this.setIcon()}disconnectedCallback(){super.disconnectedCallback(),bl(this)}getIconSource(){const t=ii(this.library);return this.name&&t?{url:t.resolver(this.name),fromLibrary:!0}:{url:this.src,fromLibrary:!1}}handleLabelChange(){typeof this.label=="string"&&this.label.length>0?(this.setAttribute("role","img"),this.setAttribute("aria-label",this.label),this.removeAttribute("aria-hidden")):(this.removeAttribute("role"),this.removeAttribute("aria-label"),this.setAttribute("aria-hidden","true"))}async setIcon(){var t;const{url:e,fromLibrary:r}=this.getIconSource(),n=r?ii(this.library):void 0;if(!e){this.svg=null;return}let i=Nr.get(e);if(i||(i=this.resolveIcon(e,n),Nr.set(e,i)),!this.initialRender)return;const s=await i;if(s===Ke&&Nr.delete(e),e===this.getIconSource().url){if(yl(s)){if(this.svg=s,n){await this.updateComplete;const o=this.shadowRoot.querySelector("[part='svg']");typeof n.mutator=="function"&&o&&n.mutator(o)}return}switch(s){case Ke:case Ce:this.svg=null,this.emit("sl-error");break;default:this.svg=s.cloneNode(!0),(t=n==null?void 0:n.mutator)==null||t.call(n,this.svg),this.emit("sl-load")}}}render(){return this.svg}};mt.styles=[zt,vl];d([ut()],mt.prototype,"svg",2);d([m({reflect:!0})],mt.prototype,"name",2);d([m()],mt.prototype,"src",2);d([m()],mt.prototype,"label",2);d([m({reflect:!0})],mt.prototype,"library",2);d([ot("label")],mt.prototype,"handleLabelChange",1);d([ot(["name","src","library"])],mt.prototype,"setIcon",1);/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Vt={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4},$n=t=>(...e)=>({_$litDirective$:t,values:e});let Cn=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,r,n){this._$Ct=e,this._$AM=r,this._$Ci=n}_$AS(e,r){return this.update(e,r)}update(e,r){return this.render(...r)}};/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ft=$n(class extends Cn{constructor(t){var e;if(super(t),t.type!==Vt.ATTRIBUTE||t.name!=="class"||((e=t.strings)==null?void 0:e.length)>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(t){return" "+Object.keys(t).filter(e=>t[e]).join(" ")+" "}update(t,[e]){var n,i;if(this.st===void 0){this.st=new Set,t.strings!==void 0&&(this.nt=new Set(t.strings.join(" ").split(/\s/).filter(s=>s!=="")));for(const s in e)e[s]&&!((n=this.nt)!=null&&n.has(s))&&this.st.add(s);return this.render(e)}const r=t.element.classList;for(const s of this.st)s in e||(r.remove(s),this.st.delete(s));for(const s in e){const o=!!e[s];o===this.st.has(s)||(i=this.nt)!=null&&i.has(s)||(o?(r.add(s),this.st.add(s)):(r.remove(s),this.st.delete(s)))}return _t}});/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const is=Symbol.for(""),_l=t=>{if((t==null?void 0:t.r)===is)return t==null?void 0:t._$litStatic$},ar=(t,...e)=>({_$litStatic$:e.reduce((r,n,i)=>r+(s=>{if(s._$litStatic$!==void 0)return s._$litStatic$;throw Error(`Value passed to 'literal' function must be a 'literal' result: ${s}. Use 'unsafeStatic' to pass non-literal values, but
            take care to ensure page security.`)})(n)+t[i+1],t[0]),r:is}),si=new Map,$l=t=>(e,...r)=>{const n=r.length;let i,s;const o=[],l=[];let a,c=0,u=!1;for(;c<n;){for(a=e[c];c<n&&(s=r[c],(i=_l(s))!==void 0);)a+=i+e[++c],u=!0;c!==n&&l.push(s),o.push(a),c++}if(c===n&&o.push(e[n]),u){const h=o.join("$$lit$$");(e=si.get(h))===void 0&&(o.raw=o,si.set(h,e=o)),r=l}return t(e,...r)},er=$l(Q);/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const P=t=>t??J;var q=class extends ht{constructor(){super(...arguments),this.formControlController=new Ne(this,{assumeInteractionOn:["click"]}),this.hasSlotController=new He(this,"[default]","prefix","suffix"),this.localize=new se(this),this.hasFocus=!1,this.invalid=!1,this.title="",this.variant="default",this.size="medium",this.caret=!1,this.disabled=!1,this.loading=!1,this.outline=!1,this.pill=!1,this.circle=!1,this.type="button",this.name="",this.value="",this.href="",this.rel="noreferrer noopener"}get validity(){return this.isButton()?this.button.validity:_n}get validationMessage(){return this.isButton()?this.button.validationMessage:""}firstUpdated(){this.isButton()&&this.formControlController.updateValidity()}handleBlur(){this.hasFocus=!1,this.emit("sl-blur")}handleFocus(){this.hasFocus=!0,this.emit("sl-focus")}handleClick(){this.type==="submit"&&this.formControlController.submit(this),this.type==="reset"&&this.formControlController.reset(this)}handleInvalid(t){this.formControlController.setValidity(!1),this.formControlController.emitInvalidEvent(t)}isButton(){return!this.href}isLink(){return!!this.href}handleDisabledChange(){this.isButton()&&this.formControlController.setValidity(this.disabled)}click(){this.button.click()}focus(t){this.button.focus(t)}blur(){this.button.blur()}checkValidity(){return this.isButton()?this.button.checkValidity():!0}getForm(){return this.formControlController.getForm()}reportValidity(){return this.isButton()?this.button.reportValidity():!0}setCustomValidity(t){this.isButton()&&(this.button.setCustomValidity(t),this.formControlController.updateValidity())}render(){const t=this.isLink(),e=t?ar`a`:ar`button`;return er`
      <${e}
        part="base"
        class=${ft({button:!0,"button--default":this.variant==="default","button--primary":this.variant==="primary","button--success":this.variant==="success","button--neutral":this.variant==="neutral","button--warning":this.variant==="warning","button--danger":this.variant==="danger","button--text":this.variant==="text","button--small":this.size==="small","button--medium":this.size==="medium","button--large":this.size==="large","button--caret":this.caret,"button--circle":this.circle,"button--disabled":this.disabled,"button--focused":this.hasFocus,"button--loading":this.loading,"button--standard":!this.outline,"button--outline":this.outline,"button--pill":this.pill,"button--rtl":this.localize.dir()==="rtl","button--has-label":this.hasSlotController.test("[default]"),"button--has-prefix":this.hasSlotController.test("prefix"),"button--has-suffix":this.hasSlotController.test("suffix")})}
        ?disabled=${P(t?void 0:this.disabled)}
        type=${P(t?void 0:this.type)}
        title=${this.title}
        name=${P(t?void 0:this.name)}
        value=${P(t?void 0:this.value)}
        href=${P(t&&!this.disabled?this.href:void 0)}
        target=${P(t?this.target:void 0)}
        download=${P(t?this.download:void 0)}
        rel=${P(t?this.rel:void 0)}
        role=${P(t?void 0:"button")}
        aria-disabled=${this.disabled?"true":"false"}
        tabindex=${this.disabled?"-1":"0"}
        @blur=${this.handleBlur}
        @focus=${this.handleFocus}
        @invalid=${this.isButton()?this.handleInvalid:null}
        @click=${this.handleClick}
      >
        <slot name="prefix" part="prefix" class="button__prefix"></slot>
        <slot part="label" class="button__label"></slot>
        <slot name="suffix" part="suffix" class="button__suffix"></slot>
        ${this.caret?er` <sl-icon part="caret" class="button__caret" library="system" name="caret"></sl-icon> `:""}
        ${this.loading?er`<sl-spinner part="spinner"></sl-spinner>`:""}
      </${e}>
    `}};q.styles=[zt,ul];q.dependencies={"sl-icon":mt,"sl-spinner":ns};d([gt(".button")],q.prototype,"button",2);d([ut()],q.prototype,"hasFocus",2);d([ut()],q.prototype,"invalid",2);d([m()],q.prototype,"title",2);d([m({reflect:!0})],q.prototype,"variant",2);d([m({reflect:!0})],q.prototype,"size",2);d([m({type:Boolean,reflect:!0})],q.prototype,"caret",2);d([m({type:Boolean,reflect:!0})],q.prototype,"disabled",2);d([m({type:Boolean,reflect:!0})],q.prototype,"loading",2);d([m({type:Boolean,reflect:!0})],q.prototype,"outline",2);d([m({type:Boolean,reflect:!0})],q.prototype,"pill",2);d([m({type:Boolean,reflect:!0})],q.prototype,"circle",2);d([m()],q.prototype,"type",2);d([m()],q.prototype,"name",2);d([m()],q.prototype,"value",2);d([m()],q.prototype,"href",2);d([m()],q.prototype,"target",2);d([m()],q.prototype,"rel",2);d([m()],q.prototype,"download",2);d([m()],q.prototype,"form",2);d([m({attribute:"formaction"})],q.prototype,"formAction",2);d([m({attribute:"formenctype"})],q.prototype,"formEnctype",2);d([m({attribute:"formmethod"})],q.prototype,"formMethod",2);d([m({attribute:"formnovalidate",type:Boolean})],q.prototype,"formNoValidate",2);d([m({attribute:"formtarget"})],q.prototype,"formTarget",2);d([ot("disabled",{waitUntilFirstUpdate:!0})],q.prototype,"handleDisabledChange",1);q.define("sl-button");var Cl=xt`
  :host {
    display: inline-block;
  }

  .checkbox {
    position: relative;
    display: inline-flex;
    align-items: flex-start;
    font-family: var(--sl-input-font-family);
    font-weight: var(--sl-input-font-weight);
    color: var(--sl-input-label-color);
    vertical-align: middle;
    cursor: pointer;
  }

  .checkbox--small {
    --toggle-size: var(--sl-toggle-size-small);
    font-size: var(--sl-input-font-size-small);
  }

  .checkbox--medium {
    --toggle-size: var(--sl-toggle-size-medium);
    font-size: var(--sl-input-font-size-medium);
  }

  .checkbox--large {
    --toggle-size: var(--sl-toggle-size-large);
    font-size: var(--sl-input-font-size-large);
  }

  .checkbox__control {
    flex: 0 0 auto;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--toggle-size);
    height: var(--toggle-size);
    border: solid var(--sl-input-border-width) var(--sl-input-border-color);
    border-radius: 2px;
    background-color: var(--sl-input-background-color);
    color: var(--sl-color-neutral-0);
    transition:
      var(--sl-transition-fast) border-color,
      var(--sl-transition-fast) background-color,
      var(--sl-transition-fast) color,
      var(--sl-transition-fast) box-shadow;
  }

  .checkbox__input {
    position: absolute;
    opacity: 0;
    padding: 0;
    margin: 0;
    pointer-events: none;
  }

  .checkbox__checked-icon,
  .checkbox__indeterminate-icon {
    display: inline-flex;
    width: var(--toggle-size);
    height: var(--toggle-size);
  }

  /* Hover */
  .checkbox:not(.checkbox--checked):not(.checkbox--disabled) .checkbox__control:hover {
    border-color: var(--sl-input-border-color-hover);
    background-color: var(--sl-input-background-color-hover);
  }

  /* Focus */
  .checkbox:not(.checkbox--checked):not(.checkbox--disabled) .checkbox__input:focus-visible ~ .checkbox__control {
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }

  /* Checked/indeterminate */
  .checkbox--checked .checkbox__control,
  .checkbox--indeterminate .checkbox__control {
    border-color: var(--sl-color-primary-600);
    background-color: var(--sl-color-primary-600);
  }

  /* Checked/indeterminate + hover */
  .checkbox.checkbox--checked:not(.checkbox--disabled) .checkbox__control:hover,
  .checkbox.checkbox--indeterminate:not(.checkbox--disabled) .checkbox__control:hover {
    border-color: var(--sl-color-primary-500);
    background-color: var(--sl-color-primary-500);
  }

  /* Checked/indeterminate + focus */
  .checkbox.checkbox--checked:not(.checkbox--disabled) .checkbox__input:focus-visible ~ .checkbox__control,
  .checkbox.checkbox--indeterminate:not(.checkbox--disabled) .checkbox__input:focus-visible ~ .checkbox__control {
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }

  /* Disabled */
  .checkbox--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .checkbox__label {
    display: inline-block;
    color: var(--sl-input-label-color);
    line-height: var(--toggle-size);
    margin-inline-start: 0.5em;
    user-select: none;
    -webkit-user-select: none;
  }

  :host([required]) .checkbox__label::after {
    content: var(--sl-input-required-content);
    color: var(--sl-input-required-content-color);
    margin-inline-start: var(--sl-input-required-content-offset);
  }
`,Sn=(t="value")=>(e,r)=>{const n=e.constructor,i=n.prototype.attributeChangedCallback;n.prototype.attributeChangedCallback=function(s,o,l){var a;const c=n.getPropertyOptions(t),u=typeof c.attribute=="string"?c.attribute:t;if(s===u){const h=c.converter||pe,g=(typeof h=="function"?h:(a=h==null?void 0:h.fromAttribute)!=null?a:pe.fromAttribute)(l,c.type);this[t]!==g&&(this[r]=g)}i.call(this,s,o,l)}},xr=xt`
  .form-control .form-control__label {
    display: none;
  }

  .form-control .form-control__help-text {
    display: none;
  }

  /* Label */
  .form-control--has-label .form-control__label {
    display: inline-block;
    color: var(--sl-input-label-color);
    margin-bottom: var(--sl-spacing-3x-small);
  }

  .form-control--has-label.form-control--small .form-control__label {
    font-size: var(--sl-input-label-font-size-small);
  }

  .form-control--has-label.form-control--medium .form-control__label {
    font-size: var(--sl-input-label-font-size-medium);
  }

  .form-control--has-label.form-control--large .form-control__label {
    font-size: var(--sl-input-label-font-size-large);
  }

  :host([required]) .form-control--has-label .form-control__label::after {
    content: var(--sl-input-required-content);
    margin-inline-start: var(--sl-input-required-content-offset);
    color: var(--sl-input-required-content-color);
  }

  /* Help text */
  .form-control--has-help-text .form-control__help-text {
    display: block;
    color: var(--sl-input-help-text-color);
    margin-top: var(--sl-spacing-3x-small);
  }

  .form-control--has-help-text.form-control--small .form-control__help-text {
    font-size: var(--sl-input-help-text-font-size-small);
  }

  .form-control--has-help-text.form-control--medium .form-control__help-text {
    font-size: var(--sl-input-help-text-font-size-medium);
  }

  .form-control--has-help-text.form-control--large .form-control__help-text {
    font-size: var(--sl-input-help-text-font-size-large);
  }

  .form-control--has-help-text.form-control--radio-group .form-control__help-text {
    margin-top: var(--sl-spacing-2x-small);
  }
`;/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const cr=$n(class extends Cn{constructor(t){if(super(t),t.type!==Vt.PROPERTY&&t.type!==Vt.ATTRIBUTE&&t.type!==Vt.BOOLEAN_ATTRIBUTE)throw Error("The `live` directive is not allowed on child or event bindings");if(!wl(t))throw Error("`live` bindings can only contain a single expression")}render(t){return t}update(t,[e]){if(e===_t||e===J)return e;const r=t.element,n=t.name;if(t.type===Vt.PROPERTY){if(e===r[n])return _t}else if(t.type===Vt.BOOLEAN_ATTRIBUTE){if(!!e===r.hasAttribute(n))return _t}else if(t.type===Vt.ATTRIBUTE&&r.getAttribute(n)===e+"")return _t;return kl(t),e}});var st=class extends ht{constructor(){super(...arguments),this.formControlController=new Ne(this,{value:t=>t.checked?t.value||"on":void 0,defaultValue:t=>t.defaultChecked,setValue:(t,e)=>t.checked=e}),this.hasSlotController=new He(this,"help-text"),this.hasFocus=!1,this.title="",this.name="",this.size="medium",this.disabled=!1,this.checked=!1,this.indeterminate=!1,this.defaultChecked=!1,this.form="",this.required=!1,this.helpText=""}get validity(){return this.input.validity}get validationMessage(){return this.input.validationMessage}firstUpdated(){this.formControlController.updateValidity()}handleClick(){this.checked=!this.checked,this.indeterminate=!1,this.emit("sl-change")}handleBlur(){this.hasFocus=!1,this.emit("sl-blur")}handleInput(){this.emit("sl-input")}handleInvalid(t){this.formControlController.setValidity(!1),this.formControlController.emitInvalidEvent(t)}handleFocus(){this.hasFocus=!0,this.emit("sl-focus")}handleDisabledChange(){this.formControlController.setValidity(this.disabled)}handleStateChange(){this.input.checked=this.checked,this.input.indeterminate=this.indeterminate,this.formControlController.updateValidity()}click(){this.input.click()}focus(t){this.input.focus(t)}blur(){this.input.blur()}checkValidity(){return this.input.checkValidity()}getForm(){return this.formControlController.getForm()}reportValidity(){return this.input.reportValidity()}setCustomValidity(t){this.input.setCustomValidity(t),this.formControlController.updateValidity()}render(){const t=this.hasSlotController.test("help-text"),e=this.helpText?!0:!!t;return Q`
      <div
        class=${ft({"form-control":!0,"form-control--small":this.size==="small","form-control--medium":this.size==="medium","form-control--large":this.size==="large","form-control--has-help-text":e})}
      >
        <label
          part="base"
          class=${ft({checkbox:!0,"checkbox--checked":this.checked,"checkbox--disabled":this.disabled,"checkbox--focused":this.hasFocus,"checkbox--indeterminate":this.indeterminate,"checkbox--small":this.size==="small","checkbox--medium":this.size==="medium","checkbox--large":this.size==="large"})}
        >
          <input
            class="checkbox__input"
            type="checkbox"
            title=${this.title}
            name=${this.name}
            value=${P(this.value)}
            .indeterminate=${cr(this.indeterminate)}
            .checked=${cr(this.checked)}
            .disabled=${this.disabled}
            .required=${this.required}
            aria-checked=${this.checked?"true":"false"}
            aria-describedby="help-text"
            @click=${this.handleClick}
            @input=${this.handleInput}
            @invalid=${this.handleInvalid}
            @blur=${this.handleBlur}
            @focus=${this.handleFocus}
          />

          <span
            part="control${this.checked?" control--checked":""}${this.indeterminate?" control--indeterminate":""}"
            class="checkbox__control"
          >
            ${this.checked?Q`
                  <sl-icon part="checked-icon" class="checkbox__checked-icon" library="system" name="check"></sl-icon>
                `:""}
            ${!this.checked&&this.indeterminate?Q`
                  <sl-icon
                    part="indeterminate-icon"
                    class="checkbox__indeterminate-icon"
                    library="system"
                    name="indeterminate"
                  ></sl-icon>
                `:""}
          </span>

          <div part="label" class="checkbox__label">
            <slot></slot>
          </div>
        </label>

        <div
          aria-hidden=${e?"false":"true"}
          class="form-control__help-text"
          id="help-text"
          part="form-control-help-text"
        >
          <slot name="help-text">${this.helpText}</slot>
        </div>
      </div>
    `}};st.styles=[zt,xr,Cl];st.dependencies={"sl-icon":mt};d([gt('input[type="checkbox"]')],st.prototype,"input",2);d([ut()],st.prototype,"hasFocus",2);d([m()],st.prototype,"title",2);d([m()],st.prototype,"name",2);d([m()],st.prototype,"value",2);d([m({reflect:!0})],st.prototype,"size",2);d([m({type:Boolean,reflect:!0})],st.prototype,"disabled",2);d([m({type:Boolean,reflect:!0})],st.prototype,"checked",2);d([m({type:Boolean,reflect:!0})],st.prototype,"indeterminate",2);d([Sn("checked")],st.prototype,"defaultChecked",2);d([m({reflect:!0})],st.prototype,"form",2);d([m({type:Boolean,reflect:!0})],st.prototype,"required",2);d([m({attribute:"help-text"})],st.prototype,"helpText",2);d([ot("disabled",{waitUntilFirstUpdate:!0})],st.prototype,"handleDisabledChange",1);d([ot(["checked","indeterminate"],{waitUntilFirstUpdate:!0})],st.prototype,"handleStateChange",1);st.define("sl-checkbox");var Sl=xt`
  :host {
    display: block;
  }

  .input {
    flex: 1 1 auto;
    display: inline-flex;
    align-items: stretch;
    justify-content: start;
    position: relative;
    width: 100%;
    font-family: var(--sl-input-font-family);
    font-weight: var(--sl-input-font-weight);
    letter-spacing: var(--sl-input-letter-spacing);
    vertical-align: middle;
    overflow: hidden;
    cursor: text;
    transition:
      var(--sl-transition-fast) color,
      var(--sl-transition-fast) border,
      var(--sl-transition-fast) box-shadow,
      var(--sl-transition-fast) background-color;
  }

  /* Standard inputs */
  .input--standard {
    background-color: var(--sl-input-background-color);
    border: solid var(--sl-input-border-width) var(--sl-input-border-color);
  }

  .input--standard:hover:not(.input--disabled) {
    background-color: var(--sl-input-background-color-hover);
    border-color: var(--sl-input-border-color-hover);
  }

  .input--standard.input--focused:not(.input--disabled) {
    background-color: var(--sl-input-background-color-focus);
    border-color: var(--sl-input-border-color-focus);
    box-shadow: 0 0 0 var(--sl-focus-ring-width) var(--sl-input-focus-ring-color);
  }

  .input--standard.input--focused:not(.input--disabled) .input__control {
    color: var(--sl-input-color-focus);
  }

  .input--standard.input--disabled {
    background-color: var(--sl-input-background-color-disabled);
    border-color: var(--sl-input-border-color-disabled);
    opacity: 0.5;
    cursor: not-allowed;
  }

  .input--standard.input--disabled .input__control {
    color: var(--sl-input-color-disabled);
  }

  .input--standard.input--disabled .input__control::placeholder {
    color: var(--sl-input-placeholder-color-disabled);
  }

  /* Filled inputs */
  .input--filled {
    border: none;
    background-color: var(--sl-input-filled-background-color);
    color: var(--sl-input-color);
  }

  .input--filled:hover:not(.input--disabled) {
    background-color: var(--sl-input-filled-background-color-hover);
  }

  .input--filled.input--focused:not(.input--disabled) {
    background-color: var(--sl-input-filled-background-color-focus);
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }

  .input--filled.input--disabled {
    background-color: var(--sl-input-filled-background-color-disabled);
    opacity: 0.5;
    cursor: not-allowed;
  }

  .input__control {
    flex: 1 1 auto;
    font-family: inherit;
    font-size: inherit;
    font-weight: inherit;
    min-width: 0;
    height: 100%;
    color: var(--sl-input-color);
    border: none;
    background: inherit;
    box-shadow: none;
    padding: 0;
    margin: 0;
    cursor: inherit;
    -webkit-appearance: none;
  }

  .input__control::-webkit-search-decoration,
  .input__control::-webkit-search-cancel-button,
  .input__control::-webkit-search-results-button,
  .input__control::-webkit-search-results-decoration {
    -webkit-appearance: none;
  }

  .input__control:-webkit-autofill,
  .input__control:-webkit-autofill:hover,
  .input__control:-webkit-autofill:focus,
  .input__control:-webkit-autofill:active {
    box-shadow: 0 0 0 var(--sl-input-height-large) var(--sl-input-background-color-hover) inset !important;
    -webkit-text-fill-color: var(--sl-color-primary-500);
    caret-color: var(--sl-input-color);
  }

  .input--filled .input__control:-webkit-autofill,
  .input--filled .input__control:-webkit-autofill:hover,
  .input--filled .input__control:-webkit-autofill:focus,
  .input--filled .input__control:-webkit-autofill:active {
    box-shadow: 0 0 0 var(--sl-input-height-large) var(--sl-input-filled-background-color) inset !important;
  }

  .input__control::placeholder {
    color: var(--sl-input-placeholder-color);
    user-select: none;
    -webkit-user-select: none;
  }

  .input:hover:not(.input--disabled) .input__control {
    color: var(--sl-input-color-hover);
  }

  .input__control:focus {
    outline: none;
  }

  .input__prefix,
  .input__suffix {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    cursor: default;
  }

  .input__prefix ::slotted(sl-icon),
  .input__suffix ::slotted(sl-icon) {
    color: var(--sl-input-icon-color);
  }

  /*
   * Size modifiers
   */

  .input--small {
    border-radius: var(--sl-input-border-radius-small);
    font-size: var(--sl-input-font-size-small);
    height: var(--sl-input-height-small);
  }

  .input--small .input__control {
    height: calc(var(--sl-input-height-small) - var(--sl-input-border-width) * 2);
    padding: 0 var(--sl-input-spacing-small);
  }

  .input--small .input__clear,
  .input--small .input__password-toggle {
    width: calc(1em + var(--sl-input-spacing-small) * 2);
  }

  .input--small .input__prefix ::slotted(*) {
    margin-inline-start: var(--sl-input-spacing-small);
  }

  .input--small .input__suffix ::slotted(*) {
    margin-inline-end: var(--sl-input-spacing-small);
  }

  .input--medium {
    border-radius: var(--sl-input-border-radius-medium);
    font-size: var(--sl-input-font-size-medium);
    height: var(--sl-input-height-medium);
  }

  .input--medium .input__control {
    height: calc(var(--sl-input-height-medium) - var(--sl-input-border-width) * 2);
    padding: 0 var(--sl-input-spacing-medium);
  }

  .input--medium .input__clear,
  .input--medium .input__password-toggle {
    width: calc(1em + var(--sl-input-spacing-medium) * 2);
  }

  .input--medium .input__prefix ::slotted(*) {
    margin-inline-start: var(--sl-input-spacing-medium);
  }

  .input--medium .input__suffix ::slotted(*) {
    margin-inline-end: var(--sl-input-spacing-medium);
  }

  .input--large {
    border-radius: var(--sl-input-border-radius-large);
    font-size: var(--sl-input-font-size-large);
    height: var(--sl-input-height-large);
  }

  .input--large .input__control {
    height: calc(var(--sl-input-height-large) - var(--sl-input-border-width) * 2);
    padding: 0 var(--sl-input-spacing-large);
  }

  .input--large .input__clear,
  .input--large .input__password-toggle {
    width: calc(1em + var(--sl-input-spacing-large) * 2);
  }

  .input--large .input__prefix ::slotted(*) {
    margin-inline-start: var(--sl-input-spacing-large);
  }

  .input--large .input__suffix ::slotted(*) {
    margin-inline-end: var(--sl-input-spacing-large);
  }

  /*
   * Pill modifier
   */

  .input--pill.input--small {
    border-radius: var(--sl-input-height-small);
  }

  .input--pill.input--medium {
    border-radius: var(--sl-input-height-medium);
  }

  .input--pill.input--large {
    border-radius: var(--sl-input-height-large);
  }

  /*
   * Clearable + Password Toggle
   */

  .input__clear,
  .input__password-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: inherit;
    color: var(--sl-input-icon-color);
    border: none;
    background: none;
    padding: 0;
    transition: var(--sl-transition-fast) color;
    cursor: pointer;
  }

  .input__clear:hover,
  .input__password-toggle:hover {
    color: var(--sl-input-icon-color-hover);
  }

  .input__clear:focus,
  .input__password-toggle:focus {
    outline: none;
  }

  /* Don't show the browser's password toggle in Edge */
  ::-ms-reveal {
    display: none;
  }

  /* Hide the built-in number spinner */
  .input--no-spin-buttons input[type='number']::-webkit-outer-spin-button,
  .input--no-spin-buttons input[type='number']::-webkit-inner-spin-button {
    -webkit-appearance: none;
    display: none;
  }

  .input--no-spin-buttons input[type='number'] {
    -moz-appearance: textfield;
  }
`,B=class extends ht{constructor(){super(...arguments),this.formControlController=new Ne(this,{assumeInteractionOn:["sl-blur","sl-input"]}),this.hasSlotController=new He(this,"help-text","label"),this.localize=new se(this),this.hasFocus=!1,this.title="",this.__numberInput=Object.assign(document.createElement("input"),{type:"number"}),this.__dateInput=Object.assign(document.createElement("input"),{type:"date"}),this.type="text",this.name="",this.value="",this.defaultValue="",this.size="medium",this.filled=!1,this.pill=!1,this.label="",this.helpText="",this.clearable=!1,this.disabled=!1,this.placeholder="",this.readonly=!1,this.passwordToggle=!1,this.passwordVisible=!1,this.noSpinButtons=!1,this.form="",this.required=!1,this.spellcheck=!0}get valueAsDate(){var t;return this.__dateInput.type=this.type,this.__dateInput.value=this.value,((t=this.input)==null?void 0:t.valueAsDate)||this.__dateInput.valueAsDate}set valueAsDate(t){this.__dateInput.type=this.type,this.__dateInput.valueAsDate=t,this.value=this.__dateInput.value}get valueAsNumber(){var t;return this.__numberInput.value=this.value,((t=this.input)==null?void 0:t.valueAsNumber)||this.__numberInput.valueAsNumber}set valueAsNumber(t){this.__numberInput.valueAsNumber=t,this.value=this.__numberInput.value}get validity(){return this.input.validity}get validationMessage(){return this.input.validationMessage}firstUpdated(){this.formControlController.updateValidity()}handleBlur(){this.hasFocus=!1,this.emit("sl-blur")}handleChange(){this.value=this.input.value,this.emit("sl-change")}handleClearClick(t){t.preventDefault(),this.value!==""&&(this.value="",this.emit("sl-clear"),this.emit("sl-input"),this.emit("sl-change")),this.input.focus()}handleFocus(){this.hasFocus=!0,this.emit("sl-focus")}handleInput(){this.value=this.input.value,this.formControlController.updateValidity(),this.emit("sl-input")}handleInvalid(t){this.formControlController.setValidity(!1),this.formControlController.emitInvalidEvent(t)}handleKeyDown(t){const e=t.metaKey||t.ctrlKey||t.shiftKey||t.altKey;t.key==="Enter"&&!e&&setTimeout(()=>{!t.defaultPrevented&&!t.isComposing&&this.formControlController.submit()})}handlePasswordToggle(){this.passwordVisible=!this.passwordVisible}handleDisabledChange(){this.formControlController.setValidity(this.disabled)}handleStepChange(){this.input.step=String(this.step),this.formControlController.updateValidity()}async handleValueChange(){await this.updateComplete,this.formControlController.updateValidity()}focus(t){this.input.focus(t)}blur(){this.input.blur()}select(){this.input.select()}setSelectionRange(t,e,r="none"){this.input.setSelectionRange(t,e,r)}setRangeText(t,e,r,n="preserve"){const i=e??this.input.selectionStart,s=r??this.input.selectionEnd;this.input.setRangeText(t,i,s,n),this.value!==this.input.value&&(this.value=this.input.value)}showPicker(){"showPicker"in HTMLInputElement.prototype&&this.input.showPicker()}stepUp(){this.input.stepUp(),this.value!==this.input.value&&(this.value=this.input.value)}stepDown(){this.input.stepDown(),this.value!==this.input.value&&(this.value=this.input.value)}checkValidity(){return this.input.checkValidity()}getForm(){return this.formControlController.getForm()}reportValidity(){return this.input.reportValidity()}setCustomValidity(t){this.input.setCustomValidity(t),this.formControlController.updateValidity()}render(){const t=this.hasSlotController.test("label"),e=this.hasSlotController.test("help-text"),r=this.label?!0:!!t,n=this.helpText?!0:!!e,s=this.clearable&&!this.disabled&&!this.readonly&&(typeof this.value=="number"||this.value.length>0);return Q`
      <div
        part="form-control"
        class=${ft({"form-control":!0,"form-control--small":this.size==="small","form-control--medium":this.size==="medium","form-control--large":this.size==="large","form-control--has-label":r,"form-control--has-help-text":n})}
      >
        <label
          part="form-control-label"
          class="form-control__label"
          for="input"
          aria-hidden=${r?"false":"true"}
        >
          <slot name="label">${this.label}</slot>
        </label>

        <div part="form-control-input" class="form-control-input">
          <div
            part="base"
            class=${ft({input:!0,"input--small":this.size==="small","input--medium":this.size==="medium","input--large":this.size==="large","input--pill":this.pill,"input--standard":!this.filled,"input--filled":this.filled,"input--disabled":this.disabled,"input--focused":this.hasFocus,"input--empty":!this.value,"input--no-spin-buttons":this.noSpinButtons})}
          >
            <span part="prefix" class="input__prefix">
              <slot name="prefix"></slot>
            </span>

            <input
              part="input"
              id="input"
              class="input__control"
              type=${this.type==="password"&&this.passwordVisible?"text":this.type}
              title=${this.title}
              name=${P(this.name)}
              ?disabled=${this.disabled}
              ?readonly=${this.readonly}
              ?required=${this.required}
              placeholder=${P(this.placeholder)}
              minlength=${P(this.minlength)}
              maxlength=${P(this.maxlength)}
              min=${P(this.min)}
              max=${P(this.max)}
              step=${P(this.step)}
              .value=${cr(this.value)}
              autocapitalize=${P(this.autocapitalize)}
              autocomplete=${P(this.autocomplete)}
              autocorrect=${P(this.autocorrect)}
              ?autofocus=${this.autofocus}
              spellcheck=${this.spellcheck}
              pattern=${P(this.pattern)}
              enterkeyhint=${P(this.enterkeyhint)}
              inputmode=${P(this.inputmode)}
              aria-describedby="help-text"
              @change=${this.handleChange}
              @input=${this.handleInput}
              @invalid=${this.handleInvalid}
              @keydown=${this.handleKeyDown}
              @focus=${this.handleFocus}
              @blur=${this.handleBlur}
            />

            ${s?Q`
                  <button
                    part="clear-button"
                    class="input__clear"
                    type="button"
                    aria-label=${this.localize.term("clearEntry")}
                    @click=${this.handleClearClick}
                    tabindex="-1"
                  >
                    <slot name="clear-icon">
                      <sl-icon name="x-circle-fill" library="system"></sl-icon>
                    </slot>
                  </button>
                `:""}
            ${this.passwordToggle&&!this.disabled?Q`
                  <button
                    part="password-toggle-button"
                    class="input__password-toggle"
                    type="button"
                    aria-label=${this.localize.term(this.passwordVisible?"hidePassword":"showPassword")}
                    @click=${this.handlePasswordToggle}
                    tabindex="-1"
                  >
                    ${this.passwordVisible?Q`
                          <slot name="show-password-icon">
                            <sl-icon name="eye-slash" library="system"></sl-icon>
                          </slot>
                        `:Q`
                          <slot name="hide-password-icon">
                            <sl-icon name="eye" library="system"></sl-icon>
                          </slot>
                        `}
                  </button>
                `:""}

            <span part="suffix" class="input__suffix">
              <slot name="suffix"></slot>
            </span>
          </div>
        </div>

        <div
          part="form-control-help-text"
          id="help-text"
          class="form-control__help-text"
          aria-hidden=${n?"false":"true"}
        >
          <slot name="help-text">${this.helpText}</slot>
        </div>
      </div>
    `}};B.styles=[zt,xr,Sl];B.dependencies={"sl-icon":mt};d([gt(".input__control")],B.prototype,"input",2);d([ut()],B.prototype,"hasFocus",2);d([m()],B.prototype,"title",2);d([m({reflect:!0})],B.prototype,"type",2);d([m()],B.prototype,"name",2);d([m()],B.prototype,"value",2);d([Sn()],B.prototype,"defaultValue",2);d([m({reflect:!0})],B.prototype,"size",2);d([m({type:Boolean,reflect:!0})],B.prototype,"filled",2);d([m({type:Boolean,reflect:!0})],B.prototype,"pill",2);d([m()],B.prototype,"label",2);d([m({attribute:"help-text"})],B.prototype,"helpText",2);d([m({type:Boolean})],B.prototype,"clearable",2);d([m({type:Boolean,reflect:!0})],B.prototype,"disabled",2);d([m()],B.prototype,"placeholder",2);d([m({type:Boolean,reflect:!0})],B.prototype,"readonly",2);d([m({attribute:"password-toggle",type:Boolean})],B.prototype,"passwordToggle",2);d([m({attribute:"password-visible",type:Boolean})],B.prototype,"passwordVisible",2);d([m({attribute:"no-spin-buttons",type:Boolean})],B.prototype,"noSpinButtons",2);d([m({reflect:!0})],B.prototype,"form",2);d([m({type:Boolean,reflect:!0})],B.prototype,"required",2);d([m()],B.prototype,"pattern",2);d([m({type:Number})],B.prototype,"minlength",2);d([m({type:Number})],B.prototype,"maxlength",2);d([m()],B.prototype,"min",2);d([m()],B.prototype,"max",2);d([m()],B.prototype,"step",2);d([m()],B.prototype,"autocapitalize",2);d([m()],B.prototype,"autocorrect",2);d([m()],B.prototype,"autocomplete",2);d([m({type:Boolean})],B.prototype,"autofocus",2);d([m()],B.prototype,"enterkeyhint",2);d([m({type:Boolean,converter:{fromAttribute:t=>!(!t||t==="false"),toAttribute:t=>t?"true":"false"}})],B.prototype,"spellcheck",2);d([m()],B.prototype,"inputmode",2);d([ot("disabled",{waitUntilFirstUpdate:!0})],B.prototype,"handleDisabledChange",1);d([ot("step",{waitUntilFirstUpdate:!0})],B.prototype,"handleStepChange",1);d([ot("value",{waitUntilFirstUpdate:!0})],B.prototype,"handleValueChange",1);B.define("sl-input");var Al=xt`
  :host {
    display: block;
    user-select: none;
    -webkit-user-select: none;
  }

  :host(:focus) {
    outline: none;
  }

  .option {
    position: relative;
    display: flex;
    align-items: center;
    font-family: var(--sl-font-sans);
    font-size: var(--sl-font-size-medium);
    font-weight: var(--sl-font-weight-normal);
    line-height: var(--sl-line-height-normal);
    letter-spacing: var(--sl-letter-spacing-normal);
    color: var(--sl-color-neutral-700);
    padding: var(--sl-spacing-x-small) var(--sl-spacing-medium) var(--sl-spacing-x-small) var(--sl-spacing-x-small);
    transition: var(--sl-transition-fast) fill;
    cursor: pointer;
  }

  .option--hover:not(.option--current):not(.option--disabled) {
    background-color: var(--sl-color-neutral-100);
    color: var(--sl-color-neutral-1000);
  }

  .option--current,
  .option--current.option--disabled {
    background-color: var(--sl-color-primary-600);
    color: var(--sl-color-neutral-0);
    opacity: 1;
  }

  .option--disabled {
    outline: none;
    opacity: 0.5;
    cursor: not-allowed;
  }

  .option__label {
    flex: 1 1 auto;
    display: inline-block;
    line-height: var(--sl-line-height-dense);
  }

  .option .option__check {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    visibility: hidden;
    padding-inline-end: var(--sl-spacing-2x-small);
  }

  .option--selected .option__check {
    visibility: visible;
  }

  .option__prefix,
  .option__suffix {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
  }

  .option__prefix::slotted(*) {
    margin-inline-end: var(--sl-spacing-x-small);
  }

  .option__suffix::slotted(*) {
    margin-inline-start: var(--sl-spacing-x-small);
  }

  @media (forced-colors: active) {
    :host(:hover:not([aria-disabled='true'])) .option {
      outline: dashed 1px SelectedItem;
      outline-offset: -1px;
    }
  }
`,$t=class extends ht{constructor(){super(...arguments),this.localize=new se(this),this.isInitialized=!1,this.current=!1,this.selected=!1,this.hasHover=!1,this.value="",this.disabled=!1}connectedCallback(){super.connectedCallback(),this.setAttribute("role","option"),this.setAttribute("aria-selected","false")}handleDefaultSlotChange(){this.isInitialized?customElements.whenDefined("sl-select").then(()=>{const t=this.closest("sl-select");t&&t.handleDefaultSlotChange()}):this.isInitialized=!0}handleMouseEnter(){this.hasHover=!0}handleMouseLeave(){this.hasHover=!1}handleDisabledChange(){this.setAttribute("aria-disabled",this.disabled?"true":"false")}handleSelectedChange(){this.setAttribute("aria-selected",this.selected?"true":"false")}handleValueChange(){typeof this.value!="string"&&(this.value=String(this.value)),this.value.includes(" ")&&(console.error("Option values cannot include a space. All spaces have been replaced with underscores.",this),this.value=this.value.replace(/ /g,"_"))}getTextLabel(){const t=this.childNodes;let e="";return[...t].forEach(r=>{r.nodeType===Node.ELEMENT_NODE&&(r.hasAttribute("slot")||(e+=r.textContent)),r.nodeType===Node.TEXT_NODE&&(e+=r.textContent)}),e.trim()}render(){return Q`
      <div
        part="base"
        class=${ft({option:!0,"option--current":this.current,"option--disabled":this.disabled,"option--selected":this.selected,"option--hover":this.hasHover})}
        @mouseenter=${this.handleMouseEnter}
        @mouseleave=${this.handleMouseLeave}
      >
        <sl-icon part="checked-icon" class="option__check" name="check" library="system" aria-hidden="true"></sl-icon>
        <slot part="prefix" name="prefix" class="option__prefix"></slot>
        <slot part="label" class="option__label" @slotchange=${this.handleDefaultSlotChange}></slot>
        <slot part="suffix" name="suffix" class="option__suffix"></slot>
      </div>
    `}};$t.styles=[zt,Al];$t.dependencies={"sl-icon":mt};d([gt(".option__label")],$t.prototype,"defaultSlot",2);d([ut()],$t.prototype,"current",2);d([ut()],$t.prototype,"selected",2);d([ut()],$t.prototype,"hasHover",2);d([m({reflect:!0})],$t.prototype,"value",2);d([m({type:Boolean,reflect:!0})],$t.prototype,"disabled",2);d([ot("disabled")],$t.prototype,"handleDisabledChange",1);d([ot("selected")],$t.prototype,"handleSelectedChange",1);d([ot("value")],$t.prototype,"handleValueChange",1);$t.define("sl-option");var El=xt`
  :host {
    display: inline-block;
  }

  .tag {
    display: flex;
    align-items: center;
    border: solid 1px;
    line-height: 1;
    white-space: nowrap;
    user-select: none;
    -webkit-user-select: none;
  }

  .tag__remove::part(base) {
    color: inherit;
    padding: 0;
  }

  /*
   * Variant modifiers
   */

  .tag--primary {
    background-color: var(--sl-color-primary-50);
    border-color: var(--sl-color-primary-200);
    color: var(--sl-color-primary-800);
  }

  .tag--primary:active > sl-icon-button {
    color: var(--sl-color-primary-600);
  }

  .tag--success {
    background-color: var(--sl-color-success-50);
    border-color: var(--sl-color-success-200);
    color: var(--sl-color-success-800);
  }

  .tag--success:active > sl-icon-button {
    color: var(--sl-color-success-600);
  }

  .tag--neutral {
    background-color: var(--sl-color-neutral-50);
    border-color: var(--sl-color-neutral-200);
    color: var(--sl-color-neutral-800);
  }

  .tag--neutral:active > sl-icon-button {
    color: var(--sl-color-neutral-600);
  }

  .tag--warning {
    background-color: var(--sl-color-warning-50);
    border-color: var(--sl-color-warning-200);
    color: var(--sl-color-warning-800);
  }

  .tag--warning:active > sl-icon-button {
    color: var(--sl-color-warning-600);
  }

  .tag--danger {
    background-color: var(--sl-color-danger-50);
    border-color: var(--sl-color-danger-200);
    color: var(--sl-color-danger-800);
  }

  .tag--danger:active > sl-icon-button {
    color: var(--sl-color-danger-600);
  }

  /*
   * Size modifiers
   */

  .tag--small {
    font-size: var(--sl-button-font-size-small);
    height: calc(var(--sl-input-height-small) * 0.8);
    line-height: calc(var(--sl-input-height-small) - var(--sl-input-border-width) * 2);
    border-radius: var(--sl-input-border-radius-small);
    padding: 0 var(--sl-spacing-x-small);
  }

  .tag--medium {
    font-size: var(--sl-button-font-size-medium);
    height: calc(var(--sl-input-height-medium) * 0.8);
    line-height: calc(var(--sl-input-height-medium) - var(--sl-input-border-width) * 2);
    border-radius: var(--sl-input-border-radius-medium);
    padding: 0 var(--sl-spacing-small);
  }

  .tag--large {
    font-size: var(--sl-button-font-size-large);
    height: calc(var(--sl-input-height-large) * 0.8);
    line-height: calc(var(--sl-input-height-large) - var(--sl-input-border-width) * 2);
    border-radius: var(--sl-input-border-radius-large);
    padding: 0 var(--sl-spacing-medium);
  }

  .tag__remove {
    margin-inline-start: var(--sl-spacing-x-small);
  }

  /*
   * Pill modifier
   */

  .tag--pill {
    border-radius: var(--sl-border-radius-pill);
  }
`,zl=xt`
  :host {
    display: inline-block;
    color: var(--sl-color-neutral-600);
  }

  .icon-button {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    background: none;
    border: none;
    border-radius: var(--sl-border-radius-medium);
    font-size: inherit;
    color: inherit;
    padding: var(--sl-spacing-x-small);
    cursor: pointer;
    transition: var(--sl-transition-x-fast) color;
    -webkit-appearance: none;
  }

  .icon-button:hover:not(.icon-button--disabled),
  .icon-button:focus-visible:not(.icon-button--disabled) {
    color: var(--sl-color-primary-600);
  }

  .icon-button:active:not(.icon-button--disabled) {
    color: var(--sl-color-primary-700);
  }

  .icon-button:focus {
    outline: none;
  }

  .icon-button--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .icon-button:focus-visible {
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }

  .icon-button__icon {
    pointer-events: none;
  }
`,kt=class extends ht{constructor(){super(...arguments),this.hasFocus=!1,this.label="",this.disabled=!1}handleBlur(){this.hasFocus=!1,this.emit("sl-blur")}handleFocus(){this.hasFocus=!0,this.emit("sl-focus")}handleClick(t){this.disabled&&(t.preventDefault(),t.stopPropagation())}click(){this.button.click()}focus(t){this.button.focus(t)}blur(){this.button.blur()}render(){const t=!!this.href,e=t?ar`a`:ar`button`;return er`
      <${e}
        part="base"
        class=${ft({"icon-button":!0,"icon-button--disabled":!t&&this.disabled,"icon-button--focused":this.hasFocus})}
        ?disabled=${P(t?void 0:this.disabled)}
        type=${P(t?void 0:"button")}
        href=${P(t?this.href:void 0)}
        target=${P(t?this.target:void 0)}
        download=${P(t?this.download:void 0)}
        rel=${P(t&&this.target?"noreferrer noopener":void 0)}
        role=${P(t?void 0:"button")}
        aria-disabled=${this.disabled?"true":"false"}
        aria-label="${this.label}"
        tabindex=${this.disabled?"-1":"0"}
        @blur=${this.handleBlur}
        @focus=${this.handleFocus}
        @click=${this.handleClick}
      >
        <sl-icon
          class="icon-button__icon"
          name=${P(this.name)}
          library=${P(this.library)}
          src=${P(this.src)}
          aria-hidden="true"
        ></sl-icon>
      </${e}>
    `}};kt.styles=[zt,zl];kt.dependencies={"sl-icon":mt};d([gt(".icon-button")],kt.prototype,"button",2);d([ut()],kt.prototype,"hasFocus",2);d([m()],kt.prototype,"name",2);d([m()],kt.prototype,"library",2);d([m()],kt.prototype,"src",2);d([m()],kt.prototype,"href",2);d([m()],kt.prototype,"target",2);d([m()],kt.prototype,"download",2);d([m()],kt.prototype,"label",2);d([m({type:Boolean,reflect:!0})],kt.prototype,"disabled",2);var oe=class extends ht{constructor(){super(...arguments),this.localize=new se(this),this.variant="neutral",this.size="medium",this.pill=!1,this.removable=!1}handleRemoveClick(){this.emit("sl-remove")}render(){return Q`
      <span
        part="base"
        class=${ft({tag:!0,"tag--primary":this.variant==="primary","tag--success":this.variant==="success","tag--neutral":this.variant==="neutral","tag--warning":this.variant==="warning","tag--danger":this.variant==="danger","tag--text":this.variant==="text","tag--small":this.size==="small","tag--medium":this.size==="medium","tag--large":this.size==="large","tag--pill":this.pill,"tag--removable":this.removable})}
      >
        <slot part="content" class="tag__content"></slot>

        ${this.removable?Q`
              <sl-icon-button
                part="remove-button"
                exportparts="base:remove-button__base"
                name="x-lg"
                library="system"
                label=${this.localize.term("remove")}
                class="tag__remove"
                @click=${this.handleRemoveClick}
                tabindex="-1"
              ></sl-icon-button>
            `:""}
      </span>
    `}};oe.styles=[zt,El];oe.dependencies={"sl-icon-button":kt};d([m({reflect:!0})],oe.prototype,"variant",2);d([m({reflect:!0})],oe.prototype,"size",2);d([m({type:Boolean,reflect:!0})],oe.prototype,"pill",2);d([m({type:Boolean})],oe.prototype,"removable",2);var Rl=xt`
  :host {
    display: block;
  }

  /** The popup */
  .select {
    flex: 1 1 auto;
    display: inline-flex;
    width: 100%;
    position: relative;
    vertical-align: middle;
  }

  .select::part(popup) {
    z-index: var(--sl-z-index-dropdown);
  }

  .select[data-current-placement^='top']::part(popup) {
    transform-origin: bottom;
  }

  .select[data-current-placement^='bottom']::part(popup) {
    transform-origin: top;
  }

  /* Combobox */
  .select__combobox {
    flex: 1;
    display: flex;
    width: 100%;
    min-width: 0;
    position: relative;
    align-items: center;
    justify-content: start;
    font-family: var(--sl-input-font-family);
    font-weight: var(--sl-input-font-weight);
    letter-spacing: var(--sl-input-letter-spacing);
    vertical-align: middle;
    overflow: hidden;
    cursor: pointer;
    transition:
      var(--sl-transition-fast) color,
      var(--sl-transition-fast) border,
      var(--sl-transition-fast) box-shadow,
      var(--sl-transition-fast) background-color;
  }

  .select__display-input {
    position: relative;
    width: 100%;
    font: inherit;
    border: none;
    background: none;
    color: var(--sl-input-color);
    cursor: inherit;
    overflow: hidden;
    padding: 0;
    margin: 0;
    -webkit-appearance: none;
  }

  .select__display-input::placeholder {
    color: var(--sl-input-placeholder-color);
  }

  .select:not(.select--disabled):hover .select__display-input {
    color: var(--sl-input-color-hover);
  }

  .select__display-input:focus {
    outline: none;
  }

  /* Visually hide the display input when multiple is enabled */
  .select--multiple:not(.select--placeholder-visible) .select__display-input {
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
  }

  .select__value-input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    opacity: 0;
    z-index: -1;
  }

  .select__tags {
    display: flex;
    flex: 1;
    align-items: center;
    flex-wrap: wrap;
    margin-inline-start: var(--sl-spacing-2x-small);
  }

  .select__tags::slotted(sl-tag) {
    cursor: pointer !important;
  }

  .select--disabled .select__tags,
  .select--disabled .select__tags::slotted(sl-tag) {
    cursor: not-allowed !important;
  }

  /* Standard selects */
  .select--standard .select__combobox {
    background-color: var(--sl-input-background-color);
    border: solid var(--sl-input-border-width) var(--sl-input-border-color);
  }

  .select--standard.select--disabled .select__combobox {
    background-color: var(--sl-input-background-color-disabled);
    border-color: var(--sl-input-border-color-disabled);
    color: var(--sl-input-color-disabled);
    opacity: 0.5;
    cursor: not-allowed;
    outline: none;
  }

  .select--standard:not(.select--disabled).select--open .select__combobox,
  .select--standard:not(.select--disabled).select--focused .select__combobox {
    background-color: var(--sl-input-background-color-focus);
    border-color: var(--sl-input-border-color-focus);
    box-shadow: 0 0 0 var(--sl-focus-ring-width) var(--sl-input-focus-ring-color);
  }

  /* Filled selects */
  .select--filled .select__combobox {
    border: none;
    background-color: var(--sl-input-filled-background-color);
    color: var(--sl-input-color);
  }

  .select--filled:hover:not(.select--disabled) .select__combobox {
    background-color: var(--sl-input-filled-background-color-hover);
  }

  .select--filled.select--disabled .select__combobox {
    background-color: var(--sl-input-filled-background-color-disabled);
    opacity: 0.5;
    cursor: not-allowed;
  }

  .select--filled:not(.select--disabled).select--open .select__combobox,
  .select--filled:not(.select--disabled).select--focused .select__combobox {
    background-color: var(--sl-input-filled-background-color-focus);
    outline: var(--sl-focus-ring);
  }

  /* Sizes */
  .select--small .select__combobox {
    border-radius: var(--sl-input-border-radius-small);
    font-size: var(--sl-input-font-size-small);
    min-height: var(--sl-input-height-small);
    padding-block: 0;
    padding-inline: var(--sl-input-spacing-small);
  }

  .select--small .select__clear {
    margin-inline-start: var(--sl-input-spacing-small);
  }

  .select--small .select__prefix::slotted(*) {
    margin-inline-end: var(--sl-input-spacing-small);
  }

  .select--small.select--multiple:not(.select--placeholder-visible) .select__prefix::slotted(*) {
    margin-inline-start: var(--sl-input-spacing-small);
  }

  .select--small.select--multiple:not(.select--placeholder-visible) .select__combobox {
    padding-block: 2px;
    padding-inline-start: 0;
  }

  .select--small .select__tags {
    gap: 2px;
  }

  .select--medium .select__combobox {
    border-radius: var(--sl-input-border-radius-medium);
    font-size: var(--sl-input-font-size-medium);
    min-height: var(--sl-input-height-medium);
    padding-block: 0;
    padding-inline: var(--sl-input-spacing-medium);
  }

  .select--medium .select__clear {
    margin-inline-start: var(--sl-input-spacing-medium);
  }

  .select--medium .select__prefix::slotted(*) {
    margin-inline-end: var(--sl-input-spacing-medium);
  }

  .select--medium.select--multiple:not(.select--placeholder-visible) .select__prefix::slotted(*) {
    margin-inline-start: var(--sl-input-spacing-medium);
  }

  .select--medium.select--multiple:not(.select--placeholder-visible) .select__combobox {
    padding-inline-start: 0;
    padding-block: 3px;
  }

  .select--medium .select__tags {
    gap: 3px;
  }

  .select--large .select__combobox {
    border-radius: var(--sl-input-border-radius-large);
    font-size: var(--sl-input-font-size-large);
    min-height: var(--sl-input-height-large);
    padding-block: 0;
    padding-inline: var(--sl-input-spacing-large);
  }

  .select--large .select__clear {
    margin-inline-start: var(--sl-input-spacing-large);
  }

  .select--large .select__prefix::slotted(*) {
    margin-inline-end: var(--sl-input-spacing-large);
  }

  .select--large.select--multiple:not(.select--placeholder-visible) .select__prefix::slotted(*) {
    margin-inline-start: var(--sl-input-spacing-large);
  }

  .select--large.select--multiple:not(.select--placeholder-visible) .select__combobox {
    padding-inline-start: 0;
    padding-block: 4px;
  }

  .select--large .select__tags {
    gap: 4px;
  }

  /* Pills */
  .select--pill.select--small .select__combobox {
    border-radius: var(--sl-input-height-small);
  }

  .select--pill.select--medium .select__combobox {
    border-radius: var(--sl-input-height-medium);
  }

  .select--pill.select--large .select__combobox {
    border-radius: var(--sl-input-height-large);
  }

  /* Prefix and Suffix */
  .select__prefix,
  .select__suffix {
    flex: 0;
    display: inline-flex;
    align-items: center;
    color: var(--sl-input-placeholder-color);
  }

  .select__suffix::slotted(*) {
    margin-inline-start: var(--sl-spacing-small);
  }

  /* Clear button */
  .select__clear {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: inherit;
    color: var(--sl-input-icon-color);
    border: none;
    background: none;
    padding: 0;
    transition: var(--sl-transition-fast) color;
    cursor: pointer;
  }

  .select__clear:hover {
    color: var(--sl-input-icon-color-hover);
  }

  .select__clear:focus {
    outline: none;
  }

  /* Expand icon */
  .select__expand-icon {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    transition: var(--sl-transition-medium) rotate ease;
    rotate: 0;
    margin-inline-start: var(--sl-spacing-small);
  }

  .select--open .select__expand-icon {
    rotate: -180deg;
  }

  /* Listbox */
  .select__listbox {
    display: block;
    position: relative;
    font-family: var(--sl-font-sans);
    font-size: var(--sl-font-size-medium);
    font-weight: var(--sl-font-weight-normal);
    box-shadow: var(--sl-shadow-large);
    background: var(--sl-panel-background-color);
    border: solid var(--sl-panel-border-width) var(--sl-panel-border-color);
    border-radius: var(--sl-border-radius-medium);
    padding-block: var(--sl-spacing-x-small);
    padding-inline: 0;
    overflow: auto;
    overscroll-behavior: none;

    /* Make sure it adheres to the popup's auto size */
    max-width: var(--auto-size-available-width);
    max-height: var(--auto-size-available-height);
  }

  .select__listbox ::slotted(sl-divider) {
    --spacing: var(--sl-spacing-x-small);
  }

  .select__listbox ::slotted(small) {
    display: block;
    font-size: var(--sl-font-size-small);
    font-weight: var(--sl-font-weight-semibold);
    color: var(--sl-color-neutral-500);
    padding-block: var(--sl-spacing-2x-small);
    padding-inline: var(--sl-spacing-x-large);
  }
`;function Tl(t,e){return{top:Math.round(t.getBoundingClientRect().top-e.getBoundingClientRect().top),left:Math.round(t.getBoundingClientRect().left-e.getBoundingClientRect().left)}}function Pl(t,e,r="vertical",n="smooth"){const i=Tl(t,e),s=i.top+e.scrollTop,o=i.left+e.scrollLeft,l=e.scrollLeft,a=e.scrollLeft+e.offsetWidth,c=e.scrollTop,u=e.scrollTop+e.offsetHeight;(r==="horizontal"||r==="both")&&(o<l?e.scrollTo({left:o,behavior:n}):o+t.clientWidth>a&&e.scrollTo({left:o-e.offsetWidth+t.clientWidth,behavior:n})),(r==="vertical"||r==="both")&&(s<c?e.scrollTo({top:s,behavior:n}):s+t.clientHeight>u&&e.scrollTo({top:s-e.offsetHeight+t.clientHeight,behavior:n}))}var Ol=xt`
  :host {
    --arrow-color: var(--sl-color-neutral-1000);
    --arrow-size: 6px;

    /*
     * These properties are computed to account for the arrow's dimensions after being rotated 45º. The constant
     * 0.7071 is derived from sin(45), which is the diagonal size of the arrow's container after rotating.
     */
    --arrow-size-diagonal: calc(var(--arrow-size) * 0.7071);
    --arrow-padding-offset: calc(var(--arrow-size-diagonal) - var(--arrow-size));

    display: contents;
  }

  .popup {
    position: absolute;
    isolation: isolate;
    max-width: var(--auto-size-available-width, none);
    max-height: var(--auto-size-available-height, none);
  }

  .popup--fixed {
    position: fixed;
  }

  .popup:not(.popup--active) {
    display: none;
  }

  .popup__arrow {
    position: absolute;
    width: calc(var(--arrow-size-diagonal) * 2);
    height: calc(var(--arrow-size-diagonal) * 2);
    rotate: 45deg;
    background: var(--arrow-color);
    z-index: -1;
  }

  /* Hover bridge */
  .popup-hover-bridge:not(.popup-hover-bridge--visible) {
    display: none;
  }

  .popup-hover-bridge {
    position: fixed;
    z-index: calc(var(--sl-z-index-dropdown) - 1);
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    clip-path: polygon(
      var(--hover-bridge-top-left-x, 0) var(--hover-bridge-top-left-y, 0),
      var(--hover-bridge-top-right-x, 0) var(--hover-bridge-top-right-y, 0),
      var(--hover-bridge-bottom-right-x, 0) var(--hover-bridge-bottom-right-y, 0),
      var(--hover-bridge-bottom-left-x, 0) var(--hover-bridge-bottom-left-y, 0)
    );
  }
`;const Ut=Math.min,vt=Math.max,ur=Math.round,Ze=Math.floor,Tt=t=>({x:t,y:t}),Ll={left:"right",right:"left",bottom:"top",top:"bottom"};function Jr(t,e,r){return vt(t,Ut(e,r))}function me(t,e){return typeof t=="function"?t(e):t}function jt(t){return t.split("-")[0]}function be(t){return t.split("-")[1]}function ss(t){return t==="x"?"y":"x"}function An(t){return t==="y"?"height":"width"}function Lt(t){const e=t[0];return e==="t"||e==="b"?"y":"x"}function En(t){return ss(Lt(t))}function Bl(t,e,r){r===void 0&&(r=!1);const n=be(t),i=En(t),s=An(i);let o=i==="x"?n===(r?"end":"start")?"right":"left":n==="start"?"bottom":"top";return e.reference[s]>e.floating[s]&&(o=hr(o)),[o,hr(o)]}function Il(t){const e=hr(t);return[tn(t),e,tn(e)]}function tn(t){return t.includes("start")?t.replace("start","end"):t.replace("end","start")}const oi=["left","right"],li=["right","left"],Dl=["top","bottom"],Vl=["bottom","top"];function Ml(t,e,r){switch(t){case"top":case"bottom":return r?e?li:oi:e?oi:li;case"left":case"right":return e?Dl:Vl;default:return[]}}function Fl(t,e,r,n){const i=be(t);let s=Ml(jt(t),r==="start",n);return i&&(s=s.map(o=>o+"-"+i),e&&(s=s.concat(s.map(tn)))),s}function hr(t){const e=jt(t);return Ll[e]+t.slice(e.length)}function Nl(t){return{top:0,right:0,bottom:0,left:0,...t}}function os(t){return typeof t!="number"?Nl(t):{top:t,right:t,bottom:t,left:t}}function dr(t){const{x:e,y:r,width:n,height:i}=t;return{width:n,height:i,top:r,left:e,right:e+n,bottom:r+i,x:e,y:r}}function ai(t,e,r){let{reference:n,floating:i}=t;const s=Lt(e),o=En(e),l=An(o),a=jt(e),c=s==="y",u=n.x+n.width/2-i.width/2,h=n.y+n.height/2-i.height/2,p=n[l]/2-i[l]/2;let g;switch(a){case"top":g={x:u,y:n.y-i.height};break;case"bottom":g={x:u,y:n.y+n.height};break;case"right":g={x:n.x+n.width,y:h};break;case"left":g={x:n.x-i.width,y:h};break;default:g={x:n.x,y:n.y}}switch(be(e)){case"start":g[o]-=p*(r&&c?-1:1);break;case"end":g[o]+=p*(r&&c?-1:1);break}return g}async function Hl(t,e){var r;e===void 0&&(e={});const{x:n,y:i,platform:s,rects:o,elements:l,strategy:a}=t,{boundary:c="clippingAncestors",rootBoundary:u="viewport",elementContext:h="floating",altBoundary:p=!1,padding:g=0}=me(e,t),f=os(g),y=l[p?h==="floating"?"reference":"floating":h],k=dr(await s.getClippingRect({element:(r=await(s.isElement==null?void 0:s.isElement(y)))==null||r?y:y.contextElement||await(s.getDocumentElement==null?void 0:s.getDocumentElement(l.floating)),boundary:c,rootBoundary:u,strategy:a})),x=h==="floating"?{x:n,y:i,width:o.floating.width,height:o.floating.height}:o.reference,w=await(s.getOffsetParent==null?void 0:s.getOffsetParent(l.floating)),b=await(s.isElement==null?void 0:s.isElement(w))?await(s.getScale==null?void 0:s.getScale(w))||{x:1,y:1}:{x:1,y:1},S=dr(s.convertOffsetParentRelativeRectToViewportRelativeRect?await s.convertOffsetParentRelativeRectToViewportRelativeRect({elements:l,rect:x,offsetParent:w,strategy:a}):x);return{top:(k.top-S.top+f.top)/b.y,bottom:(S.bottom-k.bottom+f.bottom)/b.y,left:(k.left-S.left+f.left)/b.x,right:(S.right-k.right+f.right)/b.x}}const Ul=50,jl=async(t,e,r)=>{const{placement:n="bottom",strategy:i="absolute",middleware:s=[],platform:o}=r,l=o.detectOverflow?o:{...o,detectOverflow:Hl},a=await(o.isRTL==null?void 0:o.isRTL(e));let c=await o.getElementRects({reference:t,floating:e,strategy:i}),{x:u,y:h}=ai(c,n,a),p=n,g=0;const f={};for(let v=0;v<s.length;v++){const y=s[v];if(!y)continue;const{name:k,fn:x}=y,{x:w,y:b,data:S,reset:T}=await x({x:u,y:h,initialPlacement:n,placement:p,strategy:i,middlewareData:f,rects:c,platform:l,elements:{reference:t,floating:e}});u=w??u,h=b??h,f[k]={...f[k],...S},T&&g<Ul&&(g++,typeof T=="object"&&(T.placement&&(p=T.placement),T.rects&&(c=T.rects===!0?await o.getElementRects({reference:t,floating:e,strategy:i}):T.rects),{x:u,y:h}=ai(c,p,a)),v=-1)}return{x:u,y:h,placement:p,strategy:i,middlewareData:f}},ql=t=>({name:"arrow",options:t,async fn(e){const{x:r,y:n,placement:i,rects:s,platform:o,elements:l,middlewareData:a}=e,{element:c,padding:u=0}=me(t,e)||{};if(c==null)return{};const h=os(u),p={x:r,y:n},g=En(i),f=An(g),v=await o.getDimensions(c),y=g==="y",k=y?"top":"left",x=y?"bottom":"right",w=y?"clientHeight":"clientWidth",b=s.reference[f]+s.reference[g]-p[g]-s.floating[f],S=p[g]-s.reference[g],T=await(o.getOffsetParent==null?void 0:o.getOffsetParent(c));let W=T?T[w]:0;(!W||!await(o.isElement==null?void 0:o.isElement(T)))&&(W=l.floating[w]||s.floating[f]);const it=b/2-S/2,C=W/2-v[f]/2-1,L=Ut(h[k],C),K=Ut(h[x],C),M=L,rt=W-v[f]-K,z=W/2-v[f]/2+it,_=Jr(M,z,rt),$=!a.arrow&&be(i)!=null&&z!==_&&s.reference[f]/2-(z<M?L:K)-v[f]/2<0,R=$?z<M?z-M:z-rt:0;return{[g]:p[g]+R,data:{[g]:_,centerOffset:z-_-R,...$&&{alignmentOffset:R}},reset:$}}}),Wl=function(t){return t===void 0&&(t={}),{name:"flip",options:t,async fn(e){var r,n;const{placement:i,middlewareData:s,rects:o,initialPlacement:l,platform:a,elements:c}=e,{mainAxis:u=!0,crossAxis:h=!0,fallbackPlacements:p,fallbackStrategy:g="bestFit",fallbackAxisSideDirection:f="none",flipAlignment:v=!0,...y}=me(t,e);if((r=s.arrow)!=null&&r.alignmentOffset)return{};const k=jt(i),x=Lt(l),w=jt(l)===l,b=await(a.isRTL==null?void 0:a.isRTL(c.floating)),S=p||(w||!v?[hr(l)]:Il(l)),T=f!=="none";!p&&T&&S.push(...Fl(l,v,f,b));const W=[l,...S],it=await a.detectOverflow(e,y),C=[];let L=((n=s.flip)==null?void 0:n.overflows)||[];if(u&&C.push(it[k]),h){const z=Bl(i,o,b);C.push(it[z[0]],it[z[1]])}if(L=[...L,{placement:i,overflows:C}],!C.every(z=>z<=0)){var K,M;const z=(((K=s.flip)==null?void 0:K.index)||0)+1,_=W[z];if(_&&(!(h==="alignment"?x!==Lt(_):!1)||L.every(F=>Lt(F.placement)===x?F.overflows[0]>0:!0)))return{data:{index:z,overflows:L},reset:{placement:_}};let $=(M=L.filter(R=>R.overflows[0]<=0).sort((R,F)=>R.overflows[1]-F.overflows[1])[0])==null?void 0:M.placement;if(!$)switch(g){case"bestFit":{var rt;const R=(rt=L.filter(F=>{if(T){const X=Lt(F.placement);return X===x||X==="y"}return!0}).map(F=>[F.placement,F.overflows.filter(X=>X>0).reduce((X,dt)=>X+dt,0)]).sort((F,X)=>F[1]-X[1])[0])==null?void 0:rt[0];R&&($=R);break}case"initialPlacement":$=l;break}if(i!==$)return{reset:{placement:$}}}return{}}}},Kl=new Set(["left","top"]);async function Zl(t,e){const{placement:r,platform:n,elements:i}=t,s=await(n.isRTL==null?void 0:n.isRTL(i.floating)),o=jt(r),l=be(r),a=Lt(r)==="y",c=Kl.has(o)?-1:1,u=s&&a?-1:1,h=me(e,t);let{mainAxis:p,crossAxis:g,alignmentAxis:f}=typeof h=="number"?{mainAxis:h,crossAxis:0,alignmentAxis:null}:{mainAxis:h.mainAxis||0,crossAxis:h.crossAxis||0,alignmentAxis:h.alignmentAxis};return l&&typeof f=="number"&&(g=l==="end"?f*-1:f),a?{x:g*u,y:p*c}:{x:p*c,y:g*u}}const Xl=function(t){return t===void 0&&(t=0),{name:"offset",options:t,async fn(e){var r,n;const{x:i,y:s,placement:o,middlewareData:l}=e,a=await Zl(e,t);return o===((r=l.offset)==null?void 0:r.placement)&&(n=l.arrow)!=null&&n.alignmentOffset?{}:{x:i+a.x,y:s+a.y,data:{...a,placement:o}}}}},Yl=function(t){return t===void 0&&(t={}),{name:"shift",options:t,async fn(e){const{x:r,y:n,placement:i,platform:s}=e,{mainAxis:o=!0,crossAxis:l=!1,limiter:a={fn:k=>{let{x,y:w}=k;return{x,y:w}}},...c}=me(t,e),u={x:r,y:n},h=await s.detectOverflow(e,c),p=Lt(jt(i)),g=ss(p);let f=u[g],v=u[p];if(o){const k=g==="y"?"top":"left",x=g==="y"?"bottom":"right",w=f+h[k],b=f-h[x];f=Jr(w,f,b)}if(l){const k=p==="y"?"top":"left",x=p==="y"?"bottom":"right",w=v+h[k],b=v-h[x];v=Jr(w,v,b)}const y=a.fn({...e,[g]:f,[p]:v});return{...y,data:{x:y.x-r,y:y.y-n,enabled:{[g]:o,[p]:l}}}}}},Ql=function(t){return t===void 0&&(t={}),{name:"size",options:t,async fn(e){var r,n;const{placement:i,rects:s,platform:o,elements:l}=e,{apply:a=()=>{},...c}=me(t,e),u=await o.detectOverflow(e,c),h=jt(i),p=be(i),g=Lt(i)==="y",{width:f,height:v}=s.floating;let y,k;h==="top"||h==="bottom"?(y=h,k=p===(await(o.isRTL==null?void 0:o.isRTL(l.floating))?"start":"end")?"left":"right"):(k=h,y=p==="end"?"top":"bottom");const x=v-u.top-u.bottom,w=f-u.left-u.right,b=Ut(v-u[y],x),S=Ut(f-u[k],w),T=!e.middlewareData.shift;let W=b,it=S;if((r=e.middlewareData.shift)!=null&&r.enabled.x&&(it=w),(n=e.middlewareData.shift)!=null&&n.enabled.y&&(W=x),T&&!p){const L=vt(u.left,0),K=vt(u.right,0),M=vt(u.top,0),rt=vt(u.bottom,0);g?it=f-2*(L!==0||K!==0?L+K:vt(u.left,u.right)):W=v-2*(M!==0||rt!==0?M+rt:vt(u.top,u.bottom))}await a({...e,availableWidth:it,availableHeight:W});const C=await o.getDimensions(l.floating);return f!==C.width||v!==C.height?{reset:{rects:!0}}:{}}}};function kr(){return typeof window<"u"}function ve(t){return ls(t)?(t.nodeName||"").toLowerCase():"#document"}function yt(t){var e;return(t==null||(e=t.ownerDocument)==null?void 0:e.defaultView)||window}function Ot(t){var e;return(e=(ls(t)?t.ownerDocument:t.document)||window.document)==null?void 0:e.documentElement}function ls(t){return kr()?t instanceof Node||t instanceof yt(t).Node:!1}function At(t){return kr()?t instanceof Element||t instanceof yt(t).Element:!1}function Bt(t){return kr()?t instanceof HTMLElement||t instanceof yt(t).HTMLElement:!1}function ci(t){return!kr()||typeof ShadowRoot>"u"?!1:t instanceof ShadowRoot||t instanceof yt(t).ShadowRoot}function Ue(t){const{overflow:e,overflowX:r,overflowY:n,display:i}=Et(t);return/auto|scroll|overlay|hidden|clip/.test(e+n+r)&&i!=="inline"&&i!=="contents"}function Gl(t){return/^(table|td|th)$/.test(ve(t))}function _r(t){try{if(t.matches(":popover-open"))return!0}catch{}try{return t.matches(":modal")}catch{return!1}}const Jl=/transform|translate|scale|rotate|perspective|filter/,ta=/paint|layout|strict|content/,Zt=t=>!!t&&t!=="none";let Hr;function $r(t){const e=At(t)?Et(t):t;return Zt(e.transform)||Zt(e.translate)||Zt(e.scale)||Zt(e.rotate)||Zt(e.perspective)||!zn()&&(Zt(e.backdropFilter)||Zt(e.filter))||Jl.test(e.willChange||"")||ta.test(e.contain||"")}function ea(t){let e=qt(t);for(;Bt(e)&&!ge(e);){if($r(e))return e;if(_r(e))return null;e=qt(e)}return null}function zn(){return Hr==null&&(Hr=typeof CSS<"u"&&CSS.supports&&CSS.supports("-webkit-backdrop-filter","none")),Hr}function ge(t){return/^(html|body|#document)$/.test(ve(t))}function Et(t){return yt(t).getComputedStyle(t)}function Cr(t){return At(t)?{scrollLeft:t.scrollLeft,scrollTop:t.scrollTop}:{scrollLeft:t.scrollX,scrollTop:t.scrollY}}function qt(t){if(ve(t)==="html")return t;const e=t.assignedSlot||t.parentNode||ci(t)&&t.host||Ot(t);return ci(e)?e.host:e}function as(t){const e=qt(t);return ge(e)?t.ownerDocument?t.ownerDocument.body:t.body:Bt(e)&&Ue(e)?e:as(e)}function De(t,e,r){var n;e===void 0&&(e=[]),r===void 0&&(r=!0);const i=as(t),s=i===((n=t.ownerDocument)==null?void 0:n.body),o=yt(i);if(s){const l=en(o);return e.concat(o,o.visualViewport||[],Ue(i)?i:[],l&&r?De(l):[])}else return e.concat(i,De(i,[],r))}function en(t){return t.parent&&Object.getPrototypeOf(t.parent)?t.frameElement:null}function cs(t){const e=Et(t);let r=parseFloat(e.width)||0,n=parseFloat(e.height)||0;const i=Bt(t),s=i?t.offsetWidth:r,o=i?t.offsetHeight:n,l=ur(r)!==s||ur(n)!==o;return l&&(r=s,n=o),{width:r,height:n,$:l}}function Rn(t){return At(t)?t:t.contextElement}function de(t){const e=Rn(t);if(!Bt(e))return Tt(1);const r=e.getBoundingClientRect(),{width:n,height:i,$:s}=cs(e);let o=(s?ur(r.width):r.width)/n,l=(s?ur(r.height):r.height)/i;return(!o||!Number.isFinite(o))&&(o=1),(!l||!Number.isFinite(l))&&(l=1),{x:o,y:l}}const ra=Tt(0);function us(t){const e=yt(t);return!zn()||!e.visualViewport?ra:{x:e.visualViewport.offsetLeft,y:e.visualViewport.offsetTop}}function na(t,e,r){return e===void 0&&(e=!1),!r||e&&r!==yt(t)?!1:e}function re(t,e,r,n){e===void 0&&(e=!1),r===void 0&&(r=!1);const i=t.getBoundingClientRect(),s=Rn(t);let o=Tt(1);e&&(n?At(n)&&(o=de(n)):o=de(t));const l=na(s,r,n)?us(s):Tt(0);let a=(i.left+l.x)/o.x,c=(i.top+l.y)/o.y,u=i.width/o.x,h=i.height/o.y;if(s){const p=yt(s),g=n&&At(n)?yt(n):n;let f=p,v=en(f);for(;v&&n&&g!==f;){const y=de(v),k=v.getBoundingClientRect(),x=Et(v),w=k.left+(v.clientLeft+parseFloat(x.paddingLeft))*y.x,b=k.top+(v.clientTop+parseFloat(x.paddingTop))*y.y;a*=y.x,c*=y.y,u*=y.x,h*=y.y,a+=w,c+=b,f=yt(v),v=en(f)}}return dr({width:u,height:h,x:a,y:c})}function Sr(t,e){const r=Cr(t).scrollLeft;return e?e.left+r:re(Ot(t)).left+r}function hs(t,e){const r=t.getBoundingClientRect(),n=r.left+e.scrollLeft-Sr(t,r),i=r.top+e.scrollTop;return{x:n,y:i}}function ia(t){let{elements:e,rect:r,offsetParent:n,strategy:i}=t;const s=i==="fixed",o=Ot(n),l=e?_r(e.floating):!1;if(n===o||l&&s)return r;let a={scrollLeft:0,scrollTop:0},c=Tt(1);const u=Tt(0),h=Bt(n);if((h||!h&&!s)&&((ve(n)!=="body"||Ue(o))&&(a=Cr(n)),h)){const g=re(n);c=de(n),u.x=g.x+n.clientLeft,u.y=g.y+n.clientTop}const p=o&&!h&&!s?hs(o,a):Tt(0);return{width:r.width*c.x,height:r.height*c.y,x:r.x*c.x-a.scrollLeft*c.x+u.x+p.x,y:r.y*c.y-a.scrollTop*c.y+u.y+p.y}}function sa(t){return Array.from(t.getClientRects())}function oa(t){const e=Ot(t),r=Cr(t),n=t.ownerDocument.body,i=vt(e.scrollWidth,e.clientWidth,n.scrollWidth,n.clientWidth),s=vt(e.scrollHeight,e.clientHeight,n.scrollHeight,n.clientHeight);let o=-r.scrollLeft+Sr(t);const l=-r.scrollTop;return Et(n).direction==="rtl"&&(o+=vt(e.clientWidth,n.clientWidth)-i),{width:i,height:s,x:o,y:l}}const ui=25;function la(t,e){const r=yt(t),n=Ot(t),i=r.visualViewport;let s=n.clientWidth,o=n.clientHeight,l=0,a=0;if(i){s=i.width,o=i.height;const u=zn();(!u||u&&e==="fixed")&&(l=i.offsetLeft,a=i.offsetTop)}const c=Sr(n);if(c<=0){const u=n.ownerDocument,h=u.body,p=getComputedStyle(h),g=u.compatMode==="CSS1Compat"&&parseFloat(p.marginLeft)+parseFloat(p.marginRight)||0,f=Math.abs(n.clientWidth-h.clientWidth-g);f<=ui&&(s-=f)}else c<=ui&&(s+=c);return{width:s,height:o,x:l,y:a}}function aa(t,e){const r=re(t,!0,e==="fixed"),n=r.top+t.clientTop,i=r.left+t.clientLeft,s=Bt(t)?de(t):Tt(1),o=t.clientWidth*s.x,l=t.clientHeight*s.y,a=i*s.x,c=n*s.y;return{width:o,height:l,x:a,y:c}}function hi(t,e,r){let n;if(e==="viewport")n=la(t,r);else if(e==="document")n=oa(Ot(t));else if(At(e))n=aa(e,r);else{const i=us(t);n={x:e.x-i.x,y:e.y-i.y,width:e.width,height:e.height}}return dr(n)}function ds(t,e){const r=qt(t);return r===e||!At(r)||ge(r)?!1:Et(r).position==="fixed"||ds(r,e)}function ca(t,e){const r=e.get(t);if(r)return r;let n=De(t,[],!1).filter(l=>At(l)&&ve(l)!=="body"),i=null;const s=Et(t).position==="fixed";let o=s?qt(t):t;for(;At(o)&&!ge(o);){const l=Et(o),a=$r(o);!a&&l.position==="fixed"&&(i=null),(s?!a&&!i:!a&&l.position==="static"&&!!i&&(i.position==="absolute"||i.position==="fixed")||Ue(o)&&!a&&ds(t,o))?n=n.filter(u=>u!==o):i=l,o=qt(o)}return e.set(t,n),n}function ua(t){let{element:e,boundary:r,rootBoundary:n,strategy:i}=t;const o=[...r==="clippingAncestors"?_r(e)?[]:ca(e,this._c):[].concat(r),n],l=hi(e,o[0],i);let a=l.top,c=l.right,u=l.bottom,h=l.left;for(let p=1;p<o.length;p++){const g=hi(e,o[p],i);a=vt(g.top,a),c=Ut(g.right,c),u=Ut(g.bottom,u),h=vt(g.left,h)}return{width:c-h,height:u-a,x:h,y:a}}function ha(t){const{width:e,height:r}=cs(t);return{width:e,height:r}}function da(t,e,r){const n=Bt(e),i=Ot(e),s=r==="fixed",o=re(t,!0,s,e);let l={scrollLeft:0,scrollTop:0};const a=Tt(0);function c(){a.x=Sr(i)}if(n||!n&&!s)if((ve(e)!=="body"||Ue(i))&&(l=Cr(e)),n){const g=re(e,!0,s,e);a.x=g.x+e.clientLeft,a.y=g.y+e.clientTop}else i&&c();s&&!n&&i&&c();const u=i&&!n&&!s?hs(i,l):Tt(0),h=o.left+l.scrollLeft-a.x-u.x,p=o.top+l.scrollTop-a.y-u.y;return{x:h,y:p,width:o.width,height:o.height}}function Ur(t){return Et(t).position==="static"}function di(t,e){if(!Bt(t)||Et(t).position==="fixed")return null;if(e)return e(t);let r=t.offsetParent;return Ot(t)===r&&(r=r.ownerDocument.body),r}function ps(t,e){const r=yt(t);if(_r(t))return r;if(!Bt(t)){let i=qt(t);for(;i&&!ge(i);){if(At(i)&&!Ur(i))return i;i=qt(i)}return r}let n=di(t,e);for(;n&&Gl(n)&&Ur(n);)n=di(n,e);return n&&ge(n)&&Ur(n)&&!$r(n)?r:n||ea(t)||r}const pa=async function(t){const e=this.getOffsetParent||ps,r=this.getDimensions,n=await r(t.floating);return{reference:da(t.reference,await e(t.floating),t.strategy),floating:{x:0,y:0,width:n.width,height:n.height}}};function fa(t){return Et(t).direction==="rtl"}const rr={convertOffsetParentRelativeRectToViewportRelativeRect:ia,getDocumentElement:Ot,getClippingRect:ua,getOffsetParent:ps,getElementRects:pa,getClientRects:sa,getDimensions:ha,getScale:de,isElement:At,isRTL:fa};function fs(t,e){return t.x===e.x&&t.y===e.y&&t.width===e.width&&t.height===e.height}function ga(t,e){let r=null,n;const i=Ot(t);function s(){var l;clearTimeout(n),(l=r)==null||l.disconnect(),r=null}function o(l,a){l===void 0&&(l=!1),a===void 0&&(a=1),s();const c=t.getBoundingClientRect(),{left:u,top:h,width:p,height:g}=c;if(l||e(),!p||!g)return;const f=Ze(h),v=Ze(i.clientWidth-(u+p)),y=Ze(i.clientHeight-(h+g)),k=Ze(u),w={rootMargin:-f+"px "+-v+"px "+-y+"px "+-k+"px",threshold:vt(0,Ut(1,a))||1};let b=!0;function S(T){const W=T[0].intersectionRatio;if(W!==a){if(!b)return o();W?o(!1,W):n=setTimeout(()=>{o(!1,1e-7)},1e3)}W===1&&!fs(c,t.getBoundingClientRect())&&o(),b=!1}try{r=new IntersectionObserver(S,{...w,root:i.ownerDocument})}catch{r=new IntersectionObserver(S,w)}r.observe(t)}return o(!0),s}function ma(t,e,r,n){n===void 0&&(n={});const{ancestorScroll:i=!0,ancestorResize:s=!0,elementResize:o=typeof ResizeObserver=="function",layoutShift:l=typeof IntersectionObserver=="function",animationFrame:a=!1}=n,c=Rn(t),u=i||s?[...c?De(c):[],...e?De(e):[]]:[];u.forEach(k=>{i&&k.addEventListener("scroll",r,{passive:!0}),s&&k.addEventListener("resize",r)});const h=c&&l?ga(c,r):null;let p=-1,g=null;o&&(g=new ResizeObserver(k=>{let[x]=k;x&&x.target===c&&g&&e&&(g.unobserve(e),cancelAnimationFrame(p),p=requestAnimationFrame(()=>{var w;(w=g)==null||w.observe(e)})),r()}),c&&!a&&g.observe(c),e&&g.observe(e));let f,v=a?re(t):null;a&&y();function y(){const k=re(t);v&&!fs(v,k)&&r(),v=k,f=requestAnimationFrame(y)}return r(),()=>{var k;u.forEach(x=>{i&&x.removeEventListener("scroll",r),s&&x.removeEventListener("resize",r)}),h==null||h(),(k=g)==null||k.disconnect(),g=null,a&&cancelAnimationFrame(f)}}const ba=Xl,va=Yl,ya=Wl,pi=Ql,wa=ql,xa=(t,e,r)=>{const n=new Map,i={platform:rr,...r},s={...i.platform,_c:n};return jl(t,e,{...i,platform:s})};function ka(t){return _a(t)}function jr(t){return t.assignedSlot?t.assignedSlot:t.parentNode instanceof ShadowRoot?t.parentNode.host:t.parentNode}function _a(t){for(let e=t;e;e=jr(e))if(e instanceof Element&&getComputedStyle(e).display==="none")return null;for(let e=jr(t);e;e=jr(e)){if(!(e instanceof Element))continue;const r=getComputedStyle(e);if(r.display!=="contents"&&(r.position!=="static"||$r(r)||e.tagName==="BODY"))return e}return null}function $a(t){return t!==null&&typeof t=="object"&&"getBoundingClientRect"in t&&("contextElement"in t?t.contextElement instanceof Element:!0)}var Y=class extends ht{constructor(){super(...arguments),this.localize=new se(this),this.active=!1,this.placement="top",this.strategy="absolute",this.distance=0,this.skidding=0,this.arrow=!1,this.arrowPlacement="anchor",this.arrowPadding=10,this.flip=!1,this.flipFallbackPlacements="",this.flipFallbackStrategy="best-fit",this.flipPadding=0,this.shift=!1,this.shiftPadding=0,this.autoSizePadding=0,this.hoverBridge=!1,this.updateHoverBridge=()=>{if(this.hoverBridge&&this.anchorEl){const t=this.anchorEl.getBoundingClientRect(),e=this.popup.getBoundingClientRect(),r=this.placement.includes("top")||this.placement.includes("bottom");let n=0,i=0,s=0,o=0,l=0,a=0,c=0,u=0;r?t.top<e.top?(n=t.left,i=t.bottom,s=t.right,o=t.bottom,l=e.left,a=e.top,c=e.right,u=e.top):(n=e.left,i=e.bottom,s=e.right,o=e.bottom,l=t.left,a=t.top,c=t.right,u=t.top):t.left<e.left?(n=t.right,i=t.top,s=e.left,o=e.top,l=t.right,a=t.bottom,c=e.left,u=e.bottom):(n=e.right,i=e.top,s=t.left,o=t.top,l=e.right,a=e.bottom,c=t.left,u=t.bottom),this.style.setProperty("--hover-bridge-top-left-x",`${n}px`),this.style.setProperty("--hover-bridge-top-left-y",`${i}px`),this.style.setProperty("--hover-bridge-top-right-x",`${s}px`),this.style.setProperty("--hover-bridge-top-right-y",`${o}px`),this.style.setProperty("--hover-bridge-bottom-left-x",`${l}px`),this.style.setProperty("--hover-bridge-bottom-left-y",`${a}px`),this.style.setProperty("--hover-bridge-bottom-right-x",`${c}px`),this.style.setProperty("--hover-bridge-bottom-right-y",`${u}px`)}}}async connectedCallback(){super.connectedCallback(),await this.updateComplete,this.start()}disconnectedCallback(){super.disconnectedCallback(),this.stop()}async updated(t){super.updated(t),t.has("active")&&(this.active?this.start():this.stop()),t.has("anchor")&&this.handleAnchorChange(),this.active&&(await this.updateComplete,this.reposition())}async handleAnchorChange(){if(await this.stop(),this.anchor&&typeof this.anchor=="string"){const t=this.getRootNode();this.anchorEl=t.getElementById(this.anchor)}else this.anchor instanceof Element||$a(this.anchor)?this.anchorEl=this.anchor:this.anchorEl=this.querySelector('[slot="anchor"]');this.anchorEl instanceof HTMLSlotElement&&(this.anchorEl=this.anchorEl.assignedElements({flatten:!0})[0]),this.anchorEl&&this.active&&this.start()}start(){!this.anchorEl||!this.active||(this.cleanup=ma(this.anchorEl,this.popup,()=>{this.reposition()}))}async stop(){return new Promise(t=>{this.cleanup?(this.cleanup(),this.cleanup=void 0,this.removeAttribute("data-current-placement"),this.style.removeProperty("--auto-size-available-width"),this.style.removeProperty("--auto-size-available-height"),requestAnimationFrame(()=>t())):t()})}reposition(){if(!this.active||!this.anchorEl)return;const t=[ba({mainAxis:this.distance,crossAxis:this.skidding})];this.sync?t.push(pi({apply:({rects:r})=>{const n=this.sync==="width"||this.sync==="both",i=this.sync==="height"||this.sync==="both";this.popup.style.width=n?`${r.reference.width}px`:"",this.popup.style.height=i?`${r.reference.height}px`:""}})):(this.popup.style.width="",this.popup.style.height=""),this.flip&&t.push(ya({boundary:this.flipBoundary,fallbackPlacements:this.flipFallbackPlacements,fallbackStrategy:this.flipFallbackStrategy==="best-fit"?"bestFit":"initialPlacement",padding:this.flipPadding})),this.shift&&t.push(va({boundary:this.shiftBoundary,padding:this.shiftPadding})),this.autoSize?t.push(pi({boundary:this.autoSizeBoundary,padding:this.autoSizePadding,apply:({availableWidth:r,availableHeight:n})=>{this.autoSize==="vertical"||this.autoSize==="both"?this.style.setProperty("--auto-size-available-height",`${n}px`):this.style.removeProperty("--auto-size-available-height"),this.autoSize==="horizontal"||this.autoSize==="both"?this.style.setProperty("--auto-size-available-width",`${r}px`):this.style.removeProperty("--auto-size-available-width")}})):(this.style.removeProperty("--auto-size-available-width"),this.style.removeProperty("--auto-size-available-height")),this.arrow&&t.push(wa({element:this.arrowEl,padding:this.arrowPadding}));const e=this.strategy==="absolute"?r=>rr.getOffsetParent(r,ka):rr.getOffsetParent;xa(this.anchorEl,this.popup,{placement:this.placement,middleware:t,strategy:this.strategy,platform:vr(ie({},rr),{getOffsetParent:e})}).then(({x:r,y:n,middlewareData:i,placement:s})=>{const o=this.localize.dir()==="rtl",l={top:"bottom",right:"left",bottom:"top",left:"right"}[s.split("-")[0]];if(this.setAttribute("data-current-placement",s),Object.assign(this.popup.style,{left:`${r}px`,top:`${n}px`}),this.arrow){const a=i.arrow.x,c=i.arrow.y;let u="",h="",p="",g="";if(this.arrowPlacement==="start"){const f=typeof a=="number"?`calc(${this.arrowPadding}px - var(--arrow-padding-offset))`:"";u=typeof c=="number"?`calc(${this.arrowPadding}px - var(--arrow-padding-offset))`:"",h=o?f:"",g=o?"":f}else if(this.arrowPlacement==="end"){const f=typeof a=="number"?`calc(${this.arrowPadding}px - var(--arrow-padding-offset))`:"";h=o?"":f,g=o?f:"",p=typeof c=="number"?`calc(${this.arrowPadding}px - var(--arrow-padding-offset))`:""}else this.arrowPlacement==="center"?(g=typeof a=="number"?"calc(50% - var(--arrow-size-diagonal))":"",u=typeof c=="number"?"calc(50% - var(--arrow-size-diagonal))":""):(g=typeof a=="number"?`${a}px`:"",u=typeof c=="number"?`${c}px`:"");Object.assign(this.arrowEl.style,{top:u,right:h,bottom:p,left:g,[l]:"calc(var(--arrow-size-diagonal) * -1)"})}}),requestAnimationFrame(()=>this.updateHoverBridge()),this.emit("sl-reposition")}render(){return Q`
      <slot name="anchor" @slotchange=${this.handleAnchorChange}></slot>

      <span
        part="hover-bridge"
        class=${ft({"popup-hover-bridge":!0,"popup-hover-bridge--visible":this.hoverBridge&&this.active})}
      ></span>

      <div
        part="popup"
        class=${ft({popup:!0,"popup--active":this.active,"popup--fixed":this.strategy==="fixed","popup--has-arrow":this.arrow})}
      >
        <slot></slot>
        ${this.arrow?Q`<div part="arrow" class="popup__arrow" role="presentation"></div>`:""}
      </div>
    `}};Y.styles=[zt,Ol];d([gt(".popup")],Y.prototype,"popup",2);d([gt(".popup__arrow")],Y.prototype,"arrowEl",2);d([m()],Y.prototype,"anchor",2);d([m({type:Boolean,reflect:!0})],Y.prototype,"active",2);d([m({reflect:!0})],Y.prototype,"placement",2);d([m({reflect:!0})],Y.prototype,"strategy",2);d([m({type:Number})],Y.prototype,"distance",2);d([m({type:Number})],Y.prototype,"skidding",2);d([m({type:Boolean})],Y.prototype,"arrow",2);d([m({attribute:"arrow-placement"})],Y.prototype,"arrowPlacement",2);d([m({attribute:"arrow-padding",type:Number})],Y.prototype,"arrowPadding",2);d([m({type:Boolean})],Y.prototype,"flip",2);d([m({attribute:"flip-fallback-placements",converter:{fromAttribute:t=>t.split(" ").map(e=>e.trim()).filter(e=>e!==""),toAttribute:t=>t.join(" ")}})],Y.prototype,"flipFallbackPlacements",2);d([m({attribute:"flip-fallback-strategy"})],Y.prototype,"flipFallbackStrategy",2);d([m({type:Object})],Y.prototype,"flipBoundary",2);d([m({attribute:"flip-padding",type:Number})],Y.prototype,"flipPadding",2);d([m({type:Boolean})],Y.prototype,"shift",2);d([m({type:Object})],Y.prototype,"shiftBoundary",2);d([m({attribute:"shift-padding",type:Number})],Y.prototype,"shiftPadding",2);d([m({attribute:"auto-size"})],Y.prototype,"autoSize",2);d([m()],Y.prototype,"sync",2);d([m({type:Object})],Y.prototype,"autoSizeBoundary",2);d([m({attribute:"auto-size-padding",type:Number})],Y.prototype,"autoSizePadding",2);d([m({attribute:"hover-bridge",type:Boolean})],Y.prototype,"hoverBridge",2);var gs=new Map,Ca=new WeakMap;function Sa(t){return t??{keyframes:[],options:{duration:0}}}function fi(t,e){return e.toLowerCase()==="rtl"?{keyframes:t.rtlKeyframes||t.keyframes,options:t.options}:t}function ms(t,e){gs.set(t,Sa(e))}function gi(t,e,r){const n=Ca.get(t);if(n!=null&&n[e])return fi(n[e],r.dir);const i=gs.get(e);return i?fi(i,r.dir):{keyframes:[],options:{duration:0}}}function mi(t,e){return new Promise(r=>{function n(i){i.target===t&&(t.removeEventListener(e,n),r())}t.addEventListener(e,n)})}function bi(t,e,r){return new Promise(n=>{if((r==null?void 0:r.duration)===1/0)throw new Error("Promise-based animations must be finite.");const i=t.animate(e,vr(ie({},r),{duration:Aa()?0:r.duration}));i.addEventListener("cancel",n,{once:!0}),i.addEventListener("finish",n,{once:!0})})}function Aa(){return window.matchMedia("(prefers-reduced-motion: reduce)").matches}function vi(t){return Promise.all(t.getAnimations().map(e=>new Promise(r=>{e.cancel(),requestAnimationFrame(r)})))}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class rn extends Cn{constructor(e){if(super(e),this.it=J,e.type!==Vt.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(e){if(e===J||e==null)return this._t=void 0,this.it=e;if(e===_t)return e;if(typeof e!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(e===this.it)return this._t;this.it=e;const r=[e];return r.raw=r,this._t={_$litType$:this.constructor.resultType,strings:r,values:[]}}}rn.directiveName="unsafeHTML",rn.resultType=1;const Ea=$n(rn);var I=class extends ht{constructor(){super(...arguments),this.formControlController=new Ne(this,{assumeInteractionOn:["sl-blur","sl-input"]}),this.hasSlotController=new He(this,"help-text","label"),this.localize=new se(this),this.typeToSelectString="",this.hasFocus=!1,this.displayLabel="",this.selectedOptions=[],this.valueHasChanged=!1,this.name="",this._value="",this.defaultValue="",this.size="medium",this.placeholder="",this.multiple=!1,this.maxOptionsVisible=3,this.disabled=!1,this.clearable=!1,this.open=!1,this.hoist=!1,this.filled=!1,this.pill=!1,this.label="",this.placement="bottom",this.helpText="",this.form="",this.required=!1,this.getTag=t=>Q`
      <sl-tag
        part="tag"
        exportparts="
              base:tag__base,
              content:tag__content,
              remove-button:tag__remove-button,
              remove-button__base:tag__remove-button__base
            "
        ?pill=${this.pill}
        size=${this.size}
        removable
        @sl-remove=${e=>this.handleTagRemove(e,t)}
      >
        ${t.getTextLabel()}
      </sl-tag>
    `,this.handleDocumentFocusIn=t=>{const e=t.composedPath();this&&!e.includes(this)&&this.hide()},this.handleDocumentKeyDown=t=>{const e=t.target,r=e.closest(".select__clear")!==null,n=e.closest("sl-icon-button")!==null;if(!(r||n)){if(t.key==="Escape"&&this.open&&!this.closeWatcher&&(t.preventDefault(),t.stopPropagation(),this.hide(),this.displayInput.focus({preventScroll:!0})),t.key==="Enter"||t.key===" "&&this.typeToSelectString===""){if(t.preventDefault(),t.stopImmediatePropagation(),!this.open){this.show();return}this.currentOption&&!this.currentOption.disabled&&(this.valueHasChanged=!0,this.multiple?this.toggleOptionSelection(this.currentOption):this.setSelectedOptions(this.currentOption),this.updateComplete.then(()=>{this.emit("sl-input"),this.emit("sl-change")}),this.multiple||(this.hide(),this.displayInput.focus({preventScroll:!0})));return}if(["ArrowUp","ArrowDown","Home","End"].includes(t.key)){const i=this.getAllOptions(),s=i.indexOf(this.currentOption);let o=Math.max(0,s);if(t.preventDefault(),!this.open&&(this.show(),this.currentOption))return;t.key==="ArrowDown"?(o=s+1,o>i.length-1&&(o=0)):t.key==="ArrowUp"?(o=s-1,o<0&&(o=i.length-1)):t.key==="Home"?o=0:t.key==="End"&&(o=i.length-1),this.setCurrentOption(i[o])}if(t.key&&t.key.length===1||t.key==="Backspace"){const i=this.getAllOptions();if(t.metaKey||t.ctrlKey||t.altKey)return;if(!this.open){if(t.key==="Backspace")return;this.show()}t.stopPropagation(),t.preventDefault(),clearTimeout(this.typeToSelectTimeout),this.typeToSelectTimeout=window.setTimeout(()=>this.typeToSelectString="",1e3),t.key==="Backspace"?this.typeToSelectString=this.typeToSelectString.slice(0,-1):this.typeToSelectString+=t.key.toLowerCase();for(const s of i)if(s.getTextLabel().toLowerCase().startsWith(this.typeToSelectString)){this.setCurrentOption(s);break}}}},this.handleDocumentMouseDown=t=>{const e=t.composedPath();this&&!e.includes(this)&&this.hide()}}get value(){return this._value}set value(t){this.multiple?t=Array.isArray(t)?t:t.split(" "):t=Array.isArray(t)?t.join(" "):t,this._value!==t&&(this.valueHasChanged=!0,this._value=t)}get validity(){return this.valueInput.validity}get validationMessage(){return this.valueInput.validationMessage}connectedCallback(){super.connectedCallback(),setTimeout(()=>{this.handleDefaultSlotChange()}),this.open=!1}addOpenListeners(){var t;document.addEventListener("focusin",this.handleDocumentFocusIn),document.addEventListener("keydown",this.handleDocumentKeyDown),document.addEventListener("mousedown",this.handleDocumentMouseDown),this.getRootNode()!==document&&this.getRootNode().addEventListener("focusin",this.handleDocumentFocusIn),"CloseWatcher"in window&&((t=this.closeWatcher)==null||t.destroy(),this.closeWatcher=new CloseWatcher,this.closeWatcher.onclose=()=>{this.open&&(this.hide(),this.displayInput.focus({preventScroll:!0}))})}removeOpenListeners(){var t;document.removeEventListener("focusin",this.handleDocumentFocusIn),document.removeEventListener("keydown",this.handleDocumentKeyDown),document.removeEventListener("mousedown",this.handleDocumentMouseDown),this.getRootNode()!==document&&this.getRootNode().removeEventListener("focusin",this.handleDocumentFocusIn),(t=this.closeWatcher)==null||t.destroy()}handleFocus(){this.hasFocus=!0,this.displayInput.setSelectionRange(0,0),this.emit("sl-focus")}handleBlur(){this.hasFocus=!1,this.emit("sl-blur")}handleLabelClick(){this.displayInput.focus()}handleComboboxMouseDown(t){const r=t.composedPath().some(n=>n instanceof Element&&n.tagName.toLowerCase()==="sl-icon-button");this.disabled||r||(t.preventDefault(),this.displayInput.focus({preventScroll:!0}),this.open=!this.open)}handleComboboxKeyDown(t){t.key!=="Tab"&&(t.stopPropagation(),this.handleDocumentKeyDown(t))}handleClearClick(t){t.stopPropagation(),this.valueHasChanged=!0,this.value!==""&&(this.setSelectedOptions([]),this.displayInput.focus({preventScroll:!0}),this.updateComplete.then(()=>{this.emit("sl-clear"),this.emit("sl-input"),this.emit("sl-change")}))}handleClearMouseDown(t){t.stopPropagation(),t.preventDefault()}handleOptionClick(t){const r=t.target.closest("sl-option"),n=this.value;r&&!r.disabled&&(this.valueHasChanged=!0,this.multiple?this.toggleOptionSelection(r):this.setSelectedOptions(r),this.updateComplete.then(()=>this.displayInput.focus({preventScroll:!0})),this.value!==n&&this.updateComplete.then(()=>{this.emit("sl-input"),this.emit("sl-change")}),this.multiple||(this.hide(),this.displayInput.focus({preventScroll:!0})))}handleDefaultSlotChange(){customElements.get("sl-option")||customElements.whenDefined("sl-option").then(()=>this.handleDefaultSlotChange());const t=this.getAllOptions(),e=this.valueHasChanged?this.value:this.defaultValue,r=Array.isArray(e)?e:[e],n=[];t.forEach(i=>n.push(i.value)),this.setSelectedOptions(t.filter(i=>r.includes(i.value)))}handleTagRemove(t,e){t.stopPropagation(),this.valueHasChanged=!0,this.disabled||(this.toggleOptionSelection(e,!1),this.updateComplete.then(()=>{this.emit("sl-input"),this.emit("sl-change")}))}getAllOptions(){return[...this.querySelectorAll("sl-option")]}getFirstOption(){return this.querySelector("sl-option")}setCurrentOption(t){this.getAllOptions().forEach(r=>{r.current=!1,r.tabIndex=-1}),t&&(this.currentOption=t,t.current=!0,t.tabIndex=0,t.focus())}setSelectedOptions(t){const e=this.getAllOptions(),r=Array.isArray(t)?t:[t];e.forEach(n=>n.selected=!1),r.length&&r.forEach(n=>n.selected=!0),this.selectionChanged()}toggleOptionSelection(t,e){e===!0||e===!1?t.selected=e:t.selected=!t.selected,this.selectionChanged()}selectionChanged(){var t,e,r;const n=this.getAllOptions();this.selectedOptions=n.filter(s=>s.selected);const i=this.valueHasChanged;if(this.multiple)this.value=this.selectedOptions.map(s=>s.value),this.placeholder&&this.value.length===0?this.displayLabel="":this.displayLabel=this.localize.term("numOptionsSelected",this.selectedOptions.length);else{const s=this.selectedOptions[0];this.value=(t=s==null?void 0:s.value)!=null?t:"",this.displayLabel=(r=(e=s==null?void 0:s.getTextLabel)==null?void 0:e.call(s))!=null?r:""}this.valueHasChanged=i,this.updateComplete.then(()=>{this.formControlController.updateValidity()})}get tags(){return this.selectedOptions.map((t,e)=>{if(e<this.maxOptionsVisible||this.maxOptionsVisible<=0){const r=this.getTag(t,e);return Q`<div @sl-remove=${n=>this.handleTagRemove(n,t)}>
          ${typeof r=="string"?Ea(r):r}
        </div>`}else if(e===this.maxOptionsVisible)return Q`<sl-tag size=${this.size}>+${this.selectedOptions.length-e}</sl-tag>`;return Q``})}handleInvalid(t){this.formControlController.setValidity(!1),this.formControlController.emitInvalidEvent(t)}handleDisabledChange(){this.disabled&&(this.open=!1,this.handleOpenChange())}attributeChangedCallback(t,e,r){if(super.attributeChangedCallback(t,e,r),t==="value"){const n=this.valueHasChanged;this.value=this.defaultValue,this.valueHasChanged=n}}handleValueChange(){if(!this.valueHasChanged){const r=this.valueHasChanged;this.value=this.defaultValue,this.valueHasChanged=r}const t=this.getAllOptions(),e=Array.isArray(this.value)?this.value:[this.value];this.setSelectedOptions(t.filter(r=>e.includes(r.value)))}async handleOpenChange(){if(this.open&&!this.disabled){this.setCurrentOption(this.selectedOptions[0]||this.getFirstOption()),this.emit("sl-show"),this.addOpenListeners(),await vi(this),this.listbox.hidden=!1,this.popup.active=!0,requestAnimationFrame(()=>{this.setCurrentOption(this.currentOption)});const{keyframes:t,options:e}=gi(this,"select.show",{dir:this.localize.dir()});await bi(this.popup.popup,t,e),this.currentOption&&Pl(this.currentOption,this.listbox,"vertical","auto"),this.emit("sl-after-show")}else{this.emit("sl-hide"),this.removeOpenListeners(),await vi(this);const{keyframes:t,options:e}=gi(this,"select.hide",{dir:this.localize.dir()});await bi(this.popup.popup,t,e),this.listbox.hidden=!0,this.popup.active=!1,this.emit("sl-after-hide")}}async show(){if(this.open||this.disabled){this.open=!1;return}return this.open=!0,mi(this,"sl-after-show")}async hide(){if(!this.open||this.disabled){this.open=!1;return}return this.open=!1,mi(this,"sl-after-hide")}checkValidity(){return this.valueInput.checkValidity()}getForm(){return this.formControlController.getForm()}reportValidity(){return this.valueInput.reportValidity()}setCustomValidity(t){this.valueInput.setCustomValidity(t),this.formControlController.updateValidity()}focus(t){this.displayInput.focus(t)}blur(){this.displayInput.blur()}render(){const t=this.hasSlotController.test("label"),e=this.hasSlotController.test("help-text"),r=this.label?!0:!!t,n=this.helpText?!0:!!e,i=this.clearable&&!this.disabled&&this.value.length>0,s=this.placeholder&&this.value&&this.value.length<=0;return Q`
      <div
        part="form-control"
        class=${ft({"form-control":!0,"form-control--small":this.size==="small","form-control--medium":this.size==="medium","form-control--large":this.size==="large","form-control--has-label":r,"form-control--has-help-text":n})}
      >
        <label
          id="label"
          part="form-control-label"
          class="form-control__label"
          aria-hidden=${r?"false":"true"}
          @click=${this.handleLabelClick}
        >
          <slot name="label">${this.label}</slot>
        </label>

        <div part="form-control-input" class="form-control-input">
          <sl-popup
            class=${ft({select:!0,"select--standard":!0,"select--filled":this.filled,"select--pill":this.pill,"select--open":this.open,"select--disabled":this.disabled,"select--multiple":this.multiple,"select--focused":this.hasFocus,"select--placeholder-visible":s,"select--top":this.placement==="top","select--bottom":this.placement==="bottom","select--small":this.size==="small","select--medium":this.size==="medium","select--large":this.size==="large"})}
            placement=${this.placement}
            strategy=${this.hoist?"fixed":"absolute"}
            flip
            shift
            sync="width"
            auto-size="vertical"
            auto-size-padding="10"
          >
            <div
              part="combobox"
              class="select__combobox"
              slot="anchor"
              @keydown=${this.handleComboboxKeyDown}
              @mousedown=${this.handleComboboxMouseDown}
            >
              <slot part="prefix" name="prefix" class="select__prefix"></slot>

              <input
                part="display-input"
                class="select__display-input"
                type="text"
                placeholder=${this.placeholder}
                .disabled=${this.disabled}
                .value=${this.displayLabel}
                autocomplete="off"
                spellcheck="false"
                autocapitalize="off"
                readonly
                aria-controls="listbox"
                aria-expanded=${this.open?"true":"false"}
                aria-haspopup="listbox"
                aria-labelledby="label"
                aria-disabled=${this.disabled?"true":"false"}
                aria-describedby="help-text"
                role="combobox"
                tabindex="0"
                @focus=${this.handleFocus}
                @blur=${this.handleBlur}
              />

              ${this.multiple?Q`<div part="tags" class="select__tags">${this.tags}</div>`:""}

              <input
                class="select__value-input"
                type="text"
                ?disabled=${this.disabled}
                ?required=${this.required}
                .value=${Array.isArray(this.value)?this.value.join(", "):this.value}
                tabindex="-1"
                aria-hidden="true"
                @focus=${()=>this.focus()}
                @invalid=${this.handleInvalid}
              />

              ${i?Q`
                    <button
                      part="clear-button"
                      class="select__clear"
                      type="button"
                      aria-label=${this.localize.term("clearEntry")}
                      @mousedown=${this.handleClearMouseDown}
                      @click=${this.handleClearClick}
                      tabindex="-1"
                    >
                      <slot name="clear-icon">
                        <sl-icon name="x-circle-fill" library="system"></sl-icon>
                      </slot>
                    </button>
                  `:""}

              <slot name="suffix" part="suffix" class="select__suffix"></slot>

              <slot name="expand-icon" part="expand-icon" class="select__expand-icon">
                <sl-icon library="system" name="chevron-down"></sl-icon>
              </slot>
            </div>

            <div
              id="listbox"
              role="listbox"
              aria-expanded=${this.open?"true":"false"}
              aria-multiselectable=${this.multiple?"true":"false"}
              aria-labelledby="label"
              part="listbox"
              class="select__listbox"
              tabindex="-1"
              @mouseup=${this.handleOptionClick}
              @slotchange=${this.handleDefaultSlotChange}
            >
              <slot></slot>
            </div>
          </sl-popup>
        </div>

        <div
          part="form-control-help-text"
          id="help-text"
          class="form-control__help-text"
          aria-hidden=${n?"false":"true"}
        >
          <slot name="help-text">${this.helpText}</slot>
        </div>
      </div>
    `}};I.styles=[zt,xr,Rl];I.dependencies={"sl-icon":mt,"sl-popup":Y,"sl-tag":oe};d([gt(".select")],I.prototype,"popup",2);d([gt(".select__combobox")],I.prototype,"combobox",2);d([gt(".select__display-input")],I.prototype,"displayInput",2);d([gt(".select__value-input")],I.prototype,"valueInput",2);d([gt(".select__listbox")],I.prototype,"listbox",2);d([ut()],I.prototype,"hasFocus",2);d([ut()],I.prototype,"displayLabel",2);d([ut()],I.prototype,"currentOption",2);d([ut()],I.prototype,"selectedOptions",2);d([ut()],I.prototype,"valueHasChanged",2);d([m()],I.prototype,"name",2);d([ut()],I.prototype,"value",1);d([m({attribute:"value"})],I.prototype,"defaultValue",2);d([m({reflect:!0})],I.prototype,"size",2);d([m()],I.prototype,"placeholder",2);d([m({type:Boolean,reflect:!0})],I.prototype,"multiple",2);d([m({attribute:"max-options-visible",type:Number})],I.prototype,"maxOptionsVisible",2);d([m({type:Boolean,reflect:!0})],I.prototype,"disabled",2);d([m({type:Boolean})],I.prototype,"clearable",2);d([m({type:Boolean,reflect:!0})],I.prototype,"open",2);d([m({type:Boolean})],I.prototype,"hoist",2);d([m({type:Boolean,reflect:!0})],I.prototype,"filled",2);d([m({type:Boolean,reflect:!0})],I.prototype,"pill",2);d([m()],I.prototype,"label",2);d([m({reflect:!0})],I.prototype,"placement",2);d([m({attribute:"help-text"})],I.prototype,"helpText",2);d([m({reflect:!0})],I.prototype,"form",2);d([m({type:Boolean,reflect:!0})],I.prototype,"required",2);d([m()],I.prototype,"getTag",2);d([ot("disabled",{waitUntilFirstUpdate:!0})],I.prototype,"handleDisabledChange",1);d([ot(["defaultValue","value"],{waitUntilFirstUpdate:!0})],I.prototype,"handleValueChange",1);d([ot("open",{waitUntilFirstUpdate:!0})],I.prototype,"handleOpenChange",1);ms("select.show",{keyframes:[{opacity:0,scale:.9},{opacity:1,scale:1}],options:{duration:100,easing:"ease"}});ms("select.hide",{keyframes:[{opacity:1,scale:1},{opacity:0,scale:.9}],options:{duration:100,easing:"ease"}});I.define("sl-select");var za=xt`
  :host {
    display: block;
  }

  .textarea {
    display: grid;
    align-items: center;
    position: relative;
    width: 100%;
    font-family: var(--sl-input-font-family);
    font-weight: var(--sl-input-font-weight);
    line-height: var(--sl-line-height-normal);
    letter-spacing: var(--sl-input-letter-spacing);
    vertical-align: middle;
    transition:
      var(--sl-transition-fast) color,
      var(--sl-transition-fast) border,
      var(--sl-transition-fast) box-shadow,
      var(--sl-transition-fast) background-color;
    cursor: text;
  }

  /* Standard textareas */
  .textarea--standard {
    background-color: var(--sl-input-background-color);
    border: solid var(--sl-input-border-width) var(--sl-input-border-color);
  }

  .textarea--standard:hover:not(.textarea--disabled) {
    background-color: var(--sl-input-background-color-hover);
    border-color: var(--sl-input-border-color-hover);
  }
  .textarea--standard:hover:not(.textarea--disabled) .textarea__control {
    color: var(--sl-input-color-hover);
  }

  .textarea--standard.textarea--focused:not(.textarea--disabled) {
    background-color: var(--sl-input-background-color-focus);
    border-color: var(--sl-input-border-color-focus);
    color: var(--sl-input-color-focus);
    box-shadow: 0 0 0 var(--sl-focus-ring-width) var(--sl-input-focus-ring-color);
  }

  .textarea--standard.textarea--focused:not(.textarea--disabled) .textarea__control {
    color: var(--sl-input-color-focus);
  }

  .textarea--standard.textarea--disabled {
    background-color: var(--sl-input-background-color-disabled);
    border-color: var(--sl-input-border-color-disabled);
    opacity: 0.5;
    cursor: not-allowed;
  }

  .textarea__control,
  .textarea__size-adjuster {
    grid-area: 1 / 1 / 2 / 2;
  }

  .textarea__size-adjuster {
    visibility: hidden;
    pointer-events: none;
    opacity: 0;
  }

  .textarea--standard.textarea--disabled .textarea__control {
    color: var(--sl-input-color-disabled);
  }

  .textarea--standard.textarea--disabled .textarea__control::placeholder {
    color: var(--sl-input-placeholder-color-disabled);
  }

  /* Filled textareas */
  .textarea--filled {
    border: none;
    background-color: var(--sl-input-filled-background-color);
    color: var(--sl-input-color);
  }

  .textarea--filled:hover:not(.textarea--disabled) {
    background-color: var(--sl-input-filled-background-color-hover);
  }

  .textarea--filled.textarea--focused:not(.textarea--disabled) {
    background-color: var(--sl-input-filled-background-color-focus);
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }

  .textarea--filled.textarea--disabled {
    background-color: var(--sl-input-filled-background-color-disabled);
    opacity: 0.5;
    cursor: not-allowed;
  }

  .textarea__control {
    font-family: inherit;
    font-size: inherit;
    font-weight: inherit;
    line-height: 1.4;
    color: var(--sl-input-color);
    border: none;
    background: none;
    box-shadow: none;
    cursor: inherit;
    -webkit-appearance: none;
  }

  .textarea__control::-webkit-search-decoration,
  .textarea__control::-webkit-search-cancel-button,
  .textarea__control::-webkit-search-results-button,
  .textarea__control::-webkit-search-results-decoration {
    -webkit-appearance: none;
  }

  .textarea__control::placeholder {
    color: var(--sl-input-placeholder-color);
    user-select: none;
    -webkit-user-select: none;
  }

  .textarea__control:focus {
    outline: none;
  }

  /*
   * Size modifiers
   */

  .textarea--small {
    border-radius: var(--sl-input-border-radius-small);
    font-size: var(--sl-input-font-size-small);
  }

  .textarea--small .textarea__control {
    padding: 0.5em var(--sl-input-spacing-small);
  }

  .textarea--medium {
    border-radius: var(--sl-input-border-radius-medium);
    font-size: var(--sl-input-font-size-medium);
  }

  .textarea--medium .textarea__control {
    padding: 0.5em var(--sl-input-spacing-medium);
  }

  .textarea--large {
    border-radius: var(--sl-input-border-radius-large);
    font-size: var(--sl-input-font-size-large);
  }

  .textarea--large .textarea__control {
    padding: 0.5em var(--sl-input-spacing-large);
  }

  /*
   * Resize types
   */

  .textarea--resize-none .textarea__control {
    resize: none;
  }

  .textarea--resize-vertical .textarea__control {
    resize: vertical;
  }

  .textarea--resize-auto .textarea__control {
    height: auto;
    resize: none;
    overflow-y: hidden;
  }
`,N=class extends ht{constructor(){super(...arguments),this.formControlController=new Ne(this,{assumeInteractionOn:["sl-blur","sl-input"]}),this.hasSlotController=new He(this,"help-text","label"),this.hasFocus=!1,this.title="",this.name="",this.value="",this.size="medium",this.filled=!1,this.label="",this.helpText="",this.placeholder="",this.rows=4,this.resize="vertical",this.disabled=!1,this.readonly=!1,this.form="",this.required=!1,this.spellcheck=!0,this.defaultValue=""}get validity(){return this.input.validity}get validationMessage(){return this.input.validationMessage}connectedCallback(){super.connectedCallback(),this.resizeObserver=new ResizeObserver(()=>this.setTextareaHeight()),this.updateComplete.then(()=>{this.setTextareaHeight(),this.resizeObserver.observe(this.input)})}firstUpdated(){this.formControlController.updateValidity()}disconnectedCallback(){var t;super.disconnectedCallback(),this.input&&((t=this.resizeObserver)==null||t.unobserve(this.input))}handleBlur(){this.hasFocus=!1,this.emit("sl-blur")}handleChange(){this.value=this.input.value,this.setTextareaHeight(),this.emit("sl-change")}handleFocus(){this.hasFocus=!0,this.emit("sl-focus")}handleInput(){this.value=this.input.value,this.emit("sl-input")}handleInvalid(t){this.formControlController.setValidity(!1),this.formControlController.emitInvalidEvent(t)}setTextareaHeight(){this.resize==="auto"?(this.sizeAdjuster.style.height=`${this.input.clientHeight}px`,this.input.style.height="auto",this.input.style.height=`${this.input.scrollHeight}px`):this.input.style.height=""}handleDisabledChange(){this.formControlController.setValidity(this.disabled)}handleRowsChange(){this.setTextareaHeight()}async handleValueChange(){await this.updateComplete,this.formControlController.updateValidity(),this.setTextareaHeight()}focus(t){this.input.focus(t)}blur(){this.input.blur()}select(){this.input.select()}scrollPosition(t){if(t){typeof t.top=="number"&&(this.input.scrollTop=t.top),typeof t.left=="number"&&(this.input.scrollLeft=t.left);return}return{top:this.input.scrollTop,left:this.input.scrollTop}}setSelectionRange(t,e,r="none"){this.input.setSelectionRange(t,e,r)}setRangeText(t,e,r,n="preserve"){const i=e??this.input.selectionStart,s=r??this.input.selectionEnd;this.input.setRangeText(t,i,s,n),this.value!==this.input.value&&(this.value=this.input.value,this.setTextareaHeight())}checkValidity(){return this.input.checkValidity()}getForm(){return this.formControlController.getForm()}reportValidity(){return this.input.reportValidity()}setCustomValidity(t){this.input.setCustomValidity(t),this.formControlController.updateValidity()}render(){const t=this.hasSlotController.test("label"),e=this.hasSlotController.test("help-text"),r=this.label?!0:!!t,n=this.helpText?!0:!!e;return Q`
      <div
        part="form-control"
        class=${ft({"form-control":!0,"form-control--small":this.size==="small","form-control--medium":this.size==="medium","form-control--large":this.size==="large","form-control--has-label":r,"form-control--has-help-text":n})}
      >
        <label
          part="form-control-label"
          class="form-control__label"
          for="input"
          aria-hidden=${r?"false":"true"}
        >
          <slot name="label">${this.label}</slot>
        </label>

        <div part="form-control-input" class="form-control-input">
          <div
            part="base"
            class=${ft({textarea:!0,"textarea--small":this.size==="small","textarea--medium":this.size==="medium","textarea--large":this.size==="large","textarea--standard":!this.filled,"textarea--filled":this.filled,"textarea--disabled":this.disabled,"textarea--focused":this.hasFocus,"textarea--empty":!this.value,"textarea--resize-none":this.resize==="none","textarea--resize-vertical":this.resize==="vertical","textarea--resize-auto":this.resize==="auto"})}
          >
            <textarea
              part="textarea"
              id="input"
              class="textarea__control"
              title=${this.title}
              name=${P(this.name)}
              .value=${cr(this.value)}
              ?disabled=${this.disabled}
              ?readonly=${this.readonly}
              ?required=${this.required}
              placeholder=${P(this.placeholder)}
              rows=${P(this.rows)}
              minlength=${P(this.minlength)}
              maxlength=${P(this.maxlength)}
              autocapitalize=${P(this.autocapitalize)}
              autocorrect=${P(this.autocorrect)}
              ?autofocus=${this.autofocus}
              spellcheck=${P(this.spellcheck)}
              enterkeyhint=${P(this.enterkeyhint)}
              inputmode=${P(this.inputmode)}
              aria-describedby="help-text"
              @change=${this.handleChange}
              @input=${this.handleInput}
              @invalid=${this.handleInvalid}
              @focus=${this.handleFocus}
              @blur=${this.handleBlur}
            ></textarea>
            <!-- This "adjuster" exists to prevent layout shifting. https://github.com/shoelace-style/shoelace/issues/2180 -->
            <div part="textarea-adjuster" class="textarea__size-adjuster" ?hidden=${this.resize!=="auto"}></div>
          </div>
        </div>

        <div
          part="form-control-help-text"
          id="help-text"
          class="form-control__help-text"
          aria-hidden=${n?"false":"true"}
        >
          <slot name="help-text">${this.helpText}</slot>
        </div>
      </div>
    `}};N.styles=[zt,xr,za];d([gt(".textarea__control")],N.prototype,"input",2);d([gt(".textarea__size-adjuster")],N.prototype,"sizeAdjuster",2);d([ut()],N.prototype,"hasFocus",2);d([m()],N.prototype,"title",2);d([m()],N.prototype,"name",2);d([m()],N.prototype,"value",2);d([m({reflect:!0})],N.prototype,"size",2);d([m({type:Boolean,reflect:!0})],N.prototype,"filled",2);d([m()],N.prototype,"label",2);d([m({attribute:"help-text"})],N.prototype,"helpText",2);d([m()],N.prototype,"placeholder",2);d([m({type:Number})],N.prototype,"rows",2);d([m()],N.prototype,"resize",2);d([m({type:Boolean,reflect:!0})],N.prototype,"disabled",2);d([m({type:Boolean,reflect:!0})],N.prototype,"readonly",2);d([m({reflect:!0})],N.prototype,"form",2);d([m({type:Boolean,reflect:!0})],N.prototype,"required",2);d([m({type:Number})],N.prototype,"minlength",2);d([m({type:Number})],N.prototype,"maxlength",2);d([m()],N.prototype,"autocapitalize",2);d([m()],N.prototype,"autocorrect",2);d([m()],N.prototype,"autocomplete",2);d([m({type:Boolean})],N.prototype,"autofocus",2);d([m()],N.prototype,"enterkeyhint",2);d([m({type:Boolean,converter:{fromAttribute:t=>!(!t||t==="false"),toAttribute:t=>t?"true":"false"}})],N.prototype,"spellcheck",2);d([m()],N.prototype,"inputmode",2);d([Sn()],N.prototype,"defaultValue",2);d([ot("disabled",{waitUntilFirstUpdate:!0})],N.prototype,"handleDisabledChange",1);d([ot("rows",{waitUntilFirstUpdate:!0})],N.prototype,"handleRowsChange",1);d([ot("value",{waitUntilFirstUpdate:!0})],N.prototype,"handleValueChange",1);N.define("sl-textarea");var Ra=O("<p class=retrofit-muted>Loading..."),Ta=O("<p class=retrofit-error-message>Error: "),Pa=O("<div class=retrofit-view>"),Oa=O("<p class=retrofit-error-message>"),La=O("<sl-button type=button variant=danger>Delete",!0,!1,!1),Ba=O("<div><button type=button class=retrofit-back-btn>&larr; Back</button><h1 class=retrofit-page-title></h1><form style=display:flex;flex-direction:column;gap:var(--sl-spacing-medium)><div class=retrofit-form-actions><sl-button type=submit variant=primary>",!0,!1,!1),Ia=O("<sl-textarea>",!0,!1,!1),Da=O("<sl-select><sl-option value>-- select --",!0,!1,!1),Va=O("<sl-checkbox>",!0,!1,!1),Ma=O("<sl-input>",!0,!1,!1),Fa=O('<p role=alert style="margin:var(--sl-spacing-2x-small) 0 0;font-size:var(--sl-font-size-small);color:var(--sl-color-danger-600)">'),Na=O("<div>"),Ha=O("<sl-option>",!0,!1,!1);async function Ua(t,e,r){var u;const i=await fetch(`${r}/${t}/${e??"new"}`);if(!i.ok)throw new Error(`Failed to fetch form spec for ${t}`);const s=await i.json();if(!e||e==="new")return{spec:s,entity:{}};const o=(u=s.endpoints)==null?void 0:u.find;if(!o)return{spec:s,entity:{}};const l=o.url.replace("{id}",e),a=await fetch(l);if(!a.ok)throw new Error(`Failed to fetch entity from ${l}`);const c=await a.json();return{spec:s,entity:c}}function yi(){const t=mn(),e=yr(),r=Ve(zr),n=()=>!t.id||t.id==="new",[i]=ln(()=>({resource:t.resource,id:t.id}),({resource:s,id:o})=>Ua(s,o,r));return(()=>{var s=Pa();return E(s,A(H,{get when(){return i.loading},get children(){return Ra()}}),null),E(s,A(H,{get when(){return i.error},get children(){var o=Ta();return o.firstChild,E(o,()=>String(i.error),null),o}}),null),E(s,A(H,{get when(){return i()},children:o=>A(qa,{get spec(){return o().spec},get entity(){return o().entity},get resource(){return t.resource},get id(){return Ft(()=>!!n())()?void 0:t.id},onDone:()=>e(`/${t.resource}`)})}),null),s})()}function ja(t){const e=t.endsWith("s")?t.slice(0,-1):t;return e.charAt(0).toUpperCase()+e.slice(1)}function qa(t){const e=()=>{var w,b;if(t.id){const S=(w=t.spec.endpoints)==null?void 0:w.update;return S?{method:S.method,url:S.url.replace("{id}",t.id)}:void 0}return(b=t.spec.endpoints)==null?void 0:b.create},r=()=>{var b;if(!t.id)return;const w=(b=t.spec.endpoints)==null?void 0:b.delete;if(w)return{method:w.method,url:w.url.replace("{id}",t.id)}},n=()=>t.id?"Save":"Create",i=()=>{var b;const w=((b=t.spec.metadata)==null?void 0:b.title)??ja(t.resource);return t.id?`Edit ${w}`:`New ${w}`},s=()=>t.id?t.spec.fields:t.spec.fields.filter(w=>!w.readOnly),o=()=>Object.fromEntries(s().map(w=>{const b=t.entity[w.name];return b!==void 0?[w.name,b]:w.type==="checkbox"?[w.name,!1]:[w.name,""]})),[l,a]=et(o()),[c,u]=et({}),[h,p]=et(!1),[g,f]=et(void 0);function v(w,b){a(S=>({...S,[w]:b}))}function y(){const w={};for(const b of s()){if(b.readOnly)continue;const S=l()[b.name];b.required&&(S===void 0||S===""||S===null)&&(w[b.name]=`${b.label} is required`)}return u(w),Object.keys(w).length===0}async function k(w){if(w.preventDefault(),!y())return;const b=e();if(b){p(!0),f(void 0);try{const S=await fetch(b.url,{method:b.method,headers:{"Content-Type":"application/json"},body:JSON.stringify(l())});if(!S.ok){const T=await S.json().catch(()=>({}));f(String(T.error??`Request failed: ${S.status}`));return}t.onDone()}catch(S){f(String(S))}finally{p(!1)}}}async function x(){const w=r();if(w&&confirm("Delete this item?"))try{const b=await fetch(w.url,{method:w.method});if(!b.ok){alert(`Delete failed: ${b.status}`);return}t.onDone()}catch(b){alert(`Delete failed: ${String(b)}`)}}return(()=>{var w=Ba(),b=w.firstChild,S=b.nextSibling,T=S.nextSibling,W=T.firstChild,it=W.firstChild;return lt(b,"click",t.onDone,!0),E(S,i),T.addEventListener("submit",k),E(T,A(Ht,{get each(){return s()},children:C=>{const L=()=>C.label+(C.required?" *":""),K=()=>c()[C.name],M=()=>String(l()[C.name]??""),rt=()=>C.type==="textarea"||C.type==="markdown";return(()=>{var z=Na();return E(z,A(H,{get when(){return rt()},get children(){var _=Ia();return lt(_,"sl-input",$=>v(C.name,$.target.value)),_._$owner=tt(),G($=>{var R=L(),F=C.placeholder,X=C.type==="markdown"?C.helpText??"Markdown supported":C.helpText??void 0,dt=C.readOnly||void 0,pt=M(),bt=C.type==="markdown"?12:4,It=!!K()||void 0;return R!==$.e&&(_.label=$.e=R),F!==$.t&&(_.placeholder=$.t=F),X!==$.a&&(_.helpText=$.a=X),dt!==$.o&&(_.disabled=$.o=dt),pt!==$.i&&(_.value=$.i=pt),bt!==$.n&&(_.rows=$.n=bt),It!==$.s&&(_.invalid=$.s=It),$},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0,n:void 0,s:void 0}),_}}),null),E(z,A(H,{get when(){return C.type==="select"},get children(){var _=Da(),$=_.firstChild;return lt(_,"sl-change",R=>v(C.name,R.target.value)),_._$owner=tt(),$._$owner=tt(),E(_,A(Ht,{get each(){return C.options},children:R=>(()=>{var F=Ha();return F._$owner=tt(),E(F,()=>R.label),G(()=>F.value=String(R.value)),F})()}),null),G(R=>{var F=L(),X=C.helpText??void 0,dt=C.readOnly||void 0,pt=M(),bt=!!K()||void 0;return F!==R.e&&(_.label=R.e=F),X!==R.t&&(_.helpText=R.t=X),dt!==R.a&&(_.disabled=R.a=dt),pt!==R.o&&(_.value=R.o=pt),bt!==R.i&&(_.invalid=R.i=bt),R},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0}),_}}),null),E(z,A(H,{get when(){return C.type==="checkbox"},get children(){var _=Va();return lt(_,"sl-change",$=>v(C.name,$.target.checked)),_._$owner=tt(),E(_,L),G($=>{var R=C.readOnly||void 0,F=!!l()[C.name],X=!!K()||void 0;return R!==$.e&&(_.disabled=$.e=R),F!==$.t&&(_.checked=$.t=F),X!==$.a&&(_.invalid=$.a=X),$},{e:void 0,t:void 0,a:void 0}),_}}),null),E(z,A(H,{get when(){return Ft(()=>!rt()&&C.type!=="select")()&&C.type!=="checkbox"},get children(){var _=Ma();return lt(_,"sl-input",$=>{const R=$.target.value;v(C.name,C.type==="number"&&R!==""?Number(R):R)}),_._$owner=tt(),G($=>{var R=L(),F=C.type,X=C.placeholder,dt=C.helpText??void 0,pt=C.readOnly||void 0,bt=M(),It=!!K()||void 0;return R!==$.e&&(_.label=$.e=R),F!==$.t&&(_.type=$.t=F),X!==$.a&&(_.placeholder=$.a=X),dt!==$.o&&(_.helpText=$.o=dt),pt!==$.i&&(_.disabled=$.i=pt),bt!==$.n&&(_.value=$.n=bt),It!==$.s&&(_.invalid=$.s=It),$},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0,n:void 0,s:void 0}),_}}),null),E(z,A(H,{get when(){return K()},get children(){var _=Fa();return E(_,K),_}}),null),z})()}}),W),E(T,A(H,{get when(){return g()},get children(){var C=Oa();return E(C,g),C}}),W),it._$owner=tt(),E(it,n),E(W,A(H,{get when(){return r()},get children(){var C=La();return lt(C,"click",x),C._$owner=tt(),C}}),null),G(()=>it.disabled=h()),w})()}br(["click"]);function Tn(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}var le=Tn();function bs(t){le=t}var Qt={exec:()=>null};function ce(t){let e=[];return r=>{let n=Math.max(0,Math.min(3,r-1)),i=e[n];return i||(i=t(n),e[n]=i),i}}function D(t,e=""){let r=typeof t=="string"?t:t.source,n={replace:(i,s)=>{let o=typeof s=="string"?s:s.source;return o=o.replace(at.caret,"$1"),r=r.replace(i,o),n},getRegex:()=>new RegExp(r,e)};return n}var Wa=((t="")=>{try{return!!new RegExp("(?<=1)(?<!1)"+t)}catch{return!1}})(),at={codeRemoveIndent:/^(?: {1,4}| {0,3}\t)/gm,outputLinkReplace:/\\([\[\]])/g,indentCodeCompensation:/^(\s+)(?:```)/,beginningSpace:/^\s+/,endingHash:/#$/,startingSpaceChar:/^ /,endingSpaceChar:/ $/,nonSpaceChar:/[^ ]/,newLineCharGlobal:/\n/g,tabCharGlobal:/\t/g,multipleSpaceGlobal:/\s+/g,blankLine:/^[ \t]*$/,doubleBlankLine:/\n[ \t]*\n[ \t]*$/,blockquoteStart:/^ {0,3}>/,blockquoteSetextReplace:/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,blockquoteSetextReplace2:/^ {0,3}>[ \t]?/gm,listReplaceNesting:/^ {1,4}(?=( {4})*[^ ])/g,listIsTask:/^\[[ xX]\] +\S/,listReplaceTask:/^\[[ xX]\] +/,listTaskCheckbox:/\[[ xX]\]/,anyLine:/\n.*\n/,hrefBrackets:/^<(.*)>$/,tableDelimiter:/[:|]/,tableAlignChars:/^\||\| *$/g,tableRowBlankLine:/\n[ \t]*$/,tableAlignRight:/^ *-+: *$/,tableAlignCenter:/^ *:-+: *$/,tableAlignLeft:/^ *:-+ *$/,startATag:/^<a /i,endATag:/^<\/a>/i,startPreScriptTag:/^<(pre|code|kbd|script)(\s|>)/i,endPreScriptTag:/^<\/(pre|code|kbd|script)(\s|>)/i,startAngleBracket:/^</,endAngleBracket:/>$/,pedanticHrefTitle:/^([^'"]*[^\s])\s+(['"])(.*)\2/,unicodeAlphaNumeric:/[\p{L}\p{N}]/u,escapeTest:/[&<>"']/,escapeReplace:/[&<>"']/g,escapeTestNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,escapeReplaceNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,caret:/(^|[^\[])\^/g,percentDecode:/%25/g,findPipe:/\|/g,splitPipe:/ \|/,slashPipe:/\\\|/g,carriageReturn:/\r\n|\r/g,spaceLine:/^ +$/gm,notSpaceStart:/^\S*/,endingNewline:/\n$/,listItemRegex:t=>new RegExp(`^( {0,3}${t})((?:[	 ][^\\n]*)?(?:\\n|$))`),nextBulletRegex:ce(t=>new RegExp(`^ {0,${t}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`)),hrRegex:ce(t=>new RegExp(`^ {0,${t}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`)),fencesBeginRegex:ce(t=>new RegExp(`^ {0,${t}}(?:\`\`\`|~~~)`)),headingBeginRegex:ce(t=>new RegExp(`^ {0,${t}}#`)),htmlBeginRegex:ce(t=>new RegExp(`^ {0,${t}}<(?:[a-z].*>|!--)`,"i")),blockquoteBeginRegex:ce(t=>new RegExp(`^ {0,${t}}>`))},Ka=/^(?:[ \t]*(?:\n|$))+/,Za=/^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/,Xa=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,je=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,Ya=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,Pn=/ {0,3}(?:[*+-]|\d{1,9}[.)])/,vs=/^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,ys=D(vs).replace(/bull/g,Pn).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/\|table/g,"").getRegex(),Qa=D(vs).replace(/bull/g,Pn).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/table/g,/ {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(),On=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,Ga=/^[^\n]+/,Ln=/(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/,Ja=D(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label",Ln).replace("title",/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),tc=D(/^(bull)([ \t][^\n]*?)?(?:\n|$)/).replace(/bull/g,Pn).getRegex(),Ar="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",Bn=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,ec=D("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))","i").replace("comment",Bn).replace("tag",Ar).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),ws=D(On).replace("hr",je).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)])[ \\t]+[^ \\t\\n]").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",Ar).getRegex(),rc=D(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph",ws).getRegex(),In={blockquote:rc,code:Za,def:Ja,fences:Xa,heading:Ya,hr:je,html:ec,lheading:ys,list:tc,newline:Ka,paragraph:ws,table:Qt,text:Ga},wi=D("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr",je).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("blockquote"," {0,3}>").replace("code","(?: {4}| {0,3}	)[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",Ar).getRegex(),nc={...In,lheading:Qa,table:wi,paragraph:D(On).replace("hr",je).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("table",wi).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)])[ \\t]+[^ \\t\\n]").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",Ar).getRegex()},ic={...In,html:D(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment",Bn).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:Qt,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:D(On).replace("hr",je).replace("heading",` *#{1,6} *[^
]`).replace("lheading",ys).replace("|table","").replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").replace("|tag","").getRegex()},sc=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,oc=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,xs=/^( {2,}|\\)\n(?!\s*$)/,lc=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,ye=/[\p{P}\p{S}]/u,Er=/[\s\p{P}\p{S}]/u,Dn=/[^\s\p{P}\p{S}]/u,ac=D(/^((?![*_])punctSpace)/,"u").replace(/punctSpace/g,Er).getRegex(),ks=/(?!~)[\p{P}\p{S}]/u,cc=/(?!~)[\s\p{P}\p{S}]/u,uc=/(?:[^\s\p{P}\p{S}]|~)/u,hc=D(/link|precode-code|html/,"g").replace("link",/\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace("precode-",Wa?"(?<!`)()":"(^^|[^`])").replace("code",/(?<b>`+)[^`]+\k<b>(?!`)/).replace("html",/<(?! )[^<>]*?>/).getRegex(),_s=/^(?:\*+(?:((?!\*)punct)|([^\s*]))?)|^_+(?:((?!_)punct)|([^\s_]))?/,dc=D(_s,"u").replace(/punct/g,ye).getRegex(),pc=D(_s,"u").replace(/punct/g,ks).getRegex(),$s="^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)",fc=D($s,"gu").replace(/notPunctSpace/g,Dn).replace(/punctSpace/g,Er).replace(/punct/g,ye).getRegex(),gc=D($s,"gu").replace(/notPunctSpace/g,uc).replace(/punctSpace/g,cc).replace(/punct/g,ks).getRegex(),mc=D("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)","gu").replace(/notPunctSpace/g,Dn).replace(/punctSpace/g,Er).replace(/punct/g,ye).getRegex(),bc=D(/^~~?(?:((?!~)punct)|[^\s~])/,"u").replace(/punct/g,ye).getRegex(),vc="^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)",yc=D(vc,"gu").replace(/notPunctSpace/g,Dn).replace(/punctSpace/g,Er).replace(/punct/g,ye).getRegex(),wc=D(/\\(punct)/,"gu").replace(/punct/g,ye).getRegex(),xc=D(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme",/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email",/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),kc=D(Bn).replace("(?:-->|$)","-->").getRegex(),_c=D("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment",kc).replace("attribute",/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),pr=/(?:\[(?:\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\])|[^\[\]\\`])*?/,$c=D(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]+(?:\n[ \t]*)?|\n[ \t]*)(title))?\s*\)/).replace("label",pr).replace("href",/<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title",/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),Cs=D(/^!?\[(label)\]\[(ref)\]/).replace("label",pr).replace("ref",Ln).getRegex(),Ss=D(/^!?\[(ref)\](?:\[\])?/).replace("ref",Ln).getRegex(),Cc=D("reflink|nolink(?!\\()","g").replace("reflink",Cs).replace("nolink",Ss).getRegex(),xi=/[hH][tT][tT][pP][sS]?|[fF][tT][pP]/,Vn={_backpedal:Qt,anyPunctuation:wc,autolink:xc,blockSkip:hc,br:xs,code:oc,del:Qt,delLDelim:Qt,delRDelim:Qt,emStrongLDelim:dc,emStrongRDelimAst:fc,emStrongRDelimUnd:mc,escape:sc,link:$c,nolink:Ss,punctuation:ac,reflink:Cs,reflinkSearch:Cc,tag:_c,text:lc,url:Qt},Sc={...Vn,link:D(/^!?\[(label)\]\((.*?)\)/).replace("label",pr).getRegex(),reflink:D(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",pr).getRegex()},nn={...Vn,emStrongRDelimAst:gc,emStrongLDelim:pc,delLDelim:bc,delRDelim:yc,url:D(/^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("protocol",xi).replace("email",/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/,text:D(/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/).replace("protocol",xi).getRegex()},Ac={...nn,br:D(xs).replace("{2,}","*").getRegex(),text:D(nn.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()},Xe={normal:In,gfm:nc,pedantic:ic},Se={normal:Vn,gfm:nn,breaks:Ac,pedantic:Sc},Ec={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},ki=t=>Ec[t];function Rt(t,e){if(e){if(at.escapeTest.test(t))return t.replace(at.escapeReplace,ki)}else if(at.escapeTestNoEncode.test(t))return t.replace(at.escapeReplaceNoEncode,ki);return t}function _i(t){try{t=encodeURI(t).replace(at.percentDecode,"%")}catch{return null}return t}function $i(t,e){var s;let r=t.replace(at.findPipe,(o,l,a)=>{let c=!1,u=l;for(;--u>=0&&a[u]==="\\";)c=!c;return c?"|":" |"}),n=r.split(at.splitPipe),i=0;if(n[0].trim()||n.shift(),n.length>0&&!((s=n.at(-1))!=null&&s.trim())&&n.pop(),e)if(n.length>e)n.splice(e);else for(;n.length<e;)n.push("");for(;i<n.length;i++)n[i]=n[i].trim().replace(at.slashPipe,"|");return n}function Dt(t,e,r){let n=t.length;if(n===0)return"";let i=0;for(;i<n&&t.charAt(n-i-1)===e;)i++;return t.slice(0,n-i)}function Ci(t){let e=t.split(`
`),r=e.length-1;for(;r>=0&&at.blankLine.test(e[r]);)r--;return e.length-r<=2?t:e.slice(0,r+1).join(`
`)}function zc(t,e){if(t.indexOf(e[1])===-1)return-1;let r=0;for(let n=0;n<t.length;n++)if(t[n]==="\\")n++;else if(t[n]===e[0])r++;else if(t[n]===e[1]&&(r--,r<0))return n;return r>0?-2:-1}function Rc(t,e=0){let r=e,n="";for(let i of t)if(i==="	"){let s=4-r%4;n+=" ".repeat(s),r+=s}else n+=i,r++;return n}function Si(t,e,r,n,i){let s=e.href,o=e.title||null,l=t[1].replace(i.other.outputLinkReplace,"$1");n.state.inLink=!0;let a={type:t[0].charAt(0)==="!"?"image":"link",raw:r,href:s,title:o,text:l,tokens:n.inlineTokens(l)};return n.state.inLink=!1,a}function Tc(t,e,r){let n=t.match(r.other.indentCodeCompensation);if(n===null)return e;let i=n[1];return e.split(`
`).map(s=>{let o=s.match(r.other.beginningSpace);if(o===null)return s;let[l]=o;return l.length>=i.length?s.slice(i.length):s}).join(`
`)}var fr=class{constructor(t){Z(this,"options");Z(this,"rules");Z(this,"lexer");this.options=t||le}space(t){let e=this.rules.block.newline.exec(t);if(e&&e[0].length>0)return{type:"space",raw:e[0]}}code(t){let e=this.rules.block.code.exec(t);if(e){let r=this.options.pedantic?e[0]:Ci(e[0]),n=r.replace(this.rules.other.codeRemoveIndent,"");return{type:"code",raw:r,codeBlockStyle:"indented",text:n}}}fences(t){let e=this.rules.block.fences.exec(t);if(e){let r=e[0],n=Tc(r,e[3]||"",this.rules);return{type:"code",raw:r,lang:e[2]?e[2].trim().replace(this.rules.inline.anyPunctuation,"$1"):e[2],text:n}}}heading(t){let e=this.rules.block.heading.exec(t);if(e){let r=e[2].trim();if(this.rules.other.endingHash.test(r)){let n=Dt(r,"#");(this.options.pedantic||!n||this.rules.other.endingSpaceChar.test(n))&&(r=n.trim())}return{type:"heading",raw:Dt(e[0],`
`),depth:e[1].length,text:r,tokens:this.lexer.inline(r)}}}hr(t){let e=this.rules.block.hr.exec(t);if(e)return{type:"hr",raw:Dt(e[0],`
`)}}blockquote(t){let e=this.rules.block.blockquote.exec(t);if(e){let r=Dt(e[0],`
`).split(`
`),n="",i="",s=[];for(;r.length>0;){let o=!1,l=[],a;for(a=0;a<r.length;a++)if(this.rules.other.blockquoteStart.test(r[a]))l.push(r[a]),o=!0;else if(!o)l.push(r[a]);else break;r=r.slice(a);let c=l.join(`
`),u=c.replace(this.rules.other.blockquoteSetextReplace,`
    $1`).replace(this.rules.other.blockquoteSetextReplace2,"");n=n?`${n}
${c}`:c,i=i?`${i}
${u}`:u;let h=this.lexer.state.top;if(this.lexer.state.top=!0,this.lexer.blockTokens(u,s,!0),this.lexer.state.top=h,r.length===0)break;let p=s.at(-1);if((p==null?void 0:p.type)==="code")break;if((p==null?void 0:p.type)==="blockquote"){let g=p,f=g.raw+`
`+r.join(`
`),v=this.blockquote(f);s[s.length-1]=v,n=n.substring(0,n.length-g.raw.length)+v.raw,i=i.substring(0,i.length-g.text.length)+v.text;break}else if((p==null?void 0:p.type)==="list"){let g=p,f=g.raw+`
`+r.join(`
`),v=this.list(f);s[s.length-1]=v,n=n.substring(0,n.length-p.raw.length)+v.raw,i=i.substring(0,i.length-g.raw.length)+v.raw,r=f.substring(s.at(-1).raw.length).split(`
`);continue}}return{type:"blockquote",raw:n,tokens:s,text:i}}}list(t){let e=this.rules.block.list.exec(t);if(e){let r=e[1].trim(),n=r.length>1,i={type:"list",raw:"",ordered:n,start:n?+r.slice(0,-1):"",loose:!1,items:[]};r=n?`\\d{1,9}\\${r.slice(-1)}`:`\\${r}`,this.options.pedantic&&(r=n?r:"[*+-]");let s=this.rules.other.listItemRegex(r),o=!1;for(;t;){let a=!1,c="",u="";if(!(e=s.exec(t))||this.rules.block.hr.test(t))break;c=e[0],t=t.substring(c.length);let h=Rc(e[2].split(`
`,1)[0],e[1].length),p=t.split(`
`,1)[0],g=!h.trim(),f=0;if(this.options.pedantic?(f=2,u=h.trimStart()):g?f=e[1].length+1:(f=h.search(this.rules.other.nonSpaceChar),f=f>4?1:f,u=h.slice(f),f+=e[1].length),g&&this.rules.other.blankLine.test(p)&&(c+=p+`
`,t=t.substring(p.length+1),a=!0),!a){let v=this.rules.other.nextBulletRegex(f),y=this.rules.other.hrRegex(f),k=this.rules.other.fencesBeginRegex(f),x=this.rules.other.headingBeginRegex(f),w=this.rules.other.htmlBeginRegex(f),b=this.rules.other.blockquoteBeginRegex(f);for(;t;){let S=t.split(`
`,1)[0],T;if(p=S,this.options.pedantic?(p=p.replace(this.rules.other.listReplaceNesting,"  "),T=p):T=p.replace(this.rules.other.tabCharGlobal,"    "),k.test(p)||x.test(p)||w.test(p)||b.test(p)||v.test(p)||y.test(p))break;if(T.search(this.rules.other.nonSpaceChar)>=f||!p.trim())u+=`
`+T.slice(f);else{if(g||h.replace(this.rules.other.tabCharGlobal,"    ").search(this.rules.other.nonSpaceChar)>=4||k.test(h)||x.test(h)||y.test(h))break;u+=`
`+p}g=!p.trim(),c+=S+`
`,t=t.substring(S.length+1),h=T.slice(f)}}i.loose||(o?i.loose=!0:this.rules.other.doubleBlankLine.test(c)&&(o=!0)),i.items.push({type:"list_item",raw:c,task:!!this.options.gfm&&this.rules.other.listIsTask.test(u),loose:!1,text:u,tokens:[]}),i.raw+=c}let l=i.items.at(-1);if(l)l.raw=l.raw.trimEnd(),l.text=l.text.trimEnd();else return;i.raw=i.raw.trimEnd();for(let a of i.items){this.lexer.state.top=!1,a.tokens=this.lexer.blockTokens(a.text,[]);let c=a.tokens[0];if(a.task&&((c==null?void 0:c.type)==="text"||(c==null?void 0:c.type)==="paragraph")){a.text=a.text.replace(this.rules.other.listReplaceTask,""),c.raw=c.raw.replace(this.rules.other.listReplaceTask,""),c.text=c.text.replace(this.rules.other.listReplaceTask,"");for(let h=this.lexer.inlineQueue.length-1;h>=0;h--)if(this.rules.other.listIsTask.test(this.lexer.inlineQueue[h].src)){this.lexer.inlineQueue[h].src=this.lexer.inlineQueue[h].src.replace(this.rules.other.listReplaceTask,"");break}let u=this.rules.other.listTaskCheckbox.exec(a.raw);if(u){let h={type:"checkbox",raw:u[0]+" ",checked:u[0]!=="[ ]"};a.checked=h.checked,i.loose?a.tokens[0]&&["paragraph","text"].includes(a.tokens[0].type)&&"tokens"in a.tokens[0]&&a.tokens[0].tokens?(a.tokens[0].raw=h.raw+a.tokens[0].raw,a.tokens[0].text=h.raw+a.tokens[0].text,a.tokens[0].tokens.unshift(h)):a.tokens.unshift({type:"paragraph",raw:h.raw,text:h.raw,tokens:[h]}):a.tokens.unshift(h)}}else a.task&&(a.task=!1);if(!i.loose){let u=a.tokens.filter(p=>p.type==="space"),h=u.length>0&&u.some(p=>this.rules.other.anyLine.test(p.raw));i.loose=h}}if(i.loose)for(let a of i.items){a.loose=!0;for(let c of a.tokens)c.type==="text"&&(c.type="paragraph")}return i}}html(t){let e=this.rules.block.html.exec(t);if(e){let r=Ci(e[0]);return{type:"html",block:!0,raw:r,pre:e[1]==="pre"||e[1]==="script"||e[1]==="style",text:r}}}def(t){let e=this.rules.block.def.exec(t);if(e){let r=e[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal," "),n=e[2]?e[2].replace(this.rules.other.hrefBrackets,"$1").replace(this.rules.inline.anyPunctuation,"$1"):"",i=e[3]?e[3].substring(1,e[3].length-1).replace(this.rules.inline.anyPunctuation,"$1"):e[3];return{type:"def",tag:r,raw:Dt(e[0],`
`),href:n,title:i}}}table(t){var o;let e=this.rules.block.table.exec(t);if(!e||!this.rules.other.tableDelimiter.test(e[2]))return;let r=$i(e[1]),n=e[2].replace(this.rules.other.tableAlignChars,"").split("|"),i=(o=e[3])!=null&&o.trim()?e[3].replace(this.rules.other.tableRowBlankLine,"").split(`
`):[],s={type:"table",raw:Dt(e[0],`
`),header:[],align:[],rows:[]};if(r.length===n.length){for(let l of n)this.rules.other.tableAlignRight.test(l)?s.align.push("right"):this.rules.other.tableAlignCenter.test(l)?s.align.push("center"):this.rules.other.tableAlignLeft.test(l)?s.align.push("left"):s.align.push(null);for(let l=0;l<r.length;l++)s.header.push({text:r[l],tokens:this.lexer.inline(r[l]),header:!0,align:s.align[l]});for(let l of i)s.rows.push($i(l,s.header.length).map((a,c)=>({text:a,tokens:this.lexer.inline(a),header:!1,align:s.align[c]})));return s}}lheading(t){let e=this.rules.block.lheading.exec(t);if(e){let r=e[1].trim();return{type:"heading",raw:Dt(e[0],`
`),depth:e[2].charAt(0)==="="?1:2,text:r,tokens:this.lexer.inline(r)}}}paragraph(t){let e=this.rules.block.paragraph.exec(t);if(e){let r=e[1].charAt(e[1].length-1)===`
`?e[1].slice(0,-1):e[1];return{type:"paragraph",raw:e[0],text:r,tokens:this.lexer.inline(r)}}}text(t){let e=this.rules.block.text.exec(t);if(e)return{type:"text",raw:e[0],text:e[0],tokens:this.lexer.inline(e[0])}}escape(t){let e=this.rules.inline.escape.exec(t);if(e)return{type:"escape",raw:e[0],text:e[1]}}tag(t){let e=this.rules.inline.tag.exec(t);if(e)return!this.lexer.state.inLink&&this.rules.other.startATag.test(e[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&this.rules.other.endATag.test(e[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&this.rules.other.startPreScriptTag.test(e[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&this.rules.other.endPreScriptTag.test(e[0])&&(this.lexer.state.inRawBlock=!1),{type:"html",raw:e[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:e[0]}}link(t){let e=this.rules.inline.link.exec(t);if(e){let r=e[2].trim();if(!this.options.pedantic&&this.rules.other.startAngleBracket.test(r)){if(!this.rules.other.endAngleBracket.test(r))return;let s=Dt(r.slice(0,-1),"\\");if((r.length-s.length)%2===0)return}else{let s=zc(e[2],"()");if(s===-2)return;if(s>-1){let o=(e[0].indexOf("!")===0?5:4)+e[1].length+s;e[2]=e[2].substring(0,s),e[0]=e[0].substring(0,o).trim(),e[3]=""}}let n=e[2],i="";if(this.options.pedantic){let s=this.rules.other.pedanticHrefTitle.exec(n);s&&(n=s[1],i=s[3])}else i=e[3]?e[3].slice(1,-1):"";return n=n.trim(),this.rules.other.startAngleBracket.test(n)&&(this.options.pedantic&&!this.rules.other.endAngleBracket.test(r)?n=n.slice(1):n=n.slice(1,-1)),Si(e,{href:n&&n.replace(this.rules.inline.anyPunctuation,"$1"),title:i&&i.replace(this.rules.inline.anyPunctuation,"$1")},e[0],this.lexer,this.rules)}}reflink(t,e){let r;if((r=this.rules.inline.reflink.exec(t))||(r=this.rules.inline.nolink.exec(t))){let n=(r[2]||r[1]).replace(this.rules.other.multipleSpaceGlobal," "),i=e[n.toLowerCase()];if(!i){let s=r[0].charAt(0);return{type:"text",raw:s,text:s}}return Si(r,i,r[0],this.lexer,this.rules)}}emStrong(t,e,r=""){let n=this.rules.inline.emStrongLDelim.exec(t);if(!(!n||!n[1]&&!n[2]&&!n[3]&&!n[4]||n[4]&&r.match(this.rules.other.unicodeAlphaNumeric))&&(!(n[1]||n[3])||!r||this.rules.inline.punctuation.exec(r))){let i=[...n[0]].length-1,s,o,l=i,a=0,c=n[0][0]==="*"?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(c.lastIndex=0,e=e.slice(-1*t.length+i);(n=c.exec(e))!==null;){if(s=n[1]||n[2]||n[3]||n[4]||n[5]||n[6],!s)continue;if(o=[...s].length,n[3]||n[4]){l+=o;continue}else if((n[5]||n[6])&&i%3&&!((i+o)%3)){a+=o;continue}if(l-=o,l>0)continue;o=Math.min(o,o+l+a);let u=[...n[0]][0].length,h=t.slice(0,i+n.index+u+o);if(Math.min(i,o)%2){let g=h.slice(1,-1);return{type:"em",raw:h,text:g,tokens:this.lexer.inlineTokens(g)}}let p=h.slice(2,-2);return{type:"strong",raw:h,text:p,tokens:this.lexer.inlineTokens(p)}}}}codespan(t){let e=this.rules.inline.code.exec(t);if(e){let r=e[2].replace(this.rules.other.newLineCharGlobal," "),n=this.rules.other.nonSpaceChar.test(r),i=this.rules.other.startingSpaceChar.test(r)&&this.rules.other.endingSpaceChar.test(r);return n&&i&&(r=r.substring(1,r.length-1)),{type:"codespan",raw:e[0],text:r}}}br(t){let e=this.rules.inline.br.exec(t);if(e)return{type:"br",raw:e[0]}}del(t,e,r=""){let n=this.rules.inline.delLDelim.exec(t);if(n&&(!n[1]||!r||this.rules.inline.punctuation.exec(r))){let i=[...n[0]].length-1,s,o,l=i,a=this.rules.inline.delRDelim;for(a.lastIndex=0,e=e.slice(-1*t.length+i);(n=a.exec(e))!==null;){if(s=n[1]||n[2]||n[3]||n[4]||n[5]||n[6],!s||(o=[...s].length,o!==i))continue;if(n[3]||n[4]){l+=o;continue}if(l-=o,l>0)continue;o=Math.min(o,o+l);let c=[...n[0]][0].length,u=t.slice(0,i+n.index+c+o),h=u.slice(i,-i);return{type:"del",raw:u,text:h,tokens:this.lexer.inlineTokens(h)}}}}autolink(t){let e=this.rules.inline.autolink.exec(t);if(e){let r,n;return e[2]==="@"?(r=e[1],n="mailto:"+r):(r=e[1],n=r),{type:"link",raw:e[0],text:r,href:n,tokens:[{type:"text",raw:r,text:r}]}}}url(t){var r;let e;if(e=this.rules.inline.url.exec(t)){let n,i;if(e[2]==="@")n=e[0],i="mailto:"+n;else{let s;do s=e[0],e[0]=((r=this.rules.inline._backpedal.exec(e[0]))==null?void 0:r[0])??"";while(s!==e[0]);n=e[0],e[1]==="www."?i="http://"+e[0]:i=e[0]}return{type:"link",raw:e[0],text:n,href:i,tokens:[{type:"text",raw:n,text:n}]}}}inlineText(t){let e=this.rules.inline.text.exec(t);if(e){let r=this.lexer.state.inRawBlock;return{type:"text",raw:e[0],text:e[0],escaped:r}}}},Ct=class sn{constructor(e){Z(this,"tokens");Z(this,"options");Z(this,"state");Z(this,"inlineQueue");Z(this,"tokenizer");this.tokens=[],this.tokens.links=Object.create(null),this.options=e||le,this.options.tokenizer=this.options.tokenizer||new fr,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};let r={other:at,block:Xe.normal,inline:Se.normal};this.options.pedantic?(r.block=Xe.pedantic,r.inline=Se.pedantic):this.options.gfm&&(r.block=Xe.gfm,this.options.breaks?r.inline=Se.breaks:r.inline=Se.gfm),this.tokenizer.rules=r}static get rules(){return{block:Xe,inline:Se}}static lex(e,r){return new sn(r).lex(e)}static lexInline(e,r){return new sn(r).inlineTokens(e)}lex(e){e=e.replace(at.carriageReturn,`
`),this.blockTokens(e,this.tokens);for(let r=0;r<this.inlineQueue.length;r++){let n=this.inlineQueue[r];this.inlineTokens(n.src,n.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,r=[],n=!1){var s,o,l;this.tokenizer.lexer=this,this.options.pedantic&&(e=e.replace(at.tabCharGlobal,"    ").replace(at.spaceLine,""));let i=1/0;for(;e;){if(e.length<i)i=e.length;else{this.infiniteLoopError(e.charCodeAt(0));break}let a;if((o=(s=this.options.extensions)==null?void 0:s.block)!=null&&o.some(u=>(a=u.call({lexer:this},e,r))?(e=e.substring(a.raw.length),r.push(a),!0):!1))continue;if(a=this.tokenizer.space(e)){e=e.substring(a.raw.length);let u=r.at(-1);a.raw.length===1&&u!==void 0?u.raw+=`
`:r.push(a);continue}if(a=this.tokenizer.code(e)){e=e.substring(a.raw.length);let u=r.at(-1);(u==null?void 0:u.type)==="paragraph"||(u==null?void 0:u.type)==="text"?(u.raw+=(u.raw.endsWith(`
`)?"":`
`)+a.raw,u.text+=`
`+a.text,this.inlineQueue.at(-1).src=u.text):r.push(a);continue}if(a=this.tokenizer.fences(e)){e=e.substring(a.raw.length),r.push(a);continue}if(a=this.tokenizer.heading(e)){e=e.substring(a.raw.length),r.push(a);continue}if(a=this.tokenizer.hr(e)){e=e.substring(a.raw.length),r.push(a);continue}if(a=this.tokenizer.blockquote(e)){e=e.substring(a.raw.length),r.push(a);continue}if(a=this.tokenizer.list(e)){e=e.substring(a.raw.length),r.push(a);continue}if(a=this.tokenizer.html(e)){e=e.substring(a.raw.length),r.push(a);continue}if(a=this.tokenizer.def(e)){e=e.substring(a.raw.length);let u=r.at(-1);(u==null?void 0:u.type)==="paragraph"||(u==null?void 0:u.type)==="text"?(u.raw+=(u.raw.endsWith(`
`)?"":`
`)+a.raw,u.text+=`
`+a.raw,this.inlineQueue.at(-1).src=u.text):this.tokens.links[a.tag]||(this.tokens.links[a.tag]={href:a.href,title:a.title},r.push(a));continue}if(a=this.tokenizer.table(e)){e=e.substring(a.raw.length),r.push(a);continue}if(a=this.tokenizer.lheading(e)){e=e.substring(a.raw.length),r.push(a);continue}let c=e;if((l=this.options.extensions)!=null&&l.startBlock){let u=1/0,h=e.slice(1),p;this.options.extensions.startBlock.forEach(g=>{p=g.call({lexer:this},h),typeof p=="number"&&p>=0&&(u=Math.min(u,p))}),u<1/0&&u>=0&&(c=e.substring(0,u+1))}if(this.state.top&&(a=this.tokenizer.paragraph(c))){let u=r.at(-1);n&&(u==null?void 0:u.type)==="paragraph"?(u.raw+=(u.raw.endsWith(`
`)?"":`
`)+a.raw,u.text+=`
`+a.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=u.text):r.push(a),n=c.length!==e.length,e=e.substring(a.raw.length);continue}if(a=this.tokenizer.text(e)){e=e.substring(a.raw.length);let u=r.at(-1);(u==null?void 0:u.type)==="text"?(u.raw+=(u.raw.endsWith(`
`)?"":`
`)+a.raw,u.text+=`
`+a.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=u.text):r.push(a);continue}if(e){this.infiniteLoopError(e.charCodeAt(0));break}}return this.state.top=!0,r}inline(e,r=[]){return this.inlineQueue.push({src:e,tokens:r}),r}inlineTokens(e,r=[]){var c,u,h,p,g;this.tokenizer.lexer=this;let n=e,i=null;if(this.tokens.links){let f=Object.keys(this.tokens.links);if(f.length>0)for(;(i=this.tokenizer.rules.inline.reflinkSearch.exec(n))!==null;)f.includes(i[0].slice(i[0].lastIndexOf("[")+1,-1))&&(n=n.slice(0,i.index)+"["+"a".repeat(i[0].length-2)+"]"+n.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))}for(;(i=this.tokenizer.rules.inline.anyPunctuation.exec(n))!==null;)n=n.slice(0,i.index)+"++"+n.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);let s;for(;(i=this.tokenizer.rules.inline.blockSkip.exec(n))!==null;)s=i[2]?i[2].length:0,n=n.slice(0,i.index+s)+"["+"a".repeat(i[0].length-s-2)+"]"+n.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);n=((u=(c=this.options.hooks)==null?void 0:c.emStrongMask)==null?void 0:u.call({lexer:this},n))??n;let o=!1,l="",a=1/0;for(;e;){if(e.length<a)a=e.length;else{this.infiniteLoopError(e.charCodeAt(0));break}o||(l=""),o=!1;let f;if((p=(h=this.options.extensions)==null?void 0:h.inline)!=null&&p.some(y=>(f=y.call({lexer:this},e,r))?(e=e.substring(f.raw.length),r.push(f),!0):!1))continue;if(f=this.tokenizer.escape(e)){e=e.substring(f.raw.length),r.push(f);continue}if(f=this.tokenizer.tag(e)){e=e.substring(f.raw.length),r.push(f);continue}if(f=this.tokenizer.link(e)){e=e.substring(f.raw.length),r.push(f);continue}if(f=this.tokenizer.reflink(e,this.tokens.links)){e=e.substring(f.raw.length);let y=r.at(-1);f.type==="text"&&(y==null?void 0:y.type)==="text"?(y.raw+=f.raw,y.text+=f.text):r.push(f);continue}if(f=this.tokenizer.emStrong(e,n,l)){e=e.substring(f.raw.length),r.push(f);continue}if(f=this.tokenizer.codespan(e)){e=e.substring(f.raw.length),r.push(f);continue}if(f=this.tokenizer.br(e)){e=e.substring(f.raw.length),r.push(f);continue}if(f=this.tokenizer.del(e,n,l)){e=e.substring(f.raw.length),r.push(f);continue}if(f=this.tokenizer.autolink(e)){e=e.substring(f.raw.length),r.push(f);continue}if(!this.state.inLink&&(f=this.tokenizer.url(e))){e=e.substring(f.raw.length),r.push(f);continue}let v=e;if((g=this.options.extensions)!=null&&g.startInline){let y=1/0,k=e.slice(1),x;this.options.extensions.startInline.forEach(w=>{x=w.call({lexer:this},k),typeof x=="number"&&x>=0&&(y=Math.min(y,x))}),y<1/0&&y>=0&&(v=e.substring(0,y+1))}if(f=this.tokenizer.inlineText(v)){e=e.substring(f.raw.length),f.raw.slice(-1)!=="_"&&(l=f.raw.slice(-1)),o=!0;let y=r.at(-1);(y==null?void 0:y.type)==="text"?(y.raw+=f.raw,y.text+=f.text):r.push(f);continue}if(e){this.infiniteLoopError(e.charCodeAt(0));break}}return r}infiniteLoopError(e){let r="Infinite loop on byte: "+e;if(this.options.silent)console.error(r);else throw new Error(r)}},gr=class{constructor(t){Z(this,"options");Z(this,"parser");this.options=t||le}space(t){return""}code({text:t,lang:e,escaped:r}){var s;let n=(s=(e||"").match(at.notSpaceStart))==null?void 0:s[0],i=t.replace(at.endingNewline,"")+`
`;return n?'<pre><code class="language-'+Rt(n)+'">'+(r?i:Rt(i,!0))+`</code></pre>
`:"<pre><code>"+(r?i:Rt(i,!0))+`</code></pre>
`}blockquote({tokens:t}){return`<blockquote>
${this.parser.parse(t)}</blockquote>
`}html({text:t}){return t}def(t){return""}heading({tokens:t,depth:e}){return`<h${e}>${this.parser.parseInline(t)}</h${e}>
`}hr(t){return`<hr>
`}list(t){let e=t.ordered,r=t.start,n="";for(let o=0;o<t.items.length;o++){let l=t.items[o];n+=this.listitem(l)}let i=e?"ol":"ul",s=e&&r!==1?' start="'+r+'"':"";return"<"+i+s+`>
`+n+"</"+i+`>
`}listitem(t){return`<li>${this.parser.parse(t.tokens)}</li>
`}checkbox({checked:t}){return"<input "+(t?'checked="" ':"")+'disabled="" type="checkbox"> '}paragraph({tokens:t}){return`<p>${this.parser.parseInline(t)}</p>
`}table(t){let e="",r="";for(let i=0;i<t.header.length;i++)r+=this.tablecell(t.header[i]);e+=this.tablerow({text:r});let n="";for(let i=0;i<t.rows.length;i++){let s=t.rows[i];r="";for(let o=0;o<s.length;o++)r+=this.tablecell(s[o]);n+=this.tablerow({text:r})}return n&&(n=`<tbody>${n}</tbody>`),`<table>
<thead>
`+e+`</thead>
`+n+`</table>
`}tablerow({text:t}){return`<tr>
${t}</tr>
`}tablecell(t){let e=this.parser.parseInline(t.tokens),r=t.header?"th":"td";return(t.align?`<${r} align="${t.align}">`:`<${r}>`)+e+`</${r}>
`}strong({tokens:t}){return`<strong>${this.parser.parseInline(t)}</strong>`}em({tokens:t}){return`<em>${this.parser.parseInline(t)}</em>`}codespan({text:t}){return`<code>${Rt(t,!0)}</code>`}br(t){return"<br>"}del({tokens:t}){return`<del>${this.parser.parseInline(t)}</del>`}link({href:t,title:e,tokens:r}){let n=this.parser.parseInline(r),i=_i(t);if(i===null)return n;t=i;let s='<a href="'+t+'"';return e&&(s+=' title="'+Rt(e)+'"'),s+=">"+n+"</a>",s}image({href:t,title:e,text:r,tokens:n}){n&&(r=this.parser.parseInline(n,this.parser.textRenderer));let i=_i(t);if(i===null)return Rt(r);t=i;let s=`<img src="${t}" alt="${Rt(r)}"`;return e&&(s+=` title="${Rt(e)}"`),s+=">",s}text(t){return"tokens"in t&&t.tokens?this.parser.parseInline(t.tokens):"escaped"in t&&t.escaped?t.text:Rt(t.text)}},Mn=class{strong({text:t}){return t}em({text:t}){return t}codespan({text:t}){return t}del({text:t}){return t}html({text:t}){return t}text({text:t}){return t}link({text:t}){return""+t}image({text:t}){return""+t}br(){return""}checkbox({raw:t}){return t}},St=class on{constructor(e){Z(this,"options");Z(this,"renderer");Z(this,"textRenderer");this.options=e||le,this.options.renderer=this.options.renderer||new gr,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new Mn}static parse(e,r){return new on(r).parse(e)}static parseInline(e,r){return new on(r).parseInline(e)}parse(e){var n,i;this.renderer.parser=this;let r="";for(let s=0;s<e.length;s++){let o=e[s];if((i=(n=this.options.extensions)==null?void 0:n.renderers)!=null&&i[o.type]){let a=o,c=this.options.extensions.renderers[a.type].call({parser:this},a);if(c!==!1||!["space","hr","heading","code","table","blockquote","list","html","def","paragraph","text"].includes(a.type)){r+=c||"";continue}}let l=o;switch(l.type){case"space":{r+=this.renderer.space(l);break}case"hr":{r+=this.renderer.hr(l);break}case"heading":{r+=this.renderer.heading(l);break}case"code":{r+=this.renderer.code(l);break}case"table":{r+=this.renderer.table(l);break}case"blockquote":{r+=this.renderer.blockquote(l);break}case"list":{r+=this.renderer.list(l);break}case"checkbox":{r+=this.renderer.checkbox(l);break}case"html":{r+=this.renderer.html(l);break}case"def":{r+=this.renderer.def(l);break}case"paragraph":{r+=this.renderer.paragraph(l);break}case"text":{r+=this.renderer.text(l);break}default:{let a='Token with "'+l.type+'" type was not found.';if(this.options.silent)return console.error(a),"";throw new Error(a)}}}return r}parseInline(e,r=this.renderer){var i,s;this.renderer.parser=this;let n="";for(let o=0;o<e.length;o++){let l=e[o];if((s=(i=this.options.extensions)==null?void 0:i.renderers)!=null&&s[l.type]){let c=this.options.extensions.renderers[l.type].call({parser:this},l);if(c!==!1||!["escape","html","link","image","strong","em","codespan","br","del","text"].includes(l.type)){n+=c||"";continue}}let a=l;switch(a.type){case"escape":{n+=r.text(a);break}case"html":{n+=r.html(a);break}case"link":{n+=r.link(a);break}case"image":{n+=r.image(a);break}case"checkbox":{n+=r.checkbox(a);break}case"strong":{n+=r.strong(a);break}case"em":{n+=r.em(a);break}case"codespan":{n+=r.codespan(a);break}case"br":{n+=r.br(a);break}case"del":{n+=r.del(a);break}case"text":{n+=r.text(a);break}default:{let c='Token with "'+a.type+'" type was not found.';if(this.options.silent)return console.error(c),"";throw new Error(c)}}}return n}},Ye,Ae=(Ye=class{constructor(t){Z(this,"options");Z(this,"block");this.options=t||le}preprocess(t){return t}postprocess(t){return t}processAllTokens(t){return t}emStrongMask(t){return t}provideLexer(t=this.block){return t?Ct.lex:Ct.lexInline}provideParser(t=this.block){return t?St.parse:St.parseInline}},Z(Ye,"passThroughHooks",new Set(["preprocess","postprocess","processAllTokens","emStrongMask"])),Z(Ye,"passThroughHooksRespectAsync",new Set(["preprocess","postprocess","processAllTokens"])),Ye),Pc=class{constructor(...t){Z(this,"defaults",Tn());Z(this,"options",this.setOptions);Z(this,"parse",this.parseMarkdown(!0));Z(this,"parseInline",this.parseMarkdown(!1));Z(this,"Parser",St);Z(this,"Renderer",gr);Z(this,"TextRenderer",Mn);Z(this,"Lexer",Ct);Z(this,"Tokenizer",fr);Z(this,"Hooks",Ae);this.use(...t)}walkTokens(t,e){var n,i;let r=[];for(let s of t)switch(r=r.concat(e.call(this,s)),s.type){case"table":{let o=s;for(let l of o.header)r=r.concat(this.walkTokens(l.tokens,e));for(let l of o.rows)for(let a of l)r=r.concat(this.walkTokens(a.tokens,e));break}case"list":{let o=s;r=r.concat(this.walkTokens(o.items,e));break}default:{let o=s;(i=(n=this.defaults.extensions)==null?void 0:n.childTokens)!=null&&i[o.type]?this.defaults.extensions.childTokens[o.type].forEach(l=>{let a=o[l].flat(1/0);r=r.concat(this.walkTokens(a,e))}):o.tokens&&(r=r.concat(this.walkTokens(o.tokens,e)))}}return r}use(...t){let e=this.defaults.extensions||{renderers:{},childTokens:{}};return t.forEach(r=>{let n={...r};if(n.async=this.defaults.async||n.async||!1,r.extensions&&(r.extensions.forEach(i=>{if(!i.name)throw new Error("extension name required");if("renderer"in i){let s=e.renderers[i.name];s?e.renderers[i.name]=function(...o){let l=i.renderer.apply(this,o);return l===!1&&(l=s.apply(this,o)),l}:e.renderers[i.name]=i.renderer}if("tokenizer"in i){if(!i.level||i.level!=="block"&&i.level!=="inline")throw new Error("extension level must be 'block' or 'inline'");let s=e[i.level];s?s.unshift(i.tokenizer):e[i.level]=[i.tokenizer],i.start&&(i.level==="block"?e.startBlock?e.startBlock.push(i.start):e.startBlock=[i.start]:i.level==="inline"&&(e.startInline?e.startInline.push(i.start):e.startInline=[i.start]))}"childTokens"in i&&i.childTokens&&(e.childTokens[i.name]=i.childTokens)}),n.extensions=e),r.renderer){let i=this.defaults.renderer||new gr(this.defaults);for(let s in r.renderer){if(!(s in i))throw new Error(`renderer '${s}' does not exist`);if(["options","parser"].includes(s))continue;let o=s,l=r.renderer[o],a=i[o];i[o]=(...c)=>{let u=l.apply(i,c);return u===!1&&(u=a.apply(i,c)),u||""}}n.renderer=i}if(r.tokenizer){let i=this.defaults.tokenizer||new fr(this.defaults);for(let s in r.tokenizer){if(!(s in i))throw new Error(`tokenizer '${s}' does not exist`);if(["options","rules","lexer"].includes(s))continue;let o=s,l=r.tokenizer[o],a=i[o];i[o]=(...c)=>{let u=l.apply(i,c);return u===!1&&(u=a.apply(i,c)),u}}n.tokenizer=i}if(r.hooks){let i=this.defaults.hooks||new Ae;for(let s in r.hooks){if(!(s in i))throw new Error(`hook '${s}' does not exist`);if(["options","block"].includes(s))continue;let o=s,l=r.hooks[o],a=i[o];Ae.passThroughHooks.has(s)?i[o]=c=>{if(this.defaults.async&&Ae.passThroughHooksRespectAsync.has(s))return(async()=>{let h=await l.call(i,c);return a.call(i,h)})();let u=l.call(i,c);return a.call(i,u)}:i[o]=(...c)=>{if(this.defaults.async)return(async()=>{let h=await l.apply(i,c);return h===!1&&(h=await a.apply(i,c)),h})();let u=l.apply(i,c);return u===!1&&(u=a.apply(i,c)),u}}n.hooks=i}if(r.walkTokens){let i=this.defaults.walkTokens,s=r.walkTokens;n.walkTokens=function(o){let l=[];return l.push(s.call(this,o)),i&&(l=l.concat(i.call(this,o))),l}}this.defaults={...this.defaults,...n}}),this}setOptions(t){return this.defaults={...this.defaults,...t},this}lexer(t,e){return Ct.lex(t,e??this.defaults)}parser(t,e){return St.parse(t,e??this.defaults)}parseMarkdown(t){return(e,r)=>{let n={...r},i={...this.defaults,...n},s=this.onError(!!i.silent,!!i.async);if(this.defaults.async===!0&&n.async===!1)return s(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));if(typeof e>"u"||e===null)return s(new Error("marked(): input parameter is undefined or null"));if(typeof e!="string")return s(new Error("marked(): input parameter is of type "+Object.prototype.toString.call(e)+", string expected"));if(i.hooks&&(i.hooks.options=i,i.hooks.block=t),i.async)return(async()=>{let o=i.hooks?await i.hooks.preprocess(e):e,l=await(i.hooks?await i.hooks.provideLexer(t):t?Ct.lex:Ct.lexInline)(o,i),a=i.hooks?await i.hooks.processAllTokens(l):l;i.walkTokens&&await Promise.all(this.walkTokens(a,i.walkTokens));let c=await(i.hooks?await i.hooks.provideParser(t):t?St.parse:St.parseInline)(a,i);return i.hooks?await i.hooks.postprocess(c):c})().catch(s);try{i.hooks&&(e=i.hooks.preprocess(e));let o=(i.hooks?i.hooks.provideLexer(t):t?Ct.lex:Ct.lexInline)(e,i);i.hooks&&(o=i.hooks.processAllTokens(o)),i.walkTokens&&this.walkTokens(o,i.walkTokens);let l=(i.hooks?i.hooks.provideParser(t):t?St.parse:St.parseInline)(o,i);return i.hooks&&(l=i.hooks.postprocess(l)),l}catch(o){return s(o)}}}onError(t,e){return r=>{if(r.message+=`
Please report this to https://github.com/markedjs/marked.`,t){let n="<p>An error occurred:</p><pre>"+Rt(r.message+"",!0)+"</pre>";return e?Promise.resolve(n):n}if(e)return Promise.reject(r);throw r}}},ne=new Pc;function j(t,e){return ne.parse(t,e)}j.options=j.setOptions=function(t){return ne.setOptions(t),j.defaults=ne.defaults,bs(j.defaults),j};j.getDefaults=Tn;j.defaults=le;j.use=function(...t){return ne.use(...t),j.defaults=ne.defaults,bs(j.defaults),j};j.walkTokens=function(t,e){return ne.walkTokens(t,e)};j.parseInline=ne.parseInline;j.Parser=St;j.parser=St.parse;j.Renderer=gr;j.TextRenderer=Mn;j.Lexer=Ct;j.lexer=Ct.lex;j.Tokenizer=fr;j.Hooks=Ae;j.parse=j;j.options;j.setOptions;j.use;j.walkTokens;j.parseInline;St.parse;Ct.lex;var Oc=O("<p class=retrofit-muted>Loading..."),Lc=O("<p class=retrofit-error-message>Error: "),Bc=O("<div class=retrofit-view>"),Ic=O("<h1 class=retrofit-page-title>"),Dc=O("<div><button type=button class=retrofit-back-btn>&larr; Back</button><div class=retrofit-markdown>");async function Vc(t,e,r){const n=await fetch(`${r}/${t}/${e}/render`);if(!n.ok)throw new Error(`Failed to fetch render spec for ${t}`);const i=await n.json(),s=i.entityEndpoint.url.replace("{id}",e),o=await fetch(s);if(!o.ok)throw new Error(`Failed to fetch entity from ${s}`);const l=await o.json(),a=String(l[i.field]??""),c=j.parse(a);return{spec:i,html:c}}function Mc(){const t=mn(),e=yr(),r=Ve(zr),[n]=ln(()=>({resource:t.resource,id:t.id}),({resource:i,id:s})=>Vc(i,s,r));return(()=>{var i=Bc();return E(i,A(H,{get when(){return n.loading},get children(){return Oc()}}),null),E(i,A(H,{get when(){return n.error},get children(){var s=Lc();return s.firstChild,E(s,()=>String(n.error),null),s}}),null),E(i,A(H,{get when(){return n()},children:s=>(()=>{var o=Dc(),l=o.firstChild,a=l.nextSibling;return l.$$click=()=>e(`/${t.resource}/${t.id}`),E(o,A(H,{get when(){var c;return(c=s().spec.metadata)==null?void 0:c.title},get children(){var c=Ic();return E(c,()=>{var u;return(u=s().spec.metadata)==null?void 0:u.title}),c}}),a),G(()=>a.innerHTML=s().html),o})()}),null),i})()}br(["click"]);var Fc=O("<sl-checkbox>",!0,!1,!1),Nc=O("<sl-select style=min-width:100px>",!0,!1,!1),Hc=O("<sl-option>",!0,!1,!1),Uc=O("<sl-input style=min-width:80px>",!0,!1,!1),jc=O("<sl-button size=small variant=default>Edit",!0,!1,!1),qc=O("<sl-button size=small variant=primary>Save",!0,!1,!1),Wc=O("<sl-button size=small variant=default>Cancel",!0,!1,!1),Kc=O("<sl-button size=small variant=danger>Delete",!0,!1,!1),Zc=O("<td class=retrofit-td><div style=display:flex;gap:4px;flex-wrap:wrap>"),Xc=O("<tr>"),As=O("<td class=retrofit-td>"),Es=O("<span>"),Yc=O("<sl-button size=small variant=neutral>",!0,!1,!1),Qc=O("<td class=retrofit-td><sl-button size=small variant=primary>Add",!0,!1,!1),Gc=O('<tr class="retrofit-tr retrofit-tr--new">'),Jc=O("<p class=retrofit-muted>Loading..."),tu=O("<p class=retrofit-error-message>Error: "),eu=O("<div class=retrofit-view>"),ru=O("<sl-button variant=primary>New",!0,!1,!1),nu=O("<th class=retrofit-th>Actions"),iu=O("<table class=retrofit-table><thead class=retrofit-thead><tr></tr></thead><tbody>"),su=O("<div><div class=retrofit-page-header><h1 class=retrofit-page-title>"),ou=O("<p class=retrofit-empty>No data."),lu=O("<th class=retrofit-th>");async function au(t,e){var s;const r=await fetch(`${e}/${t}`);if(!r.ok)throw new Error(`Failed to fetch spec for ${t}`);const n=await r.json();let i=[];if((s=n.endpoints)!=null&&s.list){const o=await fetch(n.endpoints.list.url);o.ok&&(i=await o.json())}return{spec:n,data:i}}function cu(t){const e=t.match(/\{(\w+)\}/);return(e==null?void 0:e[1])??"id"}function uu(t,e){return t.replace(/\{(\w+)\}/g,(r,n)=>String(e[n]??""))}function zs(t){const e=()=>String(t.value??"");return t.col.type==="boolean"?(()=>{var r=Fc();return lt(r,"sl-change",n=>t.onChange(n.target.checked)),r._$owner=tt(),G(()=>r.checked=!!t.value),r})():t.col.type==="enum"&&t.col.options?(()=>{var r=Nc();return lt(r,"sl-change",n=>t.onChange(n.target.value)),r._$owner=tt(),E(r,A(Ht,{get each(){return t.col.options},children:n=>(()=>{var i=Hc();return i._$owner=tt(),E(i,()=>n.label),G(()=>i.value=String(n.value)),i})()})),G(()=>r.value=e()),r})():(()=>{var r=Uc();return lt(r,"sl-input",n=>{const i=n.target.value;t.onChange(t.col.type==="number"&&i!==""?Number(i):i)}),r._$owner=tt(),G(n=>{var i=t.col.type==="number"?"number":"text",s=e();return i!==n.e&&(r.type=n.e=i),s!==n.t&&(r.value=n.t=s),n},{e:void 0,t:void 0}),r})()}function hu(t){const e=yr(),r=()=>t.spec.columns.some(k=>k.editable),[n,i]=et(!1),[s,o]=et({...t.row}),[l,a]=et(!1),[c,u]=et(!1),h=()=>{var k;return(k=t.spec.endpoints)!=null&&k.find?cu(t.spec.endpoints.find.url):"id"};function p(){o({...t.row}),i(!0)}function g(){i(!1),o({...t.row})}async function f(){var b;const k=(b=t.spec.endpoints)==null?void 0:b.update;if(!k)return;a(!0);const x=String(t.row[h()]),w=k.url.replace("{id}",x);try{(await fetch(w,{method:k.method,headers:{"Content-Type":"application/json"},body:JSON.stringify(s())})).ok&&(i(!1),t.onRefresh())}finally{a(!1)}}async function v(){var b;const k=(b=t.spec.endpoints)==null?void 0:b.delete;if(!k||!confirm("Delete this item?"))return;u(!0);const x=String(t.row[h()]),w=k.url.replace("{id}",x);try{(await fetch(w,{method:k.method})).ok&&t.onRefresh()}finally{u(!1)}}const y=()=>{var k,x;return r()||!!((k=t.spec.endpoints)!=null&&k.delete)||(((x=t.spec.rowActions)==null?void 0:x.length)??0)>0};return(()=>{var k=Xc();return k.$$click=()=>{var w;if(n()||!((w=t.spec.endpoints)!=null&&w.find))return;const x=t.row[h()];x!=null&&e(`/${t.resource}/${String(x)}`)},E(k,A(Ht,{get each(){return t.spec.columns},children:x=>(()=>{var w=As();return w.$$keydown=b=>n()&&b.stopPropagation(),w.$$click=b=>n()&&b.stopPropagation(),E(w,A(H,{get when(){return Ft(()=>!!n())()&&x.editable},get fallback(){return(()=>{var b=Es();return E(b,(()=>{var S=Ft(()=>x.type==="boolean");return()=>S()?t.row[x.key]?"✓":"✗":String(t.row[x.key]??"")})()),b})()},get children(){return A(zs,{col:x,get value(){return s()[x.key]},onChange:b=>o(S=>({...S,[x.key]:b}))})}})),G(b=>Li(w,"text-align",x.alignment)),w})()}),null),E(k,A(H,{get when(){return y()},get children(){var x=Zc(),w=x.firstChild;return x.$$keydown=b=>b.stopPropagation(),x.$$click=b=>b.stopPropagation(),E(w,A(H,{get when(){return Ft(()=>!n())()&&r()},get children(){var b=jc();return lt(b,"click",p),b._$owner=tt(),b}}),null),E(w,A(H,{get when(){return n()},get children(){return[(()=>{var b=qc();return lt(b,"click",f),b._$owner=tt(),G(()=>b.disabled=l()),b})(),(()=>{var b=Wc();return lt(b,"click",g),b._$owner=tt(),b})()]}}),null),E(w,A(H,{get when(){var b;return!!((b=t.spec.endpoints)!=null&&b.delete)},get children(){var b=Kc();return lt(b,"click",v),b._$owner=tt(),G(()=>b.disabled=c()),b}}),null),E(w,A(Ht,{get each(){return t.spec.rowActions??[]},children:b=>(()=>{var S=Yc();return lt(S,"click",()=>{const T=uu(b.routePattern,t.row);e(`/${t.resource}${T}`)}),S._$owner=tt(),E(S,()=>b.label),S})()}),null),x}}),null),G(()=>{var x;return to(k,`retrofit-tr${!n()&&((x=t.spec.endpoints)!=null&&x.find)?" retrofit-tr--clickable":""}`)}),k})()}function du(t){const e=()=>Object.fromEntries(t.spec.columns.map(a=>[a.key,a.type==="boolean"?!1:a.type==="number"?0:""])),[r,n]=et(e()),[i,s]=et(!1);async function o(){var c;const a=(c=t.spec.endpoints)==null?void 0:c.create;if(a){s(!0);try{(await fetch(a.url,{method:a.method,headers:{"Content-Type":"application/json"},body:JSON.stringify(r())})).ok&&(n(e()),t.onCreated())}finally{s(!1)}}}const l=()=>{var a,c;return!!((a=t.spec.endpoints)!=null&&a.delete)||(((c=t.spec.rowActions)==null?void 0:c.length)??0)>0};return(()=>{var a=Gc();return E(a,A(Ht,{get each(){return t.spec.columns},children:c=>(()=>{var u=As();return E(u,A(H,{get when(){return c.editable},get fallback(){return Es()},get children(){return A(zs,{col:c,get value(){return r()[c.key]},onChange:h=>n(p=>({...p,[c.key]:h}))})}})),u})()}),null),E(a,A(H,{get when(){return l()},get children(){var c=Qc(),u=c.firstChild;return lt(u,"click",o),u._$owner=tt(),G(()=>u.disabled=i()),c}}),null),a})()}function pu(){const t=mn(),e=yr(),r=Ve(zr),[n,{refetch:i}]=ln(()=>t.resource,l=>au(l,r)),s=()=>{var l;return((l=n())==null?void 0:l.spec.columns.some(a=>a.editable))??!1},o=()=>{var l,a,c,u;return s()||!!((a=(l=n())==null?void 0:l.spec.endpoints)!=null&&a.delete)||(((u=(c=n())==null?void 0:c.spec.rowActions)==null?void 0:u.length)??0)>0};return(()=>{var l=eu();return E(l,A(H,{get when(){return n.loading},get children(){return Jc()}}),null),E(l,A(H,{get when(){return n.error},get children(){var a=tu();return a.firstChild,E(a,()=>String(n.error),null),a}}),null),E(l,A(H,{get when(){return n()},children:a=>(()=>{var c=su(),u=c.firstChild,h=u.firstChild;return E(h,()=>{var p;return((p=a().spec.metadata)==null?void 0:p.title)??t.resource}),E(u,A(H,{get when(){return Ft(()=>{var p;return!!((p=a().spec.endpoints)!=null&&p.create)})()&&!s()},get children(){var p=ru();return lt(p,"click",()=>e(`/${t.resource}/new`)),p._$owner=tt(),p}}),null),E(c,A(H,{get when(){return a().data.length>0||s()},get fallback(){return ou()},get children(){var p=iu(),g=p.firstChild,f=g.firstChild,v=g.nextSibling;return E(f,A(Ht,{get each(){return a().spec.columns},children:y=>(()=>{var k=lu();return E(k,()=>y.label),G(x=>Li(k,"text-align",y.alignment)),k})()}),null),E(f,A(H,{get when(){return o()},get children(){return nu()}}),null),E(v,A(Ht,{get each(){return a().data},children:y=>A(hu,{row:y,get spec(){return a().spec},get resource(){return t.resource},onRefresh:()=>void i()})}),null),E(v,A(H,{get when(){var y;return Ft(()=>!!s())()&&((y=a().spec.endpoints)==null?void 0:y.create)},get children(){return A(du,{get spec(){return a().spec},onCreated:()=>void i()})}}),null),p}}),null),c})()}),null),l})()}br(["click","keydown"]);var fu=O("<div class=retrofit-view><h1 class=retrofit-page-title>Retrofit UI</h1><p>Navigate to <code>#/&lt;resource&gt;</code> to get started.");const zr=hn("/api/ui");function gu(){return fu()}function mu(t){return A(zr.Provider,{get value(){return t.apiBase??"/api/ui"},get children(){return A(Vo,{get children(){return[A(we,{path:"/",component:gu}),A(we,{path:"/:resource",component:pu}),A(we,{path:"/:resource/new",component:yi}),A(we,{path:"/:resource/:id/render",component:Mc}),A(we,{path:"/:resource/:id",component:yi})]}})}})}Xr("https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.0/dist/");async function bu(){let t="/api/ui";try{t=(await fetch("/retrofit.json").then(n=>n.json())).apiBase??"/api/ui"}catch{}const e=document.getElementById("root");e&&Js(()=>A(mu,{apiBase:t}),e)}bu();
