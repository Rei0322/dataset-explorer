import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { DatasetDetail, DatasetSummary, UploadDataset } from "@shared/schema";

export function useDatasets() {
  return useQuery<DatasetSummary[]>({
    queryKey: ["/api/datasets"],
  });
}

export function useDataset(id: number | undefined) {
  return useQuery<DatasetDetail>({
    queryKey: ["/api/datasets", id],
    enabled: id !== undefined,
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/datasets/${id}`);
      return res.json();
    },
  });
}

export function useUploadDataset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UploadDataset) => {
      const res = await apiRequest("POST", "/api/datasets", input);
      return (await res.json()) as DatasetDetail;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/datasets"] });
    },
  });
}

export function useDeleteDataset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/datasets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/datasets"] });
    },
  });
}
