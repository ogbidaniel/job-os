import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

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
