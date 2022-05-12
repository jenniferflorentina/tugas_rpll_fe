<template>
  <v-dialog
    v-model="isOpen"
    max-width="50rem"
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card class="pb-4">
      <v-toolbar class="px-4">
        <v-toolbar-title>{{ title }} Promo</v-toolbar-title>
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
                :disabled="isFormDisabled"
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
                :disabled="isFormDisabled"
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
                    readonly
                    :disabled="isFormDisabled"
                    multi-line
                    outlined
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="createFields.validUntil.value"
                  no-title
                  :disabled="isFormDisabled"
                  @input="formatDatePicker(createFields.validUntil)"
                />
              </v-menu>
            </v-col>
            <v-col class="pb-0" cols="12" lg="12">
              <v-card class="px-4" v-for="(item, i) in items" :key="i" outlined>
                <v-row>
                  <v-col cols="6">
                    <v-card-title> {{ item.product.name }}</v-card-title>
                  </v-col>
                  <v-col cols="4">
                    <v-card-title>
                      {{
                        discountPrice(item.product.price, item.discount)
                      }}</v-card-title
                    >
                    <v-card-subtitle
                      v-if="item.discount !== 0"
                      class="red--text"
                    >
                      {{ formatCurrency(item.product.price) }}</v-card-subtitle
                    >
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions class="mr-12">
        <v-spacer />
        <v-btn v-if="type !== 'detail'" color="primary" @click="save()"
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
    promotionId: 0,
  }),

  computed: {
    isFormDisabled(): boolean {
      return this.type === 'detail';
    },
  },

  watch: {
    type: {
      async handler() {
        this.title = this.type[0].toUpperCase() + this.type.substring(1);
      },
    },
  },

  async created() {
    this.setLoading(true);
    this.setLoading(false);
  },

  methods: {
    ...mapActions(['setLoading', 'setSnackbar']),

    async startForm(item, type: string) {
      this.isOpen = true;
      this.type = type;
      await this.fetchPromotion(item.id);
      this.fillForm(item);
    },

    fillForm(item: any) {
      if (!item) return;
      this.promotionId = item.id;
      const { type, validUntil } = item;
      const dataObj = {
        type,
        validUntil,
      };
      const keys = Object.keys(dataObj);
      for (let i = 0; i < keys.length; i += 1) {
        this.createFields[keys[i]].value = dataObj[keys[i]];
      }
      this.formatDatePicker(this.createFields.validUntil);
    },

    onButtonClick(label) {
      (this.$refs[label] as Vue & { click: () => void }).click();
    },

    async setupPayload() {
      const payload = {
        type: this.createFields.type.value,
        validUntil: this.createFields.validUntil.value,
      };
      return payload;
    },

    async save() {
      try {
        if (!this.validate()) return;
        this.setLoading(true);
        const service = new BaseService('/promotions');
        // Prepare payload
        const payload = await this.setupPayload();
        await service.put(this.promotionId, payload);

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

    formatDatePicker(field) {
      field.formatted = moment(field.value).format('DD-MM-YYYY');
      field.showModal = false;
    },
  },
});
</script>
