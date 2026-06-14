export interface MediaFile {
  url: string;
  name: string;
  type: 'image' | 'video';
}

export interface TravelMemory {
  id: string;
  location: string;
  lat: number;
  lng: number;
  date: string;
  photos: MediaFile[];
  videos: MediaFile[];
  description?: string;
}

export const siteData = {
  title: "My Travel Journey",
  subtitle: "Exploring the world, one destination at a time",

  // 示例旅行记录
  memories: [
    {
      id: "1",
      location: "Hong Kong",
      lat: 22.3193,
      lng: 114.1694,
      date: "2024-03",
      photos: [],
      videos: [],
      description: "Stunning skyline, vibrant street markets, and the perfect fusion of East meets West. Victoria Harbour at night is unforgettable."
    },
    {
      id: "2",
      location: "Guangzhou, China",
      lat: 23.1291,
      lng: 113.2644,
      date: "2024-06",
      photos: [],
      videos: [],
      description: "The beautiful Flower City! Canton Tower lights up the night sky, and the Pearl River cruise was magnificent."
    },
    {
      id: "3",
      location: "Shanghai, China",
      lat: 31.2304,
      lng: 121.4737,
      date: "2024-09",
      photos: [],
      videos: [],
      description: "Modern meets traditional - from the futuristic skyline of Pudong to the historic charm of Yu Garden."
    },
    {
      id: "4",
      location: "Tokyo, Japan",
      lat: 35.6762,
      lng: 139.6503,
      date: "2024-10",
      photos: [],
      videos: [],
      description: "Experienced the perfect blend of ancient temples and neon-lit skyscrapers. Cherry blossoms were breathtaking."
    },
    {
      id: "5",
      location: "Paris, France",
      lat: 48.8566,
      lng: 2.3522,
      date: "2024-07",
      photos: [],
      videos: [],
      description: "Explored the Eiffel Tower at sunset, walked along the Seine, and discovered charming cafés in Montmartre."
    },
    {
      id: "6",
      location: "New York, USA",
      lat: 40.7128,
      lng: -74.0060,
      date: "2025-01",
      photos: [],
      videos: [],
      description: "Times Square energy, Central Park serenity, and the best pizza I've ever had in Brooklyn."
    },
    {
      id: "7",
      location: "London, UK",
      lat: 51.5074,
      lng: -0.1278,
      date: "2024-08",
      photos: [],
      videos: [],
      description: "Big Ben, Tower Bridge, and afternoon tea. The British Museum was absolutely fascinating."
    },
    {
      id: "8",
      location: "Sydney, Australia",
      lat: -33.8688,
      lng: 151.2093,
      date: "2024-12",
      photos: [],
      videos: [],
      description: "Opera House at sunset, beautiful beaches, and friendly locals. Bondi Beach was incredible!"
    }
  ] as TravelMemory[]
};
