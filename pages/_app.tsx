import '../styles/globals.css';
import { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  console.log('sdfjhS')
  return <Component {...pageProps} />;
}

export default MyApp;
