(function(){
"use strict";

window.TerraZData = window.TerraZData || {};

// Sobrescritas estruturadas de personagens existentes.
// A base canônica continua em data/characters.js.
window.TerraZData.characterOverrides = {
  "Tristan Queen": {
    "eyebrow": "🏹 Ranger · Filho de Arqueiros",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Tristan Queen<br><strong>Codinome:</strong> Ranger<br><strong>Idade:</strong> 20 anos (nascido em 2007)<br><strong>Pais:</strong> Oliver Queen (biológico) e Dinah Lance (biológica)<br><strong>Irmãos:</strong> Connor Hawke (meio-irmão paterno)<br><strong>Local:</strong> Vanguard Bay – Downtown (cobertura)</p>"
      },
      {
        "title": "📖 História",
        "content": "<p>Cresceu em Star City até os 12 anos, quando presenciou a discussão entre os pais — Dinah partiu para Gotham logo depois. Aos 13, perdeu o pai para o bolsão dimensional. Foi criado pelo meio-irmão Connor durante o luto.</p><p>Aos 15 anos, decidiu ir para Gotham treinar com Jason Todd. Oliver se opôs e parou de falar com ele a partir daí — teimosia e orgulho. Tristan treinou com Jason entre 2022 e 2025, aprendendo arco tático, furtividade e rastreamento. Em 2026, mudou-se para Vanguard Bay, onde vive em uma cobertura no Downtown sob o codinome <em>Ranger</em>.</p>"
      },
      {
        "title": "🎯 Personalidade",
        "content": "<p>Frio, calculista, independente e reservado. Mantém controle emocional sob tensão e sempre tem um plano. Não é movido por ressentimento — suas escolhas vêm de dentro, não de mágoas.</p>"
      },
      {
        "title": "⚔️ Habilidades",
        "content": "<ul><li><strong>Arco e flecha:</strong> tático e preciso. Aprendido com Oliver, Connor e Jason.</li><li><strong>Combate corpo a corpo:</strong> letal. Aprendido com Dinah Lance.</li><li><strong>Furtividade:</strong> infiltração e movimento silencioso (com Jason).</li><li><strong>Rastreamento:</strong> seguir alvos em ambiente urbano.</li></ul>"
      },
      {
        "title": "🔗 Relações",
        "content": "<ul><li><strong>Oliver (pai):</strong> Relação fraturada — mas o silêncio parte de Oliver, não de Tristan. Oliver é teimoso e orgulhoso e não aceita a escolha do filho de ir para Gotham em 2022.</li><li><strong>Dinah (mãe):</strong> Distante, mas sem culpa de Tristan. A culpa é dela — por ter ido para Gotham em 2019 e não ter estado presente em 2020. Conversam por mensagem.</li><li><strong>Connor (irmão):</strong> Irmãos próximos. Connor é o elo de comunicação com a família — figura fraterna estável.</li><li><strong>Jason Todd:</strong> Mentor e figura fraterna oposta a Connor — o contraponto rebelde ao irmão estável.</li><li><strong>Lian Harper:</strong> Amiga de infância, filha de Roy Harper. Conversam frequentemente por mensagem. Atualmente é a Cheshire Cat nos Titãs de Jason.</li></ul>"
      }
    ]
  },
  "George Gandenzio Toombs": {
    "eyebrow": "",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong><b>George Gandenzio Toombs</b><br><strong>Idade: 65 anos</strong><br><strong>Local: Downtown</strong></p>"
      },
      {
        "title": "📖 História",
        "content": "<p>Dono do Bar One Bourbon, One Scotch, One Beer.</p>"
      },
      {
        "title": "🎯 Personalidade",
        "content": "<p>É um senhor de idade com bastante atitude e que não tem medo de se posicionar.&nbsp;</p>"
      },
      {
        "title": "⚔️ Habilidades",
        "content": "<ul><li>Adicione uma habilidade.</li></ul>"
      },
      {
        "title": "🔗 Relações",
        "content": "<ul><li>Adicione uma relação importante.</li></ul>"
      }
    ],
    "created": true,
    "card": {
      "icon": "👤",
      "summary": ""
    }
  },
  "Camila Vargas": {
    "eyebrow": "🧠 Telepata · Braço-direito de Shaw",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Camila Vargas<br><strong>Idade:</strong> 35–45 anos<br><strong>Origem:</strong> Humana<br><strong>Status:</strong> Ativa<br><strong>Papel:</strong> Braço-direito de Leland Shaw (CEO da Shaw Innovations)<br><strong>Local:</strong> Vanguard Bay</p>"
      },
      {
        "title": "🧠 Poderes",
        "content": "<ul><li><strong>Telepatia:</strong> recém-desperta — ainda em desenvolvimento.</li><li><strong>Elo com M'ark:</strong> criado acidentalmente ao despertar os poderes. Conversam periodicamente.</li></ul>"
      },
      {
        "title": "🎯 Personalidade",
        "content": "<p>Estratégica, corajosa. Leal à empresa (Shaw Innovations), mas <strong>não a Leland Shaw</strong>. Esconde seus poderes meta-humanos dele.</p>"
      },
      {
        "title": "🔗 Relações",
        "content": "<ul><li><strong>M'ark:</strong> Elo telepático. Sabe que ele está preso e em perigo, mas não sabe a localização.</li><li><strong>Leland Shaw:</strong> Chefe. Leal à empresa, não a ele.</li><li><strong>Tristan Queen:</strong> Aliada. Comunicam-se por ligação ou telepatia.</li><li><strong>Riot:</strong> Aliada. Comunicam-se por ligação ou telepatia.</li></ul>"
      },
      {
        "title": "🎯 Objetivo",
        "content": "<p>Procurar M'ark junto com Tristan e Riot. Propôs a aliança — já que a Sumdac também é parte do objetivo deles.</p>"
      }
    ]
  },
  "Oliver Queen": {
    "eyebrow": "🏹 O Queen · Agente da JLU",
    "sections": [
      {
        "title": "📋 Ficha Básica",
        "content": "<p><strong>Nome:</strong> Oliver Jonas Queen<br><strong>Codinome:</strong> O Queen (ex-Arqueiro Verde)<br><strong>Idade:</strong> 47 anos (nascido em 1980)<br><strong>Status:</strong> Vivo — ressuscitado em 2022<br><strong>Papel:</strong> Agente da Liga da Justiça Sem Limites<br><strong>Local:</strong> Gotham (investigando anomalia)</p>"
      },
      {
        "title": "📖 História",
        "content": "<p>Fundador do manto do Arqueiro Verde em Star City. Em 2020, uma explosão o sugou para um bolsão dimensional. Passou 2 anos isolado — o que lhe deixou um <strong>trauma emocional profundo</strong>: não consegue se afastar de Dinah por muito tempo. Resgatado por Cyborg e Flash em 2022. Faz parte da equipe de resgate de Riot (com Kendra, Metamorfo e Gladiador Dourado). Não reassumiu o manto — Connor mantém o título. Tornou-se agente da JLU.</p><p>Em 2022, quando Tristan decidiu ir para Gotham treinar com Jason, Oliver se opôs e <strong>parou de falar com o filho</strong> — teimosia e orgulho.</p>"
      },
      {
        "title": "🎯 Personalidade",
        "content": "<p>Teimoso e orgulhoso. Calmo com ressalvas, mas ainda impulsivo em momentos-chave. Carrega trauma emocional do bolsão dimensional — não consegue se afastar de Dinah por muito tempo. Sem problemas de saúde físicos. Fala sobre Tristan com Dinah e Connor, mas não diretamente com o filho.</p>"
      },
      {
        "title": "⚔️ Habilidades",
        "content": "<ul><li><strong>Arco e flecha:</strong> mestre arqueiro nível lendário. Ainda tem o arco.</li><li><strong>Combate corpo a corpo:</strong> treinado, mas não é o foco.</li><li><strong>Táticas:</strong> estrategista experiente.</li><li><strong>Liderança:</strong> ex-líder da JLU em missões.</li></ul>"
      },
      {
        "title": "🔗 Relações",
        "content": "<ul><li><strong>Dinah Lance:</strong> Esposa. Reataram. Não consegue se afastar dela por muito tempo.</li><li><strong>Tristan Queen:</strong> Filho. Silêncio total por parte de Oliver desde 2022 — teimosia e orgulho. Não gosta que Tristan esteja em Vanguard Bay, mas reconhece que é melhor do que Gotham.</li><li><strong>Connor Hawke:</strong> Filho que assumiu o manto. Respeito mútuo.</li><li><strong>Kendra Saunders:</strong> Contato regular. Colegas e amigos.</li><li><strong>Jason Todd:</strong> Não aprova que ele tenha treinado Tristan.</li></ul>"
      }
    ]
  }
};

})();
