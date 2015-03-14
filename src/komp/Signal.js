/**
 * Signal
 */
KOMP.Signal = Class.extend({
    listeners: null,
    init: function() {
        this.listeners = [];
    },
    add: function(listener, self) {
        self = self || listener;
        this.listeners.push({listener: listener, self: self});
    },
    remove: function(listener) {
        for (var i = this.listeners.length - 1; i >= 0; i--) {
            if (this.listeners[i].listener === listener) {
                this.listeners.splice(i, 1);
                break;
            }
        }
    },
    dispatch: function(/* parameters */) {
        var parameters = arguments;
        this.listeners.forEach(function(listener) {
            listener.listener.apply(listener.self, parameters);
        });
    }
});
