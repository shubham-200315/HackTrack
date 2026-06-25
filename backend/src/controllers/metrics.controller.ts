import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Hackathon } from '../models/Hackathon';
import { asyncHandler } from './hackathon.controller';

export const getDashboardMetrics = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?._id;
  const userObjectId = userId ? new mongoose.Types.ObjectId(userId) : null;

  const result = await Hackathon.aggregate([
    {
      $match: {
        $or: [
          { userId: userObjectId },
          { userId: { $exists: false } }
        ]
      }
    },
    {
      $group: {
        _id: null,
        totalBattles: { $sum: 1 },
        activeCampaigns: {
          $sum: {
            $cond: [
              { $in: ['$globalStatus', ['Upcoming', 'Ongoing']] },
              1,
              0
            ]
          }
        },
        pastWonCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$globalStatus', 'Past'] },
                  { $eq: ['$outcome', 'Won'] }
                ]
              },
              1,
              0
            ]
          }
        },
        pastTotalCount: {
          $sum: {
            $cond: [
              { $eq: ['$globalStatus', 'Past'] },
              1,
              0
            ]
          }
        },
        knowledgeReturn: {
          $sum: {
            $cond: [
              { $eq: ['$outcome', 'Learned'] },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalBattles: 1,
        activeCampaigns: 1,
        knowledgeReturn: 1,
        winRate: {
          $cond: [
            { $gt: ['$pastTotalCount', 0] },
            { $multiply: [{ $divide: ['$pastWonCount', '$pastTotalCount'] }, 100] },
            0
          ]
        }
      }
    }
  ]);

  const defaultMetrics = {
    totalBattles: 0,
    activeCampaigns: 0,
    winRate: 0,
    knowledgeReturn: 0
  };

  const metrics = result[0] || defaultMetrics;

  // Round winRate to nearest integer for simple representation
  metrics.winRate = Math.round(metrics.winRate);

  res.status(200).json({
    success: true,
    data: metrics
  });
});
