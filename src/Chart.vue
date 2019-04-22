<template>
  <canvas ref="canvas" :height="height"></canvas>
</template>


<script>
import Chart from "chart.js";
import axios from "axios";

export default {
  props: ["interval", "height"],
  data() {
    return {
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
    await this.read("test1", this.chartData.datasets[0], this.chartData.labels);
    await this.read("test2", this.chartData.datasets[1]);
    await this.read("test3", this.chartData.datasets[2]);

    new Chart(this.$refs.canvas, {
      type: this.chartType,
      data: this.chartData,
      options: this.chartOptions
    });
  },
  methods: {
    async read(chartId, dataset, labels) {
      const resp = await axios.get(
        `/api/tick/${chartId}/graph?interval=${this.interval}`
      );

      this.chartOptions.title.text = resp.data.label;

      resp.data.history.forEach(element => {
        if (labels) {
          labels.push(element.label);
        }
        dataset.data.push(element.kwh);
      });
    }
  }
};
</script>
