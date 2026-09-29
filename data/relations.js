(function(){
"use strict";

window.TerraZData = window.TerraZData || {};

// Estado padrão do grafo de relações. A cópia editável continua no localStorage.
window.TerraZData.defaultGraph = {
  quadrants: [
    { id:'queen', title:'FAMÍLIA QUEEN', x:20, y:20, w:470, h:340, color:'#c45a1c', bg:'rgba(196,90,28,.06)' },
    { id:'wayne', title:'FAMÍLIA WAYNE', x:510, y:20, w:470, h:340, color:'#0064a8', bg:'rgba(0,100,168,.06)' },
    { id:'marciano', title:'NÚCLEO MARCIANO', x:20, y:380, w:470, h:320, color:'#0a8a4a', bg:'rgba(10,138,74,.06)' },
    { id:'lobo', title:'PRAZO DE LOBO', x:510, y:380, w:470, h:320, color:'#7a4aff', bg:'rgba(122,74,255,.06)' }
  ],
  nodes: [
    { id:'oliver', label:'OLIVER', x:140, y:130, color:'#c45a1c', r:34 },
    { id:'dinah', label:'DINAH', x:140, y:240, color:'#8b1a1a', r:34 },
    { id:'tristan', label:'TRISTAN', x:300, y:240, color:'#c45a1c', r:34 },
    { id:'connor', label:'CONNOR', x:400, y:130, color:'#3a3028', r:34 },
    { id:'bruce', label:'BRUCE', x:700, y:130, color:'#1a1512', r:34 },
    { id:'damian', label:'DAMIAN', x:800, y:130, color:'#8b1a1a', r:34 },
    { id:'jason', label:'JASON', x:600, y:240, color:'#8b1a1a', r:34 },
    { id:'dick', label:'DICK', x:700, y:240, color:'#8b1a1a', r:34 },
    { id:'tim', label:'TIM', x:800, y:240, color:'#8b1a1a', r:34 },
    { id:'mgann', label:"M'GANN", x:120, y:470, color:'#0a8a4a', r:34 },
    { id:'conner2', label:'CONNER', x:400, y:470, color:'#0064a8', r:34 },
    { id:'mark', label:"M'ARK", x:260, y:580, color:'#0a8a4a', r:34 },
    { id:'armek', label:'ARMEK', x:120, y:650, color:'#3a3028', r:34 },
    { id:'jonn', label:"J'ONN", x:400, y:650, color:'#0a8a4a', r:34 },
    { id:'lobo', label:'LOBO', x:660, y:490, color:'#3a3028', r:40 },
    { id:'riot', label:'RIOT', x:660, y:620, color:'#3a3028', r:40 },
    { id:'kendra', label:'KENDRA', x:800, y:620, color:'#8b1a1a', r:34 }
  ],
  edges: [
    { from:'oliver', to:'dinah', type:'family', label:'casal' },
    { from:'oliver', to:'tristan', type:'family', label:'pai' },
    { from:'dinah', to:'tristan', type:'family', label:'mãe' },
    { from:'oliver', to:'connor', type:'family', label:'pai' },
    { from:'tristan', to:'connor', type:'family', label:'irmãos' },
    { from:'bruce', to:'damian', type:'family', label:'biológico' },
    { from:'bruce', to:'jason', type:'family', label:'adotivo' },
    { from:'bruce', to:'dick', type:'family', label:'adotivo' },
    { from:'bruce', to:'tim', type:'family', label:'adotivo' },
    { from:'mgann', to:'armek', type:'tension', label:'vítima' },
    { from:'armek', to:'mark', type:'family', label:'pai' },
    { from:'mgann', to:'mark', type:'family', label:'mãe' },
    { from:'mgann', to:'conner2', type:'ally', label:'casal' },
    { from:'mgann', to:'jonn', type:'ally', label:'mentor' },
    { from:'jonn', to:'armek', type:'tension', label:'inimigos' },
    { from:'conner2', to:'mark', type:'ally', label:'paterno' },
    { from:'jonn', to:'mark', type:'ally', label:'mentor' },
    { from:'lobo', to:'riot', type:'clone', label:'origem genética' },
    { from:'kendra', to:'riot', type:'family', label:'mãe adotiva' },
    { from:'kendra', to:'lobo', type:'tension', label:'aliados/inimigos' }
  ]
};

})();
