
import {NAMESPACE} from "../Settings.js";
import {WallDetection} from "./WallDetection.js";
import {BaseInteraction} from "./BaseInteraction.js";
import {FakeScene} from "./FakeScene.js";
// @ts-ignore
export class InteractionLayer extends PlaceablesLayer {
    //TODO implement

    static get layerOptions() {
        return foundry.utils.mergeObject(super.layerOptions, {
            name: "interaction",
            canDragCreate: true,
            controllableObjects: true,
            rotatableObjects: true,
            elevationSorting: true,
            zIndex: 20
        });
    }

    /** @inheritdoc */
    static documentName = "Interaction";

    /**
     * The named game setting which persists default drawing configuration for the User
     * @type {string}
     */
    static DEFAULT_CONFIG_SETTING = "defaultInteractionConfig";

    /**
     * Obtain an iterable of objects which should be added to this PlaceableLayer
     * @returns {Document[]}
     */
    getDocuments() {
        // @ts-ignore
        const fakeScene = new FakeScene();
        // @ts-ignore
        const collections =  new foundry.abstract.EmbeddedCollection(Scene,[],WallDetection);
        var d = new BaseInteraction({points:[0,0,100,100]},{parent:fakeScene});
        var x = new WallDetection(d);

        // @ts-ignore
        collections.set(x.id,new WallDetection(d),false);
        return (canvas as Canvas).scene?.getFlag(NAMESPACE,"interaction-layer") || [];
    }
}