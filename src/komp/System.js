/**
 * System
 */
KOMP.System = Class.extend({
    world: null,
    init: function() {
    },
    preAddedToWorld: function(world) {
        this.world = world;
    },
    addedToWorld: function(world) {
    },
    removedFromWorld: function(world) {
    },
    postRemovedFromWorld: function(world) {
        this.world = null;
    },
    update: function(time) {
    }
});
