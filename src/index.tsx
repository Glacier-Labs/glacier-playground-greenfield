import ReactDOM from 'react-dom/client'
import { ConfigProvider } from '@arco-design/web-react'
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react'
import enUS from '@arco-design/web-react/es/locale/en-US'

import 'prismjs/themes/prism-tomorrow.css'
import '@assets/styles/arco.css'
import '@assets/styles/global.scss'
import App from './pages/App'
import { StoreProvider } from '@libs/store'

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = 'b3a29d9e04da4e7daba4e4ad20e785f9'

const mainnet = {
  chainId: 1,
  name: 'Ethereum',
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: 'https://rpc.ankr.com/eth'
}

const bsc = {
  chainId: 56,
  name: 'BNB Smart Chain',
  currency: 'BNB',
  explorerUrl: 'https://bscscan.com/',
  rpcUrl: 'https://rpc.ankr.com/bsc'
}

const xlayer = {
  chainId: 196,
  name: 'xlayer-mainnet',
  currency: 'OKB',
  explorerUrl: 'https://www.oklink.com/xlayer',
  rpcUrl: 'https://xlayerrpc.okx.com'
}

// 3. Create your application's metadata object
const metadata = {
  name: document.title,
  description: document.title,
  url: window.location.origin,
  icons: [window.location.origin + '/favicon.svg']
}

// 4. Create Ethers config
const ethersConfig = defaultConfig({
  /*Required*/
  metadata,
  /*Optional*/
  enableEIP6963: true, // true by default
  enableInjected: true, // true by default
  enableCoinbase: true // true by default
})

// 5. Create a Web3Modal instance
createWeb3Modal({
  ethersConfig,
  chains: [bsc, xlayer, mainnet],
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  enableOnramp: true, // Optional - false as default
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
    '8a0ee50d1f22f6651afcae7eb4253e52a3310b90af5daef78a8c4929a9bb99d4',
    '971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709'
  ]
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <ConfigProvider locale={enUS}>
    <StoreProvider>
      <App />
    </StoreProvider>
  </ConfigProvider>
)
