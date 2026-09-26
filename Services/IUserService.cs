using ResolveDesk.Dtos;
using ResolveDesk.Models;

namespace ResolveDesk.Services;

public interface IUserService
{
    public Task<TokenResponseDto> RegisterUserAsync(RegisterDto request);
}
