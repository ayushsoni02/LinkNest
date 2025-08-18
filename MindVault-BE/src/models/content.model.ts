import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IContent extends Document {
  title?: string;
  link: string;
  tags: Types.ObjectId[];
  type?: string;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const contentSchema = new Schema<IContent>({
  title: { type: String },
  link: { type: String, required: true },
  tags: [{ type: Schema.Types.ObjectId, ref: 'tags' }],
  type: { type: String },
  userId: { type: Schema.Types.ObjectId, ref: 'users', required: true }
}, { timestamps: true });

export const ContentModel = mongoose.models.contents || mongoose.model<IContent>('contents', contentSchema);


