# Prompt templates

Versioned prompt templates live here, one file per task version
(e.g. `resume-draft.v1.ts`). A template's version string is what callers
pass as `promptVersion` in `AiGenerateRequest` — bump the version rather
than editing a template in place so past generations stay reproducible.

Every template MUST embed the anti-fabrication constraint:

> Use only facts present in the provided source material. Never invent
> work experience, education, certifications, employers, projects, dates,
> or technical skills. If information is missing, preserve placeholders
> or ask for clarification instead of inventing content.
