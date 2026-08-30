using ContosoPizza.Common;
using ContosoPizza.Dtos;
using ContosoPizza.Models;
using ContosoPizza.Repositories;
using Microsoft.AspNetCore.Http.HttpResults;

namespace ContosoPizza.Services;

public class OrderService : IOrderService
{

    private readonly IOrderRepository _orderRepository;
    private readonly IPizzaService _pizzaService;

    public OrderService(IOrderRepository orderRepository, IPizzaService pizzaService)
    {
        _orderRepository = orderRepository;
        _pizzaService = pizzaService;
    }


    public async Task<List<Order>> GetAll() => await _orderRepository.GetAll();


    public async Task<Order?> Get(int id) => await _orderRepository.Get(id);


    public async Task Add(Order order)
    {

        order.CreatedAt = DateTime.UtcNow;

        await _orderRepository.Add(order);
    }

    public async Task<ServiceResult<Order>> Create(CreateOrderDto request)
    {

        var orderItems = new List<OrderItem>();

        foreach (var item in request.Items)
        {
            var pizza = await _pizzaService.Get(item.PizzaId);

            if (pizza is null) return ServiceResult<Order>.Failure($"Pizza with id {item.PizzaId} does not exist."); ;

            orderItems.Add(new OrderItem
            {
                PizzaId = pizza.Id,
                Quantity = item.Quantity,
                UnitPrice = pizza.Price
            });
        }

        var order = new Order
        {
            CustomerName = request.CustomerName,
            Items = orderItems,
            TotalPrice = orderItems.Sum(item => item.UnitPrice * item.Quantity),
            CreatedAt = DateTime.UtcNow
        };

        await _orderRepository.Add(order);

        return ServiceResult<Order>.Success(order);

    }


}