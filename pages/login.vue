<template>
  <div>
    <input v-model="username" placeholder="Username" />
    <button @click="login">Go</button>
    {{$store.state.username}}
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: "",
    };
  },
  mounted() {
    const vm = this;

    // use "main" socket defined in nuxt.config.js
    vm.socket = this.$nuxtSocket({
      name: "main", // select "main" socket from nuxt.config.js - we could also skip this because "main" is the default socket
      persist: true
    });
  },
  methods: {
    login: function () {
      const vm = this

      vm.$store.dispatch("login", vm.username)
    },
  },
};
</script>

<style>
</style>
