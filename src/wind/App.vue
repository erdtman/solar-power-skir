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
      <div class="columns col-12">
        <div class="column col-6">
          <h5 class="">Median: </h5>
        </div>
        <div class="column col-6">
          <h5>X m/s</h5>
        </div>
      </div>
      <div class="columns col-12">
        <div class="column col-6">
          <h5 class="">P75: </h5>
        </div>
        <div class="column col-6">
          <h5>Y m/s</h5>
        </div>
      </div>
      <div class="chart-container" style="position: relative; height:80vh; width:90vw">
        <chart :interval="'hours'"></chart>
      </div>
    </div>
    <div class="child">
      <h2>Senaste 30 dagarna</h2>
      <div class="columns col-12">
        <div class="column col-6">
          <h5 class="">Median: </h5>
        </div>
        <div class="column col-6">
          <h5>X m/s</h5>
        </div>
      </div>
      <div class="columns col-12">
        <div class="column col-6">
          <h5 class="">P75: </h5>
        </div>
        <div class="column col-6">
          <h5>Y m/s</h5>
        </div>
      </div>
      <div class="chart-container" style="position: relative; height:80vh; width:90vw">
        <chart :interval="'days'"></chart>
      </div>
    </div>
    <div class="child">
      <h2>Senaste 12 månaderna</h2>
      <div class="columns col-12">
        <div class="column col-6">
          <h5 class="">Median: </h5>
        </div>
        <div class="column col-6">
          <h5>X m/s</h5>
        </div>
      </div>
      <div class="columns col-12">
        <div class="column col-6">
          <h5 class="">P75: </h5>
        </div>
        <div class="column col-6">
          <h5>Y m/s</h5>
        </div>
      </div>
      <div class="chart-container" style="position: relative; height:80vh; width:90vw">
        <chart :interval="'months'"></chart>
      </div>
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
    console.log("mounted");
    this.update();
  },
  methods: {
    async update() {
      try {
        const response = await axios.get("/wind/latest");
        console.log(response.data);
        this.latest = response.data.latest;
      } catch (error) {
        console.log(`error: ${error.message}`);
      }
      setTimeout(this.update, 60000);
    },
  },
};
</script>
