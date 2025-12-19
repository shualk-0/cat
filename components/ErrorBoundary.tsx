import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fefaf6] flex items-center justify-center p-8">
          <div className="bg-white rounded-[3rem] p-12 shadow-2xl max-w-2xl w-full border border-orange-50">
            <h1 className="text-4xl font-black text-gray-800 mb-4">出现错误</h1>
            <p className="text-gray-600 mb-6">
              应用遇到了一个问题。请刷新页面重试。
            </p>
            {this.state.error && (
              <details className="mb-6">
                <summary className="cursor-pointer text-sm text-gray-500 mb-2">错误详情</summary>
                <pre className="bg-gray-50 p-4 rounded-2xl text-xs overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-lg hover:bg-orange-600 transition-all"
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

