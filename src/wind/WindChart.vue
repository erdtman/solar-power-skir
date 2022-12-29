<template>
  <div class="columns col-12">
    <div class="column col-6">
      <h5 class="">Median: </h5>
    </div>
    <div class="column col-6">
      <h5>{{p50}} m/s</h5>
    </div>
  </div>
  <div class="columns col-12">
    <div class="column col-6">
      <h5 class="">P75: </h5>
    </div>
    <div class="column col-6">
      <h5>{{p75}} m/s</h5>
    </div>
  </div>
  <div class="chart-container" style="position: relative; height:80vh; width:90vw">
    <canvas ref="canvas" :height="height"></canvas>
  </div>
</template>


<script>
import { Chart, registerables} from "chart.js";
import axios from "axios";

Chart.register(...registerables);

export default {
  props: ["interval", "height"],
  data() {
    this.chart = null;
    return {
      p50: 0,
      p75: 0,
      chartData: {
        labels: [],
        datasets: [{
            label: "Vind",
            borderColor: "#0909FF",
            data: [],
          },{
            label: "cut in",
            borderColor: 'rgb(0, 255, 0)',
            data: [],
          }
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
            display: true,
            min: 0,
            max: 10
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
        const response = await axios.get(`/wind/graph/${this.interval}`);

        this.p50 = response.data.p50.toFixed(2);
        this.p75 = response.data.p75.toFixed(2);
        this.chartData.labels = response.data.labels;
        this.chartData.datasets[0].data = response.data.dataset
        this.chartData.datasets[1].data = Array(response.data.dataset.length).fill(2);

        this.chart.update();
      } catch (error) {
        console.log(`error: ${error.message}`);
      }
      setTimeout(this.update, 5*60000);
    },
  }
};
</script>
