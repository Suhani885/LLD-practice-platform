import type { Schema } from "mongoose";

export function applyIdTransform(schema: Schema<any>): void {
  schema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: (_doc: unknown, ret: any) => {
      if (ret._id) {
        ret.id = String(ret._id);
        delete ret._id;
      }
      return ret;
    },
  });
}
