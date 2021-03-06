/// <reference path="../AbstractGrid.ts" />

/**
 * Module for input handling:
 * - keyboard
 * - mouse
 * - touch
 * - visibility change
 * - screen resize and rotation change
 */
namespace Input {

    export class Keys {
        static UP = "38";
        static DOWN = "40";
        static LEFT = "37";
        static RIGHT = "39";
        static CTRL = "17";
        static ALT = "18";
        static ENTER = "13";
        static SPACE = "32";
        static CAPS = "20";
        static SHIFT = "16";
        static W = "87";
        static A = "65";
        static D = "68";
        static S = "83";
        static J = "74";
        static K = "75";
        static F1 = "112";
        static F2 = "113";
        static F3 = "114";
        static F4 = "115";
        static F5 = "116";
        static F6 = "117";
    }

    export class MouseButtons {
        static LEFT = 1;
        static RIGHT = 2;
        static MIDDLE = 4;
    }

    export interface IPositionCallback {
        (x: number, y: number, mouseButton?: number): void;
    };
    export interface IEventCallback {
        (): void;
    };
    export interface IKeyboardCallback {
        (e: KeyboardEvent): void;
    };

    //TODO togli questa schifezza e metti tanti metodo "onQualcosa"
    export function init(
        canvas: HTMLCanvasElement,
        grid: AbstractGrid,
        inputCallbacks: Map<string, Input.IKeyboardCallback>,
        resetCallback: IEventCallback,
        actionCallback: IPositionCallback,
        startActionCallback: IPositionCallback,
        endActionCallback: IPositionCallback,
        ongoingActionCallback: IPositionCallback,
        hoverCallback: IPositionCallback,
        pauseCallback: IEventCallback,
        unpauseCallback: IEventCallback,
        resizeCallback: IEventCallback,
        rightClickCallback: IPositionCallback,
        doubleClickCallback: IPositionCallback,
        wheelCallback: IPositionCallback) {

        var lastKey: number;
        var flagPause: boolean = false;
        
        // Always use SPACE for pause
        inputCallbacks[Keys.SPACE] = function(e: KeyboardEvent) {
            if (flagPause) {
                unpauseCallback();
                flagPause = false;
            } else {
                pauseCallback();
                flagPause = true;
            }
            e.preventDefault();
        };
        
        // Mouse events 
        var flagMouseDown: boolean = false;
        canvas.addEventListener("click", function(e) {
            var position = mapEvent(e);
            actionCallback(position.i, position.j);
        });
        canvas.addEventListener("mousemove", function(e) {
            var position = mapEvent(e);
            if (flagMouseDown) {
                ongoingActionCallback(position.i, position.j, e.buttons);
            } else {
                hoverCallback(position.i, position.j);
            }
        });
        canvas.addEventListener("mousedown", function(e: PointerEvent) {
            flagMouseDown = true;
            var position = mapEvent(e);
            startActionCallback(position.i, position.j, e.buttons);
        });
        canvas.addEventListener("mouseup", function(e: PointerEvent) {
            flagMouseDown = false;
            var position = mapEvent(e);
            endActionCallback(position.i, position.j, e.buttons);
        });
        canvas.addEventListener("mouseout", function(e: PointerEvent) {
            if (flagMouseDown) {
                ongoingActionCallback(null, null, e.buttons);
            } else {
                hoverCallback(null, null);
            }
        });
        canvas.addEventListener("contextmenu", function(e) {
            e.preventDefault();
            var position = mapEvent(e);
            rightClickCallback(position.i, position.j);
        });
        canvas.addEventListener("dblclick", function(e) {
            var position = mapEvent(e);
            doubleClickCallback(position.i, position.j);
        });
        canvas.addEventListener("wheel", function(e) {
            var position = mapEvent(e);
            wheelCallback(position.i, position.j);
        });
        
        // Touch events
        canvas.addEventListener("touchstart", function(e) {
            var position = mapEvent(e);
            startActionCallback(position.i, position.j);
        });
        canvas.addEventListener("touchend", function(e) {
            var position = mapEvent(e);
            ongoingActionCallback(null, null);
            endActionCallback(position.i, position.j);

        });
        canvas.addEventListener("touchcancel", function(e) {
            var position = mapEvent(e);
            ongoingActionCallback(null, null);
            endActionCallback(position.i, position.j);
        });
        canvas.addEventListener("touchmove", function(e) {
            var position = mapEvent(e);
            ongoingActionCallback(position.i, position.j);
        });
        
        // Keyboard events
        document.addEventListener("keydown", function(e) {
            var callback = inputCallbacks[String(e.keyCode)];
            if (callback !== undefined) {
                e.preventDefault();
                callback(e);
            }
            lastKey = e.keyCode;
        });
        document.addEventListener("keyup", function(e) {
            if (e.keyCode === lastKey) {
                resetCallback();
            }
        });
        //keypress, input -> tasto premuto
        
        // Visibility events
        document.addEventListener("visibilitychange", function() {
            if (document.hidden) {
                pauseCallback();
                flagPause = true;
            } else {
                unpauseCallback();
                flagPause = false;
            }
        });
        
        // Screen change events
        window.addEventListener("resize", function(event) {
            resizeCallback();
        });
        document.addEventListener("orientationchange", function() {
            resizeCallback();
        });

        function mapEvent(e) {
            let position: IPoint = {
                x: e.clientX,
                y: e.clientY
            };
            return grid.mapPositionToGrid(position);
        }

    };
}
