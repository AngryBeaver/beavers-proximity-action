export class SquareGrid implements Grid{


    public getProximityGrids(request: ProximityRequest):ProximityGrids{
        const proximityGrids:ProximityGrids = [];
        const gridIds: string[] = [];
        proximityGrids.push([0, this.getGrids(request.token)]);
        const direction = Math.round(request.token.rotation / 45);
        const centerGrid = this.getDirectedTokenCenterGrid(direction,request.token.center);
        for (let distance = 1; distance < request.distance; distance++) {
            const grids:string[] = [];
            const distanceSquare = Math.round(1.414 * distance);
            for (let dx = -distanceSquare; dx < distanceSquare; dx++) {
                for (let dy = -distanceSquare; dy < distanceSquare; dy++) {
                    const x = centerGrid.x + dx;
                    const y = centerGrid.y + dy;
                    const gridId = this.getGridId(x, y);
                    if (!(gridId in gridIds)) {
                        if (x > 0 && y > 0) {
                            if (request.type === "cone") {
                                if (
                                    (direction === 0 && dx >= -distance && dx <= distance && dy < 0 && dy >= -distance)
                                    || (direction === 2 && dy >= -distance && dy <= distance && dx > 0 && dx <= distance)
                                    || (direction === 4 && dx >= -distance && dx <= distance && dy > 0 && dy <= distance)
                                    || (direction === 6 && dy >= -distance && dy <= distance && dx < 0 && dx >= -distance)
                                    || (direction === 1 && dx >= 0 && dy <= 0 && dx - dy <= distanceSquare)
                                    || (direction === 3 && dx >= 0 && dy >= 0 && dx + dy <= distanceSquare)
                                    || (direction === 5 && dx <= 0 && dy >= 0 && -dx + dy <= distanceSquare)
                                    || (direction === 7 && dx <= 0 && dy <= 0 && -dx - dy <= distanceSquare)
                                ) {
                                    gridIds.push(gridId);
                                    grids.push(gridId);
                                }
                            }
                            if (request.type == "close" && dx >= -distance && dx <= distance && dy >= -distance && dy <= distance) {
                                gridIds.push(gridId);
                                grids.push(gridId);
                            }
                        }
                    }
                }
            }
            proximityGrids.push([distance,grids]);
        }
        return proximityGrids;
    }

    public getGrid(point: Point): Point {
        const x = Math.round(point.x / this.gridSize());
        const y = Math.round(point.y / this.gridSize());
        return {x: x, y: y}
    }

    public getGrids(token: Token):string[] {
        const grids: string[] = [];
        const x = Math.round(token.bounds.x / this.gridSize());
        const y = Math.round(token.bounds.y / this.gridSize());
        const width = Math.round(token.bounds.width / this.gridSize());
        const height = Math.round(token.bounds.height / this.gridSize());
        for (let w = 0; w < width; w++) {
            for (let h = 0; h < height; h++) {
                grids.push(this.getGridId(x + w, y + h));
            }
        }
        return grids;
    }

    public centerOfGridId(gridId:string):Point{
        const size = this.gridSize();
        const [gx,gy] = gridId.split(":");
        const x = Math.round(-gx*-size+size/2);
        const y = Math.round(-gy*-size+size/2);
        return {x:x,y:y}
    }

    private gridSize(): number {
        const size = canvas?.grid?.size;
        if (!size) {
            throw new Error(game["i18n"].localize("beaversProximityAction.error.canvasGridError"));
        }
        return size;
    }



    private getGridId(x: number, y: number): string {
        return x + ":" + y;
    }

    private getDirectedTokenCenterGrid(direction:number,center:Point) {
        let x = center.x;
        let y = center.y;
        if (direction in [0, 1, 7]) {
            y = y -1;
        }
        if (direction in [3, 4, 5]) {
            y = y +1;
        }
        if (direction in [1, 2, 3]) {
            x = x +1;
        }

        if (direction in [5, 6, 7]) {
            x= x-1;
        }
        return this.getGrid({x:x,y:y});
    }
}