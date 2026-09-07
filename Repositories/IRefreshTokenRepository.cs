using ContosoPizza.Models;

namespace ContosoPizza.Repositories;

public interface IRefreshTokenRepository
{
    Task AddAsync(RefreshToken refreshToken);

    Task<RefreshToken?> GetByHashAsync(string tokenHash);

    Task RevokeAsync(RefreshToken refreshToken);
}
