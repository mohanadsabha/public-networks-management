import { Request, Response } from "express";
import * as speedService from "./speeds.service";
import AppError from "../../utils/appError";
import { ActivityMeta } from "../../middleware/logger.middleware";

export const getSpeeds = async (req: Request, res: Response) => {
  const speeds = await speedService.getAllSpeeds();
  return res.status(200).json({
    status: "success",
    data: speeds,
  });
};

export const addSpeed = async (req: Request, res: Response) => {
  const { speedValue, price } = req.body;

  if (!speedValue || price === undefined) {
    throw new AppError("speed value and price are required", 400);
  }
  const result = await speedService.addSpeed(speedValue, price);
  res.locals.activityMeta = {
    subjectType: "Speed",
    subjectId: result.id,
    subjectName: `${result.speedValue} Mbps`,
  } satisfies ActivityMeta;

  res.status(201).json({
    status: "success",
    data: result,
    message: "Speed added successfully",
  });
};

export const updateSpeed = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { speed, price } = req.body;
  const result = await speedService.updateSpeed(Number(id), speed, price);
  res.locals.activityMeta = {
    subjectType: "Speed",
    subjectId: result.id,
    subjectName: `${result.speedValue} Mbps`,
  } satisfies ActivityMeta;
  return res.status(200).json({
    status: "success",
    data: result,
    message: "Speed updated successfully",
  });
};

export const deleteSpeed = async (req: Request, res: Response) => {
  const { id } = req.params;
  await speedService.deleteSpeed(Number(id));
  res.locals.activityMeta = {
    subjectType: "Speed",
    subjectId: Number(id),
    subjectName: `Speed #${id}`,
  } satisfies ActivityMeta;
  return res.status(204).send();
};
