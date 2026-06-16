import type { ConfigMeta } from "@/src/app/type/common";
import type { VehicleType } from "@/src/app/type/check-payment/transactions";

export type PricingStatus = "active" | "inactive" | string;
export type FeeType =
  | "base_hour"
  | "next_hour"
  | "overnight_day"
  | "overnight_week"
  | "overnight_month"
  | "overnight_year";

export type PricingRule = {
  id: string;
  name: string;
  feeType: FeeType;
  vehicleType: VehicleType;
  price: number;
  baseHours: number;
  hourStart: number;
  hourEnd: number | null;
  periodUnit: "day" | "week" | "month" | "year" | null | string;
  periodStart: number;
  periodEnd: number | null;
  status: PricingStatus;
};

export type ServicePricingConfig = ConfigMeta & { pricingRules: PricingRule[] };
export type PricingRulePayload = Partial<Omit<PricingRule, "id">> & { price: number };
export type MasterDataItem = { code: string; label: string };
