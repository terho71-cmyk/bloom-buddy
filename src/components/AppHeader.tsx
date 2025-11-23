import { Waves, Building2 } from "lucide-react";
import { NavLink } from "@/components/NavLink";

export function AppHeader() {
  return (
    <header className="bg-gradient-ocean text-primary-foreground py-8 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Waves className="h-8 w-8" />
              <h1 className="text-4xl font-heading font-bold">BloomAlert</h1>
            </div>
            <p className="text-lg opacity-90">
              Cyanobacteria alerts for beaches and blue-economy startups
            </p>
          </div>
          <div className="flex gap-2">
            <NavLink 
              to="/cyano-map" 
              className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-md transition-colors"
              activeClassName="bg-primary-foreground/30 font-semibold"
            >
              <Waves className="h-5 w-5" />
              <span>Map</span>
            </NavLink>
            <NavLink 
              to="/startups" 
              className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-md transition-colors"
              activeClassName="bg-primary-foreground/30 font-semibold"
            >
              <Building2 className="h-5 w-5" />
              <span>Startups</span>
            </NavLink>
            <NavLink 
              to="/investors" 
              className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-md transition-colors"
              activeClassName="bg-primary-foreground/30 font-semibold"
            >
              <Building2 className="h-5 w-5" />
              <span>Investors</span>
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  );
}
