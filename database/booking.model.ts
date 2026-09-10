import { model, models, Schema, Types } from "mongoose";

import connectToDatabase from "@/lib/mongodb";
import { Event } from "./event.model";

export interface Booking {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const bookingSchema = new Schema<Booking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: emailPattern,
    },
  },
  { timestamps: true },
);

bookingSchema.pre("save", async function () {
  // Confirm the referenced event exists before accepting the booking.
  await connectToDatabase();

  const eventExists = await Event.exists({ _id: this.eventId });
  if (!eventExists) {
    throw new Error("Cannot create booking: event does not exist");
  }
});

export const Booking = models.Booking ?? model<Booking>("Booking", bookingSchema);