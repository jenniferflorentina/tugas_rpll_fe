<template>
  <v-dialog
    v-model="isOpen"
    max-width="40rem"
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card class="pb-4">
      <v-toolbar class="px-4">
        <v-toolbar-title> Apakah memiliki member ? </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="isOpen = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="mb-4 mt-6">
        <v-form class="px-4 pt-4" ref="form" @submit.prevent="save()">
          <v-autocomplete
            v-model="members.value"
            class="pa-0"
            :items="members.items"
            item-text="name"
            item-value="id"
            :label="members.label"
            :rules="members.rules"
            prepend-icon="mdi-card-account-details"
            clearable
          />
          <v-card-actions>
            <v-spacer />
            <v-btn outlined large @click="save()">Bayar</v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
    <PaymentDialog ref="paymentDetail" :formatCurrency="formatCurrency" />
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions } from 'vuex';
import BaseService from '@/services/Base';
import PaymentDialog from '@/views/order/PaymentDialog.vue';

export default Vue.extend({
  name: 'DigitalDialog',
  props: ['formatCurrency'],
  components: { PaymentDialog },
  data: () => ({
    isOpen: false,
    id: '',
    items: [],
    members: {
      label: 'Member',
      type: 'autocomplete',
      items: [],
      value: '',
      rules: [],
    },
    service: new BaseService(),
    transaksiId: '',
  }),

  async created() {
    this.setLoading(true);
    await this.fetchDataMember();
    this.setLoading(false);
  },

  methods: {
    ...mapActions(['setLoading', 'setSnackbar']),

    async startForm(item) {
      this.isOpen = true;
      this.items = item;
    },

    async fetchDataMember() {
      const service = new BaseService('/members');
      const res = await service.get('');
      this.members.items = res.data;
      this.$forceUpdate();
    },

    openPaymentDetail(id, memberId) {
      const { paymentDetail }: any = this.$refs;
      paymentDetail.startForm(id, memberId);
    },

    async setupPayload() {
      const details = [] as any;
      // eslint-disable-next-line no-plusplus
      for (let index = 0; index < this.items.length; index++) {
        details.push(this.payloadProduct(this.items[index]));
      }
      const payload = {
        memberId: this.members.value ? this.members.value : null,
        details,
      };
      return payload;
    },

    payloadProduct(item) {
      const payload = {
        productId: item.productId,
        quantity: Number(item.quantity),
      };
      return payload;
    },

    async save() {
      try {
        this.setLoading(true);
        this.service = new BaseService('/transactions');
        const payload = await this.setupPayload();
        const res = await this.service.post(payload);
        this.transaksiId = res.data.Id;
        this.isOpen = false;
        this.openPaymentDetail(this.transaksiId, this.members.value);
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
    validate() {
      return (
        this.$refs.form as Vue & {
          validate: () => boolean;
        }
      ).validate();
    },
  },
});
</script>
