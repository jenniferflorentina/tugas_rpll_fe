<template>
  <v-dialog
    v-model="isOpen"
    max-width="40rem"
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card class="pb-4">
      <v-toolbar class="px-4">
        <v-toolbar-title> Digital Top-Up </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="isOpen = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="mb-4 mt-6">
        <v-form class="px-4 pt-4" ref="form" @submit.prevent="save()">
          <h2>{{ items.name }}</h2>
          <v-card-text class="px-0">
            Silahkan tawarkan nominal di bawah ini !</v-card-text
          >
          <v-row align="center" justify="center">
            <v-col
              class="pb-0"
              cols="4"
              lg="4"
              v-for="value in buttonChoice"
              :key="value"
            >
              <v-btn block color="primary">{{ formatCurrency(value) }}</v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions } from 'vuex';

export default Vue.extend({
  name: 'DigitalDialog',
  props: ['formatCurrency'],
  data: () => ({
    isOpen: false,
    id: '',
    items: [] as any,
    buttonChoice: [
      '25000',
      '50000',
      '100000',
      '150000',
      '200000',
      '300000',
      '500000',
      '750000',
      '1000000',
    ],
  }),

  async created() {
    this.setLoading(true);
    this.setLoading(false);
  },

  methods: {
    ...mapActions(['setLoading', 'setSnackbar']),

    async startForm(item) {
      this.isOpen = true;
      this.items = item;
    },
    validate() {
      return (
        this.$refs.form as Vue & {
          validate: () => boolean;
        }
      ).validate();
    },
  },
});
</script>
