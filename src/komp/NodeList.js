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
