/** Downloads plain text as a file via a temporary object URL. */
export function downloadText(filename: string, text: string): void {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

/** Turns a label into a safe filename stem. */
export function toFilenameStem(label: string, fallback: string): string {
  const stem = label.replace(/[^\w\- ]+/g, "").trim();
  return stem || fallback;
}
