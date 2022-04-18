<template>
  <v-breadcrumbs class="container">
    <v-row class="d-flex">
      <v-col cols="8" lg="8" md="8" sm="6">
        <h2>Dashboard</h2>
      </v-col>
      <v-col cols="8" lg="8" md="8" sm="6">
        <h4>Produk Teratas</h4>
        <v-row
          class="mt-3"
          style="overflow-y: scroll; max-height: calc(100vh - 8rem)"
        >
          <v-col v-for="(item, i) in items" :key="i" cols="6">
            <v-card>
              <div class="d-flex flex-no-wrap">
                <v-avatar class="ma-3" size="125" tile>
                  <image-view :imageUrl="item.imageurl"></image-view>
                </v-avatar>
                <div>
                  <v-card-title> {{ item.name }}</v-card-title>
                  <v-card-text> {{ formatCurrency(item.price) }}</v-card-text>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="4" lg="4" md="4" sm="6">
        <h4>Promo</h4>
        <v-row class="mt-3" style="overflow-y: scroll; max-height: 50%">
          <v-col v-for="(item, i) in items" :key="i" cols="6">
            <v-card> </v-card>
          </v-col>
        </v-row>
        <v-spacer />
        <h4 class="mt-3">Digital Top-Up</h4>
        <v-row class="mt-3">
          <v-col v-for="(item, i) in digitalItems" :key="i" cols="12">
            <v-card class="mb-2">
              <v-row>
                <v-col cols="10">
                  <v-card-title> {{ item.name }}</v-card-title>
                </v-col>
                <v-col cols="2">
                  <v-card-actions class="justify-end mr-2">
                    <v-btn
                      fab
                      dark
                      color="primary"
                      rounded
                      small
                      @click="buyItem(item)"
                    >
                      <v-icon> mdi-arrow-right-bold</v-icon>
                    </v-btn>
                  </v-card-actions>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <DigitalDialog ref="openDigitalDialog" :formatCurrency="formatCurrency" />
  </v-breadcrumbs>
</template>
<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters } from 'vuex';
import BaseService from '@/services/Base';
import DigitalDialog from '@/views/order/DigitalDialog.vue';
import ImageView from '@/components/atom/ImageView.vue';

export default Vue.extend({
  name: 'IndexManager',
  components: { DigitalDialog, ImageView },
  data: () => ({
    items: [] as any[],
    digitalItems: [] as any[],
  }),

  async created() {
    this.setLoading(true);
    await this.refresh();
    this.setLoading(false);
  },
  computed: {
    ...mapGetters(['authenticatedUser']),
  },

  methods: {
    ...mapActions(['setLoading', 'setSnackbar']),

    async refresh() {
      try {
        await this.request('');
        await this.fetchDigital('');
      } catch (e) {
        this.setSnackbar({
          isVisible: true,
          message: e,
          color: 'error',
        });
      } finally {
        this.setLoading(false);
      }
    },
    async request(params) {
      this.setLoading(true);
      const service = new BaseService('/products/recommendation');
      const res = await service.get(params);
      this.items = res.data;
    },
    async fetchDigital(params) {
      this.setLoading(true);
      const service = new BaseService('/products');
      const res = await service.get(params);
      this.digitalItems = res.data.filter(
        (item) => item.productCategoryId === 1
      );
    },
    async buyItem(item) {
      const { openDigitalDialog }: any = this.$refs;
      openDigitalDialog.startForm(item);
      this.$forceUpdate();
    },
    formatCurrency(value) {
      const formatter = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumSignificantDigits: 1,
      });
      return formatter.format(value);
    },
  },
});
</script>
