import { Request } from 'express';
import { isObjectType } from 'remeda';
import { api_gateway_apis, PrismaClient } from '@prisma/client/storage/client.js';
import { JsonObject } from '@prisma/client/storage/runtime/library.js';
import { cryptographyUtil, HttpClientUtil, loggerUtil, ApiKeyStrategy, BasicStrategy, BasicAndBearerStrategy, BearerStrategy } from '../../expressium/index.js';
import { IReqBody, IResponse, IResponseData } from './interfaces/index.js';

const prisma = new PrismaClient();

const processApi = async (apiGatewayApi: api_gateway_apis): Promise<[string, any]> => {
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

  const httpClientInstance = new HttpClientUtil.HttpClient();

  try {
    switch (authentication_type) {
      case 'API Key':
        const apiKeyStrategyInstance = new ApiKeyStrategy.ApiKeyStrategy(
          cryptographyUtil.decryptFromAes256Cbc(
            process.env.API_GATEWAY_APIS_API_KEY_AUTHENTICATION_KEY_ENCRYPTION_KEY as string,
            process.env.API_GATEWAY_APIS_API_KEY_AUTHENTICATION_KEY_IV_STRING as string,
            new TextDecoder().decode(api_key_authentication_key as Uint8Array<ArrayBufferLike>)
          ),
          cryptographyUtil.decryptFromAes256Cbc(
            process.env.API_GATEWAY_APIS_API_KEY_AUTHENTICATION_HEADER_NAME_ENCRYPTION_KEY as string,
            process.env.API_GATEWAY_APIS_API_KEY_AUTHENTICATION_HEADER_NAME_IV_STRING as string,
            new TextDecoder().decode(api_key_authentication_header_name as Uint8Array<ArrayBufferLike>)
          ),
        );
        
        httpClientInstance.setAuthenticationStrategy(apiKeyStrategyInstance);

        break;

      case 'Basic':
        const basicStrategyInstance = new BasicStrategy.BasicStrategy(
          cryptographyUtil.decryptFromAes256Cbc(
            process.env.API_GATEWAY_APIS_BASIC_AUTHENTICATION_USERNAME_ENCRYPTION_KEY as string,
            process.env.API_GATEWAY_APIS_BASIC_AUTHENTICATION_USERNAME_IV_STRING as string,
            new TextDecoder().decode(basic_authentication_username as Uint8Array<ArrayBufferLike>)
          ),
          cryptographyUtil.decryptFromAes256Cbc(
            process.env.API_GATEWAY_APIS_BASIC_AUTHENTICATION_PASSWORD_ENCRYPTION_KEY as string,
            process.env.API_GATEWAY_APIS_BASIC_AUTHENTICATION_PASSWORD_IV_STRING as string,
            new TextDecoder().decode(basic_authentication_password as Uint8Array<ArrayBufferLike>)
          )
        );

        httpClientInstance.setAuthenticationStrategy(basicStrategyInstance);

        break;

      case 'Basic And Bearer':
        const tokenExtractor = basic_and_bearer_authentication_token_extractor_list 
          ? (response: Axios.AxiosXHR<any>): any => {
              return (basic_and_bearer_authentication_token_extractor_list as string[]).reduce(
                (
                  accumulator: any, 
                  extractor: any
                ): any => {
                  const value = accumulator[extractor];

                  return value ?? accumulator;
                },
                response
              );
            }
          : undefined;
            
        const expirationExtractor = basic_and_bearer_authentication_expiration_extractor_list
          ? (response: Axios.AxiosXHR<any>): any => {
              return (basic_and_bearer_authentication_expiration_extractor_list as string[]).reduce(
                (
                  accumulator: any, 
                  extractor: any
                ): any => {
                  const value = accumulator[extractor];

                  return value ?? accumulator;
                },
                response
              );
            }
          : undefined;

        const basicAndBearerAuthenticationStrategyInstance = new BasicAndBearerStrategy.BasicAndBearerStrategy(
          basic_and_bearer_authentication_method_type as string,
          basic_and_bearer_authentication_url as string,
          basic_authentication_username
            ? cryptographyUtil.decryptFromAes256Cbc(
                process.env.API_GATEWAY_APIS_BASIC_AND_BEARER_AUTHENTICATION_USERNAME_ENCRYPTION_KEY as string,
                process.env.API_GATEWAY_APIS_BASIC_AND_BEARER_AUTHENTICATION_USERNAME_IV_STRING as string,
                new TextDecoder().decode(basic_authentication_username)
              )
            : undefined,
          basic_authentication_password
            ? cryptographyUtil.decryptFromAes256Cbc(
                process.env.API_GATEWAY_APIS_BASIC_AND_BEARER_AUTHENTICATION_PASSWORD_ENCRYPTION_KEY as string,
                process.env.API_GATEWAY_APIS_BASIC_AND_BEARER_AUTHENTICATION_PASSWORD_IV_STRING as string,
                new TextDecoder().decode(basic_authentication_password)
              )
            : undefined,
          basic_and_bearer_authentication_query_parameter_map as JsonObject ?? undefined,
          basic_and_bearer_authentication_header_map as JsonObject ?? undefined,
          basic_and_bearer_authentication_body ?? undefined,
          tokenExtractor,
          expirationExtractor,
          basic_and_bearer_authentication_expiration_buffer ?? undefined
        );

        httpClientInstance.setAuthenticationStrategy(basicAndBearerAuthenticationStrategyInstance);

        break;

      case 'Bearer':
        const bearerStrategyInstance = new BearerStrategy.BearerStrategy(
          cryptographyUtil.decryptFromAes256Cbc(
            process.env.API_GATEWAY_APIS_BEARER_AUTHENTICATION_TOKEN_ENCRYPTION_KEY as string,
            process.env.API_GATEWAY_APIS_BEARER_AUTHENTICATION_TOKEN_IV_STRING as string,
            new TextDecoder().decode(bearer_authentication_token as Uint8Array<ArrayBufferLike>)
          )
        );

        httpClientInstance.setAuthenticationStrategy(bearerStrategyInstance);

        break;
    
      default:
        break;
    }

    const response = await httpClientInstance.request<IResponse.IResponse<any>>(
      method_type,
      url,
      body ?? undefined,
      { 
        params: query_parameter_map ?? undefined,
        headers: header_map ?? undefined,
        responseType: response_type 
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
              .map(
                ([key, value]: [string, any]): [string, Record<string, any>] => {
                  return [key, { [Array.isArray(value) ? 'in' : 'equals']: value }];
                }
              )
          ) 
        : undefined
    }
  );
  
  const apiDataEntryList = await Promise.all(apiGatewayApiList.map(processApi));

  return {
    status: 200,
    data: { data: Object.fromEntries(apiDataEntryList) }
  };
};
