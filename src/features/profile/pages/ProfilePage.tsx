import { useState } from "react";
import { Import } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/layout/PageHeader";
import { AboutTab } from "../components/AboutTab";
import { EvidenceTab } from "../components/EvidenceTab";
import { ExperienceTab } from "../components/ExperienceTab";
import { ImportProfileDialog } from "../components/ImportProfileDialog";
import { useProfile } from "../hooks/use-profile";

export function ProfilePage() {
  const { data: profile } = useProfile();
  const [importOpen, setImportOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Profile"
        description="Your private career vault — it feeds fit scores and resume generation."
        actions={
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Import className="size-4" aria-hidden />
            Import master document
          </Button>
        }
      />

      <Tabs defaultValue="about">
        <TabsList>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
        </TabsList>
        <TabsContent value="about" className="pt-4">
          <AboutTab />
        </TabsContent>
        <TabsContent value="experience" className="pt-4">
          <ExperienceTab />
        </TabsContent>
        <TabsContent value="evidence" className="pt-4">
          <EvidenceTab />
        </TabsContent>
      </Tabs>

      <ImportProfileDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        profileId={profile?.id}
      />
    </>
  );
}
