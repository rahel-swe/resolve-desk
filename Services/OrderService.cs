using ContosoPizza.Common;
using ContosoPizza.Dtos;
using ContosoPizza.Enums;
using ContosoPizza.Models;
using ContosoPizza.Repositories;

namespace ContosoPizza.Services;

public class OrderService : IOrderService
{

    private readonly IOrderRepository _orderRepository;
    private readonly IPizzaService _pizzaService;
    private readonly ILogger<OrderService> _logger;

    public OrderService(IOrderRepository orderRepository, IPizzaService pizzaService, ILogger<OrderService> logger)
    {
        _orderRepository = orderRepository;
        _pizzaService = pizzaService;
        _logger = logger;
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

        _logger.LogInformation("Creating order for customer {CustomerName} with {Items.Count} items", request.CustomerName, request.Items.Count);


        var orderItems = new List<OrderItem>();

        foreach (var item in request.Items)
        {
            var pizza = await _pizzaService.Get(item.PizzaId);

            if (pizza is null)
            {

                _logger.LogWarning("Order creation failed because pizza id {PizzaId} does not exist.", item.PizzaId);

                return ServiceResult<Order>.BadRequest($"Pizza with id {item.PizzaId} does not exist.");
            }
            ;

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

        _logger.LogInformation("Order {OrderId} created successfully with total price {TotalPrice}.",
              order.Id,
              order.TotalPrice);

        return ServiceResult<Order>.Success(order);

    }


    public async Task<ServiceResult<Order>> UpdateStatus(int id, OrderStatus status)
    {

        var order = await _orderRepository.Get(id);

        if (order is null)
            return ServiceResult<Order>.NotFound($"Order with id {id} does not exist.");

        if (order.Status == OrderStatus.Cancelled)
            return ServiceResult<Order>.Conflict("Cancelled orders cannot be updated.");

        if (order.Status == OrderStatus.Delivered)
            return ServiceResult<Order>.Conflict("Delivered orders cannot be updated.");

        if (status == OrderStatus.Pending)
            return ServiceResult<Order>.Conflict("Order cannot move back to pending.");

        if (status == OrderStatus.Cancelled && order.Status != OrderStatus.Pending)
            return ServiceResult<Order>.Conflict("Only pending orders can be cancelled.");

        order.Status = status;

        await _orderRepository.Update(order);

        return ServiceResult<Order>.Success(order);
    }


}