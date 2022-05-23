import '../styles/globals.css';
import { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  console.log('sdkjfhi')
  return <Component {...pageProps} />;
}

export default MyApp;
