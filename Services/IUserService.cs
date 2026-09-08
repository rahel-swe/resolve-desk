using InsightDesk.Dtos;

namespace InsightDesk.Services;

public interface IUserService
{
    public Task<TokenResponseDto> RegisterUserAsync(RegisterDto request);


}
