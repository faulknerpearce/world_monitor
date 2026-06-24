import { useI18n } from '@context/I18nContext'

/**
 * Right-side map controls sidebar.
 * Handles region (global/US), projection (3D/flat), zoom, and auto-rotation.
 */
const MapViewControls = ({
  mapView,
  setMapView,
  projectionMode,
  onProjectionModeChange,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  isAutoRotating,
  setIsAutoRotating,
}) => {
  const { t } = useI18n()

  return (
    <div className="absolute top-4 z-10 flex flex-col gap-2 right-4 max-[1000px]:top-20 max-[768px]:top-auto max-[768px]:bottom-[50px] max-[768px]:left-1/2 max-[768px]:-translate-x-1/2 max-[768px]:right-auto max-[768px]:w-[95%] max-[768px]:max-w-[400px] bg-[rgba(10,14,20,0.85)] backdrop-blur-md rounded-xl border border-border-main p-1.5 shadow-lg">
      <div className="flex flex-col gap-2 max-[768px]:flex-col max-[768px]:gap-1.5">
        {/* Region + Projection Row */}
        <div className="flex flex-col gap-2 max-[768px]:flex-row max-[768px]:justify-between max-[768px]:gap-1 border-b border-border-main pb-1.5">
          {/* Region Toggle */}
          <div className="flex flex-col gap-1 max-[768px]:flex-row max-[768px]:w-1/2 max-[768px]:border-r max-[768px]:border-border-main max-[768px]:pr-1">
            <button
              className={`py-2 px-3 text-xs font-bold tracking-[1px] rounded-lg transition-all duration-200 text-left max-[768px]:w-1/2 max-[768px]:text-[0.6rem] max-[768px]:py-1.5 max-[768px]:px-1 max-[768px]:text-center ${mapView === 'global' ? 'bg-accent text-bg-dark' : 'text-text-secondary hover:bg-[rgba(99,179,237,0.1)] hover:text-accent'}`}
              onClick={() => setMapView('global')}
            >
              {t('map.global')}
            </button>
            <button
              className={`py-2 px-3 text-xs font-bold tracking-[1px] rounded-lg transition-all duration-200 text-left max-[768px]:w-1/2 max-[768px]:text-[0.6rem] max-[768px]:py-1.5 max-[768px]:px-1 max-[768px]:text-center ${mapView === 'us' ? 'bg-accent text-bg-dark' : 'text-text-secondary hover:bg-[rgba(99,179,237,0.1)] hover:text-accent'}`}
              onClick={() => setMapView('us')}
            >
              {t('map.us')}
            </button>
          </div>

          {/* Projection Controls */}
          <div className="flex flex-col gap-1 max-[768px]:flex-row max-[768px]:w-1/2 max-[768px]:pl-1">
            <button
              className={`py-1.5 px-3 text-[0.65rem] font-bold tracking-[0.05em] rounded-lg transition-all duration-200 max-[768px]:w-1/2 max-[768px]:text-[0.55rem] max-[768px]:px-1 ${projectionMode === '3d' ? 'bg-accent text-bg-dark' : 'text-text-secondary hover:bg-[rgba(99,179,237,0.1)] hover:text-accent'}`}
              onClick={() => onProjectionModeChange('3d')}
            >
              {t('map.globe3D')}
            </button>
            <button
              className={`py-1.5 px-3 text-[0.65rem] font-bold tracking-[0.05em] rounded-lg transition-all duration-200 max-[768px]:w-1/2 max-[768px]:text-[0.55rem] max-[768px]:px-1 ${projectionMode === 'flat' ? 'bg-accent text-bg-dark' : 'text-text-secondary hover:bg-[rgba(99,179,237,0.1)] hover:text-accent'}`}
              onClick={() => onProjectionModeChange('flat')}
            >
              {t('map.flatMap')}
            </button>
          </div>
        </div>

        {/* Zoom + Rotation Row */}
        <div className="flex flex-col gap-2 max-[768px]:flex-row max-[768px]:justify-between max-[768px]:gap-1">
          {/* Zoom Controls */}
          <div className="flex flex-col gap-1 max-[768px]:flex-row max-[768px]:w-2/3 max-[768px]:items-center">
            <button
              className="w-full py-1.5 px-3 bg-transparent text-text-primary rounded-lg font-bold transition-all duration-200 hover:bg-[rgba(99,179,237,0.1)] hover:text-accent max-[768px]:w-auto max-[768px]:px-3 max-[768px]:bg-[rgba(255,255,255,0.05)]"
              onClick={onZoomIn}
              title={t('map.zoomIn')}
            >
              +
            </button>
            <div className="flex items-center justify-center py-1 text-[0.65rem] font-mono text-text-secondary max-[768px]:px-2 max-[768px]:w-10">
              {zoomLevel.toFixed(1)}x
            </div>
            <button
              className="w-full py-1.5 px-3 bg-transparent text-text-primary rounded-lg font-bold transition-all duration-200 hover:bg-[rgba(99,179,237,0.1)] hover:text-accent max-[768px]:w-auto max-[768px]:px-3 max-[768px]:bg-[rgba(255,255,255,0.05)]"
              onClick={onZoomOut}
              title={t('map.zoomOut')}
            >
              −
            </button>
            <button
              className="w-full py-1.5 bg-transparent text-text-primary rounded-lg text-xs font-bold transition-all duration-200 hover:bg-[rgba(99,179,237,0.1)] hover:text-accent max-[768px]:w-auto max-[768px]:px-3 max-[768px]:ml-auto max-[768px]:bg-[rgba(255,255,255,0.05)] max-[768px]:text-[0.6rem]"
              onClick={onZoomReset}
              title={t('map.reset')}
            >
              RST
            </button>
          </div>

          {/* Auto-rotation Toggle */}
          <div className="flex flex-col gap-1 max-[768px]:w-1/3">
            <button
              className={`py-1.5 px-3 text-[0.65rem] font-bold tracking-[0.05em] rounded-lg transition-all duration-200 border border-border-main max-[768px]:w-full max-[768px]:h-full max-[768px]:text-[0.6rem] ${isAutoRotating ? 'bg-emerald-500/15 text-[var(--emerald)] border-emerald-500/30' : 'text-text-secondary hover:bg-[rgba(255,255,255,0.05)]'}`}
              onClick={() => setIsAutoRotating(!isAutoRotating)}
            >
              {isAutoRotating ? t('map.rotating') : t('map.paused')}
            </button>
          </div>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="text-[0.55rem] text-text-dim tracking-[0.04em] text-center pt-1.5 border-t border-border-main/50">
          {t('map.keyboardHint')}
        </div>
      </div>
    </div>
  )
}

export default MapViewControls
