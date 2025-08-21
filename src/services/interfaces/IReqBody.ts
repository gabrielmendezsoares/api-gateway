import { api_gateway_apis } from "@prisma/client/storage/index.js";

export interface ICreateApiDataReqBody { 
  globalReplacementMap?: Record<keyof api_gateway_apis, any>;
  filterMap: Record<keyof api_gateway_apis, any>;
}
