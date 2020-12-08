import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/users',
    method: 'get',
    params: query
  })
}

export function fetchUser(id) {
  return request({
    url: `/users/{id}`,
    method: 'get'
  })
}

export function fetchPv(pv) {
  return request({
    url: '/users/pv',
    method: 'get'
  })
}

export function createUser(data) {
  return request({
    url: '/users',
    method: 'post',
    data
  })
}

export function updateUser(id, data) {
  return request({
    url: '/users/' + id,
    method: 'put',
    data
  })
}

export function deleteUser(id) {
  return request({
    url: '/users/' + id,
    method: 'delete'
  })
}

export function fetchRoles(query) {
  return request({
    url: '/roles',
    method: 'get',
    params: query
  })
}

export function fetchPermissions(query) {
  return request({
    url: '/permissions',
    method: 'get',
    params: query
  })
}
