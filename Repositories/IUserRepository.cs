using ContosoPizza.Models;

namespace ContosoPizza.Repositories;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);

    Task CreateUser(User user);

    Task<int> GetAllUsersCount();
}
