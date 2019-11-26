<template>
  <canvas ref="canvas" :height="height"></canvas>
</template>


<script>
import Chart from "chart.js";
import axios from "axios";
import {mixin as VueTimers} from 'vue-timers'

export default {
  mixins: [VueTimers],
  props: ["interval", "height"],
  data() {
    return {
      chart: null,
      chartData: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: "#FF0000"
          },
          {
            data: [],
            backgroundColor: "#00FF00"
          },
          {
            data: [],
            backgroundColor: "#0000FF"
          }
        ]
      },
      chartType: "bar",
      chartOptions: {
        maintainAspectRatio: false,
        animation: {
          duration: 0
        },
        title: {
          display: true,
          position: "top",
          fontStyle: "bold",
          fontSize: 20
        },
        responsive: true,
        scales: {
          yAxes: [
            {
              stacked: true,
              kwh: {
                beginAtZero: true
              },
              scaleLabel: {
                display: true,
                labelString: "kWh"
              }
            }
          ],
          xAxes: [
            {
              stacked: true
            }
          ]
        },
        legend: {
          display: false
        },
        tooltips: {
          enabled: false
        }
      }
    };
  },
  async mounted() {
    this.chart = new Chart(this.$refs.canvas, {
        type: this.chartType,
        data: this.chartData,
        options: this.chartOptions
      });
    this.update();
  },
  methods: {
    async update() {
      try {
        const [test1, traktorgaraget, test3] = await Promise.all([
        axios.get(`/api/tick/test1/graph?interval=${this.interval}`),
        axios.get(`/api/tick/traktorgaraget/graph?interval=${this.interval}`),
        axios.get(`/api/tick/test3/graph?interval=${this.interval}`)]);

        this.chartOptions.title.text = test1.data.label;
        this.chartData.labels = [];
        test1.data.history.forEach(element => {
          this.chartData.labels.push(element.label);
        });

        this.chartData.datasets[0].data = [];
        test1.data.history.forEach(element => {
          this.chartData.datasets[0].data.push(element.kwh);
        });

        this.chartData.datasets[1].data = [];
        traktorgaraget.data.history.forEach(element => {
          this.chartData.datasets[1].data.push(element.kwh);
        });

        this.chartData.datasets[2].data = [];
        test3.data.history.forEach(element => {
          this.chartData.datasets[2].data.push(element.kwh);
        });

        this.chart.update();
      } catch (error) {
        console.log(`error: ${error.message}`);
      }
      
      setTimeout(this.update, 30000);
    }
  }
};
</script>
