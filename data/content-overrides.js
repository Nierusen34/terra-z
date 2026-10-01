(function(){
"use strict";

window.TerraZData = window.TerraZData || {};

// Alterações publicadas pelo editor visual, indexadas pelos data-edit-id permanentes.
window.TerraZData.contentOverrides = {
  "tz-0001": "A Sentinela <span class=\"city\">Dourada</span>",
  "tz-0002": "🔥 Nada escapa do nosso radar",
  "tz-0036": "Vista aérea de Vanguard Bay ao anoitecer — o continente e a Ilha Solara ligados por duas pontes.",
  "tz-0394": "Kendra, Lobo <strong>e Riot</strong>",
  "tz-0018": "Documento revisado e publicado. Versão 1.3.",
  "tz-0369": "Traumas familiares, rebeldia juvenil e o confronto entre heranças heroicas e escolhas próprias. Um universo de \"segundas chances\" que nem sempre são aproveitadas.",
  "tz-0371": "Superman derrotou Darkseid em 2026 e ascendeu como <strong>Rei Ômega</strong>. A energia liberada criou \"ecos\" pelo multiverso, afetando diretamente a Fenda de Vanguard Bay.",
  "tz-0373": "Em 2024, a Liga expandiu o recrutamento. Membros históricos e novos heróis coexistem — gerando atritos e alianças improváveis.",
  "tz-0375": "<strong>Vanguard Bay</strong>, a Cidade Dourada da Flórida. Sem uma família heroica fixa, tornou-se o refúgio perfeito para renegados e fugitivos.",
  "tz-0377": "Lobo prometeu caçar o clone Riot em 2072. Cinquenta anos se passaram desde o resgate. Kendra e Riot sabem — mas nenhum dos dois revelou ao outro.",
  "tz-0379": "M'ark, filho de M'gann, é apresentado publicamente como um Marciano Verde sobrevivente de uma colônia perdida. Na verdade, é Branco — e filho do estupro de Armek.",
  "tz-0380": "📌 NavegaçãoClique em qualquer <strong>card de personagem</strong> para abrir a ficha completa, com histórico, relações e <strong>segredos reveláveis</strong>. Use a <strong>busca no topo</strong> para alternar entre <strong>Busca Local</strong> (destaca termos no documento) e <strong>DC Wiki</strong> (consulta artigos externos). Pressione <strong>Esc</strong> para fechar qualquer janela.",
  "tz-0462": "👆 Toque para expandirClique em qualquer card para ver a <strong>ficha completa</strong> com história, relações e segredos reveláveis. Passe o mouse para revelar o botão ⭐ de favoritos.",
  "tz-0596": "📌 Como lerCada cor representa um tipo de vínculo. Passe o mouse sobre os nós para ver o nome do personagem.",
  "tz-0138": "Vista noturna · Transmissão VBN · Fonte: Satélite V-BPD · Jan 2027",
  "tz-0526": "Jay Garrick",
  "tz-0527": "SJA clássica",
  "tz-0530": "Superman, Batman",
  "tz-0531": "Fundadores + J'onn",
  "tz-0535": "Dick, Ravena, Mutano, Cyborg, M'gann",
  "tz-0539": "Membros originais",
  "tz-0406": "Vanguard Bay – O Dique",
  "tz-0409": "Aparência 20 (cron. 5)",
  "tz-0411": "Vanguard Bay – O Dique / Fenda",
  "tz-0416": "Vanguard Bay – Emaranhado",
  "tz-0436": "Gotham",
  "tz-0441": "Vanguard Bay",
  "tz-0435": "Líder dos Novos Titãs",
  "tz-0476": "<strong>Codinome: </strong>Capuz Vermelho<br><strong>Idade: </strong>23 anos (nascido em 2004)<br><strong>Origem: </strong>—<br><strong>Status: </strong>Vivo — ressuscitado em 2021",
  "tz-0532": "Jovens Titãs (1ª)",
  "tz-0544": "Novos Titãs (2ª)",
  "tz-0464": "<strong>Codinome: </strong>Ranger<br><strong>Idade: </strong>20 anos (nascido em 2007)<br><strong>Origem: </strong>—<br><strong>Status: </strong>Ativo",
  "tz-0466": "<strong>Codinome: </strong>—<br><strong>Idade: </strong>Aparência 20 anos (cronológico: 5)<br><strong>Origem: </strong>Clone da Cadmus, resgatado em 2022<br><strong>Status: </strong>Em missão pessoal em Vanguard Bay (sem local fixo)",
  "tz-0468": "<strong>Codinome: </strong>—<br><strong>Idade: </strong>23 anos (nascido em 2004)<br><strong>Origem: </strong>—<br><strong>Status: </strong>Prisioneiro da Sumdac — em local secreto",
  "tz-0482": "<strong>Codinome: </strong>Superboy<br><strong>Idade: </strong>~29 anos (clone)<br><strong>Origem: </strong>Clone híbrido de Superman e Lex Luthor<br><strong>Status: </strong>Ativo",
  "tz-0470": "<strong>Codinome: </strong>O Queen (ex-Arqueiro Verde)<br><strong>Idade: </strong>47 anos (nascido em 1980)<br><strong>Origem: </strong>—<br><strong>Status: </strong>Vivo — ressuscitado em 2022",
  "tz-0472": "<strong>Codinome: </strong>Canário Negro<br><strong>Idade: </strong>40 anos (nascida em 1987)<br><strong>Origem: </strong>—<br><strong>Status: </strong>Viva",
  "tz-0474": "<strong>Codinome: </strong>Arqueiro Verde (atual)<br><strong>Idade: </strong>25 anos (nascido em 2002)<br><strong>Origem: </strong>—<br><strong>Status: </strong>Solteiro",
  "tz-0478": "<strong>Codinome: </strong>Hawkgirl<br><strong>Idade: </strong>~32 anos<br><strong>Origem: </strong>Humana que herdou a alma de Shiera Hall<br><strong>Status: </strong>Ativo",
  "tz-0480": "<strong>Codinome: </strong>—<br><strong>Idade: </strong>~39 anos<br><strong>Origem: </strong>Marciana Branca fugitiva<br><strong>Status: </strong>Ativo",
  "tz-0484": "<strong>Codinome: </strong>—<br><strong>Idade: </strong>400+ anos (imortal)<br><strong>Origem: </strong>Czarniano<br><strong>Status: </strong>Ativo",
  "tz-0486": "<strong>Codinome: </strong>Caçador de Marte<br><strong>Idade: </strong>~227 anos<br><strong>Origem: </strong>Marciano Verde (último)<br><strong>Status: </strong>Ativo"
};

})();
