import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import {
  jobsService,
  type JobCreateInput,
  type JobUpdateInput,
} from "../api/jobs-service";

export function useJobs() {
  return useQuery({
    queryKey: queryKeys.jobs.all,
    queryFn: () => jobsService.list(),
  });
}

export function useJob(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.jobs.detail(id ?? ""),
    queryFn: () => jobsService.get(id ?? ""),
    enabled: Boolean(id),
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: JobCreateInput) => jobsService.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      toast.success("Job saved");
    },
    onError: (error) => toast.error(`Could not save job: ${error.message}`),
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: JobUpdateInput) => jobsService.update(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      toast.success("Job updated");
    },
    onError: (error) => toast.error(`Could not update job: ${error.message}`),
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => jobsService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      toast.success("Job deleted");
    },
    onError: (error) => toast.error(`Could not delete job: ${error.message}`),
  });
}

export function useExtractJob() {
  return useMutation({
    mutationFn: (text: string) => jobsService.extractFromText(text),
    onError: (error) => toast.error(`Extraction failed: ${error.message}`),
  });
}
