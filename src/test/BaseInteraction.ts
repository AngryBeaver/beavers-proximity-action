
// @ts-ignore
export class BaseInteraction extends foundry.abstract.Document {

    constructor(data={}, options={}) {
        super(data,options);
    }

    // @ts-ignore
    static metadata = Object.freeze(mergeObject(super.metadata, {
        name: "BaseInteraction",
        collection: "interactions",
        label: "DOCUMENT.Interaction",
        labelPlural: "DOCUMENT.Interactions",
        permissions: {
            update: this.#canUpdate
        }
    }, {inplace: false}));

    static defineSchema(){

        return {
            // @ts-ignore
            _id: new foundry.data.fields.DocumentIdField(),
            // @ts-ignore
            points:  new foundry.data.fields.ArrayField(new foundry.data.fields.NumberField({required: true, integer: true, nullable: false}), {
                validate: c => (c.length === 4),
                validationError: "must be a length-4 array of integer coordinates"}),
            // @ts-ignore
            flags: new foundry.data.fields.ObjectField()
        }
    }

    /**
     * Is a user able to update an existing Interaction?
     * @private
     */
    static #canUpdate(user, doc, data) {
        return true; // no permission
    }
}