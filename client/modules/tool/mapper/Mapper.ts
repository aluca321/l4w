/// <reference path="../../core/model/Commons.ts" />
/// <reference path="../../core/util/Utils.ts" />
/// <reference path="../../core/util/Constant.ts" />
/// <reference path="../../core/util/Errors.ts" />
/// <reference path="MapperPage.ts" />

namespace Mapper {

    export var mapper: MapperScene;

    export function start(canvas: HTMLCanvasElement, tilePicker: TilePickerScene, mapId: number) {
        if(!Utils.isEmpty(mapper)) {
            mapper.togglePause(true);
        }
        new StaticGrid(canvas, function(grid: StaticGrid) {
            new MapperScene(grid, function(scene: MapperScene) {
                initInput(canvas, scene, grid);
                initWidgets(canvas, scene, grid);
                TilePicker.setMapper(scene);
                scene.setTilePicker(tilePicker);
                mapper = scene;
                MapManager.loadMap(mapId, canvas, function(map: IMap) {
                    mapper.changeMap(map, function() {
                        mapper.start(canvas);
                    });
                });
            });
        }, GridTypeEnum.mapper);
    }

    export function changeTile(tile: string, tilePicker: TilePickerScene) {
        mapper.changeTile(tile, function(scene) { });
        mapper.setTilePicker(tilePicker);
    }
    
    export function changeSize(rows: number, columns: number) {
        mapper.resizeMap(rows, columns);
    }
    
    export function reloadMap() {
        let mapId = MapperPage.getActiveMap();
        let canvas = <HTMLCanvasElement>document.getElementById("canvas1");
        MapManager.loadMap(mapId, canvas, function(map: IMap) {
            mapper.changeMap(map, function() {
                MapperPage.changeEditState(false);
            });
        });
    }

    export function saveMap(callback: IBooleanCallback = null) {
        var mapId = MapperPage.getActiveMap();
        var mapJSON = JSON.stringify(this.mapper.getMap());
        Resource.save(mapId+"", mapJSON, Resource.TypeEnum.MAP, function(success: boolean) {
            if(callback !== null) {
                callback(success);
            }
        });
    }

    function initInput(canvas: HTMLCanvasElement, scene: MapperScene, grid: StaticGrid) {
        var inputCallbackMap: Map<string, Input.IKeyboardCallback> = new Map<string, Input.IKeyboardCallback>();
        inputCallbackMap[Input.Keys.W] = function(e) {
            scene.moveFocus(DirectionEnum.UP);
        };
        inputCallbackMap[Input.Keys.S] = function(e) {
            scene.moveFocus(DirectionEnum.DOWN);
        };
        inputCallbackMap[Input.Keys.A] = function(e) {
            scene.moveFocus(DirectionEnum.LEFT);
        };
        inputCallbackMap[Input.Keys.D] = function(e) {
            scene.moveFocus(DirectionEnum.RIGHT);
        };

        inputCallbackMap[Input.Keys.F2] = function(e) {
            scene.toggleEditorGrid();
        };
        inputCallbackMap[Input.Keys.F3] = function(e) {
            scene.toggleCellNumbering();
        };
        inputCallbackMap[Input.Keys.F4] = function(e) {
            scene.toggleFocus();
        };

        Input.init(
            canvas,
            grid,
            inputCallbackMap,
            function() { },
            function() { },
            function(x, y, mouseButton) {
                // Start action
                if (mouseButton === Input.MouseButtons.LEFT) {
                    if (scene.apply(x, y)) {
                        MapperPage.changeEditState(true);
                    }
                } else {
                    scene.select(x, y);
                }
            },
            function(x, y, mouseButton) {
                // End action
                if (mouseButton === Input.MouseButtons.LEFT) {
                    scene.selectEnd(x, y);
                }
            },
            function(x, y, mouseButton) {
                // Ongoing action
                if (mouseButton === Input.MouseButtons.LEFT) {
                    if(scene.apply(x, y)) {
                        MapperPage.changeEditState(true);
                    }
                } else {
                    scene.selectEnd(x, y);
                }
                scene.updatePointer(x, y);
            },
            function(x, y) {
                //Hover
                scene.updatePointer(x, y);
            },
            function() { },
            function() { },
            function() { },
            function(x, y) {
                //OnRightClick
                scene.cleanSelection();
            },
            function() { console.log("doubleClick"); },
            function() { console.log("wheel"); }
        );
    };

    function initWidgets(canvas: HTMLCanvasElement, scene: MapperScene, grid: StaticGrid) {
        var inputRange: HTMLInputElement = <HTMLInputElement>document.getElementById("zoom");
        inputRange.onchange = function(e: Event) {
            grid.selectScale(+inputRange.value);
            grid.refresh();
            scene.changeScale(canvas);
            scene.resetTranslation();
        };
    };

    export function setMode(editMode: Constant.EditMode) {
        (<HTMLButtonElement>document.getElementById(MapperPage.BUTTON_ID_MODE + "0")).disabled = false;
        (<HTMLButtonElement>document.getElementById(MapperPage.BUTTON_ID_MODE + "1")).disabled = false;
        (<HTMLButtonElement>document.getElementById(MapperPage.BUTTON_ID_MODE + editMode)).disabled = true;
        mapper.setEditMode(editMode);
    };

    export function setActiveLayer(layerIndex: Constant.MapLayer) {
        (<HTMLButtonElement>document.getElementById(MapperPage.BUTTON_ID_LAYER + "0")).disabled = false;
        (<HTMLButtonElement>document.getElementById(MapperPage.BUTTON_ID_LAYER + "1")).disabled = false;
        (<HTMLButtonElement>document.getElementById(MapperPage.BUTTON_ID_LAYER + "2")).disabled = false;
        (<HTMLButtonElement>document.getElementById(MapperPage.BUTTON_ID_LAYER + "3")).disabled = false;
        (<HTMLButtonElement>document.getElementById(MapperPage.BUTTON_ID_LAYER + layerIndex)).disabled = true;
        mapper.setActiveLayer(layerIndex);
    };
}