import { useQuery } from '@tanstack/react-query';

export const useProductStockStage = () => {
  const fetchProductStockStage = async () => {
    // TODO: Product stock stages are embedded in product stock objects, not a separate endpoint
    // Return empty array as placeholder until proper implementation
    return [] as ProductStockStage[];
  };

  return useQuery({
    queryKey: ['productStockStage'],
    queryFn: fetchProductStockStage,
  });
};