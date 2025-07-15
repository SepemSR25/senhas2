import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Tv, Plus, Settings } from "lucide-react";
import NotFound from "@/pages/not-found";
import TVDisplay from "@/pages/tv-display";
import PasswordGenerator from "@/pages/password-generator";
import ProfessionalDashboard from "@/pages/professional-dashboard";

function Navigation() {
  return (
    <nav className="bg-green-800 shadow-sm border-b border-green-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <img 
              src="/attached_assets/LOGO_SEPEM-removebg-fundobranco_1752589411920.png" 
              alt="Logo SEPEM" 
              className="h-10 w-10 rounded-full bg-white p-1"
            />
            <h1 className="text-xl font-semibold text-white">Sistema de Senhas SEPEM</h1>
          </div>
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm" asChild className="text-white hover:bg-green-700 hover:text-white">
              <a href="/tv">
                <Tv className="mr-2 h-4 w-4" />
                TV Display
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild className="text-white hover:bg-green-700 hover:text-white">
              <a href="/generator">
                <Plus className="mr-2 h-4 w-4" />
                Gerar Senha
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild className="text-white hover:bg-green-700 hover:text-white">
              <a href="/dashboard">
                <Settings className="mr-2 h-4 w-4" />
                Painel Profissional
              </a>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/tv" component={TVDisplay} />
      <Route path="/generator" component={PasswordGenerator} />
      <Route path="/dashboard" component={ProfessionalDashboard} />
      <Route path="/" component={PasswordGenerator} />
      <Route component={NotFound} />
    </Switch>
  );
}

function Footer() {
  return (
    <footer className="bg-green-800 text-white py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-medium">
            ⚡ DESENVOLVIDO POR SAULO RODRIGO REG. 36.364-8 - 2025
          </p>
        </div>
      </div>
    </footer>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navigation />
          <div className="flex-1">
            <Router />
          </div>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
