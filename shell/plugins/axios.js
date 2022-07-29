import https from 'https';
import { CSRF } from '@shell/config/cookies';

export default function({
  $axios, $cookies, isDev, req
}) {
  $axios.defaults.headers.common['Accept'] = 'application/json';
  $axios.defaults.withCredentials = true;

  $axios.onRequest((config) => {
    const csrf = $cookies.get(CSRF, { parseJSON: false });

    if ( csrf ) {
      config.headers['x-api-csrf'] = csrf;
    }
    if ( config.url.startsWith('/') ) {
      config.baseURL = `${ getBasePath() }`;
    }
  });

  if ( isDev ) {
    // https://github.com/nuxt-community/axios-module/blob/dev/lib/module.js#L78
    // forces localhost to http, for no obvious reason.
    // But we never have any reason to talk to anything plaintext.
    if ( $axios.defaults.baseURL.startsWith('http://') ) {
      $axios.defaults.baseURL = $axios.defaults.baseURL.replace(/^http:/, 'https:');
    }

    const insecureAgent = new https.Agent({ rejectUnauthorized: false });

    $axios.defaults.httpsAgent = insecureAgent;
    $axios.httpsAgent = insecureAgent;
  }
}

function getBasePath() {
  if (window.__basePath__) {
    return window.__basePath__;
  }
  const baseUrl = document.querySelector('head > base').href;
  const basePath = `${ baseUrl.slice(0, -('/dashboard/'.length - 1)).replace(window.location.origin, '') }`;

  window.__basePath__ = basePath;

  return window.__basePath__;
}
