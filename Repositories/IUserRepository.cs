using SupportPilotAi.Models;

namespace SupportPilotAi.Repositories;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);

    Task CreateUser(User user);

    Task<int> GetAllUsersCount();
}
