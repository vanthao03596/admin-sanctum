import Model from './Model'

export default class House extends Model {
  resource() {
    return 'houses'
  }

  baseURL() {
    return process.env.VUE_APP_BASE_API + '/landlords'
  }
}
