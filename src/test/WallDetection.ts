// @ts-ignore
export class WallDetection extends PlaceableObject {

    line:PIXI.Graphics;
    endpoints:PIXI.Graphics;

    constructor(document) {
        super(document);
    }

    get bounds(): Rectangle {
        // @ts-ignore
        const [x0, y0, x1, y1] = this.document.points;
        // @ts-ignore
        return new PIXI.Rectangle(x0, y0, x1-x0, y1-y0).normalize();
    }



    async _draw() {
        this.line = this.addChild(new PIXI.Graphics());
        this.endpoints = this.addChild(new PIXI.Graphics());
        this.endpoints.buttonMode = true;
    }

    refresh(): this | void {
        return undefined;
    }


}