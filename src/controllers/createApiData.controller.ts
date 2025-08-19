import { Request, Response } from 'express';
import { loggerUtil } from '../../expressium/index.js';
import { createApiDataService } from '../services/index.js';

export const createApiData = async (
  req: Request, 
  res: Response
): Promise<void> => {
  try {
    const { status, data } = await createApiDataService.createApiData(req);
    
    res.status(status).json(data);
  } catch (error: unknown) {
    loggerUtil.error(error instanceof Error ? error.message : String(error));

    res
      .status(500)
      .json(
        { 
          message: 'The api data creation process encountered a technical issue.',
          suggestion: 'Please try again later or contact support if the issue persists.'
        }
      );
  }
};
