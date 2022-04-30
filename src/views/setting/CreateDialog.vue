<template>
  <v-dialog
    v-model="isOpen"
    max-width="70rem"
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
            <v-col class="pb-0" cols="12" lg="12">
              <v-text-field
                v-model="createFields.type.value"
                :label="createFields.type.label"
                outlined
              />
            </v-col>
            <v-col class="pb-0" cols="12" lg="12">
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
            <v-col class="pb-0" cols="12" lg="12">
              <v-text-field
                v-model="createFields.name.value"
                :label="createFields.name.label"
                :rules="createFields.name.rules"
                outlined
              />
            </v-col>
            <v-col class="pb-0" cols="12" lg="12">
              <v-text-field
                v-model="createFields.code.value"
                :label="createFields.code.label"
                :rules="createFields.code.rules"
                outlined
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions>
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
      await this.fetchPromotion(item);
    },

    fillForm(item: any) {
      if (!item) return;
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
      const details = [] as any;
      details.post(this.payloadProduct(this.items));
      const payload = {
        type: this.createFields.type.value,
        validUntil: this.createFields.validUntil.value,
      };
      return payload;
    },
    payloadProduct(item) {
      const payload = {
        name: item.name,
        code: item.code,
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
