using ResolveDesk.Models;

namespace ResolveDesk.Repositories;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);

    Task CreateUser(User user);

}
