import { NAMESPACE, Settings } from "./Settings.js";
import { ProximityRegionApp } from "./app/region/ProximityRegionApp.js";
import { ProximityTileApp } from "./app/region/ProximityTileApp.js";
import { BeaversProximityApp } from "./app/BeaversProximityApp.js";
import { InvestigateActivity } from "./activities/InvestigateActivity.js";
import { ProximityWallApp } from "./app/region/ProximityWallApp.js";
import { registerGMInboxSocketHandlers } from "./app/GmInbox.js";
import {
  registerGMExecuteActivitySocketHandler,
  registerGMScanSocketHandlers,
  runProximityChain,
} from "./execute/ClientFlow.js";
import { GmApproval } from "./tests/GmApproval.js";

export const HOOK_READY = NAMESPACE + ".ready";

Hooks.on("beavers-system-interface.init", async function() {
  beaversSystemInterface.addModule(NAMESPACE);
});

Hooks.once("init", () => {
  game[NAMESPACE] = game[NAMESPACE] || {};

});

Hooks.once("beavers-system-interface.ready", async function() {
  game[NAMESPACE] = game[NAMESPACE] || {};
  game[NAMESPACE].Settings = new Settings();
  game[NAMESPACE].BeaversProximityApp = new BeaversProximityApp();
  game[NAMESPACE].scan = runProximityChain;
  Hooks.call(HOOK_READY, game[NAMESPACE].BeaversProximityApp);
  initHandlebars();
  initializeCustomElements();
  Hooks.on("renderRegionConfig", (app, html, options) => {
    new ProximityRegionApp(app, html, options);
  });
  Hooks.on("renderTileConfig", (app, html, options) => {
    new ProximityTileApp(app, html, options);
  });
  Hooks.on("renderWallConfig", (app, html, options) => {
    new ProximityWallApp(app, html, options);
  });
  beaversSystemInterface.registerTestClass(new GmApproval());
});

Hooks.once(HOOK_READY, (bpa) => {
  bpa.addActivity(InvestigateActivity);
});

Hooks.once("beavers-gamepad.ready", () => {
  //const paUI = new ProximityActionUI();
  //game["beavers-gamepad"].TinyUIModuleManager.addModule(paUI.name, paUI);
});

Hooks.once("socketlib.ready", () => {
  game[NAMESPACE] = game[NAMESPACE] || {};
  game[NAMESPACE].socket = socketlib.registerModule(NAMESPACE);
  registerGMInboxSocketHandlers();
  registerGMScanSocketHandlers();
  registerGMExecuteActivitySocketHandler();
  // Scan on GM and return result

});

function initializeCustomElements() {
  //customElements.define('beavers-button',BeaversButton);
  //customElements.define('beavers-activity-test-config',BeaversActivityTestConfig)
}


function initHandlebars() {
  Handlebars.registerHelper("beavers-objectLen", function(json) {
    return Object.keys(json).length;
  });
  void getTemplate("modules/beavers-proximity-action/templates/activity-setting.hbs");
  void getTemplate("modules/beavers-proximity-action/templates/activity-configuration.hbs");
  void getTemplate("modules/beavers-proximity-action/templates/activity-test-config.hbs");
  getTemplate("modules/beavers-proximity-action/templates/beavers-input-field.hbs").then(t => {
    Handlebars.registerPartial("beavers-input-field", t);
  });


}