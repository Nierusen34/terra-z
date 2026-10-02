import { test, expect } from "@playwright/test";

function watchRuntimeErrors(page){
  const errors=[];
  page.on("pageerror",error=>errors.push(String(error && error.message || error)));
  return errors;
}

async function expectImageLoaded(locator){
  await expect(locator).toHaveCount(1);
  await expect.poll(async()=>{
    return locator.evaluate(img=>Boolean(img.complete && img.naturalWidth>0 && img.naturalHeight>0));
  },{timeout:8000}).toBe(true);
}

async function expectNoPageErrors(errors){
  expect(errors,"Erros JavaScript não tratados no navegador").toEqual([]);
}

test("boot público permanece leve e navegável",async({page},testInfo)=>{
  const errors=watchRuntimeErrors(page);

  await page.goto("/#/capa",{waitUntil:"domcontentloaded"});
  await expect(page.locator(".masthead")).toBeVisible();
  await expect(page.locator("#adminPanelBtn")).toBeVisible();

  await expect.poll(async()=>page.evaluate(()=>Boolean(
    window.TerraZApp &&
    window.TerraZApp.router &&
    window.TerraZApp.adminLoader
  ))).toBe(true);

  expect(await page.locator("script[data-admin-module]").count()).toBe(0);

  if(testInfo.project.name==="mobile-chromium"){
    const overflow=await page.evaluate(()=>({
      viewport:window.innerWidth,
      width:document.documentElement.scrollWidth
    }));
    expect(overflow.width).toBeLessThanOrEqual(overflow.viewport+4);
  }

  await expectNoPageErrors(errors);
});

test("PWA registra, expõe manifesto e mantém o núcleo público offline",async({page},testInfo)=>{
  const errors=watchRuntimeErrors(page);

  await page.goto("/#/capa",{waitUntil:"domcontentloaded"});
  const manifest=await page.evaluate(async()=>{
    const response=await fetch("./manifest.webmanifest");
    return response.json();
  });

  expect(manifest.name).toContain("Terra Z");
  expect(manifest.display).toBe("standalone");
  expect(manifest.start_url).toBe("./#/capa");
  expect(manifest.icons.some(icon=>String(icon.sizes||"").includes("192x192"))).toBe(true);
  expect(manifest.icons.some(icon=>String(icon.purpose||"").includes("maskable"))).toBe(true);

  await expect.poll(()=>page.evaluate(async()=>{
    if(!("serviceWorker" in navigator))return false;
    await navigator.serviceWorker.ready;
    return Boolean(navigator.serviceWorker.controller);
  }),{timeout:12000}).toBe(true);

  if(testInfo.project.name==="mobile-chromium"){
    const label=await page.locator("#commandPaletteBtn").evaluate(node=>
      getComputedStyle(node,"::after").content
    );
    expect(label).toContain("Central");
    await page.locator("#commandPaletteBtn").click();
    await expect(page.locator("#commandPalette")).toHaveClass(/show/);
    await page.locator("#commandPaletteClose").click();
  }

  await page.context().setOffline(true);
  try{
    await page.reload({waitUntil:"domcontentloaded"});
    await expect(page.locator(".masthead")).toBeVisible();
    await expect(page.locator("#pwaNetworkStatus")).toBeVisible();
  }finally{
    await page.context().setOffline(false);
  }

  await expectNoPageErrors(errors);
});

test("todas as rotas principais e deep links essenciais permanecem navegáveis",async({page})=>{
  const errors=watchRuntimeErrors(page);

  await page.goto("/#/capa",{waitUntil:"domcontentloaded"});
  await expect.poll(async()=>page.evaluate(()=>Boolean(window.TerraZApp&&window.TerraZApp.router))).toBe(true);

  const routes=[
    ["/capa","#tab-home.active"],
    ["/cidade/visao-geral","#sub-visao.active"],
    ["/cidade/distritos","#sub-distritos.active"],
    ["/cidade/historia","#sub-historia.active"],
    ["/cidade/cultura","#sub-cultura.active"],
    ["/cidade/eventos","#sub-eventos.active"],
    ["/mapas/visao-geral","#sub-mapa-detalhado.active"],
    ["/mapas/transporte","#sub-mapa-transporte.active"],
    ["/mapas/nacional","#sub-mapa-nacional.active"],
    ["/mapas/criminalidade","#sub-mapa-criminal.active"],
    ["/transporte/internas","#sub-dist-internas.active"],
    ["/transporte/cidades","#sub-cidades-externas.active"],
    ["/transporte/sistema","#sub-sistema-transporte.active"],
    ["/universo/visao-geral","#sub-universo-visao.active"],
    ["/universo/personagens","#sub-tz-personagens.active"],
    ["/universo/linha-do-tempo","#sub-tz-timeline.active"],
    ["/universo/equipes","#sub-tz-equipes.active"],
    ["/universo/relacoes","#sub-tz-relacoes.active"],
    ["/universo/sessoes","#sub-tz-sessoes.active"]
  ];

  for(const [route,selector] of routes){
    await page.evaluate(r=>window.TerraZApp.router.go(r),route);
    await expect(page.locator(selector)).toBeVisible();
    await expect.poll(()=>page.evaluate(()=>window.TerraZApp.router.current())).toBe(route);
  }

  const deepLinks=[
    "/personagens/mgann-morzz",
    "/sessoes/2026-09-27-dupla-improvavel",
    "/equipes/liga-da-justica",
    "/cidades/gotham-city",
    "/distritos/o-dique",
    "/linha-do-tempo/encontro-em-vanguard-bay"
  ];

  for(const route of deepLinks){
    await page.evaluate(r=>window.TerraZApp.router.go(r),route);
    await expect.poll(()=>page.evaluate(()=>window.TerraZApp.router.current())).toBe(route);
  }

  await expect(page.locator("#timelineData [data-timeline-id=\"encontro-em-vanguard-bay\"]")).toBeVisible();
  await expectNoPageErrors(errors);
});

test("Busca Global 2.0 encontra entidades e navega por Ctrl+K",async({page})=>{
  const errors=watchRuntimeErrors(page);

  await page.goto("/#/capa",{waitUntil:"domcontentloaded"});
  await expect.poll(()=>page.evaluate(()=>Boolean(window.TerraZApp&&window.TerraZApp.commandPalette))).toBe(true);

  await page.keyboard.press("Control+K");
  await expect(page.locator("#commandPalette")).toHaveClass(/show/);
  await page.locator("#commandPaletteInput").fill("Gotham");
  await expect(page.locator("#commandPaletteResults .command-palette-result").first()).toContainText("Gotham");

  const count=await page.locator("#commandPaletteResults .command-palette-result").count();
  expect(count).toBeGreaterThan(0);

  await page.locator("#commandPaletteResults .command-palette-result").first().click();
  await expect.poll(()=>page.evaluate(()=>window.TerraZApp.router.current())).toContain("/cidades/gotham-city");

  await expectNoPageErrors(errors);
});

test("Relações renderiza Armek com mídia independente e painel de inspeção",async({page})=>{
  const errors=watchRuntimeErrors(page);

  await page.goto("/#/universo/relacoes",{waitUntil:"domcontentloaded"});
  const graph=page.locator("#graphSvg");
  await expect(graph).toBeVisible();

  const armek=graph.locator('[data-node-id="armek"]');
  await expect(armek).toBeVisible();

  const portrait=armek.locator(".graph-node-portrait-frame img");
  await expectImageLoaded(portrait);

  await armek.click();
  const inspector=page.locator("#graphInspector");
  await expect(inspector).toContainText("ARMEK");
  const inspectorImage=inspector.locator(".graph-inspector-independent img");
  await expectImageLoaded(inspectorImage);

  await expect(page.locator("#graphZoomRange")).toBeVisible();
  await expectNoPageErrors(errors);
});

test("editor visual do grafo auto-organiza e permite arrastar, adicionar e remover",async({page})=>{
  const errors=watchRuntimeErrors(page);
  await page.goto("/#/universo/relacoes",{waitUntil:"domcontentloaded"});

  await page.evaluate(async()=>{
    await window.TerraZApp.adminLoader.load();
    window.TerraZApp.backend.isConfigured=()=>true;
    window.TerraZApp.backend.isAuthenticated=()=>true;
    window.TerraZApp.backend.health=async()=>({
      ok:true,
      relations_graph_v3:true,
      relations_entity_editor:true,
      media_library_v1:true,
      graph_independent_media:true,
      visibility_system:"public-spoiler-master",
      secure_master_relations:true
    });
    document.dispatchEvent(new CustomEvent("terra-z:auth-changed",{detail:{authenticated:true}}));
    await window.TerraZApp.graph.openLayout();
  });

  await expect(page.locator("#graphEditorModal")).toHaveClass(/show/);
  await expect(page.locator("#graphEditorModal")).toHaveClass(/graph-editor-layout-mode/);
  const layout=page.locator("#graphLayoutSvg");
  await expect(layout).toBeVisible();
  await expect.poll(()=>layout.locator("[data-layout-node-id]").count()).toBeGreaterThan(10);

  await page.locator("#graphAutoArrangeBtn").click();
  const arranged=await page.evaluate(()=>{
    function pos(id){
      const n=document.querySelector('#graphLayoutSvg [data-layout-node-id="'+id+'"]');
      const m=String(n&&n.getAttribute("transform")||"").match(/translate\(([-\d.]+)\s+([-\d.]+)\)/);
      return m?{x:Number(m[1]),y:Number(m[2])}:null;
    }
    return {oliver:pos("oliver"),bruce:pos("bruce"),mgann:pos("mgann"),lobo:pos("lobo")};
  });
  expect(arranged.oliver.x).toBeLessThan(500);
  expect(arranged.oliver.y).toBeLessThan(360);
  expect(arranged.bruce.x).toBeGreaterThan(500);
  expect(arranged.bruce.y).toBeLessThan(360);
  expect(arranged.mgann.x).toBeLessThan(500);
  expect(arranged.mgann.y).toBeGreaterThan(380);
  expect(arranged.lobo.x).toBeGreaterThan(500);
  expect(arranged.lobo.y).toBeGreaterThan(380);

  const movable=layout.locator('[data-layout-node-id="oliver"]');
  const before=await movable.getAttribute("transform");
  const box=await movable.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
  await page.mouse.down();
  await page.mouse.move(box.x+box.width/2+55,box.y+box.height/2+35,{steps:5});
  await page.mouse.up();
  const after=await movable.getAttribute("transform");
  expect(after).not.toBe(before);

  const countBefore=await layout.locator("[data-layout-node-id]").count();
  await page.locator("#graphEditorAdd").click();
  await expect(layout.locator("[data-layout-node-id]")).toHaveCount(countBefore+1);
  await page.locator("#geLayoutDeleteSelected").click();
  await expect(page.locator("#confirmModal")).toHaveClass(/show/);
  await page.locator("#confirmOk").click();
  await expect(layout.locator("[data-layout-node-id]")).toHaveCount(countBefore);

  await page.evaluate(()=>window.TerraZApp.graph.closeEditor());
  await expectNoPageErrors(errors);
});

test("ficha pública abre sem quebrar o layout",async({page})=>{
  const errors=watchRuntimeErrors(page);

  await page.goto("/#/universo/personagens",{waitUntil:"domcontentloaded"});
  const cards=page.locator("#sub-tz-personagens .card-grid .card");
  await expect.poll(()=>cards.count()).toBeGreaterThan(0);

  const mgann=cards.filter({hasText:"M'gann"}).first();
  await expect(mgann).toBeVisible();
  await mgann.click();

  await expect(page.locator("#fichaModal")).toHaveClass(/show/);
  await expect(page.locator("#fichaHeader h2")).toContainText("M'gann");
  await expect(page.locator("#fichaBody .ficha-section").first()).toBeVisible();

  await expectNoPageErrors(errors);
});

test("Administração é carregada somente quando solicitada",async({page})=>{
  const errors=watchRuntimeErrors(page);

  await page.goto("/#/capa",{waitUntil:"domcontentloaded"});
  expect(await page.locator("script[data-admin-module]").count()).toBe(0);

  await page.locator("#adminPanelBtn").click();

  await expect(page.locator('script[data-admin-module="js/admin-panel.js"]')).toHaveCount(1);
  await expect(page.locator("#adminPanel")).toHaveClass(/show/);
  await expect(page.locator("#adminLoggedOut")).toBeVisible();

  const loaded=await page.evaluate(()=>Boolean(
    window.TerraZApp &&
    window.TerraZApp.adminLoader &&
    window.TerraZApp.adminLoader.isLoaded()
  ));
  expect(loaded).toBe(true);

  await expectNoPageErrors(errors);
});


test("Administração avançada renderiza Taxonomias, Lote e Sala do Mestre",async({page})=>{
  const errors=watchRuntimeErrors(page);

  await page.goto("/#/capa",{waitUntil:"domcontentloaded"});

  await page.evaluate(async()=>{
    await window.TerraZApp.adminLoader.load();

    const sampleMaster={
      version:1,
      notes:[{id:"note-1",title:"Preparação",body:"Revisar os contatos de Vanguard Bay antes da próxima sessão.",tags:["sessão"],updatedAt:"2026-10-01T21:00:00.000Z"}],
      revelations:[{id:"rev-1",title:"Contato oculto",body:"A identidade do contato ainda não foi revelada.",trigger:"Quando o grupo chegar ao centro cívico",status:"planned",characters:[],updatedAt:"2026-10-01T21:00:00.000Z"}],
      goals:[{id:"goal-1",title:"Encontrar o telepata",owner:"Grupo",body:"Avançar a investigação sem revelar a origem da missão.",status:"active",characters:["Tristan Queen","Riot"],updatedAt:"2026-10-01T21:00:00.000Z"}],
      clues:[{id:"clue-1",title:"Celular hackeado",body:"O aparelho ainda contém uma pista útil.",truth:"true",status:"hidden",characters:["Tristan Queen"],locations:["Downtown"],updatedAt:"2026-10-01T21:00:00.000Z"}],
      npcStates:[{id:"npc-1",name:"Senhorita C",state:"Aguardando novo contato",location:"Downtown",intention:"Testar a dupla",status:"active",notes:"Não revelar a identidade ainda.",updatedAt:"2026-10-01T21:00:00.000Z"}],
      timelineEvents:[]
    };

    window.TerraZApp.backend.isConfigured=()=>true;
    window.TerraZApp.backend.isAuthenticated=()=>true;
    window.TerraZApp.backend.health=async()=>({
      ok:true,
      taxonomy_manager_v2:true,
      bulk_editor_v1:true,
      master_quick_panel_v1:true,
      command_palette_v2:true,
      session_mode_v1:true,
      backup_export_v2:true,
      table_mode_v1:true
    });
    window.TerraZApp.backend.request=async(path)=>{
      if(String(path).startsWith("/api/master")){
        return {content:{characters:{},master:sampleMaster,graph:{nodes:[],edges:[]}}};
      }
      if(String(path).startsWith("/api/publish")){
        return {ok:true,history:[],head:"",production_sha:""};
      }
      return {ok:true};
    };

    document.dispatchEvent(new CustomEvent("terra-z:auth-changed",{detail:{authenticated:true}}));
  });

  await page.evaluate(()=>window.TerraZApp.taxonomyManager.open());
  await expect(page.locator("#taxonomyManagerPanel")).toHaveClass(/show/);
  await expect(page.locator("#taxonomyManagerTabs .taxonomy-kind-tab")).toHaveCount(4);
  await expect(page.locator("#taxonomyManagerList .taxonomy-manager-row").first()).toBeVisible();
  await page.evaluate(()=>window.TerraZApp.taxonomyManager.close());

  await page.evaluate(async()=>window.TerraZApp.bulkEditor.open());
  await expect(page.locator("#bulkEditorPanel")).toHaveClass(/show/);
  await expect.poll(()=>page.locator("#bulkEditorCharacters .bulk-character-row").count()).toBeGreaterThan(0);
  await expect(page.locator("#bulkEditorApply")).toBeVisible();
  await page.evaluate(()=>window.TerraZApp.bulkEditor.close());

  await page.evaluate(async()=>window.TerraZApp.masterQuick.open());
  await expect(page.locator("#masterQuickPanel")).toHaveClass(/show/);
  await expect(page.locator("#masterQuickStats > div")).toHaveCount(4);
  await expect(page.locator("#masterQuickGoals")).toBeVisible();
  await expect(page.locator("#masterQuickGoals .master-quick-item").first()).toBeVisible();

  const masterFonts=await page.evaluate(()=>({
    heading:parseFloat(getComputedStyle(document.querySelector(".master-quick-section-head strong")).fontSize),
    body:parseFloat(getComputedStyle(document.querySelector(".master-quick-item p")).fontSize),
    chip:parseFloat(getComputedStyle(document.querySelector(".master-quick-chips span")).fontSize),
    stat:parseFloat(getComputedStyle(document.querySelector(".master-quick-stats small")).fontSize),
    toolbar:parseFloat(getComputedStyle(document.querySelector("#masterQuickSearch")).fontSize)
  }));
  expect(masterFonts.heading).toBeGreaterThanOrEqual(12);
  expect(masterFonts.body).toBeGreaterThanOrEqual(11);
  expect(masterFonts.chip).toBeGreaterThanOrEqual(8);
  expect(masterFonts.stat).toBeGreaterThanOrEqual(9);
  expect(masterFonts.toolbar).toBeGreaterThanOrEqual(12);

  await page.evaluate(()=>window.TerraZApp.masterQuick.close());

  await expectNoPageErrors(errors);
});


test("Fase 14 renderiza Modo Sessão e Backup com rascunho temporário",async({page})=>{
  const errors=watchRuntimeErrors(page);

  await page.goto("/#/capa",{waitUntil:"domcontentloaded"});

  await page.evaluate(async()=>{
    await window.TerraZApp.adminLoader.load();

    const sampleMaster={
      version:1,
      notes:[{id:"n1",title:"Nota",body:"Segredo de teste",tags:["teste"],updatedAt:"2026-10-02T12:00:00.000Z"}],
      revelations:[],
      goals:[{id:"g1",title:"Investigar Vanguard",owner:"Grupo",body:"Objetivo ativo",status:"active",characters:[],updatedAt:"2026-10-02T12:00:00.000Z"}],
      clues:[{id:"c1",title:"Pista do Dique",body:"Uma pista oculta",truth:"true",status:"hidden",characters:[],locations:["O Dique"],updatedAt:"2026-10-02T12:00:00.000Z"}],
      npcStates:[{id:"npc1",name:"Senhorita C",state:"Ativa",location:"Downtown",intention:"Observar",status:"active",notes:"",updatedAt:"2026-10-02T12:00:00.000Z"}],
      timelineEvents:[]
    };

    window.TerraZApp.backend.isConfigured=()=>true;
    window.TerraZApp.backend.isAuthenticated=()=>true;
    window.TerraZApp.backend.health=async()=>({
      ok:true,
      visibility_system:"public-spoiler-master",
      taxonomy_manager_v2:true,
      bulk_editor_v1:true,
      master_quick_panel_v1:true,
      command_palette_v2:true,
      session_mode_v1:true,
      backup_export_v2:true
    });
    window.TerraZApp.backend.request=async(path,options)=>{
      if(String(path).startsWith("/api/master")){
        return {content:{characters:{},master:sampleMaster,graph:{nodes:[],edges:[]}}};
      }
      if(String(path).startsWith("/api/publish")&&options&&options.body&&options.body.action==="export-backup"){
        return {ok:true,backup:{
          schema:"terra-z-backup-v2",
          head_sha:"0123456789012345678901234567890123456789",
          files:{
            "data/sessions.js":"public",
            "data/private-character-data.enc.json":"encrypted",
            "data/private-sessions.enc.json":"encrypted"
          },
          media_manifest:[]
        }};
      }
      return {ok:true};
    };

    document.dispatchEvent(new CustomEvent("terra-z:auth-changed",{detail:{authenticated:true}}));
    await window.TerraZApp.privateContent.load();
  });

  await page.evaluate(()=>window.TerraZApp.sessionMode.open());
  await expect(page.locator("#sessionModePanel")).toHaveClass(/show/);
  await expect(page.locator("#sessionModeGoals")).toContainText("Investigar Vanguard");
  await expect(page.locator("#sessionModeClues")).toContainText("Pista do Dique");
  await expect(page.locator("#sessionModeNpcs")).toContainText("Senhorita C");

  await page.locator("#sessionModeTitleInput").fill("Sessão de teste");
  await page.locator("#sessionModeLogInput").fill("O grupo entrou no Dique.");
  await page.locator("#sessionModeAddLog").click();
  await expect(page.locator("#sessionModeLog .session-mode-log-item")).toHaveCount(1);

  const stored=await page.evaluate(()=>JSON.parse(sessionStorage.getItem("terraZ_session_mode_v1")||"null"));
  expect(stored.title).toBe("Sessão de teste");
  expect(stored.log).toHaveLength(1);
  await page.evaluate(()=>window.TerraZApp.sessionMode.close());

  await page.evaluate(()=>window.TerraZApp.tableMode.open());
  await expect(page.locator("#tableModePanel")).toHaveClass(/show/);
  await expect(page.locator("#tableModeSessionView")).toHaveClass(/active/);
  await page.locator('[data-table-tab="clues"]').click();
  await expect(page.locator("#tableModeCluesView")).toHaveClass(/active/);
  await expect(page.locator("#tableModeCluesView")).toContainText("Pista do Dique");
  await page.locator('[data-clue-status="revealed"]').first().click();

  await page.locator('[data-table-tab="npcs"]').click();
  await expect(page.locator("#tableModeNpcsView")).toContainText("Senhorita C");
  await page.locator('[data-table-npc="npc1"]').click();

  await page.locator('[data-table-tab="maps"]').click();
  await expect(page.locator(".table-mode-map-stage img")).toBeVisible();

  const tableStored=await page.evaluate(()=>JSON.parse(sessionStorage.getItem("terraZ_session_mode_v1")||"null"));
  expect(tableStored.clues).toContain("c1");
  expect(tableStored.npcs).toContain("npc1");
  expect(tableStored.table.tab).toBe("maps");
  await page.evaluate(()=>window.TerraZApp.tableMode.close());

  await page.evaluate(()=>window.TerraZApp.backupExport.open());
  await expect(page.locator("#backupExportPanel")).toHaveClass(/show/);
  await expect(page.locator("#backupExportComplete")).toBeEnabled();
  await expect(page.locator("#backupExportHtmlPublic")).toBeVisible();
  await expect(page.locator("#backupExportHtmlMaster")).toBeVisible();

  const hasDraftApi=await page.evaluate(()=>typeof window.TerraZApp.sessionEditor.openDraft==="function");
  expect(hasDraftApi).toBe(true);

  await page.evaluate(()=>window.TerraZApp.backupExport.close());
  await expectNoPageErrors(errors);
});
