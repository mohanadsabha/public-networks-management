import { Request, Response } from "express";
import * as routerService from "./routers.service";
import AppError from "../../utils/appError";
import { createRouterSchema, updateRouterSchema, bulkDeleteSchema, assignRouterSchema } from "./routers.validation";
import { ActivityMeta } from "../../middleware/logger.middleware";
import { zodValidation } from "../../utils/zod.util";
import cloudinary from "../../config/cloudinary";
import type { UploadApiResponse } from "cloudinary";

function uploadRouterImage(file: Express.Multer.File): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "routers", resource_type: "auto" },
      (error, result?: UploadApiResponse) => {
        if (error || !result?.secure_url || !result.public_id) {
          reject(error ?? new AppError("Failed to upload router image to Cloudinary", 500));
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(file.buffer);
  });
}

class RoutersController {
  public getAllRouters = async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const search = req.query.search as string;

    const result = await routerService.getAllRouters(page, limit, search);

    return res.status(200).json({
      success: true,
      data: result,
    });
  };

  public getRouterById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const router = await routerService.getRouterById(Number(id));
    if (!router) throw new AppError("Router not found", 404);

    return res.status(200).json({
      success: true,
      data: router,
    });
  };

  public createRouter = async (req: Request, res: Response) => {
    const validated = zodValidation(createRouterSchema, req.body);
    let imageUrl: string | undefined = undefined;
    let publicId: string | undefined = undefined;

    if (req.file) {
      const uploaded = await uploadRouterImage(req.file);
      imageUrl = uploaded.url;
      publicId = uploaded.publicId;
    }

    const router = await routerService.createRouter(validated, imageUrl, publicId);

    res.locals.activityMeta = {
      subjectType: "Router",
      subjectId: router.id,
      subjectName: router.routerName,
    } satisfies ActivityMeta;

    return res.status(201).json({
      success: true,
      data: router,
      message: "Router created successfully",
    });
  };

  public updateRouter = async (req: Request, res: Response) => {
    const { id } = req.params;
    const validated = zodValidation(updateRouterSchema, req.body);
    let imageUrl: string | undefined = undefined;
    let publicId: string | undefined = undefined;

    if (req.file) {
      const uploaded = await uploadRouterImage(req.file);
      imageUrl = uploaded.url;
      publicId = uploaded.publicId;
    }

    const router = await routerService.updateRouter(Number(id), validated, imageUrl, publicId);

    res.locals.activityMeta = {
      subjectType: "Router",
      subjectId: router.id,
      subjectName: router.routerName,
    } satisfies ActivityMeta;

    return res.status(200).json({
      success: true,
      data: router,
      message: "Router updated successfully",
    });
  };

  public deleteRouter = async (req: Request, res: Response) => {
    const { id } = req.params;
    await routerService.deleteRouter(Number(id));

    res.locals.activityMeta = {
      subjectType: "Router",
      subjectId: Number(id),
    } satisfies ActivityMeta;

    return res.status(204).send();
  };

  public deleteRoutersBulk = async (req: Request, res: Response) => {
    const { ids } = zodValidation(bulkDeleteSchema, req.body);
    const deleted = await routerService.deleteRoutersBulk(ids);

    res.locals.activityMeta = {
      subjectType: "Router",
    } satisfies ActivityMeta;

    return res.status(200).json({
      success: true,
      data: { deleted },
      message: `Deleted ${deleted} router(s)`,
    });
  };

  public deleteAllRouters = async (req: Request, res: Response) => {
    await routerService.deleteAllRouters();

    res.locals.activityMeta = {
      subjectType: "Router",
    } satisfies ActivityMeta;

    return res.status(204).send();
  };

  public assignRouterToSubscriber = async (req: Request, res: Response) => {
    const { id } = req.params;
    const validated = zodValidation(assignRouterSchema, req.body);

    const subscriber = await routerService.assignRouterToSubscriber(Number(id), validated);

    res.locals.activityMeta = {
      subjectType: "Subscriber",
      subjectId: subscriber.id,
      subjectName: subscriber.fullName,
    } satisfies ActivityMeta;

    return res.status(200).json({
      success: true,
      data: subscriber,
      message: "Router assigned to subscriber successfully",
    });
  };
}

export const routersController = new RoutersController();
