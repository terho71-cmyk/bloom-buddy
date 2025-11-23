import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Startups from "./pages/Startups";
import Investors from "./pages/Investors";
import SolutionGaps from "./pages/SolutionGaps";
import Clusters from "./pages/Clusters";
import CyanoMap from "./pages/CyanoMap";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/startups" element={<Startups />} />
          <Route path="/investors" element={<Investors />} />
          <Route path="/solution-gaps" element={<SolutionGaps />} />
          <Route path="/clusters" element={<Clusters />} />
          <Route path="/cyano-map" element={<CyanoMap />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
