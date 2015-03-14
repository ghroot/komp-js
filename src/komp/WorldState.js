/**
 * WorldState
 */
KOMP.WorldState = Class.extend({
    name: null,
    systems: null,
    init: function(name) {
        this.name = name;
        this.systems = {};
    },
    addSystem: function(system, priority) {
        var systemsInPriority = this.systems[priority];
        if (systemsInPriority === undefined) {
            systemsInPriority = [];
            this.systems[priority] = systemsInPriority;
        }
        systemsInPriority.push(system);
    },
    hasSystem: function(system) {
        for (var priority in this.systems) {
            if (this.systems.hasOwnProperty(priority)) {
                var systems = this.systems[priority];
                if (systems.indexOf(system) >= 0) {
                    return true;
                }
            }
        }
        return false;
    }
});
