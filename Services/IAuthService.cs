using ContosoPizza.Dtos;
using ContosoPizza.Models;

namespace ContosoPizza.Services;

public interface IAuthService
{
    Task<TokenResponseDto?> RegisterAsync(RegisterDto request);

    Task<TokenResponseDto?> LoginAsync(LoginDto request);
}
