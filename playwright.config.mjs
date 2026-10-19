import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html',{open:'never'}]],
  use: { baseURL: process.env.PREVIEW_URL || 'http://127.0.0.1:4173', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    {name:'phone-320',use:{...devices['Desktop Chrome'],viewport:{width:320,height:568},isMobile:true,hasTouch:true}},
    {name:'phone-390',use:{...devices['Desktop Chrome'],viewport:{width:390,height:844},isMobile:true,hasTouch:true}},
    {name:'phone-430',use:{...devices['Desktop Chrome'],viewport:{width:430,height:932},isMobile:true,hasTouch:true}},
    {name:'tablet-768',use:{...devices['Desktop Chrome'],viewport:{width:768,height:1024}}},
    {name:'desktop-1440',use:{...devices['Desktop Chrome'],viewport:{width:1440,height:900}}}
  ],
  webServer: process.env.PREVIEW_URL ? undefined : {
    command:'npx http-server . -p 4173 -a 127.0.0.1 -c-1',
    url:'http://127.0.0.1:4173',
    reuseExistingServer:!process.env.CI,
    timeout:30000
  }
});
