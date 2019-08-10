<template>
  <div class="container" v-if="data !== null">
    <div class="columns">
      <div class="column col-3"></div>
      <div class="column col-2">
        <h1>Idag</h1>
      </div>
      <div class="column col-2">
        <h1>{{data.month_text}}</h1>
      </div>
      <div class="column col-2">
        <h1>{{data.year_text}}</h1>
      </div>
      <div class="column col-2">
        <h1>Total</h1>
      </div>
    </div>
    <div class="columns">
      <div class="column col-3">
        <h2>Vävrumet</h2>
      </div>
      <div class="column col-2">
        <h2>{{data.weave_room.today_value}} KWh</h2>
      </div>
      <div class="column col-2">
        <h2>{{data.weave_room.month_value}} KWh</h2>
      </div>
      <div class="column col-2">
        <h2>{{data.weave_room.year_value}} KWh</h2>
      </div>
      <div class="column col-2">
        <h2>{{data.weave_room.total_value}} KWh</h2>
      </div>
    </div>
    <div class="columns">
      <div class="column col-3">
        <h2>Traktorgaraget</h2>
      </div>
      <div class="column col-2">
        <h2>{{data.tractor_garage.today_value}} KWh</h2>
      </div>
      <div class="column col-2">
        <h2>{{data.tractor_garage.month_value}} KWh</h2>
      </div>
      <div class="column col-2">
        <h2>{{data.tractor_garage.year_value}} KWh</h2>
      </div>
      <div class="column col-2">
        <h2>{{data.tractor_garage.total_value}} KWh</h2>
      </div>
    </div>
    <div class="columns">
      <div class="column col-3">
        <h2>Skogsgläntan</h2>
      </div>
      <div class="column col-2">
        <h2>{{data.glade.today_value}} KWh</h2>
      </div>
      <div class="column col-2">
        <h2>{{data.glade.month_value}} KWh</h2>
      </div>
      <div class="column col-2">
        <h2>{{data.glade.year_value}} KWh</h2>
      </div>
      <div class="column col-2">
        <h2>{{data.glade.total_value}} KWh</h2>
      </div>
    </div>

    <div class="columns">
      <div class="column col-6">
        <chart interval="DAY" height="450px"></chart>
      </div>
      <div class="column col-6">
        <div class="columns">
          <div class="column col-12">
            <chart interval="MONTH" height="225px"></chart>
          </div>
          <div class="column col-12">
            <chart interval="YEAR" height="225px"></chart>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Chart from "./Chart.vue";


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
    // TODO error handling
  },
  methods: {
    async update() {
       const response = await axios.get("/api");
       this.data = response.data;
       setTimeout(this.update, 60000);
    }
  } 

};
</script>
