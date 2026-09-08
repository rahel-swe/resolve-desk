using SupportPilotAI.Data;
using SupportPilotAI.Models;
using Microsoft.EntityFrameworkCore;

namespace SupportPilotAI.Repositories;

public class UserRepository(AppDbContext db) : IUserRepository
{
    private readonly AppDbContext _db = db;

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _db.Users.FirstOrDefaultAsync(user => user.Email == email);
    }

    public async Task CreateUser(User user)
    {
        _db.Users.Add(user);

        await _db.SaveChangesAsync();
    }

    public async Task<int> GetAllUsersCount()
    {
        return await _db.Users.CountAsync();
    }
}
