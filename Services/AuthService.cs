using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ContosoPizza.Common;
using ContosoPizza.Dtos;
using ContosoPizza.Models;
using ContosoPizza.Repositories;
using Microsoft.IdentityModel.Tokens;

namespace ContosoPizza.Services;

public class AuthService(IUserRepository userRepository, IConfiguration configuration) : IAuthService
{

    private readonly IUserRepository _userRepository = userRepository;
    private readonly IConfiguration _configuration = configuration;

    private async Task SeedAdmin()
    {
        var user = new User
        {
            Email = "example@gmail.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("rahel225"),
            Role = "Admin"
        };

        await _userRepository.CreateUser(user);
    }


    public async Task<TokenResponseDto?> LoginAsync(LoginDto request)
    {

        var user = await _userRepository.GetByEmailAsync(request.Email);

        var allUsersCount = await _userRepository.GetAllUsersCount();

        if (user is null && allUsersCount == 0)
        {
            await SeedAdmin();
            user = await _userRepository.GetByEmailAsync(request.Email);
        }

        if (user is null)
            return null;

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return null;

        var token = GenerateToken(user);

        return new TokenResponseDto
        {
            Token = token,
            Email = user.Email,
            Role = user.Role
        };
    }

    public string GenerateToken(User user)
    {
        var claims = new[]
        {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Email, user.Email),
        new Claim(ClaimTypes.Role, user.Role)
    };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));

        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(2),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }


}
