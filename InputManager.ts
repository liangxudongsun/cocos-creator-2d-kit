import {
    DirectorEvent,
    EventKeyboard,
    KeyCode,
    Input,
    input,
    EventMouse,
    director,
    Vec3,
    UITransform,
    Canvas,
    Vec2,
    Node,
    EventTouch,
    Touch,
    math,
} from "cc";

import { Node2D } from "./Node2D";

export const BUTTON_TYPE = {
    Left: 0,
    Right: 1,
    Middle: 2,
} as const;
export type BUTTON_TYPE = (typeof BUTTON_TYPE)[keyof typeof BUTTON_TYPE];

export class InputManager {
    private static _instance: InputManager | null = null;
    public static get instance(): InputManager {
        if (this._instance === null) {
            this._instance = new InputManager();
        }

        return this._instance;
    }

    //
    private constructor() {
        this._init();
    }

    private _init(): void {
        //
        director.on(DirectorEvent.AFTER_UPDATE, this._onAfterUpdate, this);
        director.on(DirectorEvent.BEFORE_SCENE_LOADING, this._onBeforeSceneLoading, this);
        director.on(DirectorEvent.AFTER_SCENE_LAUNCH, this._onAfterSceneLaunch, this);

        //
        input.on(Input.EventType.KEY_DOWN, this._onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this._onKeyUp, this);

        //
        input.on(Input.EventType.MOUSE_DOWN, this._onMouseDown, this);
        input.on(Input.EventType.MOUSE_MOVE, this._onMouseMove, this);
        input.on(Input.EventType.MOUSE_UP, this._onMouseUp, this);

        //
        input.on(Input.EventType.TOUCH_START, this._onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this._onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this._onTouchEnd, this);
        input.on(Input.EventType.TOUCH_CANCEL, this._onTouchCancel, this);
    }

    public destroy(): void {
        //
        director.off(DirectorEvent.AFTER_UPDATE, this._onAfterUpdate, this);
        director.off(DirectorEvent.BEFORE_SCENE_LOADING, this._onBeforeSceneLoading, this);
        director.off(DirectorEvent.AFTER_SCENE_LAUNCH, this._onAfterSceneLaunch, this);

        //
        input.off(Input.EventType.KEY_DOWN, this._onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this._onKeyUp, this);

        //
        input.off(Input.EventType.MOUSE_DOWN, this._onMouseDown, this);
        input.off(Input.EventType.MOUSE_MOVE, this._onMouseMove, this);
        input.off(Input.EventType.MOUSE_UP, this._onMouseUp, this);

        //
        input.off(Input.EventType.TOUCH_START, this._onTouchStart, this);
        input.off(Input.EventType.TOUCH_MOVE, this._onTouchMove, this);
        input.off(Input.EventType.TOUCH_END, this._onTouchEnd, this);
        input.off(Input.EventType.TOUCH_CANCEL, this._onTouchCancel, this);

        //
        InputManager._instance = null;
    }

    //
    private _canvas: Canvas | null = null;
    public get canvas(): Canvas {
        this._tryGetCanvasAndCanvasUITransform();

        return this._canvas!;
    }

    private _canvasUITransform: UITransform | null = null;
    public get canvasUITransform(): UITransform {
        this._tryGetCanvasAndCanvasUITransform();

        return this._canvasUITransform!;
    }

    public get canvasNode(): Node {
        return this.canvas.node;
    }

    //
    private _onBeforeSceneLoading(): void {
        this._canvas = null;
        this._canvasUITransform = null;
    }

    private _onAfterSceneLaunch(): void {
        this._tryGetCanvasAndCanvasUITransform();
    }

    private _tryGetCanvasAndCanvasUITransform(): void {
        if (this._canvas === null) {
            this._canvas = director.getScene()?.getComponentInChildren(Canvas) ?? null;
            if (this._canvas === null) {
                throw new Error("场景中没有找到 Canvas 组件");
            }
        }

        if (this._canvasUITransform === null) {
            this._canvasUITransform = this._canvas?.node.getComponent(UITransform) ?? null;
            if (this._canvasUITransform === null) {
                throw new Error("Canvas 没有 UITransform 组件");
            }
        }
    }

    private _onAfterUpdate(): void {
        //
        this._keyDownCodeSet.clear();
        this._keyUpCodeSet.clear();

        //
        this._mouseButtonDownSet.clear();
        this._mouseButtonUpSet.clear();

        //
        this._keyboardEvents.length = 0;
        this._mouseEvents.length = 0;
        this._touchEvents.length = 0;
    }

    //
    private _keyboardEvents: EventKeyboard[] = [];
    public get keyboardEvents(): Readonly<EventKeyboard[]> {
        return this._keyboardEvents;
    }
    public get lastKeyboardEvent(): EventKeyboard | undefined {
        return this._keyboardEvents.at(-1);
    }

    public getLastKeyboardEventByType(
        type: typeof Input.EventType.KEY_DOWN | typeof Input.EventType.KEY_UP
    ): EventKeyboard | undefined {
        return this._keyboardEvents.findLast((event) => event.type === type);
    }
    public get lastKeyDownEvent(): EventKeyboard | undefined {
        return this.getLastKeyboardEventByType(Input.EventType.KEY_DOWN);
    }
    public get lastKeyUpEvent(): EventKeyboard | undefined {
        return this.getLastKeyboardEventByType(Input.EventType.KEY_UP);
    }

    //
    private _keyDownCodeSet = new Set<KeyCode>();
    private _keyHoldCodeSet = new Set<KeyCode>();
    private _keyUpCodeSet = new Set<KeyCode>();

    private _onKeyDown(event: EventKeyboard): void {
        this._keyboardEvents.push(event);

        this._keyDownCodeSet.add(event.keyCode);
        this._keyHoldCodeSet.add(event.keyCode);
    }
    private _onKeyUp(event: EventKeyboard): void {
        this._keyboardEvents.push(event);

        this._keyDownCodeSet.delete(event.keyCode);
        this._keyHoldCodeSet.delete(event.keyCode);

        this._keyUpCodeSet.add(event.keyCode);
    }

    /**
     * 指定按键按下 (只在按下那一帧有效)
     * @param keyCode 按键码
     * @returns
     */
    public isKeyDown(keyCode: KeyCode): boolean {
        return this._keyDownCodeSet.has(keyCode);
    }
    /**
     * 指定按键按住
     * @param keyCode 按键码
     * @returns
     */
    public isKeyHold(keyCode: KeyCode): boolean {
        return this._keyHoldCodeSet.has(keyCode);
    }
    /**
     * 指定按键松开 (只在松开那一帧有效)
     * @param keyCode 按键码
     * @returns
     */
    public isKeyUp(keyCode: KeyCode): boolean {
        return this._keyUpCodeSet.has(keyCode);
    }

    /**
     * 任意按键按下 (只在按下那一帧有效)
     * @returns
     */
    public isAnyKeyDown(): boolean {
        return this._keyDownCodeSet.size > 0;
    }
    /**
     * 任意按键按住
     * @returns
     */
    public isAnyKeyHold(): boolean {
        return this._keyHoldCodeSet.size > 0;
    }
    /**
     * 任意按键松开 (只在松开那一帧有效)
     * @returns
     */
    public isAnyKeyUp(): boolean {
        return this._keyUpCodeSet.size > 0;
    }

    //
    private _uiLocation = new Vec2(0, 0);
    private _mousePosition = new Vec3(0, 0, 0);

    private _readonlyMousePosition = new Vec3(0, 0, 0);
    public get mousePosition(): Readonly<Vec3> {
        this._readonlyMousePosition.set(this._mousePosition.x, this._mousePosition.y, this._mousePosition.z);

        return this._readonlyMousePosition;
    }

    public get mouseX() {
        return this._mousePosition.x;
    }
    public get mouseY() {
        return this._mousePosition.y;
    }

    //
    private _onMouseDown(event: EventMouse): void {
        this._addMouseEvent(event);

        //
        const button = event.getButton() as BUTTON_TYPE;

        this._mouseButtonDownSet.add(button);
        this._mouseButtonHoldSet.add(button);
    }
    private _onMouseMove(event: EventMouse): void {
        this._addMouseEvent(event);
    }
    private _onMouseUp(event: EventMouse): void {
        this._addMouseEvent(event);

        //
        const button = event.getButton() as BUTTON_TYPE;

        this._mouseButtonDownSet.delete(button);
        this._mouseButtonHoldSet.delete(button);

        this._mouseButtonUpSet.add(button);
    }

    private _addMouseEvent(event: EventMouse): void {
        this._mouseEvents.push(event);

        event.getUILocation(this._uiLocation);
        this._mousePosition.set(this._uiLocation.x, this._uiLocation.y, this._mousePosition.z);
        this.canvasUITransform.convertToNodeSpaceAR(this._mousePosition, this._mousePosition);
    }

    //
    private _mouseEvents: EventMouse[] = [];
    public get mouseEvents(): Readonly<EventMouse[]> {
        return this._mouseEvents;
    }
    public get lastMouseEvent(): EventMouse | undefined {
        return this._mouseEvents.at(-1);
    }

    //
    public getLastMouseEventByType(
        type: typeof Input.EventType.MOUSE_DOWN | typeof Input.EventType.MOUSE_MOVE | typeof Input.EventType.MOUSE_UP
    ): EventMouse | undefined {
        return this._mouseEvents.findLast((event) => event.type === type);
    }
    public get lastMouseDownEvent(): EventMouse | undefined {
        return this.getLastMouseEventByType(Input.EventType.MOUSE_DOWN);
    }
    public get lastMouseMoveEvent(): EventMouse | undefined {
        return this.getLastMouseEventByType(Input.EventType.MOUSE_MOVE);
    }
    public get lastMouseUpEvent(): EventMouse | undefined {
        return this.getLastMouseEventByType(Input.EventType.MOUSE_UP);
    }

    //
    private _mouseButtonDownSet = new Set<BUTTON_TYPE>();
    private _mouseButtonHoldSet = new Set<BUTTON_TYPE>();
    private _mouseButtonUpSet = new Set<BUTTON_TYPE>();

    public isMouseDown(button: BUTTON_TYPE): boolean {
        return this._mouseButtonDownSet.has(button);
    }
    public isMouseHold(button: BUTTON_TYPE): boolean {
        return this._mouseButtonHoldSet.has(button);
    }
    public isMouseUp(button: BUTTON_TYPE): boolean {
        return this._mouseButtonUpSet.has(button);
    }

    //
    private _touchEvents: EventTouch[] = [];
    public get touchEvents() {
        return this._touchEvents;
    }
    public get lastTouchEvent(): EventTouch | undefined {
        return this._touchEvents.at(-1);
    }

    //
    public getLastTouchEventByType(
        type:
            | typeof Input.EventType.TOUCH_START
            | typeof Input.EventType.TOUCH_MOVE
            | typeof Input.EventType.TOUCH_END
            | typeof Input.EventType.TOUCH_CANCEL
    ): EventTouch | undefined {
        return this._touchEvents.findLast((event) => event.type === type);
    }
    public get lastTouchStartEvent(): EventTouch | undefined {
        return this.getLastTouchEventByType(Input.EventType.TOUCH_START);
    }
    public get lastTouchMoveEvent(): EventTouch | undefined {
        return this.getLastTouchEventByType(Input.EventType.TOUCH_MOVE);
    }
    public get lastTouchEndEvent(): EventTouch | undefined {
        return this.getLastTouchEventByType(Input.EventType.TOUCH_END);
    }
    public get lastTouchCancelEvent(): EventTouch | undefined {
        return this.getLastTouchEventByType(Input.EventType.TOUCH_CANCEL);
    }

    //
    private _onTouchStart(event: EventTouch): void {
        this._addTouchEvent(event);
    }
    private _onTouchMove(event: EventTouch): void {
        this._addTouchEvent(event);
    }
    private _onTouchEnd(event: EventTouch): void {
        this._addTouchEvent(event);
    }
    private _onTouchCancel(event: EventTouch): void {
        this._addTouchEvent(event);
    }

    private _addTouchEvent(event: EventTouch): void {
        this._touchEvents.push(event);

        event.getUILocation(this._uiLocation);
        this._mousePosition.set(this._uiLocation.x, this._uiLocation.y, this._mousePosition.z);
        this.canvasUITransform.convertToNodeSpaceAR(this._mousePosition, this._mousePosition);
    }

    //
    public getTouchCount() {
        return input.getTouchCount();
    }
    public getTouch(touchId: number): Readonly<Touch> | undefined {
        return input.getTouch(touchId);
    }
    public getAllTouches(): Touch[] {
        return input.getAllTouches();
    }

    //
    public getNode2DOrientationMouseRotation(node2d: Node2D): number {
        const mousePosition = this.mousePosition;
        const worldPosition = node2d.worldPosition;

        const dx = mousePosition.x - worldPosition.x;
        const dy = mousePosition.y - worldPosition.y;

        return Math.atan2(dy, dx);
    }
    public getNode2DOrientationMouseAngle(node2d: Node2D): number {
        return math.toDegree(this.getNode2DOrientationMouseRotation(node2d));
    }
}
