import { Schema } from "mongoose";
import { applyIdTransform } from "../utils/mongoose";
import type { ClassMember, ClassMethod, ClassRelationship, DesignEntity, DesignModel } from "../domain/types";

const classMemberSchema = new Schema<ClassMember>(
  {
    name: { type: String, default: "" },
    type: { type: String, default: "" },
  },
  { _id: false },
);

const classMethodSchema = new Schema<ClassMethod>(
  {
    name: { type: String, default: "" },
    signature: { type: String, default: "" },
  },
  { _id: false },
);

const designEntitySchema = new Schema<DesignEntity>({
  kind: { type: String, enum: ["class", "interface", "enum"], required: true },
  name: { type: String, default: "", trim: true },
  fields: { type: [classMemberSchema], default: [] },
  methods: { type: [classMethodSchema], default: [] },
  implementsOrExtends: { type: [String], default: [] },
  responsibility: { type: String, default: "" },
});
applyIdTransform(designEntitySchema);

const classRelationshipSchema = new Schema<ClassRelationship>({
  fromClassName: { type: String, default: "" },
  toClassName: { type: String, default: "" },
  kind: {
    type: String,
    enum: ["association", "aggregation", "composition", "inheritance", "implementation"],
    required: true,
  },
  label: { type: String },
});
applyIdTransform(classRelationshipSchema);

export const designModelSchema = new Schema<DesignModel>(
  {
    entities: { type: [designEntitySchema], default: [] },
    relationships: { type: [classRelationshipSchema], default: [] },
  },
  { _id: false },
);

export function emptyDesignModel(): DesignModel {
  return { entities: [], relationships: [] };
}
