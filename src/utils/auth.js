import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'
const IsLoggedInKey = 'IsLogged'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function isLogged() {
  return Cookies.get(IsLoggedInKey) === '1'
}

export function setLogged(isLogged) {
  return Cookies.set(IsLoggedInKey, isLogged)
}

export function removeIsLoggedIn() {
  return Cookies.remove(IsLoggedInKey)
}
