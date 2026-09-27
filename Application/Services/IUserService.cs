using ResolveDesk.Application.Dtos;
using ResolveDesk.Domain.Entities;

namespace ResolveDesk.Application.Services;

public interface IUserService
{
    public Task<TokenResponseDto> RegisterUserAsync(RegisterDto request);
}
