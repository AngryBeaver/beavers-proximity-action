import {EntityApp} from "./EntityApp.js";

export class ProximityTileApp extends EntityApp<"tile"> {
    constructor(app, html, tile:Tile) {
        super(app,html,tile,"tile");
    }
}