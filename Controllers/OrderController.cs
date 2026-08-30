

using ContosoPizza.Dtos;
using ContosoPizza.Models;
using ContosoPizza.Services;
using Microsoft.AspNetCore.Mvc;

namespace ContosoPizza.Controllers;

[ApiController]
[Route("[controller]")]
public class OrderController : ControllerBase
{

    private readonly IOrderService _orderService;
    private readonly IPizzaService _pizzaService;


    public OrderController(IOrderService orderService, IPizzaService pizzaService)
    {
        _orderService = orderService;
        _pizzaService = pizzaService;
    }

    [HttpGet]
    public async Task<ActionResult<List<Order>>> GetAll()
    {
        return await _orderService.GetAll();
    }


    [HttpGet("{id}")]
    public async Task<ActionResult<Order>> Get(int id)
    {
        var order = await _orderService.Get(id);

        if (order is null)
            return NotFound();

        return order;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateOrderDto request)
    {

        if (request is null)
            return BadRequest();

        var orderItems = new List<OrderItem>();

        foreach (var item in request.Items)
        {
            var pizza = await _pizzaService.Get(item.PizzaId);
            if (pizza is null)
                return BadRequest($"Pizza with id {item.PizzaId} does not exist.");

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
            TotalPrice = orderItems.Sum(item => item.UnitPrice * item.Quantity)
        };

        await _orderService.Add(order);

        return CreatedAtAction(nameof(Get), new { id = order.Id }, order);
    }
}