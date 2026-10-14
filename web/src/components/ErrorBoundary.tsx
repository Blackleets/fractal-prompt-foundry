import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(err: unknown): State {
    return {
      hasError: true,
      message: err instanceof Error ? err.message : "Unexpected error",
    };
  }

  componentDidCatch(err: unknown) {
    console.error("[foundry-error-boundary]", err);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-7xl p-6">
          <div className="panel-elevated p-6 text-center">
            <p className="font-display text-lg text-white">Algo se rompió en la foundry</p>
            <p className="mx-auto mt-2 max-w-xl font-mono text-xs text-[#8b89a3]">
              {this.state.message}
            </p>
            <button
              className="foundry-button mt-4 px-5 py-2.5 text-sm"
              onClick={() => window.location.reload()}
            >
              Recargar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
