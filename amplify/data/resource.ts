import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { compileLatex } from "../functions/compile-latex/resource";
import { extractJob } from "../functions/extract-job/resource";
import { scoreFit } from "../functions/score-fit/resource";

/**
 * Job OS data model.
 *
 * Application is the hub entity: it owns every reference field
 * (jobId, resumeId, coverLetterId, recruiterId) so that jobs, master
 * documents, and recruiters can exist independently and be reused
 * across applications.
 *
 * Enum values are semi-frozen: changing them later is a breaking schema
 * change. Status defaults (Job -> NEW, Application -> SAVED) are enforced
 * in the service layer because Amplify enums cannot declare defaults.
 */
const schema = a.schema({
  JobStatus: a.enum(["NEW", "REVIEWED", "CLOSED", "ARCHIVED"]),
  ApplicationStatus: a.enum([
    "SAVED",
    "DRAFTING",
    "APPLIED",
    "INTERVIEWING",
    "OFFER",
    "REJECTED",
    "WITHDRAWN",
    "GHOSTED",
  ]),
  DocumentKind: a.enum(["MASTER", "TAILORED"]),

  Job: a
    .model({
      company: a.string().required(),
      title: a.string().required(),
      description: a.string(),
      requirements: a.string(),
      location: a.string(),
      // Free text: ranges, currencies, and "DOE" vary too much to structure.
      salary: a.string(),
      applicationUrl: a.url(),
      sourceUrl: a.url(),
      // When the posting was published (record save date is createdAt).
      postedAt: a.datetime(),
      status: a.ref("JobStatus"),
      // Structured extraction (job-extract.v3): summary is the one
      // AI-written field; the lists are verbatim posting bullets.
      summary: a.string(),
      responsibilities: a.string().array(),
      requiredSkills: a.string().array(),
      preferredSkills: a.string().array(),
      sourceSite: a.string(),
      // The original paste, kept verbatim for provenance/re-extraction.
      rawPosting: a.string(),
      // AI fit vs the user's profile; fitReport is JSON
      // { summary, matchedSkills[], gaps[] }.
      fitScore: a.integer(),
      fitReport: a.string(),
      applications: a.hasMany("Application", "jobId"),
    })
    .authorization((allow) => [allow.owner()]),

  Application: a
    .model({
      status: a.ref("ApplicationStatus").required(),
      appliedAt: a.datetime(),
      notes: a.string(),
      jobId: a.id().required(),
      job: a.belongsTo("Job", "jobId"),
      resumeId: a.id(),
      resume: a.belongsTo("Resume", "resumeId"),
      coverLetterId: a.id(),
      coverLetter: a.belongsTo("CoverLetter", "coverLetterId"),
      recruiterId: a.id(),
      recruiter: a.belongsTo("Recruiter", "recruiterId"),
    })
    .authorization((allow) => [allow.owner()]),

  Resume: a
    .model({
      kind: a.ref("DocumentKind").required(),
      label: a.string().required(),
      content: a.string(),
      // Master resume this tailored copy derives from; resolved in services,
      // deliberately not a modeled self-relationship.
      sourceResumeId: a.id(),
      applications: a.hasMany("Application", "resumeId"),
    })
    .authorization((allow) => [allow.owner()]),

  CoverLetter: a
    .model({
      kind: a.ref("DocumentKind").required(),
      label: a.string().required(),
      content: a.string(),
      applications: a.hasMany("Application", "coverLetterId"),
    })
    .authorization((allow) => [allow.owner()]),

  // AI queries transport JSON strings; feature services parse and type
  // them (src/features/*/api). Fields absent from the pasted source come
  // back null (anti-fabrication rule in the handlers).
  extractJob: a
    .query()
    // "today" = the browser's local calendar date, for resolving
    // relative posting dates ("8 hours ago") in the user's timezone.
    .arguments({ text: a.string().required(), today: a.string() })
    .returns(a.string())
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(extractJob)),

  /** LaTeX → PDF; returns JSON { pdfBase64 } or { error, log }. */
  compileLatex: a
    .query()
    .arguments({ source: a.string().required() })
    .returns(a.string())
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(compileLatex)),

  scoreFit: a
    .query()
    .arguments({
      jobContext: a.string().required(),
      profileContext: a.string().required(),
    })
    .returns(a.string())
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(scoreFit)),

  ExperienceKind: a.enum([
    "WORK",
    "PROJECT",
    "EDUCATION",
    "CERTIFICATION",
    "VOLUNTEER",
    "OTHER",
  ]),
  EvidenceKind: a.enum([
    "CERTIFICATE",
    "POST",
    "VIDEO",
    "ARTICLE",
    "RECOMMENDATION",
    "PAPER",
    "OTHER",
  ]),

  Experience: a
    .model({
      kind: a.ref("ExperienceKind").required(),
      title: a.string().required(),
      organization: a.string(),
      location: a.string(),
      startDate: a.date(),
      endDate: a.date(),
      isCurrent: a.boolean(),
      // Newline-separated bullets, kept as the user wrote them.
      description: a.string(),
      skills: a.string().array(),
    })
    .authorization((allow) => [allow.owner()]),

  Evidence: a
    .model({
      kind: a.ref("EvidenceKind").required(),
      title: a.string().required(),
      url: a.url(),
      // Where it lives: "YouTube", "LinkedIn", "arXiv", ...
      source: a.string(),
      date: a.date(),
      description: a.string(),
      skills: a.string().array(),
    })
    .authorization((allow) => [allow.owner()]),

  /** Singleton by convention: the service get-or-creates the one record. */
  Profile: a
    .model({
      fullName: a.string(),
      headline: a.string(),
      location: a.string(),
      email: a.email(),
      phone: a.string(),
      linkedin: a.url(),
      github: a.url(),
      website: a.url(),
      summary: a.string(),
    })
    .authorization((allow) => [allow.owner()]),

  Recruiter: a
    .model({
      name: a.string().required(),
      company: a.string(),
      email: a.email(),
      // Plain string: AWSPhone validation rejects many real-world formats.
      phone: a.string(),
      linkedin: a.url(),
      notes: a.string(),
      applications: a.hasMany("Application", "recruiterId"),
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
