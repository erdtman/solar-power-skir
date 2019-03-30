<template>
  <div>
    <h1>Hello World!!!</h1>
    <h2>{{ info }}</h2>
  </div>
</template>

<script>
import axios from "axios"

export default {
  data() {
    return {
      info: null
    }
  },
  async mounted () {
    const response = await axios.get('/api');
    this.info = response.data;
    // TODO error handling
  },  
}
</script>
