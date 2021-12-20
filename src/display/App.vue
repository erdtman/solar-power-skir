<template>
  <div class="container">
    <div class="columns">
      <div class="column col-4"></div>
      <div class="column col-4" v-if="nowData !== null">
        <h2>Nu!</h2>
        <div class="columns">
          <div class="column col-6">
            <h5 class="traktor">Traktorgaraget</h5>
          </div>
          <div class="column col-6">
            <h5>{{nowData.tractor_garage}} KW</h5>
          </div>
        </div>
        <div class="columns">
          <div class="column col-6">
            <h5 class="weav">Vävrummet</h5>
          </div>
          <div class="column col-6">
            <h5>{{nowData.weave_room}} KW</h5>
          </div>
        </div>
        <div class="columns">
          <div class="column col-6">
            <h5 class="glade">Skogsgläntan</h5>
          </div>
          <div class="column col-6">
            <h5>{{nowData.glade}} KW</h5>
          </div>
        </div>
        <div class="columns">
          <div class="column col-6">
            <h5>Totalt</h5>
          </div>
          <div class="column col-6">
            <h5>{{nowData.total}} KW</h5>
          </div>
        </div>
      </div>
      <div class="column col-4" v-if="todayData !== null">
        <h2>Idag</h2>
        <div class="columns">
          <div class="column col-6">
            <h5 class="traktor">Traktorgaraget</h5>
          </div>
          <div class="column col-6">
            <h5>{{todayData.tractor_garage}} KWh</h5>
          </div>
        </div>
        <div class="columns">
          <div class="column col-6">
            <h5 class="weav">Vävrummet</h5>
          </div>
          <div class="column col-6">
            <h5>{{todayData.weave_room}} KWh</h5>
          </div>
        </div>
        <div class="columns">
          <div class="column col-6">
            <h5 class="glade">Skogsgläntan</h5>
          </div>
          <div class="column col-6">
            <h5>{{todayData.glade}} KWh</h5>
          </div>
        </div>
        <div class="columns">
          <div class="column col-6">
            <h5>Totalt</h5>
          </div>
          <div class="column col-6">
            <h5>{{todayData.total}} KWh</h5>
          </div>
        </div>
      </div>
    </div>
    <div class="columns">
      <div class="column col-12">
        <chart lookback="0" interval="DAY" height="400px" display=true></chart>
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
      nowData: null,
      todayData: null,
    }
  },
  async mounted() {
    this.update();
  },
  methods: {
    async update() {
      try {
        const nowResponse = await axios.get("/api/now");
        this.nowData = nowResponse.data;
        const todayResponse = await axios.get(`/api/period?lookback=0&interval=DAY`);
        this.todayData = todayResponse.data;
      } catch (error) {
        console.log(`error: ${error.message}`);
      }
      setTimeout(this.update, 30000);
    }
  }

};
</script>
