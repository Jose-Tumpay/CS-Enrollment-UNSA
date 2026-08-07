import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch, Router as WouterRouter, useLocation } from "wouter";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Layout } from "./components/Layout";
import { Onboarding } from "./pages/Onboarding";
import { Malla } from "./pages/Malla";
import { Dashboard } from "./pages/Dashboard";
import { Simulador } from "./pages/Simulador";
import { Progreso } from "./pages/Progreso";
import { Comparador } from "./pages/Comparador";
import { Ayuda } from "./pages/Ayuda";
import { StudentProvider, useStudentContext } from "./context/StudentContext";

const queryClient = new QueryClient();

function AppRouter() {
  const { profile, isLoaded } = useStudentContext();
  const [location] = useLocation();

  if (!isLoaded) return <div className="min-h-screen w-full bg-background" />;

  // Help page is always accessible, even without a profile
  if (location === "/ayuda") {
    if (!profile) {
      return <Ayuda />;
    }
    return (
      <Layout>
        <Ayuda />
      </Layout>
    );
  }

  // If no profile, force onboarding
  if (!profile && location !== "/") {
    return <Onboarding />;
  }

  // If profile exists and we're on root, go to dashboard
  if (profile && location === "/") {
    return (
      <Layout>
        <Dashboard />
      </Layout>
    );
  }

  if (!profile) {
    return <Onboarding />;
  }

  return (
    <Layout>
      <Switch>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/malla" component={Malla} />
        <Route path="/simulador" component={Simulador} />
        <Route path="/progreso" component={Progreso} />
        <Route path="/comparador" component={Comparador} />
        <Route path="/ayuda" component={Ayuda} />
        {/* Fallback to dashboard */}
        <Route component={Dashboard} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <StudentProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Analytics />
            <SpeedInsights />
            <AppRouter />
          </WouterRouter>
        </StudentProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
