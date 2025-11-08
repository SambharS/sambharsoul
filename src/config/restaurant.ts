// Restaurant configuration
// This file contains sensitive business information and should not be exposed to clients

/**
 * Restaurant's physical location coordinates
 * Used for calculating delivery distance and charges
 * 
 * Location: Jaipur, Rajasthan
 * Coordinates: 26.9052103, 75.6942634
 * 
 * @private - Do not expose these coordinates to client-side
 */
export const RESTAURANT_LOCATION = {
    lat: 26.9052103,
    lng: 75.6942634,
} as const;

/**
 * Restaurant business information
 */
export const RESTAURANT_INFO = {
    name: 'Sambhar Soul',
    tagline: 'Authentic South Indian Flavors',
    cuisine: 'South Indian',
    city: 'Jaipur',
    state: 'Rajasthan',
} as const;

/**
 * Delivery configuration
 */
export const DELIVERY_CONFIG = {
    // Base delivery charge in rupees
    baseCharge: 20,

    // Charge per kilometer
    perKmCharge: 10,

    // Maximum delivery distance in kilometers
    maxDistance: 15,

    // Minimum order amount for delivery
    minOrderAmount: 100,
} as const;
