import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import MainLayout from "./components/layout/main-layout";
import NotFound from "./pages/not-found";
import Dashboard from "./pages/dashboard";
import Documents from "./pages/documents";
import DocumentDetail from "./pages/document/[id]";
import DocumentUploadPage from "./pages/document/upload";
import Properties from "./pages/properties";
import Notifications from "./pages/notifications";
import Settings from "./pages/settings";
import ProcessControl from "./pages/process-control";
import LoginPage from "./pages/login";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./components/auth/protected-route";
import { queryClient } from "./lib/queryClient";
import { VerificationDialog } from "./components/verification-dialog"; // Added import
import { useState, useEffect } from "react"; // Added import


function ProtectedRouter() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <Switch>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/documentos" component={Documents} />
          <Route path="/documento/:id" component={DocumentDetail} />
          <Route path="/documento/upload" component={DocumentUploadPage} />
          <Route path="/propriedades" component={Properties} />
          <Route path="/notificacoes" component={Notifications} />
          <Route path="/configuracoes" component={Settings} />
          <Route path="/controle-processos" component={ProcessControl} />
          <Route path="/">
            <Redirect to="/dashboard" />
          </Route>
          <Route component={NotFound} />
        </Switch>
      </MainLayout>
    </ProtectedRoute>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/:rest*">
        <ProtectedRouter />
      </Route>
    </Switch>
  );
}

function App() {
  const [verificationOpen, setVerificationOpen] = useState(false);

  useEffect(() => {
    const handler = () => setVerificationOpen(true);
    window.addEventListener('open-verification', handler);
    return () => window.removeEventListener('open-verification', handler);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <VerificationDialog open={verificationOpen} onOpenChange={setVerificationOpen} /> {/* Added VerificationDialog */}
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;