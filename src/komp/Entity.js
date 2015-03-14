/**
 * Entity
 */
KOMP.Entity = Class.extend({
    components: null,
    componentAdded: null,
    componentRemoved: null,
    init: function() {
        this.components = {};
        this.componentAdded = new KOMP.Signal();
        this.componentRemoved = new KOMP.Signal();
    },
    addComponent: function(component) {
        this.components[component.name] = component;
        this.componentAdded.dispatch(this, component);
    },
    removeComponent: function(component) {
        delete this.components[component.name];
        this.componentRemoved.dispatch(this, component);
    },
    getComponent: function(name) {
        return this.components[name];
    },
    hasComponent: function(name) {
        return this.getComponent(name) !== undefined;
    },
    hasComponents: function(names) {
        var hasComponents = true;
        var self = this;
        names.forEach(function(name) {
            if (!self.hasComponent(name)) {
                hasComponents = false;
            }
        });
        return hasComponents;
    }
});
