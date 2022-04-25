<template>
  <v-breadcrumbs class="container">
    <v-row class="d-flex">
      <v-col cols="8" lg="8" md="8" sm="6">
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
      <v-col cols="4" lg="4" md="4" sm="6">
        <h2>Detail Order</h2>
      </v-col>
      <v-col cols="8" lg="8" md="8" sm="6">
        <v-container class="fill-height">
          <v-card
            class="mx-auto mb-4"
            max-width="15rem"
            v-for="(item, index) in items"
            :key="index"
            outlined
          >
            <div>
              <image-view :imageUrl="item.imageurl"></image-view>
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
      <v-col cols="4" lg="4" md="4" sm="6">
        <v-form class="px-4 pt-4" ref="form" @submit.prevent="save()">
          <v-card
            class="mx-auto mb-4"
            v-for="(item, index) in arrDetail"
            :key="index"
            outlined
          >
            <v-row>
              <v-col cols="6">
                <v-card-title> {{ item.data.name }}</v-card-title>
                <v-card-text>
                  {{ formatCurrency(item.data.price) }}</v-card-text
                >
              </v-col>
              <v-col cols="6">
                <v-card-actions class="justify-end">
                  <v-btn
                    v-if="item.quantity > 1"
                    fab
                    icon
                    rounded
                    x-small
                    class="mt-3"
                    @click="changeQuantity(item, false)"
                  >
                    <v-icon> mdi-minus</v-icon>
                  </v-btn>
                  <v-btn class="mt-3" fab dark color="black" small rounded
                    >{{ item.quantity }}
                  </v-btn>
                  <v-btn
                    class="mt-3"
                    fab
                    rounded
                    x-small
                    icon
                    @click="changeQuantity(item, true)"
                  >
                    <v-icon> mdi-plus</v-icon>
                  </v-btn>
                  <v-btn
                    class="mt-3"
                    fab
                    rounded
                    icon
                    x-small
                    color="error"
                    @click="promptDeleteItem(item)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </v-card-actions>
              </v-col>
            </v-row>
          </v-card>
        </v-form>
        <v-card-actions>
          <v-btn block dark color="black" @click="save()"> Bayar </v-btn>
        </v-card-actions>
      </v-col>
    </v-row>
    <DigitalDialog ref="openDigitalDialog" :formatCurrency="formatCurrency" />
    <TransactionDialog
      ref="openTransactionDialog"
      :formatCurrency="formatCurrency"
    />
  </v-breadcrumbs>
</template>
<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters } from 'vuex';
import BaseService from '@/services/Base';
import DigitalDialog from '@/views/order/DigitalDialog.vue';
import TransactionDialog from '@/views/order/TransactionDialog.vue';
import ImageView from '@/components/atom/ImageView.vue';

export default Vue.extend({
  name: 'IndexManager',
  components: { DigitalDialog, TransactionDialog, ImageView },
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
    arrDetail: [] as any[],
    itemBuy: [] as any,
    quantity: 0,
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
      } else {
        this.fetchProductOrder(item.id);
      }
      this.$forceUpdate();
    },

    async fetchProductOrder(id) {
      const service = new BaseService('/products');
      const res = await service.getOne(id);
      this.arrDetail.push({
        data: res.data,
        quantity: 1,
      });
      this.$forceUpdate();
    },

    async changeQuantity(item, isPlus) {
      try {
        const index = this.arrDetail.indexOf(item);
        const newQuantity = {
          data: item.data,
          quantity: isPlus ? item.quantity + 1 : item.quantity - 1,
        };
        this.arrDetail.splice(index, 1, newQuantity);
        this.$forceUpdate();
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

    promptDeleteItem(item) {
      const index = this.arrDetail.indexOf(item);
      if (index !== -1) {
        this.arrDetail.splice(index, 1);
      }
    },
    async save() {
      try {
        this.setLoading(true);
        const { openTransactionDialog }: any = this.$refs;
        for (let i = 0; i < this.arrDetail.length; i += 1) {
          this.itemBuy.push({
            productId: this.arrDetail[i].data.id,
            quantity: this.arrDetail[i].quantity,
          });
        }
        openTransactionDialog.startForm(this.itemBuy);
        this.setLoading(false);
      } catch (e) {
        this.setLoading(false);
        this.setSnackbar({
          isVisible: true,
          message: e,
          color: 'danger',
        });
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
