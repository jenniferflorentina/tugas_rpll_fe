<template>
  <v-breadcrumbs class="container">
    <v-row class="d-flex flex-column ml-8 w-100">
      <v-col col="12">
        <h2>Product</h2>
      </v-col>
    </v-row>
  </v-breadcrumbs>
</template>
<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters } from 'vuex';

export default Vue.extend({
  name: 'IndexManager',

  async created() {
    this.setLoading(true);
    this.setLoading(false);
  },
  computed: {
    ...mapGetters(['authenticatedUser']),
  },

  methods: {
    ...mapActions(['setLoading', 'setSnackbar']),
  },
});
</script>
