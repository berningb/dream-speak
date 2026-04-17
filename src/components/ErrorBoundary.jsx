import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, errorInfo)
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 pb-24 pt-16">
          <div className="card w-full max-w-md border border-base-300 bg-base-200/80 shadow-xl backdrop-blur-sm">
            <div className="card-body">
              <h1 className="card-title text-lg">Something went wrong</h1>
              <p className="text-sm text-base-content/70">
                The app hit an unexpected error. You can reload the page to try again.
              </p>
              {import.meta.env.DEV && this.state.error?.message && (
                <pre className="mt-2 max-h-32 overflow-auto rounded-lg bg-base-300/50 p-2 text-xs text-error">
                  {this.state.error.message}
                </pre>
              )}
              <div className="card-actions mt-4 justify-end">
                <button type="button" className="btn btn-primary btn-sm" onClick={this.handleReload}>
                  Reload page
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
