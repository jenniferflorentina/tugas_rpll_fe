<template>
  <v-breadcrumbs class="container">
    <v-row class="d-flex flex-column ml-8 w-100">
      <v-col cols="12">
        <h1>Member</h1>
      </v-col>
      <v-col cols="12">
        <v-btn
          style="float: right"
          color="primary"
          @click="openCreateForm(null, 'create')">
          <v-icon small>mdi-card-plus-outline</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row class="d-flex ml-8" justify="start">
      <v-card
        class="mr-4 mb-4"
        max-width="200"
        v-for="(item, index) in items"
        :key="index"
        outlined
      >
        <v-card-title> {{ item.name }}</v-card-title>

        <v-card-text>
          <div>{{ item.telephone }}</div>
          <div>{{ item.point }} point</div>
        </v-card-text>

        <v-divider class="mx-4"></v-divider>

        <v-row justify="center">
          <v-card-actions>
            <v-btn class="my-4" fab icon rounded small @click="openCreateForm(item, 'detail')"
              ><v-icon> mdi-eye</v-icon>
            </v-btn>
            <v-btn class="my-4" fab rounded small icon @click="openCreateForm(item, 'edit')"
              ><v-icon> mdi-pencil</v-icon>
            </v-btn>
          </v-card-actions>
        </v-row>
      </v-card>
    </v-row>
    <CreateDialog
      ref="createMainDialog"
      :createFields="createFields"
      :refresh="refresh"
    />
  </v-breadcrumbs>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions } from 'vuex';
import BaseService from '@/services/Base';
import CreateDialog from '@/views/setting/member/Dialog.vue';

export default Vue.extend({
  name: 'Member',
  components: {
    CreateDialog
  },
  data: () => ({
    // Data General,
    items: [] as any[],
    service : new BaseService('/members'),
    createFields: {
      name: {
        label: 'Name',
        type: 'string',
        value: '',
        rules: [(v) => !!v || 'Name is required'],
      },
      telephone: {
        label: 'Telephone',
        type: 'string',
        value: '',
        rules: [(v) => !!v || 'Telephone is required'],
      },
      point: {
        label: 'Point',
        type: 'number',
        value: 0,
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
      const res = await this.service.get(params);
      this.items = res.data;
      this.$forceUpdate();
    },

  
    openCreateForm(item, type) {
      const { createMainDialog }: any = this.$refs;
      createMainDialog.startForm(item, type);
    },
  },
});
</script>
