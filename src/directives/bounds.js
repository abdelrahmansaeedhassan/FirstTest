angular.module("leaflet-directive").directive('bounds', function ($log, leafletHelpers, leafletBoundsHelpers) {
    return {
        restrict: "A",
        scope: false,
        replace: false,
        require: [ 'leaflet', 'center' ],

        link: function(scope, element, attrs, controller) {
            var isDefined = leafletHelpers.isDefined,
                createLeafletBounds = leafletBoundsHelpers.createLeafletBounds,
                leafletScope = controller[0].getLeafletScope(),
                mapController = controller[0],
                centerController = controller[1];

            var emptyBounds = function(bounds) {
                if (bounds._southWest.lat === 0 && bounds._southWest.lng === 0 && bounds._northEast.lat === 0 && bounds._northEast.lng === 0) {
                    return true;
                }
                return false;
            };

            mapController.getMap().then(function(map) {
                centerController.getCenter().then(function() {
                    leafletScope.$on("boundsChanged", function(event, bounds) {
                        //$log.debug("updated map bounds...");
                        if (emptyBounds(bounds)) {
                            return;
                        }
                        var scope = event.currentScope;
                        var newScopeBounds = {
                            northEast: {
                                lat: bounds._northEast.lat,
                                lng: bounds._northEast.lng
                            },
                            southWest: {
                                lat: bounds._southWest.lat,
                                lng: bounds._southWest.lng
                            }
                        };

                        if (!angular.equals(scope.bounds, newScopeBounds)) {
                            //$log.debug("Need to update scope bounds.");
                            scope.bounds = newScopeBounds;
                        }
                    });

                    map.whenReady(function() {
                        leafletScope.$watch('bounds', function(bounds) {
                            //$log.debug("updated bounds...");
                            if (!isDefined(bounds)) {
                                $log.error('[AngularJS - Leaflet] Invalid bounds');
                                return;
                            }

                            var leafletBounds = createLeafletBounds(bounds);
                            if (leafletBounds && !map.getBounds().equals(leafletBounds)) {
                                //$log.debug("Need to update map bounds.");
                                map.fitBounds(leafletBounds);
                            }
                        }, true);
                    });
                });
            });
        }
    };
});
