import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/api/users',
    method: 'get',
    params: query
  })
}

export function fetchUser(id) {
  return request({
    url: `/api/users/{id}`,
    method: 'get'
  })
}

export function fetchPv(pv) {
  return request({
    url: '/api/users/pv',
    method: 'get'
  })
}

export function createUser(data) {
  return request({
    url: '/api/users',
    method: 'post',
    data
  })
}

export function updateUser(id, data) {
  return request({
    url: '/api/users/' + id,
    method: 'put',
    data
  })
}

export function deleteUser(id) {
  return request({
    url: '/api/users/' + id,
    method: 'delete'
  })
}

export function fetchRoles(query) {
  return request({
    url: '/api/roles',
    method: 'get',
    params: query
  })
}

export function fetchPermissions(query) {
  return request({
    url: '/api/permissions',
    method: 'get',
    params: query
  })
}
