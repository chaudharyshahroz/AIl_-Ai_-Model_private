/**
 * Build mode — the AI generates a self-contained HTML/CSS/JS artifact
 * in response to a user prompt. This module extracts the HTML from the
 * model output and normalizes it for the iframe preview.
 */

export interface BuildArtifact {
  html: string;
  // Optional title and meta fields extracted from the HTML
  title?: string;
  description?: string;
}

const HTML_FENCE_RE = /```(?:html|HTML)?\s*\n([\s\S]*?)```/;
const HTML_OPEN_RE = /<!doctype html|<html[\s>]/i;

/**
 * Extract the HTML from a model's response. Tries:
 *   1. A ```html fenced block
 *   2. The first <html>...</html> block
 *   3. The entire response (assumed to be HTML)
 */
export function extractBuildArtifact(text: string): BuildArtifact | null {
  const fenced = HTML_FENCE_RE.exec(text);
  if (fenced) {
    const html = fenced[1].trim();
    return buildArtifactFromHtml(html);
  }
  if (HTML_OPEN_RE.test(text)) {
    const start = text.search(HTML_OPEN_RE);
    const html = text.slice(start).trim();
    return buildArtifactFromHtml(html);
  }
  // Fall back: treat the whole response as HTML
  if (text.trim().startsWith("<")) {
    return buildArtifactFromHtml(text.trim());
  }
  return null;
}

function buildArtifactFromHtml(html: string): BuildArtifact {
  const titleMatch = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  const descMatch = /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i.exec(html);
  return {
    html,
    title: titleMatch?.[1]?.trim(),
    description: descMatch?.[1]?.trim(),
  };
}

export const BUILD_SYSTEM_PROMPT = `You are Reklu Build, an expert front-end engineer.

When the user asks you to "build" something (a website, landing page, app screen, dashboard, etc.), you produce **a single self-contained HTML file** that runs without any build step or external dependencies.

Rules:
1. ALWAYS output a complete \`<!doctype html>\` document inside a single \`\`\`html fenced code block.
2. All CSS goes in a single \`<style>\` tag in \`<head>\`. No external stylesheets.
3. All JS goes in a single \`<script>\` tag at the end of \`<body>\`. No external scripts.
4. Use a modern, premium aesthetic: clean typography (system font stack), generous spacing, restrained color palette, smooth interactions, responsive layout.
5. Avoid placeholder lorem ipsum — use real, useful, contextual copy that matches the user's brief.
6. Include subtle micro-interactions: hover states, focus rings, transitions on interactive elements.
7. Make it work on mobile and desktop (responsive).
8. NEVER include tracking scripts, external fonts beyond Google Fonts via CDN, or any third-party network calls unless the user explicitly asks.
9. NEVER include a placeholder image URL that 404s — use \`https://images.unsplash.com/...\` only if the user mentions photography, or use CSS gradients, SVGs, or solid color blocks.
10. After the code block, write 1-2 sentences explaining what you built and how to customize it.

The user can iterate: ask for changes and you output a NEW complete HTML file with the changes applied. Don't carry state between turns — always output the full updated file.`;

export const BUILD_REWRITE_SYSTEM_PROMPT = `You are Reklu Build, an expert front-end engineer.

The user has an existing HTML artifact and wants changes. Output the COMPLETE updated HTML in a single \`\`\`html fenced code block. Don't summarize the diff — just produce the new full file.

Follow all the rules from the build system prompt (single file, no external deps, premium aesthetic, responsive).

After the code block, write 1-2 sentences about what changed.`;
