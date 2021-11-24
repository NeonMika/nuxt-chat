<template>
  <b-row v-if="game">
    <b-col>
      <h1>Game: {{ game.gameName }}</h1>
      <b-card v-if="!username" title="Enter game:">
        <b-form @submit.stop.prevent="register" inline>
          <b-input-group prepend="Username:">
            <b-form-input v-model="inputUsername" placeholder="Username" />
            <b-input-group-append>
              <b-button type="submit" variant="primary">Enter game</b-button>
            </b-input-group-append>
          </b-input-group>
          <!--<b-button type="reset" variant="danger">Reset</b-button>-->
        </b-form>
      </b-card>
      <b-card v-else title="Lobby">
        <b-row v-if="game">
          <b-col>
            <b-form @submit.stop.prevent="sendMessage" inline>
              <b-form-input
                class="my-2 mr-2"
                v-model="inputChatMessage"
                placeholder="Chat Message"
              />

              <b-button type="submit" variant="primary">Send message</b-button>
              <!--<b-button type="reset" variant="danger">Reset</b-button>-->
            </b-form>
          </b-col>
        </b-row>
        <b-row>
          <b-col cols="6">
            <textarea
              v-model="chatText"
              readonly
              class="w-100 mh-100"
            ></textarea>
          </b-col>
          <b-col cols="6">
            <b-card title="Participants">
              <p v-for="user in game.users" :key="user.username">
                {{ user.username }}
              </p>
            </b-card>
          </b-col>
        </b-row>
      </b-card>
    </b-col>
  </b-row>
  <b-row v-else>
    <b-col>
      <h1>Game not found</h1>
    </b-col>
  </b-row>
</template>

<script>
export default {
  middleware: "authenticated",
  data() {
    return {
      inputUsername: "",
      inputChatMessage: "",

      game: "",
      username: "",
    };
  },
  mounted() {
    const vm = this;

    // use "main" socket defined in nuxt.config.js
    vm.socket = this.$nuxtSocket({
      name: "main", // select "main" socket from nuxt.config.js - we could also skip this because "main" is the default socket
      withCredentials: true, // to send cookie which is needed for sessions
    });

    const gameNameToRequest = this.$route.params.gameName;

    vm.socket.on("game", (game) => {
      vm.game = game;
      console.log(vm.game);
    });

    vm.socket.emit("open", gameNameToRequest, (response) => {
      if (response.error) {
        vm.showToast(response.errorMessage);
      } else if (response.username) {
        vm.username = response.username;
      }
    });
  },
  computed: {
    chatText: function () {
      const vm = this;
      return vm.game.messages
        .map((m) => `${m.username}: ${m.message}`)
        .join("\n");
    },
  },
  methods: {
    register: function () {
      const vm = this;
      vm.socket.emit(
        "register",
        vm.game.gameName,
        vm.inputUsername,
        (response) => {
          if (response.error) {
            vm.showToast(response.errorMessage);
          } else {
            vm.username = vm.inputUsername;
          }
        }
      );
    },
    sendMessage: function () {
      const vm = this;
      if(!vm.inputChatMessage) {
        return;
      }
      vm.socket.emit(
        "chat",
        vm.game.gameName,
        vm.username,
        vm.inputChatMessage,
        (response) => {
          if (response.error) {
            vm.showToast(response.errorMessage);
          }
        }
      );
      vm.inputChatMessage = "";
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
