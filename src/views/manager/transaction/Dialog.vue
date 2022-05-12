<template>
  <v-dialog
    v-model="isOpen"
    max-width="70rem"
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card class="pb-4">
      <v-toolbar class="px-4">
        <v-toolbar-title>Detail Transaction</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="isOpen = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text class="my-4">
        <v-form class="px-4" ref="form">
          <v-row align="center" justify="center">
            <v-col class="mt-1 pb-0" cols="12">
              <v-text-field
                v-model="createFields.createdAt.value"
                :label="createFields.createdAt.label"
                :disabled="isFormDisabled"
                outlined
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row align="center" justify="center">
            <v-col class="mt-2 pb-0" cols="12">
              <v-card
                v-for="(item, index) in transactionDetails"
                :key="index"
                elevation="2"
              >
                <v-row align="center" justify="center">
                  <v-col cols="4">
                    <v-card-title>{{ item.product.name }}</v-card-title>
                  </v-col>
                  <v-col cols="3">
                    <v-card-title>
                      {{ formatCurrency(item.product.price) }}
                    </v-card-title>
                  </v-col>
                  <v-col cols="1.5">
                    <v-card-title>x{{ item.quantity }}</v-card-title>
                  </v-col>
                  <v-col cols="3">
                    <v-card-title>{{
                      formatCurrency(total(item))
                    }}</v-card-title>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>
          <v-row align="center" justify="center">
            <v-col class="mt-2 pb-0" cols="12">
              <v-card class="mt-2" outlined>
                <v-row>
                  <v-card-subtitle>Subtotal</v-card-subtitle>
                  <v-spacer />
                  <v-card-subtitle>
                    {{ createFields.amount.value }}
                  </v-card-subtitle>
                </v-row>
                <v-row v-if="paymentDetail.point !== 0">
                  <v-card-subtitle>Point</v-card-subtitle>
                  <v-spacer />
                  <v-card-subtitle>
                    {{ formatCurrency(paymentDetail.point) }}
                  </v-card-subtitle>
                </v-row>
                <v-row>
                  <v-card-subtitle
                    >Pembayaran {{ paymentDetail.paymentMethod.name }}
                  </v-card-subtitle>
                  <v-spacer />
                  <v-card-subtitle>
                    {{ formatCurrency(paymentDetail.amount) }}
                  </v-card-subtitle>
                </v-row>
              </v-card>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions } from 'vuex';
import BaseService from '@/services/Base';

export default Vue.extend({
  name: 'DetailDialog',
  props: ['refresh', 'formatDate'],
  data: () => ({
    isOpen: false,
    transactionId: '',
    transactionDetails: [] as any,
    paymentDetail: [] as any,
    type: '',
    createFields: {
      createdAt: {
        label: 'Transaction Date',
        type: 'string',
        value: '',
        rules: [],
      },
      quantity: {
        label: 'Quantity',
        type: 'number',
        value: '',
        rules: [],
      },
      promotion: {
        label: 'Diskon',
        type: 'number',
        value: '',
        rules: [],
      },
      total: {
        label: 'Total',
        type: 'number',
        value: '',
        rules: [],
      },
      amount: {
        label: 'Amount',
        type: 'number',
        value: '',
        rules: [],
      },
    },
  }),

  computed: {
    isFormDisabled(): boolean {
      return this.type === 'detail';
    },
  },

  watch: {
    isOpen: {
      async handler() {
        if (this.isOpen === false) {
          (this.$refs.form as Vue & { reset: () => void }).reset();
        }
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
      if (type !== 'create') {
        this.fillForm(item);
        this.transactionId = item.id;
        this.fetchPaymentById(item.id);
      }
    },

    fillForm(item: any) {
      if (!item) return;
      const { member, createdAt, details, amountToPay } = item;
      const dataObj = {
        name: member,
        createdAt,
        product: details,
        productCategory: details,
        amount: amountToPay,
      };

      const keys = Object.keys(dataObj);
      for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i];
        switch (key) {
          case 'product':
            this.transactionDetails = dataObj.product;
            break;
          case 'createdAt':
            this.createFields[key].value = this.formatDate(dataObj[key]);
            break;
          case 'amount':
            this.createFields[key].value = this.formatCurrency(dataObj[key]);
            break;
          default:
            break;
        }
      }
    },

    async fetchPaymentById(id) {
      const service = new BaseService(`/transactions/${id}/payments`);
      const res = await service.get('');
      this.paymentDetail = res.data;
    },

    total(item) {
      let result = 0;
      if (item.product.productCategoryId === 1) {
        result = item.product.price + item.quantity;
      } else {
        result = item.product.price * item.quantity;
      }
      return result;
    },

    formatCurrency(value) {
      const formatter = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumSignificantDigits: 1,
      });
      return formatter.format(value);
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
