import { Component } from 'react'
import { useI18n } from '@context/I18nContext'
import './ErrorBoundary.css'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    const { t } = this.props
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-icon">⚠️</div>
          <div className="error-boundary-title">{t('errorBoundary.title')}</div>
          <div className="error-boundary-message">
            {this.state.error?.message || t('errorBoundary.message')}
          </div>
          <button 
            className="error-boundary-retry"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            {t('errorBoundary.retry')}
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

const ErrorBoundaryWrapper = (props) => {
  const { t } = useI18n()
  return <ErrorBoundary {...props} t={t} />
}

export default ErrorBoundaryWrapper
