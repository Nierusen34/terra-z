(function(){
"use strict";

window.TerraZData = window.TerraZData || {};

// Grafo narrativo padrão. O editor pode expandi-lo com personagens, equipes,
// facções, organizações, locais, eventos e entidades personalizadas.
window.TerraZData.defaultGraph = {
  version:3,
  quadrants:[
    {id:"queen",title:"FAMÍLIA QUEEN",x:20,y:20,w:470,h:340,color:"#c45a1c",bg:"rgba(196,90,28,.05)"},
    {id:"wayne",title:"FAMÍLIA WAYNE",x:510,y:20,w:470,h:340,color:"#0064a8",bg:"rgba(0,100,168,.05)"},
    {id:"marciano",title:"NÚCLEO MARCIANO",x:20,y:380,w:470,h:320,color:"#0a8a4a",bg:"rgba(10,138,74,.05)"},
    {id:"lobo",title:"PRAZO DE LOBO",x:510,y:380,w:470,h:320,color:"#7a4aff",bg:"rgba(122,74,255,.05)"}
  ],
  nodes:[
    {id:"oliver",label:"OLIVER",subtitle:"Oliver Queen",kind:"character",ref:"Oliver Queen",x:140,y:130,color:"#c45a1c",r:38,visibility:"public"},
    {id:"dinah",label:"DINAH",subtitle:"Dinah Lance",kind:"character",ref:"Dinah Lance",x:140,y:240,color:"#8b1a1a",r:38,visibility:"public"},
    {id:"tristan",label:"TRISTAN",subtitle:"Tristan Queen",kind:"character",ref:"Tristan Queen",x:300,y:240,color:"#c45a1c",r:38,visibility:"public"},
    {id:"connor",label:"CONNOR",subtitle:"Connor Hawke",kind:"character",ref:"Connor Hawke",x:400,y:130,color:"#3a3028",r:38,visibility:"public"},
    {id:"bruce",label:"BRUCE",subtitle:"Bruce Wayne",kind:"character",ref:"Bruce Wayne",x:700,y:130,color:"#1a1512",r:38,visibility:"public"},
    {id:"damian",label:"DAMIAN",subtitle:"Damian Wayne",kind:"character",ref:"Damian Wayne",x:800,y:130,color:"#8b1a1a",r:38,visibility:"public"},
    {id:"jason",label:"JASON",subtitle:"Jason Todd",kind:"character",ref:"Jason Todd",x:600,y:240,color:"#8b1a1a",r:38,visibility:"public"},
    {id:"dick",label:"DICK",subtitle:"Dick Grayson",kind:"character",ref:"Dick Grayson",x:700,y:240,color:"#8b1a1a",r:38,visibility:"public"},
    {id:"tim",label:"TIM",subtitle:"Tim Drake",kind:"character",ref:"Tim Drake",x:800,y:240,color:"#8b1a1a",r:38,visibility:"public"},
    {id:"mgann",label:"M'GANN",subtitle:"M'gann M'orzz",kind:"character",ref:"M'gann M'orzz",x:120,y:470,color:"#0a8a4a",r:38,visibility:"public"},
    {id:"conner2",label:"CONNER",subtitle:"Conner Kent",kind:"character",ref:"Conner Kent",x:400,y:470,color:"#0064a8",r:38,visibility:"public"},
    {id:"mark",label:"M'ARK",subtitle:"M'ark",kind:"character",ref:"M'ark",x:260,y:580,color:"#0a8a4a",r:38,visibility:"public"},
    {id:"armek",label:"ARMEK",subtitle:"Armek",kind:"custom",ref:"",x:120,y:650,color:"#3a3028",r:38,visibility:"public"},
    {id:"jonn",label:"J'ONN",subtitle:"J'onn J'onzz",kind:"character",ref:"J'onn J'onzz",x:400,y:650,color:"#0a8a4a",r:38,visibility:"public"},
    {id:"lobo",label:"LOBO",subtitle:"Lobo",kind:"character",ref:"Lobo",x:660,y:490,color:"#3a3028",r:44,visibility:"public"},
    {id:"riot",label:"RIOT",subtitle:"Riot",kind:"character",ref:"Riot",x:660,y:620,color:"#3a3028",r:44,visibility:"public"},
    {id:"kendra",label:"KENDRA",subtitle:"Kendra Saunders",kind:"character",ref:"Kendra Saunders",x:800,y:620,color:"#8b1a1a",r:38,visibility:"public"}
  ],
  edges:[
    {id:"oliver-dinah",from:"oliver",to:"dinah",type:"romance",label:"casal",strength:5,directed:false,visibility:"public"},
    {id:"oliver-tristan",from:"oliver",to:"tristan",type:"family",label:"pai",strength:5,directed:true,visibility:"public"},
    {id:"dinah-tristan",from:"dinah",to:"tristan",type:"family",label:"mãe",strength:5,directed:true,visibility:"public"},
    {id:"oliver-connor",from:"oliver",to:"connor",type:"family",label:"pai",strength:5,directed:true,visibility:"public"},
    {id:"tristan-connor",from:"tristan",to:"connor",type:"family",label:"irmãos",strength:5,directed:false,visibility:"public"},
    {id:"bruce-damian",from:"bruce",to:"damian",type:"family",label:"biológico",strength:5,directed:true,visibility:"public"},
    {id:"bruce-jason",from:"bruce",to:"jason",type:"family",label:"adotivo",strength:4,directed:true,visibility:"public"},
    {id:"bruce-dick",from:"bruce",to:"dick",type:"family",label:"adotivo",strength:4,directed:true,visibility:"public"},
    {id:"bruce-tim",from:"bruce",to:"tim",type:"family",label:"adotivo",strength:4,directed:true,visibility:"public"},
    {id:"mgann-armek",from:"mgann",to:"armek",type:"tension",label:"vítima",strength:5,directed:false,visibility:"public"},
    {id:"armek-mark",from:"armek",to:"mark",type:"family",label:"pai",strength:5,directed:true,visibility:"public"},
    {id:"mgann-mark",from:"mgann",to:"mark",type:"family",label:"mãe",strength:5,directed:true,visibility:"public"},
    {id:"mgann-conner2",from:"mgann",to:"conner2",type:"romance",label:"casal",strength:5,directed:false,visibility:"public"},
    {id:"mgann-jonn",from:"mgann",to:"jonn",type:"mentor",label:"mentor",strength:4,directed:true,visibility:"public"},
    {id:"jonn-armek",from:"jonn",to:"armek",type:"enemy",label:"inimigos",strength:5,directed:false,visibility:"public"},
    {id:"conner2-mark",from:"conner2",to:"mark",type:"ally",label:"paterno",strength:4,directed:true,visibility:"public"},
    {id:"jonn-mark",from:"jonn",to:"mark",type:"mentor",label:"mentor",strength:4,directed:true,visibility:"public"},
    {id:"lobo-riot",from:"lobo",to:"riot",type:"origin",label:"origem genética",strength:5,directed:true,visibility:"public"},
    {id:"kendra-riot",from:"kendra",to:"riot",type:"family",label:"mãe adotiva",strength:5,directed:true,visibility:"public"},
    {id:"kendra-lobo",from:"kendra",to:"lobo",type:"tension",label:"aliados / inimigos",strength:4,directed:false,visibility:"public"}
  ]
};

})();
