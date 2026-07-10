import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { Profile } from "@/types/models";
import { useProfile, useUpdateProfile } from "../hooks/use-profile";

const optionalUrl = z.union([z.literal(""), z.url({ error: "Must be a valid URL" })]);

const aboutSchema = z.object({
  fullName: z.string(),
  headline: z.string(),
  location: z.string(),
  email: z.union([z.literal(""), z.email({ error: "Must be a valid email" })]),
  phone: z.string(),
  linkedin: optionalUrl,
  github: optionalUrl,
  website: optionalUrl,
  summary: z.string(),
});

type AboutValues = z.infer<typeof aboutSchema>;

function toValues(profile: Profile | undefined): AboutValues {
  return {
    fullName: profile?.fullName ?? "",
    headline: profile?.headline ?? "",
    location: profile?.location ?? "",
    email: profile?.email ?? "",
    phone: profile?.phone ?? "",
    linkedin: profile?.linkedin ?? "",
    github: profile?.github ?? "",
    website: profile?.website ?? "",
    summary: profile?.summary ?? "",
  };
}

export function AboutTab() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const form = useForm<AboutValues>({
    resolver: zodResolver(aboutSchema),
    // `values` keeps the form in sync when the profile loads/refreshes.
    values: toValues(profile),
  });

  if (isLoading) {
    return <Skeleton className="h-80 w-full" />;
  }

  function handleSubmit(values: AboutValues) {
    if (!profile) return;
    updateProfile.mutate({
      id: profile.id,
      fullName: values.fullName || null,
      headline: values.headline || null,
      location: values.location || null,
      email: values.email || null,
      phone: values.phone || null,
      linkedin: values.linkedin || null,
      github: values.github || null,
      website: values.website || null,
      summary: values.summary || null,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="max-w-2xl space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["fullName", "Full name", "Daniel Ogbuigwe"],
              ["headline", "Headline", "CS graduate researcher — AI/ML"],
              ["location", "Location", "Houston, TX"],
              ["email", "Email", "you@example.com"],
              ["phone", "Phone", "+1 …"],
              ["linkedin", "LinkedIn", "https://linkedin.com/in/…"],
              ["github", "GitHub", "https://github.com/…"],
              ["website", "Website", "https://…"],
            ] as const
          ).map(([name, label, placeholder]) => (
            <FormField
              key={name}
              control={form.control}
              name={name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{label}</FormLabel>
                  <FormControl>
                    <Input placeholder={placeholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Professional summary</FormLabel>
              <FormControl>
                <Textarea rows={5} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={updateProfile.isPending}>
            Save profile
          </Button>
        </div>
      </form>
    </Form>
  );
}
