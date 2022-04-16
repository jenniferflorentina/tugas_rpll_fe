<template>
  <v-dialog
    v-model="isOpen"
    max-width="40rem"
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card class="pb-4">
      <v-toolbar class="px-4">
        <v-toolbar-title>Pilih Pembayaran</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="isOpen = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="mb-4 mt-8">
        <v-form class="px-4" ref="form" @submit.prevent="save()">
          <h2>Total : {{ formatCurrency(items.amountToPay) }}</h2>
          <v-card-text class="px-0">
            Jangan lupa untuk menyebutkan total yang harus dibayar !
          </v-card-text>
          <v-select
            v-model="createFields.payments.value"
            :items="createFields.payments.items"
            item-text="name"
            item-value="id"
            :label="createFields.payments.label"
            :rules="createFields.payments.rules"
            prepend-icon="mdi-wallet"
            clearable
          />
          <v-text-field
            v-if="createFields.payments.value !== 1"
            v-model="createFields.customerCode.value"
            :label="createFields.customerCode.label"
            :rules="createFields.customerCode.rules"
            prepend-icon="mdi-credit-card"
          />
          <v-text-field v-model="dataPoint.point" label="Sisa poin" disabled />
          <v-text-field
            v-model="createFields.point.value"
            :label="createFields.point.label"
            :rules="createFields.point.rules"
            prepend-icon="mdi-card-account-details"
          />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn outlined large @click="save()">Bayar</v-btn>
      </v-card-actions>
    </v-card>
    <PopUp ref="PopUp" />
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters } from 'vuex';
import BaseService from '@/services/Base';
import PopUp from '@/views/order/PaymentSuccessDialog.vue';

export default Vue.extend({
  name: 'PaymentDialog',
  props: ['formatCurrency'],
  components: { PopUp },
  data: () => ({
    isOpen: false,
    type: 'create',
    id: '',
    memberId: '',
    dataPoint: '',
    items: {} as any,
    createFields: {
      payments: {
        label: 'Metode Pembayaran',
        type: 'select',
        items: [],
        value: '',
        rules: [],
      },
      customerCode: {
        label: 'Customer Code',
        type: 'string',
        value: '',
        rules: [],
      },
      point: {
        label: 'Point yang ingin digunakan',
        type: 'string',
        value: '',
        rules: [],
      },
    },
  }),

  async created() {
    this.setLoading(true);
    await this.fetchDataPayment();
    this.setLoading(false);
  },
  computed: {
    ...mapGetters(['authenticatedUser']),
  },
  methods: {
    ...mapActions(['setLoading', 'setSnackbar']),
    startForm(id, memberId) {
      this.isOpen = true;
      this.id = id;
      this.memberId = memberId;
      this.fetchTransactions();
      this.fetchDataMember();
    },

    async fetchDataPayment() {
      const service = new BaseService('/payment-methods');
      const res = await service.get('');
      this.createFields.payments.items = res.data;
      this.$forceUpdate();
    },

    async fetchTransactions() {
      const service = new BaseService('/transactions');
      const res = await service.getOne(this.id);
      this.items = res.data;
      this.$forceUpdate();
    },

    async fetchDataMember() {
      const service = new BaseService('/members');
      const res = await service.getOne(this.memberId);
      this.dataPoint = res.data;
      this.$forceUpdate();
    },

    async setupPayload() {
      const payload = {
        paymentMethodId: this.createFields.payments.value,
        amount: this.items.amountToPay,
        transactionId: this.items.id,
        customerCode: this.createFields.customerCode.value
          ? this.createFields.customerCode.value
          : '-',
        point: this.createFields.point.value
          ? this.createFields.point.value
          : '-',
      };
      return payload;
    },

    async save() {
      try {
        if (!this.validate()) return;
        this.setLoading(true);
        const service = new BaseService('/payments');
        // Prepare payload
        const payload = await this.setupPayload();
        await service.post(payload);
        this.isOpen = false;
        this.openPopUp();
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

    openPopUp() {
      const { PopUp }: any = this.$refs;
      PopUp.startComment();
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
