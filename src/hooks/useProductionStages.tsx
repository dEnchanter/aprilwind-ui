import { useQuery } from '@tanstack/react-query';

export const useProductionStages = () => {
  const fetchProductionStages = async () => {
    // TODO: Production stages are embedded in production objects, not a separate endpoint
    // Return empty array as placeholder until proper implementation
    return [] as ProductionStages[];
  };

  return useQuery({
    queryKey: ['productionStages'],
    queryFn: fetchProductionStages,
  });
};
