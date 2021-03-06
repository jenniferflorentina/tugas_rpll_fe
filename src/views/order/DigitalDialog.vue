<template>
  <v-dialog
    v-model="isOpen"
    max-width="40rem"
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card class="pb-4">
      <v-toolbar class="px-4">
        <v-toolbar-title> Digital Top-Up </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="isOpen = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="mb-4 mt-6">
        <v-form class="px-4 pt-4" ref="form" @submit.prevent="save()">
          <h2>{{ items.name }}</h2>
          <v-card-text class="px-0">
            Silahkan tawarkan nominal di bawah ini !</v-card-text
          >

          <v-row align="center" justify="center">
            <v-col
              class="pb-0"
              cols="4"
              lg="4"
              v-for="value in buttonChoice"
              :key="value"
            >
              <v-btn block color="primary" @click="buyItem(value)">{{
                formatCurrency(value)
              }}</v-btn>
            </v-col>
          </v-row>
          <v-card-text class="mt-6 px-0" disabled>{{
            formatCurrency(quantity)
          }}</v-card-text>
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
    items: [] as any,
    buttonChoice: [
      '25000',
      '50000',
      '100000',
      '150000',
      '200000',
      '300000',
      '500000',
      '750000',
      '1000000',
    ],
    members: {
      label: 'Member',
      type: 'autocomplete',
      items: [],
      value: '',
      rules: [],
    },
    service: new BaseService(),
    quantity: 0,
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

    buyItem(value) {
      this.quantity = Number(value);
    },

    async save() {
      try {
        this.setLoading(true);
        this.service = new BaseService('/transactions');
        const payload = {
          memberId: this.members.value ? this.members.value : null,
          details: [
            {
              productId: this.items.id,
              quantity: this.quantity,
            },
          ],
        };
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
