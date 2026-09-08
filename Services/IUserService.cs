using SupportPilotAI.Dtos;

namespace SupportPilotAI.Services;

public interface IUserService
{
    public Task<TokenResponseDto> RegisterUserAsync(RegisterDto request);


}
