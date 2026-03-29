import { apiRequest } from './client';

export type FoodSearchItem = {
  foodName: string;
  category: string;
};

export async function searchFoodApi(query: string, limit = 10) {
  return apiRequest<FoodSearchItem[]>(
    `/api/food/search?query=${encodeURIComponent(query)}&limit=${limit}`,
    {
      method: 'GET',
      auth: true,
    }
  );
}