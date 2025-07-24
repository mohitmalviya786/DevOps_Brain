import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import InfrastructureDesign from "@/pages/InfrastructureDesign";
import Resources from "@/pages/Resources";
import Costs from "@/pages/Costs";
import Applications from "@/pages/Applications";
import Pipelines from "@/pages/Pipelines";
import Containers from "@/pages/Containers";
import Monitoring from "@/pages/Monitoring";
import Logs from "@/pages/Logs";
import Security from "@/pages/Security";
import Teams from "@/pages/Teams";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/infrastructure/:projectId?" component={InfrastructureDesign} />
          <Route path="/resources" component={Resources} />
          <Route path="/costs" component={Costs} />
          <Route path="/applications" component={Applications} />
          <Route path="/pipelines" component={Pipelines} />
          <Route path="/containers" component={Containers} />
          <Route path="/monitoring" component={Monitoring} />
          <Route path="/logs" component={Logs} />
          <Route path="/security" component={Security} />
          <Route path="/teams" component={Teams} />
          <Route path="/settings" component={Settings} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
