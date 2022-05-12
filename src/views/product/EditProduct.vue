<template>
  <div>
    <v-dialog
      v-model="dialog"
      max-width="50rem"
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card class="pb4">
        <v-toolbar class="px-4">
          <v-toolbar-title> {{ items.name }} </v-toolbar-title>
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
              accept="image/*"
              :disabled="this.authenticatedUser.role == 0"
              :rules="[(v) => !!v || 'Image is required']"
              v-model="items.image_url"
            ></v-file-input>
            <v-text-field
              label="Product Name"
              v-model="items.name"
              :rules="nameRules"
              :disabled="this.authenticatedUser.role == 0"
              clearable
              required
            >
            </v-text-field>
            <v-textarea
              label="Description"
              v-model="items.description"
              :disabled="this.authenticatedUser.role == 0"
              clearable
            >
            </v-textarea>
            <v-text-field
              label="Product Code"
              v-model="items.code"
              :rules="codeRules"
              :disabled="this.authenticatedUser.role == 0"
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
                  item-text="text"
                  :rules="[(v) => !!v || 'Product Category is required']"
                  :disabled="this.authenticatedUser.role == 0"
                  required
                ></v-select>
              </v-col>
            </v-row>

            <v-text-field
              label="Price"
              v-model="items.price"
              prefix="Rp"
              :disabled="this.authenticatedUser.role == 0"
              :rules="priceRules"
              required
            >
            </v-text-field>
            <v-text-field
              label="Stock"
              value="1"
              v-model="items.stock"
              :rules="stockRules"
              :disabled="this.authenticatedUser.role == 0"
              required
            >
            </v-text-field>

            <v-btn
              v-if="this.authenticatedUser.role == 1"
              class="success mx-0 mt-3"
              @click="update()"
            >
              <v-icon left> mdi-pencil </v-icon> Edit Product
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapActions } from 'vuex';
import BaseService from '@/services/Base';

export default Vue.extend({
  name: 'EditProduct',
  data: () => ({
    dialog: false,
    items: [] as any,
    select: { text: ' ', code: ' ' },
    name: '',
    desc: '',
    code: '',
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

  async created() {
    this.setLoading(true);
    this.setLoading(false);
  },
  computed: {
    ...mapGetters(['authenticatedUser']),
  },

  methods: {
    ...mapActions(['setLoading', 'setSnackbar']),
    async setProductCategory(id) {
      console.log(id);
      switch (id) {
        case 1:
          this.select.text = 'Digital';
          this.select.code = '1';
          break;
        case 2:
          this.select.text = 'Makanan';
          this.select.code = '2';
          break;
        case 3:
          this.select.text = 'Minuman';
          this.select.code = '3';
          break;
        case 4:
          this.select.text = 'Kebutuhan Rumah Tangga';
          this.select.code = '4';
          break;
        case 5:
          this.select.text = 'Kecantikan';
          this.select.code = '5';
          break;
        default:
          break;
      }
    },
    async startForm(item) {
      this.dialog = true;
      this.items = item;
      this.setProductCategory(this.items.productCategoryId);
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
    async update() {
      try {
        this.setLoading(true);
        const service = new BaseService('/products/:id');
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
        this.setLoading(false);
        this.setSnackbar({
          isVisible: true,
          message: e,
          color: 'error',
        });
      }
    },
  },
});
</script>
