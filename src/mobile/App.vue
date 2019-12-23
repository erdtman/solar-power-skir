<template>
  <div class="container" v-if="data !== null">
    <h1>Erdtmans solelsproduktion!</h1>
    <div class="columns">
      <div class="column col-3"></div>
      <div class="column col-1">
        <h4>Nu</h4>
      </div>
      <div class="column col-2">
        <h4>Idag</h4>
      </div>
      <div class="column col-2">
        <h4>{{data.month_text}}</h4>
      </div>
      <div class="column col-2">
        <h4>{{data.year_text}}</h4>
      </div>
      <div class="column col-2">
        <h4>Totalt</h4>
      </div>
    </div>
    <div class="columns">
      <div class="column col-3">
        <h5>Vävrumet</h5>
      </div>
      <div class="column col-1">
        <h5>{{data.weave_room.now_value}} KW</h5>
      </div>
      <div class="column col-2">
        <h5>{{data.weave_room.today_value}} KWh</h5>
      </div>
      <div class="column col-2">
        <h5>{{data.weave_room.month_value}} KWh</h5>
      </div>
      <div class="column col-2">
        <h5>{{data.weave_room.year_value}} KWh</h5>
      </div>
      <div class="column col-2">
        <h5>{{data.weave_room.total_value}} KWh</h5>
      </div>
    </div>
    <div class="columns">
      <div class="column col-3">
        <h5>Traktorgaraget</h5>
      </div>
      <div class="column col-1">
        <h5>{{data.tractor_garage.now_value}} KW</h5>
      </div>
      <div class="column col-2">
        <h5>{{data.tractor_garage.today_value}} KWh</h5>
      </div>
      <div class="column col-2">
        <h5>{{data.tractor_garage.month_value}} KWh</h5>
      </div>
      <div class="column col-2">
        <h5>{{data.tractor_garage.year_value}} KWh</h5>
      </div>
      <div class="column col-2">
        <h5>{{data.tractor_garage.total_value}} KWh</h5>
      </div>
    </div>
    <div class="columns">
      <div class="column col-3">
        <h5>Skogsgläntan</h5>
      </div>
      <div class="column col-1">
        <h5>{{data.glade.now_value}} KW</h5>
      </div>
      <div class="column col-2">
        <h5>{{data.glade.today_value}} KWh</h5>
      </div>
      <div class="column col-2">
        <h5>{{data.glade.month_value}} KWh</h5>
      </div>
      <div class="column col-2">
        <h5>{{data.glade.year_value}} KWh</h5>
      </div>
      <div class="column col-2">
        <h5>{{data.glade.total_value}} KWh</h5>
      </div>
    </div>

    <div class="columns">
      <div class="column col-12">
        <chart interval="DAY" height="450px"></chart>
      </div>
      <div class="column col-12">
        <chart interval="MONTH" height="450px"></chart>
      </div>
      <div class="column col-12">
        <chart interval="YEAR" height="450px"></chart>
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
  },
  methods: {
    async update() {
      try {
        const response = await axios.get("/api");
        this.data = response.data;
        setTimeout(this.update, 60000);
      } catch (error) {
        console.log(`error: ${error.message}`);
      }

      setTimeout(this.update, 30000);
    }
  } 

};
</script>
