using ResolveDesk.Application.Tickets;
using ResolveDesk.Rules;
using ResolveDesk.Application.Services;

namespace ResolveDesk.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ITicketService, TicketService>();
        services.AddScoped<ITicketCommentService, TicketCommentService>();
        services.AddScoped<ITicketAIService, TicketAIService>();
        services.AddScoped<IKnowledgeArticleService, KnowledgeArticleService>();
        services.AddScoped<TicketRules>();
        services.AddScoped<AssignTicketHandler>();

        return services;

    }
}
