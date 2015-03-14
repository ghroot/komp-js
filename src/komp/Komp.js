/**
 * Namespace-class for [komp-js].
 *
 * Contains assorted static properties and enumerations.
 *
 * @class KOMP
 * @static
 */
var KOMP = KOMP || {};

/**
 * Version of komp that is loaded.
 * @property {String} VERSION
 * @static
 */
KOMP.VERSION = "v1.0.0";

/**
 * If true the default komp startup (console) banner message will be suppressed.
 *
 * @property {Boolean} dontSayHello
 * @default false
 * @static
 */
KOMP.dontSayHello = false;

KOMP.sayHello = function () {
    if (KOMP.dontSayHello) {
        return;
    }
    if (window['console']) {
        console.log('komp-js ' + KOMP.VERSION);
    }
    KOMP.dontSayHello = true;
};
