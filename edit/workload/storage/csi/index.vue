<script>
import LabeledSelect from '@/components/form/LabeledSelect';
import { mapGetters } from 'vuex';

export default {
  components: { LabeledSelect },

  props:      {
    podSpec: {
      type:    Object,
      default: () => {
        return {};
      }
    },
    value: {
      type:    Object,
      default: () => {
        return {};
      }
    },
    mode: {
      type:    String,
      default: 'create'
    }
  },

  computed: {
    driverComponent() {
      try {
        return require(`@/edit/workload/storage/csi/${ this.value.csi.driver }`).default;
      } catch {
        return null;
      }
    },

    driverOpts() {
      return require.context('@/edit/workload/storage/csi', true, /^.*\.vue$/).keys().map(path => path.replace(/(\.\/)|(.vue)/g, '')).filter(file => file !== 'index');
    },

    ...mapGetters({ t: 'i18n/t' })
  },
};
</script>

<template>
  <div>
    <div>
      <div class="row mb-10">
        <div class="col span-6">
          <LabeledSelect
            v-model="value.csi.driver"
            :mode="mode"
            :label="t('workload.storage.driver')"
            :options="driverOpts"
            :get-option-label="opt=>t(`workload.storage.csi.drivers.'${opt}'`)"
            :required="true"
          />
        </div>
      </div>
      <div v-if="driverComponent" class="mb-10">
        <component :is="driverComponent" v-model="value.csi.volumeAttributes" :mode="mode" />
      </div>
    </div>
  </div>
</template>
