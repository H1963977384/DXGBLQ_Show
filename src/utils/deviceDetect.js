/**
 * 移动端设备检测工具
 */

/**
 * 检测是否为移动设备
 * 综合使用 User-Agent 和触摸支持检测
 */
export const isMobileDevice = () => {
  // 方法1: User-Agent 检测
  const ua = navigator.userAgent.toLowerCase()
  const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(ua)
  
  // 方法2: 触摸支持检测
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  
  // 方法3: 屏幕宽度检测（辅助）
  const isNarrowScreen = window.innerWidth <= 768
  
  // 综合判断：UA 显示移动设备 或 (有触摸 且 窄屏)
  return isMobileUA || (hasTouch && isNarrowScreen)
}

/**
 * 检测是否为触摸设备（包括触摸屏笔记本）
 */
export const isTouchDevice = () => {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  )
}

/**
 * 获取设备类型
 */
export const getDeviceType = () => {
  const ua = navigator.userAgent.toLowerCase()
  
  if (/ipad/i.test(ua)) return 'ipad'
  if (/iphone|ipod/i.test(ua)) return 'iphone'
  if (/android/i.test(ua)) {
    return /mobile/i.test(ua) ? 'android-phone' : 'android-tablet'
  }
  if (/mobile/i.test(ua)) return 'mobile'
  
  return 'desktop'
}
