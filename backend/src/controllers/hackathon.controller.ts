import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Hackathon, calculateGlobalStatus } from '../models/Hackathon';

// Standardized asyncHandler to catch async rejections and forward to Express global error handler
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export interface CreateHackathonDto {
  name: string;
  websiteLink?: string;
  registrationDeadline: string;
  requiresPrototype?: boolean;
  prototypeDetails?: string;
  outcome?: 'Pending' | 'Won' | 'Learned';
  totalRoundsCount?: number;
  rounds?: Array<{
    roundNumber: number;
    title: string;
    date: string;
    deadlineTime: string;
    isCompleted: boolean;
    mode: 'Remote' | 'Offline';
    location?: string;
    internalNotes?: string;
  }>;
}

export interface PatchHackathonDto {
  name?: string;
  websiteLink?: string;
  registrationDeadline?: string;
  requiresPrototype?: boolean;
  prototypeDetails?: string;
  outcome?: 'Pending' | 'Won' | 'Learned';
  totalRoundsCount?: number;
  roundIndex?: number; // Target round in rounds array by index
  roundNumber?: number; // Target round in rounds array by roundNumber identifier
  isCompleted?: boolean; // Update target round's isCompleted
  date?: string; // Update target round's date
  deadlineTime?: string; // Update target round's deadlineTime
  title?: string; // Update target round's title
  mode?: 'Remote' | 'Offline'; // Update target round's mode
  location?: string; // Update target round's location
  internalNotes?: string; // Update target round's notes
  rounds?: Array<{
    roundNumber: number;
    title: string;
    date: string;
    deadlineTime: string;
    isCompleted: boolean;
    mode: 'Remote' | 'Offline';
    location?: string;
    internalNotes?: string;
  }>;
}

// Sync helper to check if globalStatus should be updated in DB
const syncStatus = async (hackathon: any) => {
  const currentStatus = calculateGlobalStatus(hackathon.registrationDeadline, hackathon.rounds);
  if (hackathon.globalStatus !== currentStatus) {
    hackathon.globalStatus = currentStatus;
    await hackathon.save();
  }
  return hackathon;
};

// CREATE a new Hackathon campaign
export const createHackathon = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as CreateHackathonDto;

  const userId = (req as any).user?._id;
  const initialStatus = calculateGlobalStatus(
    new Date(body.registrationDeadline),
    (body.rounds || []).map((r) => ({
      ...r,
      date: new Date(r.date),
      deadlineTime: new Date(r.deadlineTime),
    }))
  );

  const hackathon = new Hackathon({
    ...body,
    userId,
    globalStatus: initialStatus,
  });

  const savedHackathon = await hackathon.save();

  res.status(201).json({
    success: true,
    data: savedHackathon,
  });
});

// GET all Hackathons
export const getAllHackathons = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?._id;
  const hackathons = await Hackathon.find({
    $or: [{ userId }, { userId: { $exists: false } }],
  }).sort({ createdAt: -1 });

  // Sync lifecycle statuses dynamically to verify correct current state representation
  const syncedHackathons = await Promise.all(
    hackathons.map(async (hackathon) => {
      try {
        return await syncStatus(hackathon);
      } catch (err) {
        console.error(`Failed to sync status for ${hackathon._id}:`, err);
        return hackathon;
      }
    })
  );

  res.status(200).json({
    success: true,
    data: syncedHackathons,
  });
});

// GET a specific Hackathon by ID
export const getHackathonById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?._id;
  const hackathon = await Hackathon.findOne({
    _id: id,
    $or: [{ userId }, { userId: { $exists: false } }],
  });

  if (!hackathon) {
    res.status(404).json({
      success: false,
      data: null,
      error: 'Hackathon not found',
    });
    return;
  }

  const syncedHackathon = await syncStatus(hackathon);

  res.status(200).json({
    success: true,
    data: syncedHackathon,
  });
});

// UPDATE a Hackathon (PUT support for compatibility)
export const updateHackathon = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?._id;
  const hackathon = await Hackathon.findOne({
    _id: id,
    $or: [{ userId }, { userId: { $exists: false } }],
  });

  if (!hackathon) {
    res.status(404).json({
      success: false,
      data: null,
      error: 'Hackathon not found',
    });
    return;
  }

  Object.assign(hackathon, req.body);
  const updatedHackathon = await hackathon.save();

  res.status(200).json({
    success: true,
    data: updatedHackathon,
  });
});

// PATCH a Hackathon with specific nested round updates or top-level updates
export const patchHackathon = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?._id;
  const hackathon = await Hackathon.findOne({
    _id: id,
    $or: [{ userId }, { userId: { $exists: false } }],
  });

  if (!hackathon) {
    res.status(404).json({
      success: false,
      data: null,
      error: 'Hackathon not found',
    });
    return;
  }

  const body = req.body as PatchHackathonDto;
  const {
    roundIndex,
    roundNumber,
    isCompleted,
    date,
    deadlineTime,
    title,
    mode,
    location,
    internalNotes,
    rounds,
    ...topLevelFields
  } = body;

  let roundUpdated = false;

  // Update specific round by index in rounds array
  if (typeof roundIndex === 'number' && hackathon.rounds[roundIndex]) {
    const round = hackathon.rounds[roundIndex];
    if (isCompleted !== undefined) round.isCompleted = isCompleted;
    if (date !== undefined) round.date = new Date(date);
    if (deadlineTime !== undefined) round.deadlineTime = new Date(deadlineTime);
    if (title !== undefined) round.title = title;
    if (mode !== undefined) round.mode = mode;
    if (location !== undefined) round.location = location;
    if (internalNotes !== undefined) round.internalNotes = internalNotes;
    roundUpdated = true;
  }
  // Alternatively, update specific round by roundNumber identifier
  else if (typeof roundNumber === 'number') {
    const idx = hackathon.rounds.findIndex((r) => r.roundNumber === roundNumber);
    if (idx !== -1) {
      const round = hackathon.rounds[idx];
      if (isCompleted !== undefined) round.isCompleted = isCompleted;
      if (date !== undefined) round.date = new Date(date);
      if (deadlineTime !== undefined) round.deadlineTime = new Date(deadlineTime);
      if (title !== undefined) round.title = title;
      if (mode !== undefined) round.mode = mode;
      if (location !== undefined) round.location = location;
      if (internalNotes !== undefined) round.internalNotes = internalNotes;
      roundUpdated = true;
    }
  }

  // Update entire rounds array if explicitly passed and no individual round index matched
  if (!roundUpdated && rounds) {
    hackathon.rounds = rounds.map((r) => ({
      ...r,
      date: new Date(r.date),
      deadlineTime: new Date(r.deadlineTime),
    }));
  }

  // Assign remaining top level parameters
  Object.assign(hackathon, topLevelFields);

  // Mongoose pre-validate hook will recompute globalStatus based on deadlines
  const updatedHackathon = await hackathon.save();

  res.status(200).json({
    success: true,
    data: updatedHackathon,
  });
});

// DELETE a Hackathon
export const deleteHackathon = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?._id;
  const hackathon = await Hackathon.findOneAndDelete({
    _id: id,
    $or: [{ userId }, { userId: { $exists: false } }],
  });

  if (!hackathon) {
    res.status(404).json({
      success: false,
      data: null,
      error: 'Hackathon not found',
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      id,
      message: 'Hackathon deleted successfully',
    },
  });
});

// GET Public portfolio showcase (returns only Past concluded campaigns, strips sensitive internal notes except takeaways)
export const getPublicShowcase = asyncHandler(async (req: Request, res: Response) => {
  const hackathons = await Hackathon.find({
    globalStatus: 'Past',
    outcome: { $in: ['Won', 'Learned'] }
  }).sort({ createdAt: -1 });

  // Map to clean up nested notes that should remain private
  const publicHackathons = hackathons.map((h) => {
    const obj = h.toObject();
    
    obj.rounds = obj.rounds.map((round: any, idx: number) => {
      const isLastRound = idx === obj.rounds.length - 1;
      
      // Expose internalNotes only as the concluded post-mortem takeaways for Learned campaigns
      if (obj.outcome === 'Learned' && isLastRound) {
        return {
          roundNumber: round.roundNumber,
          title: round.title,
          date: round.date,
          deadlineTime: round.deadlineTime,
          isCompleted: round.isCompleted,
          mode: round.mode,
          location: round.location,
          internalNotes: round.internalNotes // Expose key takeaways
        };
      }

      // Strip sensitive internalNotes for won/other stages
      return {
        roundNumber: round.roundNumber,
        title: round.title,
        date: round.date,
        deadlineTime: round.deadlineTime,
        isCompleted: round.isCompleted,
        mode: round.mode,
        location: round.location
      };
    });

    return obj;
  });

  res.status(200).json({
    success: true,
    data: publicHackathons
  });
});
