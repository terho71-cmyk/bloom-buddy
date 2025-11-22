import { useState } from 'react';
import { LocationPickerMap } from '@/components/LocationPickerMap';
import { BulletinCard } from '@/components/BulletinCard';
import { NavLink } from '@/components/NavLink';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Droplets, Waves, Building2, Radar, Users } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Index() {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [timeWindow, setTimeWindow] = useState<string>("5");
  const [showAnalysis, setShowAnalysis] = useState(false);
  const { toast } = useToast();

  const handleGenerateAnalysis = () => {
    if (!selectedLocation) {
      toast({
        title: "No location selected",
        description: "Please click on the map to select a location first.",
        variant: "destructive",
      });
      return;
    }

    setShowAnalysis(true);
    toast({
      title: "Analysis Generated",
      description: "Mock analysis created with your selected parameters.",
    });
  };

  const handleReset = () => {
    setShowAnalysis(false);
    setSelectedLocation(null);
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header */}
      <header className="bg-gradient-ocean text-primary-foreground py-8 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Waves className="h-8 w-8" />
                <h1 className="text-4xl font-heading font-bold">BlueBloom</h1>
              </div>
              <p className="text-lg opacity-90">
                Cyanobacteria by time & place
              </p>
            </div>
            <div className="flex gap-2">
              <NavLink 
                to="/startups" 
                className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-md transition-colors"
              >
                <Building2 className="h-5 w-5" />
                <span>Startups</span>
              </NavLink>
              <NavLink 
                to="/investors" 
                className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-md transition-colors"
              >
                <Building2 className="h-5 w-5" />
                <span>Investors</span>
              </NavLink>
              <NavLink 
                to="/solution-gaps" 
                className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-md transition-colors"
              >
                <Radar className="h-5 w-5" />
                <span>Gaps</span>
              </NavLink>
              <NavLink 
                to="/clusters" 
                className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-md transition-colors"
              >
                <Users className="h-5 w-5" />
                <span>Clusters</span>
              </NavLink>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold">Pick a location on the map and a time window</h2>
            <p className="text-muted-foreground">
              We'll later connect this to real cyanobacteria data from SYKE.
            </p>
          </div>

          {!showAnalysis ? (
            <div className="space-y-6">
              {/* Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-primary" />
                    Analysis Parameters
                  </CardTitle>
                  <CardDescription>
                    Select your location on the map and choose a time window
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Time Window</label>
                    <Select value={timeWindow} onValueChange={setTimeWindow}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time window" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">Last 3 days</SelectItem>
                        <SelectItem value="5">Last 5 days</SelectItem>
                        <SelectItem value="7">Last 7 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedLocation && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-1">Current Selection:</p>
                      <p className="text-sm text-muted-foreground">
                        Location: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lon.toFixed(4)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Time window: Last {timeWindow} days
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleGenerateAnalysis}
                    className="w-full"
                    size="lg"
                  >
                    Generate Analysis
                  </Button>
                </CardContent>
              </Card>

              {/* Map */}
              <LocationPickerMap onLocationChange={setSelectedLocation} />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Analysis Results</h2>
                <Button onClick={handleReset} variant="outline">
                  New Analysis
                </Button>
              </div>

              {/* Mock Analysis Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Mock Analysis</CardTitle>
                  <CardDescription>
                    This is a prototype - real data connection coming soon
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedLocation && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Location</p>
                          <p className="text-lg font-semibold">
                            {selectedLocation.lat.toFixed(4)}, {selectedLocation.lon.toFixed(4)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Time Window</p>
                          <p className="text-lg font-semibold">Last {timeWindow} days</p>
                        </div>
                      </div>

                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Here we would show the cyanobacteria situation for this area and time window, 
                          based on SYKE data. The analysis would include bloom intensity, trends, 
                          affected water bodies, and recommendations.
                        </AlertDescription>
                      </Alert>

                      <div className="p-4 border rounded-lg space-y-2">
                        <h3 className="font-semibold">Next Steps</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          <li>Connect to SYKE API for real cyanobacteria data</li>
                          <li>Display bloom concentration levels and trends</li>
                          <li>Show affected water bodies and risk areas</li>
                          <li>Provide recommendations and alerts</li>
                        </ul>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Placeholder Bulletin Card */}
              <BulletinCard
                bulletin={{
                  citizenBulletin: `**Cyanobacteria Analysis for ${selectedLocation?.lat.toFixed(4)}, ${selectedLocation?.lon.toFixed(4)}**

**Overview**
This is a mock analysis for the last ${timeWindow} days. Once connected to SYKE data, this bulletin will show real-time cyanobacteria bloom information for your selected location.

**What to Expect (After Real Data Integration)**
• Real-time bloom concentration data
• Historical trends and patterns
• Water safety recommendations
• Affected water body information
• Risk level assessments

**Current Status**
🟡 This is a frontend prototype - no real data yet

**Recommendations**
✓ Location successfully captured: ${selectedLocation?.lat.toFixed(4)}, ${selectedLocation?.lon.toFixed(4)}
✓ Time window configured: Last ${timeWindow} days
✓ Ready for SYKE API integration`,
                  expertNote: `**Technical Analysis Parameters**

**Selected Coordinates**
Latitude: ${selectedLocation?.lat.toFixed(6)}
Longitude: ${selectedLocation?.lon.toFixed(6)}

**Time Window Configuration**
Duration: ${timeWindow} days
Analysis period: ${new Date(Date.now() - parseInt(timeWindow) * 24 * 60 * 60 * 1000).toLocaleDateString()} - ${new Date().toLocaleDateString()}

**Integration Roadmap**
• Connect to SYKE Open Data API endpoints
• Fetch historical bloom observations for selected coordinates and time window
• Process satellite imagery data if available
• Generate risk assessments based on bloom concentration levels
• Provide location-specific recommendations

**Data Sources (Planned)**
SYKE (Finnish Environment Institute) provides comprehensive cyanobacteria monitoring data including:
• Citizen observations
• Professional monitoring stations
• Satellite-based remote sensing
• Water quality measurements`
                }}
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-6 bg-card">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>BlueBloom • Powered by Apelago • Mock data for demonstration</p>
        </div>
      </footer>
    </div>
  );
}
