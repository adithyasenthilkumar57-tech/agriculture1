'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    // Brand & Taglines
    appName: 'AGRIMITRA AI',
    tagline: 'From Farm to Market, Made Simple',
    aiTagline: 'Your Farm. Your Transport. Your AI Agriculture Assistant.',

    // Navigation
    home: 'Home',
    dashboard: 'Agriculture Dashboard',
    agriculture: 'Agriculture',
    transport: 'Agricultural Transport',
    aiAssistant: 'AgriMitra AI',
    myFarms: 'My Farms',
    crops: 'Crops & Timeline',
    soilHealth: 'Soil Health',
    weather: 'Weather Intelligence',
    tasks: 'Farming Tasks',
    marketplace: 'Agricultural Market',
    transporterHub: 'Transporter Hub',
    myVehicles: 'My Vehicles',
    notifications: 'Notifications',
    profile: 'Profile & Settings',
    adminPanel: 'Admin Panel',
    logout: 'Log out',
    login: 'Log In',
    register: 'Get Started',

    // Dashboard & Actions
    welcome: 'Welcome',
    activeFarmContext: 'Active Farm Context',
    bookTransport: 'Book Transport',
    askAi: 'Ask AI',
    addCrop: 'Add Crop',
    registerFarm: 'Register Farm',
    activeTrips: 'Active Trips',
    completedTrips: 'Completed History',

    // Weather & Alerts
    weatherIntelligence: 'Weather Intelligence',
    feelsLike: 'Feels like',
    humidity: 'Humidity',
    windSpeed: 'Wind',
    rain: 'Rain',
    uvIndex: 'UV Index',
    sprayingConditions: 'Spraying Conditions',
    irrigationConsiderations: 'Irrigation Considerations',

    // Transport
    bookAgriTransport: 'Book Agricultural Transport',
    cargoCategory: 'What are you transporting?',
    quantity: 'Quantity & Load Volume',
    pickupLocation: 'Pickup Location',
    destination: 'Destination Details',
    vehicleSelection: 'Vehicle Selection',
    schedule: 'Date & Time',
    confirmRequest: 'Review & Confirm',
    estimatedCost: 'Estimated Cost',

    // Common
    cancel: 'Cancel',
    save: 'Save',
    search: 'Search',
    submit: 'Submit',
    viewDetails: 'View Details',
    delivered: 'Delivered',
    live: 'Live',
    verified: 'Verified',
  },
  ta: {
    // Brand & Taglines
    appName: 'அக்ரிமித்ரா AI',
    tagline: 'பண்ணை முதல் சந்தை வரை, எளிமையாக',
    aiTagline: 'உங்கள் பண்ணை. உங்கள் போக்குவரத்து. உங்கள் AI விவசாய உதவியாளர்.',

    // Navigation
    home: 'முகப்பு',
    dashboard: 'விவசாய டாஷ்போர்டு',
    agriculture: 'விவசாயம்',
    transport: 'விவசாய போக்குவரத்து',
    aiAssistant: 'அக்ரிமித்ரா AI உதவியாளர்',
    myFarms: 'எனது பண்ணைகள்',
    crops: 'பயிர்கள் & காலவரிசை',
    soilHealth: 'மண் வளம்',
    weather: 'வானிலை நுண்ணறிவு',
    tasks: 'பண்ணை பணிகள்',
    marketplace: 'விவசாய சந்தை',
    transporterHub: 'போக்குவரத்து மையம்',
    myVehicles: 'எனது வாகனங்கள்',
    notifications: 'அறிவிப்புகள்',
    profile: 'சுயவிவரம் & அமைப்புகள்',
    adminPanel: 'நிர்வாக பலகை',
    logout: 'வெளியேறு',
    login: 'உள்நுழைக',
    register: 'தொடங்குங்கள்',

    // Dashboard & Actions
    welcome: 'வணக்கம்',
    activeFarmContext: 'செயலில் உள்ள பண்ணை',
    bookTransport: 'வாகனம் முன்பதிவு',
    askAi: 'AI கேளுங்கள்',
    addCrop: 'பயிர் சேர்க்க',
    registerFarm: 'பண்ணை பதிவு',
    activeTrips: 'செயலில் உள்ள பயணங்கள்',
    completedTrips: 'முடிந்த பயணங்கள்',

    // Weather & Alerts
    weatherIntelligence: 'வானிலை நுண்ணறிவு',
    feelsLike: 'உணரப்படும் வெப்பநிலை',
    humidity: 'ஈரப்பதம்',
    windSpeed: 'காற்று வேகம்',
    rain: 'மழை',
    uvIndex: 'புற ஊதா குறியீடு',
    sprayingConditions: 'மருந்து தெளிக்கும் சூழல்',
    irrigationConsiderations: 'நீர்ப்பாசன வழிகாட்டுதல்',

    // Transport
    bookAgriTransport: 'விவசாய வாகன முன்பதிவு',
    cargoCategory: 'என்ன கொண்டு செல்ல வேண்டும்?',
    quantity: 'அளவு & எடை',
    pickupLocation: 'ஏற்றும் இடம்',
    destination: 'சேரும் இடம்',
    vehicleSelection: 'வாகன தேர்வு',
    schedule: 'தேதி & நேரம்',
    confirmRequest: 'சரிபார்த்து உறுதி செய்',
    estimatedCost: 'மதிப்பிடப்பட்ட கட்டணம்',

    // Common
    cancel: 'ரத்து செய்',
    save: 'சேமி',
    search: 'தேடு',
    submit: 'சமர்ப்பி',
    viewDetails: 'விவரங்கள் பார்',
    delivered: 'வழங்கப்பட்டது',
    live: 'நேரலை',
    verified: 'சரிபார்க்கப்பட்டது',
  },
};

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('agrimitra_lang');
    if (saved && (saved === 'en' || saved === 'ta')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('agrimitra_lang', lang);
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
