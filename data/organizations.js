(function(){
"use strict";

window.TerraZData = window.TerraZData || {};

// Organizações, facções, empresas e instituições de Vanguard Bay.
// Arquivo próprio para permitir edição estruturada pelo painel administrativo.
window.TerraZData.organizations = [
  {
    "id": "os-espectros",
    "name": "Os Espectros",
    "icon": "👻",
    "category": "criminal",
    "categoryLabel": "Facção Criminosa",
    "base": "Coral Gate",
    "leader": "Matheus Silva · O Fantasma",
    "description": "Organização de Coral Gate envolvida com contrabando e proteção do bairro.",
    "activities": [
      "Contrabando",
      "Proteção territorial"
    ],
    "rivals": [
      "Los Martillo"
    ],
    "relatedCharacters": [
      "Matheus Silva"
    ],
    "relatedLocations": [
      "Rumba & Samba Room",
      "Coral Gate"
    ],
    "visibility": "public"
  },
  {
    "id": "los-martillo",
    "name": "Los Martillo",
    "icon": "🔨",
    "category": "criminal",
    "categoryLabel": "Facção Criminosa",
    "base": "Coral Gate",
    "leader": "Não especificado no material",
    "description": "Gangue jovem de Coral Gate ligada ao tráfico da droga conhecida como Gelo.",
    "activities": [
      "Tráfico de Gelo"
    ],
    "rivals": [
      "Os Espectros"
    ],
    "relatedCharacters": [],
    "relatedLocations": [
      "Coral Gate"
    ],
    "visibility": "public"
  },
  {
    "id": "bratva-volkov",
    "name": "Bratva Volkov",
    "icon": "🐻",
    "category": "criminal",
    "categoryLabel": "Facção Criminosa",
    "base": "O Dique",
    "leader": "Boris Borkov · O Urso",
    "description": "Organização criminosa atuante em O Dique, especializada em contrabando de armas e tráfico de meta-humanos.",
    "activities": [
      "Contrabando de armas",
      "Tráfico de meta-humanos"
    ],
    "relatedCharacters": [
      "Boris Borkov"
    ],
    "relatedLocations": [
      "Bar Urso Polar",
      "Docas de Carga Sul",
      "O Dique"
    ],
    "visibility": "public"
  },
  {
    "id": "irmandade-markoviana",
    "name": "Irmandade Markoviana",
    "icon": "🦅",
    "category": "criminal",
    "categoryLabel": "Facção Criminosa",
    "base": "Downtown · Pequena Markóvia",
    "leader": "General Markov",
    "description": "Organização baseada na Pequena Markóvia, envolvida com espionagem e contrabando de tecnologia.",
    "activities": [
      "Espionagem",
      "Contrabando de tecnologia"
    ],
    "relatedCharacters": [
      "General Markov"
    ],
    "relatedLocations": [
      "Centro Cultural Markoviano",
      "Pequena Markóvia"
    ],
    "visibility": "public"
  },
  {
    "id": "no-face",
    "name": "No-Face",
    "icon": "💻",
    "category": "criminal",
    "categoryLabel": "Grupo Hacker",
    "base": "A Muralha · O Comutador",
    "leader": "Não especificado no material",
    "description": "Grupo de hackers que usa O Comutador e atua na compra e venda de informações sigilosas.",
    "activities": [
      "Invasão digital",
      "Comércio de informações"
    ],
    "relatedCharacters": [
      "Alia Hazari"
    ],
    "relatedLocations": [
      "O Comutador",
      "A Muralha"
    ],
    "visibility": "public"
  },
  {
    "id": "shaw-innovations",
    "name": "Shaw Innovations",
    "icon": "🏢",
    "category": "corporate",
    "categoryLabel": "Empresa",
    "base": "A Muralha · Shaw Spire",
    "leader": "Leland Shaw",
    "description": "Grande empresa de Vanguard Bay voltada a energia limpa, inteligência artificial e software.",
    "activities": [
      "Energia limpa",
      "Inteligência artificial",
      "Software"
    ],
    "relatedCharacters": [
      "Leland Shaw",
      "Camila Vargas"
    ],
    "relatedLocations": [
      "Shaw Spire",
      "Shaw Medical Center"
    ],
    "spoiler": "A meta pessoal de Leland Shaw ligada à empresa é alcançar a imortalidade por meio de seus experimentos.",
    "visibility": "public"
  },
  {
    "id": "vanguard-stagg-industries",
    "name": "Vanguard-Stagg Industries",
    "icon": "🏭",
    "category": "corporate",
    "categoryLabel": "Empresa",
    "base": "A Muralha · Vanguard-Stagg Pinnacle",
    "leader": "Donovan Mason",
    "description": "Conglomerado voltado a hardware militar, engenharia química e biotecnologia.",
    "activities": [
      "Hardware militar",
      "Engenharia química",
      "Biotecnologia",
      "Segurança privada"
    ],
    "relatedCharacters": [
      "Donovan Mason",
      "Dra. Zara Kovač"
    ],
    "relatedLocations": [
      "Vanguard-Stagg Pinnacle"
    ],
    "subunits": [
      "Stagg Security"
    ],
    "visibility": "public"
  },
  {
    "id": "uvb",
    "name": "Universidade de Vanguard Bay (UVB)",
    "icon": "🎓",
    "category": "academic",
    "categoryLabel": "Ensino Superior",
    "base": "Ilha Solara",
    "leader": "Não especificado no material",
    "description": "Universidade tradicional e cara, com forte cultura de fraternidades e destaque em Direito e Oceanografia.",
    "activities": [
      "Direito",
      "Oceanografia",
      "Pesquisa acadêmica"
    ],
    "relatedCharacters": [
      "Dr. Ahron Nax"
    ],
    "relatedLocations": [
      "Universidade de Vanguard Bay (UVB)"
    ],
    "subunits": [
      "Ordem do Zenit"
    ],
    "spoiler": "O material registra colaboração da área de Oceanografia com Atlantes.",
    "visibility": "public"
  },
  {
    "id": "vbpi",
    "name": "Instituto Politécnico de Vanguard Bay (VBPI)",
    "icon": "🧪",
    "category": "academic",
    "categoryLabel": "Ensino Superior",
    "base": "Downtown",
    "leader": "Não especificado no material",
    "description": "Instituição pública, mais acessível e interdisciplinar, com laboratórios e destaque para engenharia, tecnologia e criminologia forense.",
    "activities": [
      "Engenharia",
      "Tecnologia",
      "Criminologia Forense"
    ],
    "relatedCharacters": [
      "Dra. Helen Finch"
    ],
    "relatedLocations": [
      "Instituto Politécnico de Vanguard Bay (VBPI)"
    ],
    "subunits": [
      "Departamento de Criminologia Forense",
      "Programa Análise de Resíduos Meta-humanos"
    ],
    "visibility": "public"
  },
  {
    "id": "farol-de-vanguard",
    "name": "Farol de Vanguard",
    "icon": "📰",
    "category": "media",
    "categoryLabel": "Mídia",
    "base": "A Muralha",
    "leader": "Não especificado no material",
    "description": "Jornal tradicional de Vanguard Bay.",
    "activities": [
      "Jornalismo",
      "Reportagem investigativa"
    ],
    "relatedCharacters": [
      "Osias \"Osi\" Rivers"
    ],
    "relatedLocations": [
      "Farol de Vanguard"
    ],
    "visibility": "public"
  },
  {
    "id": "sentinela-dourada",
    "name": "A Sentinela Dourada",
    "icon": "📱",
    "category": "media",
    "categoryLabel": "Mídia",
    "base": "A Muralha",
    "leader": "Não especificado no material",
    "description": "Tabloide digital de Vanguard Bay.",
    "activities": [
      "Noticiário digital",
      "Colunismo"
    ],
    "relatedCharacters": [
      "Roxana \"Roxy\" Sharpe"
    ],
    "relatedLocations": [
      "A Sentinela Dourada"
    ],
    "visibility": "public"
  },
  {
    "id": "vbn",
    "name": "VBN · Vanguard Broadcasting Network",
    "aliases": [
      "Vanguard Broadcasting Network",
      "VBN"
    ],
    "icon": "📺",
    "category": "media",
    "categoryLabel": "Mídia",
    "base": "Vanguard Bay",
    "leader": "Não especificado no material",
    "description": "Emissora de televisão responsável pelo telejornal VBN Nightly News.",
    "activities": [
      "Televisão",
      "Telejornalismo"
    ],
    "relatedCharacters": [
      "Marcos Jimenez",
      "Sofia Navarro"
    ],
    "relatedLocations": [],
    "subunits": [
      "VBN Nightly News"
    ],
    "visibility": "public"
  },
  {
    "id": "argus",
    "name": "A.R.G.U.S.",
    "icon": "🛡️",
    "category": "agency",
    "categoryLabel": "Agência",
    "base": "Operações em Vanguard Bay",
    "leader": "Não especificado no material",
    "description": "Agência com presença operacional em Vanguard Bay. O material associa a A.R.G.U.S. a instalações e programas especiais na cidade.",
    "activities": [
      "Co-gestão de A Lâmina",
      "Financiamento da Unidade de Trauma Meta-humano",
      "Reserva Criptobiológica",
      "Instalação secreta no terminal de cargas do aeroporto"
    ],
    "relatedCharacters": [
      "Dra. Anya Petrova"
    ],
    "relatedLocations": [
      "Penitenciária Estadual de Black-Reef",
      "Vanguard Bay General Hospital (VBGH)",
      "Zoológico Metropolitano de Vanguard Bay",
      "Aeroporto Internacional de Vanguard Bay"
    ],
    "visibility": "spoiler"
  },
  {
    "id": "deo",
    "name": "D.E.O.",
    "icon": "🔒",
    "category": "agency",
    "categoryLabel": "Agência",
    "base": "Ligação histórica com Vanguard Bay",
    "leader": "Não especificado no material",
    "description": "O material relaciona o D.E.O. à história de Vanguard Bay por meio do antigo Projeto Panoptes, na Ilha Quimera.",
    "activities": [
      "Ligação com o Projeto Panoptes"
    ],
    "relatedCharacters": [
      "Dra. Anya Petrova"
    ],
    "relatedLocations": [
      "Ilha Quimera"
    ],
    "visibility": "spoiler"
  }
];

})();
