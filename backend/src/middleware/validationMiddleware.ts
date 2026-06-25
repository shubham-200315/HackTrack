import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

const RoundValidationSchema = z.object({
  roundNumber: z.number({ required_error: 'Round number is required' }).int().positive(),
  title: z.string({ required_error: 'Round title is required' }).trim().min(1),
  date: z.preprocess((val) => (typeof val === 'string' ? new Date(val) : val), z.date({
    required_error: 'Round date is required',
    invalid_type_error: 'Round date must be a valid date',
  })),
  deadlineTime: z.preprocess((val) => (typeof val === 'string' ? new Date(val) : val), z.date({
    required_error: 'Round deadline time is required',
    invalid_type_error: 'Round deadline time must be a valid date',
  })),
  isCompleted: z.boolean().default(false),
  mode: z.enum(['Remote', 'Offline'], {
    required_error: 'Round mode must be Remote or Offline',
  }),
  location: z.string().trim().optional(),
  internalNotes: z.string().trim().optional().default(''),
});

export const CreateHackathonValidationSchema = z.object({
  name: z.string({ required_error: 'Hackathon name is required' }).trim().min(1),
  websiteLink: z.string().url('Website link must be a valid URL').trim().optional().or(z.literal('')),
  registrationDeadline: z.preprocess((val) => (typeof val === 'string' ? new Date(val) : val), z.date({
    required_error: 'Registration deadline is required',
    invalid_type_error: 'Registration deadline must be a valid date',
  })),
  requiresPrototype: z.boolean().default(false),
  prototypeDetails: z.string().trim().optional(),
  outcome: z.enum(['Pending', 'Won', 'Learned']).default('Pending'),
  totalRoundsCount: z.number().int().nonnegative().default(1),
  rounds: z.array(RoundValidationSchema).default([]),
});

export const UpdateHackathonValidationSchema = CreateHackathonValidationSchema.partial();

export const validateBody = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync(req.body);
      req.body = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMsg = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
        res.status(400).json({
          success: false,
          data: null,
          error: `Validation failed: ${errorMsg}`,
        });
        return;
      }
      res.status(500).json({
        success: false,
        data: null,
        error: 'Internal validation server error',
      });
    }
  };
};
