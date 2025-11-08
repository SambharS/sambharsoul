export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2)**2 +
    Math.cos(lat1 * Math.PI/180) *
    Math.cos(lat2 * Math.PI/180) *
    Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calcDeliveryCharge(distanceKm: number): number {
  return 10 + Math.max(0, (distanceKm - 1)) * 2;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
}

export function getOrderStatusColor(status: string): string {
  switch (status) {
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Accepted':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Processing':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Out for Delivery':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Delivered':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function getOrderStatusProgress(status: string): number {
  switch (status) {
    case 'Pending':
      return 20;
    case 'Accepted':
      return 40;
    case 'Processing':
      return 60;
    case 'Out for Delivery':
      return 80;
    case 'Delivered':
      return 100;
    default:
      return 0;
  }
}