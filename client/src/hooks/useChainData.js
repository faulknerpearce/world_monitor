import { useState, useEffect, useContext } from 'react'
import { fetchWithProxy } from '@utils/fetchUtils'
import { API } from '@config/api'
import { RefreshContext } from '@context/RefreshContext'

const EMPTY_DATA = {
  btcHashrate: '—',
  ethGas: '—',
  defiTvl: '—',
  nftVolume: '—',
}

const fetchBtcHashrate = async () => {
  const res = await fetchWithProxy(API.btcLatestBlock)
  const data = JSON.parse(res)
  const hashrate = data.data?.extras?.avg_hashrate
  return hashrate ? `${(hashrate / 1e18).toFixed(1)} EH/s` : null
}

const fetchEthGas = async () => {
  const res = await fetchWithProxy(API.ethGasOracle)
  const data = JSON.parse(res)
  return data.result?.ProposeGasPrice ? `${data.result.ProposeGasPrice} gwei` : null
}

const fetchDefiTvl = async () => {
  const res = await fetchWithProxy(API.defiLlamaTvl)
  const data = JSON.parse(res)
  const totalTvl = Object.values(data).reduce((sum, val) => sum + val, 0)
  return `$${(totalTvl / 1e9).toFixed(1)}B`
}

/**
 * Polls BTC hashrate, ETH gas, and DeFi TVL in parallel. Each endpoint is
 * independent — any single failure is logged and that field is left at its
 * last known value (or the empty placeholder on first load).
 *
 * @param {number} interval - Polling interval in ms
 * @returns {{ btcHashrate: string, ethGas: string, defiTvl: string, nftVolume: string, loading: boolean }}
 */
export const useChainData = (interval = 2 * 60 * 1000) => {
  const [data, setData] = useState(EMPTY_DATA)
  const [loading, setLoading] = useState(true)
  const { refreshKey } = useContext(RefreshContext)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      const [btcResult, ethResult, defiResult] = await Promise.allSettled([
        fetchBtcHashrate(),
        fetchEthGas(),
        fetchDefiTvl(),
      ])

      if (cancelled) return

      setData(prev => ({
        btcHashrate: btcResult.status === 'fulfilled' && btcResult.value ? btcResult.value : prev.btcHashrate,
        ethGas: ethResult.status === 'fulfilled' && ethResult.value ? ethResult.value : prev.ethGas,
        defiTvl: defiResult.status === 'fulfilled' && defiResult.value ? defiResult.value : prev.defiTvl,
        nftVolume: prev.nftVolume,
      }))
      setLoading(false)
    }

    load()
    const timer = setInterval(load, interval)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [interval, refreshKey])

  return { ...data, loading }
}
