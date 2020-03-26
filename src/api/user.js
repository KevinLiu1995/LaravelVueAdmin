import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/authorization',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/authorization/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/authorization/current',
    method: 'delete'
  })
}
