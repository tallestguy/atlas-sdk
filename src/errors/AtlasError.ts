export class AtlasError extends Error {
  public code?: string;
  public statusCode?: number;
  public details?: any;

  constructor(
    message: string,
    code?: string,
    statusCode?: number,
    details?: any,
  ) {
    super(message);
    this.name = "AtlasError";
    this.code = code ?? "UNKNOWN_ERROR";
    this.statusCode = statusCode ?? 500;
    this.details = details;
  }
}

export class AtlasNetworkError extends AtlasError {
  constructor(message: string, details?: any) {
    super(message, "NETWORK_ERROR", 500, details);
    this.name = "AtlasNetworkError";
  }
}

export class AtlasValidationError extends AtlasError {
  constructor(message: string, details?: any) {
    super(message, "VALIDATION_ERROR", 400, details);
    this.name = "AtlasValidationError";
  }
}
