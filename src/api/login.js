import request from '../utils/request'
/**
 * 用户登录
 * @RequestParam
 */
export function login(tel, password) {
  const params = new URLSearchParams()
  params.append('tel', tel)
  params.append('password', password)
  return request.post('/login', params)
}

// @RequestBody