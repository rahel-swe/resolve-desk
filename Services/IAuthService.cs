using ContosoPizza.Dtos;

namespace ContosoPizza.Services;

public interface IAuthService
{
    Task<TokenResponseDto?> LoginAsync(LoginDto request);
}
