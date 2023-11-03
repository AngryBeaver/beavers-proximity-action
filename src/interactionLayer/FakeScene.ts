import {BaseInteraction} from "./BaseInteraction.js";
// @ts-ignore
export class FakeScene extends foundry.abstract.Document {

    static metadata = Object.freeze(mergeObject(super.metadata, {
        name: "FakeScene",
        collection: "scenes",
        label: "DOCUMENT.FakeScene",
        labelPlural: "DOCUMENT.FakeScene",
        embedded:{
            "BaseInteraction":"interactions"
        }
    }, {inplace: false}));

    static defineSchema(){


        return {
            // @ts-ignore
            _id: new foundry.data.fields.DocumentIdField(),
            // @ts-ignore
            interactions: new foundry.data.fields.EmbeddedCollectionField(BaseInteraction),
            // @ts-ignore
            flags: new foundry.data.fields.ObjectField()
        }
    }
}