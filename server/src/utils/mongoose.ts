import type { Schema } from "mongoose";

export function applyIdTransform(schema: Schema<any>, refRenames: Record<string, string> = {}): void {
  schema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: (_doc: unknown, ret: any) => {
      if (ret._id) {
        ret.id = String(ret._id);
        delete ret._id;
      }
      for (const [from, to] of Object.entries(refRenames)) {
        if (ret[from] !== undefined) {
          ret[to] = String(ret[from]);
          if (to !== from) delete ret[from];
        }
      }
      return ret;
    },
  });
}
