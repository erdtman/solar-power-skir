<template>
  <div class="child" v-if="data !== null">
      <div class="column col-12">
        <h2 class="section_title">{{data.title}}</h2>
        <div class="columns">
          <div class="column col-6">
            <h5 class="traktor">Traktorgaraget</h5>
          </div>
          <div class="column col-6">
            <h5>{{data.tractor_garage}} KWh</h5>
          </div>
        </div>
        <div class="columns">
          <div class="column col-6">
            <h5 class="weav">Vävrummet</h5>
          </div>
          <div class="column col-6">
            <h5>{{data.weave_room}} KWh</h5>
          </div>
        </div>
        <div class="columns">
          <div class="column col-6">
            <h5 class="glade">Skogsgläntan</h5>
          </div>
          <div class="column col-6">
            <h5>{{data.glade}} KWh</h5>
          </div>
        </div>
        <div class="columns">
          <div class="column col-6">
            <h5>Totalt</h5>
          </div>
          <div class="column col-6">
            <h5>{{data.total}} KWh</h5>
          </div>
        </div>
      </div>
      <div class="column col-12">
        <chart :lookback="this.lookback" :interval="this.interval" height="450px"></chart>
      </div>
    </div>
</template>


<script>
import Chart from "./Chart.vue";
import axios from "axios";

export default {
  components: {
    Chart
  },
  props: ["interval", "lookback"],
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
      try {
        const response = await axios.get(`/api/period?lookback=${this.lookback}&interval=${this.interval}`);
        this.data = response.data;
      } catch (error) {
        console.log(`error: ${error.message}`);
      }

      if (this.lookback !== 0) {
        return; // we only refresh the view for last DAY, MONTH or YEAR
      }
      setTimeout(this.update, 30000);
    }
  },
};
</script>
