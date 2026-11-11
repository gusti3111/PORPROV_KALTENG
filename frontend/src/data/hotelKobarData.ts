export type HotelItem = {
  id: number;
  hotelName: string;
  type: "Hotel Bintang" | "Hotel Melati" | "Wisma & Guest House" | "Resort";
  address: string;
  district: string;
  nearVenue: string;
  priceRange: string;
  contact: string;
  rating: number; // out of 5
  facilities: string[];
  mapsUrl: string;
  image: string;
};

export const hotelData: HotelItem[] = [
  {
    id: 1,
    hotelName: "Mercure Pangkalan Bun",
    type: "Hotel Bintang",
    address: "Jl. H. Udan Said, Kel. Baru, Kec. Arut Selatan, Pangkalan Bun, Kabupaten Kotawaringin Barat",
    district: "Arut Selatan",
    nearVenue: "± 7 menit ke Lapangan Sampuraga & GOR KONI",
    priceRange: "Rp 850.000 - Rp 1.600.000 / malam",
    contact: "6281142426622",
    rating: 4.8,
    facilities: ["Bintang 4", "Kolam Renang", "Restoran Kelana", "Ballroom", "WiFi", "Gym"],
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Mercure+Pangkalan+Bun",
    image: "https://web.visitkotawaringinbarat.id/wp-content/uploads/2024/07/Mercure-Pangkalan-Bun-2.jpg",
  },
  {
    id: 2,
    hotelName: "Swiss-Belinn Pangkalan Bun",
    type: "Hotel Bintang",
    address: "Jl. Ahmad Yani No. 50, Pasir Panjang, Kec. Arut Selatan, Pangkalan Bun, Kabupaten Kotawaringin Barat",
    district: "Arut Selatan",
    nearVenue: "± 5 menit ke Sport Center Pangkalan Bun",
    priceRange: "Rp 580.000 - Rp 1.150.000 / malam",
    contact: "6253227888",
    rating: 4.6,
    facilities: ["Bintang 3", "Kolam Renang", "Barelo Resto", "WiFi", "Parkir Luas"],
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Swiss-Belinn+Pangkalan+Bun",
    image: "https://cdn.1001malam.com/uploads/hotels/swissbelinnpangkalanbun_eksterior_1241156.jpg",
  },
  {
    id: 3,
    hotelName: "Grand Kecubung Hotel",
    type: "Hotel Bintang",
    address: "Jl. Domba No. 1, Mendawai, Kec. Arut Selatan, Pangkalan Bun, Kabupaten Kotawaringin Barat",
    district: "Arut Selatan",
    nearVenue: "± 6 menit ke Kompleks Olahraga Pangkalan Bun",
    priceRange: "Rp 450.000 - Rp 850.000 / malam",
    contact: "6253221211",
    rating: 4.5,
    facilities: ["Bintang 3", "Kolam Renang", "Restoran Tradisional", "Meeting Room", "WiFi"],
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Grand+Kecubung+Hotel+Pangkalan+Bun",
    image: "https://web.visitkotawaringinbarat.id/wp-content/uploads/2024/07/Grand-Kecubung-Hotel.jpg",
  },
  {
    id: 4,
    hotelName: "Arsela Hotel Pangkalan Bun",
    type: "Hotel Bintang",
    address: "Jl. MT. Haryono No. 34, Raja, Kec. Arut Selatan, Pangkalan Bun, Kabupaten Kotawaringin Barat",
    district: "Arut Selatan",
    nearVenue: "Pusat Kota / ± 8 menit ke Venue PORPROV",
    priceRange: "Rp 380.000 - Rp 650.000 / malam",
    contact: "6253223839",
    rating: 4.4,
    facilities: ["Restoran", "Meeting Room", "AC", "WiFi", "Parkir Bus"],
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Arsela+Hotel+Pangkalan+Bun",
    image: "https://web.visitkotawaringinbarat.id/wp-content/uploads/2024/07/Arsela-Hotel.jpg",
  },
  {
    id: 5,
    hotelName: "Brits Hotel Pangkalan Bun",
    type: "Hotel Bintang",
    address: "Jl. Ahmad Yani KM. 2, Baru, Kec. Arut Selatan, Pangkalan Bun, Kabupaten Kotawaringin Barat",
    district: "Arut Selatan",
    nearVenue: "± 6 menit ke Sport Center & Lintasan Atletik",
    priceRange: "Rp 500.000 - Rp 950.000 / malam",
    contact: "6253227888",
    rating: 4.5,
    facilities: ["Kolam Renang", "Restoran & Bar", "Fitness Center", "WiFi", "Resepsionis 24 Jam"],
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Brits+Hotel+Pangkalan+Bun",
    image: "https://pix8.agoda.net/hotelImages/22631087/0/aad83cf7e589da3851f87eb04f8b052e.jpg?ce=0",
  },
  {
    id: 6,
    hotelName: "Avilla Hotel Pangkalan Bun",
    type: "Hotel Bintang",
    address: "Jl. Pangeran Diponegoro No. 81, Sidorejo, Kec. Arut Selatan, Pangkalan Bun, Kabupaten Kotawaringin Barat",
    district: "Arut Selatan",
    nearVenue: "± 7 menit ke Venue Pertandingan Kota",
    priceRange: "Rp 320.000 - Rp 580.000 / malam",
    contact: "6281229293149",
    rating: 4.3,
    facilities: ["Kolam Renang", "Spa & Relaksasi", "Coffee Shop", "WiFi", "Dekat Rumah Sakit"],
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Avilla+Hotel+Pangkalan+Bun",
    image: "https://avilla-hotel.com/images/carousel/IMG34958.png",
  },
];

