import { EntitySettings } from "../EntitySettings.js";

export class ProximityTileApp extends EntitySettings<"tile"> {
  constructor(app, html, data) {
    super(app, html, data, "tile");
  }

  content(tabData: TabData) {
    tabData.content = `
  <header class="tile-element flexrow">
    <div class="tile-element-name">${tabData.name}</div>
    <div class="tile-element-controls">
      <a class="control" data-action="createProxmityActivity" data-tooltip="" aria-label="Create new Activity">
        <i class="fa-solid fa-plus"></i>
      </a>
    </div>
  </header>
  ${tabData.content}
  `;
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