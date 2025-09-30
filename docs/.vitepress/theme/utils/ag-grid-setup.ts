// AG Grid 模块注册和设置
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'

// 注册所有社区版功能
ModuleRegistry.registerModules([AllCommunityModule])

// 导出以确保模块在应用启动时就被注册
export const setupAgGrid = () => {
  console.log('AG Grid modules registered')
}