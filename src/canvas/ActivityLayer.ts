export class ActivityLayer {

    activityContainer = {};

    drawActivity(points: number[], id:string, color?:string): void {
        // @ts-ignore
        const activity = this._drawPolygon(Color.from(color || "#FFFFFF"), points);
        this._getContainer(id).removeChildren();
        this._getContainer(id).addChild(activity);
        window.setTimeout(() => this.fadeOut(activity), 1000);
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
            if (activity.parent) {
                activity.alpha -= 0.01;
                if (activity.alpha <= 0) {
                    activity.parent.removeChild(activity);
                }
            } else {
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

}