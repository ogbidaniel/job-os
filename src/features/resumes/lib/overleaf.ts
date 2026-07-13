/**
 * Opens the LaTeX source as a new Overleaf project (their documented
 * form-POST API) — the zero-infrastructure fallback if the in-app
 * compile service is ever down.
 */
export function openInOverleaf(source: string): void {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = "https://www.overleaf.com/docs";
  form.target = "_blank";

  const snip = document.createElement("textarea");
  snip.name = "snip";
  snip.value = source;
  form.appendChild(snip);

  document.body.appendChild(form);
  form.submit();
  form.remove();
}
