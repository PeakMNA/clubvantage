import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto';
import { Request } from 'express';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: AuthService;

    const mockAuthService = {
        login: jest.fn(),
    };

    const mockConfigService = {
        get: jest.fn((key: string) => {
            if (key === 'supabase.cookie.secure') return false;
            if (key === 'supabase.cookie.sameSite') return 'lax';
            if (key === 'supabase.cookie.domain') return 'localhost';
            return null;
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('login', () => {
        it('should call authService.login and return result', async () => {
            const loginDto: LoginDto = {
                email: 'test@example.com',
                password: 'password123',
            };

            const req = {
                ip: '127.0.0.1',
                socket: { remoteAddress: '127.0.0.1' },
                headers: { 'user-agent': 'Jest Test' },
            } as unknown as Request;

            const expectedResult = {
                accessToken: 'access-token',
                refreshToken: 'refresh-token',
                expiresIn: 3600,
                user: {
                    id: 'user-id',
                    email: 'test@example.com',
                    firstName: 'Test',
                    lastName: 'User',
                    role: 'ADMIN',
                    permissions: [],
                    club: undefined,
                },
            };

            mockAuthService.login.mockResolvedValue(expectedResult);

            const result = await controller.login(loginDto, req);

            expect(authService.login).toHaveBeenCalledWith(
                loginDto,
                '127.0.0.1',
                'Jest Test',
            );
            expect(result).toEqual(expectedResult);
        });
    });
});
