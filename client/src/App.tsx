import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import MainLayout from "@/components/layout/main-layout";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Documents from "@/pages/documents";
import DocumentDetail from "@/pages/document/[id]";
import Properties from "@/pages/properties";
import Notifications from "@/pages/notifications";
import Settings from "@/pages/settings";

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/documentos" component={Documents} />
        <Route path="/documento/:id" component={DocumentDetail} />
        <Route path="/propriedades" component={Properties} />
        <Route path="/notificacoes" component={Notifications} />
        <Route path="/configuracoes" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
