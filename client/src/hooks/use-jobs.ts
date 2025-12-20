import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertExportJob, type ExportJob } from "@shared/schema";
import { z } from "zod";

// Create Job (POST /api/export)
export function useCreateJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<InsertExportJob, "userId" | "templateId"> & { templateId?: string }) => {
      // Validate input using the shared schema from routes
      const validated = api.export.create.input.parse(data);
      
      const res = await fetch(api.export.create.path, {
        method: api.export.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.export.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create export job");
      }

      return api.export.create.responses[200].parse(await res.json());
    },
    // We don't invalidate lists here because we don't have a jobs list endpoint in this simplified schema,
    // but in a real app you would invalidate 'jobs.list'
  });
}

// Get Job (GET /api/jobs/:id)
// We add refetchInterval logic to handle polling
export function useJob(id: string | null) {
  return useQuery({
    queryKey: [api.jobs.get.path, id],
    queryFn: async () => {
      if (!id) return null;
      
      const url = buildUrl(api.jobs.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch job status");
      
      return api.jobs.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
    // Poll every 2 seconds if status is 'pending' or 'processing'
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "pending" || status === "processing") {
        return 2000;
      }
      return false; // Stop polling when complete/failed
    },
  });
}
