<template>
  <canvas ref="canvas" :height="height"></canvas>
</template>


<script>
import Chart from "chart.js";
import axios from "axios";
import {mixin as VueTimers} from 'vue-timers'

export default {
  mixins: [VueTimers],
  props: ["interval", "height", "lookback"],
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
            backgroundColor: "#0088FF"
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
        const [vavrummet, traktorgaraget, skogsglantan] = await Promise.all([
        axios.get(`/api/tick/vavrummet/graph?interval=${this.interval}&lookback=${this.lookback}`),
        axios.get(`/api/tick/traktorgaraget/graph?interval=${this.interval}&lookback=${this.lookback}`),
        axios.get(`/api/tick/skogsglantan/graph?interval=${this.interval}&lookback=${this.lookback}`)]);

        this.chartOptions.title.text = vavrummet.data.label;
        this.chartData.labels = [];
        vavrummet.data.history.forEach(element => {
          this.chartData.labels.push(element.label);
        });

        this.chartData.datasets[0].data = [];
        vavrummet.data.history.forEach(element => {
          this.chartData.datasets[0].data.push(element.kwh);
        });

        this.chartData.datasets[1].data = [];
        traktorgaraget.data.history.forEach(element => {
          this.chartData.datasets[1].data.push(element.kwh);
        });

        this.chartData.datasets[2].data = [];
        skogsglantan.data.history.forEach(element => {
          this.chartData.datasets[2].data.push(element.kwh);
        });

        this.chart.update();
      } catch (error) {
        console.log(`error: ${error.message}`);
      }

      if (this.lookback !== '0') {
        return; // we only refresh the view for last DAY, MONTH or YEAR
      }
      setTimeout(this.update, 30000);
    }
  }
};
</script>
