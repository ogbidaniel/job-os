import { createBrowserRouter } from "react-router";
import { AppShell } from "@/components/layout/AppShell";
import { CalendarPage } from "@/features/calendar/pages/CalendarPage";
import { DashboardPage } from "@/features/dashboard/pages/DashboardPage";
import { JobsPage } from "@/features/jobs/pages/JobsPage";
import { JobDetailPage } from "@/features/jobs/pages/JobDetailPage";
import { ApplicationsPage } from "@/features/applications/pages/ApplicationsPage";
import { ApplicationDetailPage } from "@/features/applications/pages/ApplicationDetailPage";
import { ApplicationResumePage } from "@/features/applications/pages/ApplicationResumePage";
import { ApplicationCoverLetterPage } from "@/features/applications/pages/ApplicationCoverLetterPage";
import { ResumesPage } from "@/features/resumes/pages/ResumesPage";
import { ResumeDetailPage } from "@/features/resumes/pages/ResumeDetailPage";
import { CoverLettersPage } from "@/features/cover-letters/pages/CoverLettersPage";
import { CoverLetterDetailPage } from "@/features/cover-letters/pages/CoverLetterDetailPage";
import { RecruitersPage } from "@/features/recruiters/pages/RecruitersPage";
import { RecruiterDetailPage } from "@/features/recruiters/pages/RecruiterDetailPage";
import { SettingsPage } from "@/features/settings/pages/SettingsPage";
import { NotFoundPage } from "./NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "calendar", element: <CalendarPage /> },
      { path: "jobs", element: <JobsPage /> },
      { path: "jobs/:jobId", element: <JobDetailPage /> },
      { path: "applications", element: <ApplicationsPage /> },
      { path: "applications/:applicationId", element: <ApplicationDetailPage /> },
      {
        path: "applications/:applicationId/resume",
        element: <ApplicationResumePage />,
      },
      {
        path: "applications/:applicationId/cover-letter",
        element: <ApplicationCoverLetterPage />,
      },
      { path: "resumes", element: <ResumesPage /> },
      { path: "resumes/:resumeId", element: <ResumeDetailPage /> },
      { path: "cover-letters", element: <CoverLettersPage /> },
      { path: "cover-letters/:coverLetterId", element: <CoverLetterDetailPage /> },
      { path: "recruiters", element: <RecruitersPage /> },
      { path: "recruiters/:recruiterId", element: <RecruiterDetailPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
