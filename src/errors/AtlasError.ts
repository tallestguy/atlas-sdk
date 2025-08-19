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
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class AtlasNetworkError extends AtlasError {
  constructor(message: string, details?: any) {
    super(message, "NETWORK_ERROR", undefined, details);
    this.name = "AtlasNetworkError";
  }
}

export class AtlasValidationError extends AtlasError {
  constructor(message: string, details?: any) {
    super(message, "VALIDATION_ERROR", 400, details);
    this.name = "AtlasValidationError";
  }
}
