import { Request, Response } from "express";
import { getFinanceDebtors, getFinanceStats } from "./finance.service";

export async function financeStats(_req: Request, res: Response) {
  const data = await getFinanceStats();
  return res.status(200).json({ success: true, data });
}

export async function financeDebtors(_req: Request, res: Response) {
  const data = await getFinanceDebtors();
  return res.status(200).json({ success: true, data });
}
