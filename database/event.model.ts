import { model, models, Schema } from "mongoose";

export interface Event {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const nonEmptyString = (value: string): boolean => value.trim().length > 0;
const nonEmptyStringArray = (values: string[]): boolean =>
  values.length > 0 && values.every(nonEmptyString);

const toSlug = (title: string): string =>
  title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeDate = (date: string): string => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Event date must be a valid date");
  }

  return parsedDate.toISOString();
};

const normalizeTime = (time: string): string => {
  const trimmedTime = time.trim();
  const match = /^(\d{1,2}):(\d{2})(?:\s*([ap]m))?$/i.exec(trimmedTime);

  if (!match) {
    throw new Error("Event time must use HH:mm or h:mm AM/PM format");
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3]?.toLowerCase();

  if (minutes > 59 || hours > (period ? 12 : 23) || (period && hours === 0)) {
    throw new Error("Event time is out of range");
  }

  if (period) {
    if (period === "pm" && hours !== 12) hours += 12;
    if (period === "am" && hours === 12) hours = 0;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const eventSchema = new Schema<Event>(
  {
    title: { type: String, required: true, validate: nonEmptyString },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true, validate: nonEmptyString },
    overview: { type: String, required: true, validate: nonEmptyString },
    image: { type: String, required: true, validate: nonEmptyString },
    venue: { type: String, required: true, validate: nonEmptyString },
    location: { type: String, required: true, validate: nonEmptyString },
    date: { type: String, required: true, validate: nonEmptyString },
    time: { type: String, required: true, validate: nonEmptyString },
    mode: { type: String, required: true, validate: nonEmptyString },
    audience: { type: String, required: true, validate: nonEmptyString },
    agenda: { type: [String], required: true, validate: nonEmptyStringArray },
    organizer: { type: String, required: true, validate: nonEmptyString },
    tags: { type: [String], required: true, validate: nonEmptyStringArray },
  },
  { timestamps: true },
);

eventSchema.pre("save", function () {
  // Regenerate the URL slug only when its source title changes.
  if (this.isModified("title") || !this.slug) {
    this.slug = toSlug(this.title);
  }

  if (!this.slug) {
    throw new Error("Event title must contain letters or numbers");
  }

  // Store dates as ISO strings and times as zero-padded 24-hour values.
  this.date = normalizeDate(this.date);
  this.time = normalizeTime(this.time);
});

export const Event = models.Event ?? model<Event>("Event", eventSchema);