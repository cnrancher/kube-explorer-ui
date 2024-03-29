<script>
import { PVC } from '@/config/types';
import { removeObjects, addObjects } from '@/utils/array';
import ButtonDropdown from '@/components/ButtonDropdown';
import Mount from '@/edit/workload/storage/Mount';
import { _VIEW } from '@/config/query-params';
import CodeMirror from '@/components/CodeMirror';
import jsyaml from 'js-yaml';
import ArrayListGrouped from '@/components/form/ArrayListGrouped';
import { randomStr } from '@/utils/string';

export default {
  components: {
    ArrayListGrouped, ButtonDropdown, Mount, CodeMirror
  },

  props: {
    mode: {
      type:    String,
      default: 'create',
    },

    // pod spec
    value: {
      type:    Object,
      default: () => {
        return {};
      },
    },

    namespace: {
      type:    String,
      default: null,
    },

    container: {
      type:     Object,
      default: () => {
        return {};
      },
    },

    savePvcHookName: {
      type:     String,
      required: true,
    },

    // namespaced configmaps and secrets
    configMaps: {
      type:    Array,
      default: () => [],
    },

    secrets: {
      type:    Array,
      default: () => [],
    },

    registerBeforeHook: {
      type:    Function,
      default: null,
    },
  },

  async fetch() {
    if ( this.$store.getters['cluster/schemaFor'](PVC) ) {
      this.pvcs = await this.$store.dispatch('cluster/findAll', { type: PVC });
    } else {
      this.pvcs = [];
    }
  },

  data() {
    this.initializeStorage();

    return {
      pvcs:           [],
      storageVolumes: this.getStorageVolumes(),
    };
  },

  computed: {
    isView() {
      return this.mode === _VIEW;
    },

    namespacedPVCs() {
      const namespace = this.namespace || this.$store.getters['defaultNamespace'];

      return this.pvcs.filter(pvc => pvc.metadata.namespace === namespace);
    },

    /**
     * Generated list of volumes
     */
    volumeTypeOptions() {
      const excludedFiles = ['index', 'Mount', 'PVC'];
      const defaultVolumeTypes = [
        'csi',
        'configMap',
        'createPVC',
        'persistentVolumeClaim'
      ];
      // Get all the custom volume types from the file names of this folder
      const customVolumeTypes = require
        .context('@/edit/workload/storage', false, /^.*\.vue$/)
        .keys()
        .map(path => path.replace(/(\.\/)|(.vue)/g, ''))
        .filter(file => !excludedFiles.includes(file));

      return [
        ...customVolumeTypes,
        ...defaultVolumeTypes
      ]
        .sort()
        .map(volumeType => ({
          label:  this.t(`workload.storage.subtypes.${ volumeType }`),
          action: this.addVolume,
          value:  volumeType,
        }));
    },

    pvcNames() {
      return this.namespacedPVCs.map(pvc => pvc.metadata.name);
    },
  },

  watch: {
    storageVolumes(neu, old) {
      removeObjects(this.value.volumes, old);
      addObjects(this.value.volumes, neu);
      const names = neu.reduce((all, each) => {
        all.push(each.name);

        return all;
      }, []);

      this.container.volumeMounts = this.container.volumeMounts.filter(mount => names.includes(mount.name));
    }
  },

  methods: {
    /**
     * Initialize missing values for the container
     */
    initializeStorage() {
      if (!this.container.volumeMounts) {
        this.$set(this.container, 'volumeMounts', []);
      }
      if (!this.value.volumes) {
        this.$set(this.value, 'volumes', []);
      }
    },

    /**
     * Get existing paired storage volumes
     */
    getStorageVolumes() {
      // Extract volume mounts to map storage volumes
      const { volumeMounts = [] } = this.container;
      const names = volumeMounts.map(({ name }) => name);

      // Extract storage volumes to allow mutation, if matches mount map
      return this.value.volumes.filter(volume => names.includes(volume.name));
    },

    /**
     * Remove all mounts for given storage volume
     */
    removeVolume(volume) {
      const removeName = volume.row.value.name;

      this.storageVolumes = this.storageVolumes.filter(({ name }) => name !== removeName);
    },

    addVolume(type) {
      const name = `vol-${ randomStr(5).toLowerCase() }`;

      if (type === 'createPVC') {
        this.storageVolumes.push({
          _type:                 'createPVC',
          persistentVolumeClaim: {},
          name,
        });
      } else if (type === 'csi') {
        this.storageVolumes.push({
          _type: type,
          csi:   { volumeAttributes: {} },
          name,
        });
      } else {
        this.storageVolumes.push({
          _type:  type,
          [type]: {},
          name,
        });
      }

      this.container.volumeMounts.push({ name });
    },

    volumeType(vol) {
      const type = Object.keys(vol).filter(
        key => typeof vol[key] === 'object'
      )[0];

      return type;
    },

    // import component for volume type
    getComponent(type) {
      switch (type) {
      case 'configMap':
        return require(`@/edit/workload/storage/secret.vue`).default;
      case 'createPVC':
      case 'persistentVolumeClaim':
        return require(`@/edit/workload/storage/persistentVolumeClaim/index.vue`)
          .default;
      case 'csi':
        return require(`@/edit/workload/storage/csi/index.vue`).default;
      default: {
        let component;

        try {
          component = require(`@/edit/workload/storage/${ type }.vue`).default;
        } catch {}

        return component;
      }
      }
    },

    headerFor(type) {
      if (
        this.$store.getters['i18n/exists'](`workload.storage.subtypes.${ type }`)
      ) {
        return this.t(`workload.storage.subtypes.${ type }`);
      } else {
        return type;
      }
    },

    yamlDisplay(volume) {
      try {
        return jsyaml.dump(volume);
      } catch {
        return volume;
      }
    },

    openPopover() {
      const button = this.$refs.buttonDropdown;

      try {
        button.togglePopover();
      } catch (e) {}
    },

    // codemirror needs to refresh if it is in a tab that wasn't visible on page load
    refresh() {
      if (this.$refs.cm) {
        this.$refs.cm.forEach(component => component.refresh());
      }
    },

    removePvcForm(hookName) {
      this.$emit('removePvcForm', hookName);
    }
  },
};
</script>

<template>
  <div>
    <!-- Storage Volumes -->
    <ArrayListGrouped
      :key="storageVolumes.length"
      v-model="storageVolumes"
      :mode="mode"
      @remove="removeVolume"
    >
      <!-- Custom/default storage volume form -->
      <template #default="props">
        <h3>{{ headerFor(volumeType(props.row.value)) }}</h3>
        <div class="bordered-section">
          <component
            :is="getComponent(volumeType(props.row.value))"
            v-if="getComponent(volumeType(props.row.value))"
            :value="props.row.value"
            :pod-spec="value"
            :mode="mode"
            :namespace="namespace"
            :secrets="secrets"
            :config-maps="configMaps"
            :pvcs="pvcNames"
            :register-before-hook="registerBeforeHook"
            :save-pvc-hook-name="savePvcHookName"
            @removePvcForm="removePvcForm"
          />
          <div v-else-if="isView">
            <CodeMirror
              ref="cm"
              :value="yamlDisplay(props.row.value)"
              :options="{ readOnly: true, cursorBlinkRate: -1 }"
            />
          </div>
        </div>

        <!-- Mount point list to be mapped to volume -->
        <Mount
          :container="container"
          :name="props.row.value.name"
          :mode="mode"
        />
      </template>

      <!-- Add Storage Volume -->
      <template #add>
        <ButtonDropdown
          v-if="!isView"
          id="add-volume"
          :button-label="t('workload.storage.addVolume')"
          :dropdown-options="volumeTypeOptions"
          size="sm"
          @click-action="e=>addVolume(e.value)"
        />
      </template>
    </ArrayListGrouped>
  </div>
</template>

<style lang='scss' scoped>
.volume-source {
  padding: 20px;
  margin: 20px 0px 20px 0px;
  position: relative;

  ::v-deep .code-mirror {
    .CodeMirror {
      background-color: var(--yaml-editor-bg);
      & .CodeMirror-gutters {
        background-color: var(--yaml-editor-bg);
      }
    }
  }
}

.remove-vol {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 0px;
}

.add-vol:focus {
  outline: none;
  box-shadow: none;
}
</style>
