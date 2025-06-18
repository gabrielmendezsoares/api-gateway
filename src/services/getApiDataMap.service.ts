import { NextFunction, Request, Response } from 'express';
import momentTimezone from 'moment-timezone';
import { PrismaClient } from '@prisma/client/storage/client.js';
import { cryptographyUtil, HttpClientUtil, ApiKeyStrategy, BasicStrategy, BasicAndBearerStrategy, BearerStrategy, OAuthStrategy } from '../../expressium/src/index.js';
import { IApi, IApiData, IReqBody, IResponse, IResponseData } from '../interfaces/index.js';

const prisma = new PrismaClient();

const extractParameter = <T>(
  req: Request, 
  serviceName: string, 
  parameterName: keyof IApi.IApi, 
  defaultValue: T | null
): T | undefined => {
  if (
    Object.isObject(req.body as unknown) 
    && Object.isObject((req.body as IReqBody.IGetApiDataMapReqBody).globalReplacementMap) 
    && (req.body as IReqBody.IGetApiDataMapReqBody).globalReplacementMap[parameterName] !== undefined
  ) {
    return (req.body as IReqBody.IGetApiDataMapReqBody).globalReplacementMap[parameterName] as T;
  }
  
  if (
    Object.isObject(req.body as unknown) 
    && Object.isObject((req.body as any)[serviceName]) 
    && (req.body as any)[serviceName][parameterName] !== undefined
  ) {
    return (req.body as any)[serviceName][parameterName] as T;
  }
  
  return defaultValue !== null ? defaultValue as T : undefined;
};

const processApiData = async (
  api: IApi.IApi,
  req: Request,
  timestamp: string
): Promise<[string, IApiData.ISuccessApiData | IApiData.IErrorApiData]> => {
  const {
    id,
    name,
    group_name,
    authentication_type,
    basic_and_bearer_authentication_method_type,
    oauth_authentication_grant_type,
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
    oauth_authentication_client_id,
    oauth_authentication_client_secret,
    oauth_authentication_token_url,
    oauth_authentication_authorization_url,
    oauth_authentication_redirect_url,
    oauth_authentication_scope,
    oauth_authentication_access_token_extractor_list,
    oauth_authentication_refresh_token_extractor_list,
    oauth_authentication_expiration_extractor_list,
    oauth_authentication_expiration_buffer,
    oauth_authentication_pkce_enabled,
    oauth_authentication_additional_parameter_map,
    url,
    query_parameter_map,
    header_map,
    body,
    is_api_active,
    created_at,
    updated_at
  } = api;

  const parameterMap = {
    authenticationType: extractParameter<string | undefined>(req, name, 'authentication_type', authentication_type) as string,
    basicAndBearerAuthenticationMethodType: extractParameter<string | undefined>(req, name, 'basic_and_bearer_authentication_method_type', basic_and_bearer_authentication_method_type),
    oAuthAuthenticationGrantType: extractParameter<string | undefined>(req, name, 'oauth_authentication_grant_type', oauth_authentication_grant_type),
    methodType: extractParameter<string | undefined>(req, name, 'method_type', method_type) as string,
    responseType: extractParameter<string | undefined>(req, name, 'response_type', response_type) as string,
    apiKeyAuthenticationKey: extractParameter<Uint8Array | undefined>(req, name, 'api_key_authentication_key', api_key_authentication_key),
    apiKeyAuthenticationHeaderName: extractParameter<string | undefined>(req, name, 'api_key_authentication_header_name', api_key_authentication_header_name),
    basicAuthenticationUsername: extractParameter<Uint8Array | undefined>(req, name, 'basic_authentication_username', basic_authentication_username),
    basicAuthenticationPassword: extractParameter<Uint8Array | undefined>(req, name, 'basic_authentication_password', basic_authentication_password),
    basicAndBearerAuthenticationUrl: extractParameter<string | undefined>(req, name, 'basic_and_bearer_authentication_url', basic_and_bearer_authentication_url),
    basicAndBearerAuthenticationQueryParameterMap: extractParameter<JSON | undefined>(req, name, 'basic_and_bearer_authentication_query_parameter_map', basic_and_bearer_authentication_query_parameter_map),
    basicAndBearerAuthenticationHeaderMap: extractParameter<JSON | undefined>(req, name, 'basic_and_bearer_authentication_header_map', basic_and_bearer_authentication_header_map),
    basicAndBearerAuthenticationBody: extractParameter<JSON | undefined>(req, name, 'basic_and_bearer_authentication_body', basic_and_bearer_authentication_body),
    basicAndBearerAuthenticationTokenExtractorList: extractParameter<string[] | undefined>(req, name, 'basic_and_bearer_authentication_token_extractor_list', basic_and_bearer_authentication_token_extractor_list),
    basicAndBearerAuthenticationExpirationExtractorList: extractParameter<string[] | undefined>(req, name, 'basic_and_bearer_authentication_expiration_extractor_list', basic_and_bearer_authentication_expiration_extractor_list),
    basicAndBearerAuthenticationExpirationBuffer: extractParameter<number | undefined>(req, name, 'basic_and_bearer_authentication_expiration_buffer', basic_and_bearer_authentication_expiration_buffer),
    bearerAuthenticationToken: extractParameter<Uint8Array | undefined>(req, name, 'bearer_authentication_token', bearer_authentication_token),
    oAuthAuthenticationClientId: extractParameter<Uint8Array | undefined>(req, name, 'oauth_authentication_client_id', oauth_authentication_client_id),
    oAuthAuthenticationClientSecret: extractParameter<Uint8Array | undefined>(req, name, 'oauth_authentication_client_secret', oauth_authentication_client_secret),
    oAuthAuthenticationTokenUrl: extractParameter<string | undefined>(req, name, 'oauth_authentication_token_url', oauth_authentication_token_url),
    oAuthAuthenticationAuthorizationUrl: extractParameter<string | undefined>(req, name, 'oauth_authentication_authorization_url', oauth_authentication_authorization_url),
    oAuthAuthenticationRedirectUrl: extractParameter<string | undefined>(req, name, 'oauth_authentication_redirect_url', oauth_authentication_redirect_url),
    oAuthAuthenticationScope: extractParameter<string | undefined>(req, name, 'oauth_authentication_scope', oauth_authentication_scope),
    oAuthAuthenticationAccessTokenExtractorList: extractParameter<string[] | undefined>(req, name, 'oauth_authentication_access_token_extractor_list', oauth_authentication_access_token_extractor_list),
    oAuthAuthenticationRefreshTokenExtractorList: extractParameter<string[] | undefined>(req, name, 'oauth_authentication_refresh_token_extractor_list', oauth_authentication_refresh_token_extractor_list),
    oAuthAuthenticationExpirationExtractorList: extractParameter<string[] | undefined>(req, name, 'oauth_authentication_expiration_extractor_list', oauth_authentication_expiration_extractor_list),
    oAuthAuthenticationExpirationBuffer: extractParameter<number | undefined>(req, name, 'oauth_authentication_expiration_buffer', oauth_authentication_expiration_buffer),
    oAuthAuthenticationPkceEnabled: extractParameter<boolean | undefined>(req, name, 'oauth_authentication_pkce_enabled', oauth_authentication_pkce_enabled),
    oAuthAuthenticationAdditionalParameterMap: extractParameter<JSON | undefined>(req, name, 'oauth_authentication_additional_parameter_map', oauth_authentication_additional_parameter_map),
    url: extractParameter<string | undefined>(req, name, 'url', url) as string,
    queryParameterMap: extractParameter<JSON | undefined>(req, name, 'query_parameter_map', query_parameter_map),
    headerMap: extractParameter<JSON | undefined>(req, name, 'header_map', header_map),
    body: extractParameter<JSON | undefined>(req, name, 'body', body)
  };

  const httpClientInstance = new HttpClientUtil.HttpClient();

  try {
    switch (parameterMap.authenticationType) {
      case 'API Key':
        const apiKeyStrategyInstance = new ApiKeyStrategy.ApiKeyStrategy(
          cryptographyUtil.decryptFromAes256Cbc(
            process.env.APIS_API_KEY_AUTHENTICATION_KEY_ENCRYPTION_KEY as string,
            process.env.APIS_API_KEY_AUTHENTICATION_KEY_IV_STRING as string,
            new TextDecoder().decode(parameterMap.apiKeyAuthenticationKey)
          ),
          parameterMap.apiKeyAuthenticationHeaderName as string
        );
        
        httpClientInstance.setAuthenticationStrategy(apiKeyStrategyInstance);

        break;

      case 'Basic':
        const basicAuthenticationStrategyInstance = new BasicStrategy.BasicStrategy(
          cryptographyUtil.decryptFromAes256Cbc(
            process.env.APIS_BASIC_AUTHENTICATION_USERNAME_ENCRYPTION_KEY as string,
            process.env.APIS_BASIC_AUTHENTICATION_USERNAME_IV_STRING as string,
            new TextDecoder().decode(parameterMap.basicAuthenticationUsername)
          ),
          cryptographyUtil.decryptFromAes256Cbc(
            process.env.APIS_BASIC_AUTHENTICATION_PASSWORD_ENCRYPTION_KEY as string,
            process.env.APIS_BASIC_AUTHENTICATION_PASSWORD_IV_STRING as string,
            new TextDecoder().decode(parameterMap.basicAuthenticationPassword)
          )
        );

        httpClientInstance.setAuthenticationStrategy(basicAuthenticationStrategyInstance);

        break;

      case 'Basic And Bearer':
        const basicAndBearerAuthenticationTokenExtractorList = parameterMap.basicAndBearerAuthenticationTokenExtractorList 
          ? (response: Axios.AxiosXHR<any>): any => {
              return (parameterMap.basicAndBearerAuthenticationTokenExtractorList as string[]).reduce(
                (accumulator: any, extractor: any): any => {
                  const value = accumulator[extractor];

                  return value ? value : accumulator;
                },
                response
              );
            }
          : undefined;
            
        const basicAndBearerAuthenticationExpirationExtractorList = parameterMap.basicAndBearerAuthenticationExpirationExtractorList
          ? (response: Axios.AxiosXHR<any>): any => {
              return (parameterMap.basicAndBearerAuthenticationExpirationExtractorList as string[]).reduce(
                (accumulator: any, extractor: any): any => {
                  const value = accumulator[extractor];

                  return value ? value : accumulator;
                },
                response
              );
            }
          : undefined;

        const basicAndBearerAuthenticationStrategyInstance = new BasicAndBearerStrategy.BasicAndBearerStrategy(
          parameterMap.basicAndBearerAuthenticationMethodType as string,
          parameterMap.basicAndBearerAuthenticationUrl as string,
          parameterMap.basicAuthenticationUsername
            ? cryptographyUtil.decryptFromAes256Cbc(
                process.env.APIS_BASIC_AND_BEARER_AUTHENTICATION_USERNAME_ENCRYPTION_KEY as string,
                process.env.APIS_BASIC_AND_BEARER_AUTHENTICATION_USERNAME_IV_STRING as string,
                new TextDecoder().decode(parameterMap.basicAuthenticationUsername)
              )
            : parameterMap.basicAuthenticationUsername,
          parameterMap.basicAuthenticationPassword
            ? cryptographyUtil.decryptFromAes256Cbc(
                process.env.APIS_BASIC_AND_BEARER_AUTHENTICATION_PASSWORD_ENCRYPTION_KEY as string,
                process.env.APIS_BASIC_AND_BEARER_AUTHENTICATION_PASSWORD_IV_STRING as string,
                new TextDecoder().decode(parameterMap.basicAuthenticationPassword)
              )
            : parameterMap.basicAuthenticationPassword,
          parameterMap.basicAndBearerAuthenticationQueryParameterMap,
          parameterMap.basicAndBearerAuthenticationHeaderMap,
          parameterMap.basicAndBearerAuthenticationBody,
          basicAndBearerAuthenticationTokenExtractorList,
          basicAndBearerAuthenticationExpirationExtractorList,
          parameterMap.basicAndBearerAuthenticationExpirationBuffer
        );

        httpClientInstance.setAuthenticationStrategy(basicAndBearerAuthenticationStrategyInstance);

        break;

      case 'Bearer':
        const bearerAuthenticationStrategyInstance = new BearerStrategy.BearerStrategy(
          cryptographyUtil.decryptFromAes256Cbc(
            process.env.APIS_BEARER_AUTHENTICATION_TOKEN_ENCRYPTION_KEY as string,
            process.env.APIS_BEARER_AUTHENTICATION_TOKEN_IV_STRING as string,
            new TextDecoder().decode(parameterMap.bearerAuthenticationToken)
          )
        );

        httpClientInstance.setAuthenticationStrategy(bearerAuthenticationStrategyInstance);

        break;

      case 'OAuth':
        const oAuthAuthenticationAccessTokenExtractorList = parameterMap.oAuthAuthenticationAccessTokenExtractorList
          ? (response: Axios.AxiosXHR<any>): any => {
              return (parameterMap.oAuthAuthenticationAccessTokenExtractorList as string[]).reduce(
                (accumulator: any, extractor: any): any => {
                  const value = accumulator[extractor];

                  return value ? value : accumulator;
                },
                response
              );
            }
          : undefined;

        const oAuthAuthenticationRefreshTokenExtractorList = parameterMap.oAuthAuthenticationRefreshTokenExtractorList
          ? (response: Axios.AxiosXHR<any>): any => {
              return (parameterMap.oAuthAuthenticationRefreshTokenExtractorList as string[]).reduce(
                (accumulator: any, extractor: any): any => {
                  const value = accumulator[extractor];

                  return value ? value : accumulator;
                },
                response
              );
            }
          : undefined;

        const oAuthAuthenticationExpirationExtractorList = parameterMap.oAuthAuthenticationExpirationExtractorList
          ? (response: Axios.AxiosXHR<any>): any => {
              return (parameterMap.oAuthAuthenticationExpirationExtractorList as string[]).reduce(
                (accumulator: any, extractor: any): any => {
                  const value = accumulator[extractor];

                  return value ? value : accumulator;
                },
                response
              );
            }
          : undefined;

        const oAuthAuthenticationStrategyInstance = new OAuthStrategy.OAuthStrategy(
          parameterMap.oAuthAuthenticationGrantType as string,
          parameterMap.oAuthAuthenticationClientId
            ? cryptographyUtil.decryptFromAes256Cbc(
                process.env.APIS_OAUTH_AUTHENTICATION_CLIENT_ID_ENCRYPTION_KEY as string,
                process.env.APIS_OAUTH_AUTHENTICATION_CLIENT_ID_IV_STRING as string,
                new TextDecoder().decode(parameterMap.oAuthAuthenticationClientId)
              )
            : parameterMap.oAuthAuthenticationClientId,
          parameterMap.oAuthAuthenticationClientSecret
            ? cryptographyUtil.decryptFromAes256Cbc(
                process.env.APIS_OAUTH_AUTHENTICATION_CLIENT_SECRET_ENCRYPTION_KEY as string,
                process.env.APIS_OAUTH_AUTHENTICATION_CLIENT_SECRET_IV_STRING as string,
                new TextDecoder().decode(parameterMap.oAuthAuthenticationClientSecret)
              )
            : parameterMap.oAuthAuthenticationClientSecret,
          parameterMap.oAuthAuthenticationTokenUrl as string,
          parameterMap.oAuthAuthenticationAuthorizationUrl as string,
          parameterMap.oAuthAuthenticationRedirectUrl as string,
          parameterMap.oAuthAuthenticationScope as string,
          oAuthAuthenticationAccessTokenExtractorList,
          oAuthAuthenticationRefreshTokenExtractorList,
          oAuthAuthenticationExpirationExtractorList,
          parameterMap.oAuthAuthenticationExpirationBuffer,
          parameterMap.oAuthAuthenticationPkceEnabled,
          parameterMap.oAuthAuthenticationAdditionalParameterMap
        );

        httpClientInstance.setAuthenticationStrategy(oAuthAuthenticationStrategyInstance);

        break;
    
      default:
    }

    const response = await httpClientInstance.request<IResponse.IResponse<unknown>>(
      parameterMap.methodType,
      parameterMap.url,
      parameterMap.body,
      { 
        params: parameterMap.queryParameterMap,
        headers: parameterMap.headerMap,
        responseType: parameterMap.responseType 
      }
    );

    return [
      name, 
      {
        timestamp,
        status: true,
        id,
        name,
        groupName: group_name !== null ? group_name : undefined,
        authenticationType: parameterMap.authenticationType,
        basicAndBearerAuthenticationMethodType: parameterMap.basicAndBearerAuthenticationMethodType,
        oAuthAuthenticationGrantType: parameterMap.oAuthAuthenticationGrantType,
        methodType: parameterMap.methodType,
        responseType: parameterMap.responseType,
        apiKeyAuthenticationKey: parameterMap.apiKeyAuthenticationKey,
        apiKeyAuthenticationHeaderName: parameterMap.apiKeyAuthenticationHeaderName,
        basicAuthenticationUsername: parameterMap.basicAuthenticationUsername,
        basicAuthenticationPassword: parameterMap.basicAuthenticationPassword,
        basicAndBearerAuthenticationUrl: parameterMap.basicAndBearerAuthenticationUrl,
        basicAndBearerAuthenticationQueryParameterMap: parameterMap.basicAndBearerAuthenticationQueryParameterMap,
        basicAndBearerAuthenticationHeaderMap: parameterMap.basicAndBearerAuthenticationHeaderMap,
        basicAndBearerAuthenticationTokenExtractorList: parameterMap.basicAndBearerAuthenticationTokenExtractorList,
        basicAndBearerAuthenticationExpirationExtractorList: parameterMap.basicAndBearerAuthenticationExpirationExtractorList,
        basicAndBearerAuthenticationExpirationBuffer: parameterMap.basicAndBearerAuthenticationExpirationBuffer,
        oAuthAuthenticationClientId: parameterMap.oAuthAuthenticationClientId,
        oAuthAuthenticationClientSecret: parameterMap.oAuthAuthenticationClientSecret,
        oAuthAuthenticationTokenUrl: parameterMap.oAuthAuthenticationTokenUrl,
        oAuthAuthenticationAuthorizationUrl: parameterMap.oAuthAuthenticationAuthorizationUrl,
        oAuthAuthenticationRedirectUrl: parameterMap.oAuthAuthenticationRedirectUrl,
        oAuthAuthenticationScope: parameterMap.oAuthAuthenticationScope,
        oAuthAuthenticationAccessTokenExtractorList: parameterMap.oAuthAuthenticationAccessTokenExtractorList,
        oAuthAuthenticationRefreshTokenExtractorList: parameterMap.oAuthAuthenticationRefreshTokenExtractorList,
        oAuthAuthenticationExpirationExtractorList: parameterMap.oAuthAuthenticationExpirationExtractorList,
        oAuthAuthenticationExpirationBuffer: parameterMap.oAuthAuthenticationExpirationBuffer,
        oAuthAuthenticationPkceEnabled: parameterMap.oAuthAuthenticationPkceEnabled,
        oAuthAuthenticationAdditionalParameterMap: parameterMap.oAuthAuthenticationAdditionalParameterMap,
        bearerAuthenticationToken: parameterMap.bearerAuthenticationToken,
        url: parameterMap.url,
        queryParameterMap: parameterMap.queryParameterMap,
        headerMap: parameterMap.headerMap,
        body: parameterMap.body,
        isApiActive: is_api_active,
        createdAt: created_at,
        updatedAt: updated_at,
        data: response.data
      }
    ];
  } catch (error: unknown) {
    console.log(`Error | Timestamp: ${ momentTimezone().utc().format('DD-MM-YYYY HH:mm:ss') } | Path: src/services/getApiDataMap.service.ts | Location: processApiData | Error: ${ error instanceof Error ? error.message : String(error) }`);

    return [
      name,
      {
        timestamp,
        status: false,
        id,
        name,
        groupName: group_name !== null ? group_name : undefined,
        authenticationType: parameterMap.authenticationType,
        basicAndBearerAuthenticationMethodType: parameterMap.basicAndBearerAuthenticationMethodType,
        oAuthAuthenticationGrantType: parameterMap.oAuthAuthenticationGrantType,
        methodType: parameterMap.methodType,
        responseType: parameterMap.responseType,
        apiKeyAuthenticationKey: parameterMap.apiKeyAuthenticationKey,
        apiKeyAuthenticationHeaderName: parameterMap.apiKeyAuthenticationHeaderName,
        basicAuthenticationUsername: parameterMap.basicAuthenticationUsername,
        basicAuthenticationPassword: parameterMap.basicAuthenticationPassword,
        basicAndBearerAuthenticationUrl: parameterMap.basicAndBearerAuthenticationUrl,
        basicAndBearerAuthenticationQueryParameterMap: parameterMap.basicAndBearerAuthenticationQueryParameterMap,
        basicAndBearerAuthenticationHeaderMap: parameterMap.basicAndBearerAuthenticationHeaderMap,
        basicAndBearerAuthenticationTokenExtractorList: parameterMap.basicAndBearerAuthenticationTokenExtractorList,
        basicAndBearerAuthenticationExpirationExtractorList: parameterMap.basicAndBearerAuthenticationExpirationExtractorList,
        basicAndBearerAuthenticationExpirationBuffer: parameterMap.basicAndBearerAuthenticationExpirationBuffer,
        oAuthAuthenticationClientId: parameterMap.oAuthAuthenticationClientId,
        oAuthAuthenticationClientSecret: parameterMap.oAuthAuthenticationClientSecret,
        oAuthAuthenticationTokenUrl: parameterMap.oAuthAuthenticationTokenUrl,
        oAuthAuthenticationAuthorizationUrl: parameterMap.oAuthAuthenticationAuthorizationUrl,
        oAuthAuthenticationRedirectUrl: parameterMap.oAuthAuthenticationRedirectUrl,
        oAuthAuthenticationScope: parameterMap.oAuthAuthenticationScope,
        oAuthAuthenticationAccessTokenExtractorList: parameterMap.oAuthAuthenticationAccessTokenExtractorList,
        oAuthAuthenticationRefreshTokenExtractorList: parameterMap.oAuthAuthenticationRefreshTokenExtractorList,
        oAuthAuthenticationExpirationExtractorList: parameterMap.oAuthAuthenticationExpirationExtractorList,
        oAuthAuthenticationExpirationBuffer: parameterMap.oAuthAuthenticationExpirationBuffer,
        oAuthAuthenticationPkceEnabled: parameterMap.oAuthAuthenticationPkceEnabled,
        oAuthAuthenticationAdditionalParameterMap: parameterMap.oAuthAuthenticationAdditionalParameterMap,
        bearerAuthenticationToken: parameterMap.bearerAuthenticationToken,
        url: parameterMap.url,
        queryParameterMap: parameterMap.queryParameterMap,
        headerMap: parameterMap.headerMap,
        body: parameterMap.body,
        isApiActive: is_api_active,
        createdAt: created_at,
        updatedAt: updated_at,
        message: 'Unexpected error occurred while processing the data.',
        suggestion: 'Please try again later. If this issue persists, contact our support team for assistance.'
      }
    ];
  }
};

export const getApiDataMap = async (
  req: Request, 
  _res: Response, 
  _next: NextFunction, 
  timestamp: string
): Promise<IResponse.IResponse<IResponseData.IGetApiDataMapResponseData | IResponseData.IResponseData>> => {
  try {  
    const apiList = await prisma.apis.findMany(
      {
        where: Object.isObject(req.body?.filterMap) 
          ? Object.fromEntries(
              Object
                .entries(req.body?.filterMap)
                .map(
                  ([key, value]: [string, any]): [string, Record<string, any>] => {
                    return [key, { [Array.isArray(value) ? 'in' : 'equals']: value }];
                  }
                )
            ) 
          : undefined
      }
    );
    
    const apiDataEntryList = await Promise.all(
      apiList.map(
        (api: unknown): Promise<[string, IApiData.ISuccessApiData | IApiData.IErrorApiData]> => {
          return processApiData(api as IApi.IApi, req, momentTimezone().utc().format('DD-MM-YYYY HH:mm:ss'));
        }
      )
    );
  
    const apiDataMap = Object.fromEntries(apiDataEntryList);
  
    return {
      status: 200,
      data: {
        timestamp,
        status: true,
        statusCode: 200,
        method: req.method,
        path: req.originalUrl || req.url,
        query: req.query,
        headers: req.headers,
        body: req.body,
        data: apiDataMap
      }
    };
  } catch (error: unknown) {
    console.log(`Error | Timestamp: ${ momentTimezone().utc().format('DD-MM-YYYY HH:mm:ss') } | Path: src/services/getApiDataMap.service.ts | Location: getApiDataMap | Error: ${ error instanceof Error ? error.message : String(error) }`);

    return {
      status: 500,
      data: {
        timestamp,
        status: false,
        statusCode: 500,
        method: req.method,
        path: req.originalUrl || req.url,
        query: req.query,
        headers: req.headers,
        body: req.body,
        message: 'Something went wrong.',
        suggestion: 'Please try again later. If this issue persists, contact our support team for assistance.'
      }
    };
  }
};
