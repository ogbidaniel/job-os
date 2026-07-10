import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import {
  evidenceService,
  experiencesService,
  profileService,
  type EvidenceCreateInput,
  type EvidenceUpdateInput,
  type ExperienceCreateInput,
  type ExperienceUpdateInput,
  type ProfileUpdateInput,
} from "../api/profile-service";

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile.self,
    queryFn: () => profileService.getOrCreate(),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProfileUpdateInput) => profileService.update(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile.self });
      toast.success("Profile saved");
    },
    onError: (error) => toast.error(`Could not save profile: ${error.message}`),
  });
}

export function useExtractProfile() {
  return useMutation({
    mutationFn: (text: string) => profileService.extractFromText(text),
    onError: (error) => toast.error(`Extraction failed: ${error.message}`),
  });
}

export function useImportProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (options: Parameters<typeof profileService.importSelected>[0]) =>
      profileService.importSelected(options),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile.self });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.experiences.all,
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.evidence.all });
      toast.success(
        `Imported ${result.experiences} experiences and ${result.evidence} evidence items${result.about ? ", plus your About info" : ""}`,
      );
    },
    onError: (error) => toast.error(`Import failed: ${error.message}`),
  });
}

export function useExperiences() {
  return useQuery({
    queryKey: queryKeys.experiences.all,
    queryFn: () => experiencesService.list(),
  });
}

export function useCreateExperience() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ExperienceCreateInput) =>
      experiencesService.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.experiences.all,
      });
      toast.success("Experience saved");
    },
    onError: (error) =>
      toast.error(`Could not save experience: ${error.message}`),
  });
}

export function useUpdateExperience() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ExperienceUpdateInput) =>
      experiencesService.update(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.experiences.all,
      });
      toast.success("Experience updated");
    },
    onError: (error) =>
      toast.error(`Could not update experience: ${error.message}`),
  });
}

export function useDeleteExperience() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => experiencesService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.experiences.all,
      });
      toast.success("Experience deleted");
    },
    onError: (error) =>
      toast.error(`Could not delete experience: ${error.message}`),
  });
}

export function useEvidenceItems() {
  return useQuery({
    queryKey: queryKeys.evidence.all,
    queryFn: () => evidenceService.list(),
  });
}

export function useCreateEvidence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: EvidenceCreateInput) => evidenceService.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.evidence.all });
      toast.success("Evidence saved");
    },
    onError: (error) =>
      toast.error(`Could not save evidence: ${error.message}`),
  });
}

export function useUpdateEvidence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: EvidenceUpdateInput) => evidenceService.update(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.evidence.all });
      toast.success("Evidence updated");
    },
    onError: (error) =>
      toast.error(`Could not update evidence: ${error.message}`),
  });
}

export function useDeleteEvidence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => evidenceService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.evidence.all });
      toast.success("Evidence deleted");
    },
    onError: (error) =>
      toast.error(`Could not delete evidence: ${error.message}`),
  });
}
