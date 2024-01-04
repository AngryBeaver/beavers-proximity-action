function gridSize(): number {
    const size = canvas?.grid?.size;
    if (!size) {
        throw new Error(game["i18n"].localize("beaversProximityAction.error.canvasGridError"));
    }
    return size;
}

export class ClockwiseSweepShape extends ClockwiseSweepPolygon {
    walls: Set<Wall> = new Set();
    resultWalls: Wall[] = []
    polygonVertices: PolygonVertex[] = [];

    static from(token: Token, distance, type) {
        let result: ClockwiseSweepShape | null = null;
        const center = token.center;
        result = new ClockwiseSweepShape();
        const angel = type === "cone" ? 90 : 360;
        const size = gridSize();
        result.initialize(center, {
            radius: size * distance,
            // @ts-ignore
            rotation: token.document.rotation,
            angle: angel,
            // @ts-ignore
            type: "move"
        });
        result.compute();
        return result;
    }

    /** @inheritdoc */
    _compute() {
        this.polygonVertices = [];
        this.walls = new Set();
        super._compute();
        this.filterWalls();
    }


    filterWalls() {
        this.resultWalls = [];
        this.walls.forEach(w => {
            let aFound, bFound = false;
            this.polygonVertices.forEach(p => {
                if (p.x === w.A.x && p.y === w.A.y) {
                    aFound = true;
                }
                if (p.x === w.B.x && p.y === w.B.y) {
                    bFound = true;
                }
            })
            if (aFound && bFound) {
                if (!w.id.startsWith("BoundOuter")) {
                    this.resultWalls.push(w);
                }
            }
        });
    }

    captureWalls(pt: PolygonVertex) {
        this.addPoint(pt);
        this.polygonVertices.push(pt);
        pt.cwEdges.forEach(edge => {
            if (edge.wall) {
                this.walls.add(edge.wall);
            }
        });
        pt.ccwEdges.forEach(edge => {
            if (edge.wall) {
                this.walls.add(edge.wall);
            }
        });
    }

    _testWallInclusion(wall, bounds) {
        // @ts-ignore
        let result = super._testWallInclusion(wall, bounds);
        if (wall.isOpen) {
            this.walls.add(wall);
        }
        return result;
    }

    /**
     * Determine the result for the sweep at a given vertex
     * @param {PolygonVertex} vertex      The target vertex
     * @param {EdgeSet} activeEdges       The set of active edges
     * @param {boolean} hasCollinear      Are there collinear vertices behind the target vertex?
     * @inheritdoc
     */
    _determineSweepResult(vertex, activeEdges, hasCollinear = false) {
        // Determine whether the target vertex is behind some other active edge
        const {isBehind, wasLimited} = this._isVertexBehindActiveEdges(vertex, activeEdges);
        // Case 1 - Some vertices can be ignored because they are behind other active edges
        if (isBehind) return;

        // Construct the CollisionResult object
        const result = new CollisionResult({
            target: vertex,
            cwEdges: vertex.cwEdges,
            ccwEdges: vertex.ccwEdges,
            isLimited: vertex.isLimited,
            isBehind,
            wasLimited
        });

        // Case 2 - No counter-clockwise edge, so begin a new edge
        // Note: activeEdges always contain the vertex edge, so never empty
        const nccw = vertex.ccwEdges.size;
        if (!nccw) {
            this._switchEdge(result, activeEdges);
            result.collisions.forEach(pt => {
                this.captureWalls(pt);
            });
            return;
        }

        // Case 3 - Limited edges in both directions
        // We can only guarantee this case if we don't have collinear endpoints
        const ccwLimited = !result.wasLimited && vertex.isLimitingCCW;
        const cwLimited = !result.wasLimited && vertex.isLimitingCW;
        if (!hasCollinear && cwLimited && ccwLimited) return;

        // Case 4 - Non-limited edges in both directions
        if (!ccwLimited && !cwLimited && nccw && vertex.cwEdges.size) {
            result.collisions.push(result.target);
            this.captureWalls(result.target);
            return;
        }

        // Case 5 - Otherwise switching edges or edge types
        this._switchEdge(result, activeEdges);
        result.collisions.forEach(pt => {
            this.captureWalls(pt);
        });
    }

}