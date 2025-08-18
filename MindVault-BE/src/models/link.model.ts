import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ILink extends Document {
  hash: string;
  userId: Types.ObjectId;
}

const linkSchema = new Schema<ILink>({
  hash: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'users', required: true }
}, { timestamps: true });

export const linkModel = mongoose.models.links || mongoose.model<ILink>('links', linkSchema);


