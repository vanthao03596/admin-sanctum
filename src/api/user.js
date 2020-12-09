import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/landlords/login',
    method: 'post',
    data
  })
}

export function getInfo() {
  return request({
    url: '/landlords/me',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/landlords/logout',
    method: 'post'
  })
}

export function csrf() {
  return request({
    url: '/sanctum/csrf-cookie',
    method: 'get'
  })
}
