using ResolveDesk.Infrastructure.Data;
using ResolveDesk.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ResolveDesk.Application.Abstractions;

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

    public async Task<User?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        return await _db.Users.FirstOrDefaultAsync(user => user.Id == id, cancellationToken);
    }
}
