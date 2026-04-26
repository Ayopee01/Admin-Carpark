export type PricingStatus = "active" | "inactive";

export type PricingRule = {
    id: string;
    serviceType: string;
    vehicleType: string;
    hourStart: number;
    hourEnd: number;
    price: number;
    status: PricingStatus;
};

export type PaymentChannel = {
    code: string;
    label: string;
    enabled: boolean;
};

export type ServiceChannelMapping = {
    serviceType: string;
    channelCodes: string[];
};

export type MasterDataItem = {
    code: string;
    label: string;
};

export type ServicePricingConfig = {
    pricingRules: PricingRule[];
    paymentChannels: PaymentChannel[];
    serviceChannelMapping: ServiceChannelMapping[];
    masterData: {
        serviceTypes: MasterDataItem[];
        vehicleTypes: MasterDataItem[];
    };
};

export type PricingRulePayload = {
    serviceType: string;
    vehicleType: string;
    hourStart: number;
    hourEnd: number;
    price: number;
    status?: PricingStatus;
};