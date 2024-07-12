<template>
  <div class="container scroll" v-if="data !== null">
    <div class="first_child">
      <h1>Solelsproduktion!</h1>
      <div class="column col-12">
        <h2>Nu!</h2>
        <div class="columns">
          <div class="column col-6">
            <h5 class="traktor">Traktorgaraget</h5>
          </div>
          <div class="column col-6">
            <h5>{{data.tractor_garage}} KW</h5>
          </div>
        </div>
        <div class="columns">
          <div class="column col-6">
            <h5 class="weav">Vävrummet</h5>
          </div>
          <div class="column col-6">
            <h5>{{data.weave_room}} KW</h5>
          </div>
        </div>
        <div class="columns">
          <div class="column col-6">
            <h5 class="glade">Skogsgläntan</h5>
          </div>
          <div class="column col-6">
            <h5>{{data.glade}} KW</h5>
          </div>
        </div>
        <div class="columns">
          <div class="column col-6">
            <h5 class="barn">Ladugården</h5>
          </div>
          <div class="column col-6">
            <h5>{{data.barn}} KW</h5>
          </div>
        </div>
        <div class="columns">
          <div class="column col-6">
            <h5>Totalt</h5>
          </div>
          <div class="column col-6">
            <h5>{{data.total}} KW</h5>
          </div>
        </div>
      </div>
    </div>
    <div class="child horisontal_scroll">
      <Section interval="DAY" lookback=0 />
      <Section interval="DAY" lookback=1 />
      <Section interval="DAY" lookback=2 />
      <Section interval="DAY" lookback=3 />
      <Section interval="DAY" lookback=4 />
      <Section interval="DAY" lookback=5 />
      <Section interval="DAY" lookback=6 />

    </div>
    <div class="child horisontal_scroll">
      <Section interval="MONTH" lookback=0 />
      <Section interval="MONTH" lookback=1 />
      <Section interval="MONTH" lookback=2 />
      <Section interval="MONTH" lookback=3 />
      <Section interval="MONTH" lookback=4 />
      <Section interval="MONTH" lookback=5 />
    </div>
    <div class="child horisontal_scroll">
      <Section interval="YEAR" lookback=0 />
      <Section interval="YEAR" lookback=1 />
      <Section interval="YEAR" lookback=2 />
      <Section interval="YEAR" lookback=3 />
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Section from "./Section.vue";

export default {
  components: {
    Section
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
        const response = await axios.get("/api/now");
        this.data = response.data;
      } catch (error) {
        console.log(`error: ${error.message}`);
      }
      setTimeout(this.update, 30000);
    }
  },
};
</script>
