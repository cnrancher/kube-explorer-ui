<script>
// import { SEEN_WHATS_NEW } from '@/store/prefs';
// import { getVersionInfo } from '@/utils/version';
import { NAME as MANAGER } from '@/config/product/manager';

export default {
  // middleware({ redirect, store, route } ) {
  //   const seenWhatsNew = store.getters['prefs/get'](SEEN_WHATS_NEW);
  //   const versionInfo = getVersionInfo(store);

  //   // If this is a new version, then take the user to the home page to view the release notes
  //   if (versionInfo.fullVersion !== seenWhatsNew) {
  //     return redirect({ name: 'home' });
  //   }

  //   // Take the user to the configured login route
  //   const afterLoginRouteObject = store.getters['prefs/afterLoginRoute'];

  //   return redirect(afterLoginRouteObject);
  // }
  fetch({ store, redirect }) {
    const id = store.getters['defaultClusterId'];

    if ( id ) {
      redirect({ name: 'c-cluster', params: { cluster: id } });
    } else {
      redirect({
        name:   'c-cluster-product',
        params: {
          cluster: 'local',
          product: MANAGER
        }
      });
    }
  }
};
</script>
