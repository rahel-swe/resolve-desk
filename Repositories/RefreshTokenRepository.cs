
using ContosoPizza.Data;
using ContosoPizza.Models;
using Microsoft.EntityFrameworkCore;

namespace ContosoPizza.Repositories;

public class RefreshTokenRepository(AppDbContext db) : IRefreshTokenRepository
{

    private readonly AppDbContext _db = db;

    public async Task AddAsync(RefreshToken refreshToken)
    {
        _db.RefreshTokens.Add(refreshToken);

        await _db.SaveChangesAsync();
    }

    public async Task<RefreshToken?> GetByHashAsync(string tokenHash)
    {
        return await _db.RefreshTokens
        .Include(refreshToken => refreshToken.User)
        .FirstOrDefaultAsync(refreshToken => refreshToken.TokenHash == tokenHash);
    }

    public async Task RevokeAsync(RefreshToken refreshToken)
    {
        refreshToken.RevokedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
    }
}
