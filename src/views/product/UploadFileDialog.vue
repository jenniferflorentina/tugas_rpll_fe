<template>
  <div>
    <input
      :id="id"
      ref="documentUpload"
      class="d-none"
      type="file"
      :accept="fileType"
      @change="onChangeFile"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'upload-file-dialog',
  props: {
    fileType: {
      type: String,
      default: '*',
    },
  },
  data: () => ({
    id: 'upload-popup',
  }),
  methods: {
    toggleShowModal() {
      const el: HTMLElement | null = document.getElementById(this.id);
      return el === null ? null : el.click();
    },
    onChangeFile(e: Event) {
      if (!e) return;

      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore: Object is possibly 'null'.
      const file = (e.target as HTMLInputElement).files[0];
      this.$emit('change', file);
    },
  },
});
</script>
