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
          <v-btn
            v-if="authenticatedUser.role == 1 && type != 'edit'"
            color="primary"
            @click="type = 'edit'"
          >
            <v-icon> mdi-pencil </v-icon>
          </v-btn>
          <v-btn icon @click="closeForm">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text class="pt-5">
          <v-form ref="form">
            <v-row>
              <v-avatar class="ma-3" size="125" tile>
                <image-view :imageUrl="items.imageurl"></image-view>
              </v-avatar>
              <v-col cols="2">
                <v-btn
                  color="primary"
                  @click="addFile"
                  :disabled="isFormDisabled"
                >
                  <v-icon left>mdi-image</v-icon> Change Image
                </v-btn>
              </v-col>
            </v-row>
            <v-text-field
              label="Product Name"
              v-model="items.name"
              :rules="nameRules"
              :disabled="isFormDisabled"
              class="mt-5"
              clearable
              required
            >
            </v-text-field>
            <v-textarea
              label="Description"
              v-model="items.description"
              :disabled="isFormDisabled"
              clearable
            >
            </v-textarea>
            <v-text-field
              label="Product Code"
              v-model="items.code"
              :rules="codeRules"
              :disabled="isFormDisabled"
              clearable
              required
            ></v-text-field>
            <v-select
              v-model="select"
              label="Product Category"
              :items="categoryList"
              item-text="text"
              :rules="[(v) => !!v || 'Product Category is required']"
              :disabled="isFormDisabled"
              return-object
              required
            ></v-select>
            <v-text-field
              label="Price"
              v-model="items.price"
              prefix="Rp"
              :disabled="isFormDisabled"
              :rules="priceRules"
              required
            >
            </v-text-field>
            <v-text-field
              label="Stock"
              value="1"
              v-model="items.stock"
              :rules="stockRules"
              :disabled="isFormDisabled"
              required
            >
            </v-text-field>
            <v-card-actions>
              <v-spacer />
              <v-btn
                v-if="authenticatedUser.role == 1 && type == 'edit'"
                class="primary justify-end"
                @click="update()"
              >
                <v-icon left> mdi-content-save-edit </v-icon> Save Product
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
    <AddFileDialog
      ref="addFileDialog"
      @change="onChangeFile"
      :fileType="'.jpeg, .png'"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapActions } from 'vuex';
import BaseService from '@/services/Base';
import AddFileDialog from '@/views/product/UploadFileDialog.vue';
import ImageView from '@/components/atom/ImageView.vue';

export default Vue.extend({
  name: 'EditProduct',
  components: { AddFileDialog, ImageView },
  props: ['refresh'],
  data: () => ({
    dialog: false,
    items: [] as any,
    select: { text: '' as any, code: '' as any },
    type: '',
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
    isFormDisabled(): boolean {
      return this.type === 'detail';
    },
  },

  methods: {
    ...mapActions(['setLoading', 'setSnackbar']),
    setProductCategory(id) {
      switch (id) {
        case 1:
          this.select = { text: 'Digital', code: '1' };
          break;
        case 2:
          this.select = { text: 'Makanan', code: '2' };
          break;
        case 3:
          this.select = { text: 'Minuman', code: '3' };
          break;
        case 4:
          this.select = { text: 'Kebutuhan Rumah Tangga', code: '4' };
          break;
        case 5:
          this.select = { text: 'Kecantikan', code: '5' };
          break;
        default:
          break;
      }
    },
    async startForm(item, type) {
      this.dialog = true;
      this.items = item;
      this.type = type;
      this.setProductCategory(this.items.productCategoryId);
    },
    addFile() {
      (
        this.$refs.addFileDialog as Vue & { toggleShowModal: () => void }
      ).toggleShowModal();
    },

    async onChangeFile(file) {
      try {
        this.setLoading(true);
        const formData = new FormData();
        formData.append('image', file);

        const uploadService = new BaseService(
          `/products/${this.items.id}/images`
        );
        await uploadService.upload(formData);
        this.dialog = false;
        this.refresh();
        this.setLoading(false);
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
    async setupPayload() {
      const product = {
        productCategoryId: Number(this.select.code),
        name: this.items.name,
        code: this.items.code,
        description: this.items.description,
        price: this.items.price,
        stock: this.items.stock,
      };
      return product;
    },
    closeForm() {
      this.dialog = false;
      (this.$refs.form as Vue & { reset: () => void }).reset();
      this.$forceUpdate();
    },
    async update() {
      try {
        this.setLoading(true);
        const service = new BaseService('/products');
        const product = await this.setupPayload();
        await service.put(this.items.id, product);

        this.dialog = false;
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
