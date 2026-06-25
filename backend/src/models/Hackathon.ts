import { Schema, model, Document } from 'mongoose';

export interface IRound {
  roundNumber: number;
  title: string;
  date: Date;
  deadlineTime: Date;
  isCompleted: boolean;
  mode: 'Remote' | 'Offline';
  location?: string;
  internalNotes?: string;
}

export interface IHackathon extends Document {
  userId?: Schema.Types.ObjectId;
  name: string;
  websiteLink?: string;
  globalStatus: 'Upcoming' | 'Ongoing' | 'Past';
  registrationDeadline: Date;
  requiresPrototype: boolean;
  prototypeDetails?: string;
  outcome: 'Pending' | 'Won' | 'Learned';
  totalRoundsCount: number;
  rounds: IRound[];
  createdAt: Date;
  updatedAt: Date;
}

const RoundSchema = new Schema<IRound>({
  roundNumber: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  deadlineTime: {
    type: Date,
    required: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  mode: {
    type: String,
    enum: ['Remote', 'Offline'],
    required: true,
  },
  location: {
    type: String,
    required: false,
  },
  internalNotes: {
    type: String,
    required: false,
    default: '',
  },
}, { _id: false });

const HackathonSchema = new Schema<IHackathon>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Optional for backward compatibility with unassigned items
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  websiteLink: {
    type: String,
    required: false,
    trim: true,
  },
  globalStatus: {
    type: String,
    enum: ['Upcoming', 'Ongoing', 'Past'],
    required: true,
  },
  registrationDeadline: {
    type: Date,
    required: true,
  },
  requiresPrototype: {
    type: Boolean,
    default: false,
  },
  prototypeDetails: {
    type: String,
    required: false,
  },
  outcome: {
    type: String,
    enum: ['Pending', 'Won', 'Learned'],
    default: 'Pending',
  },
  totalRoundsCount: {
    type: Number,
    default: 1,
  },
  rounds: {
    type: [RoundSchema],
    default: [],
  },
}, {
  timestamps: true,
});

// Helper function to calculate globalStatus dynamically
export function calculateGlobalStatus(registrationDeadline: Date, rounds: IRound[]): 'Upcoming' | 'Ongoing' | 'Past' {
  const now = new Date();
  const regDeadline = new Date(registrationDeadline);

  // If current date is before the registration deadline, it is Upcoming
  if (now < regDeadline) {
    return 'Upcoming';
  }

  // Find the latest end date among the registration deadline and all rounds
  let latestRoundDate = regDeadline;
  if (rounds && rounds.length > 0) {
    rounds.forEach((round) => {
      const roundDate = round.deadlineTime ? new Date(round.deadlineTime) : new Date(round.date);
      if (roundDate > latestRoundDate) {
        latestRoundDate = roundDate;
      }
    });
  }

  // If current date is past the latest deadline, it is Past
  if (now > latestRoundDate) {
    return 'Past';
  }

  // If we are past registration deadline but before the latest round deadline, it is Ongoing
  return 'Ongoing';
}

// Pre-validate hook to calculate globalStatus dynamically before saving/updating
HackathonSchema.pre('validate', function (next) {
  if (this.registrationDeadline) {
    this.globalStatus = calculateGlobalStatus(this.registrationDeadline, this.rounds);
  }
  next();
});

export const Hackathon = model<IHackathon>('Hackathon', HackathonSchema);
