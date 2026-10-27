import { readFile } from "node:fs/promises";
import { basename, isAbsolute, join, resolve } from "node:path";

export const DEFAULT_REGISTRY = "https://junco.madebytobi.com/r";

export interface RegistryFile {
  path: string;
  type: string;
  content?: string;
  target?: string;
}

export interface RegistryItem {
  name: string;
  type: string;
  title?: string;
  description?: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files?: RegistryFile[];
  meta?: { hash?: string; [key: string]: unknown };
}

export interface RegistryIndex {
  name: string;
  homepage?: string;
  items: RegistryItem[];
}

/** An app template for `junco create`, from <registry>/templates/<name>.json. */
export interface TemplateSummary {
  name: string;
  title?: string;
  description?: string;
  pages?: string[];
}

export interface Template extends TemplateSummary {
  files: { path: string; content: string }[];
  meta?: { hash?: string; [key: string]: unknown };
}

/** A full page in @junco/blocks, from <registry>/pages/index.json, for `junco add page`. */
export interface PageSummary {
  name: string;
  slug: string;
  title: string;
  description?: string;
  component: string;
  importFrom: string;
  sourceEntry?: string;
  /** First one is the default. */
  variants: string[];
  docs?: string;
  sourceFiles?: string[];
}

export interface PageIndex {
  /** Packages a page needs, as install specs (`@junco/blocks@^0.1.4`). */
  dependencies: string[];
  pages: PageSummary[];
}

const isUrl = (s: string) => /^https?:\/\//.test(s);

/** A registry is a base URL (https://junco.madebytobi.com/r) or a local folder holding <name>.json files. */
export class Registry {
  readonly base: string;
  private cache = new Map<string, Promise<RegistryItem>>();

  constructor(base: string, cwd = process.cwd()) {
    this.base = isUrl(base) ? base.replace(/\/$/, "") : isAbsolute(base) ? base : resolve(cwd, base);
  }

  private async readJson<T>(ref: string): Promise<T> {
    if (isUrl(ref)) {
      let res: Response;
      try {
        res = await fetch(ref);
      } catch (err) {
        throw new Error(`Could not reach ${ref}: ${(err as Error).message}`);
      }
      if (res.status === 404) throw new Error(`Not found in registry: ${ref}`);
      if (!res.ok) throw new Error(`${ref}: ${res.status} ${res.statusText}`);
      return (await res.json()) as T;
    }
    try {
      return JSON.parse(await readFile(ref, "utf8")) as T;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") throw new Error(`Not found in registry: ${ref}`);
      throw err;
    }
  }

  private ref(name: string) {
    return isUrl(this.base) ? `${this.base}/${name}.json` : join(this.base, `${name}.json`);
  }

  index(): Promise<RegistryIndex> {
    return this.readJson<RegistryIndex>(this.ref("registry"));
  }

  async templates(): Promise<TemplateSummary[]> {
    return (await this.readJson<{ templates: TemplateSummary[] }>(this.ref("templates/index"))).templates;
  }

  pages(): Promise<PageIndex> {
    return this.readJson<PageIndex>(this.ref("pages/index")).catch((err: Error) => {
      if (err.message.startsWith("Not found")) throw new Error("This registry has no page index (pages/index.json).");
      throw err;
    });
  }

  pageSource(path: string): Promise<string> {
    if (!/^(?:[a-z0-9-]+\/)*[a-z0-9-]+\.tsx?$/.test(path)) throw new Error("Invalid page source path in registry.");
    const ref = isUrl(this.base) ? `${this.base}/pages/source/${path}` : join(this.base, "pages", "source", path);
    if (isUrl(ref)) return fetch(ref).then(async (res) => {
      if (!res.ok) throw new Error(`Could not read page source ${path}: ${res.status} ${res.statusText}`);
      return res.text();
    });
    return readFile(ref, "utf8");
  }

  template(name: string): Promise<Template> {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) throw new Error(`"${name}" isn't a template name. Run \`junco create --list\` to see them.`);
    return this.readJson<Template>(this.ref(`templates/${name}`)).catch((err: Error) => {
      if (err.message.startsWith("Not found")) throw new Error(`Unknown template "${name}". Run \`junco create --list\` to see them.`);
      throw err;
    });
  }

  /** Fetch by name, or by full URL for items from another registry. */
  item(nameOrUrl: string): Promise<RegistryItem> {
    let pending = this.cache.get(nameOrUrl);
    if (!pending) {
      const ref = isUrl(nameOrUrl) ? nameOrUrl : this.ref(nameOrUrl);
      pending = this.readJson<RegistryItem>(ref).catch((err: Error) => {
        this.cache.delete(nameOrUrl);
        if (err.message.startsWith("Not found")) {
          throw new Error(`Unknown component "${nameOrUrl}". Run \`junco list\` to see what's available.`);
        }
        throw err;
      });
      this.cache.set(nameOrUrl, pending);
    }
    return pending;
  }

  /**
   * A dependency as written in registryDependencies. Junco's own items are full URLs (so plain
   * shadcn can follow them); map those back to names in whatever registry we're reading.
   */
  depRef(dep: string): string {
    if (!isUrl(dep)) return dep;
    if (dep.startsWith(`${DEFAULT_REGISTRY}/`) || (isUrl(this.base) && dep.startsWith(`${this.base}/`))) {
      return basename(dep, ".json");
    }
    return dep;
  }

  /** The items plus every registry dependency, dependencies first. */
  async resolveTree(names: string[]): Promise<RegistryItem[]> {
    const ordered: RegistryItem[] = [];
    const seen = new Set<string>();
    const visit = async (ref: string) => {
      if (seen.has(ref)) return;
      seen.add(ref);
      const item = await this.item(ref);
      for (const dep of item.registryDependencies ?? []) await visit(this.depRef(dep));
      ordered.push(item);
    };
    for (const name of names) await visit(name);
    return ordered;
  }
}
