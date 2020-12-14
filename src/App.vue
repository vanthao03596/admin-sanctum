<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { getCommons } from '@/api/common'
export default {
  name: 'App',
  async created() {
    const { data } = await getCommons()

    for (const key in data) {
      this.$store.dispatch('commons/changeSetting', {
        key: key,
        value: data[key]
      })
    }
  }
}
</script>
