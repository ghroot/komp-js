(function(){
    KOMP = {};

    KOMP.VERSION = "v1.0.0";

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
                if (this.listeners[i].listener == listener) {
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
        getNodeList: function(nodeClass) {
            var prototypeNode = new nodeClass();
            prototypeNode.componentNames.sort();
            var key = prototypeNode.componentNames.join("-");
            var nodeList = this.nodesLists[key];
            if (!nodeList) {
                nodeList = new KOMP.NodeList(prototypeNode.componentNames, nodeClass);
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
                        var nodeClass = nodeList.nodeClass;
                        var node = new nodeClass(entity);
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
            var self = this;
            names.forEach(function(name) {
                if (!self.hasComponent(name)) {
                    return false;
                }
            });
            return true;
        }
    });

    /**
     * Component
     */
    KOMP.Component = Class.extend({
        name: '',
        init: function(name) {
            this.name = name;
        }
    });

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

    /**
     * NodeList
     */
    KOMP.NodeList = Class.extend({
        componentNames: null,
        nodeClass: null,
        nodes: null,
        nodeAdded: null,
        nodeRemoved: null,
        init: function(componentNames, nodeClass) {
            this.componentNames = componentNames;
            this.nodeClass = nodeClass;
            this.nodes = [];
            this.nodeAdded = new KOMP.Signal();
            this.nodeRemoved = new KOMP.Signal();
        },
        addNode: function(node) {
            this.nodes.push(node);
            this.nodeAdded.dispatch(node);
        },
        removeNode: function(node) {
            this.nodes.splice(this.nodes.indexOf(node), 1);
            this.nodeRemoved.dispatch(node);
        },
        getNodeWihEntity: function(entity) {
            this.nodes.forEach(function(node) {
                if (node.entity === entity) {
                    return node;
                }
            });
            return null;
        }
    });

    /**
     * Node
     */
    KOMP.Node = Class.extend({
        entity: null,
        init: function(entity) {
            this.entity = entity;
        }
    });
})();
