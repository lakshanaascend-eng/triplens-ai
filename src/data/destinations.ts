import destinationsData from './destinations.json';
import type { TravelItem } from '../types/travel';

export const allTravelItems: TravelItem[] = destinationsData as TravelItem[];

export const KERALA_CITIES = [
  'Munnar',
  'Alleppey',
  'Kochi',
  'Wayanad',
  'Thekkady',
  'Kovalam',
  'Varkala',
  'Kumarakom',
  'Thrissur',
] as const;

export const TAMIL_NADU_CITIES = [
  'Ooty',
  'Chennai',
  'Madurai',
  'Coimbatore',
  'Kodaikanal',
  'Rameswaram',
  'Kanyakumari',
  'Mahabalipuram',
] as const;

export const KARNATAKA_CITIES = [
  'Bangalore',
  'Mysore',
  'Coorg',
  'Hampi',
  'Chikmagalur',
  'Gokarna',
  'Udupi',
  'Badami',
] as const;

export const ANDHRA_PRADESH_CITIES = [
  'Visakhapatnam',
  'Vijayawada',
  'Tirupati',
  'Araku Valley',
  'Rajahmundry',
] as const;

export const TELANGANA_CITIES = [
  'Hyderabad',
  'Warangal',
  'Nagarjuna Sagar',
  'Karimnagar',
] as const;

export const PUDUCHERRY_CITIES = [
  'Pondicherry',
  'Auroville',
  'Karaikal',
] as const;

export const STATE_CITIES_MAP: Record<string, readonly string[]> = {
  kerala: KERALA_CITIES,
  'tamil nadu': TAMIL_NADU_CITIES,
  tamilnadu: TAMIL_NADU_CITIES,
  karnataka: KARNATAKA_CITIES,
  'andhra pradesh': ANDHRA_PRADESH_CITIES,
  andhrapradesh: ANDHRA_PRADESH_CITIES,
  telangana: TELANGANA_CITIES,
  puducherry: PUDUCHERRY_CITIES,
  pondicherry: PUDUCHERRY_CITIES,
};

export const DEMO_DESTINATIONS = [
  'Goa',
  'Munnar',
  'Pondicherry',
  'Auroville',
  'Karaikal',
  'Puducherry',
  'Alleppey',
  'Kochi',
  'Wayanad',
  'Thekkady',
  'Kovalam',
  'Varkala',
  'Kumarakom',
  'Thrissur',
  'Kerala',
  'Ooty',
  'Chennai',
  'Madurai',
  'Coimbatore',
  'Kodaikanal',
  'Rameswaram',
  'Kanyakumari',
  'Mahabalipuram',
  'Tamil Nadu',
  'Bangalore',
  'Mysore',
  'Coorg',
  'Hampi',
  'Chikmagalur',
  'Gokarna',
  'Udupi',
  'Badami',
  'Karnataka',
  'Visakhapatnam',
  'Vijayawada',
  'Tirupati',
  'Araku Valley',
  'Rajahmundry',
  'Andhra Pradesh',
  'Hyderabad',
  'Warangal',
  'Nagarjuna Sagar',
  'Karimnagar',
  'Telangana',
  'Jaipur',
  'Udaipur',
  'Jodhpur',
  'Delhi',
  'Agra',
  'Varanasi',
  'Rishikesh',
  'Nainital',
  'Manali',
  'Shimla',
  'Amritsar',
  'Srinagar',
] as const;

export function getItemsByDestination(destination: string): TravelItem[] {
  const query = destination.trim().toLowerCase();

  // Two-level matching: State-level aggregation across all child cities
  const stateCities = STATE_CITIES_MAP[query];
  if (stateCities) {
    const citySet = new Set(stateCities.map((c) => c.toLowerCase()));
    return allTravelItems.filter(
      (item) =>
        item.state?.toLowerCase() === query ||
        (query.includes('tamil') && item.state?.toLowerCase() === 'tamil nadu') ||
        citySet.has(item.destination.toLowerCase()) ||
        (item.city && citySet.has(item.city.toLowerCase()))
    );
  }

  // Direct city-level match
  return allTravelItems.filter(
    (item) =>
      item.destination.toLowerCase() === query ||
      item.city?.toLowerCase() === query
  );
}
