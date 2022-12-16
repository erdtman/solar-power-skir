<template>
  <canvas ref="canvas" :height="height"></canvas>
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
      latest: {time: "", value: ""},
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
        console.log(response.data);
        this.chartData.labels = response.data.labels;
        this.chartData.datasets[0].data = response.data.dataset
        this.chartData.datasets[1].data = Array(response.data.dataset.length).fill(2);
        this.latest = response.data.latest;

        this.chart.update();
      } catch (error) {
        console.log(`error: ${error.message}`);
      }
      setTimeout(this.update, 60000);
    },
  }
};
</script>
