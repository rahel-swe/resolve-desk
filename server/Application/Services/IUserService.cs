using ResolveDesk.Api.Common;
using ResolveDesk.Application.Common;
using ResolveDesk.Application.Dtos;

namespace ResolveDesk.Application.Services;

public interface IUserService
{
    public Task<TokenResponseDto> RegisterUserAsync(RegisterDto request);
    public Task<ServiceResult<GetCurrentUserResponseDto>> GetCurrentUser(CurrentUser caller, CancellationToken cancellationToken);
}
