using SupportPilotAi.Dtos;

namespace SupportPilotAi.Services;

public interface IUserService
{
    public Task<TokenResponseDto> RegisterUserAsync(RegisterDto request);


}
