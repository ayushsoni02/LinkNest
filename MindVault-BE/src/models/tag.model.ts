import mongoose, { Document, Schema } from 'mongoose';

export interface ITag extends Document {
  title: string;
}

const tagSchema = new Schema<ITag>({
  title: { type: String, required: true }
}, { timestamps: true });

export const tagModel = mongoose.models.tags || mongoose.model<ITag>('tags', tagSchema);


