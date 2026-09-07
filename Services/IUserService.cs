using ContosoPizza.Dtos;

namespace ContosoPizza.Services;

public interface IUserService
{
    public Task<TokenResponseDto> RegisterUserAsync(RegisterDto request);


}
