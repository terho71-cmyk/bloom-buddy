import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "fi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    "app.name": "BlueBloom",
    "app.tagline": "Cyanobacteria situation & blue-economy solution finder for Apelago",
    "nav.startups": "Startups",
    "nav.investors": "Investors",
    "nav.gaps": "Gaps",
    "nav.clusters": "Clusters",
    "nav.dashboard": "Dashboard",
    
    // Footer
    "footer.text": "BlueBloom • Powered by Apelago • Mock data for demonstration",
    
    // Region Selector
    "selector.region": "Region",
    "selector.week": "Week",
    "selector.analyze": "Generate Analysis",
    "selector.analyzing": "Analyzing...",
    
    // Analysis
    "analysis.title": "Select Region & Week",
    "analysis.description": "Choose a region and week from the sidebar, then click \"Generate Analysis\" to view the cyanobacteria situation and recommendations.",
    "analysis.loading": "Analyzing bloom situation...",
    "analysis.complete": "Analysis complete",
    "analysis.complete.desc": "Bloom situation analysis and recommendations generated successfully.",
    "analysis.failed": "Analysis failed",
    "analysis.failed.desc": "Failed to generate analysis. Please try again.",
    
    // Tabs
    "tab.bulletin": "Bloom Bulletin",
    "tab.solutions": "Solutions & Investors",
    
    // Clusters
    "clusters.title": "Collaboration Clusters",
    "clusters.description": "Bundles of complementary startups that work together to provide comprehensive solutions",
    "clusters.no.recommendations": "No recommendations available for this situation.",
    
    // Back links
    "back.dashboard": "Back to Dashboard",
    
    // Language
    "language.english": "English",
    "language.finnish": "Finnish",
  },
  fi: {
    // Header
    "app.name": "BlueBloom",
    "app.tagline": "Sinilevätilanne ja sinitalouden ratkaisuhaku Apelagolle",
    "nav.startups": "Startupit",
    "nav.investors": "Sijoittajat",
    "nav.gaps": "Aukot",
    "nav.clusters": "Klusterit",
    "nav.dashboard": "Kojelauta",
    
    // Footer
    "footer.text": "BlueBloom • Powered by Apelago • Demon dataa",
    
    // Region Selector
    "selector.region": "Alue",
    "selector.week": "Viikko",
    "selector.analyze": "Luo analyysi",
    "selector.analyzing": "Analysoidaan...",
    
    // Analysis
    "analysis.title": "Valitse alue ja viikko",
    "analysis.description": "Valitse alue ja viikko sivupalkista, klikkaa sitten \"Luo analyysi\" nähdäksesi sinilevätilanne ja suositukset.",
    "analysis.loading": "Analysoidaan leväntilannetta...",
    "analysis.complete": "Analyysi valmis",
    "analysis.complete.desc": "Levätilanteen analyysi ja suositukset luotu onnistuneesti.",
    "analysis.failed": "Analyysi epäonnistui",
    "analysis.failed.desc": "Analyysin luonti epäonnistui. Yritä uudelleen.",
    
    // Tabs
    "tab.bulletin": "Levätiedote",
    "tab.solutions": "Ratkaisut ja sijoittajat",
    
    // Clusters
    "clusters.title": "Yhteistyöklusterit",
    "clusters.description": "Toisiaan täydentävien startupien kimppuja, jotka yhdessä tarjoavat kattavia ratkaisuja",
    "clusters.no.recommendations": "Tälle tilanteelle ei ole suosituksia.",
    
    // Back links
    "back.dashboard": "Takaisin kojelaudalle",
    
    // Language
    "language.english": "Englanti",
    "language.finnish": "Suomi",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
