namespace ResolveDesk.Application.Dtos;

public class AuthMeResponseDto
{
    public int UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}
