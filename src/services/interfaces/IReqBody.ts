import { IApi } from "./index.js"

export interface IGetApiDataMapReqBody {
  filterMap: Record<keyof IApi.IApi, any>;
  globalReplacementMap: IApi.IApi;
}
