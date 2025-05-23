export interface IApi {
  id: number;
  name: string;
  group_name: string | null;
  authentication_type: string | null;
  basic_and_bearer_authentication_method_type: string | null;
  oauth_authentication_grant_type: string | null;
  method_type: string;
  response_type: string;
  api_key_authentication_key: Uint8Array | null;
  api_key_authentication_header_name: string | null;
  basic_authentication_username: Uint8Array | null;
  basic_authentication_password: Uint8Array | null;
  basic_and_bearer_authentication_url: string | null;
  basic_and_bearer_authentication_query_parameter_map: JSON | null;
  basic_and_bearer_authentication_header_map: JSON | null;
  basic_and_bearer_authentication_body: JSON | null;
  basic_and_bearer_authentication_token_extractor_list: string[] | null;
  basic_and_bearer_authentication_expiration_extractor_list: string[] | null;
  basic_and_bearer_authentication_expiration_buffer: number | null;
  bearer_authentication_token: Uint8Array | null;
  oauth_authentication_client_id: Uint8Array | null;
  oauth_authentication_client_secret: Uint8Array | null;
  oauth_authentication_token_url: string | null;
  oauth_authentication_authorization_url: string | null;
  oauth_authentication_redirect_url: string | null;
  oauth_authentication_scope: string | null;
  oauth_authentication_access_token_extractor_list: string[] | null;
  oauth_authentication_refresh_token_extractor_list: string[] | null;
  oauth_authentication_expiration_extractor_list: string[] | null;
  oauth_authentication_expiration_buffer: number | null;
  oauth_authentication_pkce_enabled: boolean | null;
  oauth_authentication_additional_parameter_map: JSON | null;
  url: string;
  query_parameter_map: JSON | null;
  header_map: JSON | null;
  body: JSON | null;
  is_api_active: boolean;
  created_at: string;
  updated_at: string;
}
