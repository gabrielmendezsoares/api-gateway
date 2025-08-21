import { Request } from 'express';
import { isObjectType } from 'remeda';
import { api_gateway_apis, PrismaClient } from '@prisma/client/storage/client.js';
import { JsonObject } from '@prisma/client/storage/runtime/library.js';
import { cryptographyUtil, HttpClientUtil, loggerUtil, ApiKeyStrategy, BasicStrategy, BasicAndBearerStrategy, BearerStrategy } from '../../expressium/index.js';
import { IReqBody, IResponse, IResponseData } from './interfaces/index.js';

const prisma = new PrismaClient();

const extractParameter = <T>(
  reqBody: any, 
  defaultValue: T | null,
  parameterName: keyof api_gateway_apis, 
  serviceName: string
): T | undefined => {
  if (!isObjectType(reqBody)) {
    return defaultValue !== null 
      ? defaultValue
      : undefined;
  }

  const globalReplacementMapParameter = (reqBody as IReqBody.ICreateApiDataReqBody).globalReplacementMap?.[parameterName];

  if (globalReplacementMapParameter !== undefined) {
    return globalReplacementMapParameter;
  }

  const localReplacementMapParameter = (reqBody as any)[serviceName][parameterName];

  if (localReplacementMapParameter !== undefined) {
    return localReplacementMapParameter;
  }

  return defaultValue !== null 
    ? defaultValue
    : undefined;
};

const processApi = async (
  apiGatewayApi: api_gateway_apis, 
  reqBody: any
): Promise<[string, any]> => {
  const {
    name,
    authentication_type,
    basic_and_bearer_authentication_method_type,
    method_type,
    response_type,
    api_key_authentication_key,
    api_key_authentication_header_name,
    basic_authentication_username,
    basic_authentication_password,
    basic_and_bearer_authentication_url,
    basic_and_bearer_authentication_query_parameter_map,
    basic_and_bearer_authentication_header_map,
    basic_and_bearer_authentication_body,
    basic_and_bearer_authentication_token_extractor_list,
    basic_and_bearer_authentication_expiration_extractor_list,
    basic_and_bearer_authentication_expiration_buffer,
    bearer_authentication_token,
    url,
    query_parameter_map,
    header_map,
    body,
  } = apiGatewayApi;

  const parameterMap = {
    authenticationType: extractParameter(reqBody, authentication_type, 'authentication_type', name) as string,
    basicAndBearerAuthenticationMethodType: extractParameter(reqBody, basic_and_bearer_authentication_method_type, 'basic_and_bearer_authentication_method_type', name),
    methodType: extractParameter(reqBody, method_type, 'method_type', name) as string,
    responseType: extractParameter(reqBody, response_type, 'response_type', name) as string,
    apiKeyAuthenticationKey: extractParameter(reqBody, api_key_authentication_key, 'api_key_authentication_key', name),
    apiKeyAuthenticationHeaderName: extractParameter(reqBody, api_key_authentication_header_name, 'api_key_authentication_header_name', name),
    basicAuthenticationUsername: extractParameter(reqBody, basic_authentication_username, 'basic_authentication_username', name),
    basicAuthenticationPassword: extractParameter(reqBody, basic_authentication_password, 'basic_authentication_password', name),
    basicAndBearerAuthenticationUrl: extractParameter(reqBody, basic_and_bearer_authentication_url, 'basic_and_bearer_authentication_url', name),
    basicAndBearerAuthenticationQueryParameterMap: extractParameter(reqBody, basic_and_bearer_authentication_query_parameter_map, 'basic_and_bearer_authentication_query_parameter_map', name),
    basicAndBearerAuthenticationHeaderMap: extractParameter(reqBody, basic_and_bearer_authentication_header_map, 'basic_and_bearer_authentication_header_map', name),
    basicAndBearerAuthenticationBody: extractParameter(reqBody, basic_and_bearer_authentication_body, 'basic_and_bearer_authentication_body', name),
    basicAndBearerAuthenticationTokenExtractorList: extractParameter(reqBody, basic_and_bearer_authentication_token_extractor_list, 'basic_and_bearer_authentication_token_extractor_list', name),
    basicAndBearerAuthenticationExpirationExtractorList: extractParameter(reqBody, basic_and_bearer_authentication_expiration_extractor_list, 'basic_and_bearer_authentication_expiration_extractor_list', name),
    basicAndBearerAuthenticationExpirationBuffer: extractParameter(reqBody, basic_and_bearer_authentication_expiration_buffer, 'basic_and_bearer_authentication_expiration_buffer', name),
    bearerAuthenticationToken: extractParameter(reqBody, bearer_authentication_token, 'bearer_authentication_token', name),
    url: extractParameter(reqBody, url, 'url', name) as string,
    queryParameterMap: extractParameter(reqBody, query_parameter_map, 'query_parameter_map', name),
    headerMap: extractParameter(reqBody, header_map, 'header_map', name),
    body: extractParameter(reqBody, body, 'body', name)
  };

  const httpClientInstance = new HttpClientUtil.HttpClient();

  try {
    switch (parameterMap.authenticationType) {
      case 'API Key':
        const apiKeyStrategyInstance = new ApiKeyStrategy.ApiKeyStrategy(
          cryptographyUtil.decryptFromAes256Cbc(
            process.env.API_GATEWAY_APIS_API_KEY_AUTHENTICATION_KEY_ENCRYPTION_KEY as string,
            process.env.API_GATEWAY_APIS_API_KEY_AUTHENTICATION_KEY_IV_STRING as string,
            new TextDecoder().decode(parameterMap.apiKeyAuthenticationKey as Uint8Array<ArrayBufferLike>)
          ),
          cryptographyUtil.decryptFromAes256Cbc(
            process.env.API_GATEWAY_APIS_API_KEY_AUTHENTICATION_HEADER_NAME_ENCRYPTION_KEY as string,
            process.env.API_GATEWAY_APIS_API_KEY_AUTHENTICATION_HEADER_NAME_IV_STRING as string,
            new TextDecoder().decode(parameterMap.apiKeyAuthenticationHeaderName as Uint8Array<ArrayBufferLike>)
          ),
        );
        
        httpClientInstance.setAuthenticationStrategy(apiKeyStrategyInstance);

        break;

      case 'Basic':
        const basicStrategyInstance = new BasicStrategy.BasicStrategy(
          cryptographyUtil.decryptFromAes256Cbc(
            process.env.API_GATEWAY_APIS_BASIC_AUTHENTICATION_USERNAME_ENCRYPTION_KEY as string,
            process.env.API_GATEWAY_APIS_BASIC_AUTHENTICATION_USERNAME_IV_STRING as string,
            new TextDecoder().decode(parameterMap.basicAuthenticationUsername as Uint8Array<ArrayBufferLike>)
          ),
          cryptographyUtil.decryptFromAes256Cbc(
            process.env.API_GATEWAY_APIS_BASIC_AUTHENTICATION_PASSWORD_ENCRYPTION_KEY as string,
            process.env.API_GATEWAY_APIS_BASIC_AUTHENTICATION_PASSWORD_IV_STRING as string,
            new TextDecoder().decode(parameterMap.basicAuthenticationPassword as Uint8Array<ArrayBufferLike>)
          )
        );

        httpClientInstance.setAuthenticationStrategy(basicStrategyInstance);

        break;

      case 'Basic And Bearer':
        const tokenExtractor = parameterMap.basicAndBearerAuthenticationTokenExtractorList 
          ? (response: Axios.AxiosXHR<any>): any => {
              return (parameterMap.basicAndBearerAuthenticationTokenExtractorList as string[]).reduce(
                (accumulator: any, extractor: any): any => accumulator[extractor] ?? accumulator,
                response
              );
            }
          : undefined;
            
        const expirationExtractor = parameterMap.basicAndBearerAuthenticationExpirationExtractorList
          ? (response: Axios.AxiosXHR<any>): any => {
              return (parameterMap.basicAndBearerAuthenticationExpirationExtractorList as string[]).reduce(
                (accumulator: any, extractor: any): any => accumulator[extractor] ?? accumulator,
                response
              );
            }
          : undefined;

        const basicAndBearerStrategyInstance = new BasicAndBearerStrategy.BasicAndBearerStrategy(
          parameterMap.basicAndBearerAuthenticationMethodType as string,
          parameterMap.basicAndBearerAuthenticationUrl as string,
          parameterMap.basicAuthenticationUsername &&
            cryptographyUtil.decryptFromAes256Cbc(
              process.env.API_GATEWAY_APIS_BASIC_AND_BEARER_AUTHENTICATION_USERNAME_ENCRYPTION_KEY as string,
              process.env.API_GATEWAY_APIS_BASIC_AND_BEARER_AUTHENTICATION_USERNAME_IV_STRING as string,
              new TextDecoder().decode(parameterMap.basicAuthenticationUsername)
            ),
          parameterMap.basicAuthenticationPassword &&
            cryptographyUtil.decryptFromAes256Cbc(
              process.env.API_GATEWAY_APIS_BASIC_AND_BEARER_AUTHENTICATION_PASSWORD_ENCRYPTION_KEY as string,
              process.env.API_GATEWAY_APIS_BASIC_AND_BEARER_AUTHENTICATION_PASSWORD_IV_STRING as string,
              new TextDecoder().decode(parameterMap.basicAuthenticationPassword)
            ),
          parameterMap.basicAndBearerAuthenticationQueryParameterMap as JsonObject | undefined,
          parameterMap.basicAndBearerAuthenticationHeaderMap as JsonObject | undefined,
          parameterMap.basicAndBearerAuthenticationBody,
          tokenExtractor,
          expirationExtractor,
          parameterMap.basicAndBearerAuthenticationExpirationBuffer
        );

        httpClientInstance.setAuthenticationStrategy(basicAndBearerStrategyInstance);

        break;

      case 'Bearer':
        const bearerStrategyInstance = new BearerStrategy.BearerStrategy(
          cryptographyUtil.decryptFromAes256Cbc(
            process.env.API_GATEWAY_APIS_BEARER_AUTHENTICATION_TOKEN_ENCRYPTION_KEY as string,
            process.env.API_GATEWAY_APIS_BEARER_AUTHENTICATION_TOKEN_IV_STRING as string,
            new TextDecoder().decode(parameterMap.bearerAuthenticationToken as Uint8Array<ArrayBufferLike>)
          )
        );

        httpClientInstance.setAuthenticationStrategy(bearerStrategyInstance);

        break;
    
      default:
        break;
    }

    const response = await httpClientInstance.request<IResponse.IResponse<any>>(
      parameterMap.methodType,
      parameterMap.url,
      parameterMap.body,
      { 
        params: parameterMap.queryParameterMap,
        headers: parameterMap.headerMap,
        responseType: parameterMap.responseType 
      }
    );

    return [name, response.data];
  } catch (error: unknown) {
    loggerUtil.error(error instanceof Error ? error.message : String(error));

    return [
      name,
      {
        message: 'The api data creation process encountered a technical issue.',
        suggestion: 'Please try again later or contact support if the issue persists.'
      }
    ];
  }
};

export const createApiData = async (req: Request): Promise<IResponse.IResponse<IResponseData.ICreateApiDataResponseData | IResponseData.IResponseData>> => {
  const reqBodyFilterMap = (req.body as IReqBody.ICreateApiDataReqBody | undefined)?.filterMap;
  
  const apiGatewayApiList = await prisma.api_gateway_apis.findMany(
    {
      where: isObjectType(reqBodyFilterMap) 
        ? Object.fromEntries(
            Object
              .entries(reqBodyFilterMap)
              .map(([key, value]: [string, any]): [string, Record<string, any>] => [key, { [Array.isArray(value) ? 'in' : 'equals']: value }])
          ) 
        : undefined
    }
  );
  
  const apiDataEntryList = await Promise.all(apiGatewayApiList.map((apiGatewayApi: api_gateway_apis): Promise<[string, any]> => processApi(apiGatewayApi, req.body)));

  return {
    status: 200,
    data: { data: Object.fromEntries(apiDataEntryList) }
  };
};
