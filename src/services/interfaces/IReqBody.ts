import { api_gateway_apis } from "@prisma/client/storage/index.js";

export interface ICreateApiDataReqBody { filterMap: Record<keyof api_gateway_apis, any>; }
