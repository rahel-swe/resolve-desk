using SupportPilotAI.Models;

namespace SupportPilotAI.Repositories;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);

    Task CreateUser(User user);

    Task<int> GetAllUsersCount();
}
