(function (exports) {
    'use strict';

    /**
     * A representation of a color in hexadecimal format.
     * This class provides methods for transformations and manipulations of colors.
     */
    class Color extends Number {

        /**
         * A CSS-compatible color string.
         * An alias for Color#toString.
         * @type {string}
         */
        get css() {
            return this.toString(16);
        }

        /* ------------------------------------------ */

        /**
         * The color represented as an RGB array.
         * @type {[number, number, number]}
         */
        get rgb() {
            return [...this];
        }

        /* ------------------------------------------ */

        /**
         * The numeric value of the red channel between [0, 1].
         * @type {number}
         */
        get r() {
            return ((this >> 16) & 0xFF) / 255;
        }

        /* ------------------------------------------ */

        /**
         * The numeric value of the green channel between [0, 1].
         * @type {number}
         */
        get g() {
            return ((this >> 8) & 0xFF) / 255;
        }

        /* ------------------------------------------ */

        /**
         * The numeric value of the blue channel between [0, 1].
         * @type {number}
         */
        get b() {
            return (this & 0xFF) / 255;
        }

        /* ------------------------------------------ */

        /**
         * The maximum value of all channels.
         * @type {number}
         */
        get maximum() {
            return Math.max(...this);
        }

        /* ------------------------------------------ */

        /**
         * The minimum value of all channels.
         * @type {number}
         */
        get minimum() {
            return Math.min(...this);
        }

        /* ------------------------------------------ */

        /**
         * Get the value of this color in little endian format.
         * @type {number}
         */
        get littleEndian() {
            return ((this >> 16) & 0xFF) + (this & 0x00FF00) + ((this & 0xFF) << 16);
        }

        /* ------------------------------------------ */

        /**
         * The color represented as an HSV array.
         * Conversion formula adapted from http://en.wikipedia.org/wiki/HSV_color_space.
         * Assumes r, g, and b are contained in the set [0, 1] and returns h, s, and v in the set [0, 1].
         * @type {[number, number, number]}
         */
        get hsv() {
            const [r, g, b] = this.rgb;
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const d = max - min;

            let h;
            const s = max === 0 ? 0 : d / max;
            const v = max;

            // Achromatic colors
            if (max === min) return [0, s, v];

            // Normal colors
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
            return [h, s, v];
        }

        /* ------------------------------------------ */
        /*  Color Manipulation Methods                */
        /* ------------------------------------------ */

        /** @override */
        toString(radix) {
            return `#${super.toString(16).padStart(6, "0")}`;
        }

        /* ------------------------------------------ */

        /**
         * Test whether this color equals some other color
         * @param {Color|number} other  Some other color or hex number
         * @returns {boolean}           Are the colors equal?
         */
        equals(other) {
            return this.valueOf() === other.valueOf();
        }

        /* ------------------------------------------ */

        /**
         * Get a CSS-compatible RGBA color string.
         * @param {number} alpha      The desired alpha in the range [0, 1]
         * @returns {string}          A CSS-compatible RGBA string
         */
        toRGBA(alpha) {
            const rgba = [(this >> 16) & 0xFF, (this >> 8) & 0xFF, this & 0xFF, alpha];
            return `rgba(${rgba.join(", ")})`;
        }

        /* ------------------------------------------ */

        /**
         * Mix this Color with some other Color using a provided interpolation weight.
         * @param {Color} other       Some other Color to mix with
         * @param {number} weight     The mixing weight placed on this color where weight is placed on the other color
         * @returns {Color}           The resulting mixed Color
         */
        mix(other, weight) {
            const o = other.rgb;
            const mixed = this.rgb.map((c, i) => Math.clamped((weight * o[i]) + ((1 - weight) * c), 0, 1));
            return Color.fromRGB(mixed);
        }

        /* ------------------------------------------ */

        /**
         * Multiply this Color by another Color or a static scalar.
         * @param {Color|number} other  Some other Color or a static scalar.
         * @returns {Color}             The resulting Color.
         */
        multiply(other) {
            const o = other instanceof Color ? other.rgb : [other, other, other];
            const mixed = this.rgb.map((c, i) => Math.clamped(c * o[i], 0, 1));
            return Color.fromRGB(mixed);
        }

        /* ------------------------------------------ */

        /**
         * Add this Color by another Color or a static scalar.
         * @param {Color|number} other  Some other Color or a static scalar.
         * @returns {Color}             The resulting Color.
         */
        add(other) {
            const o = other instanceof Color ? other.rgb : [other, other, other];
            const mixed = this.rgb.map((c, i) => Math.clamped(c + o[i], 0, 1));
            return Color.fromRGB(mixed);
        }

        /* ------------------------------------------ */

        /**
         * Subtract this Color by another Color or a static scalar.
         * @param {Color|number} other  Some other Color or a static scalar.
         * @returns {Color}             The resulting Color.
         */
        subtract(other) {
            const o = other instanceof Color ? other.rgb : [other, other, other];
            const mixed = this.rgb.map((c, i) => Math.clamped(c - o[i], 0, 1));
            return Color.fromRGB(mixed);
        }

        /* ------------------------------------------ */

        /**
         * Max this color by another Color or a static scalar.
         * @param {Color|number} other  Some other Color or a static scalar.
         * @returns {Color}             The resulting Color.
         */
        maximize(other) {
            const o = other instanceof Color ? other.rgb : [other, other, other];
            const mixed = this.rgb.map((c, i) => Math.clamped(Math.max(c, o[i]), 0, 1));
            return Color.fromRGB(mixed);
        }

        /* ------------------------------------------ */

        /**
         * Min this color by another Color or a static scalar.
         * @param {Color|number} other  Some other Color or a static scalar.
         * @returns {Color}             The resulting Color.
         */
        minimize(other) {
            const o = other instanceof Color ? other.rgb : [other, other, other];
            const mixed = this.rgb.map((c, i) => Math.clamped(Math.min(c, o[i]), 0, 1));
            return Color.fromRGB(mixed);
        }

        /* ------------------------------------------ */
        /*  Iterator                                  */
        /* ------------------------------------------ */

        /**
         * Iterating over a Color is equivalent to iterating over its [r,g,b] color channels.
         * @returns {Generator<number>}
         */
        *[Symbol.iterator]() {
            yield this.r;
            yield this.g;
            yield this.b;
        }

        /* ------------------------------------------ */
        /*  Factory Methods                           */
        /* ------------------------------------------ */

        /**
         * Create a Color instance from an RGB array.
         * @param {null|string|number|number[]} color A color input
         * @returns {Color|NaN}                       The hex color instance or NaN
         */
        static from(color) {
            if ( (color === null) || (color === undefined) ) return NaN;
            if ( typeof color === "string" ) return this.fromString(color);
            if ( typeof color === "number" ) return new this(color);
            if ( (color instanceof Array) && (color.length === 3) ) return this.fromRGB(color);
            if ( color instanceof Color ) return color;
            // For all other cases, we keep the Number logic.
            return Number(color);
        }

        /* ------------------------------------------ */

        /**
         * Create a Color instance from a color string which either includes or does not include a leading #.
         * @param {string} color                      A color string
         * @returns {Color}                           The hex color instance
         */
        static fromString(color) {
            return new this(parseInt(color.startsWith("#") ? color.substring(1) : color, 16));
        }

        /* ------------------------------------------ */

        /**
         * Create a Color instance from an RGB array.
         * @param {[number, number, number]} rgb      An RGB tuple
         * @returns {Color}                           The hex color instance
         */
        static fromRGB(rgb) {
            return new this(((rgb[0] * 255) << 16) + ((rgb[1] * 255) << 8) + (rgb[2] * 255 | 0));
        }

        /* ------------------------------------------ */

        /**
         * Create a Color instance from an HSV array.
         * Conversion formula adapted from http://en.wikipedia.org/wiki/HSV_color_space.
         * Assumes h, s, and v are contained in the set [0, 1].
         * @param {[number, number, number]} hsv      An HSV tuple
         * @returns {Color}                           The hex color instance
         */
        static fromHSV(hsv) {
            const [h, s, v] = hsv;
            const i = Math.floor(h * 6);
            const f = (h * 6) - i;
            const p = v * (1 - s);
            const q = v * (1 - f * s);
            const t = v * (1 - (1 - f) * s);
            let rgb;
            switch (i % 6) {
                case 0: rgb = [v, t, p]; break;
                case 1: rgb = [q, v, p]; break;
                case 2: rgb = [p, v, t]; break;
                case 3: rgb = [p, q, v]; break;
                case 4: rgb = [t, p, v]; break;
                case 5: rgb = [v, p, q]; break;
            }
            return this.fromRGB(rgb);
        }
    }

    /** @module constants */

    /**
     * The shortened software name
     * @type {string}
     */
    const vtt$1 = "Foundry VTT";

    /**
     * The full software name
     * @type {string}
     */
    const VTT = "Foundry Virtual Tabletop";

    /**
     * The software website URL
     * @type {string}
     */
    const WEBSITE_URL = "https://foundryvtt.com";

    /**
     * The serverless API URL
     */
    const WEBSITE_API_URL = "https://api.foundryvtt.com";

    /**
     * An ASCII greeting displayed to the client
     * @type {string}
     */
    const ASCII = `_______________________________________________________________
 _____ ___  _   _ _   _ ____  ______   __ __     _______ _____ 
|  ___/ _ \\| | | | \\ | |  _ \\|  _ \\ \\ / / \\ \\   / |_   _|_   _|
| |_ | | | | | | |  \\| | | | | |_) \\ V /   \\ \\ / /  | |   | |  
|  _|| |_| | |_| | |\\  | |_| |  _ < | |     \\ V /   | |   | |  
|_|   \\___/ \\___/|_| \\_|____/|_| \\_\\|_|      \\_/    |_|   |_|  
===============================================================`;

    /**
     * Define the allowed ActiveEffect application modes.
     * @remarks
     * Other arbitrary mode numbers can be used by systems and modules to identify special behaviors and are ignored
     * @enum {number}
     */
    const ACTIVE_EFFECT_MODES = {
        /**
         * Used to denote that the handling of the effect is programmatically provided by a system or module.
         */
        CUSTOM: 0,

        /**
         * Multiplies a numeric base value by the numeric effect value
         * @example
         * 2 (base value) * 3 (effect value) = 6 (derived value)
         */
        MULTIPLY: 1,

        /**
         * Adds a numeric base value to a numeric effect value, or concatenates strings
         * @example
         * 2 (base value) + 3 (effect value) = 5 (derived value)
         * @example
         * "Hello" (base value) + " World" (effect value) = "Hello World"
         */
        ADD: 2,

        /**
         * Keeps the lower value of the base value and the effect value
         * @example
         * 2 (base value), 0 (effect value) = 0 (derived value)
         * @example
         * 2 (base value), 3 (effect value) = 2 (derived value)
         */
        DOWNGRADE: 3,

        /**
         * Keeps the greater value of the base value and the effect value
         * @example
         * 2 (base value), 4 (effect value) = 4 (derived value)
         * @example
         * 2 (base value), 1 (effect value) = 2 (derived value)
         */
        UPGRADE: 4,

        /**
         * Directly replaces the base value with the effect value
         * @example
         * 2 (base value), 4 (effect value) = 4 (derived value)
         */
        OVERRIDE: 5
    };

    /**
     * Define the string name used for the base document type when specific sub-types are not defined by the system
     * @type {string}
     */
    const BASE_DOCUMENT_TYPE = "base";

    /**
     * Define the methods by which a Card can be drawn from a Cards stack
     * @enum {number}
     */
    const CARD_DRAW_MODES = {
        /**
         * Draw the first card from the stack
         * Synonymous with {@link CARD_DRAW_MODES.TOP}
         */
        FIRST: 0,

        /**
         * Draw the top card from the stack
         * Synonymous with {@link CARD_DRAW_MODES.FIRST}
         */
        TOP: 0,

        /**
         * Draw the last card from the stack
         * Synonymous with {@link CARD_DRAW_MODES.BOTTOM}
         */
        LAST: 1,

        /**
         * Draw the bottom card from the stack
         * Synonymous with {@link CARD_DRAW_MODES.LAST}
         */
        BOTTOM: 1,

        /**
         * Draw a random card from the stack
         */
        RANDOM: 2
    };

    /**
     * An enumeration of canvas performance modes.
     * @enum {number}
     */
    const CANVAS_PERFORMANCE_MODES = {
        LOW: 0,
        MED: 1,
        HIGH: 2,
        MAX: 3
    };

    /**
     * Valid Chat Message types
     * @enum {number}
     */
    const CHAT_MESSAGE_TYPES = {
        /**
         * An uncategorized chat message
         */
        OTHER: 0,

        /**
         * The message is spoken out of character (OOC).
         * OOC messages will be outlined by the player's color to make them more easily recognizable.
         */
        OOC: 1,

        /**
         * The message is spoken by an associated character.
         */
        IC: 2,

        /**
         * The message is an emote performed by the selected character.
         * Entering "/emote waves his hand." while controlling a character named Simon will send the message, "Simon waves his hand."
         */
        EMOTE: 3,

        /**
         * A message whispered to the target.
         * If the user sending the message does not have the "Private Messages" permission, Gamemasters will be able to see the content of the message even if they were not a recipient.
         * If the whisper's target is a character, the whisper will be sent to whoever controls the token.
         */
        WHISPER: 4,

        /**
         * A message that is a dice roll.
         */
        ROLL: 5
    };

    /**
     * Define the set of languages which have built-in support in the core software
     * @type {string[]}
     */
    const CORE_SUPPORTED_LANGUAGES = ["en"];

    /**
     * Configure the severity of compatibility warnings.
     * @enum {number}
     */
    const COMPATIBILITY_MODES = {
        /**
         * Nothing will be logged
         */
        SILENT: 0,

        /**
         * A message will be logged at the "warn" level
         */
        WARNING: 1,

        /**
         * A message will be logged at the "error" level
         */
        ERROR: 2,

        /**
         * An Error will be thrown
         */
        FAILURE: 3
    };

    /**
     * The default artwork used for Token images if none is provided
     * @type {string}
     */
    const DEFAULT_TOKEN = 'icons/svg/mystery-man.svg';

    /**
     * Define the allowed Document class types.
     * @type {string[]}
     */
    const DOCUMENT_TYPES = [
        "Actor",
        "Cards",
        "ChatMessage",
        "Combat",
        "Item",
        "Folder",
        "JournalEntry",
        "Macro",
        "Playlist",
        "RollTable",
        "Scene",
        "User",
    ];

    /**
     * The allowed Document types which may exist within a Compendium pack.
     * @type {string[]}
     */
    const COMPENDIUM_DOCUMENT_TYPES = DOCUMENT_TYPES.filter(t => {
        const excluded = ["ChatMessage", "Combat", "Folder", "User"];
        return !excluded.includes(t);
    }).concat(["Adventure"]);

    /**
     * Define the allowed ownership levels for a Document.
     * Each level is assigned a value in ascending order.
     * Higher levels grant more permissions.
     * @enum {number}
     * @see https://foundryvtt.com/article/users/
     */
    const DOCUMENT_OWNERSHIP_LEVELS = {
        /**
         * The User inherits permissions from the parent Folder.
         */
        INHERIT: -1,

        /**
         * Restricts the associated Document so that it may not be seen by this User.
         */
        NONE: 0,

        /**
         * Allows the User to interact with the Document in basic ways, allowing them to see it in sidebars and see only limited aspects of its contents. The limits of this interaction are defined by the game system being used.
         */
        LIMITED: 1,

        /**
         * Allows the User to view this Document as if they were owner, but prevents them from making any changes to it.
         */
        OBSERVER: 2,

        /**
         * Allows the User to view and make changes to the Document as its owner. Owned documents cannot be deleted by anyone other than a gamemaster level User.
         */
        OWNER: 3
    };
    Object.freeze(DOCUMENT_OWNERSHIP_LEVELS);

    /**
     * Meta ownership levels that are used in the UI but never stored.
     * @enum {number}
     */
    const DOCUMENT_META_OWNERSHIP_LEVELS = {
        DEFAULT: -20,
        NOCHANGE: -10
    };
    Object.freeze(DOCUMENT_META_OWNERSHIP_LEVELS);

    /**
     * @deprecated since v10
     * @ignore
     * @see CONST.DOCUMENT_OWNERSHIP_LEVELS
     */
    const DOCUMENT_PERMISSION_LEVELS = DOCUMENT_OWNERSHIP_LEVELS;

    /**
     * Define the allowed Document types which may be dynamically linked in chat
     * @type {string[]}
     */
    const DOCUMENT_LINK_TYPES = ["Actor", "Cards", "Item", "Scene", "JournalEntry", "Macro", "RollTable", "PlaylistSound"];

    /**
     * The supported dice roll visibility modes
     * @enum {string}
     * @see https://foundryvtt.com/article/dice/
     */
    const DICE_ROLL_MODES = {
        /**
         * This roll is visible to all players.
         */
        PUBLIC: "publicroll",

        /**
         * Rolls of this type are only visible to the player that rolled and any Game Master users.
         */
        PRIVATE: "gmroll",

        /**
         * A private dice roll only visible to Game Master users. The rolling player will not see the result of their own roll.
         */
        BLIND: "blindroll",

        /**
         * A private dice roll which is only visible to the user who rolled it.
         */
        SELF: "selfroll"
    };

    /**
     * The allowed fill types which a Drawing object may display
     * @enum {number}
     * @see https://foundryvtt.com/article/drawings/
     */
    const DRAWING_FILL_TYPES = {
        /**
         * The drawing is not filled
         */
        NONE: 0,

        /**
         * The drawing is filled with a solid color
         */
        SOLID: 1,

        /**
         * The drawing is filled with a tiled image pattern
         */
        PATTERN: 2
    };

    /**
     * Define the allowed Document types which Folders may contain
     * @type {string[]}
     */
    const FOLDER_DOCUMENT_TYPES = ["Actor", "Item", "Scene", "JournalEntry", "Playlist", "RollTable", "Cards", "Macro"];

    /**
     * The maximum allowed level of depth for Folder nesting
     * @type {number}
     */
    const FOLDER_MAX_DEPTH = 3;

    /**
     * A list of allowed game URL names
     * @type {string[]}
     */
    const GAME_VIEWS = ["game", "stream"];

    /**
     * The minimum allowed grid size which is supported by the software
     * @type {number}
     */
    const GRID_MIN_SIZE = 50;

    /**
     * The allowed Grid types which are supported by the software
     * @enum {number}
     * @see https://foundryvtt.com/article/scenes/
     */
    const GRID_TYPES = {
        /**
         * No fixed grid is used on this Scene allowing free-form point-to-point measurement without grid lines.
         */
        GRIDLESS: 0,

        /**
         * A square grid is used with width and height of each grid space equal to the chosen grid size.
         */
        SQUARE: 1,

        /**
         * A column-wise hexagon grid (flat-topped) where odd-numbered rows are offset.
         */
        HEXODDR: 2,

        /**
         * A column-wise hexagon grid (flat-topped) where even-numbered rows are offset.
         */
        HEXEVENR: 3,

        /**
         * A row-wise hexagon grid (pointy-topped) where odd-numbered columns are offset.
         */
        HEXODDQ: 4,

        /**
         * A row-wise hexagon grid (pointy-topped) where even-numbered columns are offset.
         */
        HEXEVENQ: 5
    };

    /**
     * A list of supported setup URL names
     * @type {string[]}
     */
    const SETUP_VIEWS = ["license", "setup", "players", "join", "auth"];

    /**
     * An Array of valid MacroAction scope values
     * @type {string[]}
     */
    const MACRO_SCOPES = ["global", "actors", "actor"];

    /**
     * An enumeration of valid Macro types
     * @enum {string}
     * @see https://foundryvtt.com/article/macros/
     */
    const MACRO_TYPES = {
        /**
         * Complex and powerful macros which leverage the FVTT API through plain JavaScript to perform functions as simple or as advanced as you can imagine.
         */
        SCRIPT: "script",

        /**
         * Simple and easy to use, chat macros post pre-defined chat messages to the chat log when executed. All users can execute chat macros by default.
         */
        CHAT: "chat"
    };

    /**
     * The allowed playback modes for an audio Playlist
     * @enum {number}
     * @see https://foundryvtt.com/article/playlists/
     */
    const PLAYLIST_MODES = {
        /**
         * The playlist does not play on its own, only individual Sound tracks played as a soundboard.
         */
        DISABLED: -1,

        /**
         * The playlist plays sounds one at a time in sequence.
         */
        SEQUENTIAL: 0,

        /**
         * The playlist plays sounds one at a time in randomized order.
         */
        SHUFFLE: 1,

        /**
         * The playlist plays all contained sounds at the same time.
         */
        SIMULTANEOUS: 2
    };

    /**
     * The available sort modes for an audio Playlist.
     * @enum {string}
     * @see https://foundryvtt.com/article/playlists/
     */
    const PLAYLIST_SORT_MODES = {
        /**
         * Sort sounds alphabetically.
         * @defaultValue
         */
        ALPHABETICAL: "a",

        /**
         * Sort sounds by manual drag-and-drop.
         */
        MANUAL: "m"
    };

    /**
     * The allowed package types
     * @type {string[]}
     */
    const PACKAGE_TYPES = ["world", "system", "module"];

    /**
     * Encode the reasons why a package may be available or unavailable for use
     * @enum {number}
     */
    const PACKAGE_AVAILABILITY_CODES = {
        /**
         * Package availability could not be determined
         */
        UNKNOWN: -1,

        /**
         * Package is available for use
         */
        AVAILABLE: 0,

        /**
         * Package requires an update to a newer Package version
         */
        REQUIRES_UPDATE: 1,

        /**
         * The System that the Package relies on is not available
         */
        REQUIRES_SYSTEM: 2,

        /**
         * A dependency of the Package is not available
         */
        REQUIRES_DEPENDENCY: 3,

        /**
         * The Package is compatible with an older version of Foundry than the currently installed version
         */
        REQUIRES_CORE_DOWNGRADE: 4,

        /**
         * The Package is compatible with a newer version of Foundry than the currently installed version, and that version is Stable
         */
        REQUIRES_CORE_UPGRADE_STABLE: 5,

        /**
         * The Package is compatible with a newer version of Foundry than the currently installed version, and that version is not yet Stable
         */
        REQUIRES_CORE_UPGRADE_UNSTABLE: 6
    };

    /**
     * A safe password string which can be displayed
     * @type {string}
     */
    const PASSWORD_SAFE_STRING = "•".repeat(16);

    /**
     * The allowed software update channels
     * @enum {string}
     */
    const SOFTWARE_UPDATE_CHANNELS = {
        /**
         * The Stable release channel
         */
        stable: "SETUP.UpdateStable",

        /**
         * The User Testing release channel
         */
        testing: "SETUP.UpdateTesting",

        /**
         * The Development release channel
         */
        development: "SETUP.UpdateDevelopment",

        /**
         * The Prototype release channel
         */
        prototype: "SETUP.UpdatePrototype"
    };

    /**
     * The default sorting density for manually ordering child objects within a parent
     * @type {number}
     */
    const SORT_INTEGER_DENSITY = 100000;

    /**
     * The allowed types of a TableResult document
     * @enum {number}
     * @see https://foundryvtt.com/article/roll-tables/
     */
    const TABLE_RESULT_TYPES = {
        /**
         *  Plain text or HTML scripted entries which will be output to Chat.
         */
        TEXT: 0,

        /**
         * An in-World Document reference which will be linked to in the chat message.
         */
        DOCUMENT: 1,

        /**
         * A Compendium Pack reference which will be linked to in the chat message.
         */
        COMPENDIUM: 2
    };

    /**
     * The allowed formats of a Journal Entry Page.
     * @enum {number}
     * @see https://foundryvtt.com/article/journal/
     */
    const JOURNAL_ENTRY_PAGE_FORMATS = {
        /**
         * The page is formatted as HTML.
         */
        HTML: 1,

        /**
         * The page is formatted as Markdown.
         */
        MARKDOWN: 2,
    };

    /**
     * Define the valid anchor locations for a Tooltip displayed on a Placeable Object
     * @enum {number}
     * @see TooltipManager
     */
    const TEXT_ANCHOR_POINTS = {
        /**
         * Anchor the tooltip to the center of the element.
         */
        CENTER: 0,

        /**
         * Anchor the tooltip to the bottom of the element.
         */
        BOTTOM: 1,

        /**
         * Anchor the tooltip to the top of the element.
         */
        TOP: 2,

        /**
         * Anchor the tooltip to the left of the element.
         */
        LEFT: 3,

        /**
         * Anchor the tooltip to the right of the element.
         */
        RIGHT: 4
    };

    /**
     * Define the valid occlusion modes which an overhead tile can use
     * @enum {number}
     * @see https://foundryvtt.com/article/tiles/
     */
    const TILE_OCCLUSION_MODES = {
        /**
         * Turns off occlusion, making the tile never fade while tokens are under it.
         */
        NONE: 0,

        /**
         * Causes the whole tile to fade when an actor token moves under it.
         * @defaultValue
         */
        FADE: 1,

        // ROOF: 2,  This mode is no longer supported so we don't use 2 for any other mode

        /**
         * Causes the tile to reveal the background in the vicinity of an actor token under it. The radius is determined by the token's size.
         */
        RADIAL: 3,

        /**
         * Causes the tile to be partially revealed based on the vision of the actor, which does not need to be under the tile to see what's beneath it.
         *
         * @remarks
         * This is useful for rooves on buildings where players could see through a window or door, viewing only a portion of what is obscured by the roof itself.
         */
        VISION: 4
    };

    /**
     * Describe the various thresholds of token control upon which to show certain pieces of information
     * @enum {number}
     * @see https://foundryvtt.com/article/tokens/
     */
    const TOKEN_DISPLAY_MODES = {
        /**
         * No information is displayed.
         */
        NONE: 0,

        /**
         * Displayed when the token is controlled.
         */
        CONTROL: 10,

        /**
         * Displayed when hovered by a GM or a user who owns the actor.
         */
        OWNER_HOVER: 20,

        /**
         * Displayed when hovered by any user.
         */
        HOVER: 30,

        /**
         * Always displayed for a GM or for a user who owns the actor.
         */
        OWNER: 40,

        /**
         * Always displayed for everyone.
         */
        ALWAYS: 50
    };

    /**
     * The allowed Token disposition types
     * @enum {number}
     * @see https://foundryvtt.com/article/tokens/
     */
    const TOKEN_DISPOSITIONS = {
        /**
         * Displayed as an enemy with a red border.
         */
        HOSTILE: -1,

        /**
         * Displayed as neutral with a yellow border.
         */
        NEUTRAL: 0,

        /**
         * Displayed as an ally with a cyan border.
         */
        FRIENDLY: 1
    };

    /**
     * Define the allowed User permission levels.
     * Each level is assigned a value in ascending order. Higher levels grant more permissions.
     * @enum {number}
     * @see https://foundryvtt.com/article/users/
     */
    const USER_ROLES = {
        /**
         * The User is blocked from taking actions in Foundry Virtual Tabletop.
         * You can use this role to temporarily or permanently ban a user from joining the game.
         */
        NONE: 0,

        /**
         * The User is able to join the game with permissions available to a standard player.
         * They cannot take some more advanced actions which require Trusted permissions, but they have the basic functionalities needed to operate in the virtual tabletop.
         */
        PLAYER: 1,

        /**
         * Similar to the Player role, except a Trusted User has the ability to perform some more advanced actions like create drawings, measured templates, or even to (optionally) upload media files to the server.
         */
        TRUSTED: 2,

        /**
         * A special User who has many of the same in-game controls as a Game Master User, but does not have the ability to perform administrative actions like changing User roles or modifying World-level settings.
         */
        ASSISTANT: 3,

        /**
         *  A special User who has administrative control over this specific World.
         *  Game Masters behave quite differently than Players in that they have the ability to see all Documents and Objects within the world as well as the capability to configure World settings.
         */
        GAMEMASTER: 4
    };

    /**
     * Invert the User Role mapping to recover role names from a role integer
     * @enum {string}
     * @see USER_ROLES
     */
    const USER_ROLE_NAMES = Object.entries(USER_ROLES).reduce((obj, r) => {
        obj[r[1]] = r[0];
        return obj;
    }, {});

    /**
     * An enumeration of the allowed types for a MeasuredTemplate embedded document
     * @enum {string}
     * @see https://foundryvtt.com/article/measurement/
     */
    const MEASURED_TEMPLATE_TYPES = {
        /**
         * Circular templates create a radius around the starting point.
         */
        CIRCLE: "circle",

        /**
         * Cones create an effect in the shape of a triangle or pizza slice from the starting point.
         */
        CONE: "cone",

        /**
         * A rectangle uses the origin point as one of the corners, treating the origin as being inside of the rectangle's area.
         */
        RECTANGLE: "rect",

        /**
         * A ray creates a single line that is one square in width and as long as you want it to be.
         */
        RAY: "ray"
    };

    /**
     * @typedef {Object} UserPermission
     * @property {string} label
     * @property {string} hint
     * @property {boolean} disableGM
     * @property {number} defaultRole
     */

    /**
     * Define the recognized User capabilities which individual Users or role levels may be permitted to perform
     * @type {Object<UserPermission>}
     */
    const USER_PERMISSIONS = {
        ACTOR_CREATE: {
            label: "PERMISSION.ActorCreate",
            hint: "PERMISSION.ActorCreateHint",
            disableGM: false,
            defaultRole: USER_ROLES.ASSISTANT
        },
        BROADCAST_AUDIO: {
            label: "PERMISSION.BroadcastAudio",
            hint: "PERMISSION.BroadcastAudioHint",
            disableGM: true,
            defaultRole: USER_ROLES.TRUSTED
        },
        BROADCAST_VIDEO: {
            label: "PERMISSION.BroadcastVideo",
            hint: "PERMISSION.BroadcastVideoHint",
            disableGM: true,
            defaultRole: USER_ROLES.TRUSTED
        },
        DRAWING_CREATE: {
            label: "PERMISSION.DrawingCreate",
            hint: "PERMISSION.DrawingCreateHint",
            disableGM: false,
            defaultRole: USER_ROLES.TRUSTED
        },
        ITEM_CREATE: {
            label: "PERMISSION.ItemCreate",
            hint: "PERMISSION.ItemCreateHint",
            disableGM: false,
            defaultRole: USER_ROLES.ASSISTANT
        },
        FILES_BROWSE: {
            label: "PERMISSION.FilesBrowse",
            hint: "PERMISSION.FilesBrowseHint",
            disableGM: false,
            defaultRole: USER_ROLES.TRUSTED
        },
        FILES_UPLOAD: {
            label: "PERMISSION.FilesUpload",
            hint: "PERMISSION.FilesUploadHint",
            disableGM: false,
            defaultRole: USER_ROLES.ASSISTANT
        },
        JOURNAL_CREATE: {
            label: "PERMISSION.JournalCreate",
            hint: "PERMISSION.JournalCreateHint",
            disableGM: false,
            defaultRole: USER_ROLES.TRUSTED
        },
        MACRO_SCRIPT: {
            label: "PERMISSION.MacroScript",
            hint: "PERMISSION.MacroScriptHint",
            disableGM: false,
            defaultRole: USER_ROLES.PLAYER
        },
        MESSAGE_WHISPER: {
            label: "PERMISSION.MessageWhisper",
            hint: "PERMISSION.MessageWhisperHint",
            disableGM: false,
            defaultRole: USER_ROLES.PLAYER
        },
        NOTE_CREATE: {
            label: "PERMISSION.NoteCreate",
            hint: "PERMISSION.NoteCreateHint",
            disableGM: false,
            defaultRole: USER_ROLES.TRUSTED
        },
        PING_CANVAS: {
            label: "PERMISSION.PingCanvas",
            hint: "PERMISSION.PingCanvasHint",
            disableGM: true,
            defaultRole: USER_ROLES.PLAYER
        },
        SETTINGS_MODIFY: {
            label: "PERMISSION.SettingsModify",
            hint: "PERMISSION.SettingsModifyHint",
            disableGM: false,
            defaultRole: USER_ROLES.ASSISTANT
        },
        SHOW_CURSOR: {
            label: "PERMISSION.ShowCursor",
            hint: "PERMISSION.ShowCursorHint",
            disableGM: true,
            defaultRole: USER_ROLES.PLAYER
        },
        SHOW_RULER: {
            label: "PERMISSION.ShowRuler",
            hint: "PERMISSION.ShowRulerHint",
            disableGM: true,
            defaultRole: USER_ROLES.PLAYER
        },
        TEMPLATE_CREATE: {
            label: "PERMISSION.TemplateCreate",
            hint: "PERMISSION.TemplateCreateHint",
            disableGM: false,
            defaultRole: USER_ROLES.PLAYER
        },
        TOKEN_CREATE: {
            label: "PERMISSION.TokenCreate",
            hint: "PERMISSION.TokenCreateHint",
            disableGM: false,
            defaultRole: USER_ROLES.ASSISTANT
        },
        TOKEN_DELETE: {
            label: "PERMISSION.TokenDelete",
            hint: "PERMISSION.TokenDeleteHint",
            disableGM: false,
            defaultRole: USER_ROLES.ASSISTANT
        },
        TOKEN_CONFIGURE: {
            label: "PERMISSION.TokenConfigure",
            hint: "PERMISSION.TokenConfigureHint",
            disableGM: false,
            defaultRole: USER_ROLES.TRUSTED
        },
        WALL_DOORS: {
            label: "PERMISSION.WallDoors",
            hint: "PERMISSION.WallDoorsHint",
            disableGM: false,
            defaultRole: USER_ROLES.PLAYER
        }
    };

    /**
     * The allowed directions of effect that a Wall can have
     * @enum {number}
     * @see https://foundryvtt.com/article/walls/
     */
    const WALL_DIRECTIONS = {
        /**
         * The wall collides from both directions.
         */
        BOTH: 0,

        /**
         * The wall collides only when a ray strikes its left side.
         */
        LEFT: 1,

        /**
         * The wall collides only when a ray strikes its right side.
         */
        RIGHT: 2
    };

    /**
     * The allowed door types which a Wall may contain
     * @enum {number}
     * @see https://foundryvtt.com/article/walls/
     */
    const WALL_DOOR_TYPES = {
        /**
         * The wall does not contain a door.
         */
        NONE: 0,

        /**
         *  The wall contains a regular door.
         */
        DOOR: 1,

        /**
         * The wall contains a secret door.
         */
        SECRET: 2
    };

    /**
     * The allowed door states which may describe a Wall that contains a door
     * @enum {number}
     * @see https://foundryvtt.com/article/walls/
     */
    const WALL_DOOR_STATES = {
        /**
         * The door is closed.
         */
        CLOSED: 0,

        /**
         * The door is open.
         */
        OPEN: 1,

        /**
         * The door is closed and locked.
         */
        LOCKED: 2
    };

    /**
     * The wall properties which restrict the way interaction occurs with a specific wall
     * @type {string[]}
     */
    const WALL_RESTRICTION_TYPES = ["light", "sight", "sound", "move"];

    /**
     * The types of sensory collision which a Wall may impose
     * @enum {number}
     * @see https://foundryvtt.com/article/walls/
     */
    const WALL_SENSE_TYPES = {
        /**
         * Senses do not collide with this wall.
         */
        NONE: 0,

        /**
         * Senses collide with this wall.
         */
        LIMITED: 10,

        /**
         * Senses collide with the second intersection, bypassing the first.
         */
        NORMAL: 20
    };

    /**
     * The types of movement collision which a Wall may impose
     * @enum {number}
     * @see https://foundryvtt.com/article/walls/
     */
    const WALL_MOVEMENT_TYPES = {
        /**
         * Movement does not collide with this wall.
         */
        NONE: WALL_SENSE_TYPES.NONE,

        /**
         * Movement collides with this wall.
         */
        NORMAL: WALL_SENSE_TYPES.NORMAL
    };

    /**
     * The possible precedence values a Keybinding might run in
     * @enum {number}
     * @see https://foundryvtt.com/article/keybinds/
     */
    const KEYBINDING_PRECEDENCE = {
        /**
         * Runs in the first group along with other PRIORITY keybindings.
         */
        PRIORITY: 0,

        /**
         * Runs after the PRIORITY group along with other NORMAL keybindings.
         */
        NORMAL: 1,

        /**
         * Runs in the last group along with other DEFERRED keybindings.
         */
        DEFERRED: 2
    };

    /**
     * The allowed set of HTML template extensions
     * @type {string[]}
     */
    const HTML_FILE_EXTENSIONS = ["html", "handlebars", "hbs"];

    /**
     * The supported file extensions for image-type files, and their corresponding mime types.
     * @type {Object<string, string>}
     */
    const IMAGE_FILE_EXTENSIONS = {
        apng: "image/apng",
        avif: "image/avif",
        bmp: "image/bmp",
        gif: "image/gif",
        jpeg: "image/jpeg",
        jpg: "image/jpeg",
        png: "image/png",
        svg: "image/svg+xml",
        tiff: "image/tiff",
        webp: "image/webp"
    };

    /**
     * The supported file extensions for video-type files, and their corresponding mime types.
     * @type {Object<string, string>}
     */
    const VIDEO_FILE_EXTENSIONS = {
        m4v: "video/mp4",
        mp4: "video/mp4",
        ogg: "video/ogg",
        webm: "video/webm"
    };

    /**
     * The supported file extensions for audio-type files, and their corresponding mime types.
     * @type {Object<string, string>}
     */
    const AUDIO_FILE_EXTENSIONS = {
        aac: "audio/aac",
        flac: "audio/flac",
        m4a: "audio/mp4",
        mid: "audio/midi",
        mp3: "audio/mpeg",
        ogg: "audio/ogg",
        opus: "audio/opus",
        wav: "audio/wav",
        webm: "audio/webm"
    };

    /**
     * The supported file extensions for text files, and their corresponding mime types.
     * @type {Object<string, string>}
     */
    const TEXT_FILE_EXTENSIONS = {
        csv: "text/csv",
        json: "application/json",
        md: "text/markdown",
        pdf: "application/pdf",
        tsv: "text/tab-separated-values",
        txt: "text/plain",
        xml: "application/xml",
        yml: "application/yaml",
        yaml: "application/yaml"
    };

    /**
     * Supported file extensions for font files, and their corresponding mime types.
     * @type {Object<string, string>}
     */
    const FONT_FILE_EXTENSIONS = {
        ttf: "font/ttf",
        otf: "font/otf",
        woff: "font/woff",
        woff2: "font/woff2"
    };

    /**
     * Supported file extensions for 3D files, and their corresponding mime types.
     * @type {Object<string, string>}
     */
    const GRAPHICS_FILE_EXTENSIONS = {
        fbx: "application/octet-stream",
        glb: "model/gltf-binary",
        gltf: "model/gltf+json",
        mtl: "model/mtl",
        obj: "model/obj",
        stl: "model/stl",
        usdz: "model/vnd.usdz+zip"
    };

    /**
     * A consolidated mapping of all extensions permitted for upload.
     * @type {Object<string, string>}
     */
    const UPLOADABLE_FILE_EXTENSIONS = {
        ...IMAGE_FILE_EXTENSIONS,
        ...VIDEO_FILE_EXTENSIONS,
        ...AUDIO_FILE_EXTENSIONS,
        ...TEXT_FILE_EXTENSIONS,
        ...FONT_FILE_EXTENSIONS,
        ...GRAPHICS_FILE_EXTENSIONS
    };

    /**
     * A list of MIME types which are treated as uploaded "media", which are allowed to overwrite existing files.
     * Any non-media MIME type is not allowed to replace an existing file.
     * @type {string[]}
     */
    const MEDIA_MIME_TYPES = Object.values(UPLOADABLE_FILE_EXTENSIONS);

    /**
     * An enumeration of file type categories which can be selected
     * @enum {Object<string, string>}
     */
    const FILE_CATEGORIES = {
        HTML: HTML_FILE_EXTENSIONS,
        IMAGE: IMAGE_FILE_EXTENSIONS,
        VIDEO: VIDEO_FILE_EXTENSIONS,
        AUDIO: AUDIO_FILE_EXTENSIONS,
        TEXT: TEXT_FILE_EXTENSIONS,
        FONT: FONT_FILE_EXTENSIONS,
        GRAPHICS: GRAPHICS_FILE_EXTENSIONS,
        MEDIA: MEDIA_MIME_TYPES,
    };

    /**
     * A font weight to name mapping.
     * @enum {number}
     */
    const FONT_WEIGHTS = {
        Thin: 100,
        ExtraLight: 200,
        Light: 300,
        Regular: 400,
        Medium: 500,
        SemiBold: 600,
        Bold: 700,
        ExtraBold: 800,
        Black: 900
    };

    /**
     * Stores shared commonly used timeouts, measured in MS
     * @enum {number}
     */
    const TIMEOUTS = {
        /**
         * The default timeout for interacting with the foundryvtt.com API.
         */
        FOUNDRY_WEBSITE: 10000,

        /**
         * The specific timeout for loading the list of packages from the foundryvtt.com API.
         */
        PACKAGE_REPOSITORY: 5000,

        /**
         * The specific timeout for the IP address lookup service.
         */
        IP_DISCOVERY: 5000
    };

    /**
     * A subset of Compendium types which require a specific system to be designated
     * @type {string[]}
     */
    const SYSTEM_SPECIFIC_COMPENDIUM_TYPES = ["Actor", "Item"];

    /**
     * The configured showdown bi-directional HTML <-> Markdown converter options.
     * @type {Object<boolean>}
     */
    const SHOWDOWN_OPTIONS = {
        disableForced4SpacesIndentedSublists: true,
        noHeaderId: true,
        parseImgDimensions: true,
        strikethrough: true,
        tables: true,
        tablesHeaderId: true
    };

    /**
     * @deprecated since v10.
     * @see {data.ShapeData.TYPES}
     * @enum {string}
     */
    const DRAWING_TYPES = {
        RECTANGLE: "r",
        ELLIPSE: "e",
        TEXT: "t",
        POLYGON: "p",
        FREEHAND: "f"
    };

    var CONST$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        vtt: vtt$1,
        VTT: VTT,
        WEBSITE_URL: WEBSITE_URL,
        WEBSITE_API_URL: WEBSITE_API_URL,
        ASCII: ASCII,
        ACTIVE_EFFECT_MODES: ACTIVE_EFFECT_MODES,
        BASE_DOCUMENT_TYPE: BASE_DOCUMENT_TYPE,
        CARD_DRAW_MODES: CARD_DRAW_MODES,
        CANVAS_PERFORMANCE_MODES: CANVAS_PERFORMANCE_MODES,
        CHAT_MESSAGE_TYPES: CHAT_MESSAGE_TYPES,
        CORE_SUPPORTED_LANGUAGES: CORE_SUPPORTED_LANGUAGES,
        COMPATIBILITY_MODES: COMPATIBILITY_MODES,
        DEFAULT_TOKEN: DEFAULT_TOKEN,
        DOCUMENT_TYPES: DOCUMENT_TYPES,
        COMPENDIUM_DOCUMENT_TYPES: COMPENDIUM_DOCUMENT_TYPES,
        DOCUMENT_OWNERSHIP_LEVELS: DOCUMENT_OWNERSHIP_LEVELS,
        DOCUMENT_META_OWNERSHIP_LEVELS: DOCUMENT_META_OWNERSHIP_LEVELS,
        DOCUMENT_PERMISSION_LEVELS: DOCUMENT_PERMISSION_LEVELS,
        DOCUMENT_LINK_TYPES: DOCUMENT_LINK_TYPES,
        DICE_ROLL_MODES: DICE_ROLL_MODES,
        DRAWING_FILL_TYPES: DRAWING_FILL_TYPES,
        FOLDER_DOCUMENT_TYPES: FOLDER_DOCUMENT_TYPES,
        FOLDER_MAX_DEPTH: FOLDER_MAX_DEPTH,
        GAME_VIEWS: GAME_VIEWS,
        GRID_MIN_SIZE: GRID_MIN_SIZE,
        GRID_TYPES: GRID_TYPES,
        SETUP_VIEWS: SETUP_VIEWS,
        MACRO_SCOPES: MACRO_SCOPES,
        MACRO_TYPES: MACRO_TYPES,
        PLAYLIST_MODES: PLAYLIST_MODES,
        PLAYLIST_SORT_MODES: PLAYLIST_SORT_MODES,
        PACKAGE_TYPES: PACKAGE_TYPES,
        PACKAGE_AVAILABILITY_CODES: PACKAGE_AVAILABILITY_CODES,
        PASSWORD_SAFE_STRING: PASSWORD_SAFE_STRING,
        SOFTWARE_UPDATE_CHANNELS: SOFTWARE_UPDATE_CHANNELS,
        SORT_INTEGER_DENSITY: SORT_INTEGER_DENSITY,
        TABLE_RESULT_TYPES: TABLE_RESULT_TYPES,
        JOURNAL_ENTRY_PAGE_FORMATS: JOURNAL_ENTRY_PAGE_FORMATS,
        TEXT_ANCHOR_POINTS: TEXT_ANCHOR_POINTS,
        TILE_OCCLUSION_MODES: TILE_OCCLUSION_MODES,
        TOKEN_DISPLAY_MODES: TOKEN_DISPLAY_MODES,
        TOKEN_DISPOSITIONS: TOKEN_DISPOSITIONS,
        USER_ROLES: USER_ROLES,
        USER_ROLE_NAMES: USER_ROLE_NAMES,
        MEASURED_TEMPLATE_TYPES: MEASURED_TEMPLATE_TYPES,
        USER_PERMISSIONS: USER_PERMISSIONS,
        WALL_DIRECTIONS: WALL_DIRECTIONS,
        WALL_DOOR_TYPES: WALL_DOOR_TYPES,
        WALL_DOOR_STATES: WALL_DOOR_STATES,
        WALL_RESTRICTION_TYPES: WALL_RESTRICTION_TYPES,
        WALL_SENSE_TYPES: WALL_SENSE_TYPES,
        WALL_MOVEMENT_TYPES: WALL_MOVEMENT_TYPES,
        KEYBINDING_PRECEDENCE: KEYBINDING_PRECEDENCE,
        HTML_FILE_EXTENSIONS: HTML_FILE_EXTENSIONS,
        IMAGE_FILE_EXTENSIONS: IMAGE_FILE_EXTENSIONS,
        VIDEO_FILE_EXTENSIONS: VIDEO_FILE_EXTENSIONS,
        AUDIO_FILE_EXTENSIONS: AUDIO_FILE_EXTENSIONS,
        TEXT_FILE_EXTENSIONS: TEXT_FILE_EXTENSIONS,
        FONT_FILE_EXTENSIONS: FONT_FILE_EXTENSIONS,
        GRAPHICS_FILE_EXTENSIONS: GRAPHICS_FILE_EXTENSIONS,
        UPLOADABLE_FILE_EXTENSIONS: UPLOADABLE_FILE_EXTENSIONS,
        MEDIA_MIME_TYPES: MEDIA_MIME_TYPES,
        FILE_CATEGORIES: FILE_CATEGORIES,
        FONT_WEIGHTS: FONT_WEIGHTS,
        TIMEOUTS: TIMEOUTS,
        SYSTEM_SPECIFIC_COMPENDIUM_TYPES: SYSTEM_SPECIFIC_COMPENDIUM_TYPES,
        SHOWDOWN_OPTIONS: SHOWDOWN_OPTIONS,
        DRAWING_TYPES: DRAWING_TYPES
    });

    /**
     * Log a compatibility warning which is filtered based on the client's defined compatibility settings.
     * @param {string} message            The original warning or error message
     * @param {object} [options={}]       Additional options which customize logging
     * @param {number} [options.mode]           A logging level in COMPATIBILITY_MODES which overrides the configured default
     * @param {number|string} [options.since]   A version identifier since which a change was made
     * @param {number|string} [options.until]   A version identifier until which a change remains supported
     * @param {string} [options.details]        Additional details to append to the logged message
     * @param {boolean} [options.stack=true]    Include the message stack trace
     * @throws                            An Error if the mode is ERROR
     */
    function logCompatibilityWarning(message, {mode, since, until, details, stack=true}={}) {

        // Determine the logging mode
        const config = CONFIG.compatibility;
        const modes = COMPATIBILITY_MODES;
        mode = mode ?? CONFIG.compatibility.mode ?? modes.FAILURE;
        if ( mode === modes.SILENT ) return;

        // Compose the message
        since = since ? `Deprecated since Version ${since}` : null;
        until = until ? `Backwards-compatible support will be removed in Version ${until}`: null;
        message = [message, since, until, details].filterJoin("\n");

        // Filter the message by its stack trace
        const error = new Error(message);
        if ( config.includePatterns.length ) {
            if ( !config.includePatterns.some(rgx => rgx.test(error.stack)) ) return;
        }
        if ( config.excludePatterns.length ) {
            if ( config.excludePatterns.some(rgx => rgx.test(error.stack)) ) return;
        }

        // Log the message
        switch ( mode ) {
            case modes.WARNING:
                return globalThis.logger.warn(stack ? error : error.message);
            case modes.ERROR:
                return globalThis.logger.error(stack ? error : error.message);
            case modes.FAILURE:
                throw error;
        }
    }

    /**
     * @module helpers
     */

    /**
     * Benchmark the performance of a function, calling it a requested number of iterations.
     * @param {Function} func       The function to benchmark
     * @param {number} iterations   The number of iterations to test
     * @param {...any} args         Additional arguments passed to the benchmarked function
     */
    async function benchmark(func, iterations, ...args) {
        const start = performance.now();
        for ( let i=0; i<iterations; i++ ) {
            await func(...args, i);
        }
        const end = performance.now();
        const t = Math.round((end - start) * 100) / 100;
        const name = func.name ?? "Evaluated Function";
        console.log(`${name} | ${iterations} iterations | ${t}ms | ${t / iterations}ms per`);
    }

    /* -------------------------------------------- */

    /**
     * A debugging function to test latency or timeouts by forcibly locking the thread for an amount of time.
     * @param {number} ms        A number of milliseconds to lock
     * @returns {Promise<void>}
     */
    async function threadLock(ms, debug=false) {
        const t0 = performance.now();
        let d = 0;
        while ( d < ms ) {
            d = performance.now() - t0;
            if ( debug && (d % 1000 === 0) ) {
                console.debug(`Thread lock for ${d / 1000} of ${ms / 1000} seconds`);
            }
        }
    }

    /* -------------------------------------------- */

    /**
     * Wrap a callback in a debounced timeout.
     * Delay execution of the callback function until the function has not been called for delay milliseconds
     * @param {Function} callback       A function to execute once the debounced threshold has been passed
     * @param {number} delay            An amount of time in milliseconds to delay
     * @return {Function}               A wrapped function which can be called to debounce execution
     */
    function debounce(callback, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                callback.apply(this, args);
            }, delay);
        }
    }

    /* -------------------------------------------- */

    /**
     * A utility function to reload the page with a debounce.
     * @callback debouncedReload
     */
    const debouncedReload = debounce( () => window.location.reload(), 250);

    /* -------------------------------------------- */

    /**
     * Quickly clone a simple piece of data, returning a copy which can be mutated safely.
     * This method DOES support recursive data structures containing inner objects or arrays.
     * This method DOES NOT support advanced object types like Set, Map, or other specialized classes.
     * @param {*} original                     Some sort of data
     * @param {object} [options]               Options to configure the behaviour of deepClone
     * @param {boolean} [options.strict=false] Throw an Error if deepClone is unable to clone something instead of returning the original
     * @return {*}                             The clone of that data
     */
    function deepClone(original, {strict=false}={}) {

        // Simple types
        if ( (typeof original !== "object") || (original === null) ) return original;

        // Arrays
        if ( original instanceof Array ) return original.map(deepClone);

        // Dates
        if ( original instanceof Date ) return new Date(original);

        // Unsupported advanced objects
        if ( original.constructor && (original.constructor !== Object) ) {
            if ( strict ) throw new Error("deepClone cannot clone advanced objects");
            return original;
        }

        // Other objects
        const clone = {};
        for ( let k of Object.keys(original) ) {
            clone[k] = deepClone(original[k]);
        }
        return clone;
    }

    /* -------------------------------------------- */

    /**
     * Deeply difference an object against some other, returning the update keys and values.
     * @param {object} original       An object comparing data against which to compare
     * @param {object} other          An object containing potentially different data
     * @param {object} [options={}]   Additional options which configure the diff operation
     * @param {boolean} [options.inner=false]  Only recognize differences in other for keys which also exist in original
     * @param {boolean} [options.deletionKeys=false] Apply special logic to deletion keys. They will only be kept if the
     *                                               original object has a corresponding key that could be deleted.
     * @return {object}               An object of the data in other which differs from that in original
     */
    function diffObject(original, other, {inner=false, deletionKeys=false}={}) {
        function _difference(v0, v1) {

            // Eliminate differences in types
            let t0 = getType(v0);
            let t1 = getType(v1);
            if ( t0 !== t1 ) return [true, v1];

            // null and undefined
            if ( ["null", "undefined"].includes(t0) ) return [v0 !== v1, v1];

            // If the prototype explicitly exposes an equality-testing method, use it
            if ( v0?.equals instanceof Function ) return [!v0.equals(v1), v1];

            // Recursively diff objects
            if ( t0 === "Object" ) {
                if ( isEmpty(v1) ) return [false, {}];
                if ( isEmpty(v0) ) return [true, v1];
                let d = diffObject(v0, v1, {inner, deletionKeys});
                return [!isEmpty(d), d];
            }

            // Differences in primitives
            return [v0.valueOf() !== v1.valueOf(), v1];
        }

        // Recursively call the _difference function
        return Object.keys(other).reduce((obj, key) => {
            const isDeletionKey = key.startsWith("-=");
            if ( isDeletionKey && deletionKeys ) {
                const otherKey = key.substring(2);
                if ( otherKey in original ) obj[key] = other[key];
                return obj;
            }
            if ( inner && !(key in original) ) return obj;
            let [isDifferent, difference] = _difference(original[key], other[key]);
            if ( isDifferent ) obj[key] = difference;
            return obj;
        }, {});
    }

    /* -------------------------------------------- */

    /**
     * Test if two objects contain the same enumerable keys and values.
     * @param {object} a  The first object.
     * @param {object} b  The second object.
     * @returns {boolean}
     */
    function objectsEqual(a, b) {
        if ( (a == null) || (b == null) ) return a === b;
        if ( (getType(a) !== "Object") || (getType(b) !== "Object") ) return a === b;
        if ( Object.keys(a).length !== Object.keys(b).length ) return false;
        return Object.entries(a).every(([k, v0]) => {
            const v1 = b[k];
            const t0 = getType(v0);
            const t1 = getType(v1);
            if ( t0 !== t1 ) return false;
            if ( v0?.equals instanceof Function ) return v0.equals(v1);
            if ( t0 === "Object" ) return objectsEqual(v0, v1);
            return v0 === v1;
        });
    }

    /* -------------------------------------------- */

    /**
     * A cheap data duplication trick which is relatively robust.
     * For a subset of cases the deepClone function will offer better performance.
     * @param {Object} original   Some sort of data
     */
    function duplicate(original) {
        return JSON.parse(JSON.stringify(original));
    }

    /* -------------------------------------------- */

    /**
     * Test whether some class is a subclass of a parent.
     * Returns true if the classes are identical.
     * @param {Function} cls        The class to test
     * @param {Function} parent     Some other class which may be a parent
     * @returns {boolean}           Is the class a subclass of the parent?
     */
    function isSubclass(cls, parent) {
        if ( typeof cls !== "function" ) return false;
        if ( cls === parent ) return true;
        return parent.isPrototypeOf(cls);
    }

    /* -------------------------------------------- */

    /**
     * Encode a url-like string by replacing any characters which need encoding
     * To reverse this encoding, the native decodeURIComponent can be used on the whole encoded string, without adjustment.
     * @param {string} path     A fully-qualified URL or url component (like a relative path)
     * @return {string}         An encoded URL string
     */
    function encodeURL(path) {

        // Determine whether the path is a well-formed URL
        const url = URL.parseSafe(path);

        // If URL, remove the initial protocol
        if ( url ) path = path.replace(url.protocol, "");

        // Split and encode each URL part
        path = path.split("/").map(p => encodeURIComponent(p).replace(/'/g, "%27")).join("/");

        // Return the encoded URL
        return url ? url.protocol + path : path;
    }

    /* -------------------------------------------- */

    /**
     * Expand a flattened object to be a standard nested Object by converting all dot-notation keys to inner objects.
     * @param {object} obj      The object to expand
     * @param {number} [_d=0]   Track the recursion depth to prevent overflow
     * @return {object}         An expanded object
     */
    function expandObject(obj, _d=0) {
        if ( _d > 100 ) throw new Error("Maximum object expansion depth exceeded");

        // Recursive expansion function
        function _expand(value) {
            if ( value instanceof Object ) {
                if ( Array.isArray(value) ) return value.map(_expand);
                else return expandObject(value, _d+1)
            }
            return value;
        }

        // Expand all object keys
        const expanded = {};
        for ( let [k, v] of Object.entries(obj) ) {
            setProperty(expanded, k, _expand(v));
        }
        return expanded;
    }

    /* -------------------------------------------- */

    /**
     * Filter the contents of some source object using the structure of a template object.
     * Only keys which exist in the template are preserved in the source object.
     *
     * @param {object} source           An object which contains the data you wish to filter
     * @param {object} template         An object which contains the structure you wish to preserve
     * @param {object} [options={}]     Additional options which customize the filtration
     * @param {boolean} [options.deletionKeys=false]    Whether to keep deletion keys
     * @param {boolean} [options.templateValues=false]  Instead of keeping values from the source, instead draw values from the template
     *
     * @example Filter an object
     * ```js
     * const source = {foo: {number: 1, name: "Tim", topping: "olives"}, bar: "baz"};
     * const template = {foo: {number: 0, name: "Mit", style: "bold"}, other: 72};
     * filterObject(source, template); // {foo: {number: 1, name: "Tim"}};
     * filterObject(source, template, {templateValues: true}); // {foo: {number: 0, name: "Mit"}};
     * ```
     */
    function filterObject(source, template, {deletionKeys=false, templateValues=false}={}) {

        // Validate input
        const ts = getType(source);
        const tt = getType(template);
        if ( (ts !== "Object") || (tt !== "Object")) throw new Error("One of source or template are not Objects!");

        // Define recursive filtering function
        const _filter = function(s, t, filtered) {
            for ( let [k, v] of Object.entries(s) ) {
                let has = t.hasOwnProperty(k);
                let x = t[k];

                // Case 1 - inner object
                if ( has && (getType(v) === "Object") && (getType(x) === "Object") ) {
                    filtered[k] = _filter(v, x, {});
                }

                // Case 2 - inner key
                else if ( has ) {
                    filtered[k] = templateValues ? x : v;
                }

                // Case 3 - special key
                else if ( deletionKeys && k.startsWith("-=") ) {
                    filtered[k] = v;
                }
            }
            return filtered;
        };

        // Begin filtering at the outer-most layer
        return _filter(source, template, {});
    }

    /* -------------------------------------------- */

    /**
     * Flatten a possibly multi-dimensional object to a one-dimensional one by converting all nested keys to dot notation
     * @param {object} obj        The object to flatten
     * @param {number} [_d=0]     Track the recursion depth to prevent overflow
     * @return {object}           A flattened object
     */
    function flattenObject(obj, _d=0) {
        const flat = {};
        if ( _d > 100 ) {
            throw new Error("Maximum depth exceeded");
        }
        for ( let [k, v] of Object.entries(obj) ) {
            let t = getType(v);
            if ( t === "Object" ) {
                if ( isEmpty(v) ) flat[k] = v;
                let inner = flattenObject(v, _d+1);
                for ( let [ik, iv] of Object.entries(inner) ) {
                    flat[`${k}.${ik}`] = iv;
                }
            }
            else flat[k] = v;
        }
        return flat;
    }

    /* -------------------------------------------- */

    /**
     * Obtain references to the parent classes of a certain class.
     * @param {Function} cls      An ES6 Class definition
     * @return {Function[]}       An array of parent Classes which the provided class extends
     */
    function getParentClasses(cls) {
        if ( typeof cls !== "function" ) {
            throw new Error("The provided class is not a type of Function");
        }
        const parents = [];
        let parent = Object.getPrototypeOf(cls);
        while ( parent ) {
            parents.push(parent);
            parent = Object.getPrototypeOf(parent);
        }
        return parents.slice(0, -2)
    }

    /* -------------------------------------------- */

    /**
     * Get the URL route for a certain path which includes a path prefix, if one is set
     * @param {string} path             The Foundry URL path
     * @param {string|null} [prefix]    A path prefix to apply
     * @returns {string}                The absolute URL path
     */
    function getRoute(path, {prefix}={}) {
        prefix = prefix === undefined ? globalThis.ROUTE_PREFIX : prefix || null;
        path = path.replace(/(^[\/]+)|([\/]+$)/g, ""); // Strip leading and trailing slashes
        let paths = [""];
        if ( prefix ) paths.push(prefix);
        paths = paths.concat([path.replace(/(^\/)|(\/$)/g, "")]);
        return paths.join("/");
    }

    /* -------------------------------------------- */

    /**
     * Learn the underlying data type of some variable. Supported identifiable types include:
     * undefined, null, number, string, boolean, function, Array, Set, Map, Promise, Error,
     * HTMLElement (client side only), Object (catchall for other object types)
     * @param {*} variable  A provided variable
     * @return {string}     The named type of the token
     */
    function getType(variable) {

        // Primitive types, handled with simple typeof check
        const typeOf = typeof variable;
        if ( typeOf !== "object" ) return typeOf;

        // Special cases of object
        if ( variable === null ) return "null";
        if ( !variable.constructor ) return "Object"; // Object with the null prototype.
        if ( variable.constructor.name === "Object" ) return "Object";  // simple objects

        // Match prototype instances
        const prototypes = [
            [Array, "Array"],
            [Set, "Set"],
            [Map, "Map"],
            [Promise, "Promise"],
            [Error, "Error"],
            [Color, "number"]
        ];
        if ( "HTMLElement" in globalThis ) prototypes.push([globalThis.HTMLElement, "HTMLElement"]);
        for ( const [cls, type] of prototypes ) {
            if ( variable instanceof cls ) return type;
        }

        // Unknown Object type
        return "Object";
    }

    /* -------------------------------------------- */

    /**
     * A helper function which tests whether an object has a property or nested property given a string key.
     * The method also supports arrays if the provided key is an integer index of the array.
     * The string key supports the notation a.b.c which would return true if object[a][b][c] exists
     * @param {object} object   The object to traverse
     * @param {string} key      An object property with notation a.b.c
     * @returns {boolean}       An indicator for whether the property exists
     */
    function hasProperty(object, key) {
        if ( !key ) return false;
        let target = object;
        for ( let p of key.split('.') ) {
            const t = getType(target);
            if ( !((t === "Object") || (t === "Array")) ) return false;
            if ( p in target ) target = target[p];
            else return false;
        }
        return true;
    }

    /* -------------------------------------------- */

    /**
     * A helper function which searches through an object to retrieve a value by a string key.
     * The method also supports arrays if the provided key is an integer index of the array.
     * The string key supports the notation a.b.c which would return object[a][b][c]
     * @param {object} object   The object to traverse
     * @param {string} key      An object property with notation a.b.c
     * @return {*}              The value of the found property
     */
    function getProperty(object, key) {
        if ( !key ) return undefined;
        let target = object;
        for ( let p of key.split('.') ) {
            const t = getType(target);
            if ( !((t === "Object") || (t === "Array")) ) return undefined;
            if ( p in target ) target = target[p];
            else return undefined;
        }
        return target;
    }

    /* -------------------------------------------- */

    /**
     * A helper function which searches through an object to assign a value using a string key
     * This string key supports the notation a.b.c which would target object[a][b][c]
     * @param {object} object   The object to update
     * @param {string} key      The string key
     * @param {*} value         The value to be assigned
     * @return {boolean}        Whether the value was changed from its previous value
     */
    function setProperty(object, key, value) {
        let target = object;
        let changed = false;

        // Convert the key to an object reference if it contains dot notation
        if ( key.indexOf('.') !== -1 ) {
            let parts = key.split('.');
            key = parts.pop();
            target = parts.reduce((o, i) => {
                if ( !o.hasOwnProperty(i) ) o[i] = {};
                return o[i];
            }, object);
        }

        // Update the target
        if ( target[key] !== value ) {
            changed = true;
            target[key] = value;
        }

        // Return changed status
        return changed;
    }

    /* -------------------------------------------- */

    /**
     * Invert an object by assigning its values as keys and its keys as values.
     * @param {object} obj    The original object to invert
     * @returns {object}      The inverted object with keys and values swapped
     */
    function invertObject(obj) {
        const inverted = {};
        for ( let [k, v] of Object.entries(obj) ) {
            if ( v in inverted ) throw new Error("The values of the provided object must be unique in order to invert it.");
            inverted[v] = k;
        }
        return inverted;
    }

    /* -------------------------------------------- */

    /**
     * Return whether a target version (v1) is more advanced than some other reference version (v0).
     * Supports either numeric or string version comparison with version parts separated by periods.
     * @param {number|string} v1    The target version
     * @param {number|string} v0    The reference version
     * @return {boolean}            Is v1 a more advanced version than v0?
     */
    function isNewerVersion(v1, v0) {

        // Handle numeric versions
        if ( (typeof v1 === "number") && (typeof v0 === "number") ) return v1 > v0;

        // Handle string parts
        let v1Parts = String(v1).split(".");
        let v0Parts = String(v0).split(".");

        // Iterate over version parts
        for ( let [i, p1] of v1Parts.entries() ) {
            let p0 = v0Parts[i];

            // If the prior version doesn't have a part, v1 wins
            if ( p0 === undefined ) return true;

            // If both parts are numbers, use numeric comparison to avoid cases like "12" < "5"
            if ( Number.isNumeric(p0) && Number.isNumeric(p1) ) {
                if ( Number(p1) !== Number(p0) ) return Number(p1) > Number(p0);
            }

            // Otherwise, compare as strings
            if ( p1 !== p0 ) return p1 > p0;
        }

        // If there are additional parts to v0, it is not newer
        if ( v0Parts.length > v1Parts.length ) return false;

        // If we have not returned false by now, it's either newer or the same
        return !v1Parts.equals(v0Parts);
    }

    /* -------------------------------------------- */

    /**
     * A simple function to test whether an Object is empty
     * @param {object} obj    The object to test
     * @return {boolean}      Is the object empty?
     * @deprecated since v10, will be removed in v11 - Use isEmpty instead.
     */
    function isObjectEmpty(obj) {
        foundry.utils.logCompatibilityWarning("foundry.utils.isObjectEmpty is deprecated in favor of foundry.utils.isEmpty", {since: 10, until: 11});
        if ( getType(obj) !== "Object" ) {
            throw new Error("The provided data is not an object!");
        }
        return Object.keys(obj).length === 0;
    }

    /* -------------------------------------------- */

    /**
     * Test whether a value is empty-like; either undefined or a content-less object.
     * @param {*} value       The value to test
     * @returns {boolean}     Is the value empty-like?
     */
    function isEmpty(value) {
        const t = getType(value);
        switch ( t ) {
            case "undefined":
                return true;
            case "Array":
                return !value.length;
            case "Object":
                return (getType(value) === "Object") && !Object.keys(value).length;
            case "Set":
            case "Map":
                return !value.size;
            default:
                return false;
        }
    }

    /* -------------------------------------------- */

    /**
     * Update a source object by replacing its keys and values with those from a target object.
     *
     * @param {object} original                           The initial object which should be updated with values from the
     *                                                    target
     * @param {object} [other={}]                         A new object whose values should replace those in the source
     * @param {object} [options={}]                       Additional options which configure the merge
     * @param {boolean} [options.insertKeys=true]         Control whether to insert new top-level objects into the resulting
     *                                                    structure which do not previously exist in the original object.
     * @param {boolean} [options.insertValues=true]       Control whether to insert new nested values into child objects in
     *                                                    the resulting structure which did not previously exist in the
     *                                                    original object.
     * @param {boolean} [options.overwrite=true]          Control whether to replace existing values in the source, or only
     *                                                    merge values which do not already exist in the original object.
     * @param {boolean} [options.recursive=true]          Control whether to merge inner-objects recursively (if true), or
     *                                                    whether to simply replace inner objects with a provided new value.
     * @param {boolean} [options.inplace=true]            Control whether to apply updates to the original object in-place
     *                                                    (if true), otherwise the original object is duplicated and the
     *                                                    copy is merged.
     * @param {boolean} [options.enforceTypes=false]      Control whether strict type checking requires that the value of a
     *                                                    key in the other object must match the data type in the original
     *                                                    data to be merged.
     * @param {boolean} [options.performDeletions=false]  Control whether to perform deletions on the original object if
     *                                                    deletion keys are present in the other object.
     * @param {number} [_d=0]                             A privately used parameter to track recursion depth.
     * @returns {object}                                  The original source object including updated, inserted, or
     *                                                    overwritten records.
     *
     * @example Control how new keys and values are added
     * ```js
     * mergeObject({k1: "v1"}, {k2: "v2"}, {insertKeys: false}); // {k1: "v1"}
     * mergeObject({k1: "v1"}, {k2: "v2"}, {insertKeys: true});  // {k1: "v1", k2: "v2"}
     * mergeObject({k1: {i1: "v1"}}, {k1: {i2: "v2"}}, {insertValues: false}); // {k1: {i1: "v1"}}
     * mergeObject({k1: {i1: "v1"}}, {k1: {i2: "v2"}}, {insertValues: true}); // {k1: {i1: "v1", i2: "v2"}}
     * ```
     *
     * @example Control how existing data is overwritten
     * ```js
     * mergeObject({k1: "v1"}, {k1: "v2"}, {overwrite: true}); // {k1: "v2"}
     * mergeObject({k1: "v1"}, {k1: "v2"}, {overwrite: false}); // {k1: "v1"}
     * ```
     *
     * @example Control whether merges are performed recursively
     * ```js
     * mergeObject({k1: {i1: "v1"}}, {k1: {i2: "v2"}}, {recursive: false}); // {k1: {i1: "v2"}}
     * mergeObject({k1: {i1: "v1"}}, {k1: {i2: "v2"}}, {recursive: true}); // {k1: {i1: "v1", i2: "v2"}}
     * ```
     *
     * @example Deleting an existing object key
     * ```js
     * mergeObject({k1: "v1", k2: "v2"}, {"-=k1": null});   // {k2: "v2"}
     * ```
     */
    function mergeObject(original, other={}, {
        insertKeys=true, insertValues=true, overwrite=true, recursive=true, inplace=true, enforceTypes=false,
        performDeletions=false
    }={}, _d=0) {
        other = other || {};
        if (!(original instanceof Object) || !(other instanceof Object)) {
            throw new Error("One of original or other are not Objects!");
        }
        const options = {insertKeys, insertValues, overwrite, recursive, inplace, enforceTypes, performDeletions};

        // Special handling at depth 0
        if ( _d === 0 ) {
            if ( Object.keys(other).some(k => /\./.test(k)) ) other = expandObject(other);
            if ( Object.keys(original).some(k => /\./.test(k)) ) {
                const expanded = expandObject(original);
                if ( inplace ) {
                    Object.keys(original).forEach(k => delete original[k]);
                    Object.assign(original, expanded);
                }
                else original = expanded;
            }
            else if ( !inplace ) original = deepClone(original);
        }

        // Iterate over the other object
        for ( let k of Object.keys(other) ) {
            const v = other[k];
            if ( original.hasOwnProperty(k) ) _mergeUpdate(original, k, v, options, _d+1);
            else _mergeInsert(original, k, v, options, _d+1);
        }
        return original;
    }

    /**
     * A helper function for merging objects when the target key does not exist in the original
     * @private
     */
    function _mergeInsert(original, k, v, {insertKeys, insertValues, performDeletions}={}, _d) {
        // Delete a key
        if ( k.startsWith("-=") && performDeletions ) {
            delete original[k.slice(2)];
            return;
        }

        const canInsert = ((_d <= 1) && insertKeys) || ((_d > 1) && insertValues);
        if ( !canInsert ) return;

        // Recursively create simple objects
        if ( v?.constructor === Object ) {
            original[k] = mergeObject({}, v, {insertKeys: true, inplace: true, performDeletions});
            return;
        }

        // Insert a key
        original[k] = v;
    }

    /**
     * A helper function for merging objects when the target key exists in the original
     * @private
     */
    function _mergeUpdate(original, k, v, {
        insertKeys, insertValues, enforceTypes, overwrite, recursive, performDeletions
    }={}, _d) {
        const x = original[k];
        const tv = getType(v);
        const tx = getType(x);

        // Recursively merge an inner object
        if ( (tv === "Object") && (tx === "Object") && recursive) {
            return mergeObject(x, v, {
                insertKeys, insertValues, overwrite, enforceTypes, performDeletions,
                inplace: true
            }, _d);
        }

        // Overwrite an existing value
        if ( overwrite ) {
            if ( (tx !== "undefined") && (tv !== tx) && enforceTypes ) {
                throw new Error(`Mismatched data types encountered during object merge.`);
            }
            original[k] = v;
        }
    }

    /* -------------------------------------------- */

    /**
     * Parse an S3 key to learn the bucket and the key prefix used for the request.
     * @param {string} key  A fully qualified key name or prefix path.
     * @returns {{bucket: string|null, keyPrefix: string}}
     */
    function parseS3URL(key) {
        const url = URL.parseSafe(key);
        if ( url ) return {
            bucket: url.host.split(".").shift(),
            keyPrefix: url.pathname.slice(1)
        };
        return {
            bucket: null,
            keyPrefix: ""
        };
    }

    /* -------------------------------------------- */

    /**
     * Generate a random string ID of a given requested length.
     * @param {number} length    The length of the random ID to generate
     * @return {string}          Return a string containing random letters and numbers
     */
    function randomID(length=16) {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const r = Array.from({length}, () => (Math.random() * chars.length) >> 0);
        return r.map(i => chars[i]).join("");
    }

    /* -------------------------------------------- */

    /**
     * Express a timestamp as a relative string
     * @param {Date|string} timeStamp   A timestamp string or Date object to be formatted as a relative time
     * @return {string}                 A string expression for the relative time
     */
    function timeSince(timeStamp) {
        timeStamp = new Date(timeStamp);
        const now = new Date();
        const secondsPast = (now - timeStamp) / 1000;
        let since = "";

        // Format the time
        if (secondsPast < 60) {
            since = secondsPast;
            if ( since < 1 ) return game.i18n.localize("TIME.Now");
            else since = Math.round(since) + game.i18n.localize("TIME.SecondsAbbreviation");
        }
        else if (secondsPast < 3600) since = Math.round(secondsPast / 60) + game.i18n.localize("TIME.MinutesAbbreviation");
        else if (secondsPast <= 86400) since = Math.round(secondsPast / 3600) + game.i18n.localize("TIME.HoursAbbreviation");
        else {
            const hours = Math.round(secondsPast / 3600);
            const days = Math.floor(hours / 24);
            since = `${days}${game.i18n.localize("TIME.DaysAbbreviation")} ${hours % 24}${game.i18n.localize("TIME.HoursAbbreviation")}`;
        }

        // Return the string
        return game.i18n.format("TIME.Since", {since: since});
    }

    /* -------------------------------------------- */
    /*  Deprecations and Compatibility              */
    /* -------------------------------------------- */

    /**
     * @deprecated since v10
     * @ignore
     */
    function rgbToHsv(r, g, b) {
        logCompatibilityWarning("rgbToHsv is deprecated in favor of Color#hsv", {since: 10, until: 12});
        const c = Color.fromRGB([r, g, b]);
        return c.hsv;
    }

    /**
     * @deprecated since v10
     * @ignore
     */
    function hsvToRgb(h, s, v) {
        logCompatibilityWarning("hsvToRgb is deprecated in favor of Color.fromHSV", {since: 10, until: 12});
        const c = Color.fromHSV([h, s, v]);
        return c.rgb;
    }

    /**
     * @deprecated since v10
     * @ignore
     */
    function rgbToHex(rgb) {
        logCompatibilityWarning("rgbToHex is deprecated in favor of Color.fromRGB", {since: 10, until: 12});
        return Color.fromRGB(rgb);
    }

    /**
     * @deprecated since v10
     * @ignore
     */
    function hexToRGB(hex) {
        logCompatibilityWarning("hexToRGB is deprecated in favor of Color#rgb", {since: 10, until: 12});
        const c = new Color(hex);
        return c.rgb;
    }

    /**
     * @deprecated since v10
     * @ignore
     */
    function hexToRGBAString(hex, alpha=1.0) {
        logCompatibilityWarning("hexToRGBAString is deprecated in favor of Color#toRGBA", {since: 10, until: 12});
        const c = new Color(hex);
        return c.toRGBA(alpha);
    }

    /**
     * @deprecated since v10
     * @ignore
     */
    function colorStringToHex(color) {
        logCompatibilityWarning("colorStringToHex is deprecated in favor of Color.from", {since: 10, until: 12});
        return Color.from(color);
    }

    /**
     * Flatten nested arrays by concatenating their contents
     * @returns {any[]}    An array containing the concatenated inner values
     */
    function deepFlatten() {
        return this.reduce((acc, val) => Array.isArray(val) ? acc.concat(val.deepFlatten()) : acc.concat(val), []);
    }

    /**
     * Test element-wise equality of the values of this array against the values of another array
     * @param {any[]} other   Some other array against which to test equality
     * @returns {boolean}     Are the two arrays element-wise equal?
     */
    function equals$1(other) {
        if ( !(other instanceof Array) || (other.length !== this.length) ) return false;
        return this.every((v0, i) => {
            const v1 = other[i];
            const t0 = getType(v0);
            const t1 = getType(v1);
            if ( t0 !== t1 ) return false;
            if ( v0?.equals instanceof Function ) return v0.equals(v1);
            if ( t0 === "Object" ) return objectsEqual(v0, v1);
            return v0 === v1;
        });
    }

    /**
     * Partition an original array into two children array based on a logical test
     * Elements which test as false go into the first result while elements testing as true appear in the second
     * @param rule {Function}
     * @returns {Array}    An Array of length two whose elements are the partitioned pieces of the original
     */
    function partition(rule) {
        return this.reduce((acc, val) => {
            let test = rule(val);
            acc[Number(test)].push(val);
            return acc;
        }, [[], []]);
    }

    /**
     * Join an Array using a string separator, first filtering out any parts which return a false-y value
     * @param {string} sep    The separator string
     * @returns {string}      The joined string, filtered of any false values
     */
    function filterJoin(sep) {
        return this.filter(p => !!p).join(sep);
    }

    /**
     * Find an element within the Array and remove it from the array
     * @param {Function} find   A function to use as input to findIndex
     * @param {*} [replace]     A replacement for the spliced element
     * @returns {*|null}        The replacement element, the removed element, or null if no element was found.
     */
    function findSplice(find, replace) {
        const idx = this.findIndex(find);
        if ( idx === -1 ) return null;
        if ( replace !== undefined ) {
            this.splice(idx, 1, replace);
            return replace;
        } else {
            const item = this[idx];
            this.splice(idx, 1);
            return item;
        }
    }

    /**
     * Create and initialize an array of length n with integers from 0 to n-1
     * @memberof Array
     * @param {number} n        The desired array length
     * @param {number} [min=0]  A desired minimum number from which the created array starts
     * @returns {number[]}      An array of integers from min to min+n
     */
    function fromRange(n, min=0) {
        return Array.from({length: n}, (v, i) => i + min);
    }

    // Assign primitives to the Array prototype
    Object.assign(Array.prototype, {deepFlatten, equals: equals$1, partition, filterJoin, findSplice});
    Object.assign(Array, {fromRange});

    /**
     * Test whether a Date instance is valid.
     * A valid date returns a number for its timestamp, and NaN otherwise.
     * NaN is never equal to itself.
     * @returns {boolean}
     */
    function isValid() {
        return this.getTime() === this.getTime();
    }

    /**
     * Return a standard YYYY-MM-DD string for the Date instance.
     * @returns {string}    The date in YYYY-MM-DD format
     */
    function toDateInputString() {
        const yyyy = this.getFullYear();
        const mm = (this.getMonth() + 1).paddedString(2);
        const dd = this.getDate().paddedString(2);
        return `${yyyy}-${mm}-${dd}`;
    }

    /**
     * Return a standard H:M:S.Z string for the Date instance.
     * @returns {string}    The time in H:M:S format
     */
    function toTimeInputString() {
        return this.toTimeString().split(" ")[0];
    }

    // Assign primitives to the Date prototype
    Object.assign(Date.prototype, {isValid, toDateInputString, toTimeInputString});

    /**
     * Bound a number between some minimum and maximum value, inclusively.
     * @param {number} num    The current value
     * @param {number} min    The minimum allowed value
     * @param {number} max    The maximum allowed value
     * @return {number}       The clamped number
     */
    function clamped(num, min, max) {
        return Math.min(max, Math.max(num, min));
    }

    /**
     * Linear interpolation function
     * @param {number} a   An initial value when weight is 0.
     * @param {number} b   A terminal value when weight is 1.
     * @param {number} w   A weight between 0 and 1.
     * @return {number}    The interpolated value between a and b with weight w.
     */
    function mix(a, b, w) {
        return a * (1 - w) + b * w;
    }

    /**
     * Transform an angle in degrees to be bounded within the domain [0, 360]
     * @param {number} degrees  An angle in degrees
     * @param {number} [base=0] The base angle to normalize to, either 0 for [0, 360) or 360 for (0, 360]
     * @return {number}         The same angle on the range [0, 360) or (0, 360]
     */
    function normalizeDegrees(degrees, base=0) {
        const d = degrees % 360;
        if ( base === 360 ) return d <= 0 ? d + 360 : d;
        else return d < 0 ? d + 360 : d;
    }

    /**
     * Transform an angle in radians to be bounded within the domain [-PI, PI]
     * @param {number} radians  An angle in degrees
     * @return {number}         The same angle on the range [-PI, PI]
     */
    function normalizeRadians(radians) {
        let pi2 = 2 * Math.PI;
        while ( radians < -Math.PI ) radians += pi2;
        while ( radians > Math.PI ) radians -= pi2;
        return radians;
    }

    /**
     * Round a floating point number to a certain number of decimal places
     * @param {number} number  A floating point number
     * @param {number} places  An integer number of decimal places
     */
    function roundDecimals(number, places) {
        places = Math.max(Math.trunc(places), 0);
        let scl = Math.pow(10, places);
        return Math.round(number * scl) / scl;
    }

    /**
     * TODO: Add deprecation in V11 or V12
     * To keep compatibility with previous implementation.
     * roundFast was bugged and the performance advantage was not there.
     */
    const roundFast = Math.round;

    /**
     * Transform an angle in radians to a number in degrees
     * @param {number} angle    An angle in radians
     * @return {number}         An angle in degrees
     */
    function toDegrees(angle) {
        return angle * (180 / Math.PI);
    }

    /**
     * Transform an angle in degrees to an angle in radians
     * @param {number} angle    An angle in degrees
     * @return {number}         An angle in radians
     */
    function toRadians(angle) {
        return (angle % 360) * (Math.PI / 180);
    }

    /**
     * Get an oscillation between lVal and hVal according to t
     * @param {number} minVal             The minimal value of the oscillation.
     * @param {number} maxVal             The maximum value of the oscillation.
     * @param {number} t                  The time value.
     * @param {number} [p=1]              The period (can't be equal to 0).
     * @param {Function} [func=Math.cos]  The optional math function to use for oscillation.
     * @return {number}                   The oscillation according to t.
     */
    function oscillation(minVal, maxVal, t, p = 1, func = Math.cos) {
        return ((maxVal - minVal) * (func((2 * Math.PI * t) / p) + 1) / 2) + minVal;
    }

    Object.assign(Math, {clamped, mix, normalizeDegrees, normalizeRadians, roundDecimals,
        roundFast, toDegrees, toRadians, oscillation});

    /**
     * Test for near-equivalence of two numbers within some permitted epsilon
     * @param {number} n      Some other number
     * @param {number} e      Some permitted epsilon, by default 1e-8
     * @returns {boolean}     Are the numbers almost equal?
     */
    function almostEqual(n, e=1e-8) {
        return Math.abs(this - n) < e;
    }

    /**
     * Transform a number to an ordinal string representation. i.e.
     * 1 => 1st
     * 2 => 2nd
     * 3 => 3rd
     * @returns {string}
     */
    function ordinalString() {
        const s = ["th","st","nd","rd"];
        const v = this % 100;
        return this + (s[(v-20)%10]||s[v]||s[0]);
    }

    /**
     * Return a string front-padded by zeroes to reach a certain number of numeral characters
     * @param {number} digits     The number of characters desired
     * @returns {string}          The zero-padded number
     */
    function paddedString(digits) {
        return this.toString().padStart(digits, "0");
    }

    /**
     * Return a string prefaced by the sign of the number (+) or (-)
     * @returns {string}          The signed number as a string
     */
    function signedString() {
        return (( this < 0 ) ? "" : "+") + this;
    }

    /**
     * Round a number to the nearest number which is a multiple of a given interval
     * @param {number} interval     The interval to round the number to the nearest multiple of
     * @param {string} [method=round] The rounding method in: round, ceil, floor
     * @returns {number}            The rounded number
     *
     * @example Round a number to the nearest step interval
     * ```js
     * let n = 17.18;
     * n.toNearest(5); // 15
     * n.toNearest(10); // 20
     * n.toNearest(10, "floor"); // 10
     * n.toNearest(10, "ceil"); // 20
     * n.toNearest(0.25); // 17.25
     * ```
     */
    function toNearest(interval=1, method="round") {
        const q = 1 / interval;
        return Math[method](this * q) / q;
    }

    /**
     * A faster numeric between check which avoids type coercion to the Number object.
     * Since this avoids coercion, if non-numbers are passed in unpredictable results will occur. Use with caution.
     * @param {number} a            The lower-bound
     * @param {number} b            The upper-bound
     * @param {boolean} inclusive   Include the bounding values as a true result?
     * @return {boolean}            Is the number between the two bounds?
     */
    function between(a, b, inclusive=true) {
        const min = Math.min(a, b);
        const max = Math.max(a, b);
        return inclusive ? (this >= min) && (this <= max) : (this > min) && (this < max);
    }

    /**
     * @see Number#between
     * @ignore
     */
    Number.between = function(num, a, b, inclusive=true) {
        let min = Math.min(a, b);
        let max = Math.max(a, b);
        return inclusive ? (num >= min) && (num <= max) : (num > min) && (num < max);
    };

    /**
     * Test whether a value is numeric.
     * This is the highest performing algorithm currently available, per https://jsperf.com/isnan-vs-typeof/5
     * @memberof Number
     * @param {*} n       A value to test
     * @return {boolean}  Is it a number?
     */
    function isNumeric(n) {
        if ( n instanceof Array ) return false;
        else if ( [null, ""].includes(n) ) return false;
        return +n === +n;
    }

    /**
     * Attempt to create a number from a user-provided string.
     * @memberof Number
     * @param {string|number} n   The value to convert; typically a string, but may already be a number.
     * @return {number}           The number that the string represents, or NaN if no number could be determined.
     */
    function fromString(n) {
        if ( typeof n === "number" ) return n;
        if ( (typeof n !== "string") || !n.length ) return NaN;
        n = n.replace(/\s+/g, "");
        return Number(n);
    }

    // Assign primitives to the Number prototype
    Object.assign(Number.prototype, {almostEqual, ordinalString, paddedString, signedString, toNearest, between});
    Object.assign(Number, {isNumeric, fromString});

    /**
     * Return the difference of two sets.
     * @param {Set} other       Some other set to compare against
     * @returns {Set}           The difference defined as objects in this which are not present in other
     */
    function difference(other) {
        if ( !(other instanceof Set) ) throw new Error("Some other Set instance must be provided.");
        const difference = new Set();
        for ( const element of this ) {
            if ( !other.has(element) ) difference.add(element);
        }
        return difference;
    }

    /**
     * Test whether this set is equal to some other set.
     * Sets are equal if they share the same members, independent of order
     * @param {Set} other       Some other set to compare against
     * @returns {boolean}       Are the sets equal?
     */
    function equals(other) {
        if ( !(other instanceof Set ) ) return false;
        if ( other.size !== this.size ) return false;
        for ( let element of this ) {
            if ( !other.has(element) ) return false;
        }
        return true;
    }

    /**
     * Return the first value from the set.
     * @returns {*}             The first element in the set, or undefined
     */
    function first() {
        return this.values().next().value;
    }

    /**
     * Return the intersection of two sets.
     * @param {Set} other       Some other set to compare against
     * @returns {Set}           The intersection of both sets
     */
    function intersection(other) {
        const n = new Set();
        for ( let element of this ) {
            if ( other.has(element) ) n.add(element);
        }
        return n;
    }

    /**
     * Test whether this set has an intersection with another set.
     * @param {Set} other       Another set to compare against
     * @returns {boolean}       Do the sets intersect?
     */
    function intersects(other) {
        for ( let element of this ) {
            if ( other.has(element) ) return true;
        }
        return false;
    }

    /**
     * Test whether this set is a subset of some other set.
     * A set is a subset if all its members are also present in the other set.
     * @param {Set} other       Some other set that may be a subset of this one
     * @returns {boolean}       Is the other set a subset of this one?
     */
    function isSubset(other) {
        if ( !(other instanceof Set ) ) return false;
        if ( other.size < this.size ) return false;
        for ( let element of this ) {
            if ( !other.has(element) ) return false;
        }
        return true;
    }

    /**
     * Convert a set to a JSON object by mapping its contents to an array
     * @returns {Array}           The set elements as an array.
     */
    function toObject() {
        return Array.from(this);
    }

    /**
     * Test whether every element in this Set satisfies a certain test criterion.
     * @see Array#every
     * @param {function(*,number,Set): boolean} test   The test criterion to apply. Positional arguments are the value,
     * the index of iteration, and the set being tested.
     * @returns {boolean}  Does every element in the set satisfy the test criterion?
     */
    function every(test) {
        let i = 0;
        for ( const v of this ) {
            if ( !test(v, i, this) ) return false;
            i++;
        }
        return true;
    }

    /**
     * Filter this set to create a subset of elements which satisfy a certain test criterion.
     * @see Array#filter
     * @param {function(*,number,Set): boolean} test  The test criterion to apply. Positional arguments are the value,
     * the index of iteration, and the set being filtered.
     * @returns {Set}  A new Set containing only elements which satisfy the test criterion.
     */
    function filter(test) {
        const filtered = new Set();
        let i = 0;
        for ( const v of this ) {
            if ( test(v, i, this) ) filtered.add(v);
            i++;
        }
        return filtered;
    }

    /**
     * Find the first element in this set which satisfies a certain test criterion.
     * @see Array#find
     * @param {function(*,number,Set): boolean} test  The test criterion to apply. Positional arguments are the value,
     * the index of iteration, and the set being searched.
     * @returns {*|undefined}  The first element in the set which satisfies the test criterion, or undefined.
     */
    function find(test) {
        let i = 0;
        for ( const v of this ) {
            if ( test(v, i, this) ) return v;
            i++;
        }
        return undefined;
    }

    /**
     * Create a new Set where every element is modified by a provided transformation function.
     * @see Array#map
     * @param {function(*,number,Set): boolean} transform  The transformation function to apply.Positional arguments are
     * the value, the index of iteration, and the set being transformed.
     * @returns {Set}  A new Set of equal size containing transformed elements.
     */
    function map(transform) {
        const mapped = new Set();
        let i = 0;
        for ( const v of this ) {
            mapped.add(transform(v, i, this));
            i++;
        }
        if ( mapped.size !== this.size ) {
            throw new Error("The Set#map operation illegally modified the size of the set");
        }
        return mapped;
    }

    /**
     * Create a new Set with elements that are filtered and transformed by a provided reducer function.
     * @see Array#reduce
     * @param {function(*,*,number,Set): *} reducer  A reducer function applied to each value. Positional
     * arguments are the accumulator, the value, the index of iteration, and the set being reduced.
     * @param {*} accumulator       The initial value of the returned accumulator.
     * @returns {*}                 The final value of the accumulator.
     */
    function reduce(reducer, accumulator) {
        let i = 0;
        for ( const v of this ) {
            accumulator = reducer(accumulator, v, i, this);
            i++;
        }
        return accumulator;
    }

    /**
     * Test whether any element in this Set satisfies a certain test criterion.
     * @see Array#some
     * @param {function(*,number,Set): boolean} test   The test criterion to apply. Positional arguments are the value,
     * the index of iteration, and the set being tested.
     * @returns {boolean}         Does any element in the set satisfy the test criterion?
     */
    function some(test) {
        let i = 0;
        for ( const v of this ) {
            if ( test(v, i, this) ) return true;
            i++;
        }
        return false;
    }

    // Assign primitives to Set prototype
    Object.assign(Set.prototype, {
        difference, equals, first, intersection, intersects, isSubset, toObject, every, filter, find, map, reduce, some
    });

    /**
     * Capitalize a string, transforming it's first character to a capital letter.
     * @returns {string}
     */
    function capitalize() {
        if ( !this.length ) return this;
        return this.charAt(0).toUpperCase() + this.slice(1);
    }

    /**
     * Convert a string to Title Case where the first letter of each word is capitalized.
     * @returns {string}
     */
    function titleCase() {
        if (!this.length) return this;
        return this.toLowerCase().split(' ').reduce((parts, word) => {
            if ( !word ) return parts;
            const title = word.replace(word[0], word[0].toUpperCase());
            parts.push(title);
            return parts;
        }, []).join(' ');
    }

    /**
     * Strip any script tags which were included within a provided string.
     * @returns {string}
     */
    function stripScripts() {
        let el = document.createElement("div");
        el.innerHTML = this;
        for ( let s of el.getElementsByTagName("script") ) {
            s.parentNode.removeChild(s);
        }
        return el.innerHTML;
    }

    /**
     * Transform any string into an url-viable slug string
     * @param {object} [options]      Optional arguments which customize how the slugify operation is performed
     * @param {string} [options.replacement="-"]  The replacement character to separate terms, default is '-'
     * @param {boolean} [options.strict=false]    Replace all non-alphanumeric characters, or allow them? Default false
     * @returns {string}              The slugified input string
     */
    function slugify({replacement='-', strict=false}={}) {

        // Map characters to lower case ASCII
        const charMap = JSON.parse('{"$":"dollar","%":"percent","&":"and","<":"less",">":"greater","|":"or","¢":"cent","£":"pound","¤":"currency","¥":"yen","©":"(c)","ª":"a","®":"(r)","º":"o","À":"A","Á":"A","Â":"A","Ã":"A","Ä":"A","Å":"A","Æ":"AE","Ç":"C","È":"E","É":"E","Ê":"E","Ë":"E","Ì":"I","Í":"I","Î":"I","Ï":"I","Ð":"D","Ñ":"N","Ò":"O","Ó":"O","Ô":"O","Õ":"O","Ö":"O","Ø":"O","Ù":"U","Ú":"U","Û":"U","Ü":"U","Ý":"Y","Þ":"TH","ß":"ss","à":"a","á":"a","â":"a","ã":"a","ä":"a","å":"a","æ":"ae","ç":"c","è":"e","é":"e","ê":"e","ë":"e","ì":"i","í":"i","î":"i","ï":"i","ð":"d","ñ":"n","ò":"o","ó":"o","ô":"o","õ":"o","ö":"o","ø":"o","ù":"u","ú":"u","û":"u","ü":"u","ý":"y","þ":"th","ÿ":"y","Ā":"A","ā":"a","Ă":"A","ă":"a","Ą":"A","ą":"a","Ć":"C","ć":"c","Č":"C","č":"c","Ď":"D","ď":"d","Đ":"DJ","đ":"dj","Ē":"E","ē":"e","Ė":"E","ė":"e","Ę":"e","ę":"e","Ě":"E","ě":"e","Ğ":"G","ğ":"g","Ģ":"G","ģ":"g","Ĩ":"I","ĩ":"i","Ī":"i","ī":"i","Į":"I","į":"i","İ":"I","ı":"i","Ķ":"k","ķ":"k","Ļ":"L","ļ":"l","Ľ":"L","ľ":"l","Ł":"L","ł":"l","Ń":"N","ń":"n","Ņ":"N","ņ":"n","Ň":"N","ň":"n","Ő":"O","ő":"o","Œ":"OE","œ":"oe","Ŕ":"R","ŕ":"r","Ř":"R","ř":"r","Ś":"S","ś":"s","Ş":"S","ş":"s","Š":"S","š":"s","Ţ":"T","ţ":"t","Ť":"T","ť":"t","Ũ":"U","ũ":"u","Ū":"u","ū":"u","Ů":"U","ů":"u","Ű":"U","ű":"u","Ų":"U","ų":"u","Ŵ":"W","ŵ":"w","Ŷ":"Y","ŷ":"y","Ÿ":"Y","Ź":"Z","ź":"z","Ż":"Z","ż":"z","Ž":"Z","ž":"z","ƒ":"f","Ơ":"O","ơ":"o","Ư":"U","ư":"u","ǈ":"LJ","ǉ":"lj","ǋ":"NJ","ǌ":"nj","Ș":"S","ș":"s","Ț":"T","ț":"t","˚":"o","Ά":"A","Έ":"E","Ή":"H","Ί":"I","Ό":"O","Ύ":"Y","Ώ":"W","ΐ":"i","Α":"A","Β":"B","Γ":"G","Δ":"D","Ε":"E","Ζ":"Z","Η":"H","Θ":"8","Ι":"I","Κ":"K","Λ":"L","Μ":"M","Ν":"N","Ξ":"3","Ο":"O","Π":"P","Ρ":"R","Σ":"S","Τ":"T","Υ":"Y","Φ":"F","Χ":"X","Ψ":"PS","Ω":"W","Ϊ":"I","Ϋ":"Y","ά":"a","έ":"e","ή":"h","ί":"i","ΰ":"y","α":"a","β":"b","γ":"g","δ":"d","ε":"e","ζ":"z","η":"h","θ":"8","ι":"i","κ":"k","λ":"l","μ":"m","ν":"n","ξ":"3","ο":"o","π":"p","ρ":"r","ς":"s","σ":"s","τ":"t","υ":"y","φ":"f","χ":"x","ψ":"ps","ω":"w","ϊ":"i","ϋ":"y","ό":"o","ύ":"y","ώ":"w","Ё":"Yo","Ђ":"DJ","Є":"Ye","І":"I","Ї":"Yi","Ј":"J","Љ":"LJ","Њ":"NJ","Ћ":"C","Џ":"DZ","А":"A","Б":"B","В":"V","Г":"G","Д":"D","Е":"E","Ж":"Zh","З":"Z","И":"I","Й":"J","К":"K","Л":"L","М":"M","Н":"N","О":"O","П":"P","Р":"R","С":"S","Т":"T","У":"U","Ф":"F","Х":"H","Ц":"C","Ч":"Ch","Ш":"Sh","Щ":"Sh","Ъ":"U","Ы":"Y","Ь":"","Э":"E","Ю":"Yu","Я":"Ya","а":"a","б":"b","в":"v","г":"g","д":"d","е":"e","ж":"zh","з":"z","и":"i","й":"j","к":"k","л":"l","м":"m","н":"n","о":"o","п":"p","р":"r","с":"s","т":"t","у":"u","ф":"f","х":"h","ц":"c","ч":"ch","ш":"sh","щ":"sh","ъ":"u","ы":"y","ь":"","э":"e","ю":"yu","я":"ya","ё":"yo","ђ":"dj","є":"ye","і":"i","ї":"yi","ј":"j","љ":"lj","њ":"nj","ћ":"c","ѝ":"u","џ":"dz","Ґ":"G","ґ":"g","Ғ":"GH","ғ":"gh","Қ":"KH","қ":"kh","Ң":"NG","ң":"ng","Ү":"UE","ү":"ue","Ұ":"U","ұ":"u","Һ":"H","һ":"h","Ә":"AE","ә":"ae","Ө":"OE","ө":"oe","฿":"baht","ა":"a","ბ":"b","გ":"g","დ":"d","ე":"e","ვ":"v","ზ":"z","თ":"t","ი":"i","კ":"k","ლ":"l","მ":"m","ნ":"n","ო":"o","პ":"p","ჟ":"zh","რ":"r","ს":"s","ტ":"t","უ":"u","ფ":"f","ქ":"k","ღ":"gh","ყ":"q","შ":"sh","ჩ":"ch","ც":"ts","ძ":"dz","წ":"ts","ჭ":"ch","ხ":"kh","ჯ":"j","ჰ":"h","Ẁ":"W","ẁ":"w","Ẃ":"W","ẃ":"w","Ẅ":"W","ẅ":"w","ẞ":"SS","Ạ":"A","ạ":"a","Ả":"A","ả":"a","Ấ":"A","ấ":"a","Ầ":"A","ầ":"a","Ẩ":"A","ẩ":"a","Ẫ":"A","ẫ":"a","Ậ":"A","ậ":"a","Ắ":"A","ắ":"a","Ằ":"A","ằ":"a","Ẳ":"A","ẳ":"a","Ẵ":"A","ẵ":"a","Ặ":"A","ặ":"a","Ẹ":"E","ẹ":"e","Ẻ":"E","ẻ":"e","Ẽ":"E","ẽ":"e","Ế":"E","ế":"e","Ề":"E","ề":"e","Ể":"E","ể":"e","Ễ":"E","ễ":"e","Ệ":"E","ệ":"e","Ỉ":"I","ỉ":"i","Ị":"I","ị":"i","Ọ":"O","ọ":"o","Ỏ":"O","ỏ":"o","Ố":"O","ố":"o","Ồ":"O","ồ":"o","Ổ":"O","ổ":"o","Ỗ":"O","ỗ":"o","Ộ":"O","ộ":"o","Ớ":"O","ớ":"o","Ờ":"O","ờ":"o","Ở":"O","ở":"o","Ỡ":"O","ỡ":"o","Ợ":"O","ợ":"o","Ụ":"U","ụ":"u","Ủ":"U","ủ":"u","Ứ":"U","ứ":"u","Ừ":"U","ừ":"u","Ử":"U","ử":"u","Ữ":"U","ữ":"u","Ự":"U","ự":"u","Ỳ":"Y","ỳ":"y","Ỵ":"Y","ỵ":"y","Ỷ":"Y","ỷ":"y","Ỹ":"Y","ỹ":"y","‘":"\'","’":"\'","“":"\\\"","”":"\\\"","†":"+","•":"*","…":"...","₠":"ecu","₢":"cruzeiro","₣":"french franc","₤":"lira","₥":"mill","₦":"naira","₧":"peseta","₨":"rupee","₩":"won","₪":"new shequel","₫":"dong","€":"euro","₭":"kip","₮":"tugrik","₯":"drachma","₰":"penny","₱":"peso","₲":"guarani","₳":"austral","₴":"hryvnia","₵":"cedi","₸":"kazakhstani tenge","₹":"indian rupee","₽":"russian ruble","₿":"bitcoin","℠":"sm","™":"tm","∂":"d","∆":"delta","∑":"sum","∞":"infinity","♥":"love","元":"yuan","円":"yen","﷼":"rial"}');
        let slug = this.split("").reduce((result, char) => {
            return result + (charMap[char] || char);
        }, "").trim().toLowerCase();

        // Convert any spaces to the replacement character and de-dupe
        slug = slug.replace(new RegExp('[\\s' + replacement + ']+', 'g'), replacement);

        // If we're being strict, replace anything that is not alphanumeric
        if (strict) {
            slug = slug.replace(new RegExp('[^a-zA-Z0-9' + replacement + ']', 'g'), '');
        }
        return slug;
    }

    // Assign primitives to String prototype
    Object.assign(String.prototype, {capitalize, titleCase, stripScripts, slugify});

    /**
     * Escape a given input string, prefacing special characters with backslashes for use in a regular expression
     * @param {string} string     The un-escaped input string
     * @returns {string}          The escaped string, suitable for use in regular expression
     */
    function escape(string) {
        return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }
    RegExp.escape = escape;

    /**
     * Attempt to parse a URL without throwing an error.
     * @param {string} url  The string to parse.
     * @returns {URL|null}  The parsed URL if successful, otherwise null.
     */
    function parseSafe(url) {
        try {
            return new URL(url);
        } catch (err) {}
        return null;
    }

    Object.assign(URL, {parseSafe});

    /**
     * A reusable storage concept which blends the functionality of an Array with the efficient key-based lookup of a Map.
     * This concept is reused throughout Foundry VTT where a collection of uniquely identified elements is required.
     * @extends {Map}
     * @type {Map}
     */
    class Collection extends Map {
        constructor(entries) {
            super(entries);
        }

        /* -------------------------------------------- */

        /**
         * When iterating over a Collection, we should iterate over its values instead of over its entries
         */
        [Symbol.iterator]() {
            return this.values();
        }

        /* -------------------------------------------- */

        /**
         * Return an Array of all the entry values in the Collection
         * @type {Array<*>}
         */
        get contents() {
            return Array.from(this.values());
        }

        /* -------------------------------------------- */

        /**
         * Find an entry in the Map using a functional condition.
         * @see {Array#find}
         * @param {function(*,number,Collection): boolean} condition  The functional condition to test. Positional
         * arguments are the value, the index of iteration, and the collection being searched.
         * @return {*}  The value, if found, otherwise undefined
         *
         * @example Create a new Collection and reference its contents
         * ```js
         * let c = new Collection([["a", "A"], ["b", "B"], ["c", "C"]]);
         * c.get("a") === c.find(entry => entry === "A"); // true
         * ```
         */
        find(condition) {
            let i = 0;
            for ( let v of this.values() ) {
                if ( condition(v, i, this) ) return v;
                i++;
            }
            return undefined;
        }

        /* -------------------------------------------- */

        /**
         * Filter the Collection, returning an Array of entries which match a functional condition.
         * @see {Array#filter}
         * @param {function(*,number,Collection): boolean} condition  The functional condition to test. Positional
         * arguments are the value, the index of iteration, and the collection being filtered.
         * @return {Array<*>}           An Array of matched values
         *
         * @example Filter the Collection for specific entries
         * ```js
         * let c = new Collection([["a", "AA"], ["b", "AB"], ["c", "CC"]]);
         * let hasA = c.filters(entry => entry.slice(0) === "A");
         * ```
         */
        filter(condition) {
            const entries = [];
            let i = 0;
            for ( let v of this.values() ) {
                if ( condition(v, i , this) ) entries.push(v);
                i++;
            }
            return entries;
        }

        /* -------------------------------------------- */

        /**
         * Apply a function to each element of the collection
         * @see Array#forEach
         * @param {function(*): void} fn       A function to apply to each element
         *
         * @example Apply a function to each value in the collection
         * ```js
         * let c = new Collection([["a", {active: false}], ["b", {active: false}], ["c", {active: false}]]);
         * c.forEach(e => e.active = true);
         * ```
         */
        forEach(fn) {
            for ( let e of this.values() ) {
                fn(e);
            }
        }

        /* -------------------------------------------- */

        /**
         * Get an element from the Collection by its key.
         * @param {string} key      The key of the entry to retrieve
         * @param {object} [options]  Additional options that affect how entries are retrieved
         * @param {boolean} [options.strict=false] Throw an Error if the requested key does not exist. Default false.
         * @return {*|undefined}    The retrieved entry value, if the key exists, otherwise undefined
         *
         * @example Get an element from the Collection by key
         * ```js
         * let c = new Collection([["a", "Alfred"], ["b", "Bob"], ["c", "Cynthia"]]);
         * c.get("a"); // "Alfred"
         * c.get("d"); // undefined
         * c.get("d", {strict: true}); // throws Error
         * ```
         */
        get(key, {strict=false}={}) {
            const entry = super.get(key);
            if ( strict && (entry === undefined) ) {
                throw new Error(`The key ${key} does not exist in the ${this.constructor.name} Collection`);
            }
            return entry;
        }

        /* -------------------------------------------- */

        /**
         * Get an entry from the Collection by name.
         * Use of this method assumes that the objects stored in the collection have a "name" attribute.
         * @param {string} name       The name of the entry to retrieve
         * @param {object} [options]  Additional options that affect how entries are retrieved
         * @param {boolean} [options.strict=false] Throw an Error if the requested name does not exist. Default false.
         * @return {*}                The retrieved entry value, if one was found, otherwise undefined
         *
         * @example Get an element from the Collection by name (if applicable)
         * ```js
         * let c = new Collection([["a", "Alfred"], ["b", "Bob"], ["c", "Cynthia"]]);
         * c.getName("Alfred"); // "Alfred"
         * c.getName("D"); // undefined
         * c.getName("D", {strict: true}); // throws Error
         * ```
         */
        getName(name, {strict=false} = {}) {
            const entry = this.find(e => e.name === name);
            if ( strict && (entry === undefined) ) {
                throw new Error(`An entry with name ${name} does not exist in the collection`);
            }
            return entry ?? undefined;
        }

        /* -------------------------------------------- */

        /**
         * Transform each element of the Collection into a new form, returning an Array of transformed values
         * @param {function(*,number,Collection): *} transformer  A transformation function applied to each entry value.
         * Positional arguments are the value, the index of iteration, and the collection being mapped.
         * @return {Array<*>}  An Array of transformed values
         */
        map(transformer) {
            const transformed = [];
            let i = 0;
            for ( let v of this.values() ) {
                transformed.push(transformer(v, i, this));
                i++;
            }
            return transformed;
        }

        /* -------------------------------------------- */

        /**
         * Reduce the Collection by applying an evaluator function and accumulating entries
         * @see {Array#reduce}
         * @param {function(*,*,number,Collection): *} reducer  A reducer function applied to each entry value. Positional
         * arguments are the accumulator, the value, the index of iteration, and the collection being reduced.
         * @param {*} initial             An initial value which accumulates with each iteration
         * @return {*}                    The accumulated result
         *
         * @example Reduce a collection to an array of transformed values
         * ```js
         * let c = new Collection([["a", "A"], ["b", "B"], ["c", "C"]]);
         * let letters = c.reduce((s, l) => {
         *   return s + l;
         * }, ""); // "ABC"
         * ```
         */
        reduce(reducer, initial) {
            let accumulator = initial;
            let i = 0;
            for ( let v of this.values() ) {
                accumulator = reducer(accumulator, v, i, this);
                i++;
            }
            return accumulator;
        }

        /* -------------------------------------------- */

        /**
         * Test whether a condition is met by some entry in the Collection.
         * @see {Array#some}
         * @param {function(*,number,Collection): boolean} condition  The functional condition to test. Positional
         * arguments are the value, the index of iteration, and the collection being tested.
         * @return {boolean}  Was the test condition passed by at least one entry?
         */
        some(condition) {
            let i = 0;
            for ( let v of this.values() ) {
                const pass = condition(v, i, this);
                i++;
                if ( pass ) return true;
            }
            return false;
        }

        /* -------------------------------------------- */

        /**
         * Convert the Collection to a primitive array of its contents.
         * @returns {object[]}  An array of contained values
         */
        toJSON() {
            return this.map(e => e.toJSON ? e.toJSON() : e);
        }
    }

    /**
     * An extension of the Collection.
     * Used for the specific task of containing embedded Document instances within a parent Document.
     */
    class EmbeddedCollection extends Collection {
        /**
         * @param {DataModel} model           The parent DataModel instance to which this collection belongs
         * @param {object[]} sourceArray      The source data array for the collection in the parent Document data
         * @param {typeof foundry.abstract.Document} documentClass The Document class contained in the collection
         */
        constructor(model, sourceArray, documentClass) {
            super();
            this.#model = model;
            Object.defineProperty(this, "_source", {value: sourceArray, writable: false});
            Object.defineProperty(this, "documentClass", {value: documentClass, writable: false});
        }

        /**
         * The Document implementation used to construct instances within this collection.
         * @type {typeof foundry.abstract.Document}
         */
        documentClass;

        /**
         * The parent DataModel to which this EmbeddedCollection instance belongs.
         * @type {DataModel}
         * @private
         */
        #model;

        /**
         * Has this embedded collection been initialized as a one-time workflow?
         * @type {boolean}
         */
        #initialized = false;

        /**
         * The source data array from which the embedded collection is created
         * @type {object[]}
         * @private
         */
        _source;

        /**
         * Record the set of document ids where the Document was not initialized because of invalid source data
         * @type {Set<string>}
         */
        invalidDocumentIds = new Set();

        /* -------------------------------------------- */

        /**
         * Initialize the EmbeddedCollection object by constructing its contained Document instances
         * @param {object} [options]  Initialization options.
         * @param {boolean} [options.strict=true]  Whether to log an error or a warning when encountering invalid embedded
         *                                         documents.
         */
        initialize({strict=true, ...options}={}) {

            // Repeat initialization
            if ( this.#initialized ) {
                for ( const doc of this ) {
                    doc._initialize();
                }
                return;
            }

            // First-time initialization
            this.clear();
            const docName = this.documentClass["documentName"];
            const parent = this.#model;
            const parentName = this.#model["documentName"] ?? this.#model["name"];
            for ( let d of this._source ) {
                if ( !d._id ) d._id = randomID(16);
                let doc;
                try {
                    doc = new this.documentClass(d, {parent});
                    this.set(doc.id, doc, {modifySource: false});
                } catch(err) {
                    this.invalidDocumentIds.add(d._id);
                    err.message = `Failed to initialized ${docName} [${d._id}] in ${parentName} [${parent._id}]: ${err.message}`;
                    if ( strict ) globalThis.logger.error(err);
                    else globalThis.logger.warn(err);
                    if ( globalThis.Hooks && strict ) {
                        Hooks.onError("EmbeddedCollection#_initialize", err, {id: d._id, documentName: docName});
                    }
                }
            }
            this.#initialized = true;
        }

        /* ---------------------------------------- */

        /** @inheritdoc */
        set(key, value, {modifySource=true}={}) {
            if ( modifySource && !this.has(key) ) this._source.push(value._source);
            return super.set(key, value);
        }

        /* ---------------------------------------- */

        /** @inheritdoc */
        delete(key, {modifySource=true}={}) {
            if ( modifySource && this.has(key) ) this._source.findSplice(d => d._id === key);
            return super.delete(key);
        }

        /* ---------------------------------------- */

        /**
         * Update an EmbeddedCollection using an array of provided document data.
         * @param {DataModel[]} changes         An array of provided Document data
         * @param {object} [options={}]         Additional options which modify how the collection is updated
         */
        update(changes, options={}) {
            const currentIds = Array.from(this.keys());
            const updated = new Set();

            // Create or update documents within the collection
            for ( let data of changes ) {
                if ( !data._id ) data._id = randomID(16);
                const current = this.get(data._id);
                if ( current ) current.updateSource(data, options);
                else {
                    const doc = new this.documentClass(data, {parent: this.#model});
                    this.set(doc.id, doc);
                }
                updated.add(data._id);
            }

            // If the update was not recursive, remove all non-updated documents
            if ( options.recursive === false ) {
                for ( let id of currentIds ) {
                    if ( !updated.has(id) ) this.delete(id);
                }
            }
        }

        /* ---------------------------------------- */

        /**
         * Obtain a temporary Document instance for a document id which currently has invalid source data.
         * @param {string} id         A document ID with invalid source data.
         * @returns {Document}        An in-memory instance for the invalid Document
         */
        getInvalid(id) {
            if ( !this.invalidDocumentIds.has(id) ) {
                throw new Error(`${this.constructor.documentName} id [${id}] is not in the set of invalid ids`);
            }
            const data = this._source.find(d => d._id === id);
            return this.documentClass.fromSource(data, {parent: this.#model});
        }

        /* ---------------------------------------- */

        /**
         * Convert the EmbeddedCollection to an array of simple objects.
         * @param {boolean} [source=true]     Draw data for contained Documents from the underlying data source?
         * @returns {object[]}                The extracted array of primitive objects
         */
        toObject(source=true) {
            const arr = [];
            for ( let doc of this.values() ) {
                arr.push(doc.toObject(source));
            }
            return arr;
        }
    }

    /** @module validators */

    /**
     * Test whether a string is a valid 16 character UID
     * @param {string} id
     * @return {boolean}
     */
    function isValidId(id) {
        return /^[a-zA-Z0-9]{16}$/.test(id);
    }

    /**
     * Test whether a file path has an extension in a list of provided extensions
     * @param {string} path
     * @param {string[]} extensions
     * @return {boolean}
     */
    function hasFileExtension(path, extensions) {
        const xts = extensions.map(ext => `\\.${ext}`).join("|");
        const rgx = new RegExp(`(${xts})(\\?.*)?$`, "i");
        return !!path && rgx.test(path);
    }

    /**
     * Test whether a string data blob contains base64 data, optionally of a specific type or types
     * @param {string} data       The candidate string data
     * @param {string[]} [types]  An array of allowed mime types to test
     * @return {boolean}
     */
    function isBase64Data(data, types) {
        if ( types === undefined ) return /^data:([a-z]+)\/([a-z]+);base64,/.test(data);
        return types.some(type => data.startsWith(`data:${type};base64,`))
    }

    /**
     * Test whether an input represents a valid 6-character color string
     * @param {string} color      The input string to test
     * @return {boolean}          Is the string a valid color?
     */
    function isColorString(color) {
        return /#[0-9A-Fa-f]{6}/.test(color);
    }

    /**
     * Assert that the given value parses as a valid JSON string
     * @param {string} val        The value to test
     * @return {boolean}          Is the String valid JSON?
     */
    function isJSON(val) {
        try {
            JSON.parse(val);
            return true;
        } catch(err) {
            return false;
        }
    }

    var validators = /*#__PURE__*/Object.freeze({
        __proto__: null,
        isValidId: isValidId,
        hasFileExtension: hasFileExtension,
        isBase64Data: isBase64Data,
        isColorString: isColorString,
        isJSON: isJSON
    });

    /**
     * This module contains data field classes which are used to define a data schema.
     * A data field is responsible for cleaning, validation, and initialization of the value assigned to it.
     * Each data field extends the [DataField]{@link DataField} class to implement logic specific to its
     * contained data type.
     * @module fields
     */

    /* ---------------------------------------- */
    /*  Abstract Data Field                     */
    /* ---------------------------------------- */

    /**
     * @typedef {Object} DataFieldOptions
     * @property {boolean} [required=false]   Is this field required to be populated?
     * @property {boolean} [nullable=false]   Can this field have null values?
     * @property {Function|*} [initial]       The initial value of a field, or a function which assigns that initial value.
     * @property {Function} [validate]        A data validation function which accepts one argument with the current value.
     * @property {string} [label]             A localizable label displayed on forms which render this field.
     * @property {string} [hint]              Localizable help text displayed on forms which render this field.
     * @property {string} [validationError]   A custom validation error string. When displayed will be prepended with the
     *                                        document name, field name, and candidate value.
     */

    /**
     * An abstract class that defines the base pattern for a data field within a data schema.
     * @abstract
     *
     * @property {string} name                The name of this data field within the schema that contains it
     *
     * @property {boolean} required=false     Is this field required to be populated?
     * @property {boolean} nullable=false     Can this field have null values?
     * @property {Function|*} initial         The initial value of a field, or a function which assigns that initial value.
     * @property {Function} validate          A data validation function which accepts one argument with the current value.
     * @property {boolean} [readonly=false]   Should the prepared value of the field be read-only, preventing it from being
     *                                        changed unless a change to the _source data is applied.
     * @property {string} label               A localizable label displayed on forms which render this field.
     * @property {string} hint                Localizable help text displayed on forms which render this field.
     * @property {string} validationError     A custom validation error string. When displayed will be prepended with the
     *                                        document name, field name, and candidate value.
     */
    class DataField {
        /**
         * @param {DataFieldOptions} options    Options which configure the behavior of the field
         */
        constructor(options={}) {
            /**
             * The initially provided options which configure the data field
             * @type {DataFieldOptions}
             */
            this.options = options;
            for ( let k in this.constructor._defaults ) {
                this[k] = k in this.options ? this.options[k] : this.constructor._defaults[k];
            }
        }

        /**
         * The field name of this DataField instance.
         * This is assigned by SchemaField#initialize.
         * @internal
         */
        name;

        /**
         * A reference to the parent schema to which this DataField belongs.
         * This is assigned by SchemaField#initialize.
         * @internal
         */
        parent;

        /**
         * Default parameters for this field type
         * @return {DataFieldOptions}
         * @protected
         */
        static get _defaults() {
            return {
                required: false,
                nullable: false,
                initial: undefined,
                readonly: false,
                label: "",
                hint: "",
                validationError: "is not a valid value"
            }
        }

        /**
         * A dot-separated string representation of the field path within the parent schema.
         * @type {string}
         */
        get fieldPath() {
            return [this.parent?.fieldPath, this.name].filterJoin(".");
        }

        /**
         * Apply a function to this DataField which propagates through recursively to any contained data schema.
         * @param {string|function} fn          The function to apply
         * @param {*} value                     The current value of this field
         * @param {object} [options={}]         Additional options passed to the applied function
         * @returns {object}                    The results object
         */
        apply(fn, value, options={}) {
            if ( typeof fn === "string" ) fn = this[fn];
            return fn.call(this, value, options);
        }

        /* -------------------------------------------- */
        /*  Field Cleaning                              */
        /* -------------------------------------------- */

        /**
         * Coerce source data to ensure that it conforms to the correct data type for the field.
         * Data coercion operations should be simple and synchronous as these are applied whenever a DataModel is constructed.
         * For one-off cleaning of user-provided input the sanitize method should be used.
         * @param {*} value           The initial value
         * @param {object} [options]  Additional options for how the field is cleaned
         * @param {boolean} [options.partial]   Whether to perform partial cleaning?
         * @param {object} [options.source]     The root data model being cleaned
         * @returns {*}               The cast value
         */
        clean(value, options) {

            // Permit explicitly null values for nullable fields
            if ( value === null ) {
                if ( this.nullable ) return value;
                value = undefined;
            }

            // Get an initial value for the field
            if ( value === undefined ) return this.getInitialValue(options.source);

            // Cast a provided value to the correct type
            value = this._cast(value);

            // Cleaning logic specific to the DataField.
            return this._cleanType(value, options);
        }

        /* -------------------------------------------- */

        /**
         * Apply any cleaning logic specific to this DataField type.
         * @param {*} value           The appropriately coerced value.
         * @param {object} [options]  Additional options for how the field is cleaned.
         * @returns {*}               The cleaned value.
         * @protected
         */
        _cleanType(value, options) {
            return value;
        }

        /* -------------------------------------------- */

        /**
         * Cast a non-default value to ensure it is the correct type for the field
         * @param {*} value       The provided non-default value
         * @returns {*}           The standardized value
         * @protected
         */
        _cast(value) {
            throw new Error(`Subclasses of DataField must implement the _cast method`);
        }

        /* -------------------------------------------- */

        /**
         * Attempt to retrieve a valid initial value for the DataField.
         * @param {object} data   The source data object for which an initial value is required
         * @returns {*}           A valid initial value
         * @throws                An error if there is no valid initial value defined
         */
        getInitialValue(data) {
            return this.initial instanceof Function ? this.initial(data) : this.initial;
        }

        /* -------------------------------------------- */
        /*  Field Validation                            */
        /* -------------------------------------------- */

        /**
         * Validate a candidate input for this field, ensuring it meets the field requirements.
         * A validation failure can be provided as a raised Error (with a string message) or by returning false.
         * A validator which returns true denotes that the result is certainly valid and further validations are unnecessary.
         * @param {*} value                        The initial value
         * @param {object} [options={}]            Options which affect validation behavior
         * @returns {ModelValidationError}         Returns a ModelValidationError if a validation failure occurred
         */
        validate(value, options={}) {
            const validators = [this._validateSpecial, this._validateType];
            if ( this.options.validate ) validators.push(this.options.validate);
            try {
                for ( const validator of validators ) {
                    const isValid = validator.call(this, value, options);
                    if ( isValid === true ) return undefined;
                    if ( isValid === false ) return new ModelValidationError(this.validationError);
                }
            } catch(err) {
                if ( err instanceof ModelValidationError ) return err;
                const mve = new ModelValidationError(err.message);
                mve.stack = err.stack;
                return mve;
            }
        }

        /* -------------------------------------------- */

        /**
         * Special validation rules which supersede regular field validation.
         * This validator screens for certain values which are otherwise incompatible with this field like null or undefined.
         * @param {*} value               The candidate value
         * @returns {boolean|void}        A boolean to indicate with certainty whether the value is valid.
         *                                Otherwise, return void.
         * @throws                        May throw a specific error if the value is not valid
         * @protected
         */
        _validateSpecial(value) {

            // Allow null values for explicitly nullable fields
            if ( value === null ) {
                if ( this.nullable ) return true;
                else throw new Error("may not be null");
            }

            // Allow undefined if the field is not required
            if ( value === undefined ) {
                if ( this.required ) throw new Error("may not be undefined");
                else return true;
            }
        }

        /* -------------------------------------------- */

        /**
         * A default type-specific validator that can be overridden by child classes
         * @param {*} value               The candidate value
         * @param {object} [options={}]   Options which affect validation behavior
         * @returns {boolean|void}        A boolean to indicate with certainty whether the value is valid.
         *                                Otherwise, return void.
         * @throws                        May throw a specific error if the value is not valid
         * @protected
         */
        _validateType(value, options={}) {}

        /* -------------------------------------------- */
        /*  Initialization and Serialization            */
        /* -------------------------------------------- */

        /**
         * Initialize the original source data into a mutable copy for the DataModel instance.
         * @param {*} value                   The source value of the field
         * @param {Object} model              The DataModel instance that this field belongs to
         * @param {object} [options]          Initialization options
         * @returns {*}                       An initialized copy of the source data
         */
        initialize(value, model, options={}) {
            return value;
        }

        /**
         * Export the current value of the field into a serializable object.
         * @param {*} value                   The initialized value of the field
         * @returns {*}                       An exported representation of the field
         */
        toObject(value) {
            return value;
        }
    }

    /* -------------------------------------------- */
    /*  Data Schema Field                           */
    /* -------------------------------------------- */

    /**
     * A special class of {@link DataField} which defines a data schema.
     */
    class SchemaField extends DataField {
        /**
         * @param {DataSchema} fields                 The contained field definitions
         * @param {DataFieldOptions} options          Options which configure the behavior of the field
         */
        constructor(fields, options={}) {
            super(options);
            this.fields = this._initialize(fields);
            if ( !("initial" in options) ) this.initial = () => this.clean({});
        }

        /* -------------------------------------------- */

        /** @inheritdoc */
        static get _defaults() {
            return mergeObject(super._defaults, {
                required: true,
                nullable: false,
                initial: {}
            });
        }

        /* -------------------------------------------- */

        /**
         * The contained field definitions.
         * @type {DataSchema}
         */
        fields;

        /* -------------------------------------------- */

        /**
         * Initialize and validate the structure of the provided field definitions.
         * @param {DataSchema} fields     The provided field definitions
         * @returns {DataSchema}          The validated schema
         * @protected
         */
        _initialize(fields) {
            if ( (typeof fields !== "object") ) {
                throw new Error("A DataFields must be an object with string keys and DataField values.");
            }
            for ( const [name, field] of Object.entries(fields) ) {
                if ( !(field instanceof DataField) ) {
                    throw new Error(`The "${name}" field is not an instance of the DataField class.`);
                }
                if ( field.parent !== undefined ) {
                    throw new Error(`The "${field.fieldPath}" field already belongs to some other parent and may not be reused.`);
                }
                field.name = name;
                field.parent = this;
            }
            return fields;
        }

        /* -------------------------------------------- */
        /*  Schema Iteration                            */
        /* -------------------------------------------- */

        /**
         * Iterate over a SchemaField by iterating over its fields.
         * @type {Iterable<DataField>}
         */
        *[Symbol.iterator]() {
            for ( const field of Object.values(this.fields) ) {
                yield field;
            }
        }

        /**
         * An array of field names which are present in the schema.
         * @returns {string[]}
         */
        keys() {
            return Object.keys(this.fields);
        }

        /**
         * An array of DataField instances which are present in the schema.
         * @returns {DataField[]}
         */
        values() {
            return Object.values(this.fields);
        }

        /**
         * An array of [name, DataField] tuples which define the schema.
         * @returns {Array<[string, DataField]>}
         */
        entries() {
            return Object.entries(this.fields);
        }

        /**
         * Test whether a certain field name belongs to this schema definition.
         * @param {string} fieldName    The field name
         * @returns {boolean}           Does the named field exist in this schema?
         */
        has(fieldName) {
            return fieldName in this.fields;
        }

        /**
         * Get a DataField instance from the schema by name
         * @param {string} fieldName    The field name
         * @returns {DataField}         The DataField instance or undefined
         */
        get(fieldName) {
            return this.fields[fieldName];
        }

        /* -------------------------------------------- */
        /*  Data Field Methods                          */
        /* -------------------------------------------- */

        /** @override */
        _cast(value) {
            return typeof value === "object" ? value : {};
        }

        /* -------------------------------------------- */

        /** @inheritdoc */
        _cleanType(data, options={}) {
            options.source = options.source || data;

            // Clean each field which belongs to the schema
            for ( const [name, field] of this.entries() ) {
                if ( !(name in data) && options.partial ) continue;
                data[name] = field.clean(data[name], options);
            }

            // Delete any keys which do not
            for ( const k of Object.keys(data) ) {
                if ( !this.has(k) ) delete data[k];
            }
            return data;
        }

        /* -------------------------------------------- */

        /** @override */
        initialize(value, model, options={}) {
            if ( !value ) return value;
            const data = {};
            for ( let [name, field] of this.entries() ) {
                const v = field.initialize(value[name], model, options);

                // Readonly fields
                if ( field.readonly ) {
                    Object.defineProperty(data, name, {value: v, writable: false});
                }

                // Getter fields
                else if ( (typeof v === "function") && !v.prototype ) {
                    Object.defineProperty(data, name, {get: v, set() {}, configurable: true});
                }

                // Writable fields
                else data[name] = v;
            }
            return data;
        }

        /* -------------------------------------------- */

        /** @override */
        _validateType(data, options={}) {
            if ( !(data instanceof Object) ) throw new Error("must be an object");
            options.source = options.source || data;
            const errors = {};
            for ( const [key, field] of this.entries() ) {
                if ( options.partial && !(key in data) ) continue;

                // Validate the field's current value
                const value = data[key];
                const error = field.validate(value, options);

                // Errors may be permitted if fallback replacement is allowed
                if ( error ) {
                    if ( options.fallback ) {
                        const initial = field.getInitialValue(options.source);
                        if ( field.validate(initial, {source: options.source}) !== undefined ) errors[field.fieldPath] = error;
                        else data[key] = initial;
                    }

                    // Otherwise, record validation failures
                    else errors[field.fieldPath] = error;
                }
            }
            if ( !isEmpty(errors) ) {
                throw new ModelValidationError(errors);
            }
        }

        /* -------------------------------------------- */

        /** @override */
        toObject(value) {
            const data = {};
            for ( const [name, field] of this.entries() ) {
                data[name] = field.toObject(value[name]);
            }
            return data;
        }

        /* -------------------------------------------- */

        /** @override */
        apply(fn, data={}, options={}) {
            const results = {};
            for ( const [key, field] of this.entries() ) {
                if ( options.partial && !(key in data) ) continue;
                const r = field.apply(fn, data[key], options);
                if ( !options.filter || !isEmpty(r) ) results[key] = r;
            }
            return results;
        }
    }

    /* -------------------------------------------- */
    /*  Basic Field Types                           */
    /* -------------------------------------------- */

    /**
     * A subclass of [DataField]{@link DataField} which deals with boolean-typed data.
     */
    class BooleanField extends DataField {

        /** @inheritdoc */
        static get _defaults() {
            return mergeObject(super._defaults, {
                required: true,
                nullable: false,
                initial: false
            });
        }

        /** @override */
        _cast(value) {
            if ( typeof value === "string" ) return value === "true";
            if ( typeof value === "object" ) return false;
            return Boolean(value);
        }

        /** @override */
        _validateType(value) {
            if (typeof value !== "boolean") throw new Error("must be a boolean");
        }
    }

    /* ---------------------------------------- */

    /**
     * @typedef {DataFieldOptions} NumberFieldOptions
     * @property {number} [min]               A minimum allowed value
     * @property {number} [max]               A maximum allowed value
     * @property {number} [step]              A permitted step size
     * @property {boolean} [integer=false]    Must the number be an integer?
     * @property {number} [positive=false]    Must the number be positive?
     * @property {number[]|object|function} [choices]  An array of values or an object of values/labels which represent
     *                                        allowed choices for the field. A function may be provided which dynamically
     *                                        returns the array of choices.
     */

    /**
     * A subclass of [DataField]{@link DataField} which deals with number-typed data.
     *
     * @property {number} min                 A minimum allowed value
     * @property {number} max                 A maximum allowed value
     * @property {number} step                A permitted step size
     * @property {boolean} integer=false      Must the number be an integer?
     * @property {number} positive=false      Must the number be positive?
     * @property {number[]|object|function} [choices]  An array of values or an object of values/labels which represent
     *                                        allowed choices for the field. A function may be provided which dynamically
     *                                        returns the array of choices.
     */
    class NumberField extends DataField {
        /**
         * @param {NumberFieldOptions} options  Options which configure the behavior of the field
         */
        constructor(options={}) {
            super(options);
            // If choices are provided, the field should not be null by default
            if ( this.choices ) {
                this.nullable = options.nullable ?? false;
            }
        }

        /** @inheritdoc */
        static get _defaults() {
            return mergeObject(super._defaults, {
                initial: null,
                nullable: true,
                min: undefined,
                max: undefined,
                step: undefined,
                integer: false,
                positive: false,
                choices: undefined
            });
        }

        /** @override */
        _cast(value) {
            return Number(value);
        }

        /** @inheritdoc */
        _cleanType(value, options) {
            value = super._cleanType(value, options);
            if ( typeof value !== "number" ) return value;
            if ( this.integer ) value = Math.round(value);
            if ( this.positive ) value = Math.abs(value);
            if ( Number.isFinite(this.min) ) value = Math.max(value, this.min);
            if ( Number.isFinite(this.max) ) value = Math.min(value, this.max);
            if ( Number.isFinite(this.step) ) value = value.toNearest(this.step);
            return value;
        }

        /** @override */
        _validateType(value) {
            if ( typeof value !== "number" ) throw new Error("must be a number");
            if ( this.positive && (value <= 0) ) throw new Error("must be a positive number");
            if ( Number.isFinite(this.min) && (value < this.min) ) throw new Error(`must be at least ${this.min}`);
            if ( Number.isFinite(this.max) && (value > this.max) ) throw new Error(`must be at most ${this.max}`);
            if ( Number.isFinite(this.step) && (value.toNearest(this.step) !== value) ) {
                throw new Error(`must be an increment of ${this.step}`);
            }
            if ( this.choices && !this.#isValidChoice(value) ) throw new Error(`${value} is not a valid choice`);
            if ( this.integer ) {
                if ( !Number.isInteger(value) ) throw new Error("must be an integer");
            }
            else if ( !Number.isFinite(value) ) throw new Error("must be a finite number");
        }

        /**
         * Test whether a provided value is a valid choice from the allowed choice set
         * @param {number} value      The provided value
         * @returns {boolean}         Is the choice valid?
         */
        #isValidChoice(value) {
            let choices = this.choices;
            if ( choices instanceof Function ) choices = choices();
            if ( choices instanceof Array ) return choices.includes(value);
            return String(value) in choices;
        }
    }

    /* ---------------------------------------- */

    /**
     * @typedef {DataFieldOptions} StringFieldOptions
     * @property {boolean} [blank=true]       Is the string allowed to be blank (empty)?
     * @property {boolean} [trim=true]        Should any provided string be trimmed as part of cleaning?
     * @property {string[]|object|function} [choices]  An array of values or an object of values/labels which represent
     *                                        allowed choices for the field. A function may be provided which dynamically
     *                                        returns the array of choices.
     */

    /**
     * A subclass of [DataField]{@link DataField} which deals with string-typed data.
     *
     * @property {boolean} blank=true         Is the string allowed to be blank (empty)?
     * @property {boolean} trim=true          Should any provided string be trimmed as part of cleaning?
     * @property {string[]|object|function} [choices]  An array of values or an object of values/labels which represent
     *                                        allowed choices for the field. A function may be provided which dynamically
     *                                        returns the array of choices.
     */
    class StringField extends DataField {
        /**
         * @param {StringFieldOptions} options  Options which configure the behavior of the field
         */
        constructor(options={}) {
            super(options);
            // If choices are provided, the field should not be null or blank by default
            if ( this.choices ) {
                this.nullable = options.nullable ?? false;
                this.blank = options.blank ?? false;
            }
        }

        /** @inheritdoc */
        static get _defaults() {
            return mergeObject(super._defaults, {
                initial: "",
                blank: true,
                trim: true,
                nullable: false,
                choices: undefined
            });
        }

        /** @inheritdoc */
        clean(value, options) {
            if ( (typeof value === "string") && this.trim ) value = value.trim(); // Trim input strings
            if ( value === "" ) {  // Permit empty strings for blank fields
                if ( this.blank ) return value;
                value = undefined;
            }
            return super.clean(value, options);
        }

        /** @override */
        _cast(value) {
            return String(value);
        }

        /** @inheritdoc */
        _validateSpecial(value) {
            if ( value === "" ) {
                if ( this.blank ) return true;
                else throw new Error("may not be a blank string");
            }
            return super._validateSpecial(value);
        }

        /** @override */
        _validateType(value) {
            if ( typeof value !== "string" ) throw new Error("must be a string");
            else if ( this.choices ) {
                if ( this._isValidChoice(value) ) return true;
                else throw new Error(`${value} is not a valid choice`);
            }
        }

        /**
         * Test whether a provided value is a valid choice from the allowed choice set
         * @param {string} value      The provided value
         * @returns {boolean}         Is the choice valid?
         * @protected
         */
        _isValidChoice(value) {
            let choices = this.choices;
            if ( choices instanceof Function ) choices = choices();
            if ( choices instanceof Array ) return choices.includes(value);
            return String(value) in choices;
        }
    }

    /* ---------------------------------------- */

    /**
     * A subclass of [DataField]{@link DataField} which deals with object-typed data.
     */
    class ObjectField extends DataField {

        /** @inheritdoc */
        static get _defaults() {
            return mergeObject(super._defaults, {
                required: true,
                nullable: false,
                initial: () => ({}) // To ensure each instance is independent
            });
        }

        /** @override */
        _cast(value) {
            return foundry.utils.getType(value) === "Object" ? value : {};
        }

        /** @override */
        initialize(value, model, options={}) {
            if ( !value ) return value;
            return deepClone(value);
        }

        /** @override */
        toObject(value) {
            return deepClone(value);
        }

        /** @override */
        _validateType(value, options={}) {
            if (foundry.utils.getType(value) !== "Object") throw new Error("must be an object");
        }
    }

    /* -------------------------------------------- */

    /**
     * A subclass of [DataField]{@link DataField} which deals with array-typed data.
     */
    class ArrayField extends DataField {
        /**
         * @param {DataField} element         A DataField instance which defines the type of element contained in the Array.
         * @param {DataFieldOptions} options  Options which configure the behavior of the field
         */
        constructor(element, options={}) {
            super(options);
            /**
             * The data type of each element in this array
             * @type {DataField}
             */
            this.element = this.constructor._validateElementType(element);
        }

        /**
         * Validate the contained element type of the ArrayField
         * @param {*} element       The type of Array element
         * @returns {*}             The validated element type
         * @throws                  An error if the element is not a valid type
         * @protected
         */
        static _validateElementType(element) {
            if ( !(element instanceof DataField) ) {
                throw new Error(`${this.name} must have a DataField as its contained element`);
            }
            return element;
        }

        /** @inheritdoc */
        static get _defaults() {
            return mergeObject(super._defaults, {
                required: true,
                nullable: false,
                initial: () => []
            });
        }

        /** @override */
        _cast(value) {

            // Convert objects with numeric keys to arrays
            if ( getType(value) === "Object" ) {
                const arr = [];
                for ( const [k, v] of Object.entries(value) ) {
                    const i = Number(k);
                    if ( Number.isInteger(i) && (i >= 0) ) arr[i] = v;
                }
                return arr;
            }

            // Return values as an array structure
            return value instanceof Array ? value : [value];
        }

        /** @override */
        _cleanType(value, options) {
            return value.map(v => this.element.clean(v, options));
        }

        /** @override */
        _validateType(value, options={}) {
            if ( !(value instanceof Array) ) throw new Error("must be an Array");
            const errors = this._validateElements(value, options);
            if ( errors.length ) throw new ModelValidationError(errors);
        }

        /**
         * Validate every element of the ArrayField
         * @param {Array} value       The array to validate
         * @param {options} options   Validation options
         * @returns {Array}           An array of element-specific errors
         * @protected
         */
        _validateElements(value, options) {
            const errors = [];
            for ( let i=0; i<value.length; i++ ) {
                const v = value[i];
                const error = this.element.validate(v, options);
                if ( error ) errors[i] = error;
            }
            return errors;
        }

        /** @override */
        initialize(value, model, options={}) {
            if ( !value ) return value;
            return value.map(v => this.element.initialize(v, model, options));
        }

        /** @override */
        toObject(value) {
            return value.map(v => this.element.toObject(v));
        }

        /** @override */
        apply(fn, value=[], options={}) {
            const results = [];
            if ( !value.length && options.initializeArrays ) value = [undefined];
            for ( const v of value ) {
                const r = this.element.apply(fn, v, options);
                if ( !options.filter || !isEmpty(r) ) results.push(r);
            }
            return results;
        }
    }

    /* -------------------------------------------- */
    /*  Specialized Field Types                     */
    /* -------------------------------------------- */

    /**
     * A subclass of [ArrayField]{@link ArrayField} which supports a set of contained elements.
     * Elements in this set are treated as fungible and may be represented in any order or discarded if invalid.
     */
    class SetField extends ArrayField {

        /** @override */
        _validateElements(value, options) {
            const errors = [];
            for ( let i=value.length-1; i>=0; i-- ) {  // iterate backwards so we can splice as we go
                const v = value[i];
                const error = this.element.validate(v, options);
                if ( error ) {

                    // If the Set element is invalid, we can remove it from the array and log a warning.
                    if ( options.fallback ) {
                        globalThis.logger?.warn(`Dropped invalid Set element ${JSON.stringify(v)}`);
                        value.splice(i, 1);
                    }
                    else errors.push(error);
                }
            }
            return errors;
        }

        /** @override */
        initialize(value, model, options={}) {
            return new Set(super.initialize(value, model, options));
        }

        /** @override */
        toObject(value) {
            return Array.from(value).map(v => this.element.toObject(v));
        }
    }

    /* ---------------------------------------- */

    /**
     * A subclass of [ObjectField]{@link ObjectField} which embeds some other DataModel definition as an inner object.
     */
    class EmbeddedDataField extends SchemaField {
        /**
         * @param {typeof DataModel} model          The class of DataModel which should be embedded in this field
         * @param {DataFieldOptions} options        Options which configure the behavior of the field
         */
        constructor(model, options) {
            if ( !isSubclass(model, DataModel) ) {
                throw new Error("An EmbeddedDataField must specify a DataModel class as its type");
            }
            super(model.schema.fields, options);

            /**
             * The embedded DataModel definition which is contained in this field.
             * @type {typeof DataModel}
             */
            this.model = model;
        }

        /** @override */
        _initialize(schema) {
            return schema;
        }

        /** @override */
        initialize(value, model, options={}) {
            if ( !value ) return value;
            return new this.model(value, {parent: model, ...options});
        }

        /** @override */
        toObject(value) {
            return value.toObject(false);
        }
    }

    /* ---------------------------------------- */

    /**
     * A subclass of [ArrayField]{@link ArrayField} which supports an embedded Document collection.
     * Invalid elements will be dropped from the collection during validation rather than failing for the field entirely.
     */
    class EmbeddedCollectionField extends ArrayField {
        /**
         * @param {typeof Document} element       The type of Document which belongs to this embedded collection
         * @param {DataFieldOptions} [options]    Options which configure the behavior of the field
         */
        constructor(element, options={}) {
            super(element, options);
            this.readonly = true; // Embedded collections are always immutable
        }

        /** @override */
        static _validateElementType(element) {
            if ( isSubclass(element, foundry.abstract.Document) ) return element;
            throw new Error("An EmbeddedCollectionField must specify a Document subclass as its type");
        }

        /**
         * A reference to the DataModel subclass of the embedded document element
         * @type {typeof DataModel}
         */
        get model() {
            return this.element.implementation;
        }

        /**
         * The DataSchema of the contained Document model.
         * @type {SchemaField}
         */
        get schema() {
            return this.element.schema;
        }

        /** @override */
        _cleanType(value, options) {
            return value.map(v => this.schema.clean(v, {...options, source: v}));
        }

        /**
         * @inheritdoc
         * @returns {Array<Object<Error>>}  An array of error objects
         */
        _validateElements(value, options) {
            const errors = [];
            for ( let i=0; i<value.length; i++ ) {
                const v = value[i];
                const errs = this.schema.validate(v, {...options, source: v});
                if ( !isEmpty(errs) ) {
                    if ( options.fallback ) {  // If the Document is invalid remove it from the Collection and log a warning
                        const label = `Dropped invalid EmbeddedDocument ${v._id}:`;
                        globalThis.logger?.warn(this.model.formatValidationErrors(errors, {label}));
                    } else errors[i] = errs;
                }
            }
            return errors;
        }

        /** @override */
        initialize(value, model, options={}) {
            const collection = model.collections[this.name];
            collection.initialize(options);
            return collection;
        }

        /** @override */
        toObject(value) {
            return value.toObject(false);
        }

        /** @override */
        apply(fn, value=[], options={}) {
            const results = [];
            if ( !value.length && options.initializeArrays ) value = [undefined];
            for ( const v of value ) {
                const r = this.schema.apply(fn, v, options);
                if ( !options.filter || !isEmpty(r) ) results.push(r);
            }
            return results;
        }
    }

    /* -------------------------------------------- */
    /*  Special Field Types                         */
    /* -------------------------------------------- */

    /**
     * A subclass of [StringField]{@link StringField} which provides the primary _id for a Document.
     * The field may be initially null, but it must be non-null when it is saved to the database.
     */
    class DocumentIdField extends StringField {

        /** @inheritdoc */
        static get _defaults() {
            return mergeObject(super._defaults, {
                required: true,
                blank: false,
                nullable: true,
                initial: null,
                readonly: true,
                validationError: "is not a valid Document ID string"
            });
        }

        /** @override */
        _cast(value) {
            if ( value instanceof foundry.abstract.Document ) return value._id;
            else return String(value);
        }

        /** @override */
        _validateType(value) {
            if ( !isValidId(value) ) throw new Error("must be a valid 16-character alphanumeric ID");
        }
    }

    /* ---------------------------------------- */

    /**
     * A special class of [StringField]{@link StringField} field which references another DataModel by its id.
     * This field may also be null to indicate that no foreign model is linked.
     */
    class ForeignDocumentField extends DocumentIdField {
        /**
         * @param {typeof Document} model           The foreign DataModel class definition which this field should link to.
         * @param {StringFieldOptions} options      Options which configure the behavior of the field
         */
        constructor(model, options={}) {
            super(options);
            if ( !isSubclass(model, DataModel) ) {
                throw new Error("A ForeignDocumentField must specify a DataModel subclass as its type");
            }
            /**
             * A reference to the model class which is stored in this field
             * @type {typeof Document}
             */
            this.model = model;
        }

        /** @inheritdoc */
        static get _defaults() {
            return mergeObject(super._defaults, {
                nullable: true,
                readonly: false,
                idOnly: false
            });
        }

        /** @override */
        _cast(value) {
            if ( typeof value === "string" ) return value;
            if ( (value instanceof this.model) ) return value._id;
            throw new Error(`The value provided to a ForeignDocumentField must be a ${this.model.name} instance.`);
        }

        /** @inheritdoc */
        initialize(value, model, options={}) {
            if ( this.idOnly ) return value;
            if ( !game.collections ) return value; // server-side
            return () => this.model?.get(value) ?? null;
        }

        /** @inheritdoc */
        toObject(value) {
            return value?._id ?? value
        }
    }

    /* ---------------------------------------- */

    /**
     * A subclass of [ObjectField]{@link ObjectField} which supports a system-level data object.
     */
    class SystemDataField extends ObjectField {
        /**
         * @param {typeof Document} document      The base document class which belongs in this field
         * @param {DataFieldOptions} options      Options which configure the behavior of the field
         */
        constructor(document, options={}) {
            super(options);
            /**
             * The canonical document name of the document type which belongs in this field
             * @type {typeof Document}
             */
            this.document = document;
        }

        /** @inheritdoc */
        static get _defaults() {
            return mergeObject(super._defaults, {required: true});
        }

        /**
         * A convenience accessor for the name of the document type associated with this SystemDataField
         * @type {string}
         */
        get documentName() {
            return this.document.documentName;
        }

        /**
         * Get the DataModel definition that should be used for this type of document.
         * @param {string} type         The Document instance type
         * @returns {typeof DataModel|null}    The DataModel class, or null
         */
        getModelForType(type) {
            if ( !type ) return null;
            return globalThis.CONFIG?.[this.documentName]?.systemDataModels?.[type] ?? null;
        }

        /** @override */
        getInitialValue(data) {
            const cls = this.getModelForType(data.type);
            return cls?.cleanData() || foundry.utils.deepClone(game?.model[this.documentName]?.[data.type] || {});
        }

        /** @override */
        _cleanType(value, options) {
            if ( !(typeof value === "object") ) value = {};

            // Use a defined DataModel
            const cls = this.getModelForType(options.source?.type);
            if ( cls ) return cls.cleanData(value, options);
            if ( options.partial ) return value;

            // Use the defined template.json
            const template = this.getInitialValue(options.source);
            const insertKeys = !game?.system?.template.strictDataCleaning;
            return mergeObject(template, value, {insertKeys, inplace: true});
        }

        /** @override */
        initialize(value, model, options={}) {
            const cls = this.getModelForType(model._source.type);
            if ( cls ) return new cls(value, {parent: model, ...options});
            return deepClone(value);
        }

        /** @inheritdoc */
        _validateType(data, options={}) {
            super._validateType(data);
            options.source = options.source || data;
            const cls = this.getModelForType(options.source.type);
            if ( !cls?._enableV10Validation ) return;
            const schema = cls?.schema;
            const {errors} = schema?.validate(data, options) ?? {};
            if ( !isEmpty(errors) ) {
                throw new ModelValidationError(errors);
            }
        }

        /** @override */
        toObject(value) {
            return value.toObject instanceof Function ? value.toObject(false) : deepClone(value);
        }
    }

    /* -------------------------------------------- */

    /**
     * A special [StringField]{@link StringField} which records a standardized CSS color string.
     */
    class ColorField extends StringField {

        /** @inheritdoc */
        static get _defaults() {
            return mergeObject(super._defaults, {
                nullable: true,
                initial: null,
                blank: false,
                validationError: "is not a valid hexadecimal color string"
            });
        }

        /** @inheritDoc */
        clean(value, options) {
            if ( (value === "") && (this.nullable) ) value = null;
            return super.clean(value, options);
        }

        /** @inheritdoc */
        _validateType(value) {
            if ( !isColorString(value) ) throw new Error("must be a valid color string");
        }
    }

    /* -------------------------------------------- */

    /**
     * @typedef {StringFieldOptions} FilePathFieldOptions
     * @property {string[]} [categories]    A set of categories in CONST.FILE_CATEGORIES which this field supports
     * @property {boolean} [base64=false]   Is embedded base64 data supported in lieu of a file path?
     * @property {boolean} [wildcard=false] Does this file path field allow wildcard characters?
     */

    /**
     * A special [StringField]{@link StringField} which records a file path or inline base64 data.
     * @property {string[]} categories      A set of categories in CONST.FILE_CATEGORIES which this field supports
     * @property {boolean} base64=false     Is embedded base64 data supported in lieu of a file path?
     * @property {boolean} wildcard=false   Does this file path field allow wildcard characters?
     */
    class FilePathField extends StringField {
        /**
         * @param {FilePathFieldOptions} options  Options which configure the behavior of the field
         */
        constructor(options={}) {
            super(options);
            if ( !this.categories.length || this.categories.some(c => !(c in FILE_CATEGORIES)) ) {
                throw new Error("The categories of a FilePathField must be keys in CONST.FILE_CATEGORIES");
            }
        }

        /** @inheritdoc */
        static get _defaults() {
            return mergeObject(super._defaults, {
                categories: [],
                base64: false,
                wildcard: false,
                nullable: true,
                blank: false,
                initial: null
            });
        }

        /** @inheritdoc */
        _validateType(value) {

            // Wildcard paths
            if ( this.wildcard && value.includes("*") ) return true;

            // Allowed extension or base64
            const isValid = this.categories.some(c => {
                const category = FILE_CATEGORIES[c];
                if ( hasFileExtension(value, Object.keys(category)) ) return true;
                /**
                 * If the field contains base64 data, it is allowed (for now) regardless of the base64 setting for the field.
                 * Eventually, this will become more strict and only be valid if base64 is configured as true for the field.
                 * @deprecated since v10
                 */
                return isBase64Data(value, Object.values(category));
            });

            // Throw an error for invalid paths
            if ( !isValid ) {
                let err = "does not have a valid file extension";
                if ( this.base64 ) err += " or provide valid base64 data";
                throw new Error(err);
            }
        }
    }

    /* -------------------------------------------- */

    /**
     * A special [NumberField]{@link NumberField} which represents an angle of rotation in degrees between 0 and 360.
     * @property {number} base                  Whether the base angle should be treated as 360 or as 0
     */
    class AngleField extends NumberField {

        /** @inheritdoc */
        static get _defaults() {
            return mergeObject(super._defaults, {
                required: true,
                nullable: false,
                initial: 0,
                base: 0,
                min: 0,
                max: 360,
                validationError: "is not a number between 0 and 360"
            });
        }

        /** @inheritdoc */
        _cast(value) {
            value = Number(value);
            return Math.normalizeDegrees(value, this.base);
        }
    }

    /* -------------------------------------------- */

    /**
     * A special [NumberField]{@link NumberField} represents a number between 0 and 1.
     */
    class AlphaField extends NumberField {
        static get _defaults() {
            return mergeObject(super._defaults, {
                required: true,
                nullable: false,
                initial: 1,
                min: 0,
                max: 1,
                validationError: "is not a number between 0 and 1"
            });
        }
    }

    /* -------------------------------------------- */

    /**
     * A special [ObjectField]{@link ObjectField} which captures a mapping of User IDs to Document permission levels.
     */
    class DocumentOwnershipField extends ObjectField {

        /** @inheritdoc */
        static get _defaults() {
            return mergeObject(super._defaults, {
                initial: {"default": DOCUMENT_OWNERSHIP_LEVELS.NONE},
                validationError: "is not a mapping of user IDs and document permission levels"
            });
        }

        /** @override */
        _validateType(value) {
            for ( let [k, v] of Object.entries(value) ) {
                if ( (k !== "default") && !isValidId(k) ) return false;
                if ( !Object.values(DOCUMENT_OWNERSHIP_LEVELS).includes(v) ) return false;
            }
        }
    }

    /* -------------------------------------------- */

    /**
     * A special [StringField]{@link StringField} which contains serialized JSON data.
     */
    class JSONField extends StringField {

        /** @inheritdoc */
        static get _defaults() {
            return mergeObject(super._defaults, {
                blank: false,
                initial: undefined,
                validationError: "is not a valid JSON string"
            });
        }

        /** @override */
        clean(value, options) {
            if ( value === undefined ) return this.getInitialValue(options.source);
            return isJSON(value) ? value : JSON.stringify(value);
        }

        /** @override */
        _validateType(value) {
            if ( !isJSON(value) ) throw new Error("must be a serialized JSON string");
        }

        /** @override */
        initialize(value, model, options={}) {
            if ( value === undefined ) return value;
            return JSON.parse(value);
        }

        /** @override */
        toObject(value) {
            return JSON.stringify(value);
        }
    }

    /* -------------------------------------------- */

    /**
     * A subclass of [StringField]{@link StringField} which contains a sanitized HTML string.
     * This class does not override any StringField behaviors, but is used by the server-side to identify fields which
     * require sanitization of user input.
     */
    class HTMLField extends StringField {

        /** @inheritdoc */
        static get _defaults() {
            return mergeObject(super._defaults, {
                required: true,
                blank: true
            });
        }
    }

    /* ---------------------------------------- */

    /**
     * A subclass of {@link NumberField} which is used for storing integer sort keys.
     */
    class IntegerSortField extends NumberField {
        /** @inheritdoc */
        static get _defaults() {
            return mergeObject(super._defaults, {
                required: true,
                nullable: false,
                integer: true,
                initial: 0,
                label: "FOLDER.DocumentSort",
                hint: "FOLDER.DocumentSortHint"
            });
        }
    }

    /* ---------------------------------------- */

    /** @typedef {Object} DocumentStats
     * @property {string} systemId  The package name of the system the Document was created in.
     * @property {string} systemVersion  The version of the system the Document was created in.
     * @property {string} coreVersion  The core version the Document was created in.
     * @property {number} createdTime  A timestamp of when the Document was created.
     * @property {number} modifiedTime  A timestamp of when the Document was last modified.
     * @property {string} lastModifiedBy  The ID of the user who last modified the Document.
     */

    /**
     * A subclass of {@link SchemaField} which stores document metadata in the _stats field.
     * @mixes DocumentStats
     */
    class DocumentStatsField extends SchemaField {
        constructor(options) {
            super({
                systemId: new StringField({required: true, blank: false, nullable: true, initial: null}),
                systemVersion: new StringField({required: true, blank: false, nullable: true, initial: null}),
                coreVersion: new StringField({required: true, blank: false, nullable: true, initial: null}),
                createdTime: new NumberField(),
                modifiedTime: new NumberField(),
                lastModifiedBy: new ForeignDocumentField(foundry.documents.BaseUser, {idOnly: true})
            }, options);
        }
    }

    /* ---------------------------------------- */
    /*  Errors                                  */
    /* ---------------------------------------- */

    /**
     * A special type of error that wraps multiple errors which occurred during DataModel validation.
     * @param {Object<Error>|Error[]} errors  An array or object containing several errors.
     */
    class ModelValidationError extends Error {
        constructor(errors) {
            const message = ModelValidationError.formatErrors(errors);
            super(message);
            this.errors = errors;
        }

        /**
         * Collect all the errors into a single message for consumers who do not handle the ModelValidationError specially.
         * @param {Object<Error>|Error[]|string} errors   The raw error structure
         * @returns {string}                              A formatted error message
         */
        static formatErrors(errors) {
            if ( typeof errors === "string" ) return errors;
            const message = ["Model Validation Errors"];
            if ( errors instanceof Array ) message.push(...errors.map(e => e.message));
            else message.push(...Object.entries(errors).map(([k, e]) => `[${k}]: ${e.message}`));
            return message.join("\n");
        }
    }

    /* ---------------------------------------- */
    /*  DEPRECATIONS                            */
    /* ---------------------------------------- */

    /**
     * @deprecated since v10
     * @see SystemDataField
     * @ignore
     */
    function systemDataField(document) {
        const msg = "fields.systemDataField is deprecated and replaced by the SystemDataField class";
        logCompatibilityWarning(msg, {since: 10, until: 12});
        return new SystemDataField(document);
    }

    /**
     * @deprecated since v10
     * @see ForeignDocumentField
     * @ignore
     */
    function foreignDocumentField(options) {
        const msg = "fields.foreignDocumentField is deprecated and replaced by the ForeignDocumentField class";
        logCompatibilityWarning(msg, {since: 10, until: 12});
        return new ForeignDocumentField(options.type.model, options)
    }

    /**
     * @deprecated since v10
     * @see EmbeddedCollectionField
     * @ignore
     */
    function embeddedCollectionField(document, options={}) {
        const msg = "fields.embeddedCollectionField is deprecated and replaced by the EmbeddedCollectionField class";
        logCompatibilityWarning(msg, {since: 10, until: 12});
        return new EmbeddedCollectionField(document, options);
    }

    /**
     * @deprecated since v10
     * @ignore
     */
    function field(field, options={}) {
        const msg = "fields.field() is deprecated since v10 and should be replaced with explicit use of new field classes";
        logCompatibilityWarning(msg, {since: 10, until: 12});
        const type = field.type;
        switch(type) {
            case String:
                return new StringField(options);
            case Number:
                return new NumberField(options);
            case Boolean:
                return new BooleanField(options);
            case Object:
                return new ObjectField(options);
        }
        if ( type instanceof Array ) return new ArrayField(type[0], options);
        else if ( typeof type === "object" ) return new EmbeddedCollectionField(Array.from(Object.values(type))[0]);
    }

    var fields = /*#__PURE__*/Object.freeze({
        __proto__: null,
        systemDataField: systemDataField,
        foreignDocumentField: foreignDocumentField,
        embeddedCollectionField: embeddedCollectionField,
        field: field,
        AlphaField: AlphaField,
        AngleField: AngleField,
        ArrayField: ArrayField,
        BooleanField: BooleanField,
        ColorField: ColorField,
        DataField: DataField,
        DocumentIdField: DocumentIdField,
        DocumentOwnershipField: DocumentOwnershipField,
        DocumentStatsField: DocumentStatsField,
        EmbeddedDataField: EmbeddedDataField,
        EmbeddedCollectionField: EmbeddedCollectionField,
        FilePathField: FilePathField,
        ForeignDocumentField: ForeignDocumentField,
        HTMLField: HTMLField,
        IntegerSortField: IntegerSortField,
        JSONField: JSONField,
        NumberField: NumberField,
        ObjectField: ObjectField,
        SchemaField: SchemaField,
        SetField: SetField,
        StringField: StringField,
        SystemDataField: SystemDataField,
        ModelValidationError: ModelValidationError
    });

    /**
     * @typedef {Object<DataField>}  DataSchema
     */

    /**
     * @typedef {Object} DataValidationOptions
     * @property {boolean} [fallback=false]  Attempt to replace invalid values with valid defaults?
     * @property {boolean} [partial=false]   Allow partial source data, ignoring absent fields?
     */

    /**
     * The abstract base class which defines the data schema contained within a Document.
     * @param {object} [data={}]          Initial data used to construct the data object. The provided object will be owned
     *                                    by the constructed model instance and may be mutated.
     * @param {object} [options={}]       Options which affect DataModel construction
     * @param {Document} [options.parent]     A parent DataModel instance to which this DataModel belongs
     * @param {boolean} [options.strict=true] Control the strictness of validation for initially provided data
     * @abstract
     */
    class DataModel {
        constructor(data={}, {parent=null, strict=true, ...options}={}) {

            // Parent model
            Object.defineProperty(this, "parent", {
                value: (() => {
                    if ( parent === null ) return null;
                    if ( parent instanceof DataModel ) return parent;
                    throw new Error("The provided parent must be a DataModel instance");
                })(),
                writable: false,
                enumerable: false
            });

            // Source data
            Object.defineProperty(this, "_source", {
                value: this._initializeSource(data, {strict, ...options}),
                writable: false,
                enumerable: false
            });
            Object.seal(this._source);

            // Additional subclass configurations
            this._configure(options);

            // Data validation and initialization
            this.#valid = this.validate({strict, fallback: !strict, fields: true, joint: true});
            this._initialize({strict, ...options});
        }

        /**
         * Configure the data model instance before validation and initialization workflows are performed.
         * @protected
         */
        _configure(options={}) {}

        /* -------------------------------------------- */

        /**
         * The source data object for this DataModel instance.
         * Once constructed, the source object is sealed such that no keys may be added nor removed.
         * @type {object}
         */
        _source;

        /**
         * The defined and cached Data Schema for all instances of this DataModel.
         * @type {SchemaField}
         * @private
         */
        static _schema;

        /**
         * An immutable reverse-reference to a parent DataModel to which this model belongs.
         * @type {DataModel|null}
         */
        parent;

        /**
         * Is the current state of the DataModel valid?
         * @type {boolean}
         * @private
         */
        #valid;

        /* ---------------------------------------- */
        /*  Data Schema                             */
        /* ---------------------------------------- */

        /**
         * Define the data schema for documents of this type.
         * The schema is populated the first time it is accessed and cached for future reuse.
         * @virtual
         * @returns {DataSchema}
         */
        static defineSchema() {
            throw new Error(`The ${this["name"]} subclass of DataModel must define its Document schema`);
        }

        /* ---------------------------------------- */

        /**
         * Define the data schema for documents of this type.
         * @type {SchemaField}
         */
        static get schema() {
            if ( this.hasOwnProperty("_schema") ) return this._schema;
            const schema = new SchemaField(Object.freeze(this.defineSchema()));
            schema.name = this.name;
            Object.defineProperty(this, "_schema", {value: schema, writable: false});
            return schema;
        }

        /* ---------------------------------------- */

        /**
         * Define the data schema for this document instance.
         * @type {SchemaField}
         */
        get schema() {
            return this.constructor.schema;
        }

        /* ---------------------------------------- */

        /**
         * Is the current state of this DataModel invalid?
         * @type {boolean}
         */
        get invalid() {
            return !this.#valid;
        }

        /* ---------------------------------------- */
        /*  Data Cleaning Methods                   */
        /* ---------------------------------------- */

        /**
         * Initialize the source data for a new DataModel instance.
         * One-time migrations and initial cleaning operations are applied to the source data.
         * @param {object|DataModel} data   The candidate source data from which the model will be constructed
         * @param {object} [options]        Options provided to the model constructor
         * @returns {object}                Migrated and cleaned source data which will be stored to the model instance
         * @protected
         */
        _initializeSource(data, options={}) {
            if ( data instanceof DataModel ) data = data.toObject();
            const dt = getType(data);
            if ( dt !== "Object" ) {
                logger.error(`${this.constructor.name} was incorrectly constructed with a ${dt} instead of an object. 
      Attempting to fall back to default values.`);
                data = {};
            }
            data = this.constructor.migrateDataSafe(data);    // Migrate old data to the new format
            data = this.constructor.cleanData(data);          // Clean the data in the new format
            return this.constructor.shimData(data);           // Apply shims which preserve backwards compatibility
        }

        /* ---------------------------------------- */

        /**
         * Clean a data source object to conform to a specific provided schema.
         * @param {object} [source]         The source data object
         * @param {object} [options={}]     Additional options which are passed to field cleaning methods
         * @returns {object}                The cleaned source data
         */
        static cleanData(source={}, options={}) {
            return this.schema.clean(source, options);
        }

        /* ---------------------------------------- */
        /*  Data Initialization                     */
        /* ---------------------------------------- */

        /**
         * Initialize the instance by copying data from the source object to instance attributes.
         * This mirrors the workflow of SchemaField#initialize but with some added functionality.
         * @param {object} [options]        Options provided to the model constructor
         * @protected
         */
        _initialize(options={}) {
            for ( let [name, field] of this.schema.entries() ) {
                const sourceValue = this._source[name];

                // Field initialization
                const value = field.initialize(sourceValue, this, options);

                // Special handling for Document IDs.
                if ( (name === "_id") && (value === null) ) {
                    Object.defineProperty(this, name, {value, writable: false, configurable: true});
                }

                // Readonly fields
                else if ( field.readonly ) {
                    if ( this[name] !== undefined ) continue;
                    Object.defineProperty(this, name, {value, writable: false});
                }

                // Getter fields
                else if ( value instanceof Function ) {
                    Object.defineProperty(this, name, {get: value, set() {}, configurable: true});
                }

                // Writable fields
                else this[name] = value;
            }
        }

        /* ---------------------------------------- */

        /**
         * Reset the state of this data instance back to mirror the contained source data, erasing any changes.
         */
        reset() {
            this._initialize();
        }

        /* ---------------------------------------- */

        /**
         * Clone a model, creating a new data model by combining current data with provided overrides.
         * @param {Object} [data={}]                    Additional data which overrides current document data at the time of creation
         * @param {object} [context={}]                 Context options passed to the data model constructor
         * @returns {Document|Promise<Document>}        The cloned Document instance
         */
        clone(data={}, context={}) {
            data = mergeObject(this.toObject(), data, {insertKeys: false, performDeletions: true, inplace: true});
            return new this.constructor(data, context);
        }

        /* ---------------------------------------- */
        /*  Data Validation Methods                 */
        /* ---------------------------------------- */

        /**
         * Validate the data contained in the document to check for type and content
         * This function throws an error if data within the document is not valid
         *
         * @param {object} options          Optional parameters which customize how validation occurs.
         * @param {object} [options.changes]          A specific set of proposed changes to validate, rather than the full
         *                                            source data of the model.
         * @param {boolean} [options.clean=false]     If changes are provided, attempt to clean the changes before validating
         *                                            them?
         * @param {boolean} [options.fallback=false]  Allow replacement of invalid values with valid defaults?
         * @param {boolean} [options.strict=true]     Throw if an invalid value is encountered, otherwise log a warning?
         * @param {boolean} [options.fields=true]     Perform validation on individual fields?
         * @param {boolean} [options.joint]           Perform joint validation on the full data model?
         *                                            Joint validation will be performed by default if no changes are passed.
         *                                            Joint validation will be disabled by default if changes are passed.
         *                                            Joint validation can be performed on a complete set of changes (for
         *                                            example testing a complete data model) by explicitly passing true.
         * @return {boolean}                An indicator for whether the document contains valid data
         */
        validate({changes, clean=false, fallback=false, strict=true, fields=true, joint}={}) {
            let isValid = true;
            const source = changes ?? this._source;

            // Determine whether we are performing partial or joint validation
            const partial = !!changes;
            joint = joint ?? !changes;
            if ( partial && joint ) {
                throw new Error("It is not supported to perform joint data model validation with only a subset of changes");
            }

            // Optionally clean the data before validating
            if ( partial && clean ) this.constructor.cleanData(source, {partial});

            // Validate individual fields in the data or in a specific change-set, throwing errors if validation fails
            if ( fields ) {
                const error = this.schema.validate(source, {partial, fallback});
                if ( error ) {
                    isValid = false;
                    const id = this._source._id ? `[${this._source._id}] ` : "";
                    error.message = `${this.constructor.name} ${id}${error.message}`;
                    if ( strict ) throw error;
                    else logger.warn(error);
                }
            }

            // Perform joint document-level validations which consider all fields together
            if ( joint ) {
                try {
                    this._validateModel(source);
                } catch (err) {
                    isValid = false;
                    const prefix = this["_id"] ? `[${this["_id"]}] ` : "";
                    const e = new ModelValidationError(`${prefix}Model Validation Error:\n${err.message}`);
                    if ( strict ) throw e;
                    else logger.warn(e);
                }
            }
            return isValid;
        }

        /* ---------------------------------------- */

        /**
         * Get an array of validation errors from the provided error structure
         * @param {object} errors
         * @param {object} [options={}]
         * @param {string} [options.label]      A prefix label that should prepend any error messages
         * @param {string} [options.namespace]  A field namespace that should prepend key names with dot-notation
         * @returns {string}
         */
        static formatValidationErrors(errors, {label, namespace}={}) {
            const arr = label ? [label] : [];
            return arr.concat(Object.entries(flattenObject(errors)).map(([key, err]) => {
                let msg = `${key}: ${err.message}`;
                if ( namespace ) msg = `${namespace}.${msg}`;
                return msg;
            })).join("\n");
        }

        /* ---------------------------------------- */

        /**
         * Jointly validate the overall data model after each field has been individually validated.
         * @param {object} data     The candidate data object to validate
         * @throws                  An error if a validation failure is detected
         * @protected
         */
        _validateModel(data) {}

        /* ---------------------------------------- */
        /*  Data Management                         */
        /* ---------------------------------------- */

        /**
         * Update the DataModel locally by applying an object of changes to its source data.
         * The provided changes are cleaned, validated, and stored to the source data object for this model.
         * The source data is then re-initialized to apply those changes to the prepared data.
         * The method returns an object of differential changes which modified the original data.
         *
         * @param {object} changes          New values which should be applied to the data model
         * @param {object} [options={}]     Options which determine how the new data is merged
         * @returns {object}                An object containing the changed keys and values
         */
        updateSource(changes={}, options={}) {
            const schema = this.schema;
            const source = this._source;
            const _diff = {};
            const _backup = {};
            const _collections = this.collections;

            // Expand the object, if dot-notation keys are provided
            if ( Object.keys(changes).some(k => /\./.test(k)) ) changes = expandObject(changes);

            // Clean and validate the provided changes, throwing an error if any change is invalid
            this.validate({changes, clean: true, fallback: options.fallback, strict: true, fields: true, joint: false});

            // Update the source data for all fields and validate the final combined model
            try {
                DataModel.#updateData(schema, source, changes, {_backup, _collections, _diff, ...options});
                this.#valid = this.validate({fields: !this.#valid, joint: true, strict: true});
            }

                // If any error occurred, restore the backup
            catch(err) {
                mergeObject(this._source, _backup);
                throw err;
            }

            // Re-initialize the updated data
            this._initialize();
            return _diff;
        }

        /* ---------------------------------------- */

        /**
         * Update the source data for a specific DataSchema.
         * @param {SchemaField} schema      The data schema to update
         * @param {object} source           Source data to be updated
         * @param {object} changes          Changes to apply to the source data
         * @param {object} [options={}]     Options which modify the update workflow
         * @returns {object}                The updated source data
         * @throws                          An error if the update operation was unsuccessful
         * @private
         */
        static #updateData(schema, source, changes, options) {
            const {_backup, _diff} = options;
            for ( let [name, value] of Object.entries(changes) ) {
                const field = schema.get(name);
                if ( !field ) continue;

                // Only apply differences in the cleaned data
                const current = source[name];
                if ( current === value ) continue; // no diff

                // Record backup and diff
                _backup[name] = current;
                _diff[name] = value;

                // Field-specific updating logic
                this.#updateField(name, field, source, value, options);
            }
            return source;
        }

        /* ---------------------------------------- */

        /**
         * Update the source data for a specific DataField.
         * @param {string} name             The field name being updated
         * @param {DataField} field         The field definition being updated
         * @param {object} source           The source object being updated
         * @param {*} value                 The new value for the field
         * @param {object} options          Options which modify the update workflow
         * @throws                          An error if the new candidate value is invalid
         * @private
         */
        static #updateField(name, field, source, value, options) {
            const {fallback, recursive, _collections, _diff} = options;
            const current = source[name];

            // Special Case: Update Embedded Collection
            if ( field instanceof EmbeddedCollectionField ) {
                return _collections[name].update(value, {fallback, recursive});
            }

            // Special Case: Inner Data Schema
            let innerSchema;
            if ( (field instanceof SchemaField) || (field instanceof EmbeddedDataField) ) innerSchema = field;
            else if ( field instanceof SystemDataField ) {
                const cls = field.getModelForType(source.type);
                if ( cls ) innerSchema = cls.schema;
            }
            if ( innerSchema ) {
                _diff[name] = {};
                const recursiveOptions = {fallback, recursive, _backup: current, _collections, _diff: _diff[name]};
                return this.#updateData(innerSchema, current, value, recursiveOptions);
            }

            // Special Case: Object Field
            if ( field instanceof ObjectField ) {
                if ( recursive === false ) source[name] = value;
                else mergeObject(current, value, {insertKeys: true, insertValues: true, performDeletions: true});
            }

            // Standard Case: Update Directly
            else source[name] = value;
        }

        /* ---------------------------------------- */
        /*  Serialization and Storage               */
        /* ---------------------------------------- */

        /**
         * Copy and transform the DataModel into a plain object.
         * Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.
         * @param {boolean} [source=true]     Draw values from the underlying data source rather than transformed values
         * @returns {object}                  The extracted primitive object
         */
        toObject(source=true) {
            if ( source ) return deepClone(this._source);
            return this.schema.toObject(this);
        }

        /* ---------------------------------------- */

        /**
         * Extract the source data for the DataModel into a simple object format that can be serialized.
         * @returns {object}          The document source data expressed as a plain object
         */
        toJSON() {
            return this.toObject(true);
        }

        /* -------------------------------------------- */

        /**
         * Create a new instance of this DataModel from a source record.
         * The source is presumed to be trustworthy and is not strictly validated.
         * @param {object} source       Initial document data which comes from a trusted source.
         * @param {object} [context]    Model construction context
         * @param {boolean} [context.strict=false]  Models created from trusted source data are validated non-strictly
         * @returns {DataModel}
         */
        static fromSource(source, {strict=false, ...context}={}) {
            return new this(source, {strict, ...context});
        }

        /* ---------------------------------------- */

        /**
         * Create a DataModel instance using a provided serialized JSON string.
         * @param {string} json       Serialized document data in string format
         * @returns {DataModel}       A constructed data model instance
         */
        static fromJSON(json) {
            return this.fromSource(JSON.parse(json))
        }

        /* -------------------------------------------- */
        /*  Deprecations and Compatibility              */
        /* -------------------------------------------- */

        /**
         * Migrate candidate source data for this DataModel which may require initial cleaning or transformations.
         * @param {object} source           The candidate source data from which the model will be constructed
         * @returns {object}                Migrated source data, if necessary
         */
        static migrateData(source) {
            const schema = this.schema;
            for ( const [name, value] of Object.entries(source) ) {
                const field = schema.get(name);
                if ( !field ) continue;
                if ( field instanceof EmbeddedDataField ) {
                    source[name] = field.model.migrateDataSafe(value || {});
                }
                else if ( field instanceof EmbeddedCollectionField ) {
                    (value || []).forEach(d => field.model.migrateDataSafe(d));
                } else if ( field instanceof SystemDataField ) {
                    const cls = field.getModelForType(source.type);
                    if ( cls ) source[name] = cls.migrateDataSafe(value);
                }
            }
            return source;
        }

        /* ---------------------------------------- */

        /**
         * Wrap data migration in a try/catch which attempts it safely
         * @param {object} source           The candidate source data from which the model will be constructed
         * @returns {object}                Migrated source data, if necessary
         */
        static migrateDataSafe(source) {
            try {
                this.migrateData(source);
            } catch(err) {
                err.message = `Failed data migration for ${this.name}: ${err.message}`;
                logger.warn(err);
            }
            return source;
        }

        /* ---------------------------------------- */

        /**
         * Take data which conforms to the current data schema and add backwards-compatible accessors to it in order to
         * support older code which uses this data.
         * @param {object} data         Data which matches the current schema
         * @param {object} [options={}] Additional shimming options
         * @param {boolean} [options.embedded=true] Apply shims to embedded models?
         * @returns {object}            Data with added backwards-compatible properties
         */
        static shimData(data, {embedded=true}={}) {
            if ( Object.isSealed(data) ) return data;
            const schema = this.schema;
            if ( embedded ) {
                for ( const [name, value] of Object.entries(data) ) {
                    const field = schema.get(name);
                    if ( (field instanceof EmbeddedDataField) && !Object.isSealed(value) ) {
                        data[name] = field.model.shimData(value || {});
                    }
                    else if ( field instanceof EmbeddedCollectionField ) {
                        for ( const d of (value || []) ) {
                            if ( !Object.isSealed(d) ) field.model.shimData(d);
                        }
                    }
                }
            }
            return data;
        }

        /* ---------------------------------------- */

        /**
         * @deprecated since v10
         * @ignore
         */
        update(changes, options) {
            globalThis.logger.warn("You are calling DataModel#update which is renamed to DataModel#updateSource");
            return this.updateSource(changes, options);
        }
    }

    /**
     * An extension of the base DataModel which defines a Document.
     * Documents are special in that they are persisted to the database and referenced by _id.
     * @extends abstract.DataModel
     * @memberof abstract
     * @abstract
     *
     * @param {object} data                           Initial data from which to construct the Document
     * @param {DocumentConstructionContext} context   Construction context options
     */
    class Document extends DataModel {

        /** @override */
        _configure({pack=null}={}) {

            /**
             * An immutable reference to a containing Compendium collection to which this Document belongs.
             * @type {string|null}
             */
            Object.defineProperty(this, "pack", {
                value: (() => {
                    if ( typeof pack === "string" ) return pack;
                    if ( this.parent?.pack ) return this.parent.pack;
                    if ( pack === null ) return null;
                    throw new Error("The provided compendium pack ID must be a string");
                })(),
                writable: false
            });

            // Construct Embedded Collections
            const collections = {};
            for ( const fieldName of Object.values(this.constructor.metadata.embedded) ) {
                const field = this.schema.get(fieldName);
                const data = this._source[fieldName];
                const c = collections[fieldName] = new EmbeddedCollection(this, data, field.element.implementation);
                Object.defineProperty(this, fieldName, {value: c, writable: false});
            }

            /**
             * A mapping of embedded Document collections which exist in this model.
             * @type {Object<EmbeddedCollection>}
             */
            Object.defineProperty(this, "collections", {value: Object.seal(collections), writable: false});
        }

        /* -------------------------------------------- */
        /*  Model Configuration                         */
        /* -------------------------------------------- */

        /**
         * Default metadata which applies to each instance of this Document type.
         * @type {object}
         */
        static metadata = Object.freeze({
            name: "Document",
            collection: "documents",
            indexed: false,
            compendiumIndexFields: [],
            label: "DOCUMENT.Document",
            coreTypes: [],
            embedded: {},
            permissions: {
                create: "ASSISTANT",
                update: "ASSISTANT",
                delete: "ASSISTANT"
            },
            preserveOnImport: ["_id", "sort", "ownership"]
        });

        /* -------------------------------------------- */

        /**
         * The database backend used to execute operations and handle results.
         * @type {abstract.DatabaseBackend}
         */
        static get database() {
            return globalThis.CONFIG.DatabaseBackend;
        }

        /* -------------------------------------------- */

        /**
         * Return a reference to the configured subclass of this base Document type.
         * @type {Class}
         */
        static get implementation() {
            return globalThis.CONFIG[this.documentName]?.documentClass || this;
        }

        /* -------------------------------------------- */

        /**
         * The named collection to which this Document belongs.
         * @type {string}
         */
        static get collectionName() {
            return this.metadata.collection;
        }
        get collectionName() {
            return this.constructor.collectionName;
        }

        /* -------------------------------------------- */

        /**
         * The canonical name of this Document type, for example "Actor".
         * @type {string}
         */
        static get documentName() {
            return this.metadata.name;
        }
        get documentName() {
            return this.constructor.documentName;
        }

        /* -------------------------------------------- */

        /**
         * Does this Document definition include a SystemDataField?
         * @type {boolean}
         */
        static get hasSystemData() {
            return this.schema.get("system") instanceof SystemDataField;
        }

        /* -------------------------------------------- */
        /*  Model Properties                            */
        /* -------------------------------------------- */

        /**
         * The canonical identifier for this Document.
         * @type {string|null}
         */
        get id() {
            return this._id;
        }

        /**
         * Test whether this Document is embedded within a parent Document
         * @type {boolean}
         */
        get isEmbedded() {
            return this.parent && (this.documentName in this.parent.constructor.metadata.embedded);
        }

        /* ---------------------------------------- */
        /*  Model Permissions                       */
        /* ---------------------------------------- */

        /**
         * Test whether a given User has a sufficient role in order to create Documents of this type in general.
         * @param {documents.BaseUser} user       The User being tested
         * @return {boolean}                      Does the User have a sufficient role to create?
         */
        static canUserCreate(user) {
            const perm = this.metadata.permissions.create;
            if ( perm instanceof Function ) {
                throw new Error('Document.canUserCreate is not supported for this document type. ' +
                    'Use Document#canUserModify(user, "create") to test whether a user is permitted to create a ' +
                    'specific document instead.');
            }
            return user.hasPermission(perm) || user.hasRole(perm, {exact: false});
        }

        /* ---------------------------------------- */

        /**
         * Get the permission level that a specific User has over this Document, a value in CONST.DOCUMENT_OWNERSHIP_LEVELS.
         * @param {documents.BaseUser} user     The User being tested
         * @returns {number|null}               A numeric permission level from CONST.DOCUMENT_OWNERSHIP_LEVELS or null
         */
        getUserLevel(user) {
            user = user || game.user;
            const ownership = this["ownership"];
            if ( !ownership ) return null;
            return ownership[user.id] ?? ownership["default"] ?? null;
        }

        /* ---------------------------------------- */

        /**
         * Test whether a certain User has a requested permission level (or greater) over the Document
         * @param {documents.BaseUser} user       The User being tested
         * @param {string|number} permission      The permission level from DOCUMENT_OWNERSHIP_LEVELS to test
         * @param {object} options                Additional options involved in the permission test
         * @param {boolean} [options.exact=false]     Require the exact permission level requested?
         * @return {boolean}                      Does the user have this permission level over the Document?
         */
        testUserPermission(user, permission, {exact=false}={}) {

            // Get user permission
            const perms = DOCUMENT_OWNERSHIP_LEVELS;
            const level = this.getUserLevel(user);

            // Test against the target permission
            const target = (typeof permission === "string") ? (perms[permission] ?? perms.OWNER) : permission;
            if ( exact ) return level === target;   // Exact match
            else if ( user.isGM ) return true;      // Game-masters can do anything
            return level >= target;                 // Same level or higher
        }

        /* ---------------------------------------- */

        /**
         * Test whether a given User has permission to perform some action on this Document
         * @param {documents.BaseUser} user   The User attempting modification
         * @param {string} action             The attempted action
         * @param {object} [data]             Data involved in the attempted action
         * @return {boolean}                  Does the User have permission?
         */
        canUserModify(user, action, data={}) {
            const permissions = this.constructor.metadata.permissions;
            const perm = permissions[action];

            // Specialized permission test function
            if ( perm instanceof Function ) return perm(user, this, data);

            // User-level permission
            else if ( perm in USER_PERMISSIONS ) return user.hasPermission(perm);

            // Document-level permission
            const isOwner = this.testUserPermission(user, "OWNER");
            const hasRole = (perm in USER_ROLES) && user.hasRole(perm);
            return isOwner || hasRole;
        }

        /* ---------------------------------------- */
        /*  Model Methods                           */
        /* ---------------------------------------- */

        /**
         * Clone a document, creating a new document by combining current data with provided overrides.
         * The cloned document is ephemeral and not yet saved to the database.
         * @param {Object} [data={}]                    Additional data which overrides current document data at the time of creation
         * @param {DocumentConstructionContext} [context={}] Additional context options passed to the create method
         * @param {boolean} [context.save=false]             Save the clone to the World database?
         * @param {boolean} [context.keepId=false]           Keep the same ID of the original document
         * @returns {Document|Promise<Document>}        The cloned Document instance
         */
        clone(data={}, {save=false, keepId=false, ...context}={}) {
            if ( !keepId ) data["-=_id"] = null;
            context.parent = this.parent;
            context.pack = this.pack;
            context.strict = false;
            const doc = super.clone(data, context);
            return save ? this.constructor.create(doc, context) : doc;
        }

        /* -------------------------------------------- */

        /**
         * For Documents which include game system data, migrate the system data object to conform to its latest data model.
         * The data model is defined by the template.json specification included by the game system.
         * @returns {object}              The migrated system data object
         */
        migrateSystemData() {
            if ( !this.constructor.hasSystemData ) {
                throw new Error(`The ${this.documentName} Document does not include a SystemDataField.`);
            }
            const model = game.model[this.documentName]?.[this["type"]] || {};
            return mergeObject(model, this["system"], {
                insertKeys: false,
                insertValues: true,
                enforceTypes: false,
                overwrite: true,
                inplace: false
            });
        }

        /* -------------------------------------------- */
        /*  Database Operations                         */
        /* -------------------------------------------- */

        /**
         * Create multiple Documents using provided input data.
         * Data is provided as an array of objects where each individual object becomes one new Document.
         *
         * @param {object[]} data                     An array of data objects used to create multiple documents
         * @param {DocumentModificationContext} [context={}] Additional context which customizes the creation workflow
         * @return {Promise<Document[]>}              An array of created Document instances
         *
         * @example Create a single Document
         * ```js
         * const data = [{name: "New Actor", type: "character", img: "path/to/profile.jpg"}];
         * const created = await Actor.createDocuments(data);
         * ```
         *
         * @example Create multiple Documents
         * ```js
         * const data = [{name: "Tim", type: "npc"], [{name: "Tom", type: "npc"}];
         * const created = await Actor.createDocuments(data);
         * ```
         *
         * @example Create multiple embedded Documents within a parent
         * ```js
         * const actor = game.actors.getName("Tim");
         * const data = [{name: "Sword", type: "weapon"}, {name: "Breastplate", type: "equipment"}];
         * const created = await Item.createDocuments(data, {parent: actor});
         * ```
         *
         * @example Create a Document within a Compendium pack
         * ```js
         * const data = [{name: "Compendium Actor", type: "character", img: "path/to/profile.jpg"}];
         * const created = await Actor.createDocuments(data, {pack: "mymodule.mypack"});
         * ```
         */
        static async createDocuments(data=[], context={}) {
            if ( context.parent?.pack ) context.pack = context.parent.pack;
            const {parent, pack, ...options} = context;
            const created = await this.database.create(this.implementation, {data, options, parent, pack});
            await this._onCreateDocuments(created, context);
            return created;
        }

        /* -------------------------------------------- */

        /**
         * Update multiple Document instances using provided differential data.
         * Data is provided as an array of objects where each individual object updates one existing Document.
         *
         * @param {object[]} updates                  An array of differential data objects, each used to update a single Document
         * @param {DocumentModificationContext} [context={}] Additional context which customizes the update workflow
         * @return {Promise<Document[]>}              An array of updated Document instances
         *
         * @example Update a single Document
         * ```js
         * const updates = [{_id: "12ekjf43kj2312ds", name: "Timothy"}];
         * const updated = await Actor.updateDocuments(updates);
         * ```
         *
         * @example Update multiple Documents
         * ```js
         * const updates = [{_id: "12ekjf43kj2312ds", name: "Timothy"}, {_id: "kj549dk48k34jk34", name: "Thomas"}]};
         * const updated = await Actor.updateDocuments(updates);
         * ```
         *
         * @example Update multiple embedded Documents within a parent
         * ```js
         * const actor = game.actors.getName("Timothy");
         * const updates = [{_id: sword.id, name: "Magic Sword"}, {_id: shield.id, name: "Magic Shield"}];
         * const updated = await Item.updateDocuments(updates, {parent: actor});
         * ```
         *
         * @example Update Documents within a Compendium pack
         * ```js
         * const actor = await pack.getDocument(documentId);
         * const updated = await Actor.updateDocuments([{_id: actor.id, name: "New Name"}], {pack: "mymodule.mypack"});
         * ```
         */
        static async updateDocuments(updates=[], context={}) {
            if ( context.parent?.pack ) context.pack = context.parent.pack;
            const {parent, pack, ...options} = context;
            const updated = await this.database.update(this.implementation, {updates, options, parent, pack});
            await this._onUpdateDocuments(updated, context);
            return updated;
        }

        /* -------------------------------------------- */

        /**
         * Delete one or multiple existing Documents using an array of provided ids.
         * Data is provided as an array of string ids for the documents to delete.
         *
         * @param {string[]} ids                      An array of string ids for the documents to be deleted
         * @param {DocumentModificationContext} [context={}] Additional context which customizes the deletion workflow
         * @return {Promise<Document[]>}              An array of deleted Document instances
         *
         * @example Delete a single Document
         * ```js
         * const tim = game.actors.getName("Tim");
         * const deleted = await Actor.deleteDocuments([tim.id]);
         * ```
         *
         * @example Delete multiple Documents
         * ```js
         * const tim = game.actors.getName("Tim");
         * const tom = game.actors.getName("Tom");
         * const deleted = await Actor.deleteDocuments([tim.id, tom.id]);
         * ```
         *
         * @example Delete multiple embedded Documents within a parent
         * ```js
         * const tim = game.actors.getName("Tim");
         * const sword = tim.items.getName("Sword");
         * const shield = tim.items.getName("Shield");
         * const deleted = await Item.deleteDocuments([sword.id, shield.id], parent: actor});
         * ```
         *
         * @example Delete Documents within a Compendium pack
         * ```js
         * const actor = await pack.getDocument(documentId);
         * const deleted = await Actor.deleteDocuments([actor.id], {pack: "mymodule.mypack"});
         * ```
         */
        static async deleteDocuments(ids=[], context={}) {
            if ( context.parent?.pack ) context.pack = context.parent.pack;
            const {parent, pack, ...options} = context;
            const deleted = await this.database.delete(this.implementation, {ids, options, parent, pack});
            await this._onDeleteDocuments(deleted, context);
            return deleted;
        }

        /* -------------------------------------------- */

        /**
         * Create a new Document using provided input data, saving it to the database.
         * @see {@link Document.createDocuments}
         * @param {object} [data={}]                  Initial data used to create this Document
         * @param {DocumentModificationContext} [context={}] Additional context which customizes the creation workflow
         * @return {Promise<Document>}                The created Document instance
         *
         * @example Create a World-level Item
         * ```js
         * const data = [{name: "Special Sword", type: "weapon"}];
         * const created = await Item.create(data);
         * ```
         *
         * @example Create an Actor-owned Item
         * ```js
         * const data = [{name: "Special Sword", type: "weapon"}];
         * const actor = game.actors.getName("My Hero");
         * const created = await Item.create(data, {parent: actor});
         * ```
         *
         * @example Create an Item in a Compendium pack
         * ```js
         * const data = [{name: "Special Sword", type: "weapon"}];
         * const created = await Item.create(data, {pack: "mymodule.mypack"});
         * ```
         */
        static async create(data, context={}) {
            const createData = data instanceof Array ? data : [data];
            const created = await this.createDocuments(createData, context);
            return data instanceof Array ? created : created.shift();
        }

        /* -------------------------------------------- */

        /**
         * Update this Document using incremental data, saving it to the database.
         * @see {@link Document.updateDocuments}
         * @param {object} [data={}]                  Differential update data which modifies the existing values of this document data
         * @param {DocumentModificationContext} [context={}] Additional context which customizes the update workflow
         * @returns {Promise<Document>}               The updated Document instance
         */
        async update(data={}, context={}) {
            data._id = this.id;
            context.parent = this.parent;
            context.pack = this.pack;
            const updates = await this.constructor.updateDocuments([data], context);
            return updates.shift();
        }

        /* -------------------------------------------- */

        /**
         * Delete this Document, removing it from the database.
         * @see {@link Document.deleteDocuments}
         * @param {DocumentModificationContext} [context={}] Additional context which customizes the deletion workflow
         * @returns {Promise<Document>}               The deleted Document instance
         */
        async delete(context={}) {
            context.parent = this.parent;
            context.pack = this.pack;
            const deleted = await this.constructor.deleteDocuments([this.id], context);
            return deleted.shift();
        }

        /* -------------------------------------------- */

        /**
         * Get a World-level Document of this type by its id.
         * @param {string} documentId         The Document ID
         * @returns {abstract.Document|null}  The retrieved Document, or null
         */
        static get(documentId) {
            const collection = game.collections?.get(this.documentName);
            return collection?.get(documentId) || null;
        }

        /* -------------------------------------------- */
        /*  Embedded Operations                         */
        /* -------------------------------------------- */

        /**
         * Obtain a reference to the Array of source data within the data object for a certain embedded Document name
         * @param {string} embeddedName   The name of the embedded Document type
         * @return {Collection}           The Collection instance of embedded Documents of the requested type
         */
        getEmbeddedCollection(embeddedName) {
            const collectionName = this.constructor.metadata.embedded[embeddedName];
            if ( !collectionName ) {
                throw new Error(`${embeddedName} is not a valid embedded Document within the ${this.documentName} Document`);
            }
            return this[collectionName];
        }

        /* -------------------------------------------- */

        /**
         * Get an embedded document by it's id from a named collection in the parent document.
         * @param {string} embeddedName   The name of the embedded Document type
         * @param {string} id             The id of the child document to retrieve
         * @param {object} [options]      Additional options which modify how embedded documents are retrieved
         * @param {boolean} [options.strict=false] Throw an Error if the requested id does not exist. See Collection#get
         * @return {Document}             The retrieved embedded Document instance, or undefined
         */
        getEmbeddedDocument(embeddedName, id, {strict=false}={}) {
            const collection = this.getEmbeddedCollection(embeddedName);
            return collection.get(id, {strict});
        }

        /* -------------------------------------------- */

        /**
         * Create multiple embedded Document instances within this parent Document using provided input data.
         * @see {@link Document.createDocuments}
         * @param {string} embeddedName               The name of the embedded Document type
         * @param {object[]} data                     An array of data objects used to create multiple documents
         * @param {DocumentModificationContext} [context={}] Additional context which customizes the creation workflow
         * @return {Promise<Document[]>}              An array of created Document instances
         */
        async createEmbeddedDocuments(embeddedName, data=[], context={}) {
            this.getEmbeddedCollection(embeddedName); // Validation only
            context.parent = this;
            context.pack = this.pack;
            const cls = getDocumentClass(embeddedName);
            return cls.createDocuments(data, context);
        }

        /* -------------------------------------------- */

        /**
         * Update multiple embedded Document instances within a parent Document using provided differential data.
         * @see {@link Document.updateDocuments}
         * @param {string} embeddedName               The name of the embedded Document type
         * @param {object[]} updates                  An array of differential data objects, each used to update a single Document
         * @param {DocumentModificationContext} [context={}] Additional context which customizes the update workflow
         * @return {Promise<Document[]>}              An array of updated Document instances
         */
        async updateEmbeddedDocuments(embeddedName, updates=[], context={}) {
            this.getEmbeddedCollection(embeddedName); // Validation only
            context.parent = this;
            context.pack = this.pack;
            const cls = getDocumentClass(embeddedName);
            return cls.updateDocuments(updates, context);
        }

        /* -------------------------------------------- */

        /**
         * Delete multiple embedded Document instances within a parent Document using provided string ids.
         * @see {@link Document.deleteDocuments}
         * @param {string} embeddedName               The name of the embedded Document type
         * @param {string[]} ids                      An array of string ids for each Document to be deleted
         * @param {DocumentModificationContext} [context={}] Additional context which customizes the deletion workflow
         * @return {Promise<Document[]>}              An array of deleted Document instances
         */
        async deleteEmbeddedDocuments(embeddedName, ids, context={}) {
            this.getEmbeddedCollection(embeddedName); // Validation only
            context.parent = this;
            context.pack = this.pack;
            const cls = getDocumentClass(embeddedName);
            return cls.deleteDocuments(ids, context);
        }

        /* -------------------------------------------- */
        /*  Flag Operations                             */
        /* -------------------------------------------- */

        /**
         * Get the value of a "flag" for this document
         * See the setFlag method for more details on flags
         *
         * @param {string} scope        The flag scope which namespaces the key
         * @param {string} key          The flag key
         * @return {*}                  The flag value
         */
        getFlag(scope, key) {
            const scopes = this.constructor.database.getFlagScopes();
            if ( !scopes.includes(scope) ) throw new Error(`Flag scope "${scope}" is not valid or not currently active`);
            return getProperty(this.flags?.[scope], key);
        }

        /* -------------------------------------------- */

        /**
         * Assign a "flag" to this document.
         * Flags represent key-value type data which can be used to store flexible or arbitrary data required by either
         * the core software, game systems, or user-created modules.
         *
         * Each flag should be set using a scope which provides a namespace for the flag to help prevent collisions.
         *
         * Flags set by the core software use the "core" scope.
         * Flags set by game systems or modules should use the canonical name attribute for the module
         * Flags set by an individual world should "world" as the scope.
         *
         * Flag values can assume almost any data type. Setting a flag value to null will delete that flag.
         *
         * @param {string} scope        The flag scope which namespaces the key
         * @param {string} key          The flag key
         * @param {*} value             The flag value
         * @return {Promise<Document>}  A Promise resolving to the updated document
         */
        async setFlag(scope, key, value) {
            const scopes = this.constructor.database.getFlagScopes();
            if ( !scopes.includes(scope) ) throw new Error(`Flag scope "${scope}" is not valid or not currently active`);
            return this.update({
                flags: {
                    [scope]: {
                        [key]: value
                    }
                }
            });
        }

        /* -------------------------------------------- */

        /**
         * Remove a flag assigned to the document
         * @param {string} scope        The flag scope which namespaces the key
         * @param {string} key          The flag key
         * @return {Promise<Document>}  The updated document instance
         */
        async unsetFlag(scope, key) {
            const scopes = this.constructor.database.getFlagScopes();
            if ( !scopes.includes(scope) ) throw new Error(`Flag scope "${scope}" is not valid or not currently active`);
            const head = key.split(".");
            const tail = `-=${head.pop()}`;
            key = ["flags", scope, ...head, tail].join(".");
            return this.update({[key]: null});
        }

        /* -------------------------------------------- */
        /*  Socket Event Handlers                       */
        /* -------------------------------------------- */

        /**
         * Perform preliminary operations before a Document of this type is created.
         * Pre-creation operations only occur for the client which requested the operation.
         * Modifications to the pending document before it is persisted should be performed with this.updateSource().
         * @param {object} data               The initial data object provided to the document creation request
         * @param {object} options            Additional options which modify the creation request
         * @param {documents.BaseUser} user   The User requesting the document creation
         * @protected
         */
        async _preCreate(data, options, user) {}

        /**
         * Perform preliminary operations before a Document of this type is updated.
         * Pre-update operations only occur for the client which requested the operation.
         * @param {object} changed            The differential data that is changed relative to the documents prior values
         * @param {object} options            Additional options which modify the update request
         * @param {documents.BaseUser} user   The User requesting the document update
         * @protected
         */
        async _preUpdate(changed, options, user) {}

        /**
         * Perform preliminary operations before a Document of this type is deleted.
         * Pre-delete operations only occur for the client which requested the operation.
         * @param {object} options            Additional options which modify the deletion request
         * @param {documents.BaseUser} user   The User requesting the document deletion
         * @protected
         */
        async _preDelete(options, user) {}

        /**
         * Perform follow-up operations after a Document of this type is created.
         * Post-creation operations occur for all clients after the creation is broadcast.
         * @param {object} data               The initial data object provided to the document creation request
         * @param {object} options            Additional options which modify the creation request
         * @param {string} userId             The id of the User requesting the document update
         * @protected
         */
        _onCreate(data, options, userId) {}

        /**
         * Perform follow-up operations after a Document of this type is updated.
         * Post-update operations occur for all clients after the update is broadcast.
         * @param {object} changed            The differential data that was changed relative to the documents prior values
         * @param {object} options            Additional options which modify the update request
         * @param {string} userId             The id of the User requesting the document update
         * @protected
         */
        _onUpdate(changed, options, userId) {}

        /**
         * Perform follow-up operations after a Document of this type is deleted.
         * Post-deletion operations occur for all clients after the deletion is broadcast.
         * @param {object} options            Additional options which modify the deletion request
         * @param {string} userId             The id of the User requesting the document update
         * @protected
         */
        _onDelete(options, userId) {}

        /**
         * Perform follow-up operations when a set of Documents of this type are created.
         * This is where side effects of creation should be implemented.
         * Post-creation side effects are performed only for the client which requested the operation.
         * @param {Document[]} documents                    The Document instances which were created
         * @param {DocumentModificationContext} context     The context for the modification operation
         * @protected
         */
        static async _onCreateDocuments(documents, context) {}

        /**
         * Perform follow-up operations when a set of Documents of this type are updated.
         * This is where side effects of updates should be implemented.
         * Post-update side effects are performed only for the client which requested the operation.
         * @param {Document[]} documents                    The Document instances which were updated
         * @param {DocumentModificationContext} context     The context for the modification operation
         * @protected
         */
        static async _onUpdateDocuments(documents, context) {}

        /**
         * Perform follow-up operations when a set of Documents of this type are deleted.
         * This is where side effects of deletion should be implemented.
         * Post-deletion side effects are performed only for the client which requested the operation.
         * @param {Document[]} documents                    The Document instances which were deleted
         * @param {DocumentModificationContext} context     The context for the modification operation
         * @protected
         */
        static async _onDeleteDocuments(documents, context) {}

        /* -------------------------------------------- */
        /*  Deprecations and Compatibility              */
        /* -------------------------------------------- */

        /**
         * Configure whether V10 Document Model migration warnings should be logged for this class.
         * @ignore
         */
        static LOG_V10_COMPATIBILITY_WARNINGS = true;

        /**
         * @deprecated since v10
         * @ignore
         */
        get data() {
            this.constructor._logV10CompatibilityWarning();
            const data = {
                constructor: this.constructor,
                document: this,
                reset: () => this.reset(),
                schema: this.schema,
                update: (changes, options) => {
                    this.constructor.migrateData(foundry.utils.expandObject(changes));
                    this.updateSource(changes, options);
                },
                validate: options => this.validate(options),
                _source: this._source,
                toObject: source => this.toObject(source),
                toJSON: () => this.toJSON(),
            };
            for ( const k of this.schema.keys() ) {
                data[k] = this[k];
            }
            return this.constructor.shimData(data, {embedded: false});
        }

        /* ---------------------------------------- */

        /** @inheritdoc */
        toObject(source=true) {
            const data = super.toObject(source);
            return this.constructor.shimData(data);
        }

        /* ---------------------------------------- */

        /**
         * A reusable helper for adding migration shims.
         * @protected
         * @ignore
         */
        static _addDataFieldShims(data, shims, options) {
            for ( const [oldKey, newKey] of Object.entries(shims) ) {
                this._addDataFieldShim(data, oldKey, newKey, options);
            }
        }

        /* ---------------------------------------- */

        /**
         * A reusable helper for adding a migration shim
         * @protected
         * @ignore
         */
        static _addDataFieldShim(data, oldKey, newKey, options={}) {
            if ( hasProperty(data, newKey) && !data.hasOwnProperty(oldKey) ) {
                Object.defineProperty(data, oldKey, {
                    get: () => {
                        this._logDataFieldMigration(oldKey, newKey, options);
                        return ("value" in options) ? options.value : getProperty(data, newKey);
                    },
                    set: value => setProperty(data, newKey, value),
                    configurable: true,
                    enumerable: false
                });
            }
        }

        /* ---------------------------------------- */

        /**
         * Define a simple migration from one field name to another.
         * The value of the data can be transformed during the migration by an optional application function.
         * @param {object} data     The data object being migrated
         * @param {string} oldKey   The old field name
         * @param {string} newKey   The new field name
         * @param {function(data: object): any} [apply] An application function, otherwise the old value is applied
         * @internal
         */
        static _addDataFieldMigration(data, oldKey, newKey, apply) {
            if ( !hasProperty(data, newKey) && hasProperty(data, oldKey) ) {
                const prop = Object.getOwnPropertyDescriptor(data, oldKey);
                if ( !prop.writable ) return;
                setProperty(data, newKey, apply ? apply(data) : getProperty(data, oldKey));
                delete data[oldKey];
            }
        }

        /* ---------------------------------------- */

        /** @protected */
        static _logDataFieldMigration(oldKey, newKey, options={}) {
            const mode = this.LOG_V10_COMPATIBILITY_WARNINGS ? undefined : COMPATIBILITY_MODES.SILENT;
            const msg = `You are accessing ${this.name}#${oldKey} which has been migrated to ${this.name}#${newKey}`;
            return logCompatibilityWarning(msg, {mode, ...options})
        }

        /* ---------------------------------------- */

        /** @protected */
        static _logV10CompatibilityWarning(options) {
            const mode = this.LOG_V10_COMPATIBILITY_WARNINGS ? undefined : COMPATIBILITY_MODES.SILENT;
            const msg = `You are accessing the ${this.name}#data object which is no longer used. ` +
                "Since V10 the Document class and its contained DataModel are merged into a combined data structure. " +
                "You should now reference keys which were previously contained within the data object directly.";
            return logCompatibilityWarning(msg, {mode, ...options});
        }
    }

    /**
     * An interface shared by both the client and server-side which defines how creation, update, and deletion operations are transacted.
     * @abstract
     * @interface
     * @memberof abstract
     */
    class DatabaseBackend {

        /* -------------------------------------------- */
        /*  Get Operations                              */
        /* -------------------------------------------- */

        /**
         * Retrieve Documents based on provided query parameters
         * @param {Function} documentClass        The Document definition
         * @param {object} request                The requested operation
         * @param {BaseUser} [user]               The requesting User
         * @returns {Promise<Document[]>}         The created Document instances
         */
        async get(documentClass, request, user) {
            const parent = await this._getParent(request);
            request = this._getArgs(request);
            if ( parent ) return this._getEmbeddedDocuments(documentClass, parent, request, user);
            else return this._getDocuments(documentClass, request, user);
        }

        /* -------------------------------------------- */

        /**
         * Validate the arguments passed to the get operation
         * @param {object} request                The requested operation
         * @param {object} [request.query={}]     A document search query to execute
         * @param {object} [request.options={}]   Operation options
         * @param {string} [request.pack]         A Compendium pack identifier
         * @private
         */
        _getArgs({query={}, options={}, pack}={}) {
            options = mergeObject({index: false}, options);
            if ( pack && !this.getCompendiumScopes().includes(pack) ) {
                throw new Error(`Compendium pack ${pack} is not a valid Compendium identifier`);
            }
            options.broadcast = false; // never broadcast get requests
            return {query, options, pack};
        }

        /* -------------------------------------------- */

        /**
         * Get primary Document instances
         * @protected
         */
        async _getDocuments(documentClass, request, user) {}

        /* -------------------------------------------- */

        /**
         * Get embedded Document instances
         * @protected
         */
        async _getEmbeddedDocuments(documentClass, parent, request, user) {}

        /* -------------------------------------------- */

        /**
         * Get the parent Document (if any) associated with a request
         * @param {object} request                The requested operation
         * @return {Promise<Document|null>}       The parent Document, or null
         * @private
         */
        async _getParent(request) {
            if ( !request.parent ) return null;
            if ( !(request.parent instanceof Document) ) {
                throw new Error("A parent Document provided to the database operation must be a Document instance");
            }
            return request.parent;
        }

        /* -------------------------------------------- */
        /*  Create Operations                           */
        /* -------------------------------------------- */

        /**
         * Perform document creation operations
         * @param {Function} documentClass        The Document definition
         * @param {object} request                The requested operation
         * @param {BaseUser} [user]               The requesting User
         * @returns {Promise<Document[]>}         The created Document instances
         */
        async create(documentClass, request, user) {
            const parent = await this._getParent(request);
            request = this._createArgs(request);
            if ( parent ) return this._createEmbeddedDocuments(documentClass, parent, request, user);
            else return this._createDocuments(documentClass, request, user);
        }

        /* -------------------------------------------- */

        /**
         * Validate the arguments passed to the create operation
         * @param {object} request                The requested operation
         * @param {object[]} request.data         An array of document data
         * @param {object} [request.options={}]   Operation options
         * @param {string} [request.pack]         A Compendium pack identifier
         * @private
         */
        _createArgs({data=[], options={}, pack}={}) {
            if ( !(data instanceof Array) ) {
                throw new Error("The data provided to the DatabaseBackend#create operation must be an array of data objects");
            }
            options = mergeObject({temporary: false, renderSheet: false, render: true}, options);
            if ( pack && !this.getCompendiumScopes().includes(pack) ) {
                throw new Error(`Compendium pack ${pack} is not a valid Compendium identifier`);
            }
            if ( options.temporary ) options.noHook = true;
            return {data, options, pack};
        }

        /* -------------------------------------------- */

        /**
         * Create primary Document instances
         * @returns {Promise<Document[]>}
         * @protected
         */
        async _createDocuments(documentClass, request, user) {}

        /* -------------------------------------------- */

        /**
         * Create embedded Document instances
         * @returns {Promise<Document[]>}
         * @protected
         */
        async _createEmbeddedDocuments(documentClass, parent, request, user) {}

        /* -------------------------------------------- */
        /*  Update Operations                           */
        /* -------------------------------------------- */

        /**
         * Perform document update operations
         * @param {Function} documentClass        The Document definition
         * @param {object} request                The requested operation
         * @param {BaseUser} [user]               The requesting User
         * @returns {Promise<Document[]>}         The updated Document instances
         */
        async update(documentClass, request, user) {
            const parent = await this._getParent(request);
            request = this._updateArgs(request);
            if ( parent ) return this._updateEmbeddedDocuments(documentClass, parent, request, user);
            else return this._updateDocuments(documentClass, request, user);
        }

        /* -------------------------------------------- */

        /**
         * Validate the arguments passed to the update operation
         * @param {object} request                The requested operation
         * @param {object[]} request.updates      An array of document data
         * @param {object} [request.options={}]   Operation options
         * @param {string} [request.pack]         A Compendium pack identifier
         * @private
         */
        _updateArgs({updates=[], options={}, pack}={}) {
            if ( !(updates instanceof Array) ) {
                throw new Error("The updates provided to the DatabaseBackend#update operation must be an array of data objects");
            }
            options = mergeObject({diff: true, render: true}, options);
            if ( pack && !this.getCompendiumScopes().includes(pack) ) {
                throw new Error(`Compendium pack ${pack} is not a valid Compendium identifier`);
            }
            return {updates, options, pack};
        }

        /* -------------------------------------------- */

        /**
         * Update primary Document instances
         * @returns {Promise<Document[]>}
         * @protected
         */
        async _updateDocuments(documentClass, request, user) {
            throw new Error("An implementation of the DatabaseBackend must define the _updateDocuments method");
        }

        /* -------------------------------------------- */

        /**
         * Update embedded Document instances
         * @returns {Promise<Document[]>}
         * @protected
         */
        async _updateEmbeddedDocuments(documentClass, parent, request, user) {
            throw new Error("An implementation of the DatabaseBackend must define the _updateEmbeddedDocuments method");
        }

        /* -------------------------------------------- */
        /*  Delete Operations                           */
        /* -------------------------------------------- */

        /**
         * Perform document deletion operations
         * @param {Function} documentClass        The Document definition
         * @param {object} request                The requested operation
         * @param {BaseUser} [user]               The requesting User
         * @returns {Promise<Document[]>}         The deleted Document instances
         */
        async delete(documentClass, request, user) {
            const parent = await this._getParent(request);
            request = this._deleteArgs(request);
            if ( parent ) return this._deleteEmbeddedDocuments(documentClass, parent, request, user);
            else return this._deleteDocuments(documentClass, request, user);
        }

        /* -------------------------------------------- */

        /**
         * Validate the arguments passed to the delete operation
         * @param {object} request                The requested operation
         * @param {string[]} request.ids          An array of document ids
         * @param {object} [request.options={}]   Operation options
         * @param {string} [request.pack]         A Compendium pack identifier
         * @private
         */
        _deleteArgs({ids=[], options={}, pack}={}) {
            if ( !(ids instanceof Array) ) {
                throw new Error("The document ids provided to the DatabaseBackend#delete operation must be an array of strings");
            }
            options = mergeObject({render: true}, options);
            if ( pack && !this.getCompendiumScopes().includes(pack) ) {
                throw new Error(`Compendium pack ${pack} is not a valid Compendium identifier`);
            }
            return {ids, options, pack};
        }

        /* -------------------------------------------- */

        /**
         * Delete primary Document instances
         * @returns {Promise<Document[]>}
         * @protected
         */
        async _deleteDocuments(documentClass, request, user) {}

        /* -------------------------------------------- */

        /**
         * Delete embedded Document instances
         * @returns {Promise<Document[]>}
         * @protected
         */
        async _deleteEmbeddedDocuments(documentClass, parent, request, user) {}

        /* -------------------------------------------- */
        /*  Helper Methods                              */
        /* -------------------------------------------- */

        /**
         * Describe the scopes which are suitable as the namespace for a flag key
         * @returns {string[]}
         */
        getFlagScopes() {}

        /* -------------------------------------------- */

        /**
         * Describe the scopes which are suitable as the namespace for a flag key
         * @returns {string[]}
         */
        getCompendiumScopes() {}

        /* -------------------------------------------- */

        /**
         * Provide the Logger implementation that should be used for database operations
         * @return {Logger|Console}
         * @protected
         */
        _getLogger() {
            return globalThis?.config?.logger ?? console;
        }

        /* -------------------------------------------- */

        /**
         * Log a database operation for an embedded document, capturing the action taken and relevant IDs
         * @param {string} action                       The action performed
         * @param {string} type                         The document type
         * @param {abstract.Document[]} documents       The documents modified
         * @param {string} [level=info]                 The logging level
         * @param {abstract.Document} [parent]          A parent document
         * @param {string} [pack]                       A compendium pack within which the operation occurred
         * @protected
         */
        _logOperation(action, type, documents, {parent, pack, level="info"}={}) {
            const logger = this._getLogger();
            let msg = (documents.length === 1) ? `${action} ${type}` : `${action} ${documents.length} ${type} documents`;
            if (documents.length === 1) msg += ` with id [${documents[0].id}]`;
            else if (documents.length <= 5) msg += ` with ids: [${documents.map(d => d.id)}]`;
            msg += this._logContext({parent, pack});
            logger[level](`${vtt} | ${msg}`);
        }

        /* -------------------------------------------- */

        /**
         * Construct a standardized error message given the context of an attempted operation
         * @returns {string}
         * @protected
         */
        _logError(user, action, subject, {parent, pack}={}) {
            if ( subject instanceof Document ) {
                subject = subject.id ? `${subject.documentName} [${subject.id}]` : `a new ${subject.documentName}`;
            }
            let msg = `User ${user.name} lacks permission to ${action} ${subject}`;
            return msg + this._logContext({parent, pack});
        }

        /* -------------------------------------------- */

        /**
         * Determine a string suffix for a log message based on the parent and/or compendium context.
         * @returns {string}
         * @private
         */
        _logContext({parent, pack}={}) {
            let context = "";
            if ( parent ) {
                const parentName = parent.constructor.metadata.name;
                context += ` in parent ${parentName} [${parent.id}]`;
            }
            if ( pack ) {
                context += ` in Compendium ${pack}`;
            }
            return context;
        }
    }

    /**
     * @deprecated since v10
     * @see DataModel
     * @ignore
     */
    class DocumentData extends DataModel {
        constructor(...args) {
            foundry.utils.logCompatibilityWarning("You are using the DocumentData class which has been renamed to DataModel.",
                {since: 10, until: 12});
            super(...args);
        }
    }

    var abstract = /*#__PURE__*/Object.freeze({
        __proto__: null,
        DocumentData: DocumentData,
        Document: Document,
        DatabaseBackend: DatabaseBackend,
        EmbeddedCollection: EmbeddedCollection,
        DataModel: DataModel
    });

    /**
     * @typedef {Object} ActiveEffectData
     * @property {string} _id                 The _id which uniquely identifies the ActiveEffect within a parent Actor or Item
     * @property {string} label               A text label which describes the name of the ActiveEffect
     * @property {EffectChangeData[]} changes The array of EffectChangeData objects which the ActiveEffect applies
     * @property {boolean} [disabled=false]   Is this ActiveEffect currently disabled?
     * @property {EffectDurationData} [duration] An EffectDurationData object which describes the duration of the ActiveEffect
     * @property {string} [icon]              An icon image path used to depict the ActiveEffect
     * @property {string} [origin]            A UUID reference to the document from which this ActiveEffect originated
     * @property {string} [tint=null]         A color string which applies a tint to the ActiveEffect icon
     * @property {boolean} [transfer=false]   Does this ActiveEffect automatically transfer from an Item to an Actor?
     * @property {object} [flags]             An object of optional key/value flags
     */

    /**
     * @typedef {Object} EffectDurationData
     * @property {number} [startTime]         The world time when the active effect first started
     * @property {number} [seconds]           The maximum duration of the effect, in seconds
     * @property {string} [combat]            The _id of the CombatEncounter in which the effect first started
     * @property {number} [rounds]            The maximum duration of the effect, in combat rounds
     * @property {number} [turns]             The maximum duration of the effect, in combat turns
     * @property {number} [startRound]        The round of the CombatEncounter in which the effect first started
     * @property {number} [startTurn]         The turn of the CombatEncounter in which the effect first started
     */

    /**
     * @typedef {Object} EffectChangeData
     * @property {string} key                 The attribute path in the Actor or Item data which the change modifies
     * @property {string} value               The value of the change effect
     * @property {number} mode                The modification mode with which the change is applied
     * @property {number} priority            The priority level with which this change is applied
     */

    /**
     * The data schema for an ActiveEffect document.
     * @extends abstract.Document
     * @mixes ActiveEffectData
     * @memberof documents
     *
     * @param {ActiveEffectData} data                 Initial data from which to construct the ActiveEffect
     * @param {DocumentConstructionContext} context   Construction context options
     */
    class BaseActiveEffect extends Document {

        /* -------------------------------------------- */
        /*  Model Configuration                         */
        /* -------------------------------------------- */

        /** @inheritdoc */
        static metadata = Object.freeze(mergeObject(super.metadata, {
            name: "ActiveEffect",
            collection: "effects",
            label: "DOCUMENT.ActiveEffect",
            labelPlural: "DOCUMENT.ActiveEffects"
        }, {inplace: false}));

        /* -------------------------------------------- */

        /** @inheritdoc */
        static defineSchema() {
            return {
                _id: new DocumentIdField(),
                changes: new ArrayField(new SchemaField({
                    key: new StringField({required: true, label: "EFFECT.ChangeKey"}),
                    value: new StringField({required: true, label: "EFFECT.ChangeValue"}),
                    mode: new NumberField({integer: true, initial: ACTIVE_EFFECT_MODES.ADD,
                        label: "EFFECT.ChangeMode"}),
                    priority: new NumberField()
                })),
                disabled: new BooleanField(),
                duration: new SchemaField({
                    startTime: new NumberField({initial: null, label: "EFFECT.StartTime"}),
                    seconds: new NumberField({integer: true, min: 0, label: "EFFECT.DurationSecs"}),
                    combat: new ForeignDocumentField(BaseCombat$1, {label: "EFFECT.Combat"}),
                    rounds: new NumberField({integer: true, min: 0}),
                    turns: new NumberField({integer: true, min: 0, label: "EFFECT.DurationTurns"}),
                    startRound: new NumberField({integer: true, min: 0}),
                    startTurn: new NumberField({integer: true, min: 0, label: "EFFECT.StartTurns"})
                }),
                icon: new FilePathField({categories: ["IMAGE"], label: "EFFECT.Icon"}),
                label: new StringField({required: true, label: "EFFECT.Label"}),
                origin: new StringField({nullable: true, blank: false, initial: null, label: "EFFECT.Origin"}),
                tint: new ColorField({label: "EFFECT.IconTint"}),
                transfer: new BooleanField({initial: true, label: "EFFECT.Transfer"}),
                flags: new ObjectField()
            }
        }

        /* -------------------------------------------- */
        /*  Model Methods                               */
        /* -------------------------------------------- */

        /** @inheritdoc */
        testUserPermission(user, permission, {exact=false}={}) {
            if ( this.isEmbedded ) return this.parent.testUserPermission(user, permission, {exact});
            return super.testUserPermission(user, permission, {exact});
        }

        /* -------------------------------------------- */
        /*  Database Event Handlers                     */
        /* -------------------------------------------- */

        /** @inheritdoc */
        async _preCreate(data, options, user) {
            if ( this.parent instanceof BaseActor$1 ) {
                this.updateSource({transfer: false});
            }
        }

        /* -------------------------------------------- */
        /*  Deprecations and Compatibility              */
        /* -------------------------------------------- */

        /** @inheritDoc */
        static migrateData(data) {
            if ( "changes" in data ) {
                for ( const change of data.changes ) {
                    change.key = change.key.replace(/^data\./, "system.");
                }
            }
            return data;
        }
    }

    /**
     * @typedef {Object} ActorData
     * @property {string} _id                 The _id which uniquely identifies this Actor document
     * @property {string} name                The name of this Actor
     * @property {string} type                An Actor subtype which configures the system data model applied
     * @property {string} [img]               An image file path which provides the artwork for this Actor
     * @property {object} [system]            The system data object which is defined by the system template.json model
     * @property {data.PrototypeToken} [prototypeToken] Default Token settings which are used for Tokens created from
     *                                        this Actor
     * @property {Collection<documents.BaseItem>} items A Collection of Item embedded Documents
     * @property {Collection<documents.BaseActiveEffect>} effects A Collection of ActiveEffect embedded Documents
     * @property {string|null} folder         The _id of a Folder which contains this Actor
     * @property {number} [sort]              The numeric sort value which orders this Actor relative to its siblings
     * @property {object} [ownership]         An object which configures ownership of this Actor
     * @property {object} [flags]             An object of optional key/value flags
     * @property {DocumentStats} [_stats]     An object of creation and access information.
     */

    /**
     * The Document definition for an Actor.
     * Defines the DataSchema and common behaviors for an Actor which are shared between both client and server.
     * @extends abstract.Document
     * @mixes ActorData
     * @memberof documents
     *
     * @param {ActorData} data                        Initial data from which to construct the Actor
     * @param {DocumentConstructionContext} context   Construction context options
     */
    class BaseActor extends Document {

        /* -------------------------------------------- */
        /*  Model Configuration                         */
        /* -------------------------------------------- */

        /** @inheritdoc */
        static metadata = Object.freeze(Object.defineProperty(mergeObject(super.metadata, {
            name: "Actor",
            collection: "actors",
            indexed: true,
            compendiumIndexFields: ["_id", "name", "img", "type", "sort"],
            embedded: {ActiveEffect: "effects", Item: "items"},
            label: "DOCUMENT.Actor",
            labelPlural: "DOCUMENT.Actors",
            permissions: {
                create: this.#canCreate,
                update: this.#canUpdate
            }
        }, {inplace: false}), "types", {
            get: () => {
                /** @deprecated since v10 */
                globalThis.logger.warn(`${this.name}.metadata.types is deprecated since v10 in favor of ${this.name}.TYPES.`);
                return this.TYPES
            },
            enumerable: false
        }));

        /* ---------------------------------------- */

        /** @inheritdoc */
        static defineSchema() {
            return {
                _id: new DocumentIdField(),
                name: new StringField({required: true, blank: false}),
                type: new StringField({required: true, choices: () => this.TYPES,
                    validationError: "must be in the array of Actor types defined by the game system"}),
                img: new FilePathField({categories: ["IMAGE"], initial: () => this.DEFAULT_ICON}),
                system: new SystemDataField(this),
                prototypeToken: new EmbeddedDataField(PrototypeToken),
                items: new EmbeddedCollectionField(BaseItem$1),
                effects: new EmbeddedCollectionField(BaseActiveEffect),
                folder: new ForeignDocumentField(BaseFolder$1),
                sort: new IntegerSortField(),
                ownership: new DocumentOwnershipField(),
                flags: new ObjectField(),
                _stats: new DocumentStatsField()
            };
        }

        /* ---------------------------------------- */

        /**
         * The default icon used for newly created Actor documents.
         * @type {string}
         */
        static DEFAULT_ICON = DEFAULT_TOKEN;

        /* ---------------------------------------- */

        /**
         * The allowed set of Actor types which may exist.
         * @type {string[]}
         */
        static get TYPES() {
            return game.documentTypes?.Actor || [];
        }

        /* ---------------------------------------- */

        /** @inheritdoc */
        _initializeSource(source, options) {
            source = super._initializeSource(source, options);
            source.prototypeToken.name = source.prototypeToken.name || source.name;
            source.prototypeToken.texture.src = source.prototypeToken.texture.src || source.img;
            return source;
        }

        /* -------------------------------------------- */

        /** @inheritdoc */
        static canUserCreate(user) {
            return user.hasPermission("ACTOR_CREATE");
        }

        /* ---------------------------------------- */

        /**
         * Is a user able to create this actor?
         * @param {User} user  The user attempting the creation operation.
         * @param {Actor} doc  The Actor being created.
         * @private
         */
        static #canCreate(user, doc) {
            if ( user.isGM ) return true;
            if ( doc.prototypeToken.randomImg ) return user.hasPermission("FILES_BROWSE");
            return user.hasPermission("ACTOR_CREATE");
        }

        /* -------------------------------------------- */

        /**
         * Is a user able to update an existing actor?
         * @param {User} user    The user attempting the update operation.
         * @param {Actor} doc    The Actor being updated.
         * @param {object} data  The update delta being applied.
         * @private
         */
        static #canUpdate(user, doc, data) {
            if ( user.isGM ) return true; // GMs can always make changes.
            if ( !doc.testUserPermission(user, "OWNER") ) return false; // Otherwise, ownership is required.

            // Users can only enable token wildcard images if they have FILES_BROWSE permission.
            const tokenChange = data?.prototypeToken || {};
            const enablingRandomImage = tokenChange.randomImg === true;
            if ( enablingRandomImage ) return user.hasPermission("FILES_BROWSE");

            // Users can only change a token wildcard path if they have FILES_BROWSE permission.
            const randomImageEnabled = doc.prototypeToken.randomImg && (tokenChange.randomImg !== false);
            const changingRandomImage = ("img" in tokenChange) && randomImageEnabled;
            if ( changingRandomImage ) return user.hasPermission("FILES_BROWSE");
            return true;
        }

        /* ---------------------------------------- */

        /** @inheritdoc */
        async _preCreate(data, options, user) {
            if ( !this.prototypeToken.name ) this.prototypeToken.updateSource({name: this.name});
            if ( this.img && (!this.prototypeToken.texture.src || (this.prototypeToken.texture.src === DEFAULT_TOKEN))) {
                this.prototypeToken.updateSource({"texture.src": this.img});
            }
        }

        /* ---------------------------------------- */

        /** @inheritdoc */
        async _preUpdate(changed, options, user) {
            await super._preUpdate(changed, options, user);
            if ( changed.img && !getProperty(changed, "prototypeToken.texture.src") ) {
                if ( !this.prototypeToken.texture.src || (this.prototypeToken.texture.src === DEFAULT_TOKEN) ) {
                    setProperty(changed, "prototypeToken.texture.src", changed.img);
                }
            }
        }

        /* -------------------------------------------- */
        /*  Deprecations and Compatibility              */
        /* -------------------------------------------- */

        /** @inheritdoc */
        static migrateData(data) {
            /**
             * Rename data to system
             * @deprecated since v10
             */
            this._addDataFieldMigration(data, "data", "system");

            /**
             * Rename permission to ownership
             * @deprecated since v10
             */
            this._addDataFieldMigration(data, "permission", "ownership");

            /**
             * Prototype token migration
             * @deprecated since v10
             */
            this._addDataFieldMigration(data, "token", "prototypeToken");
            return super.migrateData(data);
        }

        /* ---------------------------------------- */

        /** @inheritdoc */
        static shimData(data, options) {
            this._addDataFieldShim(data, "data", "system", {since: 10, until: 12});
            this._addDataFieldShim(data, "permission", "ownership", {since: 10, until: 12});
            this._addDataFieldShim(data, "token", "prototypeToken", {since: 10, until: 12});
            return super.shimData(data, options);
        }
    }
    var BaseActor$1 = BaseActor;

    /**
     * @typedef {Object} AdventureData
     * @property {string} _id                 The _id which uniquely identifies this Adventure document
     * @property {string} name                The human-readable name of the Adventure
     * @property {string} img                 The file path for the primary image of the adventure
     * @property {string} caption             A string caption displayed under the primary image banner
     * @property {string} description         An HTML text description for the adventure
     * @property {documents.BaseActor[]} actors         An array of Actor documents which are included in the adventure
     * @property {documents.BaseCombat[]} combats       An array of Combat documents which are included in the adventure
     * @property {documents.BaseItem[]} items           An array of Item documents which are included in the adventure
     * @property {documents.BaseScene[]} scenes         An array of Scene documents which are included in the adventure
     * @property {documents.BaseJournalEntry[]} journal An array of JournalEntry documents which are included in the adventure
     * @property {documents.BaseRollTable[]} tables     An array of RollTable documents which are included in the adventure
     * @property {documents.BaseMacro[]} macros         An array of Macro documents which are included in the adventure
     * @property {documents.BaseCards[]} cards          An array of Cards documents which are included in the adventure
     * @property {documents.BasePlaylist[]} playlists   An array of Playlist documents which are included in the adventure
     * @property {documents.BaseFolder[]} folders       An array of Folder documents which are included in the adventure
     * @property {number} sort                The sort order of this adventure relative to its siblings
     * @property {object} flags={}            An object of optional key/value flags
     * @property {DocumentStats} [_stats]     An object of creation and access information
     */

    /**
     * The Document definition for an Adventure.
     * Defines the DataSchema and common behaviors for an Adventure which are shared between both client and server.
     * @extends abstract.Document
     * @mixes AdventureData
     * @memberof documents
     *
     * @param {AdventureData} data                    Initial data from which to construct the Actor
     * @param {DocumentConstructionContext} context   Construction context options
     */
    class BaseAdventure extends Document {

        /* -------------------------------------------- */
        /*  Model Configuration                         */
        /* -------------------------------------------- */

        /** @inheritdoc */
        static metadata = Object.freeze(mergeObject(super.metadata, {
            name: "Adventure",
            collection: "adventures",
            compendiumIndexFields: ["_id", "name", "img", "sort"],
            label: "DOCUMENT.Adventure",
            labelPlural: "DOCUMENT.Adventures"
        }, {inplace: false}));

        /** @inheritdoc */
        static defineSchema() {
            return {
                _id: new DocumentIdField(),
                name: new StringField({required: true, blank: false, label: "ADVENTURE.Name", hint: "ADVENTURE.NameHint"}),
                img: new FilePathField({categories: ["IMAGE"], label: "ADVENTURE.Image", hint: "ADVENTURE.ImageHint"}),
                caption: new HTMLField({label: "ADVENTURE.Caption", hint: "ADVENTURE.CaptionHint"}),
                description: new HTMLField({label: "ADVENTURE.Description", hint: "ADVENTURE.DescriptionHint"}),
                actors: new SetField(new EmbeddedDataField(BaseActor$1)),
                combats: new SetField(new EmbeddedDataField(BaseCombat$1)),
                items: new SetField(new EmbeddedDataField(BaseItem$1)),
                journal: new SetField(new EmbeddedDataField(BaseJournalEntry$1)),
                scenes: new SetField(new EmbeddedDataField(BaseScene$1)),
                tables: new SetField(new EmbeddedDataField(BaseRollTable$1)),
                macros: new SetField(new EmbeddedDataField(BaseMacro$1)),
                cards: new SetField(new EmbeddedDataField(BaseCards$1)),
                playlists: new SetField(new EmbeddedDataField(BasePlaylist$1)),
                folders: new SetField(new EmbeddedDataField(BaseFolder$1)),
                sort: new IntegerSortField(),
                flags: new ObjectField(),
                _stats: new DocumentStatsField()
            };
        }

        /* -------------------------------------------- */
        /*  Model Properties                            */
        /* -------------------------------------------- */

        /**
         * An array of the fields which provide imported content from the Adventure.
         * @type {Object<Document>}
         */
        static get contentFields() {
            const content = {};
            for ( const field of this.schema ) {
                if ( field instanceof SetField ) content[field.name] = field.element.model.implementation;
            }
            return content;
        }

        /**
         * Provide a thumbnail image path used to represent the Adventure document.
         * @type {string}
         */
        get thumbnail() {
            return this.img;
        }

        /** @inheritdoc */
        static fromSource(source, options={}) {
            const pack = game?.packs?.get(options.pack) ?? db?.packs?.get(options.pack);
            const system = pack.metadata?.system ?? pack.packData?.system;
            if ( pack && !system ) {
                // Omit system-specific documents from this Adventure's data.
                source.actors = [];
                source.items = [];
                source.folders = source.folders.filter(f => !CONST.SYSTEM_SPECIFIC_COMPENDIUM_TYPES.includes(f.type));
            }
            return super.fromSource(source, options);
        }

        /* -------------------------------------------- */
        /*  Deprecations and Compatibility              */
        /* -------------------------------------------- */

        /** @inheritdoc */
        static migrateData(data) {
            for ( const [field, cls] of Object.entries(this.contentFields) ) {
                for ( const d of (data[field] || []) ) {
                    cls.migrateDataSafe(d);
                    /** @deprecated since v10 */
                    if ( (field === "journal") && (d.content || d.img) ) d.pages = cls.migrateContentToPages(d);
                }
            }
            return super.migrateData(data);
        }
    }

    /**
     * @typedef {Object} AmbientLightData
     * @property {string} _id                 The _id which uniquely identifies this BaseAmbientLight embedded document
     * @property {number} [x=0]               The x-coordinate position of the origin of the light
     * @property {number} [y=0]               The y-coordinate position of the origin of the light
     * @property {number} [rotation=0]        The angle of rotation for the tile between 0 and 360
     * @property {boolean} [walls=true]       Whether or not this light source is constrained by Walls
     * @property {boolean} [vision=false]     Whether or not this light source provides a source of vision
     * @property {LightData} config           Light configuration data
     * @property {boolean} [hidden=false]     Is the light source currently hidden?
     * @property {object} [flags]             An object of optional key/value flags
     */

    /**
     * The Document definition for an AmbientLight.
     * Defines the DataSchema and common behaviors for an AmbientLight which are shared between both client and server.
     * @extends abstract.Document
     * @mixes AmbientLightData
     * @memberof documents
     *
     * @param {AmbientLightData} data                 Initial data from which to construct the AmbientLight
     * @param {DocumentConstructionContext} context   Construction context options
     */
    class BaseAmbientLight extends Document {

        /* -------------------------------------------- */
        /*  Model Configuration                         */
        /* -------------------------------------------- */

        /** @inheritdoc */
        static metadata = Object.freeze(mergeObject(super.metadata, {
            name: "AmbientLight",
            collection: "lights",
            label: "DOCUMENT.AmbientLight",
            labelPlural: "DOCUMENT.AmbientLights"
        }, {inplace: false}));

        /** @inheritdoc */
        static defineSchema() {
            return {
                _id: new DocumentIdField(),
                x: new NumberField({required: true, integer: true, nullable: false, initial: 0, label: "XCoord"}),
                y: new NumberField({required: true, integer: true, nullable: false, initial: 0, label: "YCoord"}),
                rotation: new AngleField({label: "LIGHT.Rotation"}),
                walls: new BooleanField({initial: true, label: "LIGHT.Walls", hint: "LIGHT.WallsHint"}),
                vision: new BooleanField({label: "LIGHT.Vision", hint: "LIGHT.VisionHint"}),
                config: new EmbeddedDataField(LightData),
                hidden: new BooleanField({label: "Hidden"}),
                flags: new ObjectField()
            }
        }

        /* -------------------------------------------- */
        /*  Deprecations and Compatibility              */
        /* -------------------------------------------- */

        /** @inheritdoc */
        static migrateData(data) {

            /**
             * Migrate darkness threshold to inner object
             * @deprecated since v8
             */
            this._addDataFieldMigration(data, "darknessThreshold", "darkness.min");

            /**
             * Migrate light parameters to inner config object
             * @deprecated since v9
             */
            for ( const [oldKey, newKey] of Object.entries({
                dim: "config.dim",
                bright: "config.bright",
                angle: "config.angle",
                tintColor: "config.color",
                tintAlpha: "config.alpha",
                lightAnimation: "config.animation",
                darkness: "config.darkness"
            }) ) this._addDataFieldMigration(data, oldKey, newKey);

            /**
             * Migrate source types to boolean flags
             * @deprecated since v9
             */
            if ( "t" in data ) {
                data.walls = data.t !== "u"; // formerly CONST.SOURCE_TYPES
                data.vision = data.t !== "l"; // formerly CONST.SOURCE_TYPES
            }
            return super.migrateData(data);
        }
    }

    /**
     * @typedef {Object} AmbientSoundData
     * @property {string} _id                 The _id which uniquely identifies this AmbientSound document
     * @property {number} x=0                 The x-coordinate position of the origin of the sound.
     * @property {number} y=0                 The y-coordinate position of the origin of the sound.
     * @property {number} radius=0            The radius of the emitted sound.
     * @property {string} path                The audio file path that is played by this sound
     * @property {boolean} [repeat=false]     Does this sound loop?
     * @property {number} [volume=0.5]        The audio volume of the sound, from 0 to 1
     * @property {boolean} walls=true         Whether or not this sound source is constrained by Walls.
     * @property {boolean} easing=true        Whether to adjust the volume of the sound heard by the listener based on how
     *                                        close the listener is to the center of the sound source.
     * @property {boolean} hidden=false       Is the sound source currently hidden?
     * @property {{min: number, max: number}} darkness  A darkness range (min and max) for which the source should be active
     * @property {object} [flags]             An object of optional key/value flags
     */

    /**
     * The Document definition for an AmbientSound.
     * Defines the DataSchema and common behaviors for an AmbientSound which are shared between both client and server.
     * @extends abstract.Document
     * @mixes AmbientSoundData
     * @memberof documents
     *
     * @param {AmbientSoundData} data                 Initial data from which to construct the AmbientSound
     * @param {DocumentConstructionContext} context   Construction context options
     */
    class BaseAmbientSound extends Document {

        /* -------------------------------------------- */
        /*  Model Configuration                         */
        /* -------------------------------------------- */

        /** @inheritdoc */
        static metadata = Object.freeze(mergeObject(super.metadata, {
            name: "AmbientSound",
            collection: "sounds",
            label: "DOCUMENT.AmbientSound",
            labelPlural: "DOCUMENT.AmbientSounds",
            isEmbedded: true
        }, {inplace: false}));

        /** @inheritdoc */
        static defineSchema() {
            return {
                _id: new DocumentIdField(),
                x: new NumberField({required: true, integer: true, nullable: false, initial: 0, label: "XCoord"}),
                y: new NumberField({required: true, integer: true, nullable: false, initial: 0, label: "YCoord"}),
                radius: new NumberField({required: true, nullable: false, initial: 0, min: 0, step: 0.01,
                    label: "SOUND.Radius"}),
                path: new FilePathField({categories: ["AUDIO"], label: "SOUND.SourcePath"}),
                repeat: new BooleanField(),
                volume: new AlphaField({initial: 0.5, step: 0.01, label: "SOUND.MaxVol", hint: "SOUND.MaxVolHint"}),
                walls: new BooleanField({initial: true, label: "SOUND.Walls", hint: "SOUND.WallsHint"}),
                easing: new BooleanField({initial: true, label: "SOUND.Easing", hint: "SOUND.EasingHint"}),
                hidden: new BooleanField({label: "Hidden"}),
                darkness: new SchemaField({
                    min: new AlphaField({initial: 0}),
                    max: new AlphaField({initial: 1})
                }, {label: "SOUND.DarknessRange", hint: "SOUND.DarknessRangeHint"}),
                flags: new ObjectField()
            }
        }

        /* -------------------------------------------- */
        /*  Deprecations and Compatibility              */
        /* -------------------------------------------- */

        /** @inheritdoc */
        static migrateData(data) {
            /**
             * Migrate legacy wall type attributes
             * @deprecated since v9
             */
            if ( "t" in data ) {
                data.walls = data.t === "l";
            }
            return super.migrateData(data);
        }
    }

    /**
     * @typedef {Object} CardData
     * @property {string} _id                 The _id which uniquely identifies this Card document
     * @property {string} name                The text name of this card
     * @property {string} [description]       A text description of this card which applies to all faces
     * @property {string} type                A category of card (for example, a suit) to which this card belongs
     * @property {object} [system]            Game system data which is defined by the system template.json model
     * @property {string} [suit]              An optional suit designation which is used by default sorting
     * @property {number} [value]             An optional numeric value of the card which is used by default sorting
     * @property {CardFaceData} back          An object of face data which describes the back of this card
     * @property {CardFaceData[]} faces       An array of face data which represent displayable faces of this card
     * @property {number|null} face           The index of the currently displayed face, or null if the card is face-down
     * @property {boolean} drawn              Whether this card is currently drawn from its source deck
     * @property {string} origin              The document ID of the origin deck to which this card belongs
     * @property {number} width               The visible width of this card
     * @property {number} height              The visible height of this card
     * @property {number} rotation            The angle of rotation of this card
     * @property {number} sort                The sort order of this card relative to others in the same stack
     * @property {object} [flags]             An object of optional key/value flags
     */

    /**
     * @typedef {Object} CardFaceData
     * @property {string} [name]              A name for this card face
     * @property {string} [text]              Displayed text that belongs to this face
     * @property {string} [img]               A displayed image or video file which depicts the face
     */

    /**
     * The Document definition for a Card.
     * Defines the DataSchema and common behaviors for a Card which are shared between both client and server.
     * @extends abstract.Document
     * @mixes CardData
     * @memberof documents
     *
     * @param {CardData} data                         Initial data from which to construct the Card
     * @param {DocumentConstructionContext} context   Construction context options
     */
    class BaseCard extends Document {

        /* -------------------------------------------- */
        /*  Model Configuration                         */
        /* -------------------------------------------- */

        /** @inheritdoc */
        static metadata = Object.freeze(mergeObject(super.metadata, {
            name: "Card",
            collection: "cards",
            indexed: true,
            label: "DOCUMENT.Card",
            labelPlural: "DOCUMENT.Cards",
            permissions: {
                create: this.#canCreate,
                update: this.#canUpdate
            }
        }, {inplace: false}));

        /** @inheritdoc */
        static defineSchema() {
            return {
                _id: new DocumentIdField(),
                name: new StringField({required: true, blank: false, label: "CARD.Name"}),
                description: new HTMLField({label: "CARD.Description"}),
                type: new StringField({required: true, label: "CARD.Type", choices: () => this.TYPES,
                    initial: this.TYPES[0]}),
                system: new SystemDataField(this),
                suit: new StringField({label: "CARD.Suit"}),
                value: new NumberField({label: "CARD.Value"}),
                back: new SchemaField({
                    name: new StringField({label: "CARD.BackName"}),
                    text: new HTMLField({label: "CARD.BackText"}),
                    img: new FilePathField({categories: ["IMAGE", "VIDEO"], label: "CARD.BackImage"}),
                }),
                faces: new ArrayField(new SchemaField({
                    name: new StringField({label: "CARD.FaceName"}),
                    text: new HTMLField({label: "CARD.FaceText"}),
                    img: new FilePathField({categories: ["IMAGE", "VIDEO"], initial: () => this.DEFAULT_ICON,
                        label: "CARD.FaceImage"}),
                })),
                face: new NumberField({required: true, initial: null, integer: true, min: 0, label: "CARD.Face"}),
                drawn: new BooleanField({label: "CARD.Drawn"}),
                origin: new ForeignDocumentField(BaseCards$1),
                width: new NumberField({integer: true, positive: true, label: "Width"}),
                height: new NumberField({integer: true, positive: true, label: "Height"}),
                rotation: new AngleField({label: "Rotation"}),
                sort: new IntegerSortField(),
                flags: new ObjectField()
            }
        }

        /**
         * The default icon used for a Card face that does not have a custom image set
         * @type {string}
         */
        static DEFAULT_ICON = "icons/svg/card-joker.svg";

        /**
         * The allowed set of Card types which may exist
         * @type {string[]}
         */
        static get TYPES() {
            return game.documentTypes?.Card || [BASE_DOCUMENT_TYPE];
        }

        /**
         * Is a User able to create a new Card within this parent?
         * @private
         */
        static #canCreate(user, doc, data) {
            if ( user.isGM ) return true;                             // GM users can always create
            if ( doc.parent.type !== "deck" ) return true;            // Users can pass cards to card hands or piles
            return doc.parent.canUserModify(user, "create", data);    // Otherwise require parent document permission
        }

        /**
         * Is a user able to update an existing Card?
         * @private
         */
        static #canUpdate(user, doc, data) {
            if ( user.isGM ) return true;                               // GM users can always update
            const wasDrawn = new Set(["drawn", "_id"]);                 // Users can draw cards from a deck
            if ( new Set(Object.keys(data)).equals(wasDrawn) ) return true;
            return doc.parent.canUserModify(user, "update", data);      // Otherwise require parent document permission
        }

        /* -------------------------------------------- */
        /*  Model Methods                               */
        /* -------------------------------------------- */

        /** @inheritdoc */
        testUserPermission(user, permission, {exact=false}={}) {
            if ( this.isEmbedded ) return this.parent.testUserPermission(user, permission, {exact});
            return super.testUserPermission(user, permission, {exact});
        }

        /* -------------------------------------------- */
        /*  Deprecations and Compatibility              */
        /* -------------------------------------------- */

        /** @inheritdoc */
        static migrateData(data) {
            /**
             * Rename data to system
             * @deprecated since v10
             */
            this._addDataFieldMigration(data, "data", "system");
            return super.migrateData(data);
        }

        /* ---------------------------------------- */

        /** @inheritdoc */
        static shimData(data, options) {
            this._addDataFieldShim(data, "data", "system", {since: 10, until: 12});
            return super.shimData(data, options);
        }
    }

    /**
     * @typedef {Object} CardsData
     * @property {string} _id                 The _id which uniquely identifies this stack of Cards document
     * @property {string} name                The text name of this stack
     * @property {string} type                The type of this stack, in BaseCards.metadata.types
     * @property {string} [description]       A text description of this stack
     * @property {string} [img]               An image or video which is used to represent the stack of cards
     * @property {object} [system]            Game system data which is defined by the system template.json model
     * @property {Collection<BaseCard>} cards A collection of Card documents which currently belong to this stack
     * @property {number} width               The visible width of this stack
     * @property {number} height              The visible height of this stack
     * @property {number} rotation            The angle of rotation of this stack
     * @property {boolean} [displayCount]     Whether or not to publicly display the number of cards in this stack
     * @property {string|null} folder         The _id of a Folder which contains this document
     * @property {number} sort                The sort order of this stack relative to others in its parent collection
     * @property {object} [ownership]         An object which configures ownership of this Cards
     * @property {object} [flags]             An object of optional key/value flags
     * @property {DocumentStats} [_stats]     An object of creation and access information
     */

    /**
     * The Document definition for Cards.
     * Defines the DataSchema and common behaviors for Cards which are shared between both client and server.
     * @extends abstract.Document
     * @mixes CardsData
     * @memberof documents
     *
     * @param {CardsData} data                        Initial data from which to construct the Cards
     * @param {DocumentConstructionContext} context   Construction context options
     */
    class BaseCards extends Document {

        /* -------------------------------------------- */
        /*  Model Configuration                         */
        /* -------------------------------------------- */

        /** @inheritdoc */
        static metadata = Object.freeze(Object.defineProperty(mergeObject(super.metadata, {
            name: "Cards",
            collection: "cards",
            indexed: true,
            compendiumIndexFields: ["_id", "name", "img", "type", "sort"],
            embedded: {Card: "cards"},
            label: "DOCUMENT.Cards",
            labelPlural: "DOCUMENT.CardsPlural",
            coreTypes: ["deck", "hand", "pile"]
        }, {inplace: false}), "types", {
            get: () => {
                /** @deprecated since v10 */
                globalThis.logger.warn(`${this.name}.metadata.types is deprecated since v10 in favour of ${this.name}.TYPES.`);
                return this.TYPES;
            },
            enumerable: false
        }));

        /** @inheritdoc */
        static defineSchema() {
            return {
                _id: new DocumentIdField(),
                name: new StringField({required: true, blank: false, label: "CARDS.Name"}),
                type: new StringField({required: true, label: "CARDS.Type", choices: () => this.TYPES,
                    initial: () => this.TYPES[0],
                    validationError: "The Cards type must be in the array of types supported by the game system"}),
                description: new HTMLField({label: "CARDS.Description"}),
                img: new FilePathField({categories: ["IMAGE", "VIDEO"], initial: () => this.DEFAULT_ICON,
                    label: "CARDS.Image"}),
                system: new SystemDataField(this),
                cards: new EmbeddedCollectionField(BaseCard),
                width: new NumberField({integer: true, positive: true, label: "Width"}),
                height: new NumberField({integer: true, positive: true, label: "Height"}),
                rotation: new AngleField({label: "Rotation"}),
                displayCount: new BooleanField(),
                folder: new ForeignDocumentField(BaseFolder$1),
                sort: new IntegerSortField(),
                ownership: new DocumentOwnershipField(),
                flags: new ObjectField(),
                _stats: new DocumentStatsField()
            }
        }

        /**
         * The default icon used for a cards stack that does not have a custom image set
         * @type {string}
         */
        static DEFAULT_ICON = "icons/svg/card-hand.svg";

        /**
         * The allowed set of CardsData types which may exist
         * @type {string[]}
         */
        static get TYPES() {
            return game.documentTypes?.Cards || [];
        }

        /* -------------------------------------------- */
        /*  Deprecations and Compatibility              */
        /* -------------------------------------------- */

        /** @inheritdoc */
        static migrateData(data) {
            /**
             * Rename data to system
             * @deprecated since v10
             */
            this._addDataFieldMigration(data, "data", "system");

            /**
             * Rename permission to ownership
             * @deprecated since v10
             */
            this._addDataFieldMigration(data, "permission", "ownership");
            return super.migrateData(data);
        }

        /* ---------------------------------------- */

        /** @inheritdoc */
        static shimData(data, options) {
            this._addDataFieldShim(data, "data", "system", {since: 10, until: 12});
            this._addDataFieldShim(data, "permission", "ownership", {since: 10, until: 12});
            return super.shimData(data, options);
        }
    }
    var BaseCards$1 = BaseCards;

    /**
     * @typedef {Object} ChatMessageData
     * @property {string} _id                 The _id which uniquely identifies this ChatMessage document
     * @property {number} [type=0]            The message type from CONST.CHAT_MESSAGE_TYPES
     * @property {string} user                The _id of the User document who generated this message
     * @property {number} timestamp           The timestamp at which point this message was generated
     * @property {string} [flavor]            An optional flavor text message which summarizes this message
     * @property {string} content             The HTML content of this chat message
     * @property {ChatSpeakerData} speaker    A ChatSpeakerData object which describes the origin of the ChatMessage
     * @property {string[]} whisper           An array of User _id values to whom this message is privately whispered
     * @property {boolean} [blind=false]      Is this message sent blindly where the creating User cannot see it?
     * @property {string[]} [rolls]           Serialized content of any Roll instances attached to the ChatMessage
     * @property {string} [sound]             The URL of an audio file which plays when this message is received
     * @property {boolean} [emote=false]      Is this message styled as an emote?
     * @property {object} [flags]             An object of optional key/value flags
     */

    /**
     * @typedef {Object} ChatSpeakerData
     * @property {string} [scene]       The _id of the Scene where this message was created
     * @property {string} [actor]       The _id of the Actor who generated this message
     * @property {string} [token]       The _id of the Token who generated this message
     * @property {string} [alias]       An overridden alias name used instead of the Actor or Token name
     */

    /**
     * The Document definition for a ChatMessage.
     * Defines the DataSchema and common behaviors for a ChatMessage which are shared between both client and server.
     * @extends abstract.Document
     * @mixes ChatMessageData
     * @memberof documents
     *
     * @param {ChatMessageData} data                  Initial data from which to construct the ChatMessage
     * @param {DocumentConstructionContext} context   Construction context options
     */
    class BaseChatMessage extends Document {

        /* -------------------------------------------- */
        /*  Model Configuration                         */
        /* -------------------------------------------- */

        /** @inheritdoc */
        static metadata = Object.freeze(mergeObject(super.metadata, {
            name: "ChatMessage",
            collection: "messages",
            label: "DOCUMENT.ChatMessage",
            labelPlural: "DOCUMENT.ChatMessages",
            isPrimary: true,
            permissions: {
                create: this.#canCreate,
                update: this.#canUpdate,
                delete: this.#canDelete
            }
        }, {inplace: false}));

        /** @inheritdoc */
        static defineSchema() {
            return {
                _id: new DocumentIdField(),
                type: new NumberField({required: true, choices: Object.values(CHAT_MESSAGE_TYPES),
                    initial: CHAT_MESSAGE_TYPES.OTHER, validationError: "must be a value in CONST.CHAT_MESSAGE_TYPES"}),
                user: new ForeignDocumentField(BaseUser$1, {nullable: false, initial: () => game?.user?.id}),
                timestamp: new NumberField({required: true, nullable: false, initial: Date.now}),
                flavor: new HTMLField(),
                content: new HTMLField(),
                speaker: new SchemaField({
                    scene: new ForeignDocumentField(BaseScene$1, {idOnly: true}),
                    actor: new ForeignDocumentField(BaseActor$1, {idOnly: true}),
                    token: new ForeignDocumentField(BaseToken$1, {idOnly: true}),
                    alias: new StringField()
                }),
                whisper: new ArrayField(new ForeignDocumentField(BaseUser$1, {idOnly: true})),
                blind: new BooleanField(),
                rolls: new ArrayField(new JSONField({validate: BaseChatMessage.#validateRoll})),
                sound: new FilePathField({categories: ["AUDIO"]}),
                emote: new BooleanField(),
                flags: new ObjectField()
            };
        }

        /**
         * Is a user able to create a new chat message?
         * @private
         */
        static #canCreate(user, doc) {
            if ( user.isGM ) return true;
            if ( user.id !== doc._source.user ) return false; // You cannot impersonate a different user
            return user.hasRole("PLAYER");                    // Any player can create messages
        }

        /**
         * Is a user able to update an existing chat message?
         * @private
         */
        static #canUpdate(user, doc, data) {
            if ( user.isGM ) return true;                     // GM users can do anything
            if ( user.id !== doc._source.user ) return false; // Otherwise, message authors
            if ( "user" in data ) return false;               // Message author is immutable
            return true;
        }

        /**
         * Is a user able to delete an existing chat message?
         * @private
         */
        static #canDelete(user, doc) {
            if ( user.isGM ) return true;                     // GM users can do anything
            return user.id === doc._source.user;              // Otherwise, message authors
        }

        /* -------------------------------------------- */

        /**
         * Validate that Rolls belonging to the ChatMessage document are valid
         * @param {string} rollJSON     The serialized Roll data
         */
        static #validateRoll(rollJSON) {
            const roll = JSON.parse(rollJSON);
            if ( !roll.evaluated ) throw new Error(`Roll objects added to ChatMessage documents must be evaluated`);
        }

        /* -------------------------------------------- */
        /*  Deprecations and Compatibility              */
        /* -------------------------------------------- */

        /** @inheritdoc */
        static migrateData(data) {
            /**
             * V10 migration from one roll to many
             * @deprecated since v10
             */
            if ( ("roll" in data) && !("rolls" in data) ) {
                data.rolls = [data.roll];
            }
            return super.migrateData(data);
        }

        /* ---------------------------------------- */

        /** @inheritdoc */
        static shimData(data, options) {
            this._addDataFieldShim(data, "roll", "rolls", {since: 10, until: 12, value: data.rolls?.[0]});
            return super.shimData(data, options);
        }
    }

    /**
     * @typedef {Object} CombatData
     * @property {string} _id                 The _id which uniquely identifies this Combat document
     * @property {string} scene               The _id of a Scene within which this Combat occurs
     * @property {Collection<BaseCombatant>} combatants A Collection of Combatant embedded Documents
     * @property {boolean} [active=false]     Is the Combat encounter currently active?
     * @property {number} [round=0]           The current round of the Combat encounter
     * @property {number|null} [turn=0]       The current turn in the Combat round
     * @property {number} [sort=0]            The current sort order of this Combat relative to others in the same Scene
     * @property {object} [flags]             An object of optional key/value flags
     * @property {DocumentStats} [_stats]     An object of creation and access information
     */

    /**
     * The Document definition for a Combat.
     * Defines the DataSchema and common behaviors for a Combat which are shared between both client and server.
     * @extends abstract.Document
     * @mixes CombatData
     * @memberof documents
     *
     * @param {CombatData} data                       Initial data from which to construct the Combat
     * @param {DocumentConstructionContext} context   Construction context options
     */
    class BaseCombat extends Document {

        /* -------------------------------------------- */
        /*  Model Configuration                         */
        /* -------------------------------------------- */

        /** @inheritdoc */
        static metadata = Object.freeze(mergeObject(super.metadata, {
            name: "Combat",
            collection: "combats",
            label: "DOCUMENT.Combat",
            labelPlural: "DOCUMENT.Combats",
            embedded: {
                Combatant: "combatants"
            },
            permissions: {
                update: this.#canUpdate
            }
        }, {inplace: false}));

        /** @inheritdoc */
        static defineSchema() {
            return {
                _id: new DocumentIdField(),
                scene: new ForeignDocumentField(BaseScene$1),
                combatants: new EmbeddedCollectionField(BaseCombatant$1),
                active: new BooleanField(),
                round: new NumberField({required: true, nullable: false, integer: true, min: 0, initial: 0,
                    label: "COMBAT.Round"}),
                turn: new NumberField({required: true, integer: true, min: 0, initial: null, label: "COMBAT.Turn"}),
                sort: new IntegerSortField(),
                flags: new ObjectField(),
                _stats: new DocumentStatsField()
            }
        }

        /**
         * Is a user able to update an existing Combat?
         * @protected
         */
        static #canUpdate(user, doc, data) {
            if ( user.isGM ) return true;                     // GM users can do anything
            const turnOnly = ["_id", "round", "turn"];        // Players can only update the round or turn
            return Object.keys(data).every(k => turnOnly.includes(k));
        }
    }
    var BaseCombat$1 = BaseCombat;

    /**
     * @typedef {Object} CombatantData
     * @property {string} _id                 The _id which uniquely identifies this Combatant embedded document
     * @property {string} [actorId]           The _id of an Actor associated with this Combatant
     * @property {string} [tokenId]           The _id of a Token associated with this Combatant
     * @property {string} [name]              A customized name which replaces the name of the Token in the tracker
     * @property {string} [img]               A customized image which replaces the Token image in the tracker
     * @property {number} [initiative]        The initiative score for the Combatant which determines its turn order
     * @property {boolean} [hidden=false]     Is this Combatant currently hidden?
     * @property {boolean} [defeated=false]   Has this Combatant been defeated?
     * @property {object} [flags]             An object of optional key/value flags
     */

    /**
     * The Document definition for a Combatant.
     * Defines the DataSchema and common behaviors for a Combatant which are shared between both client and server.
     * @extends abstract.Document
     * @mixes CombatantData
     * @memberof documents
     *
     * @param {CombatantData} data                    Initial data from which to construct the Combatant
     * @param {DocumentConstructionContext} context   Construction context options
     */
    class BaseCombatant extends Document {

        /* -------------------------------------------- */
        /*  Model Configuration                         */
        /* -------------------------------------------- */

        /** @inheritdoc */
        static metadata = Object.freeze(mergeObject(super.metadata, {
            name: "Combatant",
            collection: "combatants",
            label: "DOCUMENT.Combatant",
            labelPlural: "DOCUMENT.Combatants",
            isEmbedded: true,
            permissions: {
                create: this.#canCreate,
                update: this.#canUpdate
            }
        }, {inplace: false}));

        /** @inheritdoc */
        static defineSchema() {
            return {
                _id: new DocumentIdField(),
                actorId: new ForeignDocumentField(BaseActor$1, {label: "COMBAT.CombatantActor", idOnly: true}),
                tokenId: new ForeignDocumentField(BaseToken$1, {label: "COMBAT.CombatantToken", idOnly: true}),
                sceneId: new ForeignDocumentField(BaseScene$1, {label: "COMBAT.CombatantScene", idOnly: true}),
                name: new StringField({label: "COMBAT.CombatantName"}),
                img: new FilePathField({categories: ["IMAGE"], label: "COMBAT.CombatantImage"}),
                initiative: new NumberField({label: "COMBAT.CombatantInitiative"}),
                hidden: new BooleanField({label: "COMBAT.CombatantHidden"}),
                defeated: new BooleanField({label: "COMBAT.CombatantDefeated"}),
                flags: new ObjectField()
            }
        }

        /**
         * Is a user able to update an existing Combatant?
         * @private
         */
        static #canUpdate(user, doc, data) {
            if ( user.isGM ) return true; // GM users can do anything
            if ( doc.actor && !doc.actor.canUserModify(user, "update", data) ) return false;
            const updateKeys = new Set(Object.keys(data));
            const allowedKeys = new Set(["_id", "initiative", "flags", "defeated"]);
            return updateKeys.isSubset(allowedKeys); // Players may only update initiative scores, flags, and the defeated state
        }

        /**
         * Is a user able to create this Combatant?
         * @private
         */
        static #canCreate(user, doc, data) {
            if ( user.isGM ) return true;
            if ( doc.actor ) return doc.actor.canUserModify(user, "update", data);
            return true;
        }
    }
    var BaseCombatant$1 = BaseCombatant;

    /**
     * @typedef {Object} DrawingData
     * @property {string} _id                 The _id which uniquely identifies this BaseDrawing embedded document
     * @property {string} author              The _id of the user who created the drawing
     * @property {data.ShapeData} shape       The geometric shape of the drawing
     * @property {number} x                   The x-coordinate position of the top-left corner of the drawn shape
     * @property {number} y                   The y-coordinate position of the top-left corner of the drawn shape
     * @property {number} [z=0]               The z-index of this drawing relative to other siblings
     * @property {number} [rotation=0]        The angle of rotation for the drawing figure
     * @property {number} [bezierFactor=0]    An amount of bezier smoothing applied, between 0 and 1
     * @property {number} [fillType=0]        The fill type of the drawing shape, a value from CONST.DRAWING_FILL_TYPES
     * @property {string} [fillColor]         An optional color string with which to fill the drawing geometry
     * @property {number} [fillAlpha=0.5]     The opacity of the fill applied to the drawing geometry
     * @property {number} [strokeWidth=8]     The width in pixels of the boundary lines of the drawing geometry
     * @property {number} [strokeColor]       The color of the boundary lines of the drawing geometry
     * @property {number} [strokeAlpha=1]     The opacity of the boundary lines of the drawing geometry
     * @property {string} [texture]           The path to a tiling image texture used to fill the drawing geometry
     * @property {string} [text]              Optional text which is displayed overtop of the drawing
     * @property {string} [fontFamily]        The font family used to display text within this drawing, defaults to
     *                                        CONFIG.defaultFontFamily
     * @property {number} [fontSize=48]       The font size used to display text within this drawing
     * @property {string} [textColor=#FFFFFF] The color of text displayed within this drawing
     * @property {number} [textAlpha=1]       The opacity of text displayed within this drawing
     * @property {boolean} [hidden=false]     Is the drawing currently hidden?
     * @property {boolean} [locked=false]     Is the drawing currently locked?
     * @property {object} [flags]             An object of optional key/value flags
     */

    /**
     * The Document definition for a Drawing.
     * Defines the DataSchema and common behaviors for a Drawing which are shared between both client and server.
     * @extends abstract.Document
     * @mixes DrawingData
     * @memberof documents
     *
     * @param {DrawingData} data                      Initial data from which to construct the Drawing
     * @param {DocumentConstructionContext} context   Construction context options
     */
    class BaseDrawing extends Document {

        /* ---------------------------------------- */
        /*  Model Configuration                     */
        /* ---------------------------------------- */

        /** @inheritdoc */
        static metadata = Object.freeze(mergeObject(super.metadata, {
            name: "Drawing",
            collection: "drawings",
            label: "DOCUMENT.Drawing",
            labelPlural: "DOCUMENT.Drawings",
            isEmbedded: true,
            permissions: {
                create: "DRAWING_CREATE",
                update: this.#canModify,
                delete: this.#canModify
            }
        }, {inplace: false}));

        /* ---------------------------------------- */

        /** @inheritDoc */
        static defineSchema() {
            return {
                _id: new DocumentIdField(),
                author: new ForeignDocumentField(BaseUser$1, {nullable: false, initial: () => game.user?.id}),
                shape: new EmbeddedDataField(ShapeData),
                x: new NumberField({required: true, nullable: false, initial: 0, label: "XCoord"}),
                y: new NumberField({required: true, nullable: false, initial: 0, label: "YCoord"}),
                z: new NumberField({required: true, integer: true, nullable: false, initial: 0, label: "DRAWING.ZIndex"}),
                rotation: new AngleField({label: "DRAWING.Rotation"}),
                bezierFactor: new AlphaField({initial: 0, label: "DRAWING.SmoothingFactor", max: 0.5,
                    hint: "DRAWING.SmoothingFactorHint"}),
                fillType: new NumberField({required: true, initial: DRAWING_FILL_TYPES.NONE,
                    choices: Object.values(DRAWING_FILL_TYPES), label: "DRAWING.FillTypes",
                    validationError: "must be a value in CONST.DRAWING_FILL_TYPES"
                }),
                fillColor: new ColorField({initial: () => game.user?.color, label: "DRAWING.FillColor"}),
                fillAlpha: new AlphaField({initial: 0.5, label: "DRAWING.FillOpacity"}),
                strokeWidth: new NumberField({integer: true, initial: 8, min: 0, label: "DRAWING.LineWidth"}),
                strokeColor: new ColorField({initial: () => game.user?.color, label: "DRAWING.StrokeColor"}),
                strokeAlpha: new AlphaField({initial: 1, label: "DRAWING.LineOpacity"}),
                texture: new FilePathField({categories: ["IMAGE"], label: "DRAWING.FillTexture"}),
                text: new StringField({label: "DRAWING.TextLabel"}),
                fontFamily: new StringField({blank: false, label: "DRAWING.FontFamily",
                    initial: () => globalThis.CONFIG?.defaultFontFamily || "Signika"}),
                fontSize: new NumberField({integer: true, min: 8, max: 256, initial: 48, label: "DRAWING.FontSize",
                    validationError: "must be an integer between 8 and 256"}),
                textColor: new ColorField({initial: "#FFFFFF", label: "DRAWING.TextColor"}),
                textAlpha: new AlphaField({label: "DRAWING.TextOpacity"}),
                hidden: new BooleanField(),
                locked: new BooleanField(),
                flags: new ObjectField()
            }
        }

        /* ---------------------------------------- */

        /**
         * Validate whether the drawing has some visible content (as required by validation).
         * @returns {boolean}
         */
        static #validateVisibleContent(data) {
            const hasText = (data.text !== "") && (data.textAlpha > 0);
            const hasFill = (data.fillType !== DRAWING_FILL_TYPES.NONE) && (data.fillAlpha > 0);
            const hasLine = (data.strokeWidth > 0) && (data.strokeAlpha > 0);
            return hasText || hasFill || hasLine;
        }

        /* ---------------------------------------- */

        /** @inheritdoc */
        _validateModel(data) {
            if ( !BaseDrawing.#validateVisibleContent(data) ) {
                throw new Error("Drawings must have visible text, a visible fill, or a visible line");
            }
        }

        /* ---------------------------------------- */

        /**
         * Is a user able to update or delete an existing Drawing document??
         * @private
         */
        static #canModify(user, doc, data) {
            if ( user.isGM ) return true;                // GM users can do anything
            return doc._source.author === user.id;       // Users may only update their own created drawings
        }

        /* ---------------------------------------- */
        /*  Model Methods                           */
        /* ---------------------------------------- */

        /** @inheritdoc */
        testUserPermission(user, permission, {exact=false}={}) {
            if ( !exact && (user.id === this._source.author) ) return true; // The user who created the drawing
            return super.testUserPermission(user, permission, {exact});
        }

        /* ---------------------------------------- */
        /*  Deprecations and Compatibility          */
        /* ---------------------------------------- */

        /** @inheritDoc */
        static cleanData(source={}, options={}) {
            if ( !options.partial && !BaseDrawing.#validateVisibleContent(source) ) {
                source.strokeWidth = 8;
                source.strokeColor = "#FFFFFF";
                source.strokeAlpha = 1.0;
            }
            return super.cleanData(source, options);
        }

        /* ---------------------------------------- */

        /** @inheritdoc */
        static migrateData(data) {
            /**
             * V10 migration to ShapeData model
             * @deprecated since v10
             */
            this._addDataFieldMigration(data, "type", "shape.type", d => ({t: "r", f: "p"}[d.type] ?? d.type));
            this._addDataFieldMigration(data, "width", "shape.width");
            this._addDataFieldMigration(data, "height", "shape.height");
            this._addDataFieldMigration(data, "points", "shape.points", d => d.points.flat());
            return super.migrateData(data);
        }

        /* ---------------------------------------- */

        /** @inheritdoc */
        static shimData(data, options) {
            this._addDataFieldShim(data, "type", "shape.type", {since: 10, until: 12});
            this._addDataFieldShim(data, "width", "shape.width", {since: 10, until: 12});
            this._addDataFieldShim(data, "height", "shape.height", {since: 10, until: 12});
            this._addDataFieldShim(data, "points", "shape.points", {since: 10, until: 12});
            return super.shimData(data, options);
        }
    }

    /**
     * @typedef {Object} FogExplorationData
     * @property {string} _id                 The _id which uniquely identifies this FogExploration document
     * @property {string} scene               The _id of the Scene document to which this fog applies
     * @property {string} user                The _id of the User document to which this fog applies
     * @property {string} explored            The base64 image/jpeg of the explored fog polygon
     * @property {object} positions           The object of scene positions which have been explored at a certain vision radius
     * @property {number} timestamp           The timestamp at which this fog exploration was last updated
     * @property {object} [flags]             An object of optional key/value flags
     */

    /**
     * The Document definition for FogExploration.
     * Defines the DataSchema and common behaviors for FogExploration which are shared between both client and server.
     * @extends abstract.Document
     * @mixes FogExplorationData
     * @memberof documents
     *
     * @param {FogExplorationData} data               Initial data from which to construct the FogExploration
     * @param {DocumentConstructionContext} context   Construction context options
     */
    class BaseFogExploration extends Document {

        /* ---------------------------------------- */
        /*  Model Configuration                     */
        /* ---------------------------------------- */

        /** @inheritdoc */
        static metadata = Object.freeze(mergeObject(super.metadata, {
            name: "FogExploration",
            collection: "fog",
            label: "DOCUMENT.FogExploration",
            labelPlural: "DOCUMENT.FogExplorations",
            isPrimary: true,
            permissions: {
                create: "PLAYER",
                update: this.#canModify,
                delete: this.#canModify
            }
        }, {inplace: false}));

        /** @inheritdoc */
        static defineSchema() {
            return {
                _id: new DocumentIdField(),
                scene: new ForeignDocumentField(BaseScene$1, {initial: () => canvas?.scene?.id}),
                user: new ForeignDocumentField(BaseUser$1, {initial: () => game?.user?.id}),
                explored: new FilePathField({categories: ["IMAGE"], required: true, base64: true}),
                positions: new ObjectField(),
                timestamp: new NumberField({nullable: false, initial: Date.now}),
                flags: new ObjectField()
            }
        }

        /**
         * Test whether a User can modify a FogExploration document.
         * @private
         */
        static #canModify(user, doc) {
            return (user.id === doc._source.user) || user.hasRole("ASSISTANT");
        }

        /* ---------------------------------------- */
        /*  Database Event Handlers                 */
        /* ---------------------------------------- */

        /** @inheritdoc */
        async _preUpdate(changed, options, user) {
            await super._preUpdate(changed, options, user);
            changed.timestamp = Date.now();
        }
    }

    /**
     * @typedef {Object} FolderData
     * @property {string} _id                 The _id which uniquely identifies this Folder document
     * @property {string} name                The name of this Folder
     * @property {string} type                The document type which this Folder contains, from CONST.FOLDER_DOCUMENT_TYPES
     * @property {string} [description]       An HTML description of the contents of this folder
     * @property {string|null} [folder]       The _id of a parent Folder which contains this Folder
     * @property {string} [sorting=a]         The sorting mode used to organize documents within this Folder, in ["a", "m"]
     * @property {number} [sort]              The numeric sort value which orders this Folder relative to its siblings
     * @property {string|null} [color]        A color string used for the background color of this Folder
     * @property {object} [flags]             An object of optional key/value flags
     * @property {DocumentStats} [_stats]     An object of creation and access information
     */

    /**
     * The Document definition for a Folder.
     * Defines the DataSchema and common behaviors for a Folder which are shared between both client and server.
     * @extends abstract.Document
     * @mixes FolderData
     * @memberof documents
     *
     * @param {FolderData} data                       Initial data from which to construct the Folder
     * @param {DocumentConstructionContext} context   Construction context options
     */
    class BaseFolder extends Document {

        /* ---------------------------------------- */
        /*  Model Configuration                     */
        /* ---------------------------------------- */

        /** @inheritdoc */
        static metadata = Object.freeze(mergeObject(super.metadata, {
            name: "Folder",
            collection: "folders",
            label: "DOCUMENT.Folder",
            labelPlural: "DOCUMENT.Folders",
            coreTypes: FOLDER_DOCUMENT_TYPES
        }, {inplace: false}));

        /** @inheritdoc */
        static defineSchema() {
            return {
                _id: new DocumentIdField(),
                name: new StringField({required: true, blank: false}),
                type: new StringField({required: true, choices: FOLDER_DOCUMENT_TYPES}),
                description: new StringField(),
                folder: new ForeignDocumentField(BaseFolder),
                sorting: new StringField({required: true, initial: "a", choices: this.SORTING_MODES}),
                sort: new IntegerSortField(),
                color: new ColorField(),
                flags: new ObjectField(),
                _stats: new DocumentStatsField()
            }
        }

        /** @inheritdoc */
        _validateModel(data) {
            if ( (data.folder !== null) && (data.folder === data._id) ) {
                throw new Error("A Folder may not contain itself");
            }
        }

        /**
         * Allow folder sorting modes
         * @type {string[]}
         */
        static SORTING_MODES = ["a", "m"];

        /* -------------------------------------------- */
        /*  Deprecations and Compatibility              */
        /* -------------------------------------------- */

        /** @inheritdoc */
        static migrateData(data) {
            /**
             * Remove parent collision
             * @deprecated since v10
             */
            this._addDataFieldMigration(data, "parent", "folder");
            return super.migrateData(data);
        }

        /* ---------------------------------------- */

        /** @inheritdoc */
        static shimData(data, options) {
            this._addDataFieldShim(data, "parent", "folder", {since: 10, until: 12});
            return super.shimData(data, options);
        }
    }
    var BaseFolder$1 = BaseFolder;

    /**
     * @typedef {Object} ItemData
     * @property {string} _id                 The _id which uniquely identifies this Item document
     * @property {string} name                The name of this Item
     * @property {string} type                An Item subtype which configures the system data model applied
     * @property {string} [img]               An image file path which provides the artwork for this Item
     * @property {object} [system]            The system data object which is defined by the system template.json model
     * @property {Collection<BaseActiveEffect>} effects A collection of ActiveEffect embedded Documents
     * @property {string|null} folder         The _id of a Folder which contains this Item
     * @property {number} [sort]              The numeric sort value which orders this Item relative to its siblings
     * @property {object} [ownership]         An object which configures ownership of this Item
     * @property {object} [flags]             An object of optional key/value flags
     * @property {DocumentStats} [_stats]     An object of creation and access information
     */

    /**
     * The Document definition for an Item.
     * Defines the DataSchema and common behaviors for an Item which are shared between both client and server.
     * @extends abstract.Document
     * @mixes ItemData
     * @memberof documents
     *
     * @param {ItemData} data                         Initial data from which to construct the Item
     * @param {DocumentConstructionContext} context   Construction context options
     */
    class BaseItem extends Document {

        /* -------------------------------------------- */
        /*  Model Configuration                         */
        /* -------------------------------------------- */

        /** @inheritdoc */
        static metadata = Object.freeze(Object.defineProperty(mergeObject(super.metadata, {
            name: "Item",
            collection: "items",
            indexed: true,
            compendiumIndexFields: ["_id", "name", "img", "type", "sort"],
            embedded: {ActiveEffect: "effects"},
            label: "DOCUMENT.Item",
            labelPlural: "DOCUMENT.Items",
            permissions: {create: "ITEM_CREATE"}
        }, {inplace: false}), "types", {
            get: () => {
                /** @deprecated since v10 */
                globalThis.logger.warn(`${this.name}.metadata.types is deprecated since v10 in favor of ${this.name}.TYPES.`);
                return this.TYPES
            },
            enumerable: false
        }));

        /* ---------------------------------------- */

        /** @inheritdoc */
        static defineSchema() {
            return {
                _id: new DocumentIdField(),
                name: new StringField({required: true, blank: false}),
                type: new StringField({required: true, choices: () => this.TYPES,
                    validationError: "must be in the array of Item types defined by the game system"}),
                img: new FilePathField({categories: ["IMAGE"], initial: () => this.DEFAULT_ICON}),
                system: new SystemDataField(this),
                effects: new EmbeddedCollectionField(BaseActiveEffect),
                folder: new ForeignDocumentField(BaseFolder$1),
                sort: new IntegerSortField(),
                ownership: new DocumentOwnershipField(),
                flags: new ObjectField(),
                _stats: new DocumentStatsField()
            }
        }

        /* ---------------------------------------- */

        /**
         * The default icon used for newly created Item documents
         * @type {string}
         */
        static DEFAULT_ICON = "icons/svg/item-bag.svg";

        /* ---------------------------------------- */

        /**
         * The allowed set of Item types which may exist.
         * @type {string[]}
         */
        static get TYPES() {
            return game.documentTypes?.Item || [];
        }

        /* ---------------------------------------- */

        /** @inheritdoc */
        canUserModify(user, action, data={}) {
            if ( this.isEmbedded ) return this.parent.canUserModify(user, "update");
            return super.canUserModify(user, action, data);
        }

        /* ---------------------------------------- */

        /** @inheritdoc */
        testUserPermission(user, permission, {exact=false}={}) {
            if ( this.isEmbedded ) return this.parent.testUserPermission(user, permission, {exact});
            return super.testUserPermission(user, permission, {exact});
        }

        /* -------------------------------------------- */
        /*  Deprecations and Compatibility              */
        /* -------------------------------------------- */

        /** @inheritdoc */
        static migrateData(data) {
            /**
             * Rename data to system
             * @deprecated since v10
             */
            this._addDataFieldMigration(data, "data", "system");

            /**
             * Rename permission to ownership
             * @deprecated since v10
             */
            this._addDataFieldMigration(data, "permission", "ownership");
            return super.migrateData(data);
        }

        /* ---------------------------------------- */

        /** @inheritdoc */
        static shimData(data, options) {
            this._addDataFieldShim(data, "data", "system", {since: 10, until: 12});
            this._addDataFieldShim(data, "permission", "ownership", {since: 10, until: 12});
            return super.shimData(data, options);
        }
    }
    var BaseItem$1 = BaseItem;

    /**
     * @typedef {Object} JournalEntryData
     * @property {string} _id                 The _id which uniquely identifies this JournalEntry document
     * @property {string} name                The name of this JournalEntry
     * @property {JournalEntryPageData[]} pages   The pages contained within this JournalEntry document
     * @property {string|null} folder         The _id of a Folder which contains this JournalEntry
     * @property {number} [sort]              The numeric sort value which orders this JournalEntry relative to its siblings
     * @property {object} [ownership]         An object which configures ownership of this JournalEntry
     * @property {object} [flags]             An object of optional key/value flags
     * @property {DocumentStats} [_stats]     An object of creation and access information
     */

    /**
     * The Document definition for a JournalEntry.
     * Defines the DataSchema and common behaviors for a JournalEntry which are shared between both client and server.
     * @extends abstract.Document
     * @mixes JournalEntryData
     * @memberof documents
     *
     * @param {JournalEntryData} data                 Initial data from which to construct the JournalEntry
     * @param {DocumentConstructionContext} context   Construction context options
     */
    class BaseJournalEntry extends Document {

        /* -------------------------------------------- */
        /*  Model Configuration                         */
        /* -------------------------------------------- */

        /** @inheritdoc */
        static metadata = Object.freeze(mergeObject(super.metadata, {
            name: "JournalEntry",
            collection: "journal",
            indexed: true,
            compendiumIndexFields: ["_id", "name", "sort"],
            embedded: {JournalEntryPage: "pages"},
            label: "DOCUMENT.JournalEntry",
            labelPlural: "DOCUMENT.JournalEntries",
            permissions: {
                create: "JOURNAL_CREATE"
            }
        }, {inplace: false}));

        /** @inheritdoc */
        static defineSchema() {
            return {
                _id: new DocumentIdField(),
                name: new StringField({required: true, blank: false}),
                pages: new EmbeddedCollectionField(BaseJournalEntryPage$1),
                folder: new ForeignDocumentField(BaseFolder$1),
                sort: new IntegerSortField(),
                ownership: new DocumentOwnershipField(),
                flags: new ObjectField(),
                _stats: new DocumentStatsField()
            }
        }

        /* -------------------------------------------- */
        /*  Deprecations and Compatibility              */
        /* -------------------------------------------- */

        /** @inheritdoc */
        static migrateData(data) {
            /**
             * Rename permission to ownership
             * @deprecated since v10
             */
            this._addDataFieldMigration(data, "permission", "ownership");
            return super.migrateData(data);
        }

        /* ---------------------------------------- */

        /** @inheritdoc */
        static shimData(data, options) {
            this._addDataFieldShim(data, "permission", "ownership", {since: 10, until: 12});
            return super.shimData(data, options);
        }

        /* -------------------------------------------- */

        /** @inheritdoc */
        _initializeSource(source, options={}) {
            if ( source.content || source.img ) {
                source.pages = this.constructor.migrateContentToPages(source);
            }
            return super._initializeSource(source, options);
        }

        /* -------------------------------------------- */

        /**
         * Migrate old content and img field to individual pages.
         * @param {object} source     Old source data which will be mutated in-place
         * @returns {object[]}        Page data that should be added to the document
         * @deprecated since v10
         */
        static migrateContentToPages(source) {
            const addPages = [];
            const multiplePages = source.img && source.content;
            if ( source.img ) {
                addPages.push({
                    name: `${multiplePages ? "Figure: " : ""}${source.name}`,
                    type: "image",
                    src: source.img,
                    title: {
                        show: false
                    }
                });
                delete source.img;
            }
            if ( source.content ) {
                addPages.push({
                    name: source.name,
                    type: "text",
                    title: {
                        show: false
                    },
                    text: {
                        format: JOURNAL_ENTRY_PAGE_FORMATS.HTML,
                        content: source.content
                    }
                });
                delete source.content;
            }
            return addPages;
        }
    }
    var BaseJournalEntry$1 = BaseJournalEntry;

    /**
     * @typedef {object} JournalEntryPageImageData
     * @property {string} [caption]  A caption for the image.
     */

    /**
     * @typedef {object} JournalEntryPageTextData
     * @property {string} [content]   The content of the JournalEntryPage in a format appropriate for its type.
     * @property {string} [markdown]  The original markdown source, if applicable.
     * @property {number} format      The format of the page's content, in {@link CONST.JOURNAL_ENTRY_PAGE_FORMATS}.
     */

    /**
     * @typedef {object} JournalEntryPageVideoData
     * @property {boolean} [loop]      Automatically loop the video?
     * @property {boolean} [autoplay]  Should the video play automatically?
     * @property {number} [volume]     The volume level of any audio that the video file contains.
     * @property {number} [timestamp]  The starting point of the video, in seconds.
     * @property {number} [width]      The width of the video, otherwise it will fill the available container width.
     * @property {number} [height]     The height of the video, otherwise it will use the aspect ratio of the source video,
     *                                 or 16:9 if that aspect ratio is not available.
     */

    /**
     * @typedef {object} JournalEntryPageTitleData
     * @property {boolean} show  Whether to render the page's title in the overall journal view.
     * @property {number} level  The heading level to render this page's title at in the overall journal view.
     */

    /**
     * @typedef {object} JournalEntryPageData
     * @property {string} _id          The _id which uniquely identifies this JournalEntryPage embedded document.
     * @property {string} name         The text name of this page.
     * @property {string} type         The type of this page, in {@link BaseJournalEntryPage.TYPES}.
     * @property {JournalEntryPageTitleData} title  Data that control's the display of this page's title.
     * @property {JournalEntryPageImageData} image  Data particular to image journal entry pages.
     * @property {JournalEntryPageTextData} text    Data particular to text journal entry pages.
     * @property {JournalEntryPageVideoData} video  Data particular to video journal entry pages.
     * @property {string} [src]        The URI of the image or other external media to be used for this page.
     * @property {object} system       System-specific data.
     * @property {number} sort         The numeric sort value which orders this page relative to its siblings.
     * @property {object} [ownership]  An object which configures the ownership of this page.
     * @property {object} [flags]      An object of optional key/value flags.
     */

    /**
     * The Document definition for a JournalEntryPage.
     * Defines the data schema and common behaviours for a JournalEntryPage which are shared between both client and server.
     * @extends abstract.Document
     * @mixes JournalEntryPageData
     * @memberof documents
     *
     * @param {JournalEntryPageData} data            Initial data from which to construct the JournalEntryPage.
     * @param {DocumentConstructionContext} context  Construction context options.
     */
    class BaseJournalEntryPage extends Document {

        /* -------------------------------------------- */
        /*  Model Configuration                         */
        /* -------------------------------------------- */

        /** @inheritdoc */
        static metadata = Object.freeze(mergeObject(super.metadata, {
            name: "JournalEntryPage",
            collection: "pages",
            indexed: true,
            label: "DOCUMENT.JournalEntryPage",
            labelPlural: "DOCUMENT.JournalEntryPages",
            coreTypes: ["image", "pdf", "text", "video"]
        }, {inplace: false}));

        /** @inheritdoc */
        static defineSchema() {
            return {
                _id: new DocumentIdField(),
                name: new StringField({required: true, blank: false, label: "JOURNALENTRYPAGE.PageTitle"}),
                type: new StringField({required: true, label: "JOURNALENTRYPAGE.Type", choices: () => this.TYPES,
                    initial: "text",
                    validationError: "The JournalEntryPage type must be in the array of types supported by the game system."}),
                title: new SchemaField({
                    show: new BooleanField({initial: true}),
                    level: new NumberField({required: true, initial: 1, min: 1, max: 6, integer: true, nullable: false})
                }),
                image: new SchemaField({
                    caption: new StringField({required: false, initial: undefined})
                }),
                text: new SchemaField({
                    content: new HTMLField({required: false, initial: undefined}),
                    markdown: new StringField({required: false, initial: undefined}),
                    format: new NumberField({label: "JOURNALENTRYPAGE.Format",
                        initial: JOURNAL_ENTRY_PAGE_FORMATS.HTML, choices: Object.values(JOURNAL_ENTRY_PAGE_FORMATS)})
                }),
                video: new SchemaField({
                    controls: new BooleanField({initial: true}),
                    loop: new BooleanField({required: false, initial: undefined}),
                    autoplay: new BooleanField({required: false, initial: undefined}),
                    volume: new AlphaField({required: true, step: 0.01, initial: .5}),
                    timestamp: new NumberField({required: false, min: 0, initial: undefined}),
                    width: new NumberField({required: false, positive: true, integer: true, initial: undefined}),
                    height: new NumberField({required: false, positive: true, integer: true, initial: undefined})
                }),
                src: new StringField({required: false, blank: false, nullable: true, initial: null,
                    label: "JOURNALENTRYPAGE.Source"}),
                system: new SystemDataField(this),
                sort: new IntegerSortField(),
                ownership: new DocumentOwnershipField({initial: {default: DOCUMENT_OWNERSHIP_LEVELS.INHERIT}}),
                flags: new ObjectField()
            };
        }

        /**
         * The allowed set of JournalEntryPageData types which may exist.
         * @type {string[]}
         */
        static get TYPES() {
            return game.documentTypes?.JournalEntryPage || [];
        }

        /** @inheritdoc */
        getUserLevel(user) {
            user = user || game.user;
            const ownership = this.ownership[user.id] ?? this.ownership.default;
            const inherited = ownership === DOCUMENT_OWNERSHIP_LEVELS.INHERIT;
            return inherited ? this.parent.getUserLevel(user) : ownership;
        }
    }
    var BaseJournalEntryPage$1 = BaseJournalEntryPage;

    /**
     * @typedef {Object} MacroData
     * @property {string} _id                 The _id which uniquely identifies this Macro document
     * @property {string} name                The name of this Macro
     * @property {string} type                A Macro subtype from CONST.MACRO_TYPES
     * @property {string} author              The _id of a User document which created this Macro *
     * @property {string} [img]               An image file path which provides the thumbnail artwork for this Macro
     * @property {string} [scope=global]      The scope of this Macro application from CONST.MACRO_SCOPES
     * @property {string} command             The string content of the macro command
     * @property {string|null} folder         The _id of a Folder which contains this Macro
     * @property {number} [sort]              The numeric sort value which orders this Macro relative to its siblings
     * @property {object} [ownership]         An object which configures ownership of this Macro
     * @property {object} [flags]             An object of optional key/value flags
     * @property {DocumentStats} [_stats]     An object of creation and access information
     */

    /**
     * The Document definition for a Macro.
     * Defines the DataSchema and common behaviors for a Macro which are shared between both client and server.
     * @extends abstract.Document
     * @mixes MacroData
     * @memberof documents
     *
     * @param {MacroData} data                        Initial data from which to construct the Macro
     * @param {DocumentConstructionContext} context   Construction context options
     */
    class BaseMacro extends Document {

        /* -------------------------------------------- */
        /*  Model Configuration                         */
        /* -------------------------------------------- */

        /** @inheritdoc */
        static metadata = Object.freeze(mergeObject(super.metadata, {
            name: "Macro",
            collection: "macros",
            indexed: true,
            compendiumIndexFields: ["_id", "name", "img", "sort"],
            label: "DOCUMENT.Macro",
            labelPlural: "DOCUMENT.Macros",
            coreTypes: Array.from(Object.values(MACRO_TYPES)),
            permissions: {create: "PLAYER"}
        }, {inplace: false}));

        /** @inheritdoc */
        static defineSchema() {
            return {
                _id: new DocumentIdField(),
                name: new StringField({required: true, blank: false, label: "Name"}),
                type: new StringField({required: true, choices: Object.values(MACRO_TYPES),
                    initial: MACRO_TYPES.CHAT, validationError: "must be a value in CONST.MACRO_TYPES", label: "Type"}),
                author: new ForeignDocumentField(BaseUser$1, {initial: () => game?.user?.id}),
                img: new FilePathField({categories: ["IMAGE"], initial: () => this.DEFAULT_ICON, label: "Image"}),
                scope: new StringField({required: true, choices: MACRO_SCOPES, initial: MACRO_SCOPES[0],
                    validationError: "must be a value in CONST.MACRO_SCOPES", label: "Scope"}),
                command: new StringField({required: true, blank: true, label: "Command"}),
                folder: new ForeignDocumentField(BaseFolder$1),
                sort: new IntegerSortField(),
                ownership: new DocumentOwnershipField(),
                flags: new ObjectField(),
                _stats: new DocumentStatsField()
            }
        }

        /**
         * The default icon used for newly created Macro documents.
         * @type {string}
         */
        static DEFAULT_ICON = "icons/svg/dice-target.svg";

        /* -------------------------------------------- */
        /*  Model Methods                               */
        /* -------------------------------------------- */

        /** @inheritdoc */
        testUserPermission(user, permission, {exact=false}={}) {
            if ( user.id === this._source.author ) return true; // Macro authors can edit
            return super.testUserPermission(user, permission, {exact});
        }

        /* -------------------------------------------- */
        /*  Database Event Handlers                     */
        /* -------------------------------------------- */

        /** @inheritdoc */
        async _preCreate(data, options, user) {
            this.updateSource({author: user.id});
        }

        /* -------------------------------------------- */
        /*  Deprecations and Compatibility              */
        /* -------------------------------------------- */

        /** @inheritdoc */
        static migrateData(data) {
            /**
             * Rename permission to ownership
             * @deprecated since v10
             */
            this._addDataFieldMigration(data, "permission", "ownership");
            return super.migrateData(data);
        }

        /* ---------------------------------------- */

        /** @inheritdoc */
        static shimData(data, options) {
            this._addDataFieldShim(data, "permission", "ownership", {since: 10, until: 12});
            return super.shimData(data, options);
        }
    }
    var BaseMacro$1 = BaseMacro;

    /**
     * @typedef {Object} MeasuredTemplateData
     * @property {string} _id                 The _id which uniquely identifies this BaseMeasuredTemplate embedded document
     * @property {string} user                The _id of the user who created this measured template
     * @property {string} [t=circle]          The value in CONST.MEASURED_TEMPLATE_TYPES which defines the geometry type of this template
     * @property {number} [x=0]               The x-coordinate position of the origin of the template effect
     * @property {number} [y=0]               The y-coordinate position of the origin of the template effect
     * @property {number} [distance]          The distance of the template effect
     * @property {number} [direction=0]       The angle of rotation for the measured template
     * @property {number} [angle=360]         The angle of effect of the measured template, applies to cone types
     * @property {number} [width]             The width of the measured template, applies to ray types
     * @property {string} [borderColor=#000000] A color string used to tint the border of the template shape
     * @property {string} [fillColor=#FF0000] A color string used to tint the fill of the template shape
     * @property {string} [texture]           A repeatable tiling texture used to add a texture fill to the template shape
     * @property {boolean} [hidden=false]     Is the template currently hidden?
     * @property {object} [flags]             An object of optional key/value flags
     */

    /**
     * The Document definition for a MeasuredTemplate.
     * Defines the DataSchema and common behaviors for a MeasuredTemplate which are shared between both client and server.
     * @extends abstract.Document
     * @mixes MeasuredTemplateData
     * @memberof documents
     *
     * @param {MeasuredTemplateData} data             Initial data from which to construct the MeasuredTemplate
     * @param {DocumentConstructionContext} context   Construction context options
     */
    class BaseMeasuredTemplate extends Document {

        /* -------------------------------------------- */
        /*  Model Configuration                         */
        /* -------------------------------------------- */

        /** @inheritdoc */
        static metadata = mergeObject(super.metadata, {
            name: "MeasuredTemplate",
            collection: "templates",
            label: "DOCUMENT.MeasuredTemplate",
            labelPlural: "DOCUMENT.MeasuredTemplates",
            isEmbedded: true,
            permissions: {
                create: this.#canCreate,
                update: this.#canModify,
                delete: this.#canModify
            }
        }, {inplace: false});

        /** @inheritdoc */
        static defineSchema() {
            return {
                _id: new DocumentIdField(),
                user: new ForeignDocumentField(BaseUser$1, {initial: () => game?.user?.id}),
                t: new StringField({required: true, choices: Object.values(MEASURED_TEMPLATE_TYPES), label: "Type",
                    initial: MEASURED_TEMPLATE_TYPES.CIRCLE,
                    validationError: "must be a value in CONST.MEASURED_TEMPLATE_TYPES",
                }),
                x: new NumberField({required: true, integer: true, nullable: false, initial: 0, label: "XCoord"}),
                y: new NumberField({required: true, integer: true, nullable: false, initial: 0, label: "YCoord"}),
                distance: new NumberField({required: true, positive: true, initial: 1, label: "Distance"}),
                direction: new AngleField({label: "Direction"}),
                angle: new AngleField({label: "Angle"}),
                width: new NumberField({integer: true, positive: true, label: "Width"}),
                borderColor: new ColorField({initial: "#000000"}),
                fillColor: new ColorField({initial: "#FF0000"}),
                texture: new FilePathField({categories: ["IMAGE", "VIDEO"]}),
                hidden: new BooleanField({label: "Hidden"}),
                flags: new ObjectField()
            }
        }

        /** @inheritdoc */
        _validateModel(data) {
            const scene = this.parent;
            if ( !scene ) return;
            const max = Math.hypot(scene.width, scene.height);
            for ( let f of ["distance", "width"] ) {
                const px = data[f] * (scene.grid.size / scene.grid.distance);
                if ( px > max ) throw new Error(`Invalid MeasuredTemplate ${f} which exceeds maximum dimensions for the Scene`);
            }
        }

        /* ---------------------------------------- */

        /**
         * Is a user able to create a new MeasuredTemplate?
         * @param {User} user                     The user attempting the creation operation.
         * @param {BaseMeasuredTemplate} doc      The MeasuredTemplate being created.
         * @returns {boolean}
         * @private
         */
        static #canCreate(user, doc) {
            if ( user.isGM ) return true;
            if ( !user.hasPermission("TEMPLATE_CREATE") ) return false;
            return doc._source.user === user.id;
        }

        /* ---------------------------------------- */

        /**
         * Is a user able to modify an existing MeasuredTemplate?
         * @param {User} user                     The user attempting the modification.
         * @param {BaseMeasuredTemplate} doc      The MeasuredTemplate being modified.
         * @param {object} [data]                 Data being changed.
         * @returns {boolean}
         * @private
         */
        static #canModify(user, doc, data) {
            if ( user.isGM ) return true;                     // GM users can do anything
            return doc._source.user === user.id;              // Users may only update their own created templates
        }

        /* -------------------------------------------- */
        /*  Model Methods                               */
        /* -------------------------------------------- */

        /** @inheritdoc */
        testUserPermission(user, permission, {exact=false}={}) {
            if ( !exact && (user.id === this._source.user) ) return true; // The user who created the template
            return super.testUserPermission(user, permission, {exact});
        }
    }

    /**
     * @typedef {Object} NoteData
     * @property {string} _id                 The _id which uniquely identifies this BaseNote embedded document
     * @property {string|null} [entryId=null] The _id of a JournalEntry document which this Note represents
     * @property {string|null} [pageId=null]  The _id of a specific JournalEntryPage document which this Note represents
     * @property {number} [x=0]               The x-coordinate position of the center of the note icon
     * @property {number} [y=0]               The y-coordinate position of the center of the note icon
     * @property {TextureData} [texture]      An image icon used to represent this note
     * @property {number} [iconSize=40]       The pixel size of the map note icon
     * @property {string} [text]              Optional text which overrides the title of the linked Journal Entry
     * @property {string} [fontFamily]        The font family used to display the text label on this note, defaults to
     *                                        CONFIG.defaultFontFamily
     * @property {number} [fontSize=36]       The font size used to display the text label on this note
     * @property {number} [textAnchor=1]      A value in CONST.TEXT_ANCHOR_POINTS which defines where the text label anchors
     *                                        to the note icon.
     * @property {string} [textColor=#FFFFFF] The string that defines the color with which the note text is rendered
     * @property {boolean} [global=false]     Whether this map pin is globally visible or requires LoS to see.
     * @property {object} [flags]             An object of optional key/value flags
     */

    /**
     * The Document definition for a Note.
     * Defines the DataSchema and common behaviors for a Note which are shared between both client and server.
     * @extends abstract.Document
     * @mixes NoteData
     * @memberof documents
     *
     * @param {NoteData} data                         Initial data from which to construct the Note
     * @param {DocumentConstructionContext} context   Construction context options
     *
     * @property {documents.BaseJournalEntry} entry   The JournalEntry document that this Note references
     */
    class BaseNote extends Document {

        /* -------------------------------------------- */
        /*  Model Configuration                         */
        /* -------------------------------------------- */

        /** @inheritdoc */
        static metadata = Object.freeze(mergeObject(super.metadata, {
            name: "Note",
            collection: "notes",
            label: "DOCUMENT.Note",
            labelPlural: "DOCUMENT.Notes",
            permissions: {
                create: "NOTE_CREATE"
            }
        }, {inplace: false}));

        /** @inheritdoc */
        static defineSchema() {
            return {
                _id: new DocumentIdField(),
                entryId: new ForeignDocumentField(BaseJournalEntry$1, {idOnly: true}),
                pageId: new ForeignDocumentField(BaseJournalEntryPage$1, {idOnly: true}),
                x: new NumberField({required: true, integer: true, nullable: false, initial: 0, label: "XCoord"}),
                y: new NumberField({required: true, integer: true, nullable: false, initial: 0, label: "YCoord"}),
                texture: new TextureData({}, {categories: ["IMAGE"], initial: () => this.DEFAULT_ICON, label: "NOTE.EntryIcon"}),
                iconSize: new NumberField({required: true, integer: true, min: 32, initial: 40,
                    validationError: "must be an integer greater than 32", label: "NOTE.IconSize"}),
                text: new StringField({label: "NOTE.TextLabel"}),
                fontFamily: new StringField({required: true, label: "NOTE.FontFamily",
                    initial: () => globalThis.CONFIG?.defaultFontFamily || "Signika"}),
                fontSize: new NumberField({required: true, integer: true, min: 8, max: 128, initial: 32,
                    validationError: "must be an integer between 8 and 128", label: "NOTE.FontSize"}),
                textAnchor: new NumberField({required: true, choices: Object.values(TEXT_ANCHOR_POINTS),
                    initial: TEXT_ANCHOR_POINTS.BOTTOM, label: "NOTE.AnchorPoint",
                    validationError: "must be a value in CONST.TEXT_ANCHOR_POINTS"}),
                textColor: new ColorField({initial: "#FFFFFF", label: "NOTE.TextColor"}),
                global: new BooleanField(),
                flags: new ObjectField()
            }
        }

        /**
         * The default icon used for newly created Note documents.
         * @type {string}
         */
        static DEFAULT_ICON = "icons/svg/book.svg";

        /* -------------------------------------------- */
        /*  Model Methods                               */
        /* -------------------------------------------- */

        /** @inheritdoc */
        testUserPermission(user, permission, {exact=false}={}) {
            if ( user.isGM ) return true;                             // Game-masters always have control
            // Players can create and edit unlinked notes with the appropriate permission.
            if ( !this.entryId ) return user.hasPermission("NOTE_CREATE");
            if ( !this.entry ) return false;                          // Otherwise, permission comes through the JournalEntry
            return this.entry.testUserPermission(user, permission, {exact});
        }

        /* -------------------------------------------- */
        /*  Deprecations and Compatibility              */
        /* -------------------------------------------- */

        /** @inheritdoc */
        static migrateData(data) {
            /**
             * Migration to TextureData.
             * @deprecated since v10
             */
            for ( const [oldKey, newKey] of Object.entries({
                "icon": "texture.src",
                "iconTint": "texture.tint"
            }) ) this._addDataFieldMigration(data, oldKey, newKey);
            return super.migrateData(data);
        }

        /* -------------------------------------------- */

        /** @inheritdoc */
        static shimData(data, options) {
            /**
             * Migration to TextureData.
             * @deprecated since v10
             */
            const shims = {
                icon: "texture.src",
                iconTint: "texture.tint"
            };
            this._addDataFieldShims(data, shims, {since: 10, until: 12});
            return super.shimData(data, options);
        }
    }

    /**
     * @typedef {Object} PlaylistData
     * @property {string} _id                 The _id which uniquely identifies this Playlist document
     * @property {string} name                The name of this playlist
     * @property {string} description         The description of this playlist
     * @property {Collection<BasePlaylistSound>} sounds A Collection of PlaylistSounds embedded documents which belong to this playlist
     * @property {number} [mode=0]            The playback mode for sounds in this playlist
     * @property {boolean} [playing=false]    Is this playlist currently playing?
     * @property {number} [fade]              A duration in milliseconds to fade volume transition
     * @property {string|null} folder         The _id of a Folder which contains this playlist
     * @property {string} sorting             The sorting mode used for this playlist.
     * @property {number} [sort]              The numeric sort value which orders this playlist relative to its siblings
     * @property {number} [seed]              A seed used for playlist randomization to guarantee that all clients generate the same random order.
     * @property {object} [ownership]         An object which configures ownership of this Playlist
     * @property {object} [flags]             An object of optional key/value flags
     * @property {DocumentStats} [_stats]     An object of creation and access information
     */

    /**
     * The Document definition for a Playlist.
     * Defines the DataSchema and common behaviors for a Playlist which are shared between both client and server.
     * @extends abstract.Document
     * @mixes PlaylistData
     * @memberof documents
     *
     * @param {PlaylistData} data                     Initial data from which to construct the Playlist
     * @param {DocumentConstructionContext} context   Construction context options
     */
    class BasePlaylist extends Document {

        /* -------------------------------------------- */
        /*  Model Configuration                         */
        /* -------------------------------------------- */

        /** @inheritdoc */
        static metadata = Object.freeze(mergeObject(super.metadata, {
            name: "Playlist",
            collection: "playlists",
            indexed: true,
            compendiumIndexFields: ["_id", "name", "sort"],
            embedded: {PlaylistSound: "sounds"},
            label: "DOCUMENT.Playlist",
            labelPlural: "DOCUMENT.Playlists",
        }, {inplace: false}));

        /** @inheritdoc */
        static defineSchema() {
            return {
                _id: new DocumentIdField(),
                name: new StringField({required: true, blank: false}),
                description: new StringField(),
                sounds: new EmbeddedCollectionField(BasePlaylistSound$1),
                mode: new NumberField({required: true, choices: Object.values(PLAYLIST_MODES),
                    initial: PLAYLIST_MODES.SEQUENTIAL, validationError: "must be a value in CONST.PLAYLIST_MODES"}),
                playing: new BooleanField(),
                fade: new NumberField({positive: true}),
                folder: new ForeignDocumentField(BaseFolder$1),
                sorting: new StringField({required: true, choices: Object.values(PLAYLIST_SORT_MODES),
                    initial: PLAYLIST_SORT_MODES.ALPHABETICAL,
                    validationError: "must be a value in CONST.PLAYLIST_SORTING_MODES"}),
                seed: new NumberField({integer: true, min: 0}),
                sort: new IntegerSortField(),
                ownership: new DocumentOwnershipField(),
                flags: new ObjectField(),
                _stats: new DocumentStatsField()
            }
        }

        /* -------------------------------------------- */
        /*  Deprecations and Compatibility              */
        /* -------------------------------------------- */

        /** @inheritdoc */
        static migrateData(data) {
            /**
             * Rename permission to ownership
             * @deprecated since v10
             */
            this._addDataFieldMigration(data, "permission", "ownership");
            return super.migrateData(data);
        }

        /* ---------------------------------------- */

        /** @inheritdoc */
        static shimData(data, options) {
            this._addDataFieldShim(data, "permission", "ownership", {since: 10, until: 12});
            return super.shimData(data, options);
        }
    }
    var BasePlaylist$1 = BasePlaylist;

    /**
     * @typedef {Object} PlaylistSoundData
     * @property {string} _id                 The _id which uniquely identifies this PlaylistSound document
     * @property {string} name                The name of this sound
     * @property {string} description         The description of this sound
     * @property {string} path                The audio file path that is played by this sound
     * @property {boolean} [playing=false]    Is this sound currently playing?
     * @property {number} [pausedTime=null]   The time in seconds at which playback was paused
     * @property {boolean} [repeat=false]     Does this sound loop?
     * @property {number} [volume=0.5]        The audio volume of the sound, from 0 to 1
     * @property {number} [fade]              A duration in milliseconds to fade volume transition
     * @property {number} [sort=0]            The sort order of the PlaylistSound relative to others in the same collection
     * @property {object} [flags]             An object of optional key/value flags
     */

    /**
     * The Document definition for a PlaylistSound.
     * Defines the DataSchema and common behaviors for a PlaylistSound which are shared between both client and server.
     * @extends abstract.Document
     * @mixes PlaylistSoundData
     * @memberof documents
     *
     * @param {PlaylistSoundData} data                Initial data from which to construct the PlaylistSound
     * @param {DocumentConstructionContext} context   Construction context options
     */
    class BasePlaylistSound extends Document {

        /* -------------------------------------------- */
        /*  Model Configuration                         */
        /* -------------------------------------------- */

        /** @inheritdoc */
        static metadata = Object.freeze(mergeObject(super.metadata, {
            name: "PlaylistSound",
            collection: "sounds",
            indexed: true,
            label: "DOCUMENT.PlaylistSound",
            labelPlural: "DOCUMENT.PlaylistSounds"
        }, {inplace: false}));

        /** @inheritdoc */
        static defineSchema() {
            return {
                _id: new DocumentIdField(),
                name: new StringField({required: true, blank: false}),
                description: new StringField(),
                path: new FilePathField({categories: ["AUDIO"]}),
                playing: new BooleanField(),
                pausedTime: new NumberField({min: 0}),
                repeat: new BooleanField(),
                volume: new AlphaField({initial: 0.5, step: 0.01}),
                fade: new NumberField({integer: true, min: 0}),
                sort: new IntegerSortField(),
                flags: new ObjectField(),
            }
        }

        /* -------------------------------------------- */
        /*  Model Methods                               */
        /* -------------------------------------------- */

        /** @inheritdoc */
        testUserPermission(user, permission, {exact = false} = {}) {
            if ( this.isEmbedded ) return this.parent.testUserPermission(user, permission, {exact});
            return super.testUserPermission(user, permission, {exact});
        }
    }
    var BasePlaylistSound$1 = BasePlaylistSound;

    /**
     * @typedef {Object} RollTableData
     * @property {string} _id                 The _id which uniquely identifies this RollTable document
     * @property {string} name                The name of this RollTable
     * @property {string} [img]               An image file path which provides the thumbnail artwork for this RollTable
     * @property {string} [description]       The HTML text description for this RollTable document
     * @property {Collection<BaseTableResult>} [results=[]] A Collection of TableResult embedded documents which belong to this RollTable
     * @property {string} formula             The Roll formula which determines the results chosen from the table
     * @property {boolean} [replacement=true] Are results from this table drawn with replacement?
     * @property {boolean} [displayRoll=true] Is the Roll result used to draw from this RollTable displayed in chat?
     * @property {string|null} folder         The _id of a Folder which contains this RollTable
     * @property {number} [sort]              The numeric sort value which orders this RollTable relative to its siblings
     * @property {object} [ownership]         An object which configures ownership of this RollTable
     * @property {object} [flags]             An object of optional key/value flags
     * @property {DocumentStats} [_stats]     An object of creation and access information
     */

    /**
     * The Document definition for a RollTable.
     * Defines the DataSchema and common behaviors for a RollTable which are shared between both client and server.
     */
    class BaseRollTable extends Document {

        /* -------------------------------------------- */
        /*  Model Configuration                         */
        /* -------------------------------------------- */

        /** @inheritDoc */
        static metadata = Object.freeze(mergeObject(super.metadata, {
            name: "RollTable",
            collection: "tables",
            indexed: true,
            compendiumIndexFields: ["_id", "name", "img", "sort"],
            embedded: {TableResult: "results"},
            label: "DOCUMENT.RollTable",
            labelPlural: "DOCUMENT.RollTables"
        }, {inplace: false}));

        /** @inheritDoc DataModel.defineSchema */
        static defineSchema() {
            return {
                _id: new DocumentIdField(),
                name: new StringField({required: true, blank: false}),
                img: new FilePathField({categories: ["IMAGE"], initial: () => this.DEFAULT_ICON}),
                description: new StringField(),
                results: new EmbeddedCollectionField(BaseTableResult$1),
                formula: new StringField(),
                replacement: new BooleanField({initial: true}),
                displayRoll: new BooleanField({initial: true}),
                folder: new ForeignDocumentField(BaseFolder$1),
                sort: new IntegerSortField(),
                ownership: new DocumentOwnershipField(),
                flags: new ObjectField(),
                _stats: new DocumentStatsField()
            }
        }

        /**
         * The default icon used for newly created Macro documents
         * @type {string}
         */
        static DEFAULT_ICON = "icons/svg/d20-grey.svg";

        /* -------------------------------------------- */
        /*  Deprecations and Compatibility              */
        /* -------------------------------------------- */

        /** @inheritDoc DataModel.migrateData */
        static migrateData(data) {
            /**
             * Rename permission to ownership
             * @deprecated since v10
             */
            this._addDataFieldMigration(data, "permission", "ownership");
            return super.migrateData(data);
        }

        /* ---------------------------------------- */

        /** @inheritdoc */
        static shimData(data, options) {
            this._addDataFieldShim(data, "permission", "ownership", {since: 10, until: 12});
            return super.shimData(data, options);
        }
    }
    var BaseRollTable$1 = BaseRollTable;

    /**
     * @typedef {Object} SceneData
     * @property {string} _id                 The _id which uniquely identifies this Scene document
     * @property {string} name                The name of this scene
     * @property {boolean} [active=false]     Is this scene currently active? Only one scene may be active at a given time
     * @property {boolean} [navigation=false] Is this scene displayed in the top navigation bar?
     * @property {number} [navOrder]          The sorting order of this Scene in the navigation bar relative to siblings
     * @property {string} [navName]           A string which overrides Scene name for display in the navigation bar
     * @property {TextureData|null} [background]  An image or video file that provides the background texture for the scene.
     * @property {string|null} [foreground]   An image or video file path providing foreground media for the scene
     * @property {number} [foregroundElevation=20] The elevation of the foreground layer where overhead tiles reside
     *
     * @property {string|null} [thumb]        A thumbnail image which depicts the scene at lower resolution
     * @property {number} [width=4000]        The width of the scene canvas, normally the width of the background media
     * @property {number} [height=3000]       The height of the scene canvas, normally the height of the background media
     * @property {number} [padding=0.25]      The proportion of canvas padding applied around the outside of the scene
     *                                        dimensions to provide additional buffer space
     * @property {{x: number, y: number, scale: number}|null} [initial=null] The initial view coordinates for the scene
     * @property {string|null} [backgroundColor=#999999] The color of the canvas displayed behind the scene background
     * @property {GridData} [grid]            Grid configuration for the scene
     * @property {boolean} [tokenVision=true] Do Tokens require vision in order to see the Scene environment?
     * @property {boolean} [globalLight=false] Is a global source of illumination present which provides dim light to all
     *                                        areas of the Scene?
     * @property {number} [darkness=0]        The ambient darkness level in this Scene, where 0 represents midday
     *                                        (maximum illumination) and 1 represents midnight (maximum darkness)
     * @property {number} [globalLightThreshold] A darkness threshold between 0 and 1. When the Scene darkness level
     *                                        exceeds this threshold Global Illumination is automatically disabled
     *
     * @property {boolean} [fogExploration=true] Should fog exploration progress be tracked for this Scene?
     * @property {number} [fogReset]          The timestamp at which fog of war was last reset for this Scene.
     * @property {string|null} [fogOverlay]   A special overlay image or video texture which is used for fog of war
     * @property {string|null} [fogExploredColor]   A color tint applied to explored regions of fog of war
     * @property {string|null} [fogUnexploredColor] A color tint applied to unexplored regions of fog of war
     *
     * @property {Collection<BaseDrawing>} [drawings=[]]   A collection of embedded Drawing objects.
     * @property {Collection<BaseTile>} [tiles=[]]         A collection of embedded Tile objects.
     * @property {Collection<BaseToken>} [tokens=[]]       A collection of embedded Token objects.
     * @property {Collection<BaseAmbientLight>} [lights=[]] A collection of embedded AmbientLight objects.
     * @property {Collection<BaseNote>} [notes=[]]         A collection of embedded Note objects.
     * @property {Collection<BaseAmbientSound>} [sounds=[]] A collection of embedded AmbientSound objects.
     * @property {Collection<BaseMeasuredTemplate>} [templates=[]] A collection of embedded MeasuredTemplate objects.
     * @property {Collection<BaseWall>} [walls=[]]         A collection of embedded Wall objects
     * @property {BasePlaylist} [playlist]    A linked Playlist document which should begin automatically playing when this
     *                                        Scene becomes active.
     * @property {BasePlaylistSound} [playlistSound]  A linked PlaylistSound document from the selected playlist that will
     *                                                begin automatically playing when this Scene becomes active
     * @property {JournalEntry} [journal]     A JournalEntry document which provides narrative details about this Scene
     * @property {string} [weather]           A named weather effect which should be rendered in this Scene.

     * @property {string|null} folder         The _id of a Folder which contains this Actor
     * @property {number} [sort]              The numeric sort value which orders this Actor relative to its siblings
     * @property {object} [ownership]         An object which configures ownership of this Scene
     * @property {object} [flags]             An object of optional key/value flags
     * @property {DocumentStats} [_stats]     An object of creation and access information
     */

    /**
     * @typedef {object} GridData
     * @property {number} [type=1]         The type of grid, a number from CONST.GRID_TYPES.
     * @property {number} [size=100]       The grid size which represents the width (or height) of a single grid space.
     * @property {string} [color=#000000]  A string representing the color used to render the grid lines.
     * @property {number} [alpha=0.2]      A number between 0 and 1 for the opacity of the grid lines.
     * @property {number} [distance]       The number of distance units which are represented by a single grid space.
     * @property {string} [units]          A label for the units of measure which are used for grid distance.
     */

    /**
     * The Document definition for a Scene.
     * Defines the DataSchema and common behaviors for a Scene which are shared between both client and server.
     * @extends abstract.Document
     * @mixes SceneData
     * @memberof documents
     *
     * @param {SceneData} data                        Initial data from which to construct the Scene
     * @param {DocumentConstructionContext} context   Construction context options
     */
    class BaseScene extends Document {

        /* -------------------------------------------- */
        /*  Model Configuration                         */
        /* -------------------------------------------- */

        /** @inheritdoc */
        static metadata = Object.freeze(mergeObject(super.metadata, {
            name: "Scene",
            collection: "scenes",
            indexed: true,
            compendiumIndexFields: ["_id", "name", "thumb", "sort"],
            embedded: {
                AmbientLight: "lights",
                AmbientSound: "sounds",
                Drawing: "drawings",
                MeasuredTemplate: "templates",
                Note: "notes",
                Tile: "tiles",
                Token: "tokens",
                Wall: "walls"
            },
            label: "DOCUMENT.Scene",
            labelPlural: "DOCUMENT.Scenes",
            preserveOnImport: [...super.metadata.preserveOnImport, "active"]
        }, {inplace: false}));

        /** @inheritdoc */
        static defineSchema() {
            return {
                _id: new DocumentIdField(),
                name: new StringField({required: true, blank: false}),

                // Navigation
                active: new BooleanField(),
                navigation: new BooleanField({initial: true}),
                navOrder: new NumberField({required: true, nullable: false, integer: true, initial: 0}),
                navName: new HTMLField(),

                // Canvas Dimensions
                background: new TextureData(),
                foreground: new FilePathField({categories: ["IMAGE", "VIDEO"]}),
                foregroundElevation: new NumberField({required: false, positive: true, integer: true}),
                thumb: new FilePathField({categories: ["IMAGE"]}),
                width: new NumberField({integer: true, positive: true, initial: 4000}),
                height: new NumberField({integer: true, positive: true, initial: 3000}),
                padding: new NumberField({required: true, nullable: false, min: 0, max: 0.5, step: 0.05, initial: 0.25}),
                initial: new SchemaField({
                    x: new NumberField({integer: true, nullable: true, initial: undefined}),
                    y: new NumberField({integer: true, nullable: true, initial: undefined}),
                    scale: new NumberField({nullable: true, min: 0.25, max: 3, initial: undefined})
                }),
                backgroundColor: new ColorField({initial: "#999999"}),

                // Grid Configuration
                grid: new SchemaField({
                    type: new NumberField({required: true, choices: Object.values(GRID_TYPES),
                        initial: GRID_TYPES.SQUARE, validationError: "must be a value in CONST.GRID_TYPES"}),
                    size: new NumberField({required: true, nullable: false, integer: true, min: GRID_MIN_SIZE,
                        initial: 100, validationError: `must be an integer number of pixels, ${GRID_MIN_SIZE} or greater`}),
                    color: new ColorField({required: true, nullable: false, initial: "#000000"}),
                    alpha: new AlphaField({initial: 0.2}),
                    distance: new NumberField({required: true, nullable: false, positive: true,
                        initial: () => game.system.gridDistance || 1}),
                    units: new StringField({initial: () => game.system.gridUnits ?? ""})
                }),

                // Vision and Lighting Configuration
                tokenVision: new BooleanField({initial: true}),
                fogExploration: new BooleanField({initial: true}),
                fogReset: new NumberField({nullable: false, initial: Date.now}),
                globalLight: new BooleanField(),
                globalLightThreshold: new AlphaField({nullable: true, initial: null}),
                darkness: new AlphaField({initial: 0}),
                fogOverlay: new FilePathField({categories: ["IMAGE", "VIDEO"]}),
                fogExploredColor: new ColorField({label: "SCENES.FogExploredColor"}),
                fogUnexploredColor: new ColorField({label: "SCENES.FogUnexploredColor"}),

                // Embedded Collections
                drawings: new EmbeddedCollectionField(BaseDrawing),
                tokens: new EmbeddedCollectionField(BaseToken$1),
                lights: new EmbeddedCollectionField(BaseAmbientLight),
                notes: new EmbeddedCollectionField(BaseNote),
                sounds: new EmbeddedCollectionField(BaseAmbientSound),
                templates: new EmbeddedCollectionField(BaseMeasuredTemplate),
                tiles: new EmbeddedCollectionField(BaseTile$1),
                walls: new EmbeddedCollectionField(BaseWall$1),

                // Linked Documents
                playlist: new ForeignDocumentField(BasePlaylist$1),
                playlistSound: new ForeignDocumentField(BasePlaylistSound$1, {idOnly: true}),
                journal: new ForeignDocumentField(BaseJournalEntry$1),
                journalEntryPage: new ForeignDocumentField(BaseJournalEntryPage$1, {idOnly: true}),
                weather: new StringField(),

                // Permissions
                folder: new ForeignDocumentField(BaseFolder$1),
                sort: new IntegerSortField(),
                ownership: new DocumentOwnershipField(),
                flags: new ObjectField(),
                _stats: new DocumentStatsField()
            }
        }

        /* -------------------------------------------- */
        /*  Deprecations and Compatibility              */
        /* -------------------------------------------- */

        /** @inheritdoc */
        static migrateData(data) {
            /**
             * Rename permission to ownership
             * @deprecated since v10
             */
            this._addDataFieldMigration(data, "permission", "ownership");

            /**
             * Migration to inner grid schema and TextureData. Can be safely removed in V13+
             * @deprecated since v10
             */
            if ( ("grid" in data) && (typeof data.grid !== "object") ) data.grid = {size: data.grid};
            for ( const [oldKey, newKey] of Object.entries({
                "gridType": "grid.type",
                "gridColor": "grid.color",
                "gridAlpha": "grid.alpha",
                "gridDistance": "grid.distance",
                "gridUnits": "grid.units",
                "img": "background.src",
                "shiftX": "background.offsetX",
                "shiftY": "background.offsetY"
            }) ) this._addDataFieldMigration(data, oldKey, newKey);
            return super.migrateData(data);
        }

        /* ---------------------------------------- */

        /** @inheritdoc */
        static shimData(data, options) {
            const shims = {};
            /**
             * Migration to inner grid schema.
             * @deprecated since v10
             */
            mergeObject(shims, {
                gridType: "grid.type",
                gridColor: "grid.color",
                gridAlpha: "grid.alpha",
                gridDistance: "grid.distance",
                gridUnits: "grid.units"
            });
            /**
             * Migration to TextureData.
             * @deprecated since v10
             */
            mergeObject(shims, {
                img: "background.src",
                shiftX: "background.offsetX",
                shiftY: "background.offsetY"
            });
            /**
             * Rename permission to owners.
             * @deprecated since v10
             */
            shims.permission = "ownership";
            this._addDataFieldShims(data, shims, {since: 10, until: 12});
            return super.shimData(data, options);
        }
    }
    var BaseScene$1 = BaseScene;

    /**
     * @typedef {Object} SettingData
     * @property {string} _id                 The _id which uniquely identifies this Setting document
     * @property {string} key                 The setting key, a composite of {scope}.{name}
     * @property {*} value                    The setting value, which is serialized to JSON
     * @property {DocumentStats} [_stats]     An object of creation and access information
     */

    /**
     * The Document definition for a Setting.
     * Defines the DataSchema and common behaviors for a Setting which are shared between both client and server.
     * @extends abstract.Document
     * @mixes SettingData
     * @memberof documents
     *
     * @param {SettingData} data                      Initial data from which to construct the Setting
     * @param {DocumentConstructionContext} context   Construction context options
     */
    class BaseSetting extends Document {

        /* -------------------------------------------- */
        /*  Model Configuration                         */
        /* -------------------------------------------- */

        /** @inheritdoc */
        static metadata = Object.freeze(mergeObject(super.metadata, {
            name: "Setting",
            collection: "settings",
            label: "DOCUMENT.Setting",
            labelPlural: "DOCUMENT.Settings",
            permissions: {
                create: "SETTINGS_MODIFY",
                update: "SETTINGS_MODIFY",
                delete: "SETTINGS_MODIFY"
            }
        }, {inplace: false}));

        /** @inheritdoc */
        static defineSchema() {
            return {
                _id: new DocumentIdField(),
                key: new StringField({required: true, nullable: false, blank: false,
                    validate: k => k.split(".").length >= 2,
                    validationError: "must have the format {scope}.{field}"}),
                value: new JSONField({required: true, nullable: true}),
                _stats: new DocumentStatsField()
            }
        }
    }

    /**
     * @typedef {Object} TableResultData
     * @property {string} _id                 The _id which uniquely identifies this TableResult embedded document
     * @property {number} [type=0]            A result subtype from CONST.TABLE_RESULT_TYPES
     * @property {string} [text]              The text which describes the table result
     * @property {string} [img]               An image file url that represents the table result
     * @property {string} [documentCollection] A named collection from which this result is drawn
     * @property {string} [documentId]        The _id of a Document within the collection this result references
     * @property {number} [weight=1]          The probabilistic weight of this result relative to other results
     * @property {number[]} [range]           A length 2 array of ascending integers which defines the range of dice roll
     *                                        totals which produce this drawn result
     * @property {boolean} [drawn=false]      Has this result already been drawn (without replacement)
     * @property {object} [flags]             An object of optional key/value flags
     */

    /**
     * The Document definition for a TableResult.
     * Defines the DataSchema and common behaviors for a TableResult which are shared between both client and server.
     * @extends abstract.Document
     * @mixes TableResultData
     * @memberof documents
     *
     * @param {TableResultData} data                  Initial data from which to construct the TableResult
     * @param {DocumentConstructionContext} context   Construction context options
     */
    class BaseTableResult extends Document {

        /* -------------------------------------------- */
        /*  Model Configuration                         */
        /* -------------------------------------------- */

        /** @inheritdoc */
        static metadata = Object.freeze(mergeObject(super.metadata, {
            name: "TableResult",
            collection: "results",
            label: "DOCUMENT.TableResult",
            labelPlural: "DOCUMENT.TableResults",
            coreTypes: Object.values(TABLE_RESULT_TYPES).map(t => String(t)),
            permissions: {
                update: this.#canUpdate
            }
        }, {inplace: false}));

        /** @inheritdoc */
        static defineSchema() {
            return {
                _id: new DocumentIdField(),
                type: new NumberField({required: true, choices: Object.values(TABLE_RESULT_TYPES),
                    initial: TABLE_RESULT_TYPES.TEXT, validationError: "must be a value in CONST.TABLE_RESULT_TYPES"}),
                text: new HTMLField(),
                img: new FilePathField({categories: ["IMAGE"]}),
                documentCollection: new StringField(),
                documentId: new ForeignDocumentField(Document, {idOnly: true}),
                weight: new NumberField({required: true, integer: true, positive: true}),
                range: new ArrayField(new NumberField({integer: true}), {
                    validate: r => (r.length === 2) && (r[1] >= r[0]),
                    validationError: "must be a length-2 array of ascending integers"
                }),
                drawn: new BooleanField(),
                flags: new ObjectField()
            }
        }

        /**
         * Is a user able to update an existing TableResult?
         * @private
         */
        static #canUpdate(user, doc, data) {
            if ( user.isGM ) return true;                               // GM users can do anything
            const wasDrawn = new Set(["drawn", "_id"]);                 // Users can update the drawn status of a result
            if ( new Set(Object.keys(data)).equals(wasDrawn) ) return true;
            return doc.parent.canUserModify(user, "update", data);      // Otherwise, go by parent document permission
        }

        /* -------------------------------------------- */
        /*  Model Methods                               */
        /* -------------------------------------------- */

        /** @inheritdoc */
        testUserPermission(user, permission, {exact=false}={}) {
            if ( this.isEmbedded ) return this.parent.testUserPermission(user, permission, {exact});
            return super.testUserPermission(user, permission, {exact});
        }

        /* -------------------------------------------- */
        /*  Deprecations and Compatibility              */
        /* -------------------------------------------- */

        /** @inheritdoc */
        static migrateData(data) {
            /**
             * Rename collection to resultCollection
             * @deprecated since v10
             */
            this._addDataFieldMigration(data, "collection", "documentCollection");
            this._addDataFieldMigration(data, "resultCollection", "documentCollection");
            this._addDataFieldMigration(data, "resultId", "documentId");
            return super.migrateData(data);
        }

        /* ---------------------------------------- */

        /** @inheritdoc */
        static shimData(data, options) {
            this._addDataFieldShim(data, "collection", "resultCollection", {since: 10, until: 12});
            return super.shimData(data, options);
        }
    }
    var BaseTableResult$1 = BaseTableResult;

    /**
     * @typedef {Object} TileOcclusionData
     * @property {number} mode        The occlusion mode from CONST.TILE_OCCLUSION_MODES
     * @property {number} alpha       The occlusion alpha between 0 and 1
     * @property {number} [radius]    An optional radius of occlusion used for RADIAL mode
     */

    /**
     * @typedef {Object} TileVideoData
     * @property {boolean} loop       Automatically loop the video?
     * @property {boolean} autoplay   Should the video play automatically?
     * @property {number} volume      The volume level of any audio that the video file contains
     */

    /**
     * @typedef {Object} TileData
     * @property {string} _id                 The _id which uniquely identifies this Tile embedded document
     * @property {TextureData} [texture]      An image or video texture which this tile displays.
     * @property {number} [width=0]           The pixel width of the tile
     * @property {number} [height=0]          The pixel height of the tile
     * @property {number} [x=0]               The x-coordinate position of the top-left corner of the tile
     * @property {number} [y=0]               The y-coordinate position of the top-left corner of the tile
     * @property {number} [z=100]             The z-index ordering of this tile relative to its siblings
     * @property {number} [rotation=0]        The angle of rotation for the tile between 0 and 360
     * @property {number} [alpha=1]           The tile opacity
     * @property {boolean} [hidden=false]     Is the tile currently hidden?
     * @property {boolean} [locked=false]     Is the tile currently locked?
     * @property {boolean} [overhead=false]   Is the tile an overhead tile?
     * @property {TileOcclusionData} [occlusion]  The tile's occlusion settings
     * @property {TileVideoData} [video]      The tile's video settings
     * @property {object} [flags]             An object of optional key/value flags
     */

    /**
     * The Document definition for a Tile.
     * Defines the DataSchema and common behaviors for a Tile which are shared between both client and server.
     * @extends abstract.Document
     * @mixes TileData
     * @memberof documents
     *
     * @param {TileData} data                         Initial data from which to construct the Tile
     * @param {DocumentConstructionContext} context   Construction context options
     */
    class BaseTile extends Document {

        /* -------------------------------------------- */
        /*  Model Configuration                         */
        /* -------------------------------------------- */

        /** @inheritdoc */
        static metadata = Object.freeze(mergeObject(super.metadata, {
            name: "Tile",
            collection: "tiles",
            label: "DOCUMENT.Tile",
            labelPlural: "DOCUMENT.Tiles"
        }, {inplace: false}));

        /** @inheritdoc */
        static defineSchema() {
            return {
                _id: new DocumentIdField(),
                texture: new TextureData(),
                width: new NumberField({required: true, min: 0, nullable: false, step: 0.1}),
                height: new NumberField({required: true, min: 0, nullable: false, step: 0.1}),
                x: new NumberField({required: true, integer: true, nullable: false, initial: 0, label: "XCoord"}),
                y: new NumberField({required: true, integer: true, nullable: false, initial: 0, label: "YCoord"}),
                z: new NumberField({required: true, integer: true, nullable: false, initial: 100}),
                rotation: new AngleField(),
                alpha: new AlphaField(),
                hidden: new BooleanField(),
                locked: new BooleanField(),
                overhead: new BooleanField(),
                roof: new BooleanField(),
                occlusion: new SchemaField({
                    mode: new NumberField({choices: Object.values(TILE_OCCLUSION_MODES),
                        initial: TILE_OCCLUSION_MODES.FADE,
                        validationError: "must be a value in CONST.TILE_OCCLUSION_MODES"}),
                    alpha: new AlphaField({initial: 0}),
                    radius: new NumberField({positive: true})
                }),
                video: new SchemaField({
                    loop: new BooleanField({initial: true}),
                    autoplay: new BooleanField({initial: true}),
                    volume: new AlphaField({initial: 0, step: 0.01})
                }),
                flags: new ObjectField()
            }
        }

        /** @inheritdoc */
        static migrateData(data) {
            /**
             * Migration to TextureData.
             * @deprecated since v10
             */
            this._addDataFieldMigration(data, "img", "texture.src");
            this._addDataFieldMigration(data, "tint", "texture.tint");

            data.texture = data.texture || {};
            if ( ("width" in data) && (data.width < 0) ) {
                data.width = Math.abs(data.width);
                data.texture.scaleX = -1;
            }
            if ( ("height" in data) && (data.height < 0) ) {
                data.height = Math.abs(data.height);
                data.texture.scaleY = -1;
            }
            /**
             * Migration from roof occlusion mode to fade occlusion mode and roof -> true.
             * @deprecated since v10
             */
            if ( Number(data?.occlusion?.mode) === 2 ) {
                data.occlusion.mode = 1;
                data.roof = true;
            }
            return super.migrateData(data);
        }

        /** @inheritdoc */
        static shimData(data, options) {
            /**
             * Migration to TextureData.
             * @deprecated since v10
             */
            const shims = {
                img: "texture.src",
                tint: "texture.tint"
            };
            this._addDataFieldShims(data, shims, {since: 10, until: 12});
            return super.shimData(data, options);
        }
    }
    var BaseTile$1 = BaseTile;

    /**
     * @typedef {Object} TokenSightData
     * @property {boolean} enabled            Should vision computation and rendering be active for this Token?
     * @property {number} range               How far in distance units the Token can see without the aid of a light source
     * @property {number} [angle=360]         An angle at which the Token can see relative to their direction of facing
     * @property {string} [visionMode=basic]  The vision mode which is used to render the appearance of the visible area
     * @property {string} [color]             A special color which applies a hue to the visible area
     * @property {number} [attenuation]       A degree of attenuation which gradually fades the edges of the visible area
     * @property {number} [brightness=0]      An advanced customization for the perceived brightness of the visible area
     * @property {number} [saturation=0]      An advanced customization of color saturation within the visible area
     * @property {number} [contrast=0]        An advanced customization for contrast within the visible area
     */

    /**
     * @typedef {Object} TokenDetectionMode
     * @property {string} id                  The id of the detection mode, a key from CONFIG.Canvas.detectionModes
     * @property {boolean} enabled            Whether or not this detection mode is presently enabled
     * @property {number} range               The maximum range in distance units at which this mode can detect targets
     */

    /**
     * @typedef {Object} TokenData
     * @property {string} _id                 The Token _id which uniquely identifies it within its parent Scene
     * @property {string} name                The name used to describe the Token
     * @property {number} [displayName=0]     The display mode of the Token nameplate, from CONST.TOKEN_DISPLAY_MODES
     * @property {string|null} actorId        The _id of an Actor document which this Token represents
     * @property {boolean} [actorLink=false]  Does this Token uniquely represent a singular Actor, or is it one of many?
     * @property {object} [actorData]         Token-level data which overrides the base data of the associated Actor
     * @property {TextureData} texture        The token's texture on the canvas.
     * @property {number} [width=1]           The width of the Token in grid units
     * @property {number} [height=1]          The height of the Token in grid units
     * @property {number} [x=0]               The x-coordinate of the top-left corner of the Token
     * @property {number} [y=0]               The y-coordinate of the top-left corner of the Token
     * @property {number} [elevation=0]       The vertical elevation of the Token, in distance units
     * @property {boolean} [lockRotation=false]  Prevent the Token image from visually rotating?
     * @property {number} [rotation=0]        The rotation of the Token in degrees, from 0 to 360. A value of 0 represents a southward-facing Token.
     * @property {string[]} [effects]         An array of effect icon paths which are displayed on the Token
     * @property {string} [overlayEffect]     A single icon path which is displayed as an overlay on the Token
     * @property {number} [alpha=1]           The opacity of the token image
     * @property {boolean} [hidden=false]     Is the Token currently hidden from player view?
     * @property {number} [disposition=-1]    A displayed Token disposition from CONST.TOKEN_DISPOSITIONS
     * @property {number} [displayBars=0]     The display mode of Token resource bars, from CONST.TOKEN_DISPLAY_MODES
     * @property {TokenBarData} [bar1]        The configuration of the Token's primary resource bar
     * @property {TokenBarData} [bar2]        The configuration of the Token's secondary resource bar
     * @property {data.LightData} [light]     Configuration of the light source that this Token emits
     * @property {TokenSightData} sight       Configuration of sight and vision properties for the Token
     * @property {TokenDetectionMode[]} detectionModes  An array of detection modes which are available to this Token
     * @property {object} [flags]             An object of optional key/value flags
     */

    /**
     * @typedef {Object} TokenBarData
     * @property {string} [attribute]         The attribute path within the Token's Actor data which should be displayed
     */

    /**
     * The base Token model definition which defines common behavior of a Token document between both client and server.
     * @extends Document
     * @mixes {TokenData}
     * @memberof documents
     */
    class BaseToken extends Document {

        /* -------------------------------------------- */
        /*  Model Configuration                         */
        /* -------------------------------------------- */

        /** @inheritdoc */
        static metadata = Object.freeze(mergeObject(super.metadata, {
            name: "Token",
            collection: "tokens",
            label: "DOCUMENT.Token",
            labelPlural: "DOCUMENT.Tokens",
            isEmbedded: true,
            permissions: {
                create: "TOKEN_CREATE",
                update: this.#canUpdate,
                delete: "TOKEN_DELETE"
            }
        }, {inplace: false}));

        /** @inheritdoc */
        static defineSchema() {
            return {
                _id: new DocumentIdField(),
                name: new StringField({required: true, blank: true}),
                displayName: new NumberField({required: true, initial: TOKEN_DISPLAY_MODES.NONE,
                    choices: Object.values(TOKEN_DISPLAY_MODES),
                    validationError: "must be a value in CONST.TOKEN_DISPLAY_MODES"
                }),
                actorId: new ForeignDocumentField(BaseActor$1, {idOnly: true}),
                actorLink: new BooleanField(),
                actorData: new ObjectField(),
                texture: new TextureData({}, {initial: () => this.DEFAULT_ICON, wildcard: true}),
                width: new NumberField({positive: true, initial: 1, label: "Width"}),
                height: new NumberField({positive: true, initial: 1, label: "Height"}),
                x: new NumberField({required: true, integer: true, nullable: false, initial: 0, label: "XCoord"}),
                y: new NumberField({required: true, integer: true, nullable: false, initial: 0, label: "YCoord"}),
                elevation: new NumberField({required: true, nullable: false, initial: 0}),
                lockRotation: new BooleanField(),
                rotation: new AngleField(),
                effects: new ArrayField(new StringField()),
                overlayEffect: new StringField(),
                alpha: new AlphaField(),
                hidden: new BooleanField(),
                disposition: new NumberField({required: true, choices: Object.values(TOKEN_DISPOSITIONS),
                    initial: TOKEN_DISPOSITIONS.HOSTILE,
                    validationError: "must be a value in CONST.TOKEN_DISPOSITIONS"
                }),
                displayBars: new NumberField({required: true, choices: Object.values(TOKEN_DISPLAY_MODES),
                    initial: TOKEN_DISPLAY_MODES.NONE,
                    validationError: "must be a value in CONST.TOKEN_DISPLAY_MODES"
                }),
                bar1: new SchemaField({
                    attribute: new StringField({required: true, nullable: true, blank: false,
                        initial: () => game?.system.primaryTokenAttribute || null})
                }),
                bar2: new SchemaField({
                    attribute: new StringField({required: true, nullable: true, blank: false,
                        initial: () => game?.system.secondaryTokenAttribute || null})
                }),
                light: new EmbeddedDataField(LightData),
                sight: new SchemaField({
                    enabled: new BooleanField({initial: data => Number(data?.sight?.range) > 0}),
                    range: new NumberField({required: true, min: 0, step: 0.01}),
                    angle: new AngleField({initial: 360, base: 360}),
                    visionMode: new StringField({required: true, blank: false, initial: "basic",
                        label: "TOKEN.VisionMode", hint: "TOKEN.VisionModeHint"}),
                    color: new ColorField({label: "TOKEN.VisionColor"}),
                    attenuation: new AlphaField({initial: 0.1, label: "TOKEN.VisionAttenuation", hint: "TOKEN.VisionAttenuationHint"}),
                    brightness: new NumberField({required: true, nullable: false, initial: 0, min: -1, max: 1,
                        label: "TOKEN.VisionBrightness", hint: "TOKEN.VisionBrightnessHint"}),
                    saturation: new NumberField({required: true, nullable: false, initial: 0, min: -1, max: 1,
                        label: "TOKEN.VisionSaturation", hint: "TOKEN.VisionSaturationHint"}),
                    contrast: new NumberField({required: true, nullable: false, initial: 0, min: -1, max: 1,
                        label: "TOKEN.VisionContrast", hint: "TOKEN.VisionContrastHint"})
                }),
                detectionModes: new ArrayField(new SchemaField({
                    id: new StringField(),
                    enabled: new BooleanField({initial: true}),
                    range: new NumberField({required: true, min: 0, step: 0.01, initial: 0})
                }), {
                    validate: BaseToken.#validateDetectionModes
                }),
                flags: new ObjectField()
            }
        }

        /* -------------------------------------------- */

        /**
         * Validate the structure of the detection modes array
         * @param {object[]} modes    Configured detection modes
         * @throws                    An error if the array is invalid
         */
        static #validateDetectionModes(modes) {
            const seen = new Set();
            for ( const mode of modes ) {
                if ( mode.id === "" ) continue;
                if ( seen.has(mode.id) ) {
                    throw new Error(`may not have more than one configured detection mode of type "${mode.id}"`);
                }
                seen.add(mode.id);
            }
        }

        /* -------------------------------------------- */

        /**
         * The default icon used for newly created Token documents
         * @type {string}
         */
        static DEFAULT_ICON = DEFAULT_TOKEN;

        /**
         * Is a user able to update an existing Token?
         * @private
         */
        static #canUpdate(user, doc, data) {
            if ( user.isGM ) return true;                     // GM users can do anything
            if ( doc.actor ) {                                // You can update Tokens for Actors you control
                return doc.actor.canUserModify(user, "update", data);
            }
            return !!doc.actorId;                             // It would be good to harden this in the future
        }

        /** @override */
        testUserPermission(user, permission, {exact=false} = {}) {
            if ( this.actor ) return this.actor.testUserPermission(user, permission, {exact});
            else return super.testUserPermission(user, permission, {exact});
        }

        /* -------------------------------------------- */

        /** @inheritDoc */
        static cleanData(source={}, options={}) {
            const cleaned = super.cleanData(source, options);
            if ( "actorData" in cleaned ) {  // Prevent actor data overrides from circularly referencing the prototype token
                delete cleaned.actorData["token"];
                delete cleaned.actorData["prototypeToken"];
            }
            return cleaned;
        }

        /* -------------------------------------------- */
        /*  Deprecations and Compatibility              */
        /* -------------------------------------------- */

        /** @inheritDoc */
        static migrateData(data) {
            const keys = new Set(Object.keys(data));

            /**
             * Migration of actor data to system data
             * @deprecated since v10
             */
            if ( data.actorData ) {
                foundry.documents.BaseActor.migrateData(data.actorData);
            }
            if ( data.actorData?.items ) {
                for ( const item of data.actorData.items ) foundry.documents.BaseItem.migrateData(item);
            }
            if ( data.actorData?.effects ) {
                for ( const effect of data.actorData.effects ) foundry.documents.BaseActiveEffect.migrateData(effect);
            }

            /**
             * Light config migration
             * @deprecated since v9
             */
            for ( const [oldKey, newKey] of Object.entries({
                "dimLight": "light.dim",
                "brightLight": "light.bright",
                "lightAngle": "light.angle",
                "lightColor": "light.color",
                "lightAlpha": "light.alpha",
                "lightAnimation": "light.animation"
            })) {
                if ( keys.has(oldKey) ) {
                    setProperty(data, newKey, data[oldKey]);
                    delete data[oldKey];
                }
            }

            /**
             * Migration to TextureData.
             * @deprecated since v10
             */
            for ( const [oldKey, newKey] of Object.entries({"img": "texture.src", "tint": "texture.tint"})) {
                if ( keys.has(oldKey) ) {
                    setProperty(data, newKey, data[oldKey]);
                    delete data[oldKey];
                }
            }

            let scaleX = data.texture?.scaleX ?? 1;
            let scaleY = data.texture?.scaleY ?? 1;

            /**
             * Texture scale migration
             * @deprecated since v10
             */
            if ( keys.has("scale") ) {
                scaleX = scaleY = data.scale;
                setProperty(data, "texture.scaleX", data.scale);
                setProperty(data, "texture.scaleY", data.scale);
                delete data.scale;
            }
            if ( keys.has("mirrorX") ) {
                setProperty(data, "texture.scaleX", data.mirrorX ? -Math.abs(scaleX) : Math.abs(scaleX));
                delete data.mirrorX;
            }
            if ( keys.has("mirrorY") ) {
                setProperty(data, "texture.scaleY", data.mirrorY ? -Math.abs(scaleY) : Math.abs(scaleY));
                delete data.mirrorY;
            }

            /**
             * Sight migration
             * @deprecated since v10
             */
            for ( const [oldKey, newKey] of Object.entries({"sightAngle": "sight.angle", "vision": "sight.enabled"})) {
                if ( keys.has(oldKey) ) {
                    setProperty(data, newKey, data[oldKey]);
                    delete data[oldKey];
                }
            }
            if ( keys.has("dimSight") || keys.has("brightSight") ) {
                const oldDimSight = data?.dimSight ?? 0;
                const oldBrightSight = data?.brightSight ?? 0;
                const newRange = Math.max(oldDimSight, oldBrightSight);
                setProperty(data, "sight.range", newRange);
                for ( const oldKey of ["dimSight", "brightSight"] ) {
                    if ( keys.has(oldKey) ) delete data[oldKey];
                }
                // Compute brightness with old dim/bright values
                let brightness = 0;
                if ( oldBrightSight >= oldDimSight ) brightness = 1;
                setProperty(data, "sight.brightness", brightness);
            }
            // Parent class migrations
            return super.migrateData(data);
        }

        /* ----------------------------------------- */

        /** @inheritdoc */
        static shimData(data, options) {
            const shims = {
                img: "texture.src",
                tint: "texture.tint",
                vision: "sight.enabled"
            };
            this._addDataFieldShims(data, shims, {since: 10, until: 12});
            if ( "texture" in data ) {
                this._addDataFieldShim(data, "mirrorX", "texture.scaleX", {value: data.texture.scaleX < 0, since: 10, until: 12});
                this._addDataFieldShim(data, "mirrorY", "texture.scaleY", {value: data.texture.scaleY < 0, since: 10, until: 12});
            }
            if ( !data.hasOwnProperty("scale") && ("texture" in data) ) {
                Object.defineProperty(data, "scale", {
                    get: () => {
                        this._logDataFieldMigration("scale", "texture#scaleX/scaleY", {since: 10, until: 12});
                        return Math.abs(data.texture.scaleX);
                    },
                    set: value => {
                        data.texture.scaleX = value;
                        data.texture.scaleY = value;
                    },
                    configurable: true,
                    enumerable: false
                });
            }
            return super.shimData(data, options);
        }
    }
    var BaseToken$1 = BaseToken;

    /**
     * @typedef {Object} UserData
     * @property {string} _id                 The _id which uniquely identifies this User document.
     * @property {string} name                The user's name.
     * @property {string} [password]          The user's password. Available only on the Server side for security.
     * @property {string} [passwordSalt]      The user's password salt. Available only on the Server side for security.
     * @property {string|null} [avatar]       The user's avatar image.
     * @property {BaseActor} [character]      A linked Actor document that is this user's impersonated character.
     * @property {string} color               A color to represent this user.
     * @property {object} hotbar              A mapping of hotbar slot number to Macro id for the user.
     * @property {object} permissions         The user's individual permission configuration, see CONST.USER_PERMISSIONS.
     * @property {number} role                The user's role, see CONST.USER_ROLES.
     * @property {object} [flags]             An object of optional key/value flags.
     * @property {DocumentStats} [_stats]     An object of creation and access information
     */

    /**
     * The Document definition for a User.
     * Defines the DataSchema and common behaviors for a User which are shared between both client and server.
     * @extends abstract.Document
     * @mixes UserData
     * @memberof documents
     *
     * @param {UserData} data                         Initial data from which to construct the User
     * @param {DocumentConstructionContext} context   Construction context options
     */
    class BaseUser extends Document {

        /* -------------------------------------------- */
        /*  Model Configuration                         */
        /* -------------------------------------------- */

        /** @inheritdoc */
        static metadata = Object.freeze(mergeObject(super.metadata, {
            name: "User",
            collection: "users",
            label: "DOCUMENT.User",
            labelPlural: "DOCUMENT.Users",
            permissions: {
                create: this.#canCreate,
                update: this.#canUpdate,
                delete: this.#canDelete
            }
        }, {inplace: false}));

        /* -------------------------------------------- */

        /** @inheritdoc */
        static defineSchema() {
            return {
                _id: new DocumentIdField(),
                name: new StringField({required: true, blank: false}),
                role: new NumberField({required: true, choices: Object.values(USER_ROLES),
                    initial: USER_ROLES.PLAYER, readonly: true}),
                password: new StringField(),
                passwordSalt: new StringField(),
                avatar: new FilePathField({categories: ["IMAGE"]}),
                character: new ForeignDocumentField(BaseActor$1),
                color: new ColorField({required: true, nullable: false,
                    initial: () => Color.fromHSV([Math.random(), 0.8, 0.8]).css
                }),
                hotbar: new ObjectField({required: true, validate: BaseUser.#validateHotbar,
                    validationError: "must be a mapping of slots to macro identifiers"}),
                permissions: new ObjectField({required: true, validate: BaseUser.#validatePermissions,
                    validationError: "must be a mapping of permission names to booleans"}),
                flags: new ObjectField(),
                _stats: new DocumentStatsField()
            }
        }

        /* -------------------------------------------- */

        /**
         * Validate the structure of the User hotbar object
         * @param {object} bar      The attempted hotbar data
         * @return {boolean}
         * @private
         */
        static #validateHotbar(bar) {
            if ( typeof bar !== "object" ) return false;
            for ( let [k, v] of Object.entries(bar) ) {
                let slot = parseInt(k);
                if ( !slot || slot < 1 || slot > 50 ) return false;
                if ( !isValidId(v) ) return false;
            }
            return true;
        }

        /* -------------------------------------------- */

        /**
         * Validate the structure of the User permissions object
         * @param {object} perms      The attempted permissions data
         * @return {boolean}
         * @private
         */
        static #validatePermissions(perms) {
            for ( let [k, v] of Object.entries(perms) ) {
                if (( typeof k !== "string") || (typeof v !== "boolean") ) return false;
            }
            return true;
        }

        /* -------------------------------------------- */
        /*  Model Properties                            */
        /* -------------------------------------------- */

        /**
         * Test whether the User has a GAMEMASTER or ASSISTANT role in this World?
         * @type {boolean}
         */
        get isGM() {
            return this.hasRole(USER_ROLES.ASSISTANT);
        }

        /* -------------------------------------------- */

        /**
         * Test whether the User is able to perform a certain permission action.
         * The provided permission string may pertain to an explicit permission setting or a named user role.
         * Alternatively, Gamemaster users are assumed to be allowed to take all actions.
         *
         * @param {string} action         The action to test
         * @return {boolean}              Does the user have the ability to perform this action?
         */
        can(action) {
            return this.isGM || this.hasPermission(action) || this.hasRole(action);
        }

        /* ---------------------------------------- */

        /** @inheritdoc */
        getUserLevel(user) {
            return DOCUMENT_OWNERSHIP_LEVELS[user.id === this.id ? "OWNER" : "NONE"];
        }

        /* ---------------------------------------- */

        /**
         * Test whether the User has at least a specific permission
         * @param {string} permission    The permission name from USER_PERMISSIONS to test
         * @return {boolean}             Does the user have at least this permission
         */
        hasPermission(permission) {

            // CASE 1: The user has the permission set explicitly
            const explicit = this.permissions[permission];
            if (explicit !== undefined) return explicit;

            // CASE 2: Permission defined by the user's role
            const rolePerms = game.permissions[permission];
            return rolePerms ? rolePerms.includes(this.role) : false;
        }

        /* ----------------------------------------- */

        /**
         * Test whether the User has at least the permission level of a certain role
         * @param {string|number} role    The role name from USER_ROLES to test
         * @param {boolean} [exact]       Require the role match to be exact
         * @return {boolean}              Does the user have at this role level (or greater)?
         */
        hasRole(role, {exact = false} = {}) {
            const level = typeof role === "string" ? USER_ROLES[role] : role;
            if (level === undefined) return false;
            return exact ? this.role === level : this.role >= level;
        }

        /* ---------------------------------------- */
        /*  Model Permissions                       */
        /* ---------------------------------------- */

        /**
         * Is a user able to create an existing User?
         * @param {BaseUser} user    The user attempting the creation.
         * @param {BaseUser} doc     The User document being created.
         * @param {object} data      The supplied creation data.
         * @private
         */
        static #canCreate(user, doc, data) {
            if ( !user.isGM ) return false; // Only Assistants and above can create users.
            // Do not allow Assistants to create a new user with special permissions which might be greater than their own.
            if ( !isEmpty(doc.permissions) ) return user.hasRole(USER_ROLES.GAMEMASTER);
            return user.hasRole(doc.role);
        }

        /* -------------------------------------------- */

        /**
         * Is a user able to update an existing User?
         * @param {BaseUser} user    The user attempting the update.
         * @param {BaseUser} doc     The User document being updated.
         * @param {object} changes   Proposed changes.
         * @private
         */
        static #canUpdate(user, doc, changes) {
            if ( user.hasRole(USER_ROLES.GAMEMASTER) ) return true;
            const reserved = new Set(["permissions", "name", "passwordSalt"]); // Non-GMs cannot update certain fields.
            if ( Object.keys(changes).some(k => reserved.has(k)) ) return false;

            // Assistant GMs cannot increase the role of other players to eclipse their own
            if ( ("role" in changes) && (!user.isGM || !user.hasRole(changes.role)) ) return false;

            // Users may only change their own password
            if ( ("password" in changes) && (user.id !== doc.id) ) return false; // A user can only update their own password.
            return user.isGM || (user.id === doc.id);
        }

        /* -------------------------------------------- */

        /**
         * Is a user able to delete an existing User?
         * Only Assistants and Gamemasters can delete users, and only if the target user has a lesser or equal role.
         * @param {BaseUser} user   The user attempting the deletion.
         * @param {BaseUser} doc    The User document being deleted.
         * @private
         */
        static #canDelete(user, doc) {
            const role = Math.max(USER_ROLES.ASSISTANT, doc.role);
            return user.hasRole(role);
        }
    }
    var BaseUser$1 = BaseUser;

    /**
     * @typedef {Object} WallData
     * @property {string} _id                 The _id which uniquely identifies the embedded Wall document
     * @property {number[]} c                 The wall coordinates, a length-4 array of finite numbers [x0,y0,x1,y1]
     * @property {number} [light=0]           The illumination restriction type of this wall
     * @property {number} [move=0]            The movement restriction type of this wall
     * @property {number} [sight=0]           The visual restriction type of this wall
     * @property {number} [sound=0]           The auditory restriction type of this wall
     * @property {number} [dir=0]             The direction of effect imposed by this wall
     * @property {number} [door=0]            The type of door which this wall contains, if any
     * @property {number} [ds=0]              The state of the door this wall contains, if any
     * @property {object} [flags]             An object of optional key/value flags
     */

    /**
     * The Document definition for a Wall.
     * Defines the DataSchema and common behaviors for a Wall which are shared between both client and server.
     * @extends abstract.Document
     * @mixes WallData
     * @memberof documents
     *
     * @param {WallData} data                         Initial data from which to construct the Wall
     * @param {DocumentConstructionContext} context   Construction context options
     */
    class BaseWall extends Document {

        /* -------------------------------------------- */
        /*  Model Configuration                         */
        /* -------------------------------------------- */

        /** @inheritdoc */
        static metadata = Object.freeze(mergeObject(super.metadata, {
            name: "Wall",
            collection: "walls",
            label: "DOCUMENT.Wall",
            labelPlural: "DOCUMENT.Walls",
            permissions: {
                update: this.#canUpdate
            }
        }, {inplace: false}));

        /** @inheritdoc */
        static defineSchema() {
            return {
                _id: new DocumentIdField(),
                c: new ArrayField(new NumberField({required: true, integer: true, nullable: false}), {
                    validate: c => (c.length === 4),
                    validationError: "must be a length-4 array of integer coordinates"}),
                light: new NumberField({required: true, choices: Object.values(WALL_SENSE_TYPES),
                    initial: WALL_SENSE_TYPES.NORMAL,
                    validationError: "must be a value in CONST.WALL_SENSE_TYPES"}),
                move: new NumberField({required: true, choices: Object.values(WALL_MOVEMENT_TYPES),
                    initial: WALL_MOVEMENT_TYPES.NORMAL,
                    validationError: "must be a value in CONST.WALL_MOVEMENT_TYPES"}),
                sight: new NumberField({required: true, choices: Object.values(WALL_SENSE_TYPES),
                    initial: WALL_SENSE_TYPES.NORMAL,
                    validationError: "must be a value in CONST.WALL_SENSE_TYPES"}),
                sound: new NumberField({required: true, choices: Object.values(WALL_SENSE_TYPES),
                    initial: WALL_SENSE_TYPES.NORMAL,
                    validationError: "must be a value in CONST.WALL_SENSE_TYPES"}),
                dir: new NumberField({required: true, choices: Object.values(WALL_DIRECTIONS),
                    initial: WALL_DIRECTIONS.BOTH,
                    validationError: "must be a value in CONST.WALL_DIRECTIONS"}),
                door: new NumberField({required: true, choices: Object.values(WALL_DOOR_TYPES),
                    initial: WALL_DOOR_TYPES.NONE,
                    validationError: "must be a value in CONST.WALL_DOOR_TYPES"}),
                ds: new NumberField({required: true, choices: Object.values(WALL_DOOR_STATES),
                    initial: WALL_DOOR_STATES.CLOSED,
                    validationError: "must be a value in CONST.WALL_DOOR_STATES"}),
                flags: new ObjectField()
            }
        }

        /**
         * Is a user able to update an existing Wall?
         * @private
         */
        static #canUpdate(user, doc, data) {
            if ( user.isGM ) return true;                     // GM users can do anything
            const dsOnly = Object.keys(data).every(k => ["_id", "ds"].includes(k));
            if ( dsOnly && (doc.ds !== WALL_DOOR_STATES.LOCKED) && (data.ds !== WALL_DOOR_STATES.LOCKED) ) {
                return user.hasRole("PLAYER");                  // Players may open and close unlocked doors
            }
            return false;
        }

        /* -------------------------------------------- */
        /*  Deprecations and Compatibility              */
        /* -------------------------------------------- */

        /** @inheritdoc */
        static migrateData(data) {
            /**
             * Separate sense restriction into light and sound
             * @deprecated since v9
             */
            if ( "sense" in data ) {
                if ( !("sight" in data) ) data.sight = data.sense;
                if ( !("light" in data) ) data.light = data.sense;
                delete data.sense;
            }

            const reMap = {1: WALL_SENSE_TYPES.NORMAL, 2: WALL_SENSE_TYPES.LIMITED};
            /**
             * Migrate limited restriction to be less than normal
             * @deprecated since v9
             */
            for ( let t of ["light", "move", "sight", "sound"] ) {
                if ( t in data ) {
                    data[t] = reMap[data[t]] ?? data[t];
                }
            }
            return super.migrateData(data);
        }
    }
    var BaseWall$1 = BaseWall;

    var documents = /*#__PURE__*/Object.freeze({
        __proto__: null,
        BaseActiveEffect: BaseActiveEffect,
        BaseActor: BaseActor$1,
        BaseAdventure: BaseAdventure,
        BaseAmbientLight: BaseAmbientLight,
        BaseAmbientSound: BaseAmbientSound,
        BaseCard: BaseCard,
        BaseCards: BaseCards$1,
        BaseChatMessage: BaseChatMessage,
        BaseCombat: BaseCombat$1,
        BaseCombatant: BaseCombatant$1,
        BaseDrawing: BaseDrawing,
        BaseFogExploration: BaseFogExploration,
        BaseFolder: BaseFolder$1,
        BaseItem: BaseItem$1,
        BaseJournalEntry: BaseJournalEntry$1,
        BaseJournalEntryPage: BaseJournalEntryPage$1,
        BaseMacro: BaseMacro$1,
        BaseMeasuredTemplate: BaseMeasuredTemplate,
        BaseNote: BaseNote,
        BasePlaylist: BasePlaylist$1,
        BasePlaylistSound: BasePlaylistSound$1,
        BaseRollTable: BaseRollTable$1,
        BaseScene: BaseScene$1,
        BaseSetting: BaseSetting,
        BaseTableResult: BaseTableResult$1,
        BaseTile: BaseTile$1,
        BaseToken: BaseToken$1,
        BaseUser: BaseUser$1,
        BaseWall: BaseWall$1
    });

    /**
     * The collection of data schema and document definitions for primary documents which are shared between the both the
     * client and the server.
     * @namespace data
     */

    /**
     * @typedef {Object} LightAnimationData
     * @property {string} type          The animation type which is applied
     * @property {number} speed         The speed of the animation, a number between 0 and 10
     * @property {number} intensity     The intensity of the animation, a number between 1 and 10
     * @property {boolean} reverse      Reverse the direction of animation.
     */

    /**
     * A reusable document structure for the internal data used to render the appearance of a light source.
     * This is re-used by both the AmbientLightData and TokenData classes.
     * @extends DataModel
     * @memberof data
     *
     * @property {number} alpha               An opacity for the emitted light, if any
     * @property {number} angle               The angle of emission for this point source
     * @property {number} bright              The allowed radius of bright vision or illumination
     * @property {number} color               A tint color for the emitted light, if any
     * @property {number} coloration          The coloration technique applied in the shader
     * @property {number} contrast            The amount of contrast this light applies to the background texture
     * @property {number} dim                 The allowed radius of dim vision or illumination
     * @property {number} attenuation         Fade the difference between bright, dim, and dark gradually?
     * @property {number} luminosity          The luminosity applied in the shader
     * @property {number} saturation          The amount of color saturation this light applies to the background texture
     * @property {number} shadows             The depth of shadows this light applies to the background texture
     * @property {LightAnimationData} animation  An animation configuration for the source
     * @property {{min: number, max: number}} darkness  A darkness range (min and max) for which the source should be active
     */
    class LightData extends DataModel {
        static defineSchema() {
            return {
                alpha: new AlphaField({initial: 0.5, label: "LIGHT.Alpha"}),
                angle: new AngleField({initial: 360, base: 360, label: "LIGHT.Angle"}),
                bright: new NumberField({required: true, initial: 0, min: 0, step: 0.01, label: "LIGHT.Bright"}),
                color: new ColorField({label: "LIGHT.Color"}),
                coloration: new NumberField({required: true, integer: true, initial: 1,
                    label: "LIGHT.ColorationTechnique", hint: "LIGHT.ColorationTechniqueHint"}),
                dim: new NumberField({required: true, initial: 0, min: 0, step: 0.01, label: "LIGHT.Dim"}),
                attenuation: new AlphaField({initial: 0.5, label: "LIGHT.Attenuation", hint: "LIGHT.AttenuationHint"}),
                luminosity: new NumberField({required: true, nullable: false, initial: 0.5, min: -1, max: 1,
                    label: "LIGHT.Luminosity", hint: "LIGHT.LuminosityHint"}),
                saturation: new NumberField({required: true, nullable: false, initial: 0, min: -1, max: 1,
                    label: "LIGHT.Saturation", hint: "LIGHT.SaturationHint"}),
                contrast: new NumberField({required: true, nullable: false, initial: 0, min: -1, max: 1,
                    label: "LIGHT.Contrast", hint: "LIGHT.ContrastHint"}),
                shadows: new NumberField({required: true, nullable: false, initial: 0, min: 0, max: 1,
                    label: "LIGHT.Shadows", hint: "LIGHT.ShadowsHint"}),
                animation: new SchemaField({
                    type: new StringField({nullable: true, blank: false, initial: null, label: "LIGHT.AnimationType"}),
                    speed: new NumberField({required: true, integer: true, initial: 5, min: 0, max: 10,
                        label: "LIGHT.AnimationSpeed", validationError: "Light animation speed must be an integer between 0 and 10"}),
                    intensity: new NumberField({required: true, integer: true, initial: 5, min: 0, max: 10,
                        label: "LIGHT.AnimationIntensity",
                        validationError: "Light animation intensity must be an integer between 1 and 10"}),
                    reverse: new BooleanField({label: "LIGHT.AnimationReverse"})
                }),
                darkness: new SchemaField({
                    min: new AlphaField({initial: 0}),
                    max: new AlphaField({initial: 1})
                }, {
                    label: "LIGHT.DarknessRange", hint: "LIGHT.DarknessRangeHint", validate: d => (d.min ?? 0) <= (d.max ?? 1),
                    validationError: "darkness.max may not be less than darkness.min"
                })
            }
        }

        /** @inheritdoc */
        static migrateData(data) {

            // Migrate negative radius to luminosity slider
            let isDarkness = false;
            if ( data.angle === 0 ) data.angle = 360;
            if ( data.dim < 0 ) {
                data.dim = Math.abs(data.dim);
                isDarkness = true;
            }
            if ( data.bright < 0 ) {
                data.bright = Math.abs(data.bright);
                isDarkness = true;
            }
            if ( isDarkness ) data.luminosity = Math.abs(data.luminosity) * -1;

            // Migrate gradual checkbox into attenuation slider
            if ( "gradual" in data ) {
                data.attenuation = data.gradual ? 0.5 : 0.3;
                delete data.gradual;
            }
            return super.migrateData(data);
        }
    }

    /* ---------------------------------------- */

    /**
     * A data model intended to be used as an inner EmbeddedDataField which defines a geometric shape.
     * @extends DataModel
     * @memberof data
     *
     * @property {string} type                The type of shape, a value in ShapeData.TYPES.
     *                                        For rectangles, the x/y coordinates are the top-left corner.
     *                                        For circles, the x/y coordinates are the center of the circle.
     *                                        For polygons, the x/y coordinates are the first point of the polygon.
     * @property {number} [width]             For rectangles, the pixel width of the shape.
     * @property {number} [height]            For rectangles, the pixel width of the shape.
     * @property {number} [radius]            For circles, the pixel radius of the shape.
     * @property {number[]} [points]          For polygons, the array of polygon coordinates which comprise the shape.
     */
    class ShapeData extends DataModel {
        static defineSchema() {
            return {
                type: new StringField({required: true, blank: false, choices: Object.values(this.TYPES), initial: "r"}),
                width: new NumberField({required: false, integer: true, min: 0}),
                height: new NumberField({required: false, integer: true, min: 0}),
                radius: new NumberField({required: false, integer: true, positive: true}),
                points: new ArrayField(new NumberField({nullable: false}))
            }
        }

        /**
         * The primitive shape types which are supported
         * @enum {string}
         */
        static TYPES = {
            RECTANGLE: "r",
            CIRCLE: "c",
            ELLIPSE: "e",
            POLYGON: "p"
        }
    }

    /* ---------------------------------------- */


    /**
     * A {@link fields.SchemaField} subclass used to represent texture data.
     * @property {string|null} src          The URL of the texture source.
     * @property {number} [scaleX=1]        The scale of the texture in the X dimension.
     * @property {number} [scaleY=1]        The scale of the texture in the Y dimension.
     * @property {number} [offsetX=0]       The X offset of the texture with (0,0) in the top left.
     * @property {number} [offsetY=0]       The Y offset of the texture with (0,0) in the top left.
     * @property {number} [rotation]        An angle of rotation by which this texture is rotated around its center.
     * @property {string|null} [tint=null]  An optional color string used to tint the texture.
     */
    class TextureData extends SchemaField {
        /**
         * @param {DataFieldOptions} options          Options which are forwarded to the SchemaField constructor
         * @param {FilePathFieldOptions} srcOptions   Additional options for the src field
         */
        constructor(options={}, {categories=["IMAGE", "VIDEO"], initial=null, wildcard=false, label}={}) {
            super({
                src: new FilePathField({categories, initial, label, wildcard}),
                scaleX: new NumberField({nullable: false, initial: 1}),
                scaleY: new NumberField({nullable: false, initial: 1}),
                offsetX: new NumberField({nullable: false, integer: true, initial: 0}),
                offsetY: new NumberField({nullable: false, integer: true, initial: 0}),
                rotation: new AngleField(),
                tint: new ColorField()
            }, options);
        }
    }

    /* ---------------------------------------- */

    /**
     * Extend the base TokenData to define a PrototypeToken which exists within a parent Actor.
     * @extends abstract.DataModel
     * @memberof data
     * @property {boolean} randomImg      Does the prototype token use a random wildcard image?
     */
    class PrototypeToken extends DataModel {
        static defineSchema() {
            const schema = BaseToken$1.defineSchema();
            const excluded = ["_id", "actorId", "actorData", "x", "y", "elevation", "effects", "overlayEffect", "hidden"];
            for ( let x of excluded ) {
                delete schema[x];
            }
            schema.name = new StringField({required: true, blank: true});  // Prototype token name can be blank
            schema.randomImg = new BooleanField();
            return schema;
        }

        /**
         * The Actor which owns this Prototype Token
         * @type {documents.BaseActor}
         */
        get actor() {
            return this.parent;
        }

        /** @inheritdoc */
        toObject(source=true) {
            const data = super.toObject(source);
            data["actorId"] = this.document?.id;
            return data;
        }

        /**
         * @see ClientDocument.database
         * @ignore
         */
        static get database() {
            return globalThis.CONFIG.DatabaseBackend;
        }

        /** @inheritdoc */
        static migrateData(data) {
            return BaseToken$1.migrateData(data);
        }

        /** @inheritdoc */
        static shimData(data, options) {
            return BaseToken$1.shimData(data, options);
        }

        /* -------------------------------------------- */
        /*  Document Compatibility Methods              */
        /* -------------------------------------------- */

        /**
         * @see abstract.Document#update
         * @ignore
         */
        update(data, options) {
            return this.actor.update({prototypeToken: data}, options);
        }

        /* -------------------------------------------- */

        /**
         * @see abstract.Document#getFlag
         * @ignore
         */
        getFlag(...args) {
            return foundry.abstract.Document.prototype.getFlag.call(this, ...args);
        }

        /* -------------------------------------------- */

        /**
         * @see abstract.Document#getFlag
         * @ignore
         */
        setFlag(...args) {
            return foundry.abstract.Document.prototype.setFlag.call(this, ...args);
        }

        /* -------------------------------------------- */

        /**
         * @see abstract.Document#unsetFlag
         * @ignore
         */
        async unsetFlag(...args) {
            return foundry.abstract.Document.prototype.unsetFlag.call(this, ...args);
        }

        /* -------------------------------------------- */

        /**
         * @see abstract.Document#testUserPermission
         * @ignore
         */
        testUserPermission(user, permission, {exact=false}={}) {
            return this.actor.testUserPermission(user, permission, {exact});
        }

        /* -------------------------------------------- */

        /**
         * @see documents.BaseActor#isOwner
         * @ignore
         */
        get isOwner() {
            return this.actor.isOwner;
        }
    }

    /* -------------------------------------------- */

    /**
     * @deprecated since v10
     * @see PrototypeToken
     * @ignore
     */
    class PrototypeTokenData extends PrototypeToken {
        constructor(...args) {
            foundry.utils.logCompatibilityWarning("You are using the PrototypeTokenData class which has been renamed to" +
                " PrototypeToken and will be removed.", {since: 10, until: 12});
            super(...args);
        }
    }

    var data = /*#__PURE__*/Object.freeze({
        __proto__: null,
        validators: validators,
        fields: fields,
        LightData: LightData,
        PrototypeToken: PrototypeToken,
        PrototypeTokenData: PrototypeTokenData,
        ShapeData: ShapeData,
        TextureData: TextureData
    });

    /**
     * Determine the relative orientation of three points in two-dimensional space.
     * The result is also an approximation of twice the signed area of the triangle defined by the three points.
     * This method is fast - but not robust against issues of floating point precision. Best used with integer coordinates.
     * Adapted from https://github.com/mourner/robust-predicates
     * @memberof helpers
     *
     * @param {Point} a     An endpoint of segment AB, relative to which point C is tested
     * @param {Point} b     An endpoint of segment AB, relative to which point C is tested
     * @param {Point} c     A point that is tested relative to segment AB
     *
     * @returns {number}    The relative orientation of points A, B, and C
     *                      A positive value if the points are in counter-clockwise order (C lies to the left of AB)
     *                      A negative value if the points are in clockwise order (C lies to the right of AB)
     *                      Zero if the points A, B, and C are collinear.
     */
    function orient2dFast(a, b, c) {
        return (a.y - c.y) * (b.x - c.x) - (a.x - c.x) * (b.y - c.y);
    }

    /* -------------------------------------------- */

    /**
     * Quickly test whether the line segment AB intersects with the line segment CD.
     * This method does not determine the point of intersection, for that use lineLineIntersection
     * @memberof helpers
     *
     * @param {Point} a                   The first endpoint of segment AB
     * @param {Point} b                   The second endpoint of segment AB
     * @param {Point} c                   The first endpoint of segment CD
     * @param {Point} d                   The second endpoint of segment CD
     *
     * @returns {boolean}                 Do the line segments intersect?
     */
    function lineSegmentIntersects(a, b, c, d) {

        // First test the orientation of A and B with respect to CD to reject collinear cases
        const xa = foundry.utils.orient2dFast(a, b, c);
        const xb = foundry.utils.orient2dFast(a, b, d);
        if ( !xa && !xb ) return false;
        const xab = (xa * xb) <= 0;

        // Also require an intersection of CD with respect to AB
        const xcd = (foundry.utils.orient2dFast(c, d, a) * foundry.utils.orient2dFast(c, d, b)) <= 0;
        return xab && xcd;
    }

    /* -------------------------------------------- */

    /**
     * @typedef {Object}                  LineIntersection
     * @property {number} x               The x-coordinate of intersection
     * @property {number} y               The y-coordinate of intersection
     * @property {number} t0              The vector distance from A to B on segment AB
     * @property {number} [t1]            The vector distance from C to D on segment CD
     */

    /**
     * An internal helper method for computing the intersection between two infinite-length lines.
     * Adapted from http://paulbourke.net/geometry/pointlineplane/
     * @memberof helpers
     *
     * @param {Point} a                   The first endpoint of segment AB
     * @param {Point} b                   The second endpoint of segment AB
     * @param {Point} c                   The first endpoint of segment CD
     * @param {Point} d                   The second endpoint of segment CD
     * @param {object} [options]          Options which affect the intersection test
     * @param {boolean} [options.t1=false]    Return the optional vector distance from C to D on CD
     *
     * @returns {LineIntersection|null}   An intersection point, or null if no intersection occurred
     */
    function lineLineIntersection(a, b, c, d, {t1=false}={}) {

        // If either line is length 0, they cannot intersect
        if (((a.x === b.x) && (a.y === b.y)) || ((c.x === d.x) && (c.y === d.y))) return null;

        // Check denominator - avoid parallel lines where d = 0
        const dnm = ((d.y - c.y) * (b.x - a.x) - (d.x - c.x) * (b.y - a.y));
        if (dnm === 0) return null;

        // Vector distances
        const t0 = ((d.x - c.x) * (a.y - c.y) - (d.y - c.y) * (a.x - c.x)) / dnm;
        t1 = t1 ? ((b.x - a.x) * (a.y - c.y) - (b.y - a.y) * (a.x - c.x)) / dnm : undefined;

        // Return the point of intersection
        return {
            x: a.x + t0 * (b.x - a.x),
            y: a.y + t0 * (b.y - a.y),
            t0: t0,
            t1: t1
        }
    }

    /* -------------------------------------------- */

    /**
     * An internal helper method for computing the intersection between two finite line segments.
     * Adapted from http://paulbourke.net/geometry/pointlineplane/
     * @memberof helpers
     *
     * @param {Point} a                   The first endpoint of segment AB
     * @param {Point} b                   The second endpoint of segment AB
     * @param {Point} c                   The first endpoint of segment CD
     * @param {Point} d                   The second endpoint of segment CD
     * @param {number} [epsilon]          A small epsilon which defines a tolerance for near-equality
     * *
     * @returns {LineIntersection|null}   An intersection point, or null if no intersection occurred
     */
    function lineSegmentIntersection(a, b, c, d, epsilon=1e-8) {

        // If either line is length 0, they cannot intersect
        if (((a.x === b.x) && (a.y === b.y)) || ((c.x === d.x) && (c.y === d.y))) return null;

        // Check denominator - avoid parallel lines where d = 0
        const dnm = ((d.y - c.y) * (b.x - a.x) - (d.x - c.x) * (b.y - a.y));
        if (dnm === 0) return null;

        // Vector distance from a
        const t0 = ((d.x - c.x) * (a.y - c.y) - (d.y - c.y) * (a.x - c.x)) / dnm;
        if ( !Number.between(t0, 0-epsilon, 1+epsilon) ) return null;

        // Vector distance from c
        const t1 = ((b.x - a.x) * (a.y - c.y) - (b.y - a.y) * (a.x - c.x)) / dnm;
        if ( !Number.between(t1, 0-epsilon, 1+epsilon) ) return null;

        // Return the point of intersection and the vector distance from both line origins
        return {
            x: a.x + t0 * (b.x - a.x),
            y: a.y + t0 * (b.y - a.y),
            t0: Math.clamped(t0, 0, 1),
            t1: Math.clamped(t1, 0, 1)
        }
    }

    /* -------------------------------------------- */

    /**
     * @typedef {Object} LineCircleIntersection
     * @property {boolean} aInside        Is point A inside the circle?
     * @property {boolean} bInside        Is point B inside the circle?
     * @property {boolean} contained      Is the segment AB contained within the circle?
     * @property {boolean} outside        Is the segment AB fully outside the circle?
     * @property {boolean} tangent        Is the segment AB tangent to the circle?
     * @property {Point[]} intersections  Intersection points: zero, one, or two
     */

    /**
     * Determine the intersection between a candidate wall and the circular radius of the polygon.
     * @memberof helpers
     *
     * @param {Point} a                   The initial vertex of the candidate edge
     * @param {Point} b                   The second vertex of the candidate edge
     * @param {Point} center              The center of the bounding circle
     * @param {number} radius             The radius of the bounding circle
     * @param {number} epsilon            A small tolerance for floating point precision
     *
     * @returns {LineCircleIntersection}  The intersection of the segment AB with the circle
     */
    function lineCircleIntersection(a, b, center, radius, epsilon=1e-8) {
        const r2 = Math.pow(radius, 2);
        let intersections = [];

        // Test whether endpoint A is contained
        const ar2 = Math.pow(a.x - center.x, 2) + Math.pow(a.y - center.y, 2);
        const aInside = ar2 <= r2 + epsilon;

        // Test whether endpoint B is contained
        const br2 = Math.pow(b.x - center.x, 2) + Math.pow(b.y - center.y, 2);
        const bInside = br2 <= r2 + epsilon;

        // Find quadratic intersection points
        const contained = aInside && bInside;
        if ( !contained ) {
            intersections = quadraticIntersection(a, b, center, radius, epsilon);
        }

        // Return the intersection data
        return {
            aInside,
            bInside,
            contained,
            outside: !contained && !intersections.length,
            tangent: !aInside && !bInside && intersections.length === 1,
            intersections
        };
    }



    /* -------------------------------------------- */

    /**
     * Identify the point closest to C on segment AB
     * @memberof helpers
     *
     * @param {Point} c     The reference point C
     * @param {Point} a     Point A on segment AB
     * @param {Point} b     Point B on segment AB
     *
     * @returns {Point}     The closest point to C on segment AB
     */
    function closestPointToSegment(c, a, b) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        if (( dx === 0 ) && ( dy === 0 )) {
            throw new Error("Zero-length segment AB not supported");
        }
        const u = (((c.x - a.x) * dx) + ((c.y - a.y) * dy)) / (dx * dx + dy * dy);
        if ( u < 0 ) return a;
        if ( u > 1 ) return b;
        else return {
            x: a.x + (u * dx),
            y: a.y + (u * dy)
        }
    }

    /* -------------------------------------------- */

    /**
     * Determine the points of intersection between a line segment (p0,p1) and a circle.
     * There will be zero, one, or two intersections
     * See https://math.stackexchange.com/a/311956
     * @memberof helpers
     *
     * @param {Point} p0            The initial point of the line segment
     * @param {Point} p1            The terminal point of the line segment
     * @param {Point} center        The center of the circle
     * @param {number} radius       The radius of the circle
     * @param {number} [epsilon=0]  A small tolerance for floating point precision
     */
    function quadraticIntersection(p0, p1, center, radius, epsilon=0) {
        const dx = p1.x - p0.x;
        const dy = p1.y - p0.y;

        // Quadratic terms where at^2 + bt + c = 0
        const a = Math.pow(dx, 2) + Math.pow(dy, 2);
        const b = (2 * dx * (p0.x - center.x)) + (2 * dy * (p0.y - center.y));
        const c = Math.pow(p0.x - center.x, 2) + Math.pow(p0.y - center.y, 2) - Math.pow(radius, 2);

        // Discriminant
        const disc2 = Math.pow(b, 2) - (4 * a * c);
        if ( disc2 <= 0 ) return []; // no intersections

        // Roots
        const disc = Math.sqrt(disc2);
        const t1 = (-b - disc) / (2 * a);
        const t2 = (-b + disc) / (2 * a);

        // If t1 hits (between 0 and 1) it indicates an "entry"
        const intersections = [];
        if ( t1.between(0-epsilon, 1+epsilon) ) {
            intersections.push({
                x: p0.x + (dx * t1),
                y: p0.y + (dy * t1)
            });
        }

        // If t2 hits (between 0 and 1) it indicates an "exit"
        if ( t2.between(0-epsilon, 1+epsilon) ) {
            intersections.push({
                x: p0.x + (dx * t2),
                y: p0.y + (dy * t2)
            });
        }
        return intersections;
    }

    /**
     * A wrapper method around `fetch` that attaches an AbortController signal to the `fetch` call for clean timeouts
     * @see https://www.npmjs.com/package/node-fetch#request-cancellation-with-abortsignal
     * @param {string} url            The URL to make the Request to
     * @param {Object} data           The data of the Request
     * @param {number|null} timeoutMs How long to wait for a Response before cleanly aborting.
     *                                If null, no timeout is applied
     * @param {function} onTimeout    A method to invoke if and when the timeout is reached
     * @return {Promise<Response>}
     * @throws {HttpError}
     */
    async function fetchWithTimeout(url, data = {}, {timeoutMs=30000, onTimeout = () => {}} = {}) {
        const controller = new AbortController();
        data.signal = controller.signal;
        let timedOut = false;
        const enforceTimeout = timeoutMs !== null;

        // Enforce a timeout
        let timeout;
        if ( enforceTimeout ) {
            timeout = setTimeout(() => {
                timedOut = true;
                controller.abort();
                onTimeout();
            }, timeoutMs);
        }

        // Attempt the request
        let response;
        try {
            response = await fetch(url, data);
        } catch(err) {
            if ( timedOut ) throw new HttpError("Timed Out", 408, `The request to ${url} timed out after ${timeoutMs} ms`);
            throw err;
        } finally {
            if ( enforceTimeout ) clearTimeout(timeout);
        }

        // Return the response
        if ( !response.ok && (response.type !== "opaqueredirect") ) {
            const responseBody = response.body ? await response.text() : "";
            throw new HttpError(response.statusText, response.status, responseBody);
        }
        return response;
    }

    /* ----------------------------------------- */

    /**
     * A small wrapper that automatically asks for JSON with a Timeout
     * @param {string} url          The URL to make the Request to
     * @param {Object} data         The data of the Request
     * @param {int} timeoutMs       How long to wait for a Response before cleanly aborting
     * @param {function} onTimeout  A method to invoke if and when the timeout is reached
     * @returns {Promise<*>}
     */
    async function fetchJsonWithTimeout(url, data = {}, {timeoutMs=30000, onTimeout = () => {}} = {}) {
        let response = await fetchWithTimeout(url, data, {timeoutMs: timeoutMs, onTimeout: onTimeout});
        return response.json();
    }

    /* ----------------------------------------- */

    /**
     * Represents an HTTP Error when a non-OK response is returned by Fetch
     * @extends {Error}
     */
    class HttpError extends Error {
        constructor(statusText, code, displayMessage="") {
            super(statusText);
            this.code = code;
            this.displayMessage = displayMessage;
        }
    }

    /**
     * A simple Semaphore implementation which provides a limited queue for ensuring proper concurrency.
     * @param {number} [max=1]    The maximum number of tasks which are allowed concurrently.
     *
     * @example Using a Semaphore
     * ```js
     * // Some async function that takes time to execute
     * function fn(x) {
     *   return new Promise(resolve => {
     *     setTimeout(() => {
     *       console.log(x);
     *       resolve(x);
     *     }, 1000));
     *   }
     * };
     *
     * // Create a Semaphore and add many concurrent tasks
     * const semaphore = new Semaphore(1);
     * for ( let i of Array.fromRange(100) ) {
     *   semaphore.add(fn, i);
     * }
     * ```
     */
    class Semaphore {
        constructor(max=1) {

            /**
             * The maximum number of tasks which can be simultaneously attempted.
             * @type {number}
             */
            this.max = max;

            /**
             * A queue of pending function signatures
             * @type {Array<Array<Function|*>>}
             * @private
             */
            this._queue = [];

            /**
             * The number of tasks which are currently underway
             * @type {number}
             * @private
             */
            this._active = 0;
        }

        /**
         * The number of pending tasks remaining in the queue
         * @type {number}
         */
        get remaining() {
            return this._queue.length;
        }

        /**
         * The number of actively executing tasks
         * @type {number}
         */
        get active() {
            return this._active;
        }

        /**
         * Add a new tasks to the managed queue
         * @param {Function} fn     A callable function
         * @param {...*} [args]     Function arguments
         * @returns {Promise}       A promise that resolves once the added function is executed
         */
        add(fn, ...args) {
            return new Promise((resolve, reject) => {
                this._queue.push([fn, args, resolve, reject]);
                return this._try();
            });
        }

        /**
         * Abandon any tasks which have not yet concluded
         */
        clear() {
            this._queue = [];
        }

        /**
         * Attempt to perform a task from the queue.
         * If all workers are busy, do nothing.
         * If successful, try again.
         * @private
         */
        async _try() {
            if ( (this.active === this.max) || !this.remaining ) return false;

            // Obtain the next task from the queue
            const next = this._queue.shift();
            if ( !next ) return;
            this._active += 1;

            // Try and execute it, resolving its promise
            const [fn, args, resolve, reject] = next;
            try {
                const r = await fn(...args);
                resolve(r);
            }
            catch(err) {
                reject(err);
            }

            // Try the next function in the queue
            this._active -= 1;
            return this._try();
        }
    }

    var utils = /*#__PURE__*/Object.freeze({
        __proto__: null,
        Collection: Collection,
        Color: Color,
        Semaphore: Semaphore,
        orient2dFast: orient2dFast,
        lineSegmentIntersects: lineSegmentIntersects,
        lineLineIntersection: lineLineIntersection,
        lineSegmentIntersection: lineSegmentIntersection,
        lineCircleIntersection: lineCircleIntersection,
        closestPointToSegment: closestPointToSegment,
        quadraticIntersection: quadraticIntersection,
        benchmark: benchmark,
        threadLock: threadLock,
        debounce: debounce,
        debouncedReload: debouncedReload,
        deepClone: deepClone,
        diffObject: diffObject,
        objectsEqual: objectsEqual,
        duplicate: duplicate,
        isSubclass: isSubclass,
        encodeURL: encodeURL,
        expandObject: expandObject,
        filterObject: filterObject,
        flattenObject: flattenObject,
        getParentClasses: getParentClasses,
        getRoute: getRoute,
        getType: getType,
        hasProperty: hasProperty,
        getProperty: getProperty,
        setProperty: setProperty,
        invertObject: invertObject,
        isNewerVersion: isNewerVersion,
        isObjectEmpty: isObjectEmpty,
        isEmpty: isEmpty,
        mergeObject: mergeObject,
        parseS3URL: parseS3URL,
        randomID: randomID,
        timeSince: timeSince,
        rgbToHsv: rgbToHsv,
        hsvToRgb: hsvToRgb,
        rgbToHex: rgbToHex,
        hexToRGB: hexToRGB,
        hexToRGBAString: hexToRGBAString,
        colorStringToHex: colorStringToHex,
        fetchWithTimeout: fetchWithTimeout,
        fetchJsonWithTimeout: fetchJsonWithTimeout,
        HttpError: HttpError,
        logCompatibilityWarning: logCompatibilityWarning
    });

    /**
     * A custom SchemaField for defining package compatibility versions.
     * @property {string} minimum     The Package will not function before this version
     * @property {string} verified    Verified compatible up to this version
     * @property {string} maximum     The Package will not function after this version
     */
    class PackageCompatibility extends SchemaField {
        constructor(options) {
            super({
                minimum: new StringField({required: false, blank: false, initial: undefined}),
                verified: new StringField({required: false, blank: false, initial: undefined}),
                maximum: new StringField({required: false, blank: false, initial: undefined})
            }, options);
        }
    }

    /* -------------------------------------------- */

    /**
     * A custom SchemaField for defining a related Package.
     * It may be required to be a specific type of package, by passing the packageType option to the constructor.
     */
    class RelatedPackage extends SchemaField {
        constructor({packageType, ...options}={}) {
            let typeOptions = {choices: PACKAGE_TYPES, initial:"module"};
            if ( packageType ) typeOptions = {choices: [packageType], initial: packageType};
            super({
                id: new StringField({required: true, blank: false}),
                type: new StringField(typeOptions),
                manifest: new StringField({required: false, blank: false, initial: undefined}),
                compatibility: new PackageCompatibility(),
                reason: new StringField({required: false, blank: false, initial: undefined})
            }, options);
        }
    }

    /* -------------------------------------------- */

    /**
     * The data schema used to define a Package manifest.
     * Specific types of packages extend this schema with additional fields.
     */
    class BasePackage extends DataModel {
        /**
         * @param {PackageManifestData} data  Source data for the package
         * @param {object} [options={}]       Options which affect DataModel construction
         */
        constructor(data, options={}) {
            const {availability, unavailable, locked, exclusive, owned, tags} = data;
            super(data, options);

            /**
             * An availability code in PACKAGE_AVAILABILITY_CODES which defines whether this package can be used.
             * @type {number}
             */
            this.availability = availability ?? PACKAGE_AVAILABILITY_CODES.UNKNOWN;

            /**
             * A flag which defines whether this package is unavailable to be used.
             * @type {boolean}
             */
            this.unavailable = unavailable ?? this.availability > PACKAGE_AVAILABILITY_CODES.REQUIRES_UPDATE;

            /**
             * A flag which tracks whether this package is currently locked.
             * @type {boolean}
             */
            this.locked = locked ?? false;

            /**
             * A flag which tracks whether this package is a free Exclusive pack
             * @type {boolean}
             */
            this.exclusive = exclusive ?? false;

            /**
             * A flag which tracks whether this package is owned, if it is protected.
             * @type {boolean|null}
             */
            this.owned = owned ?? false;

            /**
             * A set of Tags that indicate what kind of Package this is, provided by the Website
             * @type {string[]}
             */
            this.tags = tags ?? [];
        }

        /**
         * Define the package type in CONST.PACKAGE_TYPES that this class represents.
         * Each BasePackage subclass must define this attribute.
         * @virtual
         * @type {string}
         */
        static type = "package";

        /**
         * The type of this package instance. A value in CONST.PACKAGE_TYPES.
         * @type {string}
         */
        get type() {
            return this.constructor.type;
        }

        /**
         * The canonical identifier for this package
         * @return {string}
         * @deprecated
         */
        get name() {
            logCompatibilityWarning("You are accessing BasePackage#name which is now deprecated in favor of id.",
                {since: 10, until: 13});
            return this.id;
        }

        /**
         * The named collection to which this package type belongs
         * @type {string}
         */
        static get collection() {
            return `${this.type}s`;
        }

        /** @deprecated */
        get data() {
            logCompatibilityWarning("You are accessing BasePackage#data which is now deprecated in favor of referencing " +
                "schema fields directly on the BasePackage instance.", {since: 10, until: 12});
            return this;
        }

        /** @inheritDoc */
        static defineSchema() {
            const optionalString = {required: false, blank: false, initial: undefined};
            return {

                // Package metadata
                id: new StringField({required: true, blank: false, validate: BasePackage.#validateId}),
                title: new StringField({required: true, blank: false}),
                description: new StringField({required: true}),
                authors: new SetField(new SchemaField({
                    name: new StringField({required: true, blank: false}),
                    email: new StringField(optionalString),
                    url: new StringField(optionalString),
                    discord: new StringField(optionalString),
                    flags: new ObjectField(),
                })),
                url: new StringField(optionalString),
                license: new StringField(optionalString),
                readme: new StringField(optionalString),
                bugs: new StringField(optionalString),
                changelog: new StringField(optionalString),
                flags: new ObjectField(),
                media: new SetField(new SchemaField({
                    type: new StringField(optionalString),
                    url: new StringField(optionalString),
                    caption: new StringField(optionalString),
                    loop: new BooleanField({required: false, blank: false, initial: false}),
                    thumbnail: new StringField(optionalString),
                    flags: new ObjectField(),
                })),

                // Package versioning
                version: new StringField({required: true, blank: false, initial: "0"}),
                compatibility: new PackageCompatibility(),

                // Included content
                scripts: new SetField(new StringField({required: true, blank: false})),
                esmodules: new SetField(new StringField({required: true, blank: false})),
                styles: new SetField(new StringField({required: true, blank: false})),
                languages: new SetField(new SchemaField({
                    lang: new StringField({required: true, blank: false, validate: Intl.getCanonicalLocales,
                        validationError: "must be supported by the Intl.getCanonicalLocales function"
                    }),
                    name: new StringField(),
                    path: new StringField({required: true, blank: false}),
                    system: new StringField(optionalString),
                    module: new StringField(optionalString),
                    flags: new ObjectField(),
                })),
                packs: new SetField(new SchemaField({
                    name: new StringField({required: true, blank: false, validate: n => !n.includes("."),
                        validationError: "may not contain periods"}),
                    label: new StringField({required: true, blank: false}),
                    path: new StringField({required: true, blank: false}),
                    private: new BooleanField(),
                    type: new StringField({required: true, blank: false, choices: COMPENDIUM_DOCUMENT_TYPES,
                        validationError: "must be a value in CONST.COMPENDIUM_DOCUMENT_TYPES"}),
                    system: new StringField(optionalString),
                    flags: new ObjectField(),
                }, {
                    validate: BasePackage.#validatePack
                })),

                // Package relationships
                relationships: new SchemaField({
                    systems: new SetField(new RelatedPackage({packageType: "system"})),
                    requires: new SetField(new RelatedPackage()),
                    conflicts: new SetField(new RelatedPackage()),
                    flags: new ObjectField(),
                }),
                socket: new BooleanField(),

                // Package downloading
                manifest: new StringField(),
                download: new StringField({required: false, blank: false, initial: undefined}),
                protected: new BooleanField(),
                exclusive: new BooleanField()
            }
        }

        /* -------------------------------------------- */

        /** @inheritdoc */
        _initializeSource(data, options) {
            super._initializeSource(data, options);

            // Auto-assign language name
            for ( let l of data.languages ) {
                l.name = l.name ?? l.lang;
            }

            // Auto-assign system compatibility to compendium packs
            let systemId = undefined;
            if ( this.type === "system" ) systemId = data.id;
            else if ( this.type === "world" ) systemId = data.system;
            else if ( data.relationships?.systems?.length === 1 ) systemId = data.relationships.systems[0].id;
            for ( const pack of data.packs ) {
                if ( !pack.system ) pack.system = systemId;
            }
            return data;
        }

        /* -------------------------------------------- */

        /**
         * Validate that a Package ID is allowed.
         * @param {string} id     The candidate ID
         * @throws                An error if the candidate ID is invalid
         */
        static #validateId(id) {
            const allowed = /^[A-Za-z0-9-_]+$/;
            if ( !allowed.test(id) ) throw new Error("Package IDs may only be alphanumeric with hyphens or underscores.");
            const prohibited = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
            if ( prohibited.test(id) ) throw new Error(`The Package ID "${id}" uses an operating system prohibited value.`);
        }

        /* -------------------------------------------- */

        /** @override */
        static #validatePack(packData) {
            if ( SYSTEM_SPECIFIC_COMPENDIUM_TYPES.includes(packData.type) && !packData.system ) {
                throw new Error(`The Compendium pack "${packData.name}" of the "${packData.type}" type must declare the "system"`
                    + " upon which it depends.");
            }
        }

        /* -------------------------------------------- */

        /**
         * A wrapper around the default compatibility warning logger which handles some package-specific interactions.
         * @param {string} packageId    The package ID being logged
         * @param {string} message      The warning or error being logged
         * @param {object} options      Logging options passed to foundry.utils.logCompatibilityWarning
         */
        static #logWarning(packageId, message, options) {
            logCompatibilityWarning(message, options);
            globalThis.packages?.warnings?.add(packageId, "warning", message);
        }

        /* -------------------------------------------- */

        /** @inheritdoc */
        static migrateData(data) {
            this._migrateNameToId(data, {since: 10, until: 13});
            this._migrateCompendiumEntityToType(data, {since: 9, until: 11});
            this._migrateAuthorToAuthors(data, {since: 9, until: 11});
            this._migrateDependenciesNameToId(data, {since: 10, until: 13});
            this._migrateToRelationships(data, {since: 10, until: 13});
            this._migrateStringAuthors(data, {since: 9, until: 11});
            this._migrateCompatibility(data, {since: 10, until: 13});
            return super.migrateData(data);
        }

        /* -------------------------------------------- */

        /** @internal */
        static _migrateNameToId(data, {since, until}) {
            if ( data.name && !data.id ) {
                data.id = data.name;
                delete data.name;
                if ( this.type !== "world" ) {
                    const warning = `The ${this.type} "${data.id}" is using "name" which is deprecated in favor of "id"`;
                    BasePackage.#logWarning(data.id, warning, {since, until, stack: false});
                }
            }
        }

        /* -------------------------------------------- */

        /** @internal */
        static _migrateCompendiumEntityToType(data, {since, until}) {
            let hasEntity = false;
            for ( let p of data.packs || [] ) {
                if ( ("entity" in p) && !p.type ) {
                    hasEntity = true;
                    p.type = p.entity;
                }
            }
            if ( hasEntity ) {
                const msg = `The ${this.type} "${data.id}" contains compendium pack data which uses the deprecated "entity" field `
                    + `which must be migrated to "type"`;
                BasePackage.#logWarning(data.id, msg, {mode: CONST.COMPATIBILITY_MODES.WARNING, since, until, stack: false});
            }
        }

        /* -------------------------------------------- */

        /** @internal */
        static _migrateAuthorToAuthors(data, {since, until}) {
            if ( data.author && !data.authors ) {
                if ( this.type !== "world" ) {
                    const warning = `The ${this.type} "${data.id}" is using "author" which is deprecated in favor of "authors"`;
                    BasePackage.#logWarning(data.id, warning, {since, until, stack: false});
                }
                data.authors = data.authors || [];
                data.authors.push({name: data.author});
                delete data.author;
            }
        }

        /* -------------------------------------------- */

        /** @internal */
        static _migrateDependenciesNameToId(data, {since, until}) {
            if ( data.relationships ) return;
            if ( data.dependencies ) {
                let hasDependencyName = false;
                for ( const dependency of data.dependencies ) {
                    if ( dependency.name && !dependency.id ) {
                        hasDependencyName = true;
                        dependency.id = dependency.name;
                        delete dependency.name;
                    }
                }
                if ( hasDependencyName ) {
                    const msg = `The ${this.type} "${data.id}" contains dependencies using "name" which is deprecated in favor of "id"`;
                    BasePackage.#logWarning(data.id, msg, {since, until, stack: false});
                }
            }
        }

        /* -------------------------------------------- */

        /** @internal */
        static _migrateToRelationships(data, {since, until}) {
            if ( data.relationships ) return;
            data.relationships = {
                requires: [],
                systems: []
            };

            // Dependencies -> Relationships.Requires
            if ( data.dependencies ) {
                for ( const d of data.dependencies ) {
                    const relationship = {
                        "id": d.id,
                        "type": d.type,
                        "manifest": d.manifest,
                        "compatibility": {
                            "compatible": d.version
                        }
                    };
                    d.type === "system" ? data.relationships.systems.push(relationship) : data.relationships.requires.push(relationship);
                }
                const msg = `The ${this.type} "${data.id}" contains "dependencies" which is deprecated in favor of "relationships.requires"`;
                BasePackage.#logWarning(data.id, msg, {since, until, stack: false});
                delete data.dependencies;
            }

            // Pre-V9: systems -> relationships.systems
            if ( data.systems ) {
                const newSystems = data.systems.map(id => ({id})).filter(s => !data.relationships.systems.find(x => x.id === s.id));
                data.relationships.systems = data.relationships.systems.concat(newSystems);
                const msg = `${this.type} "${data.id}" contains the "systems" field which is deprecated in favor of "relationships.systems"`;
                BasePackage.#logWarning(data.id, msg, {since: 9, until: 11, stack: false});
                delete data.systems;
            }

            // V9: system -> relationships.systems
            else if ( data.system && (this.type === "module") ) {
                data.system = data.system instanceof Array ? data.system : [data.system];
                const newSystems = data.system.map(id => ({id})).filter(s => !data.relationships.systems.find(x => x.id === s.id));
                data.relationships.systems = data.relationships.systems.concat(newSystems);
                const msg = `${this.type} "${data.id}" contains "system" which is deprecated in favor of "relationships.systems"`;
                BasePackage.#logWarning(data.id, msg, {since, until, stack: false});
                delete data.system;
            }
        }

        /* -------------------------------------------- */

        /** @internal */
        static _migrateStringAuthors(data, {since, until}) {
            let stringAuthors = false;
            if ( typeof data.authors === "string" ) data.authors = [data.authors];
            data.authors = (data.authors || []).map(a => {
                if ( typeof a === "string" ) {
                    stringAuthors = true;
                    return {name: a}
                }
                return a;
            });
            if ( stringAuthors ) {
                const msg = `The ${this.type} "${data.id}" provides an "authors" array containing string ` +
                    "elements which is deprecated in favor of using PackageAuthorData objects";
                BasePackage.#logWarning(data.id, msg, {mode: CONST.COMPATIBILITY_MODES.WARNING, since, until, stack: false});
            }
        }

        /* -------------------------------------------- */

        /** @internal */
        static _migrateCompatibility(data, {since, until}) {
            if ( !data.compatibility && (data.minimumCoreVersion || data.compatibleCoreVersion) ) {
                BasePackage.#logWarning(data.id, `The ${this.type} "${data.id}" is using the old flat core compatibility fields which `
                    + `are deprecated in favor of the new "compatibility" object`,
                    {since, until, stack: false});

                data.compatibility = {
                    minimum: data.minimumCoreVersion,
                    verified: data.compatibleCoreVersion
                };
                delete data.minimumCoreVersion;
                delete data.compatibleCoreVersion;
            }
        }

        /* -------------------------------------------- */

        /**
         * Retrieve the latest Package manifest from a provided remote location.
         * @param {string} manifestUrl        A remote manifest URL to load
         * @param {object} options            Additional options which affect package construction
         * @param {boolean} [options.strict=true]   Whether to construct the remote package strictly
         * @return {Promise<ServerPackage>}   A Promise which resolves to a constructed ServerPackage instance
         * @throws                            An error if the retrieved manifest data is invalid
         */
        static async fromRemoteManifest(manifestUrl, {strict=true}={}) {
            throw new Error("Not implemented");
        }
    }

    /**
     * The data schema used to define World manifest files.
     * Extends the basic PackageData schema with some additional world-specific fields.
     * @property {string} system            The game system name which this world relies upon
     * @property {string} coreVersion       The version of the core software for which this world has been migrated
     * @property {string} systemVersion     The version of the game system for which this world has been migrated
     * @property {string} [background]      A web URL or local file path which provides a background banner image
     * @property {string} [nextSession]     An ISO datetime string when the next game session is scheduled to occur
     * @property {boolean} [resetKeys]      Should user access keys be reset as part of the next launch?
     * @property {boolean} [safeMode]       Should the world launch in safe mode?
     */
    class BaseWorld extends BasePackage {

        /** @inheritDoc */
        static defineSchema() {
            return Object.assign({}, super.defineSchema(), {
                system: new StringField({required: true, blank: false}),
                background: new StringField({required: false, blank: false, initial: undefined}),
                coreVersion: new StringField({required: true, blank: false}),
                systemVersion: new StringField({required: true, blank: false, initial: "0"}),
                nextSession: new StringField({blank: false, nullable: true, initial: null}),
                resetKeys: new BooleanField({required: false, initial: undefined}),
                safeMode: new BooleanField({required: false, initial: undefined}),
                version: new StringField({required: true, blank: false, nullable: true, initial: null})
            });
        }

        /** @override */
        static type = "world";

        /** @inheritDoc */
        static migrateData(data) {
            super.migrateData(data);
            data.compatibility = data.compatibility || {};
            if ( data.compatibility.maximum === "1.0.0" ) data.compatibility.maximum = undefined;
            if ( data.coreVersion && !data.compatibility.verified ) {
                data.compatibility.minimum = data.compatibility.verified = data.coreVersion;
            }
            return data;
        }
    }

    /**
     * The data schema used to define System manifest files.
     * Extends the basic PackageData schema with some additional system-specific fields.
     * @property {string} [background]        A web URL or local file path which provides a default background banner for
     *                                        worlds which are created using this system
     * @property {string} [initiative]        A default initiative formula used for this system
     * @property {number} [gridDistance]      A default distance measurement to use for Scenes in this system
     * @property {string} [gridUnits]         A default unit of measure to use for distance measurement in this system
     * @property {string} [primaryTokenAttribute] An Actor data attribute path to use for Token primary resource bars
     * @property {string} [primaryTokenAttribute] An Actor data attribute path to use for Token secondary resource bars
     */
    class BaseSystem extends BasePackage {

        /** @inheritDoc */
        static defineSchema() {
            return Object.assign({}, super.defineSchema(), {
                background: new StringField(),
                initiative: new StringField(),
                gridDistance: new NumberField(),
                gridUnits: new StringField(),
                primaryTokenAttribute: new StringField(),
                secondaryTokenAttribute: new StringField()
            });
        }

        /** @inheritdoc */
        static type = "system";

        /**
         * An alias for the document types available in the currently active World.
         * @enum string[]
         */
        get documentTypes() {
            return game.documentTypes;
        }

        /**
         * An alias for the raw template JSON loaded from the game System.
         * @type {object}
         */
        get template() {
            return game.template;
        }

        /**
         * An alias for the structured data model organized by document class and type.
         * @type {object}
         */
        get model() {
            return game.model;
        }
    }

    /**
     * The data schema used to define Module manifest files.
     * Extends the basic PackageData schema with some additional module-specific fields.
     * @property {boolean} [coreTranslation]     Does this module provide a translation for the core software?
     * @property {boolean} [library]             A library module provides no user-facing functionality and is solely for
     *                                           use by other modules. Loaded before any system or module scripts.
     */
    class BaseModule extends BasePackage {

        /** @inheritDoc */
        static defineSchema() {
            const parentSchema = super.defineSchema();
            return Object.assign({}, parentSchema, {
                coreTranslation: new BooleanField(),
                library: new BooleanField()
            });
        }

        /** @override */
        static type = "module";
    }

    /** @module packages */

    /* ---------------------------------------- */
    /*  Type Definitions                        */
    /* ---------------------------------------- */

    /**
     * @typedef {Object} PackageAuthorData
     * @property {string} name        The author name
     * @property {string} [email]     The author email address
     * @property {string} [url]       A website url for the author
     * @property {string} [discord]   A Discord username for the author
     */

    /**
     * @typedef {Object} PackageCompendiumData
     * @property {string} name        The canonical compendium name. This should contain no spaces or special characters
     * @property {string} label       The human-readable compendium name
     * @property {string} path        The local relative path to the compendium source .db file. The filename should match
     *                                the name attribute
     * @property {string} type        The specific document type that is contained within this compendium pack
     * @property {string} [system]    Denote that this compendium pack requires a specific game system to function properly
     */

    /**
     * @typedef {Object} PackageLanguageData
     * @property {string} lang        A string language code which is validated by Intl.getCanonicalLocales
     * @property {string} name        The human-readable language name
     * @property {string} path        The relative path to included JSON translation strings
     * @property {string} [system]    Only apply this set of translations when a specific system is being used
     * @property {string} [module]    Only apply this set of translations when a specific module is active
     */

    /**
     * @typedef {Object} RelatedPackage
     * @property {string} id                              The id of the related package
     * @property {string} type                            The type of the related package
     * @property {string} [manifest]                      An explicit manifest URL, otherwise learned from the Foundry web server
     * @property {PackageCompatibility} [compatibility]   The compatibility data with this related Package
     * @property {string} [reason]                        The reason for this relationship
     */

    /**
     * @typedef {Object} PackageRelationships
     * @property {RelatedPackage[]} systems     Systems that this Package supports
     * @property {RelatedPackage[]} required    Packages that are required for base functionality
     */

    /**
     * @typedef {Object} PackageManifestData
     * The data structure of a package manifest. This data structure is extended by BasePackage subclasses to add additional
     * type-specific fields.
     * [[include:full-manifest.md]]
     *
     * @property {string} id              The machine-readable unique package id, should be lower-case with no spaces or special characters
     * @property {string} title           The human-readable package title, containing spaces and special characters
     * @property {string} [description]   An optional package description, may contain HTML
     * @property {PackageAuthorData[]} [authors]  An array of author objects who are co-authors of this package. Preferred to the singular author field.
     * @property {string} [url]           A web url where more details about the package may be found
     * @property {string} [license]       A web url or relative file path where license details may be found
     * @property {string} [readme]        A web url or relative file path where readme instructions may be found
     * @property {string} [bugs]          A web url where bug reports may be submitted and tracked
     * @property {string} [changelog]     A web url where notes detailing package updates are available
     * @property {string} version         The current package version
     * @property {PackageCompatibility} [compatibility]  The compatibility of this version with the core Foundry software
     * @property {string[]} [scripts]     An array of urls or relative file paths for JavaScript files which should be included
     * @property {string[]} [esmodules]   An array of urls or relative file paths for ESModule files which should be included
     * @property {string[]} [styles]      An array of urls or relative file paths for CSS stylesheet files which should be included
     * @property {PackageLanguageData[]} [languages]  An array of language data objects which are included by this package
     * @property {PackageCompendiumData[]} [packs] An array of compendium packs which are included by this package
     * @property {PackageRelationships} [relationships] An organized object of relationships to other Packages
     * @property {boolean} [socket]       Whether to require a package-specific socket namespace for this package
     * @property {string} [manifest]      A publicly accessible web URL which provides the latest available package manifest file. Required in order to support module updates.
     * @property {string} [download]      A publicly accessible web URL where the source files for this package may be downloaded. Required in order to support module installation.
     * @property {boolean} [protected=false] Whether this package uses the protected content access system.
     */

    /* ---------------------------------------- */
    /*  Deprecations and Compatibility          */
    /* ---------------------------------------- */

    /**
     * @deprecated since v10
     * @ignore
     */
    class PackageData extends BasePackage {
        constructor(...args) {
            logCompatibilityWarning("foundry.packages.PackageData is deprecated in favor of foundry.packages.BasePackage", {
                since: 10,
                until: 12
            });
            super(...args);
        }
    }

    /**
     * @deprecated since v10
     * @ignore
     */
    class WorldData extends BaseWorld {
        constructor(...args) {
            logCompatibilityWarning("foundry.packages.WorldData is deprecated in favor of foundry.packages.BaseWorld", {
                since: 10,
                until: 12
            });
            super(...args);
        }
    }

    /**
     * @deprecated since v10
     * @ignore
     */
    class SystemData extends BaseSystem {
        constructor(...args) {
            logCompatibilityWarning("foundry.packages.SystemData is deprecated in favor of foundry.packages.BaseSystem", {
                since: 10,
                until: 12
            });
            super(...args);
        }
    }

    /**
     * @deprecated since v10
     * @ignore
     */
    class ModuleData extends BaseModule {
        constructor(...args) {
            logCompatibilityWarning("foundry.packages.ModuleData is deprecated in favor of foundry.packages.BaseModule", {
                since: 10,
                until: 12
            });
            super(...args);
        }
    }

    var packages = /*#__PURE__*/Object.freeze({
        __proto__: null,
        PackageData: PackageData,
        WorldData: WorldData,
        SystemData: SystemData,
        ModuleData: ModuleData,
        BasePackage: BasePackage,
        BaseWorld: BaseWorld,
        BaseSystem: BaseSystem,
        BaseModule: BaseModule,
        PackageCompatibility: PackageCompatibility,
        RelatedPackage: RelatedPackage
    });

    /** @namespace config */

    /**
     * A data model definition which describes the application configuration options.
     * These options are persisted in the user data Config folder in the options.json file.
     * The server-side software extends this class and provides additional validations and
     * @extends {DataModel}
     * @memberof config
     *
     * @property {string|null} adminPassword        The server administrator password (obscured)
     * @property {string|null} awsConfig            The relative path (to Config) of an AWS configuration file
     * @property {boolean} compressStatic           Whether to compress static files? True by default
     * @property {string} dataPath                  The absolute path of the user data directory (obscured)
     * @property {boolean} fullscreen               Whether the application should automatically start in fullscreen mode?
     * @property {string|null} hostname             A custom hostname applied to internet invitation addresses and URLs
     * @property {string} language                  The default language for the application
     * @property {string|null} localHostname        A custom hostname applied to local invitation addresses
     * @property {string|null} passwordSalt         A custom salt used for hashing user passwords (obscured)
     * @property {number} port                      The port on which the server is listening
     * @property {number} [protocol]                The Internet Protocol version to use, either 4 or 6.
     * @property {number} proxyPort                 An external-facing proxied port used for invitation addresses and URLs
     * @property {boolean} proxySSL                 Is the application running in SSL mode at a reverse-proxy level?
     * @property {string|null} routePrefix          A URL path part which prefixes normal application routing
     * @property {string|null} sslCert              The relative path (to Config) of a used SSL certificate
     * @property {string|null} sslKey               The relative path (to Config) of a used SSL key
     * @property {string} updateChannel             The current application update channel
     * @property {boolean} upnp                     Is UPNP activated?
     * @property {number} upnpLeaseDuration         The duration in seconds of a UPNP lease, if UPNP is active
     * @property {string} world                     A default world name which starts automatically on launch
     */
    class ApplicationConfiguration extends DataModel {
        static defineSchema() {
            return {
                adminPassword: new StringField({required: true, blank: false, nullable: true, initial: null,
                    label: "SETUP.AdminPasswordLabel", hint: "SETUP.AdminPasswordHint"}),
                awsConfig: new StringField({label: "SETUP.AWSLabel", hint: "SETUP.AWSHint"}),
                compressStatic: new BooleanField({initial: true, label: "SETUP.CompressStaticLabel",
                    hint: "SETUP.CompressStaticHint"}),
                dataPath: new StringField({label: "SETUP.DataPathLabel", hint: "SETUP.DataPathHint"}),
                fullscreen: new BooleanField({initial: false}),
                hostname: new StringField({required: true, blank: false, nullable: true, initial: null}),
                language: new StringField({required: true, blank: false, initial: "en.core",
                    label: "SETUP.DefaultLanguageLabel", hint: "SETUP.DefaultLanguageHint"}),
                localHostname: new StringField({required: true, blank: false, nullable: true, initial: null}),
                passwordSalt: new StringField({required: true, blank: false, nullable: true, initial: null}),
                port: new NumberField({required: true, nullable: false, integer: true, initial: 30000,
                    validate: this._validatePort, label: "SETUP.PortLabel", hint: "SETUP.PortHint"}),
                protocol: new NumberField({integer: true, choices: [4, 6], nullable: true}),
                proxyPort: new NumberField({required: true, nullable: true, integer: true, initial: null}),
                proxySSL: new BooleanField({initial: false}),
                routePrefix: new StringField({required: true, blank: false, nullable: true, initial: null}),
                sslCert: new StringField({label: "SETUP.SSLCertLabel", hint: "SETUP.SSLCertHint"}),
                sslKey: new StringField({label: "SETUP.SSLKeyLabel"}),
                updateChannel: new StringField({required: true, choices: SOFTWARE_UPDATE_CHANNELS, initial: "stable"}),
                upnp: new BooleanField({initial: true}),
                upnpLeaseDuration: new NumberField(),
                world: new StringField({required: true, blank: false, nullable: true, initial: null,
                    label: "SETUP.WorldLabel", hint: "SETUP.WorldHint"})
            }
        }

        /* ----------------------------------------- */

        /** @override */
        static migrateData(data) {

            // Backwards compatibility for -v9 update channels
            data.updateChannel = {
                "alpha": "prototype",
                "beta": "testing",
                "release": "stable"
            }[data.updateChannel] || data.updateChannel;

            // Backwards compatibility for awsConfig of true
            if ( data.awsConfig === true ) data.awsConfig = "";
            return data;
        }

        /* ----------------------------------------- */

        /**
         * Validate a port assignment.
         * @param {number} port     The requested port
         * @throws                  An error if the requested port is invalid
         * @private
         */
        static _validatePort(port) {
            if ( !Number.isNumeric(port) || ((port < 1024) && ![80, 443].includes(port)) || (port > 65535) ) {
                throw new Error(`The application port must be an integer, either 80, 443, or between 1024 and 65535`);
            }
        }
    }

    /* ----------------------------------------- */

    /**
     * A data object which represents the details of this Release of Foundry VTT
     * @extends {DataModel}
     * @memberof config
     *
     * @property {number} generation        The major generation of the Release
     * @property {string} channel           The channel the Release belongs to, such as "stable"
     * @property {string} suffix            An optional appended string display for the Release
     * @property {number} build             The internal build number for the Release
     * @property {number} time              When the Release was released
     * @property {number} [node_version]    The minimum required Node.js major version
     * @property {string} [notes]           Release notes for the update version
     * @property {string} [download]        A temporary download URL where this version may be obtained
     */
    class ReleaseData extends DataModel {
        static defineSchema() {
            return {
                generation: new NumberField({required: true, nullable: false, integer: true, min: 1}),
                channel: new StringField({choices: SOFTWARE_UPDATE_CHANNELS, blank: false}),
                suffix: new StringField(),
                build: new NumberField({required: true, nullable: false, integer: true}),
                time: new NumberField({nullable: false, initial: Date.now}),
                node_version: new NumberField({required: true, nullable: false, integer: true, min: 10}),
                notes: new StringField(),
                download: new StringField()
            }
        }

        /* ----------------------------------------- */

        /**
         * A formatted string for shortened display, such as "Version 9"
         * @return {string}
         */
        get shortDisplay() {
            return `Version ${this.generation} Build ${this.build}`;
        }

        /**
         * A formatted string for general display, such as "V9 Prototype 1" or "Version 9"
         * @return {string}
         */
        get display() {
            return ["Version", this.generation, this.suffix].filterJoin(" ");
        }

        /**
         * A formatted string for Version compatibility checking, such as "9.150"
         * @return {string}
         */
        get version() {
            return `${this.generation}.${this.build}`;
        }

        /**
         * The maximum known stable generation number.
         * @type {number}
         */
        get maxStableGeneration() {
            return globalThis.config.updater.availability.maxStableGeneration || this.generation;
        }

        /* ----------------------------------------- */

        /** @override */
        toString() {
            return this.shortDisplay;
        }

        /* ----------------------------------------- */

        /**
         * Is this ReleaseData object newer than some other version?
         * @param {string|ReleaseData} other        Some other version to compare against
         * @returns {boolean}                       Is this ReleaseData a newer version?
         */
        isNewer(other) {
            const version = other instanceof ReleaseData ? other.version : other;
            return isNewerVersion(this.version, version);
        }

        /* ----------------------------------------- */

        /**
         * Is this ReleaseData object a newer generation than some other version?
         * @param {string|ReleaseData} other        Some other version to compare against
         * @returns {boolean}                       Is this ReleaseData a newer generation?
         */
        isGenerationalChange(other) {
            if ( !other ) return true;
            let generation;
            if ( other instanceof ReleaseData ) generation = other.generation.toString();
            else {
                other = String(other);
                const parts = other.split(".");
                if ( parts[0] === "0" ) parts.shift();
                generation = parts[0];
            }
            return isNewerVersion(this.generation, generation);
        }
    }

    var config = /*#__PURE__*/Object.freeze({
        __proto__: null,
        ApplicationConfiguration: ApplicationConfiguration,
        ReleaseData: ReleaseData
    });

    /** @module foundry */

    // Window registration
    globalThis.foundry = {
        CONST: CONST$1,
        abstract,
        data,
        utils,
        documents,
        packages,
        config
    };
    globalThis.CONST = CONST$1;
    for ( let [k, v] of Object.entries(utils) ) {
        /** @deprecated */
        globalThis[k] = v;
    }

    // Immutable constants
    for ( const c of Object.values(CONST$1) ) {
        Object.freeze(c);
    }

    // Client-side initialization
    if ( globalThis.window ) {
        console.log(`${vtt$1} | Foundry Commons Framework Loaded`);
        const ready = new Event("FoundryFrameworkLoaded");
        globalThis.dispatchEvent(ready);
    }

    exports.CONST = CONST$1;
    exports.abstract = abstract;
    exports.config = config;
    exports.data = data;
    exports.documents = documents;
    exports.packages = packages;
    exports.utils = utils;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});