<script>
// import { SEEN_WHATS_NEW } from '@/store/prefs';
// import { getVersionInfo } from '@/utils/version';
import { NAME as EXPLORER } from '@/config/product/explorer';

export default {
  // middleware({ redirect, store } ) {
  //   const seenWhatsNew = store.getters['prefs/get'](SEEN_WHATS_NEW);
  //   const versionInfo = getVersionInfo(store);
  //   const isSingleVirtualCluster = store.getters['isSingleVirtualCluster'];

  //   // If this is a new version, then take the user to the home page to view the release notes
  //   if (versionInfo.fullVersion !== seenWhatsNew && !isSingleVirtualCluster) {
  //     return redirect({ name: 'home' });
  //   }

  //   // Take the user to the configured login route
  //   const afterLoginRouteObject = store.getters['prefs/afterLoginRoute'];

  //   return redirect(afterLoginRouteObject);
  // }
  fetch({ store, redirect }) {
    const id = store.getters['defaultClusterId'] || 'local';

    redirect({
      name:   'c-cluster-product',
      params: {
        cluster: id,
        product: EXPLORER,
      }
    });
  }
};
</script>
