
using Microsoft.EntityFrameworkCore;
using ResolveDesk.Infrastructure.Data;
using ResolveDesk.Infrastructure.Repositories;

namespace ResolveDesk.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        services.AddScoped<ITicketRepository, TicketRepository>();
        services.AddScoped<ITicketCommentRepository, TicketCommentRepository>();
        services.AddScoped<IKnowledgeArticleRepository, KnowledgeArticleRepository>();

        return services;

    }
}