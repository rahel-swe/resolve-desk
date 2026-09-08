using SupportPilotAi.Dtos;
using SupportPilotAi.Models;

namespace SupportPilotAi.Services;

public interface IAuthService
{

    Task<TokenResponseDto?> LoginAsync(LoginDto request);

    string GenerateAccessToken(User user);

    Task<TokenResponseDto?> RefreshTokenAsync(RefreshTokenRequestDto request);

    Task<bool> LogoutAsync(RefreshTokenRequestDto request);
}
