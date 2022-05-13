<template>
  <div>
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
            <v-select
              v-model="select"
              label="Product Category"
              :items="categoryList"
              item-value="code"
              :rules="[(v) => !!v || 'Product Category is required']"
              required
            ></v-select>
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
            <input
              id="upload"
              ref="documentUpload"
              class="d-none"
              type="file"
              accept=".jpg, .jpeg, .png"
              @change="onChangeFile"
            />
            <v-row v-if="imgUrl !== null" class="pb-0 pr-1">
              <img height="150" :src="imgUrl" />
            </v-row>
            <v-card-actions>
              <v-btn color="primary" @click="addFile">
                <v-icon left>mdi-image</v-icon> Add Image
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn class="primary mx-0 mt-3" @click="submit()">
                <v-icon left> mdi-plus-circle </v-icon> Add Product
              </v-btn>
            </v-card-actions>
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
  name: 'NewProduct',
  props: ['refresh'],
  data: () => ({
    dialog: false,
    name: '',
    desc: '',
    code: '',
    select: null,
    price: 0,
    stock: 0,
    formData: new FormData(),
    file: null as any,
    imgUrl: null as any,
    id: null,
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
      (v) => v >= 0 || 'Stock must be more than 0',
    ],
  }),

  computed: {
    ...mapGetters(['authenticatedUser']),
  },

  methods: {
    ...mapActions(['setLoading', 'setSnackbar']),
    async startForm() {
      this.dialog = true;
    },

    addFile() {
      const el: HTMLElement | null = document.getElementById('upload');
      return el === null ? null : el.click();
    },
    onChangeFile(e: Event) {
      if (!e) return;

      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore: Object is possibly 'null'.
      const file = (e.target as HTMLInputElement).files[0];
      this.setLoading(true);
      this.formData = new FormData();
      this.formData.append('image', file);
      this.file = file;
      this.imgUrl = URL.createObjectURL(file);
      this.setLoading(false);
    },

    async setupPayload() {
      const product = {
        productCategoryId: Number(this.select),
        name: this.name,
        code: this.code,
        description: this.desc,
        price: Number(this.price),
        stock: Number(this.stock),
      };
      return product;
    },
    async submit() {
      try {
        this.setLoading(true);
        const service = new BaseService('/products');

        const product = await this.setupPayload();
        const res = await service.post(product);
        this.id = res.data.Id;

        const uploadService = new BaseService(`/products/${this.id}/images`);
        await uploadService.upload(this.formData);
        this.dialog = false;
        (this.$refs.form as Vue & { reset: () => void }).reset();
        this.refresh();
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
});
</script>
