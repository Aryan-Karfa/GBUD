import { APIResponse, APIErrorDetail } from '@gbud/types';
import { ApiError } from '../errors/api-error';

export async function parseResponse<T = unknown>(
  response: Response,
  requestIdHeader = 'x-request-id'
): Promise<T> {
  const requestId =
    response.headers.get(requestIdHeader) ||
    response.headers.get('x-request-id') ||
    response.headers.get('X-Request-ID') ||
    null;

  let bodyText = '';
  try {
    bodyText = await response.text();
  } catch {
    bodyText = '';
  }

  let parsedJson: unknown = null;
  if (bodyText && bodyText.trim() !== '') {
    try {
      parsedJson = JSON.parse(bodyText);
    } catch {
      parsedJson = null;
    }
  }

  // Handle non-2xx HTTP responses
  if (!response.ok) {
    let message = response.statusText || 'Request failed';
    let code = 'HTTP_ERROR';
    let details: APIErrorDetail[] | Record<string, unknown> | null = null;
    let timestamp = new Date().toISOString();

    if (parsedJson && typeof parsedJson === 'object') {
      const apiErrorPayload = parsedJson as Partial<APIResponse<unknown>> & {
        error?: { code?: string; details?: APIErrorDetail[] | Record<string, unknown> };
      };

      if (typeof apiErrorPayload.message === 'string') {
        message = apiErrorPayload.message;
      }
      if (apiErrorPayload.error?.code) {
        code = apiErrorPayload.error.code;
      }
      if (apiErrorPayload.error?.details) {
        details = apiErrorPayload.error.details;
      }
      if (typeof apiErrorPayload.timestamp === 'string') {
        timestamp = apiErrorPayload.timestamp;
      }
    }

    // Default code fallback based on HTTP status
    if (code === 'HTTP_ERROR') {
      if (response.status === 400) code = 'BAD_REQUEST';
      else if (response.status === 401) code = 'UNAUTHORIZED';
      else if (response.status === 403) code = 'FORBIDDEN';
      else if (response.status === 404) code = 'NOT_FOUND';
      else if (response.status === 409) code = 'CONFLICT';
      else if (response.status === 422) code = 'VALIDATION_ERROR';
      else if (response.status >= 500) code = 'INTERNAL_ERROR';
    }

    throw new ApiError({
      message,
      statusCode: response.status,
      code,
      details,
      requestId,
      timestamp,
    });
  }

  // If 204 No Content or empty body
  if (response.status === 204 || parsedJson === null) {
    return null as unknown as T;
  }

  // If standard GBUD APIResponse wrapper { success: true, data: T }
  if (
    parsedJson &&
    typeof parsedJson === 'object' &&
    'success' in parsedJson &&
    'data' in parsedJson
  ) {
    const apiResponse = parsedJson as APIResponse<T>;
    return apiResponse.data as T;
  }

  return parsedJson as T;
}
