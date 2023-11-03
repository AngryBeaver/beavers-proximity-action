import {bpa} from "../types.js";
import {ConeShapedSquareGrid} from "./ConeShapedSquareGrid.js";
import {CloseSquareGrid} from "./CloseSquareGrid.js";

export class ProximitySquareGrid implements bpa.Grid {


    public getProximityGrids(request: bpa.ProximityRequest): Point[] {
        if (!canvas?.grid?.grid) {
            throw Error("no grid found");
        }
        //!"§(?)=?§% who the fuck defines a gridArray with y=0 and x=1 and not the otherway around !!!!
        const gridArray = canvas.grid.grid.getGridPositionFromPixels(request.token.center.x, request.token.center.y);
        const grid = {x: gridArray[1], y: gridArray[0]};
        // @ts-ignore
        const rotation = request.token.document.rotation;
        if (request.type === "cone") {
            return new ConeShapedSquareGrid(request.distance, grid, rotation).getGrids();
        } else {
            return new CloseSquareGrid(request.distance, grid, rotation).getGrids();
        }
    }

    public getGrid(point: Point): Point {
        const x = Math.round(point.x / this.gridSize());
        const y = Math.round(point.y / this.gridSize());
        return {x: x, y: y}
    }

    public getGrids(token: Token): string[] {
        const grids: string[] = [];
        const center = this.getGrid(token.center);
        const width = Math.round(token.bounds.width / this.gridSize());
        const height = Math.round(token.bounds.height / this.gridSize());
        const leftUpCenter = {x: Math.round(center.x - width), y: Math.round(center.y - height)};
        for (let w = 1; w <= width; w++) {
            for (let h = 1; h <= height; h++) {
                grids.push(this.getGridId({x:leftUpCenter.x + w, y:leftUpCenter.y + h}));
            }
        }
        return grids;
    }

    public centerOfGridId(gridId: string): Point {
        const size = this.gridSize();
        const [gx, gy] = gridId.split(":");
        const x = Math.round(-gx * -size + size / 2);
        const y = Math.round(-gy * -size + size / 2);
        return {x: x, y: y}
    }

    private gridSize(): number {
        const size = canvas?.grid?.size;
        if (!size) {
            throw new Error(game["i18n"].localize("beaversProximityAction.error.canvasGridError"));
        }
        return size;
    }


    public getGridId(point:Point): string {
        return point.x + ":" + point.y;
    }

    private getDirectedTokenCenterGrid(direction: number, center: Point) {
        let x = center.x;
        let y = center.y;
        if (direction in [0, 1, 7]) {
            y = y - 1;
        }
        if (direction in [3, 4, 5]) {
            y = y + 1;
        }
        if (direction in [1, 2, 3]) {
            x = x + 1;
        }

        if (direction in [5, 6, 7]) {
            x = x - 1;
        }
        return this.getGrid({x: x, y: y});
    }

}