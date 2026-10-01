(function(){
"use strict";

window.TerraZApp=window.TerraZApp || {};
var core=window.TerraZCore;
if(!core) throw new Error('Terra Z: núcleo não carregado antes de js/history-manager.js');

var escapeHtml=core.escapeHtml;
var escapeAttr=core.escapeAttr;
var showToast=core.showToast;
var showConfirm=core.showConfirm;

var overview=null;
var kindFilter='all';
var busy=false;

function el(id){ return document.getElementById(id); }
function app(){ return window.TerraZApp || {}; }
function backend(){ return app().backend; }
function shortSha(value){ return String(value || '').slice(0,7) || '—'; }

function formatDate(value){
  if(!value) return 'Data indisponível';
  try{
    return new Intl.DateTimeFormat('pt-BR',{
      dateStyle:'short',
      timeStyle:'short'
    }).format(new Date(value));
  }catch(error){
    return String(value);
  }
}

function kindMeta(kind){
  var map={
    character:['👤','Personagem'],
    session:['📓','Sessão'],
    graph:['🔗','Relações'],
    content:['✎','Conteúdo'],
    security:['🔐','Segurança'],
    media:['🖼️','Mídia'],
    deploy:['🚀','Deploy'],
    restore:['↩️','Restauração'],
    quality:['🧪','Qualidade'],
    feature:['✨','Sistema'],
    fix:['🛠️','Correção'],
    system:['⚙️','Sistema']
  };
  return map[kind] || map.system;
}

function setOperation(text,state){
  var node=el('historyOperationStatus');
  if(!node) return;
  node.textContent=text || '';
  node.setAttribute('data-state',state || 'idle');
}

function setBusy(value){
  busy=!!value;
  var deploy=el('historyDeployBtn');
  var refresh=el('historyRefreshBtn');
  if(refresh) refresh.disabled=busy;
  if(deploy){
    deploy.disabled=busy || !overview || !overview.sync || overview.sync.state === 'synced';
  }
}

function syncCopy(state,ahead){
  if(state === 'synced') return {
    title:'✓ Sincronizado',
    note:'GitHub main e Vercel executam o mesmo checkpoint.'
  };
  if(state === 'development') return {
    title:'Em desenvolvimento',
    note:(ahead || 0)+' commit'+((ahead || 0) === 1 ? '' : 's')+' desde a produção.'
  };
  if(state === 'diverged') return {
    title:'Atenção',
    note:'Produção e main não estão na mesma linha direta de histórico.'
  };
  return {
    title:'Indeterminado',
    note:'Não foi possível comparar o SHA de produção com o main.'
  };
}

function renderOverview(){
  if(!overview) return;

  var head=el('historyHeadSha');
  var prod=el('historyProductionSha');
  if(head) head.textContent=shortSha(overview.head_sha);
  if(prod) prod.textContent=shortSha(overview.production_sha);

  if(el('historyHeadNote')) el('historyHeadNote').textContent='Estado mais recente do repositório';
  if(el('historyProductionNote')){
    el('historyProductionNote').textContent=overview.production_sha
      ? 'SHA atualmente servido em produção'
      : 'SHA de produção indisponível';
  }

  var sync=overview.sync || {};
  var copy=syncCopy(sync.state,Number(sync.ahead_by || 0));
  if(el('historySyncState')) el('historySyncState').textContent=copy.title;
  if(el('historySyncNote')) el('historySyncNote').textContent=copy.note;

  var card=el('historySyncCard');
  if(card) card.setAttribute('data-state',sync.state || 'unknown');

  var policy=el('historyDeployPolicy');
  if(policy){
    if(overview.auto_deploy_paused === true){
      policy.className='history-deploy-policy paused';
      policy.textContent='🛡️ Deploy automático pausado · a Vercel só muda quando você publica um checkpoint.';
    }else if(overview.auto_deploy_paused === false){
      policy.className='history-deploy-policy warning';
      policy.textContent='⚠️ Deploy automático está habilitado no repositório.';
    }else{
      policy.className='history-deploy-policy';
      policy.textContent='Política de deploy não pôde ser confirmada.';
    }
  }

  var deploy=el('historyDeployBtn');
  if(deploy){
    var synced=sync.state === 'synced';
    deploy.disabled=busy || synced;
    deploy.textContent=synced
      ? '✓ Produção sincronizada'
      : '🚀 Publicar checkpoint';
  }
}

function filteredHistory(){
  var rows=overview && Array.isArray(overview.history) ? overview.history.slice() : [];
  var term=String(el('historySearch') ? el('historySearch').value : '')
    .trim().toLocaleLowerCase('pt-BR');

  return rows.filter(function(row){
    var kind=row.kind || 'system';
    var normalizedKind=['feature','fix','quality'].indexOf(kind) !== -1 ? 'system' : kind;
    if(kindFilter !== 'all' && normalizedKind !== kindFilter) return false;
    if(!term) return true;

    return [
      row.message,row.sha,row.short_sha,row.author,kindMeta(kind)[1]
    ].join(' ').toLocaleLowerCase('pt-BR').indexOf(term) !== -1;
  });
}

function renderHistory(){
  var root=el('historyList');
  if(!root || !overview) return;

  var rows=filteredHistory();
  if(el('historyLoadedCount')){
    var total=Array.isArray(overview.history) ? overview.history.length : 0;
    el('historyLoadedCount').textContent='Exibindo '+rows.length+' de '+total+' commits carregados';
  }

  if(!rows.length){
    root.innerHTML='<div class="history-empty"><strong>Nenhum commit neste filtro.</strong><span>Altere o tipo ou a busca.</span></div>';
    return;
  }

  root.innerHTML=rows.map(function(row){
    var meta=kindMeta(row.kind);
    var badges='';
    if(row.is_head) badges+='<span class="history-badge head">MAIN</span>';
    if(row.is_production) badges+='<span class="history-badge production">PRODUÇÃO</span>';
    if(row.is_checkpoint) badges+='<span class="history-badge checkpoint">CHECKPOINT</span>';

    var restoreBlocked=row.restore_allowed === false;
    var restoreDisabled=(row.is_head || restoreBlocked) ? ' disabled' : '';
    var restoreTitle=row.is_head
      ? 'Este já é o estado atual'
      : (restoreBlocked
        ? 'Checkpoint anterior à migração de privacidade real; restauração bloqueada'
        : 'Criar um novo commit restaurando somente o conteúdo deste ponto');

    if(restoreBlocked){
      badges+='<span class="history-badge unsafe">PRÉ-PRIVACIDADE</span>';
    }

    return '<article class="history-row" data-kind="'+escapeAttr(row.kind || 'system')+'">' +
      '<div class="history-row-icon">'+meta[0]+'</div>' +
      '<div class="history-row-main">' +
        '<div class="history-row-top"><span class="history-kind">'+escapeHtml(meta[1])+'</span>'+badges+'</div>' +
        '<strong>'+escapeHtml(row.message || 'Commit sem mensagem')+'</strong>' +
        '<div class="history-row-meta">' +
          '<code>'+escapeHtml(row.short_sha || shortSha(row.sha))+'</code>' +
          '<span>'+escapeHtml(formatDate(row.date))+'</span>' +
          (row.author ? '<span>'+escapeHtml(row.author)+'</span>' : '') +
        '</div>' +
      '</div>' +
      '<button type="button" class="history-restore-btn" data-history-restore="'+escapeAttr(row.sha || '')+'" title="'+escapeAttr(restoreTitle)+'"'+restoreDisabled+'>↩ Restaurar conteúdo</button>' +
    '</article>';
  }).join('');

  root.querySelectorAll('[data-history-restore]').forEach(function(button){
    button.addEventListener('click',function(){
      if(button.disabled) return;
      requestRestore(button.getAttribute('data-history-restore'));
    });
  });
}

function render(){
  renderOverview();
  renderHistory();
}

async function load(){
  var b=backend();
  if(!b || !b.isAuthenticated()){
    setOperation('Faça login como editor para abrir o histórico.','error');
    return null;
  }

  setOperation('Carregando histórico e estado de produção…','working');
  try{
    overview=await b.request('/api/publish?limit=60',{method:'GET'});
    setOperation('Histórico atualizado.','success');
    render();
    return overview;
  }catch(error){
    console.error('Terra Z history:',error);
    if(error.status === 405 || error.status === 400){
      setOperation('A Central está em staging. O backend de histórico será ativado no próximo checkpoint consolidado da Vercel.','staging');
    }else{
      setOperation(error.message || 'Não foi possível carregar o histórico.','error');
    }
    return null;
  }
}

async function refreshRuntime(sha){
  var runtime=app().runtimeData;
  if(runtime && runtime.refresh){
    await runtime.refresh({force:true,bust:sha || Date.now(),silent:true});
  }

  var privateContent=app().privateContent;
  if(privateContent && privateContent.reload) await privateContent.reload();

  var sessions=app().sessions;
  if(sessions && sessions.reloadPrivate) await sessions.reloadPrivate();
}

function requestRestore(targetSha){
  if(!overview || busy) return;
  var row=(overview.history || []).find(function(item){ return item.sha === targetSha; });
  var description=row
    ? shortSha(row.sha)+' · '+String(row.message || '')
    : shortSha(targetSha);

  showConfirm(
    'Restaurar conteúdo deste ponto',
    'Restaurar o conteúdo de "'+description+'"? Um novo commit será criado. O código atual e todo o histórico serão preservados.',
    function(){ performRestore(targetSha); },
    'Restaurar conteúdo'
  );
}

async function performRestore(targetSha){
  var b=backend();
  if(!b || !overview) return;

  setBusy(true);
  setOperation('Criando commit de restauração segura…','working');

  try{
    var result=await b.request('/api/publish',{
      method:'POST',
      body:{
        action:'restore-content',
        confirm:true,
        target_sha:targetSha,
        expected_head:overview.head_sha
      }
    });

    setOperation('Conteúdo restaurado no GitHub. Sincronizando a GitHub Page…','working');

    var publishing=app().publishing;
    if(publishing && publishing.waitForDeployment && result.status_url){
      try{ await publishing.waitForDeployment(result.status_url); }catch(error){}
    }

    await refreshRuntime(result.sha);
    showToast(
      'Conteúdo restaurado a partir de '+shortSha(result.source_sha)+'. O código atual foi preservado.',
      'success',
      6000
    );
    await load();
  }catch(error){
    console.error('Terra Z restore:',error);
    var message=error.message || 'Falha ao restaurar conteúdo.';
    if(error.payload && Array.isArray(error.payload.missing_paths)){
      message+=' O checkpoint não possui todos os arquivos seguros exigidos.';
    }
    setOperation(message,'error');
    showToast(message,'error',6500);
  }finally{
    setBusy(false);
    renderOverview();
  }
}

async function waitForVercel(statusUrl,sha){
  var b=backend();
  for(var attempt=0;attempt<180;attempt++){
    await new Promise(function(resolve){ setTimeout(resolve,5000); });
    var status=await b.publicJson(statusUrl+'&_t='+Date.now());
    if(status.status === 'failed'){
      throw new Error('O workflow de produção falhou no Quality Gate ou no smoke test.');
    }
    if(status.status === 'published'){
      for(var healthAttempt=0;healthAttempt<24;healthAttempt++){
        var health=await b.health();
        if(health && health.deployment_commit === sha) return true;
        await new Promise(function(resolve){ setTimeout(resolve,2500); });
      }
      throw new Error('O workflow terminou, mas a Vercel ainda não confirmou o SHA esperado.');
    }
  }
  throw new Error('O checkpoint excedeu o tempo de validação.');
}

function requestDeploy(){
  if(!overview || busy || (overview.sync && overview.sync.state === 'synced')) return;

  var ahead=Number(overview.sync && overview.sync.ahead_by || 0);
  showConfirm(
    'Publicar checkpoint na Vercel',
    'Publicar '+ahead+' commit'+(ahead === 1 ? '' : 's')+' acumulado'+(ahead === 1 ? '' : 's')+'? O Quality Gate será executado antes do deploy e o SHA será validado depois.',
    performDeploy,
    'Publicar checkpoint'
  );
}

async function performDeploy(){
  var b=backend();
  if(!b || !overview) return;

  setBusy(true);
  setOperation('Criando checkpoint de produção…','working');

  try{
    var result=await b.request('/api/publish',{
      method:'POST',
      body:{
        action:'deploy-checkpoint',
        expected_head:overview.head_sha,
        label:'publicação segura pelo painel'
      }
    });

    setOperation('Checkpoint criado. Quality Gate e deploy da Vercel em andamento…','working');
    await waitForVercel(result.vercel_status_url,result.sha);

    setOperation('Produção validada no SHA '+shortSha(result.sha)+'.','success');
    showToast('Checkpoint publicado e validado na Vercel.','success',6000);
    await load();
  }catch(error){
    console.error('Terra Z deploy checkpoint:',error);
    setOperation(error.message || 'Falha ao publicar checkpoint.','error');
    showToast(error.message || 'Falha ao publicar checkpoint.','error',7000);
  }finally{
    setBusy(false);
    renderOverview();
  }
}

function setKindFilter(value){
  kindFilter=value || 'all';
  renderHistory();
}

function open(){
  var panel=el('historyManagerPanel');
  if(!panel) return;
  panel.classList.add('show');
  document.body.style.overflow='hidden';
  if(el('historyKindFilter')) el('historyKindFilter').value='all';
  if(el('historySearch')) el('historySearch').value='';
  kindFilter='all';
  setOperation('','idle');
  load();
}

function close(){
  var panel=el('historyManagerPanel');
  if(panel) panel.classList.remove('show');
  document.body.style.overflow='';
}

function setup(){
  if(el('historyManagerClose')) el('historyManagerClose').addEventListener('click',close);
  if(el('historyRefreshBtn')) el('historyRefreshBtn').addEventListener('click',load);
  if(el('historyDeployBtn')) el('historyDeployBtn').addEventListener('click',requestDeploy);
  if(el('historyKindFilter')) el('historyKindFilter').addEventListener('change',function(){
    setKindFilter(this.value);
  });
  if(el('historySearch')) el('historySearch').addEventListener('input',renderHistory);

  var panel=el('historyManagerPanel');
  if(panel) panel.addEventListener('click',function(event){ if(event.target === panel) close(); });

  document.addEventListener('keydown',function(event){
    if(event.key === 'Escape' && panel && panel.classList.contains('show')) close();
  });

  document.addEventListener('terra-z:auth-changed',function(){
    overview=null;
    if(panel && panel.classList.contains('show')) load();
  });
}

setup();

window.TerraZApp.historyManager={
  open:open,
  close:close,
  load:load,
  render:render,
  getOverview:function(){ return overview; }
};

})();