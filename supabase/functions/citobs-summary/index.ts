import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RegionConfig {
  name: string;
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

const REGIONS: Record<string, RegionConfig> = {
  'turku_archipelago': {
    name: 'Turku archipelago',
    minLat: 59.7,
    maxLat: 60.6,
    minLon: 21.0,
    maxLon: 23.0,
  },
  'helsinki_archipelago': {
    name: 'Helsinki archipelago',
    minLat: 59.8,
    maxLat: 60.4,
    minLon: 24.3,
    maxLon: 25.6,
  },
  'vaasa_archipelago': {
    name: 'Vaasa archipelago',
    minLat: 62.9,
    maxLat: 63.3,
    minLon: 21.3,
    maxLon: 21.8,
  },
};

// Convert ISO week number to date range
function getWeekDateRange(year: number, week: number): { startDate: string; endDate: string } {
  // ISO week 1 is the week with the first Thursday of the year
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4DayOfWeek = jan4.getUTCDay() || 7; // Sunday = 7
  const firstMonday = new Date(jan4);
  firstMonday.setUTCDate(jan4.getUTCDate() - jan4DayOfWeek + 1);
  
  // Calculate the start of the target week
  const startDate = new Date(firstMonday);
  startDate.setUTCDate(firstMonday.getUTCDate() + (week - 1) * 7);
  startDate.setUTCHours(0, 0, 0, 0);
  
  // End date is 6 days later at 23:59:59
  const endDate = new Date(startDate);
  endDate.setUTCDate(startDate.getUTCDate() + 6);
  endDate.setUTCHours(23, 59, 59, 999);
  
  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
}

// Map CitObs severity code to our severity levels
function mapCodeToSeverity(value: number | null | undefined): 'none' | 'low' | 'medium' | 'high' {
  // CitObs codes:
  // 1 = mass occurrence (high)
  // 2 = heavy algae occurrence (medium)
  // 3 = some algae (low)
  // 4 = other algae observation (low)
  // 5 = no algae (none)
  // 6 = multiple types (medium)
  if (value === 1) return 'high';
  if (value === 2 || value === 6) return 'medium';
  if (value === 3 || value === 4) return 'low';
  if (value === 5) return 'none';
  return 'low'; // default
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Read parameters from request body
    const { region: regionKey, week: weekNum } = await req.json();

    if (!regionKey || !weekNum) {
      return new Response(
        JSON.stringify({ error: 'Missing region or week parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const region = REGIONS[regionKey];
    if (!region) {
      return new Response(
        JSON.stringify({ error: `Unknown region: ${regionKey}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const week = typeof weekNum === 'number' ? weekNum : parseInt(String(weekNum), 10);
    const year = new Date().getUTCFullYear();
    const { startDate, endDate } = getWeekDateRange(year, week);

    console.log(`Fetching CitObs data for ${region.name}, week ${week}`);
    console.log(`Date range: ${startDate} to ${endDate}`);

    // Call SYKE CitObs API
    const citobsUrl = new URL('https://rajapinnat.ymparisto.fi/api/kansalaishavainnot/1.0/requests.json');
    citobsUrl.searchParams.set('service_code', 'algaebloom_service_code_201808151546171');
    citobsUrl.searchParams.set('extension', 'true');
    citobsUrl.searchParams.set('status', 'open');
    citobsUrl.searchParams.set('start_date', startDate);
    citobsUrl.searchParams.set('end_date', endDate);

    const response = await fetch(citobsUrl.toString());
    
    if (!response.ok) {
      console.error(`CitObs API error: ${response.status}`);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch CitObs data' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log(`Received ${data.length || 0} CitObs observations`);

    // Filter by bounding box and map to our format
    const events: Array<{
      id: string;
      lat: number;
      lon: number;
      timestamp: string;
      severity: 'none' | 'low' | 'medium' | 'high';
      areaName?: string;
    }> = [];

    const severityCounts = { high: 0, medium: 0, low: 0, none: 0 };

    for (const item of data || []) {
      const lat = item.lat;
      const lon = item.long;

      // Check if within bounding box
      if (
        lat >= region.minLat &&
        lat <= region.maxLat &&
        lon >= region.minLon &&
        lon <= region.maxLon
      ) {
        // Extract severity from attributes
        const attributes = item.extended_attributes || {};
        const severityCode = attributes.hisp_algaebloom_singlevaluelist_202201051826220;
        const severity = mapCodeToSeverity(severityCode);

        events.push({
          id: item.service_request_id,
          lat,
          lon,
          timestamp: item.requested_datetime || item.updated_datetime,
          severity,
          areaName: item.address || 'Unknown location',
        });

        severityCounts[severity]++;
      }
    }

    console.log(`Filtered to ${events.length} events in region`);
    console.log(`Severity counts:`, severityCounts);

    // Determine overall risk
    let overallRisk: 'high' | 'medium' | 'low' | 'none' = 'none';
    if (severityCounts.high > 0) overallRisk = 'high';
    else if (severityCounts.medium > 0) overallRisk = 'medium';
    else if (severityCounts.low > 0) overallRisk = 'low';

    const summary = {
      regionKey,
      regionName: region.name,
      week,
      from: startDate,
      to: endDate,
      totalObservations: events.length,
      severityCounts,
      overallRisk,
      sampleEvents: events.slice(0, 20), // Return first 20 for display
    };

    return new Response(
      JSON.stringify({ summary }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in citobs-summary function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
