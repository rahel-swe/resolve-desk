using ResolveDesk.Domain.Entities;

namespace ResolveDesk.Application.Abstractions;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);

    Task CreateUser(User user);

    Task<User?> GetByIdAsync(int id, CancellationToken cancellationToken);

}
