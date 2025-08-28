import { EntitySettings } from "../EntitySettings.js";
import { addTab } from "../Tabs.js";

export class ProximityWallApp extends EntitySettings<"wall"> {
  constructor(app, html, data) {
    super(app, html, data, "wall");
  }

  content(tabData: TabData) {
    tabData.content = `
  <header class="tile-wall flexrow">
    <div class="tile-wall-name">${tabData.name}</div>
    <div class="tile-wall-controls">
      <a class="control" data-action="createProxmityActivity" data-tooltip="" aria-label="Create new Activity">
        <i class="fa-solid fa-plus"></i>
      </a>
    </div>
  </header>
  ${tabData.content}
  `;
  }

  public addTab() {
    const html = $(this.element);
    if (html.find("nav").length == 0) {
      this.app.tabGroups = { sheet: "basic" };
      const old = html.find("section").html();
      html.find("section").html(`<nav class="sheet-tabs tabs" aria-roledescription="Form Tab Navigation" data-application-part="tabs">`);
      var tabData: TabData = {
        id: "basic",
        name: "Basic",
        icon: "<i class=\"fa-solid fa-block-brick\"></i>",
        group: "sheet",
        content: old,
        onClick: this.onActivateTab.bind(this),
      };
      addTab(this.element, tabData);
    }
  }

  activateHandler() {
    super.activateHandler()
    this.element
      .off("click.createProx", "a.control[data-action='createProxmityActivity']")
      .on("click.createProx", "a.control[data-action='createProxmityActivity']", (event) => {
        super.onAddActivity();
      });

  }
}