import { TrackingItem } from "@prisma/client"

export const fetchItems = async (): Promise<TrackingItem[]> => {
  const response = await fetch('/api/training')
  const data: TrackingItem[] = await response.json()
  return data
};