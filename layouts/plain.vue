<script>
import ActionMenu from '@/components/ActionMenu';
import Header from '@/components/nav/Header';
import PromptRemove from '@/components/PromptRemove';
import AssignTo from '@/components/AssignTo';
import IndentedPanel from '@/components/IndentedPanel';
import Brand from '@/mixins/brand';
import FixedBanner from '@/components/FixedBanner';

export default {

  components: {
    ActionMenu,
    AssignTo,
    Header,
    IndentedPanel,
    PromptRemove,
    FixedBanner
  },

  middleware: ['authenticated'],

  mixins: [Brand],

  data() {
    return {
      // Assume home pages have routes where the name is the key to use for string lookup
      name: this.$route.name,
    };
  },

};
</script>

<template>
  <div class="dashboard-root">
    <FixedBanner :header="true" />

    <div class="dashboard-content">
      <Header :simple="true" />
      <main>
        <IndentedPanel class="pt-20">
          <nuxt class="outlet" />
        </IndentedPanel>
        <ActionMenu />
        <PromptRemove />
        <AssignTo />
      </main>
    </div>

    <FixedBanner :footer="true" />
  </div>
</template>

<style lang="scss" scoped>
  .dashboard-root {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }
  .dashboard-content {
    display: grid;
    flex-grow: 1;

    grid-template-areas:
      "header"
      "main";

    grid-template-columns: auto;
    grid-template-rows:    var(--header-height) auto;

    > HEADER {
      grid-area: header;
    }
  }

  MAIN {
    grid-area: main;
    overflow: auto;

    .outlet {
      min-height: 100%;
      padding: 0;
    }
  }
</style>
