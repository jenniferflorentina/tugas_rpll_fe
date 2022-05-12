<template>
  <div>
    <v-btn
      v-if="this.authenticatedUser.role == 1"
      @click.stop="dialog = true"
      class="success"
    >
      <v-icon left> mdi-plus-circle </v-icon> Add New Product
    </v-btn>
    <v-dialog v-model="dialog" max-width="50rem" scrollable>
      <v-card class="pb4">
        <v-toolbar class="px-4">
          <v-toolbar-title> Add New Product </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text class="pt-5">
          <v-form ref="form">
            <v-file-input
              label="File input"
              prepend-icon="mdi-camera"
              :rules="imageRules"
              accept="image/*"
            >
            </v-file-input>
            <v-text-field
              label="Product Name"
              v-model="name"
              :rules="nameRules"
              clearable
              required
            >
            </v-text-field>
            <v-textarea label="Description" v-model="desc" clearable>
            </v-textarea>
            <v-text-field
              label="Product Code"
              v-model="code"
              :rules="codeRules"
              clearable
              required
            ></v-text-field>
            <v-row>
              <v-col cols="4">
                <v-subheader> Product Category </v-subheader>
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="select"
                  :items="categoryList"
                  :rules="[(v) => !!v || 'Product Category is required']"
                  required
                ></v-select>
              </v-col>
            </v-row>

            <v-text-field
              label="Price"
              v-model="price"
              prefix="Rp"
              :rules="priceRules"
              required
            >
            </v-text-field>
            <v-text-field
              label="Stock"
              v-model="stock"
              :rules="stockRules"
              clearable
              required
            ></v-text-field>

            <v-btn class="success mx-0 mt-3" @click="submit()">
              <v-icon left> mdi-plus-circle </v-icon> Add Product
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import Vue from 'vue';
import { mapGetters, mapActions } from 'vuex';
import BaseService from '@/services/Base';

export default Vue.extend({
  data: () => ({
    dialog: false,
    name: '',
    desc: '',
    code: '',
    select: null,
    price: 0,
    stock: 0,
    categoryList: [
      { text: 'Digital', code: '1' },
      { text: 'Makanan', code: '2' },
      { text: 'Minuman', code: '3' },
      { text: 'Kebutuhan Rumah Tangga', code: '4' },
      { text: 'Kecantikan', code: '5' },
    ],
    imageRules: [(v) => !!v || 'Image is required'],
    nameRules: [
      (v) => !!v || 'Name is required',
      (v) => (v && v.length <= 20) || 'Name must be less than 20 characters',
    ],
    codeRules: [
      (v) => !!v || 'Code is required',
      (v) => /.+-.+/.test(v) || 'Code must be valid',
    ],
    priceRules: [
      (v) => !!v || 'Price is required',
      (v) => v > 0 || 'Price must be more than 0',
    ],
    stockRules: [
      (v) => !!v || 'Stock is required',
      (v) => v > 0 || 'Stock must be more than 0',
    ],
  }),
  methods: {
    ...mapActions(['setLoading', 'setSnackbar']),
    async uploadImage(file) {
      const formData = new FormData();
      formData.append('image', file);

      const uploadService = new BaseService('/product/:id/images');
      await uploadService.upload(formData);
    },
    async setupPayload() {
      const product = {
        productCategoryId: this.select.code,
        name: this.name,
        code: this.code,
        description: this.desc,
        price: this.price,
        stock: this.stock,
      };
      return product;
    },
    async submit() {
      try {
        if (!this.$refs.form.validate()) {
          return;
        }
        this.setLoading(true);
        const service = new BaseService('/products');

        const product = await this.setupPayload();
        await service.post(product);
        console.log(
          this.select,
          this.name,
          this.code,
          this.desc,
          this.price,
          this.stock
        );
        this.setLoading(false);
      } catch (e) {
        this.dialog = false;
        this.setLoading(false);
        this.setSnackbar({
          isVisible: true,
          message: e,
          color: 'error',
        });
      }
    },
  },
  computed: {
    ...mapGetters(['authenticatedUser']),
  },
});
</script>
