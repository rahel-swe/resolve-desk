using ResolveDesk.Dtos;
using ResolveDesk.Entities;

namespace ResolveDesk.Services;

public interface IAuthService
{

    Task<TokenResponseDto?> LoginAsync(LoginDto request);

    string GenerateAccessToken(User user);

    Task<TokenResponseDto?> RefreshTokenAsync(RefreshTokenRequestDto request);

    Task<bool> LogoutAsync(RefreshTokenRequestDto request);
}
