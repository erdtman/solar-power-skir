<template>
  <div class="container scroll" v-if="latest !== null">
    <div class="first_child">
      <h1>Vind på nybygget!</h1>
      <div class="columns">
        <div class="column col-6">
          <h5 class="">{{latest.time}}</h5>
        </div>
        <div class="column col-6">
          <h5>{{latest.m_per_s}} m/s</h5>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      latest: {time: "x", value: "y"}
    };
  },
  async mounted() {

    this.update();
  },
  methods: {
    async update() {
      try {
        const response = await axios.get("/wind/now");
        this.latest = response.data;
      } catch (error) {
        console.log(`error: ${error.message}`);
      }
      setTimeout(this.update, 10000);
    },
  },
};
</script>
