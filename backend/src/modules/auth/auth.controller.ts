import { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { created, ok, noContent } from "../../utils/apiResponse";
import { ApiError } from "../../utils/ApiError";
import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
  passwordResetRequestSchema,
  passwordResetConfirmSchema,
  changePasswordSchema,
} from "../../validators/auth";

export class AuthController {
  login = asyncHandler(async (req: Request, res: Response) => {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);

    // Set refresh token in HTTP-only cookie
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Remove refreshToken from response
    const { refreshToken: _, ...rest } = result;

    created(res, rest, "Login successful");
  });

  register = asyncHandler(async (req: Request, res: Response) => {
    const input = registerSchema.parse(req.body);
    const result = await authService.register(input);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { refreshToken: _, ...rest } = result;

    created(res, rest, "Registration successful");
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    // Get refresh token from httpOnly cookie
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw ApiError.unauthorized("Refresh token is required");
    }

    const tokens = await authService.refresh(refreshToken);

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    ok(res, { accessToken: tokens.accessToken }, "Token refreshed");
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    if (req.user) {
      await authService.logout(req.user.userId);
    }

    res.clearCookie("refreshToken");
    noContent(res);
  });

  me = asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.getMe(req.user!.userId);
    ok(res, user);
  });

  requestPasswordReset = asyncHandler(async (req: Request, res: Response) => {
    const { email } = passwordResetRequestSchema.parse(req.body);
    await authService.requestPasswordReset(email);
    ok(res, null, "If the email exists, a reset link has been sent");
  });

  confirmPasswordReset = asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = passwordResetConfirmSchema.parse(req.body);
    await authService.confirmPasswordReset(token, password);
    ok(res, null, "Password reset successful");
  });

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = changePasswordSchema.parse(
      req.body,
    );
    await authService.changePassword(
      req.user!.userId,
      currentPassword,
      newPassword,
    );
    ok(res, null, "Password changed successfully");
  });
}

export const authController = new AuthController();
