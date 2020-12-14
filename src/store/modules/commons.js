const state = {
  amentites: [],
  policies: [],
  provinces: [],
  house_types: [],
  house_type_rents: []
}

const mutations = {
  UPDATE_COMMON: (state, { key, value }) => {
    // eslint-disable-next-line no-prototype-builtins
    if (state.hasOwnProperty(key)) {
      state[key] = value
    }
  }
}

const actions = {
  changeSetting({ commit }, data) {
    commit('UPDATE_COMMON', data)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

