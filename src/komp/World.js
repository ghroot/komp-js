/**
 * World
 */
KOMP.World = Class.extend({
    entities: null,
    entityAdded: null,
    entityRemoved: null,
    nodesLists: null,
    systems: null,
    systemPriorities: null,
    init: function() {
        this.entities = [];
        this.entityAdded = new KOMP.Signal();
        this.entityRemoved = new KOMP.Signal();
        this.nodesLists = {};
        this.systems = {};
        this.systemPriorities = [];

        KOMP.sayHello();
    },
    addEntity: function(entity) {
        this.entities.push(entity);
        this._addToNodeLists(entity);
        entity.componentAdded.add(this._onComponentAdded, this);
        entity.componentRemoved.add(this._onComponentRemoved, this);
        this.entityAdded.dispatch(entity);
    },
    removeEntity: function(entity) {
        this.entities.splice(this.entities.indexOf(entity));
        this._removeFromNodeLists(entity, false);
        entity.componentAdded.remove(this._onComponentAdded);
        entity.componentRemoved.remove(this._onComponentRemoved);
        this.entityRemoved.dispatch(entity);
    },
    _onComponentAdded: function(entity, component) {
        this._addToNodeLists(entity);
    },
    _onComponentRemoved: function(entity, component) {
        this._removeFromNodeLists(entity, true);
    },
    getNodeList: function(/* componentNames */) {
        var componentNames = [];
        for (var i = 0; i < arguments.length; i++) {
            componentNames.push(arguments[i]);
        }
        componentNames.sort();
        var key = componentNames.join("-");
        var nodeList = this.nodesLists[key];
        if (!nodeList) {
            nodeList = new KOMP.NodeList(componentNames);
            this.nodesLists[key] = nodeList;
        }
        return nodeList;
    },
    _addToNodeLists: function(entity) {
        for (var key in this.nodesLists) {
            if (this.nodesLists.hasOwnProperty(key)) {
                var nodeList = this.nodesLists[key];
                if (nodeList.getNodeWihEntity(entity) === null &&
                    entity.hasComponents(nodeList.componentNames)) {
                    var node = new KOMP.Node(entity);
                    nodeList.componentNames.forEach(function(componentName) {
                        node[componentName] = entity.getComponent(componentName);
                    });
                    nodeList.addNode(node);
                }
            }
        }
    },
    _removeFromNodeLists: function(entity, onlyIfInvalid) {
        for (var key in this.nodesLists) {
            if (this.nodesLists.hasOwnProperty(key)) {
                var nodeList = this.nodesLists[key];
                var node = nodeList.getNodeWihEntity(entity);
                if (node !== null && (!onlyIfInvalid || !entity.hasComponents(nodeList.componentNames))) {
                    nodeList.removeNode(node);
                }
            }
        }
    },
    addSystem: function(system, priority) {
        priority = priority | 0;
        var systemsInPriority = this.systems[priority];
        if (systemsInPriority == null) {
            systemsInPriority = [];
            this.systems[priority] = systemsInPriority;
        }
        systemsInPriority.push(system);
        system.preAddedToWorld(this);
        system.addedToWorld(this);
        this.updateSystemPriorities();
    },
    removeSystem: function(system) {
        for (var priority in this.systems) {
            if (this.systems.hasOwnProperty(priority)) {
                var systemsInPriority = this.systems[priority];
                var index = systemsInPriority.indexOf(system);
                if (index >= 0) {
                    systemsInPriority.splice(index, 1);
                    system.removedFromWorld(this);
                    system.postRemovedFromWorld(this);
                    this.updateSystemPriorities();
                    break;
                }
            }
        }
    },
    hasSystem: function(system) {
        for (var priority in this.systems) {
            if (this.systems.hasOwnProperty(priority)) {
                var systemsInPriority = this.systems[priority];
                if (systemsInPriority.indexOf(system) >= 0) {
                    return true;
                }
            }
        }
        return false;
    },
    updateSystemPriorities: function() {
        this.systemPriorities.length = 0;
        for (var priority in this.systems) {
            if (this.systems.hasOwnProperty(priority)) {
                var systemsInPriority = this.systems[priority];
                if (this.systemPriorities.indexOf(priority) === -1 &&
                    systemsInPriority.length > 0) {
                    this.systemPriorities.push(priority);
                }
            }
        }
    },
    update: function(time) {
        var self = this;
        this.systemPriorities.forEach(function(priority) {
            var systemsInPriority = self.systems[priority];
            systemsInPriority.forEach(function(system) {
                system.update(time);
            });
        });
    }
});
