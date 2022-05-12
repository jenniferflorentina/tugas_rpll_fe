<template>
  <v-breadcrumbs class="container">
    <v-row class="d-flex flex-column ml-8 w-100">
      <v-col col="12">
        <h2>Setting</h2>
      </v-col>
      <v-col cols="12">
        <v-btn
          style="float: right"
          color="primary"
          @click="openCreateForm(null, 'add')"
        >
          <v-card-text>Add Promo</v-card-text>
          <v-icon small>mdi-card-plus-outline</v-icon>
        </v-btn>
      </v-col>
      <v-col col="12" style="min-height: calc(100vh - 12rem)">
        <v-card elevation="2" outlined shaped>
          <v-card v-for="(item, index) in items.slice().reverse()" :key="index">
            <v-row no-gutters>
              <v-col cols="2.5" align-self="center" class="ml-2">
                <v-card-text> {{ item.type }}</v-card-text>
              </v-col>
              <v-col cols="2.5" align-self="center" class="ml-2">
                <v-card-text> {{ item.validUntil }}</v-card-text>
              </v-col>
              <v-col cols="2" align-self="center">
                <v-btn outlined @click="openEditForm(item, 'edit')">
                  Edit
                </v-btn>
              </v-col>
              <v-col cols="2" align-self="center">
                <v-btn outlined @click="openEditForm(item, 'detail')">
                  Detail
                </v-btn>
              </v-col>
            </v-row>
          </v-card>
        </v-card>
      </v-col>
    </v-row>
    <CreateDialog
      ref="openPromotionDialog"
      :refresh="refresh"
      :formatDate="formatDate"
      :createFields="createFields"
    />
    <EditDialog
      ref="openEditDialog"
      :refresh="refresh"
      :formatDate="formatDate"
      :createFields="createFields"
      :formatCurrency="formatCurrency"
    />
  </v-breadcrumbs>
</template>
<script lang="ts">
import Vue from 'vue';
import { mapActions } from 'vuex';
import BaseService from '@/services/Base';
import EditDialog from '@/views/setting/EditDialog.vue';
import CreateDialog from '@/views/setting/CreateDialog.vue';

export default Vue.extend({
  name: 'IndexManager',
  props: ['formatDate'],
  components: {
    CreateDialog,
    EditDialog,
  },
  data: () => ({
    // Data General,
    isOpen: false,
    id: '',
    title: '',
    items: [] as any[],
    item: [] as any[],
    promotionDetails: [] as any,
    service: new BaseService(),
    createFields: {
      type: {
        label: 'Type',
        type: '',
        value: '',
        rules: [],
      },
      validUntil: {
        label: 'Valid Until',
        type: 'date',
        value: '',
        formatted: '',
        showModal: false,
        rules: [],
      },
    },
  }),

  async created() {
    this.setLoading(true);
    await this.refresh();
    this.setLoading(false);
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
      const service = new BaseService('/promotions');
      const res = await service.get(params);
      this.items = res.data;
      this.$forceUpdate();
    },

    openCreateForm(item, type) {
      const { openPromotionDialog }: any = this.$refs;
      openPromotionDialog.startForm(item, type);
    },
    openEditForm(item, type) {
      const { openEditDialog }: any = this.$refs;
      openEditDialog.startForm(item, type);
    },

    formatCurrency(value) {
      const formatter = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumSignificantDigits: 1,
      });
      return formatter.format(value);
    },
  },
});
</script>
