// 世界主要国家和城市的地理位置数据
export interface WorldLocation {
  name: string;
  lat: number;
  lng: number;
  type: 'country' | 'city' | 'region';
  size?: number; // 标签大小权重
}

export const worldLocations: WorldLocation[] = [
  // 亚洲 - 国家
  { name: "China", lat: 35.8617, lng: 104.1954, type: "country", size: 1.5 },
  { name: "India", lat: 20.5937, lng: 78.9629, type: "country", size: 1.5 },
  { name: "Japan", lat: 36.2048, lng: 138.2529, type: "country", size: 1.2 },
  { name: "South Korea", lat: 35.9078, lng: 127.7669, type: "country", size: 1.0 },
  { name: "Thailand", lat: 15.8700, lng: 100.9925, type: "country", size: 1.0 },
  { name: "Vietnam", lat: 14.0583, lng: 108.2772, type: "country", size: 1.0 },
  { name: "Indonesia", lat: -0.7893, lng: 113.9213, type: "country", size: 1.2 },
  { name: "Malaysia", lat: 4.2105, lng: 101.9758, type: "country", size: 1.0 },
  { name: "Singapore", lat: 1.3521, lng: 103.8198, type: "city", size: 0.8 },
  { name: "Philippines", lat: 12.8797, lng: 121.7740, type: "country", size: 1.0 },

  // 亚洲 - 中国主要城市
  { name: "Beijing", lat: 39.9042, lng: 116.4074, type: "city", size: 1.2 },
  { name: "Shanghai", lat: 31.2304, lng: 121.4737, type: "city", size: 1.2 },
  { name: "Guangzhou", lat: 23.1291, lng: 113.2644, type: "city", size: 1.0 },
  { name: "Shenzhen", lat: 22.5431, lng: 114.0579, type: "city", size: 1.0 },
  { name: "Hong Kong", lat: 22.3193, lng: 114.1694, type: "city", size: 1.0 },
  { name: "Chengdu", lat: 30.5728, lng: 104.0668, type: "city", size: 0.9 },
  { name: "Chongqing", lat: 29.4316, lng: 106.9123, type: "city", size: 0.9 },
  { name: "Xi'an", lat: 34.3416, lng: 108.9398, type: "city", size: 0.9 },
  { name: "Hangzhou", lat: 30.2741, lng: 120.1551, type: "city", size: 0.9 },
  { name: "Wuhan", lat: 30.5928, lng: 114.3055, type: "city", size: 0.9 },
  { name: "Taipei", lat: 25.0330, lng: 121.5654, type: "city", size: 1.0 },
  { name: "Macau", lat: 22.1987, lng: 113.5439, type: "city", size: 0.8 },

  // 亚洲 - 其他主要城市
  { name: "Tokyo", lat: 35.6762, lng: 139.6503, type: "city", size: 1.2 },
  { name: "Seoul", lat: 37.5665, lng: 126.9780, type: "city", size: 1.1 },
  { name: "Mumbai", lat: 19.0760, lng: 72.8777, type: "city", size: 1.1 },
  { name: "Delhi", lat: 28.7041, lng: 77.1025, type: "city", size: 1.1 },
  { name: "Bangkok", lat: 13.7563, lng: 100.5018, type: "city", size: 1.0 },
  { name: "Dubai", lat: 25.2048, lng: 55.2708, type: "city", size: 1.0 },
  { name: "Istanbul", lat: 41.0082, lng: 28.9784, type: "city", size: 1.0 },

  // 欧洲 - 国家
  { name: "United Kingdom", lat: 55.3781, lng: -3.4360, type: "country", size: 1.2 },
  { name: "France", lat: 46.2276, lng: 2.2137, type: "country", size: 1.2 },
  { name: "Germany", lat: 51.1657, lng: 10.4515, type: "country", size: 1.2 },
  { name: "Italy", lat: 41.8719, lng: 12.5674, type: "country", size: 1.2 },
  { name: "Spain", lat: 40.4637, lng: -3.7492, type: "country", size: 1.2 },
  { name: "Russia", lat: 61.5240, lng: 105.3188, type: "country", size: 1.5 },
  { name: "Netherlands", lat: 52.1326, lng: 5.2913, type: "country", size: 0.9 },
  { name: "Switzerland", lat: 46.8182, lng: 8.2275, type: "country", size: 0.9 },
  { name: "Sweden", lat: 60.1282, lng: 18.6435, type: "country", size: 1.0 },
  { name: "Norway", lat: 60.4720, lng: 8.4689, type: "country", size: 1.0 },

  // 欧洲 - 主要城市
  { name: "London", lat: 51.5074, lng: -0.1278, type: "city", size: 1.2 },
  { name: "Paris", lat: 48.8566, lng: 2.3522, type: "city", size: 1.2 },
  { name: "Berlin", lat: 52.5200, lng: 13.4050, type: "city", size: 1.1 },
  { name: "Rome", lat: 41.9028, lng: 12.4964, type: "city", size: 1.1 },
  { name: "Madrid", lat: 40.4168, lng: -3.7038, type: "city", size: 1.0 },
  { name: "Barcelona", lat: 41.3851, lng: 2.1734, type: "city", size: 1.0 },
  { name: "Amsterdam", lat: 52.3676, lng: 4.9041, type: "city", size: 1.0 },
  { name: "Vienna", lat: 48.2082, lng: 16.3738, type: "city", size: 0.9 },
  { name: "Prague", lat: 50.0755, lng: 14.4378, type: "city", size: 0.9 },
  { name: "Moscow", lat: 55.7558, lng: 37.6173, type: "city", size: 1.1 },

  // 北美洲 - 国家
  { name: "United States", lat: 37.0902, lng: -95.7129, type: "country", size: 1.5 },
  { name: "Canada", lat: 56.1304, lng: -106.3468, type: "country", size: 1.5 },
  { name: "Mexico", lat: 23.6345, lng: -102.5528, type: "country", size: 1.2 },

  // 北美洲 - 主要城市
  { name: "New York", lat: 40.7128, lng: -74.0060, type: "city", size: 1.2 },
  { name: "Los Angeles", lat: 34.0522, lng: -118.2437, type: "city", size: 1.1 },
  { name: "Chicago", lat: 41.8781, lng: -87.6298, type: "city", size: 1.0 },
  { name: "San Francisco", lat: 37.7749, lng: -122.4194, type: "city", size: 1.0 },
  { name: "Washington DC", lat: 38.9072, lng: -77.0369, type: "city", size: 1.0 },
  { name: "Toronto", lat: 43.6532, lng: -79.3832, type: "city", size: 1.0 },
  { name: "Vancouver", lat: 49.2827, lng: -123.1207, type: "city", size: 0.9 },
  { name: "Mexico City", lat: 19.4326, lng: -99.1332, type: "city", size: 1.1 },

  // 南美洲 - 国家
  { name: "Brazil", lat: -14.2350, lng: -51.9253, type: "country", size: 1.5 },
  { name: "Argentina", lat: -38.4161, lng: -63.6167, type: "country", size: 1.2 },
  { name: "Chile", lat: -35.6751, lng: -71.5430, type: "country", size: 1.0 },
  { name: "Peru", lat: -9.1900, lng: -75.0152, type: "country", size: 1.0 },

  // 南美洲 - 主要城市
  { name: "São Paulo", lat: -23.5505, lng: -46.6333, type: "city", size: 1.1 },
  { name: "Rio de Janeiro", lat: -22.9068, lng: -43.1729, type: "city", size: 1.0 },
  { name: "Buenos Aires", lat: -34.6037, lng: -58.3816, type: "city", size: 1.0 },
  { name: "Lima", lat: -12.0464, lng: -77.0428, type: "city", size: 0.9 },

  // 非洲 - 国家
  { name: "Egypt", lat: 26.8206, lng: 30.8025, type: "country", size: 1.2 },
  { name: "South Africa", lat: -30.5595, lng: 22.9375, type: "country", size: 1.2 },
  { name: "Nigeria", lat: 9.0820, lng: 8.6753, type: "country", size: 1.2 },
  { name: "Kenya", lat: -0.0236, lng: 37.9062, type: "country", size: 1.0 },
  { name: "Morocco", lat: 31.7917, lng: -7.0926, type: "country", size: 1.0 },

  // 非洲 - 主要城市
  { name: "Cairo", lat: 30.0444, lng: 31.2357, type: "city", size: 1.1 },
  { name: "Cape Town", lat: -33.9249, lng: 18.4241, type: "city", size: 1.0 },
  { name: "Lagos", lat: 6.5244, lng: 3.3792, type: "city", size: 1.0 },
  { name: "Nairobi", lat: -1.2864, lng: 36.8172, type: "city", size: 0.9 },

  // 大洋洲 - 国家
  { name: "Australia", lat: -25.2744, lng: 133.7751, type: "country", size: 1.5 },
  { name: "New Zealand", lat: -40.9006, lng: 174.8860, type: "country", size: 1.2 },

  // 大洋洲 - 主要城市
  { name: "Sydney", lat: -33.8688, lng: 151.2093, type: "city", size: 1.2 },
  { name: "Melbourne", lat: -37.8136, lng: 144.9631, type: "city", size: 1.0 },
  { name: "Auckland", lat: -36.8485, lng: 174.7633, type: "city", size: 0.9 },
];
