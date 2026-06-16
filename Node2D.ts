import { math, Component, Node, Quat, UITransform, Vec3, NodeEventType, EventMouse, EventTouch } from "cc";

import { InputManager } from "./InputManager";

export class Node2D {
    //
    private _component: Component;
    private _node: Node;

    //
    private _uiTransform: UITransform;

    constructor(component: Component) {
        this._component = component;
        this._node = this._component.node;

        this._uiTransform = this._node.getComponent(UITransform)!;
        if (!this._uiTransform) {
            throw new Error("Node 不存在 UITransform 组件");
        }
    }

    /**
     * 注册事件 (节点销毁时自动注销)
     * @param type 事件类型
     * @param callback 事件回调
     * @param target this指向目标
     * @param useCapture 捕获阶段吗
     */
    public on<T extends NodeEventType>(
        type: T,
        callback: NodeEventTypeCallback<T>,
        target?: unknown,
        useCapture?: boolean
    ): void {
        this._node.on(type, callback, target, useCapture);

        const onDestroyed = () => {
            this._node.off(type, callback, target, useCapture);
            this._node.off(NodeEventType.NODE_DESTROYED, onDestroyed, this);
        };
        this._node.on(NodeEventType.NODE_DESTROYED, onDestroyed, this);
    }

    /**
     * 添加组件
     * @param componentConstructor 组件构造函数
     * @param props 组件属性键值对
     * @returns 组件实例
     */
    public addComponent<T extends Component>(
        componentConstructor: ComponentConstructor<T>,
        props?: PartialWritablePropertiesOnly<T>
    ): T | null {
        const component = this._node.addComponent(componentConstructor as any);

        if (component !== null && props !== undefined) {
            setObj(component, props);
        }

        return component as T | null;
    }
    /**
     * 通过组件名称添加组件
     * @param componentName 组件名称
     * @param props 组件属性键值对
     * @returns 组件实例
     */
    public addComponentByName<T extends Component>(
        componentName: string,
        props?: PartialWritablePropertiesOnly<T>
    ): T | null {
        const component = this._node.addComponent<T>(componentName);

        if (component !== null && props !== undefined) {
            setObj(component, props);
        }

        return component;
    }

    /**
     * 获取组件
     * @param componentConstructor 组件构造函数
     * @returns 组件实例
     */
    public getComponent<T extends Component>(componentConstructor: ComponentConstructor<T>): T | null {
        return this._node.getComponent(componentConstructor);
    }
    /**
     * 通过组件名称获取组件
     * @param componentName 组件名称
     * @returns 组件实例
     */
    public getComponentByName<T extends Component>(componentName: string): T | null {
        return this._node.getComponent(componentName) as T | null;
    }

    /**
     * 移除组件
     * @param componentConstructor 组件构造函数
     */
    public removeComponent<T extends Component>(componentConstructor: ComponentConstructor<T>): void {
        this.getComponent(componentConstructor)?.destroy();
    }
    /**
     * 通过组件名称移除组件
     * @param componentName 组件名称
     */
    public removeComponentByName(componentName: string): void {
        this.getComponentByName(componentName)?.destroy();
    }

    // position
    public get x() {
        return this._node.position.x;
    }
    public set x(x: number) {
        const position = this._node.position;

        this._node.setPosition(x, position.y, position.z);
    }

    public get y() {
        return this._node.position.y;
    }
    public set y(y: number) {
        const position = this._node.position;

        this._node.setPosition(position.x, y, position.z);
    }

    // size
    public get width() {
        return this._uiTransform.contentSize.width;
    }
    public set width(width: number) {
        const size = this._uiTransform.contentSize;

        this._uiTransform.setContentSize(width, size.height);
    }

    public get height() {
        return this._uiTransform.contentSize.height;
    }
    public set height(height: number) {
        const size = this._uiTransform.contentSize;

        this._uiTransform.setContentSize(size.width, height);
    }

    // scale
    public get scaleX() {
        return this._node.scale.x;
    }
    public set scaleX(scaleX: number) {
        const scale = this._node.scale;

        this._node.setScale(scaleX, scale.y, scale.z);
    }

    public get scaleY() {
        return this._node.scale.y;
    }
    public set scaleY(scaleY: number) {
        const scale = this._node.scale;

        this._node.setScale(scale.x, scaleY, scale.z);
    }

    // anchor
    public get anchorX() {
        return this._uiTransform.anchorPoint.x;
    }
    public set anchorX(anchorX: number) {
        const anchor = this._uiTransform.anchorPoint;

        this._uiTransform.setAnchorPoint(anchorX, anchor.y);
    }

    public get anchorY() {
        return this._uiTransform.anchorPoint.y;
    }
    public set anchorY(anchorY: number) {
        const anchor = this._uiTransform.anchorPoint;

        this._uiTransform.setAnchorPoint(anchor.x, anchorY);
    }

    // rotation
    public get rotation() {
        return math.toRadian(this.angle);
    }
    public set rotation(rotation: number) {
        this.angle = math.toDegree(rotation);
    }

    // angle
    public get angle() {
        return this._node.eulerAngles.z;
    }
    public set angle(angle: number) {
        this._node.setRotationFromEuler(0, 0, angle);
    }

    // worldPosition
    private _worldPosition = new Vec3(0, 0, 0);
    private _readOnlyWorldPosition = new Vec3(0, 0, 0);

    public get worldPosition() {
        this._node.getWorldPosition(this._worldPosition);
        InputManager.instance.canvasUITransform.convertToNodeSpaceAR(this._worldPosition, this._worldPosition);

        this._readOnlyWorldPosition.set(this._worldPosition);
        return this._readOnlyWorldPosition;
    }
    public setWorldPosition(worldX: number, worldY: number): void {
        this._worldPosition.set(worldX, worldY, 0);
        InputManager.instance.canvasUITransform.convertToWorldSpaceAR(this._worldPosition, this._worldPosition);

        this._node.setWorldPosition(this._worldPosition);
    }

    public get worldX() {
        return this.worldPosition.x;
    }
    public set worldX(worldX: number) {
        this.setWorldPosition(worldX, this.worldPosition.y);
    }

    public get worldY() {
        return this.worldPosition.y;
    }
    public set worldY(worldY: number) {
        this.setWorldPosition(this.worldPosition.x, worldY);
    }

    // worldScale
    private _worldScale = new Vec3(1, 1, 1);
    private _readOnlyWorldScale = new Vec3(1, 1, 1);

    public get worldScale() {
        this._node.getWorldScale(this._worldScale);
        this._readOnlyWorldScale.set(this._worldScale.x, this._worldScale.y, this._worldScale.z);

        return this._readOnlyWorldScale;
    }

    public get worldScaleX() {
        this._node.getWorldScale(this._worldScale);

        return this._worldScale.x;
    }

    public get worldScaleY() {
        this._node.getWorldScale(this._worldScale);

        return this._worldScale.y;
    }

    // worldRotation
    private _worldRotation = new Quat();
    private _worldAngleEuler = new Vec3(0, 0, 0);

    public get worldRotation() {
        return math.toRadian(this.worldAngle);
    }

    public get worldAngle() {
        this._node.getWorldRotation(this._worldRotation);
        this._worldRotation.getEulerAngles(this._worldAngleEuler);

        return this._worldAngleEuler.z;
    }
}

// 类型工具
type ComponentConstructor<T extends Component> = new (...args: any[]) => T;

// 检查属性是否为只读
type IsReadonly<T, K extends keyof T> =
    (<P>() => P extends {
        [Q in K]: T[K];
    }
        ? 1
        : 2) extends <P>() => P extends {
        -readonly [Q in K]: T[K];
    }
        ? 1
        : 2
        ? false
        : true;

// 检查属性是否只有 getter
type HasOnlyGetter<T, K extends keyof T> =
    // 函数、返回false
    T[K] extends (...args: any[]) => any
        ? false
        : {
                get(): T[K];
                set(value: T[K]): any;
            } extends Pick<T, K>
          ? false
          : {
                  get(): T[K];
              } extends Pick<T, K>
            ? true
            : false;

// 过滤掉函数、只读属性和只有 getter 的属性
type WritablePropertiesOnly<T> = Pick<
    T,
    {
        [K in keyof T]: T[K] extends Function
            ? never
            : IsReadonly<T, K> extends true
              ? never
              : HasOnlyGetter<T, K> extends true
                ? never
                : K;
    }[keyof T]
>;

/**
 * 获取可写入、非只读的、非函数的属性
 */
type PartialWritablePropertiesOnly<T> = Partial<WritablePropertiesOnly<T>>;

type AnyParameterTypeFunction = (...args: any[]) => void;

interface NodeEventTypeCallbackMap {
    [NodeEventType.TOUCH_START]: (event: EventTouch) => void;
    [NodeEventType.TOUCH_MOVE]: (event: EventTouch) => void;
    [NodeEventType.TOUCH_END]: (event: EventTouch) => void;
    [NodeEventType.TOUCH_CANCEL]: (event: EventTouch) => void;

    [NodeEventType.MOUSE_DOWN]: (event: EventMouse) => void;
    [NodeEventType.MOUSE_MOVE]: (event: EventMouse) => void;
    [NodeEventType.MOUSE_UP]: (event: EventMouse) => void;
    [NodeEventType.MOUSE_WHEEL]: (event: EventMouse) => void;
    [NodeEventType.MOUSE_ENTER]: (event: EventMouse) => void;
    [NodeEventType.MOUSE_LEAVE]: (event: EventMouse) => void;

    [NodeEventType.TRANSFORM_CHANGED]: (type: typeof Node.TransformBit) => void;
}

type NodeEventTypeCallback<T> = T extends keyof NodeEventTypeCallbackMap
    ? NodeEventTypeCallbackMap[T]
    : AnyParameterTypeFunction;

// 工具函数

/**
 * 设置对象属性
 * @param obj 对象实例
 * @param props 属性键值对
 */
function setObj<T extends object>(obj: T, props: PartialWritablePropertiesOnly<T>): void {
    for (const key in props) {
        if (key in obj) {
            (obj as any)[key] = (props as any)[key];
        }
    }
}

// 全局注入类型 Node2D 到组件原型中
declare module "cc" {
    interface Component {
        _node2d?: Node2D;
        /**
         * 当前组件的 node2d 实例
         * @example```ts
         * // 全局调用一次注入
         * injectionNode2DToGlobalComponent();
         *
         * // 后续随心使用
         * this.node2d.x = 100;
         * this.node2d.xxx
         * ...
         * ```
         */
        readonly node2d: Node2D;
    }
}

interface InjectionFunction {
    (): void;
    readonly INJECTED: boolean;
}

/**
 * 全局注入 Node2D 到组件原型中
 */
export function injectionNode2DToGlobalComponent(): void {
    if ((injectionNode2DToGlobalComponent as InjectionFunction).INJECTED) return;

    //
    Object.defineProperty(injectionNode2DToGlobalComponent, "INJECTED", {
        value: true,
        enumerable: false,
        configurable: false,
        writable: false,
    });

    //
    Object.defineProperty(Component.prototype, "node2d", {
        get() {
            const self = this as Component;

            if (self._node2d === undefined) {
                self._node2d = new Node2D(self);
            }

            return self._node2d;
        },
        enumerable: false,
        configurable: true,
    });
}
