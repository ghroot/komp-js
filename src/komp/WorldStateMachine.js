/**
 * WorldStateMachine
 */
KOMP.WorldStateMachine = Class.extend({
    world: null,
    states: null,
    currentState: null,
    init: function(world) {
        this.world = world;
        this.states = {};
    },
    createState: function(name) {
        var state = new KOMP.WorldState(name);
        this.states[name] = state;
        return state;
    },
    changeState: function(name) {
        var self = this;
        var previousState = this.currentState;
        var nextState = this.states[name];
        if (previousState === nextState) {
            return;
        }
        if (previousState != null) {
            var systemPriorities = this._getSystemPriorities(previousState.systems);
            systemPriorities.forEach(function(priority) {
                var systems = previousState.systems[priority];
                systems.forEach(function(system) {
                    if (!nextState.hasSystem(system)) {
                        self.world.removeSystem(system);
                    }
                });
            });
        }
        this._getSystemPriorities(nextState.systems).forEach(function(priority) {
            nextState.systems[priority].forEach(function(system) {
                if (!self.world.hasSystem(system)) {
                    self.world.addSystem(system, priority);
                }
            })
        });
        this.currentState = nextState;
    },
    _getSystemPriorities: function(systems) {
        var systemPriorities = [];
        for (var priority in systems) {
            if (systems.hasOwnProperty(priority)) {
                if (systemPriorities.indexOf(priority) === -1) {
                    systemPriorities.push(priority);
                }
            }
        }
        systemPriorities.sort(Array.NUMERIC);
        return systemPriorities;
    }
});
