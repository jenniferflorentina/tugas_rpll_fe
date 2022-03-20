<template>
  <v-breadcrumbs class="container">
    <v-row class="d-flex">
      <v-col cols="9" lg="9" md="9" sm="6">
        <h2>Order</h2>
        <div>
          <v-tabs
            v-model="tab"
            icons-and-text
            background-color="white"
            @change="refresh"
          >
            <v-tab v-for="tabItem in tabItems" :key="tabItem.text">
              <v-icon> {{ tabItem.icon }} </v-icon>
              <v-card-text flat> {{ tabItem.text }} </v-card-text>
            </v-tab>
          </v-tabs>
        </div>
      </v-col>
      <v-col cols="3" lg="3" md="3" sm="6">
        <h2>Detail Order</h2>
      </v-col>
      <v-col cols="9" lg="9" md="9" sm="6">
        <v-container class="fill-height">
          <v-card
            class="mx-auto mb-4"
            max-width="180"
            v-for="(item, index) in items"
            :key="index"
            outlined
          >
            <div>
              <v-img height="150" src="@/assets/image/HB_MARKET.png"></v-img>
            </div>
            <v-card-title> {{ item.name }}</v-card-title>
            <v-card-text> {{ formatCurrency(item.price) }}</v-card-text>

            <v-divider class="mx-4"></v-divider>

            <v-row justify="end">
              <v-card-actions>
                <v-btn
                  class="my-4 mr-5"
                  fab
                  dark
                  color="black"
                  rounded
                  @click="buyItem(item)"
                >
                  <v-icon> mdi-cart</v-icon>
                </v-btn>
              </v-card-actions>
            </v-row>
          </v-card>
        </v-container>
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

export default Vue.extend({
  name: 'IndexManager',
  components: { DigitalDialog },
  data: () => ({
    items: [] as any[],
    tabItems: [
      { text: 'All', icon: 'mdi-basket-check' },
      { text: 'Digital', icon: 'mdi-cellphone' },
      { text: 'Makanan', icon: 'mdi-french-fries' },
      { text: 'Minuman', icon: 'mdi-cup-water' },
      { text: 'Kebutuhan Rumah Tangga', icon: 'mdi-washing-machine' },
      { text: 'Kecantikan', icon: 'mdi-face-woman-shimmer' },
    ],
    tab: 0,
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
      const service = new BaseService('/products');
      const res = await service.get(params);
      switch (this.tab) {
        case 1:
          this.items = res.data.filter((item) => item.productCategoryId === 1);
          break;
        case 2:
          this.items = res.data.filter((item) => item.productCategoryId === 2);
          break;
        case 3:
          this.items = res.data.filter((item) => item.productCategoryId === 3);
          break;
        case 4:
          this.items = res.data.filter((item) => item.productCategoryId === 4);
          break;
        case 5:
          this.items = res.data.filter((item) => item.productCategoryId === 5);
          break;
        default:
          this.items = res.data;
          break;
      }
      this.$forceUpdate();
    },
    async buyItem(item) {
      if (item.productCategoryId === 1) {
        const { openDigitalDialog }: any = this.$refs;
        openDigitalDialog.startForm(item);
      }
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
