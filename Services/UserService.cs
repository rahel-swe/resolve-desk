
using InsightDesk.Common;
using InsightDesk.Dtos;
using InsightDesk.Models;
using InsightDesk.Repositories;

namespace InsightDesk.Services;

public class UserService(IUserRepository userRepository, IAuthService authService) : IUserService
{

    private readonly IUserRepository _userRepository = userRepository;
    private readonly IAuthService _authService = authService;

    public async Task<TokenResponseDto> RegisterUserAsync(RegisterDto request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);

        if (user is not null)
            throw new ConflictException($"User with this email: {request.Email} already exist.");


        user = new User
        {
            FullName = request.FullName,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
        };

        await _userRepository.CreateUser(user);


        var token = _authService.GenerateAccessToken(user);

        return new TokenResponseDto
        {
            Token = token,
            Email = user.Email,
            Role = user.Role ?? "User"
        };
    }
}
