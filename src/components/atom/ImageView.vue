<template>
  <v-img
    v-if="imageUrl !== ''"
    height="150"
    :src="'data:image/png;base64,' + imageUrl"
  ></v-img>
  <v-img v-else height="150" src="@/assets/image/HB_MARKET.png"></v-img>
</template>
<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'IndexManager',
  props: ['imageUrl'],
});
</script>
