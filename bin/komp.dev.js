/**
 * @license
 * komp-js - v1.0.0
 * Compiled: 2015-03-14
 */
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

/**
 * Component
 */
KOMP.Component = Class.extend({
    name: null,
    init: function(name) {
        this.name = name;
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
    nodes: null,
    nodeAdded: null,
    nodeRemoved: null,
    init: function(componentNames) {
        this.componentNames = componentNames;
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
    }
});

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

/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
    var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

    // The base Class implementation (does nothing)
    this.Class = function(){};

    // Create a new Class that inherits from this class
    Class.extend = function(prop) {
        var _super = this.prototype;

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;

        // Copy the properties over onto the new prototype
        for (var name in prop) {
            // Check if we're overwriting an existing function
            prototype[name] = typeof prop[name] == "function" &&
            typeof _super[name] == "function" && fnTest.test(prop[name]) ?
                (function(name, fn){
                    return function() {
                        var tmp = this._super;

                        // Add a new ._super() method that is the same method
                        // but on the super-class
                        this._super = _super[name];

                        // The method only need to be bound temporarily, so we
                        // remove it when we're done executing
                        var ret = fn.apply(this, arguments);
                        this._super = tmp;

                        return ret;
                    };
                })(name, prop[name]) :
                prop[name];
        }

        // The dummy class constructor
        function Class() {
            // All construction is actually done in the init method
            if ( !initializing && this.init )
                this.init.apply(this, arguments);
        }

        // Populate our constructed prototype object
        Class.prototype = prototype;

        // Enforce the constructor to be what we expect
        Class.prototype.constructor = Class;

        // And make this class extendable
        Class.extend = arguments.callee;

        return Class;
    };
})();