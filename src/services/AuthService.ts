// src/services/AuthService.ts
import {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  LogoutResponse,
  ApiResponse,
  AtlasClientConfig,
} from "../types";
import { MemoryCache } from "../core/cache";
import { HttpClient } from "../core/http";
import { AtlasError, AtlasValidationError } from "../errors";

export class AuthService {
  constructor(
    private config: AtlasClientConfig,
    private cache: MemoryCache,
    private http: HttpClient,
  ) {}

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    if (!credentials.email) {
      throw new AtlasValidationError("Email is required");
    }

    if (!credentials.password) {
      throw new AtlasValidationError("Password is required");
    }

    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/auth/login`,
        credentials,
      );

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Register a new user
   */
  async register(
    credentials: RegisterCredentials,
  ): Promise<ApiResponse<AuthResponse>> {
    if (!credentials.email) {
      throw new AtlasValidationError("Email is required");
    }

    if (!credentials.password) {
      throw new AtlasValidationError("Password is required");
    }

    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/auth/register`,
        credentials,
      );

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<ApiResponse<LogoutResponse>> {
    try {
      const response = await this.http.post(
        `${this.config.apiUrl}/auth/logout`,
      );

      // Clear all caches on logout
      this.cache.clear();

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): AtlasError {
    if (error instanceof AtlasError) {
      return error;
    }

    return new AtlasError(
      error.message || "An unknown error occurred",
      "UNKNOWN_ERROR",
    );
  }
}

