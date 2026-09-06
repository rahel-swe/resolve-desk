using ContosoPizza.Dtos;
using ContosoPizza.Models;

namespace ContosoPizza.Services;

public interface IAuthService
{
    Task<TokenResponseDto?> LoginAsync(LoginDto request);

}
