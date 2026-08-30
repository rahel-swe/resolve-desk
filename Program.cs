using ContosoPizza.Data;
using ContosoPizza.Repositories;
using ContosoPizza.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddScoped<IPizzaService, PizzaService>();
builder.Services.AddScoped<IOrderService, OrderService>();

builder.Services.AddScoped<IPizzaRepository, PizzaRepository>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
