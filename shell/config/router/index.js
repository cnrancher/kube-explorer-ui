import Vue from 'vue';
import Router from 'vue-router';
import Routes from '@shell/config/router/routes';
import { installNavigationGuards } from '@shell/config/router/navigation-guards';

Vue.use(Router);

function getBasePath() {
  return decodeURI(document.querySelector('head > base').href.replace(window.location.origin, ''));
}

export const routerOptions = {
  mode:     'history',
  // Note: router base comes from the ROUTER_BASE env var
  // base:     process.env.routerBase || '/',
  base:     getBasePath(),
  routes:   Routes,
  fallback: false
};

export function extendRouter(config, context) {
  const base = (config._app && config._app.basePath) || routerOptions.base;
  const router = new Router({ ...routerOptions, base });

  installNavigationGuards(router, context);

  return router;
}
