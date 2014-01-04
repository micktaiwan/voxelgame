describe('Map test:', function() {
    describe('when I call Map.addCube', function() {
        it('should add a cube', function() {
            var $injector = angular.injector(['gameApp.services.map']);
            var Map = $injector.get('Map');
            var map = Map.newMap();
            expect(map.size()).toEqual(0);
            map.addCube({
                id: 1,
                x: 0,
                y: 0,
                z: 0,
                type: 0
            });
            expect(map.size()).toEqual(1);
            var first = map.getById(1);
            expect(first).not.toBe(null);
            first = map.getByPos(0, 0, 0);
            expect(first).not.toBe(null);
            expect(first.id).toEqual(1);
            expect(first.getNeighbors().length).toEqual(0);
            map.addCube({
                id: 2,
                x: 1,
                y: 0,
                z: 0,
                type: 0
            });
            var second = map.getById(2);
            expect(second.getNeighbors().length).toEqual(1);
            expect(first.getNeighbors().length).toEqual(1);
        })

    });


    function addCubes(map, coords) {

        for (var i in coords) {
            map.addCube({
                id: i,
                x: coords[i][0],
                y: coords[i][1],
                z: coords[i][2],
                type: 0
            });
        }
    }

    describe('when I call Map.pathfinder', function() {
        it('should find a way', function() {
            var $injector = angular.injector(['gameApp.services.map']);
            var Map = $injector.get('Map');
            var map = Map.newMap();
            addCubes(map, [
                [0, 0, 0],
                [1, 0, 0],
                [1, 0, 1]
                [1, 0, 2]
            ]);
            expect(map.size()).toEqual(3);
            var pf = Map.newPF();
            var path = pf.find(map, map.first(), map.last());
            console.log(path.length);
            console.log(path);
            expect(path.length).toEqual(4);
        })

    })

});
