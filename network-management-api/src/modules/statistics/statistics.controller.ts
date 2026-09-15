import { Request, Response } from "express";
import { sendSuccess } from "../../utils/responses.util";
import {
  getNewSubscribersByDate,
  getStatistics,
  getUsernameChangesByDate,
} from "./statistics.service";
import {
  parseStatisticsDateQuery,
  parseStatisticsPaginationQuery,
} from "./statistics.query";

export const statisticsController = {
  async getDashboard(req: Request, res: Response) {
    const yearRaw = req.query.year;
    const year =
      typeof yearRaw === "string" && /^\d{4}$/.test(yearRaw)
        ? Number(yearRaw)
        : new Date().getFullYear();

    const data = await getStatistics(year);
    return sendSuccess(res, data);
  },

  async getUsernameChanges(req: Request, res: Response) {
    const date = parseStatisticsDateQuery(req);
    const { page, limit } = parseStatisticsPaginationQuery(req);
    const data = await getUsernameChangesByDate(date, page, limit);
    return sendSuccess(res, data);
  },

  async getNewSubscribers(req: Request, res: Response) {
    const date = parseStatisticsDateQuery(req);
    const { page, limit } = parseStatisticsPaginationQuery(req);
    const data = await getNewSubscribersByDate(date, page, limit);
    return sendSuccess(res, data);
  },
};
