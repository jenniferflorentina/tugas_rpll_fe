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
            <v-col class="mt-1 pb-0" cols="6">
              <v-text-field
                v-model="createFields.status.value"
                :label="createFields.status.label"
                :disabled="isFormDisabled"
                outlined
              ></v-text-field>
            </v-col>
            <v-col class="mt-1 pb-0" cols="6">
              <v-text-field
                v-model="createFields.createdAt.value"
                :label="createFields.createdAt.label"
                :disabled="isFormDisabled"
                outlined
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col class="pb-0" cols="4">
              <v-text-field
                label="Nama Produk"
                disabled
                outlined
              ></v-text-field>
            </v-col>
            <v-col class="pb-0" cols="4">
              <v-text-field
                v-model="createFields.quantity.value"
                :label="createFields.quantity.label"
                disabled
                outlined
              ></v-text-field>
            </v-col>
            <v-col class="pb-0" cols="4">
              <v-text-field
                v-model="createFields.amountToPay"
                :label="createFields.amount.label"
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
                  <v-col cols="4">
                    <v-card-title>{{
                      formatCurrency(item.product.price)
                    }}</v-card-title>
                  </v-col>
                  <v-col cols="4">
                    <v-card-title>Quantity : {{ item.quantity }}</v-card-title>
                  </v-col>
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

export default Vue.extend({
  name: 'DetailDialog',
  props: ['refresh', 'formatDate'],
  data: () => ({
    isOpen: false,
    transactionId: '',
    transactionDetails: [] as any,
    type: '',
    createFields: {
      createdAt: {
        label: 'Transaction Date',
        type: 'string',
        value: '',
        rules: [],
      },
      status: {
        label: 'Status Pesanan',
        type: 'select',
        items: ['On Process', 'Finish'],
        value: '',
        rules: [],
      },
      amount: {
        label: 'Amount',
        type: 'number',
        value: '',
        rules: [],
      },
      paymentStatus: {
        label: 'Payment Status',
        type: 'string',
        value: '',
        rules: [],
      },
      name: {
        label: 'Nama',
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
      }
    },

    fillForm(item: any) {
      if (!item) return;
      const { status, member, createdAt, transactionDetails } = item;
      const dataObj = {
        status,
        name: member.name,
        telephone: member.telephone,
        createdAt,
        product: transactionDetails,
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
          default:
            break;
        }
      }
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
