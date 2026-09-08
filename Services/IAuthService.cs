using InsightDesk.Dtos;
using InsightDesk.Models;

namespace InsightDesk.Services;

public interface IAuthService
{

    Task<TokenResponseDto?> LoginAsync(LoginDto request);

    string GenerateAccessToken(User user);

    Task<TokenResponseDto?> RefreshTokenAsync(RefreshTokenRequestDto request);

    Task<bool> LogoutAsync(RefreshTokenRequestDto request);
}
