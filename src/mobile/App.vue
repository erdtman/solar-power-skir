<template>
  <div class="container" v-if="data !== null">
    <h1>Erdtmans solelsproduktion!</h1>
    <div class="columns">
      <div class="column col-12">
        <h2>Idag</h2>
        <div class="columns">
          <div class="column col-6">
            <h5>Traktorgaraget</h5>
          </div>
          <div class="column col-6">
            <h5>{{data.tractor_garage.today_value}} KWh</h5>
          </div>
        </div>
        <div class="columns">
          <div class="column col-6">
            <h5>Vävrummet</h5>
          </div>
          <div class="column col-6">
            <h5>{{data.weave_room.today_value}} KWh</h5>
          </div>
        </div>
        <div class="columns">
          <div class="column col-6">
            <h5>Skogsgläntan</h5>
          </div>
          <div class="column col-6">
            <h5>{{data.glade.today_value}} KWh</h5>
          </div>
        </div>
        <div class="columns">
          <div class="column col-6">
            <h5>Totalt</h5>
          </div>
          <div class="column col-6">
            <h5>{{data.glade.today_value+data.weave_room.today_value+data.tractor_garage.today_value}} KWh</h5>
          </div>
        </div>
      </div>
      <div class="column col-12">
        <chart interval="DAY" height="450px"></chart>
      </div>

      <div class="column col-12">
        <h2>{{data.month_text}}</h2>
        <div class="columns">
          <div class="column col-6">
            <h5>Traktorgaraget</h5>
          </div>
          <div class="column col-6">
            <h5> {{data.tractor_garage.month_value}} KWh</h5>
          </div>
        </div>
         <div class="columns">
          <div class="column col-6">
            <h5>Vävrummet</h5>
          </div>
          <div class="column col-6">
            <h5>{{data.weave_room.month_value}} KWh</h5>
          </div>
        </div>
         <div class="columns">
          <div class="column col-6">
            <h5>Skogsgläntan</h5>
          </div>
          <div class="column col-6">
            <h5>{{data.glade.month_value}} KWh</h5>
          </div>
        </div>
        <div class="columns">
          <div class="column col-6">
            <h5>Totalt</h5>
          </div>
          <div class="column col-6">
            <h5>{{data.glade.month_value+data.weave_room.month_value+data.tractor_garage.month_value}} KWh</h5>
          </div>
        </div>
      </div>
      <div class="column col-12">
        <chart interval="MONTH" height="450px"></chart>
      </div>

      <div class="column col-12">
        <h2>{{data.year_text}}</h2>

        <div class="columns">
          <div class="column col-6">
            <h5>Traktorgaraget</h5>
          </div>
          <div class="column col-6">
            <h5>{{data.tractor_garage.year_value}} KWh</h5>
          </div>
        </div>
        <div class="columns">
          <div class="column col-6">
            <h5>Vävrummet</h5>
          </div>
          <div class="column col-6">
            <h5>{{data.weave_room.year_value}} KWh</h5>
          </div>
        </div>
        <div class="columns">
          <div class="column col-6">
            <h5>Skogsgläntan</h5>
          </div>
          <div class="column col-6">
            <h5>{{data.glade.year_value}} KWh</h5>
          </div>
        </div>
        <div class="columns">
          <div class="column col-6">
            <h5>Totalt</h5>
          </div>
          <div class="column col-6">
            <h5>{{data.glade.year_value+data.weave_room.year_value+data.tractor_garage.year_value}} KWh</h5>
          </div>
        </div>
        
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
import Vue from 'vue'
import Vue2TouchEvents from 'vue2-touch-events'
 
Vue.use(Vue2TouchEvents)


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
  },
};
</script>
