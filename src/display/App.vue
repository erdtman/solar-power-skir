<template>
  <div class="container">
    <div class="columns">
      <div class="column col-4"></div>
      <div class="column col-4">
        <h1>Nu</h1>
        <div class="columns">
          <div class="column col-6">
            <h5 class="traktor">Traktorgaraget</h5>
          </div>
          <div class="column col-6">
            <h5>P KW</h5>
          </div>
        </div>
        <div class="columns">
          <div class="column col-6">
            <h5 class="weav">Vävrummet</h5>
          </div>
          <div class="column col-6">
            <h5>Q KW</h5>
          </div>
        </div>
        <div class="columns">
          <div class="column col-6">
            <h5 class="glade">Skogsgläntan</h5>
          </div>
          <div class="column col-6">
            <h5>R KW</h5>
          </div>
        </div>
        <div class="columns">
          <div class="column col-6">
            <h5>Totalt</h5>
          </div>
          <div class="column col-6">
            <h5>T KW</h5>
          </div>
        </div>
      </div>
      <div class="column col-4">
        <h1>Idag</h1>
         <div class="columns">
          <div class="column col-6">
            <h5 class="traktor">Traktorgaraget</h5>
          </div>
          <div class="column col-6">
            <h5>Z KWh</h5>
          </div>
        </div>
        <div class="columns">
          <div class="column col-6">
            <h5 class="weav">Vävrummet</h5>
          </div>
          <div class="column col-6">
            <h5>Y KWh</h5>
          </div>
        </div>
        <div class="columns">
          <div class="column col-6">
            <h5 class="glade">Skogsgläntan</h5>
          </div>
          <div class="column col-6">
            <h5>X KWh</h5>
          </div>
        </div>
        <div class="columns">
          <div class="column col-6">
            <h5>Totalt</h5>
          </div>
          <div class="column col-6">
            <h5>T KWh</h5>
          </div>
        </div>
      </div>
    </div>
    <div class="columns">
      <div class="column col-12">
        <chart lookback="0" interval="DAY" height="450px"></chart>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from "../common/Chart.vue";
import axios from "axios";


export default {
  components: {
    Chart
  },
  data () {
    return {
      data: null,
    }
  },
  async mounted() {
    this.update();
  },
  methods: {
    async update() {

    }
  }

};
</script>
