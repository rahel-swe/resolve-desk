using ResolveDesk.Application.Dtos;
using ResolveDesk.Domain.Entities;

namespace ResolveDesk.Application.Services;

public interface IAuthService
{

    Task<TokenResponseDto?> LoginAsync(LoginDto request);

    string GenerateAccessToken(User user);

    Task<TokenResponseDto?> RefreshTokenAsync(RefreshTokenRequestDto request);

    Task<bool> LogoutAsync(RefreshTokenRequestDto request);
}
