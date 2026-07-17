import { describe, it, expect, vi } from "vitest";
import { AuthenticateUserUseCase } from "./authenticate-user.usecase";
import type { IUserRepository } from "@/entities/user/repo";
import type { User } from "@/entities/user/model/user.entity";
import { AuthenticationError } from "@/shared/lib/errors";
import { verifyPassword } from "@/shared/lib/password";

vi.mock("@/shared/lib/password", () => ({
  verifyPassword: vi.fn(),
}));

function createMockRepository(
  overrides: Partial<IUserRepository> = {},
): IUserRepository {
  return {
    findByEmail: vi.fn().mockResolvedValue(null),
    findById: vi.fn(),
    create: vi.fn(),
    updateProfile: vi.fn(),
    updatePassword: vi.fn(),
    emailExists: vi.fn(),
    ...overrides,
  };
}

const mockUser = {
  id: "user-1",
  email: "existe@example.com",
  hashedPassword: "hashed-real-password",
} as unknown as User;

describe("AuthenticateUserUseCase", () => {
  it("lanza AuthenticationError y ejecuta verifyPassword contra hash dummy cuando el email no existe", async () => {
    const repo = createMockRepository({
      findByEmail: vi.fn().mockResolvedValue(null),
    });
    const usecase = new AuthenticateUserUseCase(repo);
    vi.mocked(verifyPassword).mockResolvedValue(false);

    await expect(
      usecase.execute({
        email: "no-existe@example.com",
        password: "cualquiera",
      }),
    ).rejects.toThrow(AuthenticationError);

    expect(verifyPassword).toHaveBeenCalledTimes(1);
    const [, dummyHash] = vi.mocked(verifyPassword).mock.calls[0];
    expect(dummyHash).toMatch(/^\$2[aby]\$10\$/);
  });

  it("lanza AuthenticationError cuando el password es incorrecto", async () => {
    const repo = createMockRepository({
      findByEmail: vi.fn().mockResolvedValue(mockUser),
    });
    const usecase = new AuthenticateUserUseCase(repo);
    vi.mocked(verifyPassword).mockResolvedValue(false);

    await expect(
      usecase.execute({ email: mockUser.email, password: "incorrecta" }),
    ).rejects.toThrow(AuthenticationError);

    expect(verifyPassword).toHaveBeenCalledWith(
      "incorrecta",
      mockUser.hashedPassword,
    );
  });

  it("retorna el usuario cuando las credenciales son válidas", async () => {
    const repo = createMockRepository({
      findByEmail: vi.fn().mockResolvedValue(mockUser),
    });
    const usecase = new AuthenticateUserUseCase(repo);
    vi.mocked(verifyPassword).mockResolvedValue(true);

    const result = await usecase.execute({
      email: mockUser.email,
      password: "correcta",
    });

    expect(result).toBe(mockUser);
  });
});
