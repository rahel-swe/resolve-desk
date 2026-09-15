using ResolveDesk.Dtos;

namespace ResolveDesk.Services;

public interface IUserService
{
    public Task<TokenResponseDto> RegisterUserAsync(RegisterDto request);


}
