# mini-vue

## setup

1. `yarn init -y` 初始化项目

2. 创建`reactivity` 和 `tests`文件夹和入口文件

3. 初始化 typescript 配置文件 `npx tsc -- init`
   安装 typescript 依赖 `yarn add --dev typescript`

4. 初始化 JS 测试框架 `yarn add jest @types/jest --dev`

5. 安装 Babel  
   `yarn add --dev babel-jest @babel/core @babel/preset-env`
   `yarn add --dev @babel/preset-typescript`

6. 单测调试模式
   `yarn test --watch`

## TDD 的三个动作：

1. 写单元测试
2. 实现逻辑让测试通过
3. 重构代码，提高可读性和性能
