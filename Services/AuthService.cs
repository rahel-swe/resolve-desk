using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using ResolveDesk.Common;
using ResolveDesk.Dtos;
using ResolveDesk.Models;
using ResolveDesk.Repositories;

namespace ResolveDesk.Services;

public class AuthService(
    IUserRepository userRepository,
    IRefreshTokenRepository refreshTokenRepository,
    IConfiguration configuration) : IAuthService
{
    private readonly IUserRepository _userRepository = userRepository;
    private readonly IConfiguration _configuration = configuration;
    private readonly IRefreshTokenRepository _refreshTokenRepository = refreshTokenRepository;

    private static string GenerateRefreshToken()
    {
        var randomBytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(randomBytes);
    }

    private static string HashRefreshToken(string refreshToken)
    {
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(refreshToken));
        return Convert.ToBase64String(hash);
    }

    public async Task<TokenResponseDto?> LoginAsync(LoginDto request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);

        if (user is null)
            throw new NotFoundException($"Not found user with this email: {request.Email}");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new NotFoundException($"Email or password is wrong, please try again.");

        var accessToken = GenerateAccessToken(user);
        var refreshToken = GenerateRefreshToken();

        var refreshTokenEntity = new RefreshToken
        {
            TokenHash = HashRefreshToken(refreshToken),
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            UserId = user.Id
        };

        await _refreshTokenRepository.AddAsync(refreshTokenEntity);

        return new TokenResponseDto
        {
            Token = accessToken,
            RefreshToken = refreshToken,
            Email = user.Email,
            Role = user.Role
        };
    }

    public async Task<TokenResponseDto?> RefreshTokenAsync(RefreshTokenRequestDto request)
    {
        var tokenHash = HashRefreshToken(request.RefreshToken);
        var storedToken = await _refreshTokenRepository.GetByHashAsync(tokenHash);

        if (storedToken is null)
            return null;

        if (storedToken.RevokedAt is not null)
        {
            await _refreshTokenRepository.RevokeAllForUserAsync(storedToken.UserId);
            return null;
        }

        if (storedToken.ExpiresAt <= DateTime.UtcNow)
            return null;

        var user = storedToken.User;

        await _refreshTokenRepository.RevokeAsync(storedToken);

        var newAccessToken = GenerateAccessToken(user);
        var newRefreshToken = GenerateRefreshToken();

        var newRefreshTokenEntity = new RefreshToken
        {
            TokenHash = HashRefreshToken(newRefreshToken),
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            UserId = user.Id
        };

        await _refreshTokenRepository.AddAsync(newRefreshTokenEntity);

        return new TokenResponseDto
        {
            Token = newAccessToken,
            RefreshToken = newRefreshToken,
            Email = user.Email,
            Role = user.Role
        };
    }

    public async Task<bool> LogoutAsync(RefreshTokenRequestDto request)
    {
        var tokenHash = HashRefreshToken(request.RefreshToken);
        var storedToken = await _refreshTokenRepository.GetByHashAsync(tokenHash);

        if (storedToken is null || storedToken.RevokedAt != null)
            return false;

        await _refreshTokenRepository.RevokeAsync(storedToken);
        return true;
    }

    public string GenerateAccessToken(User user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(10),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}