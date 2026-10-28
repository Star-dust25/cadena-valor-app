import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
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
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-2xl bg-[#0D1322] border border-red-500/30 text-[#F2F5F8] flex flex-col items-center justify-center text-center space-y-4 my-4 shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {this.props.fallbackTitle || 'Ocurrió un error al cargar este módulo'}
            </h3>
            <p className="text-xs text-[#8FA0B5] mt-1 max-w-md font-mono">
              {this.state.error?.message || 'Error inesperado de renderizado'}
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 rounded-lg bg-[#1B2436] hover:bg-[#2C374B] text-white border border-[#2C374B] text-xs font-semibold flex items-center gap-2 transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#387BFF]" />
            <span>Reintentar</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
