

export class Highlighting {
    public drawPolygon(points:Point[]) {
        const startingPoint = points.shift();
        if (startingPoint && points.length > 1) {
            const polygon = ((canvas as Canvas).layers[2] as DrawingsLayer)._getNewDrawingData({
                x: startingPoint.x,
                y: startingPoint.y
            });
            points.forEach(p => {
                polygon["shape"].points.push(p.x, p.y);
            })
            const createData = Canvas.layers.drawings.layerClass.placeableClass.normalizeShape(polygon);
            const cls = getDocumentClass("Drawing");
            const scene = (canvas as Canvas).scene;
            // @ts-ignore
            const document = new cls(createData, {parent: scene});
            //cls.create(createData,{parent:scene}); not preview !
            const drawing = new Canvas.layers.drawings.layerClass.placeableClass(document);
            const drawingsLayer = (canvas as Canvas).layers.find(l => l.name === "DrawingsLayer");
            if (drawingsLayer) {
                drawingsLayer["preview"].addChild(drawing);
            }
        }
    }
}

