import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { JOB_STATUS_LABELS, JOB_STATUS_ORDER } from "../types";
import type { JobFormValues } from "../lib/job-form";

interface JobFormProps {
  form: UseFormReturn<JobFormValues>;
  onSubmit: (values: JobFormValues) => void;
  submitLabel: string;
  submitting?: boolean;
}

interface TextFieldProps {
  form: UseFormReturn<JobFormValues>;
  name: keyof JobFormValues;
  label: string;
  placeholder?: string;
}

function TextField({ form, name, label, placeholder }: TextFieldProps) {
  return (
    <FormField
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
  );
}

interface ListFieldProps {
  form: UseFormReturn<JobFormValues>;
  name: keyof JobFormValues;
  label: string;
  rows: number;
}

function ListField({ form, name, label, rows }: ListFieldProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea rows={rows} {...field} />
          </FormControl>
          <FormDescription>One item per line.</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function JobForm({ form, onSubmit, submitLabel, submitting }: JobFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField form={form} name="company" label="Company" placeholder="Acme Corp" />
          <TextField form={form} name="title" label="Title" placeholder="Software Engineer" />
          <TextField form={form} name="location" label="Location" placeholder="Remote / City" />
          <TextField form={form} name="salary" label="Salary" placeholder="$120k–$150k" />
          <FormField
            control={form.control}
            name="postedAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Posted on</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {JOB_STATUS_ORDER.map((status) => (
                      <SelectItem key={status} value={status}>
                        {JOB_STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <TextField form={form} name="applicationUrl" label="Application URL" placeholder="https://…" />
          <TextField form={form} name="sourceUrl" label="Found at (source URL)" placeholder="https://…" />
          <TextField form={form} name="sourceSite" label="Source site" placeholder="LinkedIn / Workday / …" />
        </div>
        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>About (short summary)</FormLabel>
              <FormControl>
                <Textarea rows={2} {...field} />
              </FormControl>
              <FormDescription>
                2–3 sentences on what the role is about (AI fills this from
                the paste; edit freely).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <ListField form={form} name="responsibilities" label="What you'll do" rows={5} />
        <ListField form={form} name="requiredSkills" label="Required skills" rows={4} />
        <ListField form={form} name="preferredSkills" label="Preferred skills" rows={3} />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full posting text (verbatim)</FormLabel>
              <FormControl>
                <Textarea rows={6} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
