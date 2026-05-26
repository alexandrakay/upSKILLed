import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

export function slugify(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function buildExamplesMd(name, examples) {
  const lines = [`# ${name} Examples\n`];
  examples.forEach((ex, i) => {
    lines.push(`### ${i + 1}. ${ex.description || ex.prompt}`);
    lines.push('');
    lines.push(`> ${ex.prompt}`);
    lines.push('');
  });
  return lines.join('\n');
}

export function formatContent(result, nameOverride) {
  const configName = result.config?.name ?? result.config?.service ?? result.skill?.name;
  const prefix = nameOverride ? slugify(nameOverride) : slugify(configName);
  if (!prefix || prefix === 'undefined') {
    throw new Error(`Could not determine skill name. config.name=${result.config?.name}, config.service=${result.config?.service}`);
  }
  const skillContent =
    result.skill?.markdownContent ??
    result.skill?.content ??
    result.skill?.markdown ??
    '';
  return {
    name: prefix,
    skillContent,
    configContent: JSON.stringify(result.config ?? {}, null, 2),
    examplesContent: buildExamplesMd(result.skill?.name ?? prefix, result.examples ?? []),
  };
}

export async function writeFiles(result, { output, name } = {}) {
  const prefix = name ? slugify(name) : slugify(result.config.name);
  const outDir = output || process.cwd();

  await mkdir(outDir, { recursive: true });

  const files = {
    [`${prefix}-skill.md`]: result.skill.markdownContent,
    [`${prefix}-config.json`]: JSON.stringify(result.config, null, 2),
    [`${prefix}-examples.md`]: buildExamplesMd(result.skill.name, result.examples),
  };

  await Promise.all(
    Object.entries(files).map(([filename, content]) =>
      writeFile(join(outDir, filename), content, 'utf8')
    )
  );

  return { prefix, outDir, files: Object.keys(files) };
}
