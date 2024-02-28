import React, { useEffect, FC } from 'react';
// Modules
import { AppProps } from 'next/app';
import { wrapper } from 'app/redux/store/store';
// MUI Core
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/core/styles';
// Utils
import theme from '@layout/theme';
import '@styles/app.scss';
import Router from 'next/router';
import NProgress from 'nprogress'; //nprogress module
import Loader from '@module/loader';
import AlertNotification from '@module/alert';
import HeadMetaTags from '@module/headMetaTags';
import { windowRef } from '@util/window';
//Binding events. 
NProgress.configure({ showSpinner: false });
Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

const WrappedApp: FC<AppProps> = ({ Component, pageProps }: any) => {
  useEffect(() => {
    // console.log(pageProps);
    if (pageProps?.storeData) {
      // updateManifestFile(pageProps.storeData);
    }
  }, [pageProps]);

  // enable pwa
  // useEffect(() => {
  //   if (windowRef) {
  //     //Track from where your web app has been opened/browsed
  //     window.addEventListener("load", () => {
  //       window.navigator.serviceWorker
  //         .register("/service-worker.js")
  //         .then(() => {
  //           console.log("Service worker registered");
  //         })
  //         .catch((err) => {
  //           console.log("Service worker registration failed", err);
  //         });
  //     });
  //   }
  // }, [windowRef])
  // enable pwa


  return (
    <ThemeProvider theme={theme}>
      <HeadMetaTags {...pageProps.metaTags} storeData={pageProps.storeData} />
      <CssBaseline />
      <Loader />
      <AlertNotification />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default wrapper.withRedux(WrappedApp);

export function reportWebVitals(metric) {
  // console.log('Largest Contentful Paint', metric)
}