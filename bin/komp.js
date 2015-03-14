/**
 * @license
 * komp-js - v1.0.0
 * Compiled: 2015-03-14
 */
var KOMP=KOMP||{};KOMP.VERSION="v1.0.0",KOMP.dontSayHello=!1,KOMP.sayHello=function(){KOMP.dontSayHello||(window.console&&console.log("komp-js "+KOMP.VERSION),KOMP.dontSayHello=!0)},KOMP.Signal=Class.extend({listeners:null,init:function(){this.listeners=[]},add:function(a,b){b=b||a,this.listeners.push({listener:a,self:b})},remove:function(a){for(var b=this.listeners.length-1;b>=0;b--)if(this.listeners[b].listener===a){this.listeners.splice(b,1);break}},dispatch:function(){var a=arguments;this.listeners.forEach(function(b){b.listener.apply(b.self,a)})}}),KOMP.Entity=Class.extend({components:null,componentAdded:null,componentRemoved:null,init:function(){this.components={},this.componentAdded=new KOMP.Signal,this.componentRemoved=new KOMP.Signal},addComponent:function(a){this.components[a.name]=a,this.componentAdded.dispatch(this,a)},removeComponent:function(a){delete this.components[a.name],this.componentRemoved.dispatch(this,a)},getComponent:function(a){return this.components[a]},hasComponent:function(a){return void 0!==this.getComponent(a)},hasComponents:function(a){var b=!0,c=this;return a.forEach(function(a){c.hasComponent(a)||(b=!1)}),b}}),KOMP.Component=Class.extend({name:null,init:function(a){this.name=a}}),KOMP.World=Class.extend({entities:null,entityAdded:null,entityRemoved:null,nodesLists:null,systems:null,systemPriorities:null,init:function(){this.entities=[],this.entityAdded=new KOMP.Signal,this.entityRemoved=new KOMP.Signal,this.nodesLists={},this.systems={},this.systemPriorities=[],KOMP.sayHello()},addEntity:function(a){this.entities.push(a),this._addToNodeLists(a),a.componentAdded.add(this._onComponentAdded,this),a.componentRemoved.add(this._onComponentRemoved,this),this.entityAdded.dispatch(a)},removeEntity:function(a){this.entities.splice(this.entities.indexOf(a)),this._removeFromNodeLists(a,!1),a.componentAdded.remove(this._onComponentAdded),a.componentRemoved.remove(this._onComponentRemoved),this.entityRemoved.dispatch(a)},_onComponentAdded:function(a){this._addToNodeLists(a)},_onComponentRemoved:function(a){this._removeFromNodeLists(a,!0)},getNodeList:function(){for(var a=[],b=0;b<arguments.length;b++)a.push(arguments[b]);a.sort();var c=a.join("-"),d=this.nodesLists[c];return d||(d=new KOMP.NodeList(a),this.nodesLists[c]=d),d},_addToNodeLists:function(a){for(var b in this.nodesLists)if(this.nodesLists.hasOwnProperty(b)){var c=this.nodesLists[b];if(null===c.getNodeWihEntity(a)&&a.hasComponents(c.componentNames)){var d=new KOMP.Node(a);c.componentNames.forEach(function(b){d[b]=a.getComponent(b)}),c.addNode(d)}}},_removeFromNodeLists:function(a,b){for(var c in this.nodesLists)if(this.nodesLists.hasOwnProperty(c)){var d=this.nodesLists[c],e=d.getNodeWihEntity(a);null===e||b&&a.hasComponents(d.componentNames)||d.removeNode(e)}},addSystem:function(a,b){b=0|b;var c=this.systems[b];null==c&&(c=[],this.systems[b]=c),c.push(a),a.preAddedToWorld(this),a.addedToWorld(this),this.updateSystemPriorities()},removeSystem:function(a){for(var b in this.systems)if(this.systems.hasOwnProperty(b)){var c=this.systems[b],d=c.indexOf(a);if(d>=0){c.splice(d,1),a.removedFromWorld(this),a.postRemovedFromWorld(this),this.updateSystemPriorities();break}}},hasSystem:function(a){for(var b in this.systems)if(this.systems.hasOwnProperty(b)){var c=this.systems[b];if(c.indexOf(a)>=0)return!0}return!1},updateSystemPriorities:function(){this.systemPriorities.length=0;for(var a in this.systems)if(this.systems.hasOwnProperty(a)){var b=this.systems[a];-1===this.systemPriorities.indexOf(a)&&b.length>0&&this.systemPriorities.push(a)}},update:function(a){var b=this;this.systemPriorities.forEach(function(c){var d=b.systems[c];d.forEach(function(b){b.update(a)})})}}),KOMP.System=Class.extend({world:null,init:function(){},preAddedToWorld:function(a){this.world=a},addedToWorld:function(){},removedFromWorld:function(){},postRemovedFromWorld:function(){this.world=null},update:function(){}}),KOMP.NodeList=Class.extend({componentNames:null,nodes:null,nodeAdded:null,nodeRemoved:null,init:function(a){this.componentNames=a,this.nodes=[],this.nodeAdded=new KOMP.Signal,this.nodeRemoved=new KOMP.Signal},addNode:function(a){this.nodes.push(a),this.nodeAdded.dispatch(a)},removeNode:function(a){this.nodes.splice(this.nodes.indexOf(a),1),this.nodeRemoved.dispatch(a)},getNodeWihEntity:function(a){return this.nodes.forEach(function(b){return b.entity===a?b:void 0}),null}}),KOMP.Node=Class.extend({entity:null,init:function(a){this.entity=a}}),KOMP.EntityState=Class.extend({name:null,components:null,init:function(a){this.name=a,this.components=[]},addComponent:function(a){this.components.push(a)}}),KOMP.EntityStateMachine=Class.extend({entity:null,states:null,currentState:null,init:function(a){this.entity=a,this.states={}},createState:function(a){var b=new KOMP.EntityState(a);return this.states[a]=b,b},changeState:function(a){var b=this.currentState,c=this.states[a];if(c!==b){null!==b&&b.components.forEach(function(a){c.hasComponent(a.name)||this.entity.removeComponent(a)});var d=this;c.components.forEach(function(a){d.entity.hasComponent(a.name)||d.entity.addComponent(a)}),this.currentState=c}}}),KOMP.WorldState=Class.extend({name:null,systems:null,init:function(a){this.name=a,this.systems={}},addSystem:function(a,b){var c=this.systems[b];void 0===c&&(c=[],this.systems[b]=c),c.push(a)},hasSystem:function(a){for(var b in this.systems)if(this.systems.hasOwnProperty(b)){var c=this.systems[b];if(c.indexOf(a)>=0)return!0}return!1}}),KOMP.WorldStateMachine=Class.extend({world:null,states:null,currentState:null,init:function(a){this.world=a,this.states={}},createState:function(a){var b=new KOMP.WorldState(a);return this.states[a]=b,b},changeState:function(a){var b=this,c=this.currentState,d=this.states[a];if(c!==d){if(null!=c){var e=this._getSystemPriorities(c.systems);e.forEach(function(a){var e=c.systems[a];e.forEach(function(a){d.hasSystem(a)||b.world.removeSystem(a)})})}this._getSystemPriorities(d.systems).forEach(function(a){d.systems[a].forEach(function(c){b.world.hasSystem(c)||b.world.addSystem(c,a)})}),this.currentState=d}},_getSystemPriorities:function(a){var b=[];for(var c in a)a.hasOwnProperty(c)&&-1===b.indexOf(c)&&b.push(c);return b.sort(Array.NUMERIC),b}}),function(){var a=!1,b=/xyz/.test(function(){xyz})?/\b_super\b/:/.*/;this.Class=function(){},Class.extend=function(c){function d(){!a&&this.init&&this.init.apply(this,arguments)}var e=this.prototype;a=!0;var f=new this;a=!1;for(var g in c)f[g]="function"==typeof c[g]&&"function"==typeof e[g]&&b.test(c[g])?function(a,b){return function(){var c=this._super;this._super=e[a];var d=b.apply(this,arguments);return this._super=c,d}}(g,c[g]):c[g];return d.prototype=f,d.prototype.constructor=d,d.extend=arguments.callee,d}}();