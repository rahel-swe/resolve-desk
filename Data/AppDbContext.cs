using SupportPilotAi.Models;
using Microsoft.EntityFrameworkCore;

namespace SupportPilotAi.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();

    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
}