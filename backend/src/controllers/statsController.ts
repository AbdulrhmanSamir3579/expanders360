import { Request, Response } from 'express';
import { mockDataService } from '../services/mockData';

export const getOverview = (req: Request, res: Response): void => {
  try {
    const stats = mockDataService.getOverviewStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching overview stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTimeline = (req: Request, res: Response): void => {
  try {
    const events = mockDataService.getTimelineEvents();
    res.json(events);
  } catch (error) {
    console.error('Error fetching timeline events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAnomalies = (req: Request, res: Response): void => {
  try {
    const anomalies = mockDataService.getAnomalies();
    res.json(anomalies);
  } catch (error) {
    console.error('Error fetching anomalies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
