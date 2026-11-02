import React from 'react';

/**
 * Global Error Boundary to prevent full unmount on component render exceptions.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-dark text-white min-vh-100 d-flex align-items-center justify-content-center p-4">
          <div className="card bg-secondary text-white border-warning p-4 text-center" style={{ maxWidth: '500px' }}>
            <h4 className="text-warning mb-3">Something went wrong</h4>
            <p className="text-light small mb-3">
              An unexpected error occurred while loading this view: {this.state.error?.message || 'Unknown error'}
            </p>
            <div className="d-flex justify-content-center gap-2">
              <button
                className="btn btn-warning mr-2"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </button>
              <a href="/patient" className="btn btn-outline-light">
                Return to Dashboard
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
