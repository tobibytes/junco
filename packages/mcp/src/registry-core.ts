// Registry access without Node APIs, so it also runs in Workers. registry.ts adds local folders.

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

export const isUrl = (s: string) => /^https?:\/\//.test(s);

export class NotFoundError extends Error {
  constructor(what: string) {
    super(`Not found: ${what}`);
  }
}

/** Reads registry JSON over HTTP, caching for the life of the instance. */
export class RemoteRegistry {
  readonly base: string;
  private cache = new Map<string, Promise<unknown>>();
  private readonly fetcher: typeof fetch;

  /** `fetch` lets a host add its own caching (the Worker uses the Cache API). */
  constructor(base: string = DEFAULT_REGISTRY, options: { fetch?: typeof fetch } = {}) {
    this.base = isUrl(base) ? base.replace(/\/$/, "") : base;
    this.fetcher = options.fetch ?? ((input, init) => fetch(input, init));
  }

  /** Reads one registry file. Registry (the Node class) also reads local folders. */
  protected async read(file: string): Promise<unknown> {
    const res = await this.fetcher(`${this.base}/${file}`);
    if (res.status === 404) throw new NotFoundError(file);
    if (!res.ok) throw new Error(`${this.base}/${file}: ${res.status} ${res.statusText}`);
    return res.json();
  }

  private load<T>(file: string): Promise<T> {
    let pending = this.cache.get(file) as Promise<T> | undefined;
    if (!pending) {
      pending = this.read(file) as Promise<T>;
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
