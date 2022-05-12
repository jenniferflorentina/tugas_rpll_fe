<template>
  <v-dialog
    v-model="isOpen"
    max-width="70rem"
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card class="pb-4">
      <v-toolbar class="px-4">
        <v-toolbar-title>{{ title }} Member</v-toolbar-title>
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
                v-model="createFields.name.value"
                :label="createFields.name.label"
                :rules="createFields.name.rules"
                :disabled="isFormDisabled"
                outlined
              />
            </v-col>
            <v-col class="pb-0" cols="12" lg="12">
              <v-text-field
                v-model="createFields.telephone.value"
                :label="createFields.telephone.label"
                :rules="createFields.telephone.rules"
                :disabled="isFormDisabled"
                outlined
              />
            </v-col>
            <v-col class="pb-0" cols="12" lg="12" v-if="type!=='create'">
              <v-text-field
                v-model="createFields.point.value"
                :label="createFields.point.label"
                outlined
                disabled
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
import { mapActions } from 'vuex';
import BaseService from '@/services/Base';

export default Vue.extend({
  name: 'MemberDialog',
  props: ['refresh', 'createFields', 'formatCurrency'],
  data: () => ({
    isOpen: false,
    id: '',
    type: '',
    title: '',
    items: [],
    memberId: 0,
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
      if (this.type !== 'create'){
        this.fillForm(item);
      }
    },

    fillForm(item: any) {
      if (!item) return;
      this.memberId = item.id;
      const { name, telephone, point } = item;
      const dataObj = {
        name,
        telephone,
        point
      };
      const keys = Object.keys(dataObj);
      for (let i = 0; i < keys.length; i += 1) {
        this.createFields[keys[i]].value = dataObj[keys[i]];
      }
    },

    onButtonClick(label) {
      (this.$refs[label] as Vue & { click: () => void }).click();
    },

    async setupPayload() {
      const payload = {
        name: this.createFields.name.value,
        telephone: this.createFields.telephone.value,
        point: this.createFields.point.value
      };
      return payload;
    },

    async save() {
      try {
        if (!this.validate()) return;
        this.setLoading(true);
        const service = new BaseService('/members');
        // Prepare payload
        const payload = await this.setupPayload();

        if (this.type !== 'create'){
          await service.put(this.memberId, payload);
        }else{
          await service.post(payload);
        }

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
