<template>
  <v-breadcrumbs class="container">
    <v-row class="d-flex flex-column ml-8 w-100">
      <v-col col="12">
        <h2>Transaction</h2>
      </v-col>
      <v-col col="12" style="min-height: calc(100vh - 12rem)">
        <v-card elevation="2" outlined shaped>
          <div>
            <v-tabs v-model="tab" background-color="white" @change="refresh">
              <v-tab v-for="tabItem in tabItems" :key="tabItem">
                {{ tabItem }}
              </v-tab>
            </v-tabs>
          </div>
          <v-card v-for="(item, index) in items.slice().reverse()" :key="index">
            <v-row no-gutters>
              <v-col cols="2.5" align-self="center" class="ml-2">
                <v-card-text>Transaction {{ item.id }}</v-card-text>
              </v-col>
              <v-col cols="4" align-self="center">
                <v-card-text>
                  <v-icon>mdi-calendar</v-icon>
                  {{ formatDate(item.createdAt) }}
                </v-card-text>
              </v-col>
              <v-col cols="3" align-self="center">
                <v-card-text
                  >Total: {{ formatCurrency(item.amountToPay) }}</v-card-text
                >
              </v-col>
              <v-col cols="2" align-self="center">
                <v-btn outlined @click="openDetailForm(item, 'detail')">
                  Detail
                </v-btn>
              </v-col>
            </v-row>
          </v-card>
        </v-card>
      </v-col>
    </v-row>
    <DetailDialog
      ref="openTransactionDialog"
      :refresh="refresh"
      :formatDate="formatDate"
    />
  </v-breadcrumbs>
</template>
<script lang="ts">
import Vue from 'vue';
import moment from 'moment';
import { mapActions, mapGetters } from 'vuex';
import BaseService from '@/services/Base';
import DetailDialog from '@/views/manager/transaction/Dialog.vue';

export default Vue.extend({
  name: 'TransactionIndex',
  components: {
    DetailDialog,
  },
  data: () => ({
    // Data General,
    transactionDetails: '',
    items: [] as any[],
    service: new BaseService(),
    tabItems: ['Finish', 'On Process'],
    tab: 0,
  }),

  async created() {
    this.setLoading(true);
    await this.refresh();
    this.setLoading(false);
  },
  computed: {
    ...mapGetters(['authenticatedUser']),
  },

  methods: {
    ...mapActions(['setLoading', 'setSnackbar']),
    async refresh() {
      try {
        await this.request('');
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

    async request(params) {
      this.setLoading(true);
      const service = new BaseService('/transactions');
      const res = await service.get(params);
      switch (this.tab) {
        case 1:
          this.items = res.data.filter((item) => item.status === 2);
          break;
        case 2:
          this.items = res.data.filter((item) => item.status === 1);
          break;
        default:
          this.items = res.data;
          break;
      }
      this.$forceUpdate();
    },

    formatCurrency(value) {
      const formatter = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumSignificantDigits: 1,
      });
      return formatter.format(value);
    },

    openDetailForm(item, type) {
      const { openTransactionDialog }: any = this.$refs;
      openTransactionDialog.startForm(item, type);
    },

    formatDate(date) {
      return moment(date).format('DD-MM-YYYY HH:mm');
    },
  },
});
</script>
