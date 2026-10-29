import { readFile } from "node:fs/promises";
import { isAbsolute, join, resolve } from "node:path";
import { DEFAULT_REGISTRY, isUrl, NotFoundError, RemoteRegistry } from "./registry-core";

export {
  DEFAULT_REGISTRY,
  NotFoundError,
  type PropDoc,
  type RegistryIndex,
  type RegistryItem,
  RemoteRegistry,
  SITE,
} from "./registry-core";

/** Reads registry JSON from a URL or a local folder, caching for the life of the server. */
export class Registry extends RemoteRegistry {
  private readonly folder: string | undefined;

  constructor(base: string = DEFAULT_REGISTRY, cwd = process.cwd()) {
    super(isUrl(base) ? base : isAbsolute(base) ? base : resolve(cwd, base));
    this.folder = isUrl(base) ? undefined : this.base;
  }

  protected override async read(file: string): Promise<unknown> {
    if (!this.folder) return super.read(file);
    try {
      return JSON.parse(await readFile(join(this.folder, file), "utf8"));
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") throw new NotFoundError(file);
      throw err;
    }
  }
}
