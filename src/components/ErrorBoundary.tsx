import { Component, type ErrorInfo, type ReactNode } from "react";
import { TriangleAlert } from "lucide-react";
import { EmptyState } from "./ui/empty-state";
import { Button } from "./ui/button";

export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  override state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("UI crashed:", error, info.componentStack);
  }

  override render() {
    if (!this.state.error) return this.props.children;
    return (
      <EmptyState
        className="h-full"
        icon={TriangleAlert}
        title="Something went wrong"
        description="An unexpected error occurred. Reloading the page usually fixes it."
        action={<Button onClick={() => window.location.reload()}>Reload page</Button>}
      />
    );
  }
}
