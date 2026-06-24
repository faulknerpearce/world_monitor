import { useI18n } from '@context/I18nContext'

const ALL_LAYER_KEYS = [
  'hotspots', 'intelHotspots', 'shippingChokepoints', 'conflictZones',
  'militaryBases', 'nuclearFacilities', 'underseaCables', 'cyberRegions', 'usCities',
  'emergingHotspots'
]

const PRESETS = [
  {
    id: 'intel',
    icon: <span className="w-1.5 h-1.5 rounded-full bg-accent" />,
    activeClass: 'bg-[rgba(99,179,237,0.15)] text-accent',
    activePredicate: (v) => !v.shippingChokepoints && !v.conflictZones && !v.militaryBases,
    layers: { intelHotspots: true }
  },
  {
    id: 'conflict',
    icon: <span className="w-1.5 h-1.5 rounded-full bg-red-500" />,
    activeClass: 'bg-[rgba(239,68,68,0.15)] text-red-500',
    activePredicate: (v) => v.conflictZones && v.intelHotspots,
    layers: { hotspots: true, intelHotspots: true, conflictZones: true }
  },
  {
    id: 'trade',
    icon: <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />,
    activeClass: 'bg-[rgba(245,158,11,0.15)] text-amber-500',
    activePredicate: (v) => v.shippingChokepoints && v.underseaCables,
    layers: { shippingChokepoints: true, underseaCables: true }
  },
  {
    id: 'defense',
    icon: <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />,
    activeClass: 'bg-[rgba(16,185,129,0.15)] text-emerald-500',
    activePredicate: (v) => v.militaryBases && v.nuclearFacilities,
    layers: { intelHotspots: true, conflictZones: true, militaryBases: true, nuclearFacilities: true }
  }
]

const GLOBAL_LAYER_BUTTONS = [
  { id: 'intelHotspots', label: 'map.intel', activeBg: 'bg-panel-item-hover text-accent shadow-[inset_0_0_0_1px_rgba(99,179,237,0.3)]' },
  { id: 'hotspots', label: 'map.watch', activeBg: 'bg-panel-item-hover text-accent shadow-[inset_0_0_0_1px_rgba(99,179,237,0.3)]' },
  { id: 'emergingHotspots', label: 'map.emerging', activeBg: 'bg-[rgba(255,107,53,0.1)] text-[#ff6b35] shadow-[inset_0_0_0_1px_rgba(255,107,53,0.3)]' },
  { id: 'conflictZones', label: 'map.conflict', activeBg: 'bg-[rgba(239,68,68,0.1)] text-red-500 shadow-[inset_0_0_0_1px_rgba(239,68,68,0.3)]' },
  { id: 'shippingChokepoints', label: 'map.shipping', activeBg: 'bg-[rgba(245,158,11,0.1)] text-amber-500 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.3)]' },
  { id: 'militaryBases', label: 'map.military', activeBg: 'bg-[rgba(16,185,129,0.1)] text-emerald-500 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.3)]' },
  { id: 'nuclearFacilities', label: 'map.nuclear', activeBg: 'bg-[rgba(168,85,247,0.1)] text-purple-500 shadow-[inset_0_0_0_1px_rgba(168,85,247,0.3)]' },
  { id: 'underseaCables', label: 'map.infra', activeBg: 'bg-[rgba(56,189,248,0.1)] text-sky-500 shadow-[inset_0_0_0_1px_rgba(56,189,248,0.3)]' },
  { id: 'cyberRegions', label: 'map.cyber', activeBg: 'bg-[rgba(236,72,153,0.1)] text-pink-500 shadow-[inset_0_0_0_1px_rgba(236,72,153,0.3)]' },
]

const US_LAYER_BUTTONS = [
  { id: 'intelHotspots', label: 'map.intel', colorClass: 'text-accent', activeBg: 'bg-panel-item-hover text-accent shadow-[inset_0_0_0_1px_rgba(99,179,237,0.3)]' },
  { id: 'hotspots', label: 'map.watch', colorClass: 'text-accent', activeBg: 'bg-panel-item-hover text-accent shadow-[inset_0_0_0_1px_rgba(99,179,237,0.3)]' },
  { id: 'usCities', label: 'map.cities', colorClass: 'text-accent', activeBg: 'bg-panel-item-hover text-accent shadow-[inset_0_0_0_1px_rgba(99,179,237,0.3)]' },
]

const applyPreset = (setLayerVisibility, enabledKeys) => {
  const reset = Object.fromEntries(ALL_LAYER_KEYS.map(k => [k, false]))
  const enabled = Object.fromEntries(enabledKeys.map(k => [k, true]))
  setLayerVisibility(prev => ({ ...prev, ...reset, ...enabled }))
}

const MapLayerControls = ({ layerVisibility, toggleLayer, setLayerVisibility, mapView }) => {
  const { t } = useI18n()
  const layerButtons = mapView === 'us' ? US_LAYER_BUTTONS : GLOBAL_LAYER_BUTTONS

  return (
    <div className="absolute top-4 z-10 flex flex-col gap-3 left-4 max-[1000px]:top-20 max-[768px]:hidden bg-[rgba(10,14,20,0.85)] backdrop-blur-md rounded-xl border border-border-main p-2 shadow-lg w-[180px]">
      <div className="flex flex-col gap-1 border-b border-border-main pb-2 mb-1">
        <span className="text-[0.6rem] font-bold tracking-widest text-text-dim px-2 pb-1 mb-1 block">PRESETS</span>
        {PRESETS.map(preset => (
          <button
            key={preset.id}
            className={`py-1.5 px-3 rounded-lg text-left text-xs font-semibold transition-all duration-200 flex items-center gap-2 ${preset.activePredicate(layerVisibility) ? preset.activeClass : 'text-text-secondary hover:bg-[rgba(255,255,255,0.05)]'}`}
            onClick={() => applyPreset(setLayerVisibility, Object.keys(preset.layers))}
          >
            {preset.icon} {t(`map.preset${preset.id.charAt(0).toUpperCase() + preset.id.slice(1)}`)}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[0.6rem] font-bold tracking-widest text-text-dim px-2 pt-1 pb-1 mb-1 block">LAYERS</span>
        <div className="grid grid-cols-2 gap-1">
          {layerButtons.map(btn => (
            <button
              key={btn.id}
              className={`py-1.5 px-1 rounded-md text-[0.55rem] font-bold tracking-wide transition-all duration-200 flex items-center justify-center text-center ${layerVisibility[btn.id] ? btn.activeBg : 'bg-transparent text-text-secondary hover:bg-[rgba(255,255,255,0.05)]'}`}
              onClick={() => toggleLayer(btn.id)}
            >
              {t(btn.label)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MapLayerControls
