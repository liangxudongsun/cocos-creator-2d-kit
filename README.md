# cocos-creator-2d-kit

### 提升CocosCreator3.x版本2d开发体验的工具包

## 快速开始

### 使用npm安装

```
npm install cocos-creator-2d-kit
```

### 在cocos中如何使用

```ts
// 导入包
import { InputManager, injectionNode2DToGlobalComponent } from "cocos-creator-2d-kit";

// 在任意地方调用一次注入
injectionNode2DToGlobalComponent();

// 然后就可以组件中 this.node2d.xxx 了
export class MyComponent extends Component {
    protected update(dt: number): void {
        this.node2d.x += 1;
        this.node2d.angle += 1;

        if (InputManager.instance.isKeyDown(KeyCode.KEY_C)) {
            console.log("C down");
        }
    }
}
```

### 更多内容请自行体验..
