const fs=require("fs");
global.HTMLElement=class{attachShadow(){const root={_h:"",getElementById(){return null},set innerHTML(v){this._h=v},get innerHTML(){return this._h}};this.shadowRoot=root;return root}};
global.customElements={_m:{},get(n){return this._m[n]},define(n,c){this._m[n]=c}};
global.window={customCards:[]};global.document={};
global.setInterval=()=>0;global.clearInterval=()=>{};
eval(fs.readFileSync(process.argv[2]||"dist/nspanel-dom-editor.js","utf8")+";global.C=NSPanelDomEditorCard;global.T_=T;global.TR_=TR;global.setL=(l)=>{LANG=l};");
// keys parity
const en=Object.keys(TR_.en);
for(const l of Object.keys(TR_)){const miss=en.filter(k=>!(k in TR_[l]));const extra=Object.keys(TR_[l]).filter(k=>!(k in TR_.en));console.log(l,"missing",miss,"extra",extra)}
const c=new C();c.setConfig({language:"de"});
const hass={language:"pl",states:{"sensor.nspanel_dom_katalog":{attributes:{uklad_domyslny:[{t:"V",c:0,r:0,w:7,h:8,e:"sensor.x"}],glowny:{}}},"sensor.x":{state:"21.5",attributes:{unit_of_measurement:"°C",friendly_name:"Temp"}}}};
c._hass=hass;c._tiles=null;c._load(true);
console.log(c._tileHTML(c._tiles[0],0,c._pal()).includes("21")?"tile render OK":"tile render FAIL");
setL("de");console.log(T_("save"),"|",T_("pos",1,2,3,4,5,6));
for (const l of Object.keys(TR_)) { const m = Object.keys(TR_.en).filter((k) => !(k in TR_[l])); if (m.length) { console.error("i18n keys missing in", l, m); process.exit(1); } }
