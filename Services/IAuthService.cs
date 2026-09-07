using ContosoPizza.Dtos;
using ContosoPizza.Models;

namespace ContosoPizza.Services;

public interface IAuthService
{

    Task<TokenResponseDto?> LoginAsync(LoginDto request);

    string GenerateAccessToken(User user);

    Task<TokenResponseDto?> RefreshTokenAsync(RefreshTokenRequestDto request);
}
