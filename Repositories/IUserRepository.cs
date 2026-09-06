using ContosoPizza.Models;

namespace ContosoPizza.Repositories;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
}
