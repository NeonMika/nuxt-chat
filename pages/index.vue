<template>
  <b-row>
    <b-col>
      <b-card title="Create new game" class="my-2">
        <b-input-group prepend="Game and user name">
          <b-form-input
            aria-label="Game name"
            placeholder="Harty Pard Game Night"
            v-model="inputGameName"
          ></b-form-input>
          <b-form-input
            aria-label="User name"
            placeholder="Dr. Markus"
            v-model="inputUsername"
          ></b-form-input>
          <b-input-group-append>
            <b-button variant="primary" @click="createGame"
              >Create Game</b-button
            >
          </b-input-group-append>
        </b-input-group>
      </b-card>

      <b-card title="Open Games" class="my-2">
        <b-card-group columns>
          <b-card
            v-for="gameName in games"
            :key="gameName"
            :title="gameName"
            class="mw-25"
          >
            <nuxt-link :to="`/game/${gameName}`">Enter</nuxt-link>
          </b-card>
        </b-card-group>
      </b-card>
    </b-col>
  </b-row>
</template>

<script>
export default {
  middleware: "authenticated",
  data() {
    return {
      inputGameName: "",
      inputUsername: "",

      games: [],
      latestTickId: 0,
    };
  },
  mounted() {
    const vm = this;

    // use "main" socket defined in nuxt.config.js
    vm.socket = this.$nuxtSocket({
      name: "main", // select "main" socket from nuxt.config.js - we could also skip this because "main" is the default socket
      withCredentials: true, // to send cookie which is needed for sessions
    })
      .on("games", (games) => {
        vm.games = games;
      })
      .emit("games", (response) => {
        if (response.error) {
          vm.showToast(response.errorMessage);
        }
      });
  },
  methods: {
    createGame: function () {
      const vm = this;
      vm.socket.emit(
        "createGame",
        vm.inputGameName,
        vm.inputUsername,
        (response) => {
          if (response.error) {
            vm.showToast(response.errorMessage);
          }
          /*
        if (response.error) {
          vm.$bvModal.msgBoxOk("Game already existed", {
            title: "Confirmation",
            size: "sm",
            buttonSize: "sm",
            okVariant: "success",
            headerClass: "p-2 border-bottom-0",
            footerClass: "p-2 border-top-0",
            centered: true,
          });
        } else {
          vm.$bvModal.msgBoxOk("Game created", {
            title: "Confirmation",
            size: "sm",
            buttonSize: "sm",
            okVariant: "success",
            headerClass: "p-2 border-bottom-0",
            footerClass: "p-2 border-top-0",
            centered: true,
          });
        }*/
        }
      );
    },
    showToast: function (text) {
      this.$bvToast.toast(text, {
        title: "Error",
        autoHideDelay: 5000,
        appendToast: true,
      });
    },
  },
};
</script>

<style>
</style>
