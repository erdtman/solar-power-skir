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
      <div class="chart-container" style="position: relative; height:80vh; width:90vw">
        <canvas ref="canvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

export default {
  data() {
    this.chart = null;
    return {
      latest: {time: "", value: ""},
      chartData: {
        labels: [],
        datasets: [{
            label: "Nivå",
            borderColor: "#0909FF",
            data: [],
          },
        ],
      },
      chartType: "line",
      chartOptions: {
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: false,
          },
          tooltip: {
            enabled: false,
          },
          animation: {
            duration: 0,
          },

        },
        elements: {
            point:{
              radius: 0
            }
          },
        tension: 0.5,

        responsive: true,
        maintainAspectRatio: false,

        scales: {
          x: {
            display: true
          },
          y: {
            display: true
          },
        },
      },
    };
  },
  async mounted() {
    var config = {
      type: this.chartType,
      data: this.chartData,
      options: this.chartOptions,
    };
    this.chart = new Chart(this.$refs.canvas, config);

    this.update();
  },
  methods: {
    async update() {
      try {
        const response = await axios.get("/wind/graph/hours");
        console.log(response.data);
        this.chartData.labels = response.data.labels;
        this.chartData.datasets[0].data = response.data.dataset

        this.latest = response.data.latest;

        this.chart.update();
      } catch (error) {
        console.log(`error: ${error.message}`);
      }
      setTimeout(this.update, 60000);
    },
  },
};
</script>
