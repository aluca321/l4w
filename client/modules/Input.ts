/// <reference path="Display.ts" />

/**
 * Module for input handling:
 * - keyboard
 * - mouse
 * - touch
 * - visibility change
 * - screen resize and rotation change
 */
module Input {

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
    }

    export interface IPositionCallback { (x: number, y: number): void };
    export interface IEventCallback { (): void };
    export interface IKeyboardCallback { (e: KeyboardEvent): void };

    export function init(
        canvas: HTMLCanvasElement,
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

        var actionOngoing: boolean = false;
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
        };
        
        // Mouse events 
        var flagMouseDown: boolean = false;
        canvas.addEventListener("click", function(e) {
            var rect = canvas.getBoundingClientRect();
            var mouse_x = e.clientX - rect.left;
            var mouse_y = e.clientY - rect.top;
            actionCallback(mouse_x, mouse_y);
        });
        canvas.addEventListener("mousemove", function(e) {
            var rect = canvas.getBoundingClientRect();
            var position = mapEvent(e);
            if (flagMouseDown) {
                ongoingActionCallback(position.x, position.y);
            } else {
                hoverCallback(position.x, position.y);
            }
        });
        canvas.addEventListener("mousedown", function(e: PointerEvent) {
            flagMouseDown = true;
            var position = mapEvent(e);
            startActionCallback(position.x, position.y);
        });
        canvas.addEventListener("mouseup", function(e: PointerEvent) {
            flagMouseDown = false;
            var position = mapEvent(e);
            endActionCallback(position.x, position.y);
        });
        canvas.addEventListener("mouseout", function(e: PointerEvent) {
            if (flagMouseDown) {
                ongoingActionCallback(null, null);
            } else {
                hoverCallback(null, null);
            }
        });
        canvas.addEventListener("contextmenu", function(e) {
            var position = mapEvent(e);
            rightClickCallback(position.x, position.y);
        });
        canvas.addEventListener("dblclick", function(e) {
            var position = mapEvent(e);
            doubleClickCallback(position.x, position.y);
        });
        canvas.addEventListener("wheel", function(e) {
            e.preventDefault();
            var position = mapEvent(e);
            wheelCallback(position.x, position.y);
        });
        
        // Touch events
        canvas.addEventListener("touchstart", function(e) {
            var position = mapEvent(e);
            startActionCallback(position.x, position.y);
        });
        canvas.addEventListener("touchend", function(e) {
            var position = mapEvent(e);
            ongoingActionCallback(null, null);
            endActionCallback(position.x, position.y);
            
        });
        canvas.addEventListener("touchcancel", function(e) {
            var position = mapEvent(e);
            ongoingActionCallback(null, null);
            endActionCallback(position.x, position.y);
        });
        canvas.addEventListener("touchmove", function(e) {
            var position = mapEvent(e);
            ongoingActionCallback(position.x, position.y);
        });
        
        // Keyboard events
        document.addEventListener("keydown", function(e) {
            var callback = inputCallbacks[String(e.keyCode)];
            if (callback !== undefined) {
                e.preventDefault();
                callback(e);
            } else {
                //console.log("Tasto non registrato:" + e.keyCode); //TODO remove
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
            pauseCallback();
            flagPause = true;
            resizeCallback();
        });
        document.addEventListener("orientationchange", function() {
            resizeCallback();
        });

        function mapEvent(e) {
            return Display.mapPosition(e.clientX, e.clientY);
        }

    };
}
