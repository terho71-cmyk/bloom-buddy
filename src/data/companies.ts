export type CompanyCategory = "cleanup" | "biorefinery" | "biotech" | "monitoring" | "project";

export interface MapCompany {
  name: string;
  category: CompanyCategory;
  city: string;
  latitude: number;
  longitude: number;
  description: string;
  website?: string;
}

export const COMPANIES: MapCompany[] = [
  {
    name: "Origin by Ocean",
    category: "biorefinery",
    city: "Kokkola",
    latitude: 63.84,
    longitude: 23.13,
    website: "https://example.com/originbyocean",
    description:
      "Finnish biotech startup turning harvested seaweeds and blue-green algae into biorefinery feedstock and ingredients for food, cosmetics and materials.",
  },
  {
    name: "Algonomi",
    category: "biotech",
    city: "Helsinki",
    latitude: 60.17,
    longitude: 24.94,
    website: "https://example.com/algonomi",
    description:
      "Spinout from University of Helsinki cultivating microalgae using industrial effluents and CO₂ streams, producing biomass for food, feed and other applications.",
  },
  {
    name: "Redono Oy",
    category: "biotech",
    city: "Lohja",
    latitude: 60.25,
    longitude: 24.07,
    website: "https://example.com/redono",
    description:
      "Circular-bio startup in Lohja developing microalgae cultivation and future farming systems that use industrial side streams and CO₂.",
  },
  {
    name: "AlgaCircle (Univ. of Turku project)",
    category: "project",
    city: "Turku",
    latitude: 60.45,
    longitude: 22.27,
    website: "https://example.com/algacircle",
    description:
      "University of Turku–led project and industry consortium aiming to produce food, feed and agrochemicals from microalgae.",
  },
  {
    name: "Clewat",
    category: "cleanup",
    city: "Kotka",
    latitude: 60.47,
    longitude: 26.95,
    website: "https://example.com/clewat",
    description:
      "Finnish cleantech company with water-cleaning vessels that remove plastic waste, biomass and algae from seas, rivers and lakes.",
  },
  {
    name: "Salofa – BlueGreenTest",
    category: "monitoring",
    city: "Salo",
    latitude: 60.39,
    longitude: 23.13,
    website: "https://example.com/salofa",
    description:
      "Company from Salo producing BlueGreenTest, a rapid test kit for detecting cyanobacteria toxins in water.",
  },
];
