<template>
  <v-dialog
    v-model="isOpen"
    max-width="40rem"
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card class="pb-4">
      <v-toolbar class="px-4">
        <v-toolbar-title> Promo {{ this.title }} </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="isOpen = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-subtitle class="mt-3"
        >Note: Harga dengan warna <span class="red--text">merah</span> merupakan
        harga sebelum diskon!</v-card-subtitle
      >
      <v-card class="mx-2 px-2" v-for="(item, i) in items" :key="i" outlined>
        <v-row class="d-flex">
          <v-col cols="3">
            <v-avatar class="ma-3" size="100" tile>
              <image-view :imageUrl="item.product.imageurl"></image-view>
            </v-avatar>
          </v-col>
          <v-col cols="5">
            <v-card-title> {{ item.product.name }}</v-card-title>
          </v-col>
          <v-col cols="4">
            <v-card-title>
              {{
                discountPrice(item.product.price, item.discount)
              }}</v-card-title
            >
            <v-card-subtitle v-if="item.discount !== 0" class="red--text">
              {{ formatCurrency(item.product.price) }}</v-card-subtitle
            >
          </v-col>
        </v-row>
      </v-card>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions } from 'vuex';
import BaseService from '@/services/Base';
import ImageView from '@/components/atom/ImageView.vue';

export default Vue.extend({
  name: 'PromotionDialog',
  props: ['formatCurrency'],
  components: { ImageView },
  data: () => ({
    isOpen: false,
    id: '',
    title: '',
    items: [] as any,
    service: new BaseService(),
  }),

  async created() {
    this.setLoading(true);
    this.setLoading(false);
  },

  methods: {
    ...mapActions(['setLoading', 'setSnackbar']),

    async startForm(item) {
      this.isOpen = true;
      this.title = item.type;
      await this.fetchPromotion(item.id);
    },
    async fetchPromotion(id) {
      const service = new BaseService(`/promotions/${id}/details`);
      const res = await service.get();
      this.items = res.data;
    },
    discountPrice(oldPrice, discountPrice) {
      return this.formatCurrency(oldPrice - discountPrice);
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
