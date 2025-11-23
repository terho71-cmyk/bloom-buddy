import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Bell, Building2, MapPin, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type CompanyType = "startup" | "project" | "other";

interface CompanyAlert {
  id: string;
  name: string;
  type: CompanyType;
  email: string;
  website?: string;
  description?: string;
  centerLat: number;
  centerLon: number;
  radiusKm: number;
}

const initialCompanies: CompanyAlert[] = [
  {
    id: "1",
    name: "Origin by Ocean",
    type: "startup",
    email: "info@originbyocean.example",
    website: "https://example.com/originbyocean",
    description: "Finnish biotech startup turning harvested seaweeds (including invasive sargassum / brown algae) into biorefinery feedstock (alginate, fucoidan and other algae-derived ingredients for food, cosmetics and materials). Building a commercial biorefinery in Kokkola with algae as primary raw material.",
    centerLat: 63.8372,
    centerLon: 23.1311,
    radiusKm: 80,
  },
  {
    id: "2",
    name: "Algonomi",
    type: "startup",
    email: "info@algonomi.example",
    website: "https://example.com/algonomi",
    description: "Spinout from University of Helsinki cultivating microalgae using industrial effluents and carbon streams. Produces microalgal biomass for food, feed and other applications – algae as the first material in the chain.",
    centerLat: 60.1695,
    centerLon: 24.9354,
    radiusKm: 80,
  },
  {
    id: "3",
    name: "Redono Oy",
    type: "startup",
    email: "info@redono.example",
    website: "https://example.com/redono",
    description: "Finnish circular-bio startup in Lohja developing microalgae cultivation systems that use industrial side streams and CO₂. Offers microalgae production as part of future farming and circular raw-material solutions.",
    centerLat: 60.2484,
    centerLon: 24.0653,
    radiusKm: 80,
  },
  {
    id: "4",
    name: "AlgaCircle",
    type: "project",
    email: "info@algacircle.example",
    website: "https://example.com/algacircle",
    description: "University of Turku–led project and industry consortium (funded by Business Finland) aiming to produce food, feed and agrochemicals from microalgae, with several industry partners involved.",
    centerLat: 60.4518,
    centerLon: 22.2666,
    radiusKm: 80,
  },
];

export function CompanyAlertsSection() {
  const [companyAlerts, setCompanyAlerts] = useState<CompanyAlert[]>(initialCompanies);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    website: "",
    description: "",
    centerLat: 60.17,
    centerLon: 24.95,
    radiusKm: 80,
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name.trim() || !formData.email.trim()) {
      toast({
        title: "Validation error",
        description: "Company name and email are required.",
        variant: "destructive",
      });
      return;
    }

    // TODO: send this to backend API for real alert handling
    const newAlert: CompanyAlert = {
      id: Date.now().toString(),
      name: formData.name,
      type: "other",
      email: formData.email,
      website: formData.website || undefined,
      description: formData.description || undefined,
      centerLat: formData.centerLat,
      centerLon: formData.centerLon,
      radiusKm: formData.radiusKm,
    };

    setCompanyAlerts([...companyAlerts, newAlert]);

    // Clear form
    setFormData({
      name: "",
      email: "",
      website: "",
      description: "",
      centerLat: 60.17,
      centerLon: 24.95,
      radiusKm: 80,
    });

    toast({
      title: "Success!",
      description: "Your alert preference has been saved (prototype mode – no real notifications yet).",
    });
  };

  const typeColors: Record<CompanyType, string> = {
    startup: "bg-accent/20 text-accent-foreground border-accent/40",
    project: "bg-primary/20 text-primary-foreground border-primary/40",
    other: "bg-secondary text-secondary-foreground border-secondary",
  };

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Bell className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-heading font-bold">Company alerts: get notified when algae appears</h2>
        </div>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Companies working with algae cleanup or algae-based products can sign up here to be notified when there are
          cyanobacteria blooms or algae to be harvested in their preferred region.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* Signup Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Sign up for alerts
            </CardTitle>
            <CardDescription>Enter your company details and preferred notification area</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Company name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your company name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Contact email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@yourcompany.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website (optional)</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://yourcompany.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Short description (optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of your company and algae-related activities"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lat">Alert center latitude</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="0.0001"
                    value={formData.centerLat}
                    onChange={(e) => setFormData({ ...formData, centerLat: parseFloat(e.target.value) })}
                    placeholder="60.17"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lon">Alert center longitude</Label>
                  <Input
                    id="lon"
                    type="number"
                    step="0.0001"
                    value={formData.centerLon}
                    onChange={(e) => setFormData({ ...formData, centerLon: parseFloat(e.target.value) })}
                    placeholder="24.95"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="radius">Notification radius: {formData.radiusKm} km</Label>
                <Slider
                  id="radius"
                  value={[formData.radiusKm]}
                  onValueChange={([value]) => setFormData({ ...formData, radiusKm: value })}
                  min={10}
                  max={200}
                  step={10}
                  className="py-4"
                />
                <p className="text-xs text-muted-foreground">
                  Adjust the radius around your chosen location (10–200 km)
                </p>
              </div>

              <div className="flex items-start gap-2 p-3 bg-accent/10 rounded-md border border-accent/20">
                <Bell className="h-5 w-5 text-accent mt-0.5" />
                <p className="text-sm">
                  <strong>Alert preference:</strong> We want to be notified when there is algae to be picked up in this
                  area.
                </p>
              </div>

              <Button type="submit" className="w-full">
                Save alert preference
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Map Preview Placeholder */}
        <Card className="flex items-center justify-center bg-muted/30">
          <CardContent className="text-center py-12">
            <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Alert center: {formData.centerLat.toFixed(4)}, {formData.centerLon.toFixed(4)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">Radius: {formData.radiusKm} km</p>
            <p className="text-xs text-muted-foreground mt-4 max-w-xs mx-auto">
              Interactive map picker coming soon – for now, enter coordinates manually
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Company List */}
      <Card>
        <CardHeader>
          <CardTitle>Companies currently signed up for alerts (prototype data)</CardTitle>
          <CardDescription>
            {companyAlerts.length} {companyAlerts.length === 1 ? "company" : "companies"} registered for algae bloom
            notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {companyAlerts.map((company) => (
              <Card key={company.id} className="border-l-4 border-l-accent/50">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2 mb-2">
                        {company.name}
                        <Badge variant="outline" className={typeColors[company.type]}>
                          {company.type}
                        </Badge>
                      </CardTitle>
                      {company.website && (
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          Visit website
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {company.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{company.description}</p>
                  )}
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-accent" />
                      <span className="font-medium">Alert region:</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">
                      Center: {company.centerLat.toFixed(4)}, {company.centerLon.toFixed(4)}
                    </p>
                    <p className="text-sm text-muted-foreground ml-6">Radius: {company.radiusKm} km</p>
                    <p className="text-xs text-muted-foreground ml-6 mt-1 italic">
                      Wants to be notified when algae is available to be picked up in this radius.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
