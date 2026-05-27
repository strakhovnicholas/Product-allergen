export type FoodSearchItem = {
  foodName: string;
  category?: string;
};

export {
  getFoodCategoriesApi,
  searchFoodCatalogApi as searchFoodApi,
} from './diaryApi';