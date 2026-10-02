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
