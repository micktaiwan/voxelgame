/*
Cube world representation
Each cube is linked to its 26 neighbors
*/

'use strict';

angular.module('gameApp.services.map', []).factory('Map', function() {

    var _map = new map();

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

        last: function() {
            return _map.last();
        },

    }

});
