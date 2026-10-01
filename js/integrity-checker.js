(function(){
"use strict";

window.TerraZApp = window.TerraZApp || {};
var core = window.TerraZCore;
if(!core) throw new Error("Terra Z: núcleo não carregado antes de js/integrity-checker.js");

var escapeHtml = core.escapeHtml;
var escapeAttr = core.escapeAttr;
var currentReport = null;
var currentFilter = "all";
var running = false;

function el(id){ return document.getElementById(id); }
function app(){ return window.TerraZApp || {}; }
function data(){ return window.TerraZData || {}; }

function normalize(value){
  return String(value || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .toLocaleLowerCase("pt-BR")
    .replace(/^[oa]s?\s+/,"")
    .replace(/[^a-z0-9]+/g," ")
    .trim();
}

function characterNames(){
  var manager = app().characters;
  if(manager && manager.names) return manager.names().slice();
  var rows = data().characterOverrides || {};
  return Object.keys(rows).filter(function(name){
    return !rows[name] || rows[name].deleted !== true;
  });
}

function privateNames(){
  var priv = app().privateContent;
  return priv && priv.getPrivateCharacterNames ? priv.getPrivateCharacterNames() : [];
}

function sessionRows(){
  var sessions = app().sessions;
  if(sessions && sessions.getAll) return sessions.getAll().slice();
  return Array.isArray(data().sessions) ? data().sessions.slice() : [];
}

function graphData(){
  var graph = app().graph;
  if(graph && graph.getData) return graph.getData();
  return data().graphOverride || data().defaultGraph || {quadrants:[],nodes:[],edges:[]};
}

function makeReport(){
  return {
    startedAt:new Date(),
    finishedAt:null,
    issues:[],
    passes:[],
    stats:{characters:0,sessions:0,graphNodes:0,securePrivate:0}
  };
}

function issue(report,severity,area,title,detail,action,entity){
  report.issues.push({
    severity:severity,
    area:area,
    title:title,
    detail:detail || "",
    action:action || "",
    entity:entity || "",
    search:normalize([severity,area,title,detail || "",entity || ""].join(" "))
  });
}

function check(report,area,title,fn){
  var before = report.issues.length;
  try { fn(); }
  catch(error){
    console.error("Terra Z integrity:",area,title,error);
    issue(report,"critical",area,"Falha na verificação",title + ": " + (error.message || error));
  }
  if(report.issues.length === before) report.passes.push({area:area,title:title});
}

async function checkAsync(report,area,title,fn){
  var before = report.issues.length;
  try { await fn(); }
  catch(error){
    console.error("Terra Z integrity:",area,title,error);
    issue(report,"critical",area,"Falha na verificação",title + ": " + (error.message || error));
  }
  if(report.issues.length === before) report.passes.push({area:area,title:title});
}

function definitionMap(rows){
  var result = {};
  (Array.isArray(rows) ? rows : []).forEach(function(row){
    if(row && row.id) result[String(row.id)] = row;
  });
  return result;
}

function auditCharacters(report){
  var names = characterNames();
  report.stats.characters = names.length;

  check(report,"Personagens","Nomes únicos",function(){
    var seen = {};
    names.forEach(function(name){
      var key = normalize(name);
      if(seen[key]){
        issue(report,"critical","Personagens","Nome duplicado","\"" + seen[key] + "\" e \"" + name + "\" usam o mesmo identificador.");
      } else {
        seen[key] = name;
      }
    });
  });

  check(report,"Personagens","Cards padronizados",function(){
    var manager = app().characters;
    names.forEach(function(name){
      var card = manager && manager.cardData ? manager.cardData(name) : {};
      var fields = [["codename","Codinome"],["age","Idade"],["origin","Origem"],["status","Status"]];
      var missing = fields.filter(function(pair){
        var value = String(card && card[pair[0]] == null ? "" : card[pair[0]]).trim();
        return !value || value === "—";
      }).map(function(pair){ return pair[1]; });

      if(missing.length){
        issue(report,"warning","Personagens","Card incompleto","Faltando: " + missing.join(", ") + ".","character",name);
      }
    });
  });

  check(report,"Personagens","Fichas estruturadas",function(){
    var rows = data().characterOverrides || {};
    names.forEach(function(name){
      var row = rows[name];
      if(!row){
        issue(report,"warning","Personagens","Ficha sem registro estruturado","Não foi encontrado um registro de ficha para este personagem.","character",name);
      } else if(!Array.isArray(row.sections) || !row.sections.length){
        issue(report,"warning","Personagens","Ficha sem seções","A ficha não possui seções estruturadas.","character",name);
      }
    });
  });
}

function auditTaxonomy(report){
  var tx = data().characterTaxonomy || {nuclei:[],types:[],statuses:[],characters:{}};
  var names = characterNames();
  var active = new Set(names);
  var secure = new Set(privateNames());
  var nuclei = definitionMap(tx.nuclei);
  var types = definitionMap(tx.types);
  var statuses = definitionMap(tx.statuses);

  check(report,"Taxonomia","Definições válidas",function(){
    [["núcleos",tx.nuclei],["tipos",tx.types],["status",tx.statuses]].forEach(function(group){
      var seenId = {};
      var seenLabel = {};
      (Array.isArray(group[1]) ? group[1] : []).forEach(function(row){
        var id = String(row && row.id || "").trim();
        var label = String(row && row.label || "").trim();
        if(!id || !label){
          issue(report,"critical","Taxonomia","Definição inválida","Existe um item sem ID ou nome em " + group[0] + ".");
          return;
        }
        if(seenId[id]) issue(report,"critical","Taxonomia","ID duplicado","O ID \"" + id + "\" aparece mais de uma vez em " + group[0] + ".");
        if(seenLabel[normalize(label)]) issue(report,"warning","Taxonomia","Nome duplicado","O nome \"" + label + "\" aparece mais de uma vez em " + group[0] + ".");
        seenId[id] = true;
        seenLabel[normalize(label)] = true;
      });
    });
  });

  check(report,"Taxonomia","Organização dos personagens",function(){
    names.forEach(function(name){
      var meta = tx.characters && tx.characters[name];
      if(!meta){
        issue(report,"warning","Taxonomia","Personagem sem organização","Núcleo, tipo e status não estão configurados.","taxonomy",name);
        return;
      }

      var list = Array.isArray(meta.nuclei) ? meta.nuclei : [];
      if(!list.length) issue(report,"warning","Taxonomia","Personagem sem núcleo","Associe pelo menos um núcleo.","taxonomy",name);
      list.forEach(function(id){
        if(!nuclei[id]) issue(report,"critical","Taxonomia","Núcleo inexistente","O núcleo \"" + id + "\" não existe mais.","taxonomy",name);
      });
      if(!types[meta.type]) issue(report,"warning","Taxonomia","Tipo inválido","Tipo atual: \"" + String(meta.type || "vazio") + "\".","taxonomy",name);
      if(!statuses[meta.status]) issue(report,"warning","Taxonomia","Status inválido","Status atual: \"" + String(meta.status || "vazio") + "\".","taxonomy",name);
    });

    Object.keys(tx.characters || {}).forEach(function(name){
      if(!active.has(name) && !secure.has(name)){
        issue(report,"warning","Taxonomia","Metadado órfão","\"" + name + "\" possui organização mas nenhuma ficha ativa.");
      }
    });
  });
}

function probeImage(src,timeout){
  return new Promise(function(resolve){
    if(!src){ resolve(false); return; }
    if(/^data:image\//i.test(src)){ resolve(true); return; }

    var done = false;
    var img = new Image();
    var timer = setTimeout(function(){
      if(done) return;
      done = true;
      resolve(false);
    },timeout || 5500);

    img.onload = function(){
      if(done) return;
      done = true;
      clearTimeout(timer);
      resolve(true);
    };
    img.onerror = function(){
      if(done) return;
      done = true;
      clearTimeout(timer);
      resolve(false);
    };
    img.referrerPolicy = "no-referrer";
    img.src = src + (src.indexOf("?") >= 0 ? "&" : "?") + "_tzcheck=" + Date.now();
  });
}

async function auditMedia(report){
  var names = characterNames();
  var active = new Set(names);
  var rows = data().characterMedia || {};
  var resolver = app().characterMedia;

  await checkAsync(report,"Mídia","Retratos e fontes",async function(){
    var tasks = [];

    names.forEach(function(name){
      var row = rows[name];
      if(!row){
        issue(report,"warning","Mídia","Sem registro de mídia","Não há imagem nem fonte automática configurada.","character",name);
        return;
      }

      var src = String(row.src || "").trim();
      var auto = row.auto && typeof row.auto === "object" ? row.auto : null;

      if(src){
        tasks.push(probeImage(src,5000).then(function(ok){
          if(!ok) issue(report,"critical","Mídia","Imagem local quebrada","O arquivo \"" + src + "\" não carregou.","character",name);
        }));
        return;
      }

      if(!auto){
        issue(report,"warning","Mídia","Somente placeholder","Nenhuma imagem ou fonte automática foi configurada.","character",name);
        return;
      }

      if(auto.provider === "dc-fandom"){
        if(!String(auto.wikiTitle || "").trim()){
          issue(report,"critical","Mídia","Fonte DC incompleta","A página da DC Database não foi informada.","character",name);
        } else if(resolver && resolver.resolveAutomatic){
          tasks.push(resolver.resolveAutomatic(name).then(function(result){
            if(!result || !result.found || !result.imageUrl){
              issue(report,"warning","Mídia","Retrato DC não encontrado","Página configurada: \"" + auto.wikiTitle + "\".","character",name);
            }
          }).catch(function(){
            issue(report,"warning","Mídia","DC Database não respondeu","Não foi possível validar o retrato automático durante esta verificação.","character",name);
          }));
        }
        return;
      }

      if(auto.provider === "external-url"){
        var url = String(auto.imageUrl || "").trim();
        if(!/^https:\/\//i.test(url)){
          issue(report,"critical","Mídia","URL externa inválida","A imagem externa precisa usar HTTPS.","character",name);
          return;
        }

        if(!String(auto.fallbackWikiTitle || "").trim()){
          issue(report,"warning","Mídia","Imagem externa sem fallback","Se o host bloquear a imagem, não há segunda fonte configurada.","character",name);
        }

        tasks.push(probeImage(url,6000).then(function(ok){
          if(!ok){
            issue(
              report,
              auto.fallbackWikiTitle ? "warning" : "critical",
              "Mídia",
              "Fonte externa indisponível",
              auto.fallbackWikiTitle ? "Existe fallback para \"" + auto.fallbackWikiTitle + "\"." : "Não existe fallback configurado.",
              "character",
              name
            );
          }
        }));
        return;
      }

      issue(report,"critical","Mídia","Provedor desconhecido","Provider: \"" + String(auto.provider || "vazio") + "\".","character",name);
    });

    Object.keys(rows).forEach(function(name){
      if(!active.has(name) && privateNames().indexOf(name) === -1){
        issue(report,"warning","Mídia","Mídia órfã","Existe mídia para \"" + name + "\" sem ficha ativa.");
      }
    });

    await Promise.all(tasks);
  });
}

function canonicalLocations(){
  var result = new Set();
  var districts = Array.isArray(data().districts) ? data().districts : [];
  districts.forEach(function(district){
    if(district && district.name) result.add(normalize(district.name));
    (district && Array.isArray(district.locations) ? district.locations : []).forEach(function(name){
      result.add(normalize(name));
    });
  });
  return result;
}

function auditSessions(report){
  var rows = sessionRows();
  report.stats.sessions = rows.length;
  var names = new Set(characterNames());
  var locations = canonicalLocations();

  check(report,"Sessões","IDs e campos básicos",function(){
    var seen = {};
    rows.forEach(function(row,index){
      if(!row || typeof row !== "object"){
        issue(report,"critical","Sessões","Entrada inválida","A entrada #" + (index + 1) + " não é uma sessão válida.");
        return;
      }

      var id = String(row.id || "").trim();
      if(!id) issue(report,"critical","Sessões","Sessão sem ID","A sessão precisa de um identificador estável.");
      else if(seen[id]) issue(report,"critical","Sessões","ID duplicado","O ID \"" + id + "\" aparece mais de uma vez.");
      seen[id] = true;

      if(!String(row.title || "").trim()) issue(report,"warning","Sessões","Sessão sem título","ID: " + (id || "indefinido") + ".");
      if(!String(row.summary || "").trim()) issue(report,"warning","Sessões","Sessão sem resumo","Sessão: " + String(row.title || id || index + 1) + ".");
      if(row.realDate && !/^\d{4}-\d{2}-\d{2}$/.test(String(row.realDate))){
        issue(report,"warning","Sessões","Data fora do padrão","\"" + row.realDate + "\" deveria usar YYYY-MM-DD.");
      }
      if(["public","rumor","master"].indexOf(String(row.visibility || "public")) === -1){
        issue(report,"warning","Sessões","Visibilidade inválida","Valor: \"" + String(row.visibility) + "\".");
      }
    });
  });

  check(report,"Sessões","Referências válidas",function(){
    rows.forEach(function(row){
      if(!row || typeof row !== "object") return;
      var label = String(row.title || row.id || "Sessão");
      (Array.isArray(row.characters) ? row.characters : []).forEach(function(name){
        if(!names.has(name)){
          issue(report,"warning","Sessões","Personagem não encontrado","\"" + name + "\" é citado em \"" + label + "\".","sessions",String(row.id || ""));
        }
      });
      (Array.isArray(row.locations) ? row.locations : []).forEach(function(name){
        if(locations.size && !locations.has(normalize(name))){
          issue(report,"info","Sessões","Local ainda não catalogado","\"" + name + "\" aparece em \"" + label + "\".","sessions",String(row.id || ""));
        }
      });
    });
  });
}

function auditGraph(report){
  var graph = graphData();
  var nodes = Array.isArray(graph.nodes) ? graph.nodes : [];
  var edges = Array.isArray(graph.edges) ? graph.edges : [];
  report.stats.graphNodes = nodes.length;

  check(report,"Relações","Estrutura do grafo",function(){
    var ids = {};
    nodes.forEach(function(node){
      var id = String(node && node.id || "");
      if(!id) issue(report,"critical","Relações","Nó sem ID","Existe um nó sem identificador.","graph");
      else if(ids[id]) issue(report,"critical","Relações","ID de nó duplicado","O ID \"" + id + "\" aparece mais de uma vez.","graph");
      ids[id] = true;
    });

    var seenEdges = {};
    edges.forEach(function(edge){
      var from = String(edge && edge.from || "");
      var to = String(edge && edge.to || "");
      if(!ids[from] || !ids[to]){
        issue(report,"critical","Relações","Conexão quebrada","A relação \"" + from + " -> " + to + "\" aponta para nó inexistente.","graph");
      }
      if(from && from === to) issue(report,"warning","Relações","Auto-relação","O nó \"" + from + "\" aponta para ele mesmo.","graph");

      var a = [from,to,String(edge && edge.type || ""),String(edge && edge.label || "")].join("|");
      var b = [to,from,String(edge && edge.type || ""),String(edge && edge.label || "")].join("|");
      if(seenEdges[a] || seenEdges[b]) issue(report,"info","Relações","Conexão duplicada","A mesma relação aparece mais de uma vez.","graph");
      seenEdges[a] = true;
    });
  });

  check(report,"Relações","Nós vinculados a fichas",function(){
    var api = app().graph;
    var map = api && api.getCharacterMap ? api.getCharacterMap() : {};
    var names = new Set(characterNames());

    Object.keys(map).forEach(function(nodeId){
      if(nodes.some(function(node){ return node && node.id === nodeId; }) && !names.has(map[nodeId])){
        issue(report,"warning","Relações","Ficha ausente no grafo","O nó \"" + nodeId + "\" aponta para \"" + map[nodeId] + "\", que não está disponível.","graph");
      }
    });
  });
}

function auditPrivacy(report){
  var tx = data().characterTaxonomy || {characters:{}};
  var secure = new Set(privateNames());
  report.stats.securePrivate = secure.size;

  check(report,"Privacidade","Fichas privadas protegidas",function(){
    var pending = [];
    Object.keys(tx.characters || {}).forEach(function(name){
      var meta = tx.characters[name] || {};
      if(meta.visibility === "private" && !secure.has(name)) pending.push(name);
    });

    if(pending.length){
      issue(
        report,
        "warning",
        "Privacidade",
        "Migração criptografada pendente",
        pending.length + (pending.length === 1 ? " personagem ainda está nos dados públicos: " : " personagens ainda estão nos dados públicos: ") + pending.join(", ") + ".",
        "privacy"
      );
    }
  });

  if(secure.size){
    issue(report,"info","Privacidade","Cofre criptografado ativo",secure.size + (secure.size === 1 ? " ficha privada carregada após autenticação." : " fichas privadas carregadas após autenticação."));
  }
}

function auditDom(report){
  check(report,"Interface","IDs HTML únicos",function(){
    var ids = {};
    document.querySelectorAll("[id]").forEach(function(node){
      if(node.id) ids[node.id] = (ids[node.id] || 0) + 1;
    });
    Object.keys(ids).forEach(function(id){
      if(ids[id] > 1) issue(report,"critical","Interface","ID HTML duplicado","\"" + id + "\" aparece " + ids[id] + " vezes.");
    });
  });

  check(report,"Interface","IDs editáveis únicos",function(){
    var ids = {};
    document.querySelectorAll("[data-edit-id]").forEach(function(node){
      var id = node.getAttribute("data-edit-id");
      if(id) ids[id] = (ids[id] || 0) + 1;
    });
    Object.keys(ids).forEach(function(id){
      if(ids[id] > 1) issue(report,"warning","Interface","data-edit-id duplicado","\"" + id + "\" aparece " + ids[id] + " vezes.");
    });
  });
}

function counts(report){
  var out = {critical:0,warning:0,info:0};
  (report && report.issues || []).forEach(function(row){
    if(Object.prototype.hasOwnProperty.call(out,row.severity)) out[row.severity]++;
  });
  return out;
}

function status(message,state){
  var node = el("integrityStatus");
  if(!node) return;
  node.textContent = message || "";
  node.setAttribute("data-state",state || "idle");
}

function labelSeverity(value){
  if(value === "critical") return "CRÍTICO";
  if(value === "warning") return "ATENÇÃO";
  return "INFO";
}

function render(){
  if(!currentReport) return;
  var root = el("integrityResults");
  if(!root) return;

  var totals = counts(currentReport);
  if(el("integrityCriticalCount")) el("integrityCriticalCount").textContent = String(totals.critical);
  if(el("integrityWarningCount")) el("integrityWarningCount").textContent = String(totals.warning);
  if(el("integrityInfoCount")) el("integrityInfoCount").textContent = String(totals.info);
  if(el("integrityPassedCount")) el("integrityPassedCount").textContent = String(currentReport.passes.length);

  var term = normalize(el("integritySearch") ? el("integritySearch").value : "");
  var rows = currentReport.issues.filter(function(row){
    if(currentFilter !== "all" && row.severity !== currentFilter) return false;
    return !term || row.search.indexOf(term) !== -1;
  });

  var order = {critical:0,warning:1,info:2};
  rows.sort(function(a,b){ return order[a.severity] - order[b.severity] || a.area.localeCompare(b.area,"pt-BR"); });

  if(!rows.length){
    root.innerHTML = '<div class="integrity-empty"><strong>' +
      (currentReport.issues.length ? "Nenhum resultado neste filtro." : "Tudo certo neste diagnóstico.") +
      '</strong><span>' +
      (currentReport.issues.length ? "Tente outro filtro ou termo de busca." : "Nenhuma inconsistência foi encontrada.") +
      '</span></div>';
  } else {
    root.innerHTML = rows.map(function(row){
      var action = row.action
        ? '<button type="button" data-integrity-action="' + escapeAttr(row.action) + '" data-integrity-entity="' + escapeAttr(row.entity || "") + '">Abrir ↗</button>'
        : "";
      return '<article class="integrity-issue severity-' + escapeAttr(row.severity) + '">' +
        '<div class="integrity-issue-top"><span class="integrity-severity">' + labelSeverity(row.severity) + '</span><span class="integrity-area">' + escapeHtml(row.area) + '</span></div>' +
        '<div class="integrity-issue-main"><div><strong>' + escapeHtml(row.title) + '</strong>' +
        (row.entity ? '<span class="integrity-entity">' + escapeHtml(row.entity) + '</span>' : "") +
        '<p>' + escapeHtml(row.detail) + '</p></div>' + action + '</div></article>';
    }).join("");
  }

  if(el("integrityLastRun")){
    el("integrityLastRun").textContent = "Última verificação: " +
      currentReport.finishedAt.toLocaleString("pt-BR") + " · " +
      currentReport.stats.characters + " personagens · " +
      currentReport.stats.sessions + " sessões · " +
      currentReport.stats.graphNodes + " nós.";
  }

  bindActions();
}

function setFilter(value){
  currentFilter = value || "all";
  document.querySelectorAll("[data-integrity-filter]").forEach(function(button){
    button.classList.toggle("active",button.getAttribute("data-integrity-filter") === currentFilter);
  });
  render();
}

function bindActions(){
  var root = el("integrityResults");
  if(!root) return;
  root.querySelectorAll("[data-integrity-action]").forEach(function(button){
    button.addEventListener("click",function(){
      handleAction(button.getAttribute("data-integrity-action"),button.getAttribute("data-integrity-entity") || "");
    });
  });
}

function handleAction(action,entity){
  close();

  if(action === "character"){
    setTimeout(function(){ if(app().characters && app().characters.open) app().characters.open(entity); },60);
    return;
  }

  if(action === "taxonomy"){
    setTimeout(function(){ if(app().taxonomyManager && app().taxonomyManager.open) app().taxonomyManager.open(); },60);
    return;
  }

  if(action === "graph"){
    setTimeout(function(){ if(app().graph && app().graph.openEditor) app().graph.openEditor(); },60);
    return;
  }

  if(action === "privacy"){
    setTimeout(function(){ if(app().adminPanel && app().adminPanel.open) app().adminPanel.open(); },60);
    return;
  }

  if(action === "sessions"){
    var tab = document.querySelector('.tab-btn[data-tab="tab-terraz"]');
    if(tab) tab.click();
    setTimeout(function(){
      var side = document.querySelector('#tab-terraz .sidebar-item[data-sub="sub-tz-sessoes"]');
      if(side) side.click();
      var target = document.getElementById("sub-tz-sessoes");
      if(target) target.scrollIntoView({behavior:"smooth",block:"start"});
    },80);
  }
}

async function run(){
  if(running) return currentReport;
  running = true;

  var button = el("integrityRun");
  if(button){
    button.disabled = true;
    button.textContent = "Verificando…";
  }

  status("Analisando estrutura, fichas, mídia e referências…","working");
  if(el("integrityResults")) el("integrityResults").innerHTML = '<div class="integrity-loading">Executando diagnóstico…</div>';

  var report = makeReport();

  try{
    auditCharacters(report);
    auditTaxonomy(report);
    await auditMedia(report);
    auditSessions(report);
    auditGraph(report);
    auditPrivacy(report);
    auditDom(report);

    report.finishedAt = new Date();
    currentReport = report;
    render();

    var total = counts(report);
    if(total.critical){
      status(total.critical + (total.critical === 1 ? " problema crítico encontrado." : " problemas críticos encontrados."),"error");
    } else if(total.warning){
      status("Sem problemas críticos. Há " + total.warning + (total.warning === 1 ? " ponto de atenção." : " pontos de atenção."),"warning");
    } else {
      status("Nenhum problema crítico ou ponto de atenção encontrado.","success");
    }

    return report;
  } finally {
    running = false;
    if(button){
      button.disabled = false;
      button.textContent = "↻ Verificar novamente";
    }
  }
}

function open(){
  var panel = el("integrityPanel");
  if(!panel) return;
  panel.classList.add("show");
  document.body.style.overflow = "hidden";
  currentFilter = "all";
  if(el("integritySearch")) el("integritySearch").value = "";
  document.querySelectorAll("[data-integrity-filter]").forEach(function(button){
    button.classList.toggle("active",button.getAttribute("data-integrity-filter") === "all");
  });
  run();
}

function close(){
  var panel = el("integrityPanel");
  if(panel) panel.classList.remove("show");
  document.body.style.overflow = "";
}

function setup(){
  if(el("integrityClose")) el("integrityClose").addEventListener("click",close);
  if(el("integrityRun")) el("integrityRun").addEventListener("click",run);
  if(el("integritySearch")) el("integritySearch").addEventListener("input",render);

  document.querySelectorAll("[data-integrity-filter]").forEach(function(button){
    button.addEventListener("click",function(){ setFilter(button.getAttribute("data-integrity-filter")); });
  });

  var panel = el("integrityPanel");
  if(panel){
    panel.addEventListener("click",function(event){ if(event.target === panel) close(); });
  }
}

setup();

window.TerraZApp.integrityChecker = {
  open:open,
  close:close,
  run:run,
  getReport:function(){ return currentReport; }
};

})();