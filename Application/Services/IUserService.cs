using ResolveDesk.Dtos;
using ResolveDesk.Entities;

namespace ResolveDesk.Services;

public interface IUserService
{
    public Task<TokenResponseDto> RegisterUserAsync(RegisterDto request);
}
