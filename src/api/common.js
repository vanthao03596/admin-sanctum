import request from '@/utils/request'

export function getCommons() {
  return request({
    url: '/commons',
    method: 'get'
  })
}
