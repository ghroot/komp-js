/**
 * EntityState
 */
KOMP.EntityState = Class.extend({
    name: null,
    components: null,
    init: function(name) {
        this.name = name;
        this.components = [];
    },
    addComponent: function(component) {
        this.components.push(component);
    },
    hasComponent: function(component) {
        return this.components.indexOf(component) >= 0;
    }
});
