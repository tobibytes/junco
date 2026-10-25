import { readFile } from "node:fs/promises";
import { isAbsolute, join, resolve } from "node:path";

export const DEFAULT_REGISTRY = "https://junco.madebytobi.com/r";
export const SITE = "https://junco.madebytobi.com";

export interface PropDoc {
  name: string;
  type: string;
  optional: boolean;
  description?: string;
}

export interface RegistryItem {
  name: string;
  type: string;
  title?: string;
  description?: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files?: Array<{ path: string; type: string; content?: string; target?: string }>;
  css?: Record<string, unknown>;
  docs?: string;
  meta?: {
    hash?: string;
    source?: string;
    exports?: string[];
    props?: Record<string, { extends?: string; props: PropDoc[] }>;
    variants?: { variants: Record<string, string[]>; defaultVariants: Record<string, string> };
    usage?: string;
    docsUrl?: string;
  };
}

export interface RegistryIndex {
  name: string;
  homepage?: string;
  items: RegistryItem[];
}

const isUrl = (s: string) => /^https?:\/\//.test(s);

/** Reads registry JSON from a URL or a local folder, caching for the life of the server. */
export class Registry {
  readonly base: string;
  private cache = new Map<string, Promise<unknown>>();

  constructor(base: string = DEFAULT_REGISTRY, cwd = process.cwd()) {
    this.base = isUrl(base) ? base.replace(/\/$/, "") : isAbsolute(base) ? base : resolve(cwd, base);
  }

  private load<T>(file: string): Promise<T> {
    let pending = this.cache.get(file) as Promise<T> | undefined;
    if (!pending) {
      pending = (async () => {
        if (isUrl(this.base)) {
          const res = await fetch(`${this.base}/${file}`);
          if (res.status === 404) throw new NotFoundError(file);
          if (!res.ok) throw new Error(`${this.base}/${file}: ${res.status} ${res.statusText}`);
          return (await res.json()) as T;
        }
        try {
          return JSON.parse(await readFile(join(this.base, file), "utf8")) as T;
        } catch (err) {
          if ((err as NodeJS.ErrnoException).code === "ENOENT") throw new NotFoundError(file);
          throw err;
        }
      })();
      pending.catch(() => this.cache.delete(file));
      this.cache.set(file, pending);
    }
    return pending;
  }

  index(): Promise<RegistryIndex> {
    return this.load<RegistryIndex>("registry.json");
  }

  item(name: string): Promise<RegistryItem> {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) return Promise.reject(new NotFoundError(name));
    return this.load<RegistryItem>(`${name}.json`);
  }
}

export class NotFoundError extends Error {
  constructor(what: string) {
    super(`Not found: ${what}`);
  }
}
