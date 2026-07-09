import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import { useJobs } from "@/features/jobs/hooks/use-jobs";
import type { Application, Job } from "@/types/models";
import {
  applicationsService,
  type ApplicationCreateInput,
  type ApplicationUpdateInput,
} from "../api/applications-service";

export function useApplications() {
  return useQuery({
    queryKey: queryKeys.applications.all,
    queryFn: () => applicationsService.list(),
  });
}

export function useApplication(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.applications.detail(id ?? ""),
    queryFn: () => applicationsService.get(id ?? ""),
    enabled: Boolean(id),
  });
}

export interface ApplicationWithJob {
  application: Application;
  job: Job | undefined;
}

/** Applications joined to their jobs client-side (both lists are cached). */
export function useApplicationsWithJobs() {
  const applications = useApplications();
  const jobs = useJobs();

  const data = useMemo<ApplicationWithJob[] | undefined>(() => {
    if (!applications.data || !jobs.data) return undefined;
    const jobsById = new Map(jobs.data.map((job) => [job.id, job]));
    return applications.data.map((application) => ({
      application,
      job: jobsById.get(application.jobId),
    }));
  }, [applications.data, jobs.data]);

  return {
    data,
    isLoading: applications.isLoading || jobs.isLoading,
    isError: applications.isError || jobs.isError,
  };
}

export function useCreateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ApplicationCreateInput) =>
      applicationsService.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.applications.all,
      });
      toast.success("Application created");
    },
    onError: (error) =>
      toast.error(`Could not create application: ${error.message}`),
  });
}

export function useUpdateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ApplicationUpdateInput) =>
      applicationsService.update(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.applications.all,
      });
      toast.success("Application updated");
    },
    onError: (error) =>
      toast.error(`Could not update application: ${error.message}`),
  });
}

export function useDeleteApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => applicationsService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.applications.all,
      });
      toast.success("Application deleted");
    },
    onError: (error) =>
      toast.error(`Could not delete application: ${error.message}`),
  });
}
