import { defineConfig } from "@playwright/test";

const baseURL=process.env.TERRA_Z_E2E_URL || "http://127.0.0.1:4173/";

export default defineConfig({
  testDir:"./tests/browser",
  timeout:30000,
  expect:{timeout:8000},
  fullyParallel:false,
  workers:1,
  retries:0,
  reporter:[["line"]],
  outputDir:"test-results/browser",
  use:{
    baseURL,
    screenshot:"only-on-failure",
    video:"off",
    trace:"off",
    actionTimeout:8000,
    navigationTimeout:15000,
    reducedMotion:"reduce"
  },
  projects:[
    {
      name:"desktop-chromium",
      use:{
        browserName:"chromium",
        viewport:{width:1440,height:1000},
        deviceScaleFactor:1
      }
    },
    {
      name:"mobile-chromium",
      use:{
        browserName:"chromium",
        viewport:{width:390,height:844},
        deviceScaleFactor:1,
        isMobile:true,
        hasTouch:true
      }
    }
  ]
});
