import { defineConfig } from "cypress";
export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {},
    baseUrl:
      "https://neuraspacedummyrsoapiappservicelinux-hyayfbdrg3gea6fd.westeurope-01.azurewebsites.net",
  },
});
