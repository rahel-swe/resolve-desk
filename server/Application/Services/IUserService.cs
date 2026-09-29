using ResolveDesk.Application.Dtos;

namespace ResolveDesk.Application.Services;

public interface IUserService
{
    public Task<TokenResponseDto> RegisterUserAsync(RegisterDto request);
}
