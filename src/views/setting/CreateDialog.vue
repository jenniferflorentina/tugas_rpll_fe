<template>
  <v-dialog
    v-model="isOpen"
    max-width="50rem"
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card class="pb-4">
      <v-toolbar class="px-4">
        <v-toolbar-title>{{ title }}Add Promo</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="isOpen = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="mb-4 mt-6">
        <v-form class="px-4 pt-4" ref="form" @submit.prevent="save()">
          <v-row align="center" justify="center">
            <v-col class="pb-0" cols="6" lg="6">
              <v-text-field
                v-model="createFields.type.value"
                :label="createFields.type.label"
                outlined
              />
            </v-col>
            <v-col class="pb-0" cols="6" lg="6">
              <v-menu
                v-model="createFields.validUntil.showModal"
                :close-on-content-click="false"
                max-width="290px"
                min-width="auto"
                offset-y
                transition="scale-transition"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="createFields.validUntil.formatted"
                    v-bind="attrs"
                    v-on="on"
                    :label="createFields.validUntil.label"
                    prepend-icon="mdi-calendar"
                    @click:append="createFields.validUntil.showModal = true"
                    :rules="createFields.validUntil.rules"
                    multi-line
                    outlined
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="createFields.validUntil.value"
                  no-title
                  @input="formatDatePicker(createFields.validUntil)"
                />
              </v-menu>
            </v-col>
          </v-row>
          <v-row v-for="(item, index) in details" :key="index">
            <v-col class="pb-0" cols="12" lg="12">
              <v-select
                v-model="item.name.value"
                :items="item.name.items"
                item-text="name"
                item-value="id"
                :label="item.name.label"
                :rules="item.name.rules"
                clearable
              />
            </v-col>
            <v-col class="pb-0" cols="12" lg="12">
              <v-text-field
                v-model="item.discount.value"
                :label="item.discount.label"
                :rules="item.discount.rules"
                type="number"
                outlined
              />
            </v-col>
          </v-row>
          <v-btn class="mr-3" @click="remove(index)">remove</v-btn>
          <v-btn @click="add()">add</v-btn>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          class="mr-6"
          v-if="type !== 'detail'"
          color="primary"
          @click="save()"
          >Save</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import moment from 'moment';
import { mapActions } from 'vuex';
import BaseService from '@/services/Base';

export default Vue.extend({
  name: 'EditDialog',
  props: ['refresh', 'createFields', 'formatCurrency'],
  data: () => ({
    isOpen: false,
    id: '',
    type: '',
    title: '',
    items: [],
    details: [
      {
        name: {
          label: 'Nama Produk',
          type: 'select',
          items: [],
          value: null,
          rules: [],
        },
        discount: {
          label: 'Discount',
          type: '',
          value: null,
          rules: [],
        },
      },
    ],
  }),

  async created() {
    this.setLoading(true);
    this.setLoading(false);
  },

  methods: {
    ...mapActions(['setLoading', 'setSnackbar']),

    async startForm(type: string) {
      this.isOpen = true;
      this.type = type;
      await this.fetchProduct(0);
    },

    onButtonClick(label) {
      (this.$refs[label] as Vue & { click: () => void }).click();
    },

    async setupPayload() {
      const details = [] as any;
      // eslint-disable-next-line no-plusplus
      for (let index = 0; index < this.details.length; index++) {
        details.push(this.payloadProduct(this.details[index]));
      }
      const payload = {
        type: this.createFields.type.value,
        validUntil: this.createFields.validUntil.value,
        details,
      };
      return payload;
    },
    payloadProduct(item) {
      const payload = {
        productId: item.name.value,
        discount: parseInt(item.discount.value, 0),
      };
      return payload;
    },

    async add() {
      this.details.push({
        name: {
          label: 'Nama Produk',
          type: 'select',
          items: [],
          value: null,
          rules: [],
        },
        discount: {
          label: 'Discount',
          type: '',
          value: null,
          rules: [],
        },
      });
      await this.fetchProduct(this.details.length - 1);
    },

    remove(index) {
      if (index !== -1) {
        this.details.splice(index, 1);
      }
    },

    async save() {
      try {
        if (!this.validate()) return;
        this.setLoading(true);
        const service = new BaseService('/promotions');
        // Prepare payload
        const payload = await this.setupPayload();
        await service.post(payload);

        this.refresh();
        this.isOpen = false;
        this.setLoading(false);
        (this.$refs.form as Vue & { reset: () => void }).reset();
      } catch (e) {
        this.isOpen = false;
        this.setLoading(false);
        this.setSnackbar({
          isVisible: true,
          message: e,
          color: 'error',
        });
      }
    },

    async fetchProduct(index) {
      const service = new BaseService('/products');
      const res = await service.get('');
      this.details[index].name.items = res.data;
      this.$forceUpdate();
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

    formatDatePicker(field) {
      field.formatted = moment(field.value).format('DD-MM-YYYY');
      field.showModal = false;
    },
  },
});
</script>
