/*
Cube world representation
Each cube is linked to its 26 neighbors
*/

'use strict';

angular.module('gameApp.services.map', []).factory('Map', function() {

    var _map = new map();

    //==========================================================

    function PathFinder() {

        var map = null;
        var openset; // The set of tentative nodes to be evaluated, initially containing the start node
        this.find = function(m, start, goal) {
            map = m;
            var closedset = []; // The set of nodes already evaluated.
            var came_from = {}; // the empty map    // The map of navigated nodes.
             // Cost from start along best known path
            start.g_score = 0;
            // Estimated total cost from start to goal through y.
            start.f_score = start.g_score + heuristic_cost_estimate(start, goal);
            openset = [start];

            while (openset.length > 0) {
                var current = getLowerFScore(); // the node in openset having the lowest f_score[] value
                if (current.id == goal.id)
                    return reconstruct_path(came_from, goal);

                //remove current from openset
                var index = getNodeIndex(openset, current);
                if (index == null)
                    throw 'not found: ' + current.id;
                openset.splice(index, 1);
                current.f_score = null;
                // add current to closedset
                closedset.push(current);

                // for each neighbor in neighbor_nodes(current)
                var adjs = current.getNeighborsOnlyAdjacents();
                if (adjs.length == 0) { // how we ended here if no adjs ? Could be if we "landed" here at the start of the game...
                    console.error('no adjs ???');
                    continue;
                }

                for (var neighbor_index = adjs.length - 1; neighbor_index >= 0; neighbor_index--) {
                    var neighbor = adjs[neighbor_index];
                    if (getNodeIndex(closedset, neighbor) != null)
                        continue;
                    var tentative_g_score = current.g_score + heuristic_cost_estimate(current, neighbor); // dist_between(current,neighbor)
                    if (getNodeIndex(openset, neighbor) == null || tentative_g_score < neighbor.g_score) {
                        came_from[neighbor.id] = current;
                        neighbor.g_score = tentative_g_score;
                        neighbor.f_score = neighbor.g_score + heuristic_cost_estimate(neighbor, goal);
                        if (getNodeIndex(openset, neighbor) == null)
                            openset.push(neighbor);
                    }
                }
            }
            return []; // no path found
        };
        /*
        function getNode(list, node) {
            var rv = null;
            list.some(function(s) {
                if (s.id == node.id) {
                    rv = s;
                    return;
                }
            });
            console.log("node: "+rv);
            return rv;
        }
*/

        function getNodeIndex(list, node) {
            for (var i = list.length - 1; i >= 0; i--) {
                if (list[i].id == node.id)
                    return i;
            }
            return null;
        }

        function getLowerFScore() {
            var node_id = null;
            var score = 9999999;
            for (var i in openset) {
                if (score > openset[i].f_score) {
                    node_id = i;
                    score = i.f_score;
                }
            }
            if (node_id == null) {
                throw 'no node_id'
            }
            return openset[node_id];
        }

        function heuristic_cost_estimate(start, goal) {
            return Math.abs(start.x - goal.x) + Math.abs(start.y - goal.y) + Math.abs(start.z - goal.z);
        }

        function reconstruct_path(came_from, current_node) {
            if (Object.keys(came_from).indexOf(current_node.id) != -1) {
                var p = reconstruct_path(came_from, came_from[current_node.id]);
                return (p.concat([current_node]));
            } else
                return [current_node];
        }


    } // PathFinder
    //==========================================================

    function inverse(i) {
        switch (i) {
            case -1:
                return 1;
            case 0:
                return 0;
            case 1:
                return -1;
            default:
                throw 'no inverse for ' + i;
        }
    }

    //==========================================================

    function cube(_id, _x, _y, _z, _type) {
        this.id = _id;
        this.x = _x;
        this.y = _y;
        this.z = _z;
        this.type = _type;

        this.neighbors = [
            [
                [null, null, null],
                [null, null, null],
                [null, null, null]
            ],
            [
                [null, null, null],
                [null, null, null],
                [null, null, null]
            ],
            [
                [null, null, null],
                [null, null, null],
                [null, null, null]
            ]
        ]

        this.getNeighbors = function() {
            var rv = [];
            for (var i = -1; i <= 1; i++) {
                for (var j = -1; j <= 1; j++) {
                    for (var k = -1; k <= 1; k++) {
                        if (i == 0 && j == 0 && k == 0) continue;
                        var c = this.neighbors[i + 1][j + 1][k + 1];
                        if (c) rv.push(c);
                    }
                }
            }
            return rv;
        };

        this.getNeighborsWithoutCorners = function() {
            var rv = [];
            for (var i = -1; i <= 1; i++) {
                for (var j = -1; j <= 1; j++) {
                    for (var k = -1; k <= 1; k++) {
                        if (i == 0 && j == 0 && k == 0) continue;
                        if (i != 0 && j != 0 && k != 0) continue;
                        var c = this.neighbors[i + 1][j + 1][k + 1];
                        if (c) rv.push(c);
                    }
                }
            }
            return rv;
        };

        this.getNeighborsOnlyAdjacents = function() {
            var adjs = [
                [1, 0, 0],
                [0, 0, 1],
                [-1, 0, 0],
                [0, 0, -1],

                [1, -1, 0],
                [0, -1, 1],
                [-1, -1, 0],
                [0, -1, -1],

                [1, 1, 0],
                [0, 1, 1],
                [-1, 1, 0],
                [0, 1, -1]
            ];
            var rv = [];
            for (var i in adjs) {
                var c = this.neighbors[adjs[i][0] + 1][adjs[i][1] + 1][adjs[i][2] + 1];
                if (c) rv.push(c);
            };
            return rv;
        }

        // remove self from its neighbors
        this.removeSelfFromNeighbors = function() {
            for (var i = -1; i <= 1; i++) {
                for (var j = -1; j <= 1; j++) {
                    for (var k = -1; k <= 1; k++) {
                        if (i == 0 && j == 0 && k == 0) continue;
                        var c = this.neighbors[i + 1][j + 1][k + 1];
                        if (c) c.neighbors[inverse(i) + 1][inverse(j) + 1][inverse(k) + 1] = null;
                    }
                }
            }
        };

    } // cube

    //==========================================================

    function map() {

        var cubes = [];

        this.getByIndex = function(id) {
            for (var index in cubes) {
                if (cubes[index].id == id) {
                    return index;
                }
            }
            return null;

        };

        this.getById = function(id) {
            var rv = null;
            cubes.some(function(s) {
                if (s.id == id) {
                    rv = s;
                    return;
                }
            });
            return rv;
        };

        this.getByPos = function(x, y, z) {
            var rv = null;
            cubes.some(function(s) {
                if (s.x == x && s.y == y && s.z == z) {
                    rv = s;
                    return;
                }
            });
            return rv;
        };

        this.addCube = function(obj) {
            if (!obj) {
                throw 'no obj?';
            }
            if (this.getById(obj.id)) {
                console.error('cube ' + obj.id + ' already exists in map (by id)');
                return;
            }

            if (this.getByPos(obj.x, obj.y, obj.z)) {
                console.error('cube ' + obj.id + ' already exists in map (by pos)');
                //Db.remove(obj.id);
                return;
            }

            //console.log('neighbors...');
            var c = new cube(obj.id, obj.x, obj.y, obj.z, obj.type);
            for (var i = -1; i <= 1; i++) {
                for (var j = -1; j <= 1; j++) {
                    for (var k = -1; k <= 1; k++) {
                        if (i == 0 && j == 0 && k == 0) continue; // self
                        var n = this.getByPos(obj.x + i, obj.y + j, obj.z + k);
                        if (!n) continue;
                        c.neighbors[i + 1][j + 1][k + 1] = n;
                        n.neighbors[inverse(i) + 1][inverse(j) + 1][inverse(k) + 1] = c;
                        //console.log('adding neighbor');
                    }
                }
            }
            cubes.push(c);
        };

        this.removeCube = function(obj) {
            var index = this.getByIndex(obj.id);
            if (!index) {
                console.error('map did not find cube by id');
                return;
            }
            var c = cubes[index];
            c.removeSelfFromNeighbors();
            cubes.splice(index, 1);
        };

        this.size = function() {
            return cubes.length;
        };

        this.last = function() {
            return cubes[cubes.length - 1];
        };
        this.first = function() {
            return cubes[0];
        };
        // rewind(0) == last()
        // rewind(1) == cubes[(l-1)-1]
        this.rewind = function(rewind) {
            var l = cubes.length;
            if (l == 0) return null;
            if (rewind >= l) rewind = l - 1; // or throw an exception ?
            return cubes[(l - 1) - rewind];
        };
        this.getMap = function() {
            return cubes;
        }

    } // map

    //==========================================================

    return {

        addCube: function(obj) {
            _map.addCube(obj);
        },

        removeCube: function(obj) {
            _map.removeCube(obj);
        },

        getCubeByPos: function(x, y, z) {
            //console.log(x, y, z);
            return _map.getByPos(x, y, z);
        },
        getCubeById: function(id) {
            return _map.getById(id);
        },
        /*
        call: function(obj) {
            map.call(obj);
        },

        getPrototype: function() {
            return map.prototype;
        },
*/
        size: function() {
            return _map.size();
        },

        newMap: function() {
            return new map();
        },
        first: function() {
            return _map.first();
        },
        last: function() {
            return _map.last();
        },
        newPF: function() {
            return new PathFinder();
        },

    }

});
