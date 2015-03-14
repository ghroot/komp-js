/**
 * EntityStateMachine
 */
KOMP.EntityStateMachine = Class.extend({
    entity: null,
    states: null,
    currentState: null,
    init: function(entity) {
        this.entity = entity;
        this.states = {};
    },
    createState: function(name) {
        var state = new KOMP.EntityState(name);
        this.states[name] = state;
        return state;
    },
    changeState: function(name) {
        var previousState = this.currentState;
        var nextState = this.states[name];
        if (nextState === previousState) {
            return;
        }
        if (previousState !== null) {
            previousState.components.forEach(function(component) {
                if (!nextState.hasComponent(component.name)) {
                    this.entity.removeComponent(component);
                }
            });
        }
        var self = this;
        nextState.components.forEach(function(component) {
            if (!self.entity.hasComponent(component.name)) {
                self.entity.addComponent(component);
            }
        });
        this.currentState = nextState;
    }
});
