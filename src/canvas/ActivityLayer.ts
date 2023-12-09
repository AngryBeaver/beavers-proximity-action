import {ClockwiseSweepShape} from "./ClockwiseSweepShape.js";
import {bpa} from "../bpaTypes.js";

export class ActivityLayer {

    activityContainer = {};

    drawActivity({token,distance,type,color}:bpa.ProximityRequest):ClockwiseSweepShape|null {
        let result:ClockwiseSweepShape|null = null;
        if (token) {
            const center = (token as Token).center;
            result = new ClockwiseSweepShape();
            const angel = type==="cone"?90:360;
            const size = this._gridSize();
            // @ts-ignore
            result.initialize(center, {radius: size*distance, rotation: token.document.rotation, angle: angel, type: "move"});
            result.compute();
            // @ts-ignore
            const activity = this._drawPolygon(Color.from(color || "#FFFFFF"), result.points);
            this.fadeOut(activity);
            this._getContainer(token.id).addChild(activity);
        }
        return result;
    }

    _getContainer(userId) {
        if (!this.activityContainer[userId]) {
            this.activityContainer[userId] = new PIXI.Container();
            // @ts-ignore
            (canvas as Canvas).primary.addChild(this.activityContainer[userId]);

        }
        return this.activityContainer[userId];
    }

    fadeOut(activity) {
        const fadeOut = () => {
            activity.alpha -= 0.01;
            if (activity.alpha <= 0) {
                activity.parent.removeChild(activity);
                // @ts-ignore
                (canvas as Canvas).app.ticker.remove(fadeOut);
            }
        }
        // @ts-ignore
        (canvas as Canvas).app.ticker.add(fadeOut);
    }

    _drawPolygon(color: number, points: number[]) {
        var g = new PIXI.Graphics();
        g.beginFill(color, 0.3);
        g.drawPolygon(
            points
        );
        g.endFill();
        return g;
    }

    private _gridSize(): number {
        const size = canvas?.grid?.size;
        if (!size) {
            throw new Error(game["i18n"].localize("beaversProximityAction.error.canvasGridError"));
        }
        return size;
    }
}