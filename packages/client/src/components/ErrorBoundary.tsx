import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-[#0D0D0F] text-white">
          <div className="w-12 h-12 rounded-2xl bg-[#E0554E]/10 border border-[#E0554E]/30 flex items-center justify-center mb-4 text-[#E0554E]">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold mb-2">View Render Interrupted</h2>
          <p className="text-sm text-[#A3A3A8] max-w-md mb-6">
            A temporary component error occurred. The system protected your session and workspace state.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-[#E8672E] hover:bg-[#D4561E] text-white text-sm font-medium rounded-xl transition"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Component
            </button>
            <button
              onClick={this.handleGoHome}
              className="flex items-center gap-2 px-4 py-2 bg-[#17171A] hover:bg-[#202024] text-[#A3A3A8] hover:text-white border border-[#2A2A2E] text-sm font-medium rounded-xl transition"
            >
              <Home className="w-4 h-4" />
              Return Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
