<template>
  <v-breadcrumbs class="container">
    <v-row class="d-flex flex-column ml-8 w-100">
      <v-col col="12">
        <h2>Product</h2>
        <v-flex class="mt-3">
          <NewProduct />
        </v-flex>
      </v-col>

      <v-col cols="12">
        <v-container class="fill-height">
          <v-card
            @click="editProduct(item)"
            elevation="2"
            shaped
            class="mx-4 mb-4"
            max-width="200"
            height="300"
            v-for="(item, index) in items"
            :key="index"
            outlined
          >
            <div>
              <v-img
                alt="Product Image"
                width="200"
                src="@/assets/image/HB_MARKET.png"
              ></v-img>
            </div>
            <v-card-title> {{ item.name }} </v-card-title>
            <v-card-text>
              <div>Kode Barang: {{ item.code }}</div>
              <div>Harga: Rp {{ item.price }}</div>
              <div>Stock: {{ item.stock }}</div>
            </v-card-text>
          </v-card>
        </v-container>
      </v-col>
      <v-col cols="12">
        <v-btn
          style="float: right"
          color="primary"
          @click="openCreateForm(null)"
        >
          Add New Product <v-icon small right>mdi-card-plus-outline</v-icon>
        </v-btn>
      </v-col>

      <v-col cols="12">
        <v-container class="fill-height">
          <v-card
            @click="editProduct(item, 'detail')"
            elevation="2"
            shaped
            class="mx-4 mb-4"
            max-width="200"
            height="300"
            v-for="(item, index) in items"
            :key="index"
            outlined
          >
            <v-avatar class="ma-3" size="125" tile>
              <image-view :imageUrl="item.imageurl"></image-view>
            </v-avatar>
            <v-card-title> {{ item.name }} </v-card-title>
            <v-card-text>
              <div>Kode Barang: {{ item.code }}</div>
              <div>Harga: Rp {{ item.price }}</div>
              <div>Stock: {{ item.stock }}</div>
            </v-card-text>
          </v-card>
        </v-container>
      </v-col>
    </v-row>
    <EditProduct ref="openEditProduct" />
    <NewProduct ref="openCreateProduct" />
  </v-breadcrumbs>
</template>
<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters } from 'vuex';
import BaseService from '@/services/Base';
import NewProduct from '@/views/product//NewProduct.vue';
import EditProduct from '@/views/product/EditProduct.vue';
import ImageView from '@/components/atom/ImageView.vue';

export default Vue.extend({
  name: 'IndexManager',
  components: { NewProduct, EditProduct, ImageView },
  data: () => ({
    items: [] as any[],
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
      this.items = res.data;
      this.setLoading(false);
    },
    async editProduct(item, type) {
      const { openEditProduct }: any = this.$refs;
      openEditProduct.startForm(item, type);
    },
    async openCreateForm(item) {
      const { openCreateProduct }: any = this.$refs;
      openCreateProduct.startForm(item);
    },
  },
});
</script>
