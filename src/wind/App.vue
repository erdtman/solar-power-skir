<template>
  <div class="container scroll" v-if="latest !== null">
    <div class="first_child">
      <h1>Vind på nybygget!</h1>
      <div class="columns col-12">
        <div class="column col-6">
          <h5 class="">{{latest.time}}</h5>
        </div>
        <div class="column col-6">
          <h5>{{latest.m_per_s}} m/s</h5>
        </div>
      </div>
    </div>
    <div class="child">
      <h2>Senaste dygnet</h2>
      <chart :interval="'hours'"></chart>
    </div>
    <div class="child">
      <h2>Senaste 30 dagarna</h2>
      <chart :interval="'days'"></chart>
    </div>
    <div class="child">
      <h2>Senaste 12 månaderna</h2>
      <chart :interval="'months'"></chart>
    </div>
  </div>
</template>

<script>
import Chart from "./WindChart.vue";
import axios from "axios";

export default {
  components: {
    Chart
  },
  data() {
    return {
      latest: {time: "", value: ""}
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
      setTimeout(this.update, 60000);
    },
  },
};
</script>
