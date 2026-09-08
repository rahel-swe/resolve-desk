using InsightDesk.Models;

namespace InsightDesk.Repositories;

public interface IRefreshTokenRepository
{
    Task AddAsync(RefreshToken refreshToken);

    Task<RefreshToken?> GetByHashAsync(string tokenHash);

    Task RevokeAsync(RefreshToken refreshToken);

    Task RevokeAllForUserAsync(int userId);
}
