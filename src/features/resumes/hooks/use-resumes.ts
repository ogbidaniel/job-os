import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import { DEFAULT_RESUME_TEMPLATE } from "@/content/resume-template";
import {
  resumesService,
  type ResumeCreateInput,
  type ResumeUpdateInput,
} from "../api/resumes-service";

/** The category's resume record, seeded with the template on first visit. */
export function useCategoryResume(category: string) {
  return useQuery({
    queryKey: queryKeys.resumes.category(category),
    queryFn: () =>
      resumesService.getOrCreateByLabel(category, DEFAULT_RESUME_TEMPLATE),
  });
}

export function useCompileLatex() {
  return useMutation({
    mutationFn: (source: string) => resumesService.compile(source),
    onError: (error) => toast.error(`Compile request failed: ${error.message}`),
  });
}

export function useResumes() {
  return useQuery({
    queryKey: queryKeys.resumes.all,
    queryFn: () => resumesService.list(),
  });
}

export function useResume(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.resumes.detail(id ?? ""),
    queryFn: () => resumesService.get(id ?? ""),
    enabled: Boolean(id),
  });
}

export function useCreateResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ResumeCreateInput) => resumesService.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.resumes.all });
      toast.success("Resume saved");
    },
    onError: (error) => toast.error(`Could not save resume: ${error.message}`),
  });
}

export function useUpdateResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ResumeUpdateInput) => resumesService.update(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.resumes.all });
      toast.success("Resume updated");
    },
    onError: (error) =>
      toast.error(`Could not update resume: ${error.message}`),
  });
}

export function useDeleteResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resumesService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.resumes.all });
      toast.success("Resume deleted");
    },
    onError: (error) =>
      toast.error(`Could not delete resume: ${error.message}`),
  });
}
