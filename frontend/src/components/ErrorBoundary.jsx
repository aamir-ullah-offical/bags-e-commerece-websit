import { Component } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    const isDashboard = this.props.context === "dashboard";

    return (
      <div
        className={`flex items-center justify-center p-8 ${
          isDashboard ? "min-h-[400px]" : "min-h-screen bg-stone-50"
        }`}
      >
        <div className="max-w-sm w-full bg-white border border-stone-200 rounded-2xl p-8 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <h2 className="font-bold text-stone-900 text-base">Something went wrong</h2>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              {isDashboard
                ? "This section encountered an error. Try refreshing or switching to another tab."
                : "An unexpected error occurred. Please refresh the page."}
            </p>
          </div>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <pre className="text-left text-[10px] bg-stone-50 border border-stone-200 rounded-lg p-3 text-rose-600 overflow-auto max-h-32">
              {this.state.error.message}
            </pre>
          )}
          <div className="flex gap-2 justify-center">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }
}
